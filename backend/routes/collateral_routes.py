from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from model import User, Auction, Collateral, CollateralStatusEnum
from auth import require_kyc_approved_bidder
from services.auction_status import compute_status
from collateral_utils import calculate_collateral_amount
from schemas.collateral_schemas import CollateralResponse

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
    current_user: User = Depends(require_kyc_approved_bidder),
    db: Session = Depends(get_db),
):
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

    # Step 5: calculate amount (placeholder formula for now)
    amount = calculate_collateral_amount(auction)

    # Step 6: create the Collateral row
    new_collateral = Collateral(
        auction_id=auction_id,
        bidder_id=current_user.id,
        amount=amount,
        status=CollateralStatusEnum.locked
    )
    db.add(new_collateral)
    db.commit()
    db.refresh(new_collateral)

    # Step 7: return response
    return new_collateral