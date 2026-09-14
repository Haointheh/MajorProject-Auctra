from datetime import datetime, timedelta

from model import Auction, Bid, Notification


def send_ending_soon_notifications(db):
    """
    Situation 4: an auction is within 1 hour of its end_time and hasn't
    been notified yet. Notify every bidder plus the seller, then mark
    the auction so we don't repeat this every 30 seconds.

    Returns the list of Notification objects created (not yet committed),
    so the caller can push them over the websocket after committing.
    """
    notifications_created = []

    threshold = datetime.now() + timedelta(minutes=30)

    ending_soon_auctions = (
        db.query(Auction)
        .filter(
            Auction.end_time > datetime.now(),
            Auction.end_time <= threshold,
            Auction.ending_soon_notified == False,
        )
        .all()
    )

    for auction in ending_soon_auctions:
        bidder_rows = (
            db.query(Bid.bidder_id)
            .filter(Bid.auction_id == auction.id)
            .distinct()
            .all()
        )
        bidder_ids = [row[0] for row in bidder_rows]

        for bidder_id in bidder_ids:
            notification = Notification(
                user_id=bidder_id,
                message=f"Auction #{auction.id} is ending soon.",
                notification_type="ending_soon",
                related_auction_id=auction.id,
            )
            db.add(notification)
            notifications_created.append(notification)

        seller_notification = Notification(
            user_id=auction.seller_id,
            message=f"Your auction #{auction.id} is ending soon.",
            notification_type="ending_soon",
            related_auction_id=auction.id,
        )
        db.add(seller_notification)
        notifications_created.append(seller_notification)

        auction.ending_soon_notified = True

    return notifications_created