import logging
import uuid

from sqlalchemy.orm import Session
from model import Auction
from services.user_history import count_completed_auctions, compute_bidder_features
from services.risk_engine_loader import risk_engine
from Trust_Score_Engine import evaluate_auction_entry, calculate_base_collateral, XGB_WEIGHT, ISO_WEIGHT

# Production logging here is deliberately minimal — start/complete/error
# only. The full breakdown (every intermediate score) goes to ai_risk_logs
# instead (see services/ai_risk_audit.py), not the terminal.
logger = logging.getLogger(__name__)


def estimate_public_collateral(auction: Auction) -> int:
    """
    Flat, non-personalized collateral estimate shown on public auction
    listing/detail pages (no bidder is known yet at that point — that's
    what GET /auctions and GET /auctions/{id} are). This is the same
    base rate a brand-new bidder would pay (BASE_COLLATERAL_RATE, no
    risk multiplier). The real, personalized amount — factoring in the
    bidder's risk tier — is only computed once they actually try to
    deposit collateral, via calculate_collateral_amount() below.
    """
    return int(calculate_base_collateral(auction.base_price))


def calculate_collateral_amount(auction: Auction, bidder_id: int, db: Session) -> dict:
    """
    Runs the AI risk model to determine the required collateral for this
    bidder on this auction. Replaces the old flat-percentage placeholder.

    Returns a dict (not a plain int anymore):
      {
        "amount": int or None,      # None if bidder is blocked
        "entry_allowed": bool,
        "user_stage": "new" | "established",
        "risk_tier": str or None,
        "final_risk_score": float or None,
        "audit": {...},             # full breakdown — see save_ai_risk_log()
      }
    """
    logger.info(f"AI assessment started (bidder_id={bidder_id}, auction_id={auction.id})")

    try:
        completed_auctions = count_completed_auctions(bidder_id, db)

        features = None
        if completed_auctions > 0:
            features = compute_bidder_features(bidder_id, db)

        result = evaluate_auction_entry(
            engine=risk_engine,
            user_id=str(bidder_id),
            starting_price=auction.base_price,
            completed_auctions=completed_auctions,
            features=features,
        )
    except Exception:
        # This one's not optional — if the AI pipeline itself fails, we
        # can't determine collateral at all, so let it propagate (the route
        # turns it into a 500). Contrast with save_ai_risk_log(), where a
        # failure to *record* a result that was already computed shouldn't
        # block the user's actual deposit.
        logger.error(f"AI assessment FAILED (bidder_id={bidder_id}, auction_id={auction.id})", exc_info=True)
        raise

    logger.info(f"AI assessment completed (bidder_id={bidder_id}, auction_id={auction.id})")

    details = result["details"]
    collateral = result["collateral"]

    xgb_score = details.get("xgb_score")
    xgb_contribution = round(xgb_score * XGB_WEIGHT, 2) if xgb_score is not None else None

    iso_score = details.get("isolation_score_normalized")
    iso_contribution = round(iso_score * ISO_WEIGHT, 2) if iso_score is not None else None

    # The actual feature row fed to the models, for the audit explanation —
    # {} for "new" stage bidders, since no features are computed for them
    # (see first_auction_policy() in Trust_Score_Engine.py). Explicit
    # float() cast: pandas hands back numpy.float64 scalars here, which
    # aren't JSON-serializable as-is and would break the JSONB write below.
    feature_values = (
        {k: float(v) for k, v in features.iloc[0].to_dict().items()}
        if features is not None
        else {}
    )

    audit = {
        "xgb_raw_probability": details.get("xgb_probability"),
        "xgb_score": xgb_score,
        "xgb_weight": XGB_WEIGHT,
        "xgb_contribution": xgb_contribution,
        "iso_raw_score": details.get("isolation_score"),
        "iso_normalized_score": iso_score,
        "iso_weight": ISO_WEIGHT,
        "iso_contribution": iso_contribution,
        "ai_explanation": {
            "user_stage": result["user_stage"],
            "features": feature_values,
            "xgboost": {
                "probability": details.get("xgb_probability"),
                "score": xgb_score,
                "weight": XGB_WEIGHT,
                "contribution": xgb_contribution,
            },
            "isolation_forest": {
                "raw_score": details.get("isolation_score"),
                "normalized_score": iso_score,
                "weight": ISO_WEIGHT,
                "contribution": iso_contribution,
            },
            "final_score": result["risk_score"],
            "risk_tier": result["risk_tier"],
        },
    }

    return {
        "amount": int(collateral["required_collateral"]) if collateral else None,
        "entry_allowed": result["entry_allowed"],
        "user_stage": result["user_stage"],
        "risk_tier": result["risk_tier"],
        "final_risk_score": result["risk_score"],
        "audit": audit,
    }


def generate_transaction_reference():
    """
    Generates a fake transaction reference to simulate what a real payment
    gateway would return after a successful transaction. No real payment
    gateway exists yet — this is purely for demo realism.
    """
    return f"TXN-{uuid.uuid4().hex[:8].upper()}"