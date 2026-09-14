#!/usr/bin/env python
# coding: utf-8

# In[2]:


import json
import logging
from typing import Optional

import joblib
import pandas as pd
import xgboost as xgb

logger = logging.getLogger(__name__)


XGB_WEIGHT = 0.60
ISO_WEIGHT = 0.40


CRITICAL_RISK_THRESHOLD = 80
HIGH_RISK_THRESHOLD = 60
MEDIUM_RISK_THRESHOLD = 40


BASE_COLLATERAL_RATE = 0.01

RISK_TIER_COLLATERAL_MULTIPLIERS = {
    "low": 1.0,
    "medium": 1.5,
    "high": 2.0,
    "critical": None,
}

BLOCKING_RISK_TIERS = {"critical"}


DEFAULT_ISO_SCORE_MIN = -0.5
DEFAULT_ISO_SCORE_MAX = 0.5


def get_risk_tier(risk_score: float) -> str:
    if risk_score >= CRITICAL_RISK_THRESHOLD:
        return "critical"
    elif risk_score >= HIGH_RISK_THRESHOLD:
        return "high"
    elif risk_score >= MEDIUM_RISK_THRESHOLD:
        return "medium"
    return "low"


class RiskScoreEngine:

    def __init__(
        self,
        xgb_model_path: str,
        xgb_metadata_path: str,
        iso_model_path: str,
        iso_scaler_path: str,
        iso_metadata_path: str,
    ) -> None:

        self.xgb_model = xgb.XGBClassifier()
        self.xgb_model.load_model(xgb_model_path)

        with open(xgb_metadata_path, "r") as f:
            xgb_metadata = json.load(f)

        self.feature_order = xgb_metadata["feature_order"]
        self.xgb_threshold = xgb_metadata["threshold"]

        self.iso_model = joblib.load(iso_model_path)
        self.iso_scaler = joblib.load(iso_scaler_path)

        with open(iso_metadata_path, "r") as f:
            iso_metadata = json.load(f)

        self.iso_threshold = iso_metadata["threshold"]

        self.iso_score_min = iso_metadata.get(
            "score_min",
            DEFAULT_ISO_SCORE_MIN
        )

        self.iso_score_max = iso_metadata.get(
            "score_max",
            DEFAULT_ISO_SCORE_MAX
        )


    def _normalize_isolation_score(
        self,
        raw_score: float
    ) -> float:

        if self.iso_score_max <= self.iso_score_min:
            return 0.0

        normalized = (
            (raw_score - self.iso_score_min)
            /
            (self.iso_score_max - self.iso_score_min)
        )

        return max(
            0.0,
            min(normalized * 100, 100.0)
        )


    def _validate_features(
        self,
        features: pd.DataFrame
    ) -> None:

        if len(features) != 1:
            raise ValueError(
                "score_risk() expects exactly one feature row"
            )

        missing = [
            col for col in self.feature_order
            if col not in features.columns
        ]

        if missing:
            raise ValueError(
                f"Missing features: {missing}"
            )


    def risk_fusion(
        self,
        xgb_probability: float,
        isolation_score: float
    ) -> dict:

        xgb_score = xgb_probability * 100

        iso_score = self._normalize_isolation_score(
            isolation_score
        )

        final_risk_score = (
            XGB_WEIGHT * xgb_score
            +
            ISO_WEIGHT * iso_score
        )

        return {
            "xgb_score": round(xgb_score, 2),
            "isolation_score": round(iso_score, 2),
            "final_risk_score": round(final_risk_score, 2),
            "risk_tier": get_risk_tier(final_risk_score),
        }


    def score_risk(
        self,
        features: pd.DataFrame
    ) -> dict:

        self._validate_features(features)

        X = features[self.feature_order]

        xgb_probability = float(
            self.xgb_model.predict_proba(X)[:, 1][0]
        )

        xgb_flag = (
            xgb_probability >= self.xgb_threshold
        )


        X_scaled = self.iso_scaler.transform(X)

        isolation_score = float(
            -self.iso_model.score_samples(X_scaled)[0]
        )

        iso_flag = (
            isolation_score >= self.iso_threshold
        )


        fusion = self.risk_fusion(
            xgb_probability,
            isolation_score
        )


        return {
            "user_stage": "established",
            "risk_tier": fusion["risk_tier"],
            "xgb_probability": round(xgb_probability, 4),
            "isolation_score": round(isolation_score, 4),
            "xgb_threshold": self.xgb_threshold,
            "iso_threshold": self.iso_threshold,
            "xgb_flag": bool(xgb_flag),
            "iso_flag": bool(iso_flag),
            "xgb_score": fusion["xgb_score"],
            "isolation_score_normalized": fusion["isolation_score"],
            "final_risk_score": fusion["final_risk_score"],
        }


# In[3]:


def first_auction_policy() -> dict:

    return {
        "user_stage": "new",
        "risk_tier": None,
        "final_risk_score": None,
        "xgb_probability": None,
        "isolation_score": None,
        "xgb_threshold": None,
        "iso_threshold": None,
        "xgb_flag": None,
        "iso_flag": None,
        "xgb_score": None,
        "isolation_score_normalized": None,
    }



def calculate_base_collateral(
    starting_price: float
) -> float:

    return starting_price * BASE_COLLATERAL_RATE



def recommend_collateral(
    user_stage: str,
    risk_tier: Optional[str],
    starting_price: float,
) -> Optional[dict]:


    if user_stage != "new" and risk_tier in BLOCKING_RISK_TIERS:
        return None


    base_collateral = calculate_base_collateral(
        starting_price
    )


    if user_stage == "new":
        multiplier = 1.0

    else:
        multiplier = RISK_TIER_COLLATERAL_MULTIPLIERS.get(
            risk_tier,
            1.0
        )


    required_collateral = (
        base_collateral * multiplier
    )


    return {
        "starting_price": round(starting_price, 2),
        "base_collateral": round(base_collateral, 2),
        "collateral_multiplier": multiplier,
        "required_collateral": round(
            required_collateral,
            2
        ),
    }



def evaluate_auction_entry(
    engine: RiskScoreEngine,
    user_id: str,
    starting_price: float,
    completed_auctions: int,
    features: Optional[pd.DataFrame] = None,
) -> dict:


    if completed_auctions == 0:

        score_result = first_auction_policy()


    else:

        if features is None:
            raise ValueError(
                "features are required for users with auction history"
            )

        score_result = engine.score_risk(
            features
        )


    user_stage = score_result["user_stage"]

    risk_tier = score_result["risk_tier"]


    collateral = recommend_collateral(
        user_stage,
        risk_tier,
        starting_price
    )


    entry_allowed = (
        risk_tier not in BLOCKING_RISK_TIERS
    )


    return {
        "user_id": user_id,
        "user_stage": user_stage,
        "risk_tier": risk_tier,
        "entry_allowed": entry_allowed,
        "risk_score": score_result.get(
            "final_risk_score"
        ),
        "collateral": collateral,
        "details": score_result,
    }


# In[ ]:




