import logging

from sqlalchemy.orm import Session
from model import AIRiskLog

logger = logging.getLogger(__name__)

# Bump this string whenever the underlying XGBoost/Isolation Forest models
# get retrained/replaced (see ml-major/), so old rows in ai_risk_logs stay
# attributable to the model version that actually produced them. Neither
# final_model_metadata.json nor isolation_forest_metadata.json expose a
# clean single "version" field to pull this from automatically (XGBoost's
# metadata has a "trained_on" timestamp, Isolation Forest's doesn't have
# an equivalent at all), so this is a manually-maintained constant instead.
MODEL_VERSION = "xgboost_v1+isolation_forest_v1"


def save_ai_risk_log(
    db: Session,
    *,
    user_id: int,
    username: str,
    auction_id: int,
    risk_result: dict,
) -> AIRiskLog | None:
    """
    Persists the full breakdown of one AI risk assessment to ai_risk_logs.

    risk_result is exactly what calculate_collateral_amount() (see
    collateral_utils.py) returns — this function just reshapes its
    "audit" sub-dict into an AIRiskLog row.

    Deliberately isolated from the main collateral-deposit flow: the AI
    assessment itself has *already run and already produced a result* by
    the time this is called (see collateral_utils.py, which raises on a
    genuine AI pipeline failure) — this function only writes a record of
    that result. A failure here is a logging/audit problem, not a reason
    to fail the user's actual deposit, so it's caught and logged rather
    than re-raised. Returns None (instead of the created row) on failure,
    so callers can tell the two cases apart without needing a try/except
    of their own.
    """
    audit = risk_result.get("audit") or {}

    try:
        log_entry = AIRiskLog(
            user_id=user_id,
            username=username,
            auction_id=auction_id,
            user_stage=risk_result["user_stage"],
            xgb_raw_probability=audit.get("xgb_raw_probability"),
            xgb_score=audit.get("xgb_score"),
            xgb_weight=audit.get("xgb_weight"),
            xgb_contribution=audit.get("xgb_contribution"),
            iso_raw_score=audit.get("iso_raw_score"),
            iso_normalized_score=audit.get("iso_normalized_score"),
            iso_weight=audit.get("iso_weight"),
            iso_contribution=audit.get("iso_contribution"),
            final_risk_score=risk_result.get("final_risk_score"),
            risk_tier=risk_result.get("risk_tier"),
            required_collateral=risk_result.get("amount"),
            model_version=MODEL_VERSION,
            ai_explanation=audit.get("ai_explanation") or {},
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception:
        db.rollback()
        logger.error(
            f"Failed to write ai_risk_logs entry (user_id={user_id}, auction_id={auction_id})",
            exc_info=True,
        )
        return None


def get_ai_risk_logs(
    db: Session,
    *,
    user_id: int | None = None,
    auction_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AIRiskLog]:
    """
    Read side of the audit trail — powers view_ai_risk_logs.py, the
    terminal-only script (no HTTP endpoint — see that file). Most recent
    first; optionally narrowed to one user and/or one auction. limit is
    capped at 200 so a mistyped huge limit can't pull the whole table in
    one request.
    """
    query = db.query(AIRiskLog)

    if user_id is not None:
        query = query.filter(AIRiskLog.user_id == user_id)
    if auction_id is not None:
        query = query.filter(AIRiskLog.auction_id == auction_id)

    return (
        query.order_by(AIRiskLog.created_at.desc())
        .offset(offset)
        .limit(min(limit, 200))
        .all()
    )