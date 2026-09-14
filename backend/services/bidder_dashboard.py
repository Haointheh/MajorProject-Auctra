from datetime import datetime


def get_bidder_rankings(auction_id, db):
    from model import Bid
    from sqlalchemy import func

    rows = (
        db.query(Bid.bidder_id, func.max(Bid.amount).label("best_bid"))
        .filter(Bid.auction_id == auction_id)
        .group_by(Bid.bidder_id)
        .order_by(func.max(Bid.amount).desc())
        .all()
    )
    return rows


def compute_bidder_role_and_payment(auction, user_id, rankings, collateral):
    if not auction.is_resolved:
        return "pending", None

    highest_bidder_id = rankings[0][0] if rankings else None
    second_bidder_id = rankings[1][0] if len(rankings) > 1 else None

    if not auction.is_cascaded:
        if user_id == highest_bidder_id:
            if auction.payment_completed:
                return "won", "paid"
            if collateral is not None and collateral.payment_due_at is not None and datetime.now() > collateral.payment_due_at:
                return "won", "overdue"
            return "won", "awaiting payment"
        return "lost", None

    if user_id == highest_bidder_id:
        return "forfeited", None

    if user_id == second_bidder_id:
        if auction.payment_completed:
            return "cascade_winner", "paid"
        if auction.payment_due_at is not None and datetime.now() > auction.payment_due_at:
            return "cascade_winner", "overdue"
        return "cascade_winner", "awaiting payment"

    return "lost", None

def get_bidder_dashboard_data(user_id: int, db):
    from model import Auction, Bid, Collateral, Notification
    from services.auction_status import compute_status
    from schemas.dashboard_schemas import BidderAuctionSummary, NotificationEntry, BidderDashboardResponse
    from sqlalchemy import func

    auction_ids = (
        db.query(Bid.auction_id)
        .filter(Bid.bidder_id == user_id)
        .distinct()
        .all()
    )
    auction_ids = [row[0] for row in auction_ids]

    auctions = db.query(Auction).filter(Auction.id.in_(auction_ids)).all()

    my_bids = []
    for auction in auctions:
        status = compute_status(auction)

        my_highest_bid = (
            db.query(func.max(Bid.amount))
            .filter(Bid.auction_id == auction.id, Bid.bidder_id == user_id)
            .scalar()
        )

        rankings = get_bidder_rankings(auction.id, db)
        is_current_highest_bidder = bool(rankings) and rankings[0][0] == user_id

        collateral = (
            db.query(Collateral)
            .filter(Collateral.auction_id == auction.id, Collateral.bidder_id == user_id)
            .first()
        )

        role, payment_status = compute_bidder_role_and_payment(auction, user_id, rankings, collateral)

        my_bids.append(
            BidderAuctionSummary(
                id=auction.id,
                title=auction.title,
                category=auction.category,
                base_price=auction.base_price,
                end_time=auction.end_time,
                status=status,
                my_highest_bid=my_highest_bid,
                is_current_highest_bidder=is_current_highest_bidder,
                is_resolved=auction.is_resolved,
                is_cascaded=auction.is_cascaded,
                my_role_in_outcome=role,
                payment_status=payment_status,
            )
        )

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )

    notification_entries = [
        NotificationEntry(
            id=n.id,
            message=n.message,
            notification_type=n.notification_type,
            related_auction_id=n.related_auction_id,
            is_read=n.is_read,
            created_at=n.created_at,
        )
        for n in notifications
    ]

    return BidderDashboardResponse(my_bids=my_bids, notifications=notification_entries)