from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from model import User, Auction, Bid
from auth import require_kyc_approved_bidder
from auction_status import compute_status
from bidding_schemas import BidCreate, BidResponse
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