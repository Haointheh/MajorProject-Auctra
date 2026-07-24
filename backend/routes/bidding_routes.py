from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from model import User, Auction, Bid, Collateral, CollateralStatusEnum
from auth import require_kyc_approved_bidder
from services.auction_status import compute_status
from schemas.bidding_schemas import BidCreate, BidResponse
from config import MIN_BID_INCREMENT

router = APIRouter()


@router.post("/auctions/{auction_id}/bids", response_model=BidResponse)
def place_bid(
    auction_id: int,
    payload: BidCreate,
    current_user: User = Depends(require_kyc_approved_bidder),
    db: Session = Depends(get_db),
):
    # Step 2: fetch the auction
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    # Step 3: ownership check — seller can't bid on own auction
    if auction.seller_id == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot bid on your own auction")

    # Step 3.5: collateral check — bidder must have locked collateral for this auction
    collateral = db.query(Collateral).filter(
        Collateral.auction_id == auction_id,
        Collateral.bidder_id == current_user.id,
        Collateral.status == CollateralStatusEnum.locked
    ).first()
    if not collateral:
        raise HTTPException(status_code=403, detail="You must deposit collateral before bidding on this auction")

    # Step 4: status check — must be live
    if compute_status(auction) != "live":
        raise HTTPException(status_code=400, detail="Bids can only be placed on live auctions")

    # Step 5: compute the floor (current highest bid, or base_price if none)
    current_highest = db.query(func.max(Bid.amount)).filter(Bid.auction_id == auction_id).scalar()
    floor = current_highest if current_highest is not None else auction.base_price

    # Step 6: increment check
    minimum_required = floor + MIN_BID_INCREMENT
    if payload.amount < minimum_required:
        raise HTTPException(
            status_code=400,
            detail=f"Bid too low. Minimum bid is {minimum_required}",
        )

    # Step 7: create the Bid row
    new_bid = Bid(
        auction_id=auction_id,
        bidder_id=current_user.id,
        amount=payload.amount,
    )
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)

    # Step 8: return response
    return new_bid


@router.get("/auctions/{auction_id}/bids", response_model=list[BidResponse])
def get_bid_history(
    auction_id: int,
    db: Session = Depends(get_db),
):
    # Check auction exists
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    # Fetch all bids for this auction, newest first
    bids = db.query(Bid).filter(Bid.auction_id == auction_id).order_by(Bid.created_at.desc()).all()

    return bids