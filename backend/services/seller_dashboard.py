from datetime import datetime


def compute_payment_status(auction, collateral) -> str:
    if not auction.is_resolved:
        return "not yet resolved"

    if collateral is None:
        return "no bids"

    if not auction.is_cascaded:
        if auction.payment_completed:
            return "paid"
        return "awaiting payment"

    # is_cascaded == True from here on
    if auction.payment_completed:
        return "paid"

    if auction.payment_due_at is not None and datetime.now() > auction.payment_due_at:
        return "sale failed"

    return "payment overdue — cascaded to next bidder"

def get_seller_dashboard_data(seller_id: int, db):
    from model import Auction, Bid, User, Collateral
    from services.auction_status import compute_status
    from schemas.dashboard_schemas import BidHistoryEntry, SellerAuctionSummary, SellerDashboardResponse

    auctions = db.query(Auction).filter(Auction.seller_id == seller_id).all()

    current, future, past = [], [], []

    for auction in auctions:
        status = compute_status(auction)

        bids = (
            db.query(Bid, User)
            .join(User, Bid.bidder_id == User.id)
            .filter(Bid.auction_id == auction.id)
            .order_by(Bid.amount.desc())
            .all()
        )

        bid_history = [
            BidHistoryEntry(
                bidder_id=user.id,
                bidder_name=user.name,
                amount=bid.amount,
                created_at=bid.created_at,
            )
            for bid, user in bids
        ]

        if bid_history:
            highest_bidder_id = bid_history[0].bidder_id
            highest_bidder_name = bid_history[0].bidder_name
            highest_bid_amount = bid_history[0].amount
        else:
            highest_bidder_id = None
            highest_bidder_name = None
            highest_bid_amount = None

        collateral = None
        if highest_bidder_id is not None:
            collateral = (
                db.query(Collateral)
                .filter(
                    Collateral.auction_id == auction.id,
                    Collateral.bidder_id == highest_bidder_id,
                )
                .first()
            )

        payment_status = compute_payment_status(auction, collateral)

        summary = SellerAuctionSummary(
            id=auction.id,
            title=auction.title,
            category=auction.category,
            base_price=auction.base_price,
            start_time=auction.start_time,
            end_time=auction.end_time,
            status=status,
            is_resolved=auction.is_resolved,
            is_cascaded=auction.is_cascaded,
            highest_bidder_id=highest_bidder_id,
            highest_bidder_name=highest_bidder_name,
            highest_bid_amount=highest_bid_amount,
            bid_history=bid_history,
            payment_status=payment_status,
        )

        if status == "live":
            current.append(summary)
        elif status == "scheduled":
            future.append(summary)
        else:
            past.append(summary)

    return SellerDashboardResponse(current=current, future=future, past=past)