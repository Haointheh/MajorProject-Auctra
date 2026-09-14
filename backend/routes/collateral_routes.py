from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from model import User, Auction, Collateral, CollateralStatusEnum, RiskAssessment
from auth import require_kyc_approved_bidder
from services.auction_status import compute_status
from collateral_utils import calculate_collateral_amount, generate_transaction_reference
from services.ai_risk_audit import save_ai_risk_log
from schemas.collateral_schemas import CollateralResponse, CollateralCreate, CollateralPreviewResponse

router = APIRouter()


@router.get("/auctions/{auction_id}/collateral/me", response_model=CollateralResponse)
def get_my_collateral(
    auction_id: int,
    current_user: User = Depends(require_kyc_approved_bidder),
    db: Session = Depends(get_db),
):
    existing = db.query(Collateral).filter(
        Collateral.auction_id == auction_id,
        Collateral.bidder_id == current_user.id
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="No collateral deposited for this auction")
    return existing


@router.post("/auctions/{auction_id}/collateral", response_model=CollateralResponse)
def deposit_collateral(
    auction_id: int,
    payload: CollateralCreate,
    current_user: User = Depends(require_kyc_approved_bidder),
    db: Session = Depends(get_db),
):
    # Step 0.5: global block check
    if current_user.is_blocked:
        raise HTTPException(status_code=403, detail="Your account has been blocked from participating in auctions")

    # Step 1: fetch the auction
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    # Step 2: ownership check — seller can't lock collateral on own auction
    if auction.seller_id == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot deposit collateral on your own auction")

    # Step 3: status check — must be live
    if compute_status(auction) != "live":
        raise HTTPException(status_code=400, detail="Collateral can only be deposited while the auction is live")

    # Step 4: duplicate check — one collateral per bidder per auction
    existing = db.query(Collateral).filter(
        Collateral.auction_id == auction_id,
        Collateral.bidder_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already deposited collateral for this auction")

    # Step 5: run the AI risk model to determine entry eligibility + required collateral
    result = calculate_collateral_amount(auction, current_user.id, db)

    assessment = RiskAssessment(
        auction_id=auction_id,
        bidder_id=current_user.id,
        user_stage=result["user_stage"],
        risk_tier=result["risk_tier"],
        final_risk_score=(
            round(result["final_risk_score"])
            if result["final_risk_score"] is not None
            else None
        ),
        entry_allowed=result["entry_allowed"],
        collateral_amount=result["amount"],
    )
    db.add(assessment)
    db.commit()

    # Detailed audit trail (full XGBoost + Isolation Forest breakdown) —
    # separate table from RiskAssessment above, see model.py's AIRiskLog.
    # Best-effort: save_ai_risk_log() swallows its own failures, so a
    # logging bug here can never block this deposit from going through.
    save_ai_risk_log(
        db,
        user_id=current_user.id,
        username=current_user.name,
        auction_id=auction_id,
        risk_result=result,
    )

    if not result["entry_allowed"] or result["amount"] is None:
        raise HTTPException(
            status_code=403,
            detail="Entry not allowed: this account has been flagged as high risk by the fraud detection model.",
        )

    # Step 6: create the collateral record
    new_collateral = Collateral(
        auction_id=auction_id,
        bidder_id=current_user.id,
        amount=result["amount"],
        status=CollateralStatusEnum.locked,
        payment_method=payload.payment_method,
        transaction_reference=generate_transaction_reference(),
    )
    db.add(new_collateral)
    db.commit()
    db.refresh(new_collateral)

    return new_collateral