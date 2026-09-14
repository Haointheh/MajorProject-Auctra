from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from model import User, Auction, Bid, Collateral, CollateralStatusEnum, Notification, RiskAssessment
from auth import require_kyc_approved_bidder
from services.auction_status import compute_status
from services.connection_manager import manager
from schemas.bidding_schemas import BidCreate, BidResponse
from config import MIN_BID_INCREMENT

# ── TEST INSTRUMENTATION — remove this import once latency testing is done ──
from datetime import datetime
# ── END TEST INSTRUMENTATION ─────────────────────────────────────────────────

router = APIRouter()


@router.post("/auctions/{auction_id}/bids", response_model=BidResponse)
async def place_bid(
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

    # Step 5: fetch the previous highest bid (if any), to compute the floor
    # AND to know who to notify below.
    previous_highest_bid = (
        db.query(Bid)
        .filter(Bid.auction_id == auction_id)
        .order_by(Bid.amount.desc())
        .first()
    )
    current_highest = previous_highest_bid.amount if previous_highest_bid else None
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

    # Step 7.5: write notification(s) for this bid event
    notification_to_push = None

    if previous_highest_bid is None:
        # No prior bids — this is the auction's first bid. Notify the seller.
        notification_to_push = Notification(
            user_id=auction.seller_id,
            message=f"Your auction #{auction.id} just received its first bid.",
            notification_type="first_bid",
            related_auction_id=auction.id,
        )
        db.add(notification_to_push)
    elif previous_highest_bid.bidder_id != current_user.id:
        # Someone else held the highest bid — they've now been outbid.
        notification_to_push = Notification(
            user_id=previous_highest_bid.bidder_id,
            message=f"You've been outbid on auction #{auction.id}.",
            notification_type="outbid",
            related_auction_id=auction.id,
        )
        db.add(notification_to_push)
    # else: the same bidder raised their own highest bid — no one to notify.

    db.commit()
    db.refresh(new_bid)

    # Step 7.6: push the personal notification live, if one was created —
    # this is what NotificationBell/ToastContainer on the frontend are
    # actually listening for (see hooks/useNotificationSocket.js).
    if notification_to_push is not None:
        db.refresh(notification_to_push)
        await manager.send_to_user(notification_to_push.user_id, {
            "id": notification_to_push.id,
            "notification_type": notification_to_push.notification_type,
            "message": notification_to_push.message,
            "related_auction_id": notification_to_push.related_auction_id,
            "created_at": notification_to_push.created_at.isoformat(),
        })

    # Step 7.7: broadcast this bid to everyone watching the auction's room
    bidder_first_name = current_user.name.split(" ")[0]
    await manager.broadcast_to_room(auction_id, {
        "bidder_first_name": bidder_first_name,
        "amount": new_bid.amount,
        "minimum_next_bid": new_bid.amount + MIN_BID_INCREMENT,
        "auction_id": auction_id,
        "broadcast_at": datetime.utcnow().isoformat(),  # ← TEST INSTRUMENTATION — remove this line
    })

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

    # Attach each bidder's risk assessment for this auction (written once,
    # at collateral-deposit time — see collateral_routes.py's
    # deposit_collateral — not per bid). One query for every bidder
    # involved rather than a query per bid.
    bidder_ids = {b.bidder_id for b in bids}
    assessments = (
        db.query(RiskAssessment)
        .filter(
            RiskAssessment.auction_id == auction_id,
            RiskAssessment.bidder_id.in_(bidder_ids),
        )
        .all()
    )
    risk_by_bidder = {a.bidder_id: a for a in assessments}

    results = []
    for bid in bids:
        response = BidResponse.model_validate(bid)
        assessment = risk_by_bidder.get(bid.bidder_id)
        if assessment:
            response.risk_tier = assessment.risk_tier
            response.final_risk_score = assessment.final_risk_score
        results.append(response)

    return results