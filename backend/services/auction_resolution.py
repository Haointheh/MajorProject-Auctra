from datetime import datetime, timedelta
from model import Bid, Collateral, CollateralStatusEnum, Notification, User


def resolve_auction(auction, db):
    """
    Resolves an ended auction: determines the winner (if any),
    updates collateral statuses accordingly, and marks the auction
    as resolved. Does not commit — caller is responsible for committing.

    Returns a list of Notification objects (not yet committed) to be
    pushed live once the caller commits. Empty list if no bids at all.
    """

    notifications_to_push = []

    # Step 1: find the highest bid for this auction, if any
    highest_bid = (
        db.query(Bid)
        .filter(Bid.auction_id == auction.id)
        .order_by(Bid.amount.desc())
        .first()
    )

    if highest_bid:
        winner_id = highest_bid.bidder_id

        # Step 2: winner's locked collateral -> held_for_payment
        winner_collateral = (
            db.query(Collateral)
            .filter(
                Collateral.auction_id == auction.id,
                Collateral.bidder_id == winner_id,
                Collateral.status == CollateralStatusEnum.locked,
            )
            .first()
        )
        if winner_collateral:
            winner_collateral.status = CollateralStatusEnum.held_for_payment
            auction.payment_due_at = datetime.now() + timedelta(minutes=10)

        # Step 3: everyone else's locked collateral -> released
        other_collaterals = (
            db.query(Collateral)
            .filter(
                Collateral.auction_id == auction.id,
                Collateral.bidder_id != winner_id,
                Collateral.status == CollateralStatusEnum.locked,
            )
            .all()
        )
        for collateral in other_collaterals:
            collateral.status = CollateralStatusEnum.released

            # Notify each losing bidder their collateral was released
            released_notification = Notification(
                user_id=collateral.bidder_id,
                message=f"Auction #{auction.id} has ended. You did not win, and your collateral has been released.",
                notification_type="collateral_released",
                related_auction_id=auction.id,
            )
            db.add(released_notification)
            notifications_to_push.append(released_notification)

        # Step 3.5: notify the seller with the winning bidder's info
        winner = db.query(User).filter(User.id == winner_id).first()
        seller_notification = Notification(
            user_id=auction.seller_id,
            message=f"Your auction #{auction.id} has ended. Winning bidder: {winner.name}, amount: {highest_bid.amount}.",
            notification_type="auction_ended",
            related_auction_id=auction.id,
        )
        db.add(seller_notification)
        notifications_to_push.append(seller_notification)

        # Step 3.6: notify the winner themselves, with a due date and next step
        due_date_str = auction.payment_due_at.strftime("%Y-%m-%d %H:%M") if auction.payment_due_at else "soon"
        winner_notification = Notification(
            user_id=winner_id,
            message=(
                f"Congratulations! You won Auction #{auction.id} with a bid of {highest_bid.amount}. "
                f"Please complete your payment by {due_date_str}. Thank youuuu."
            ),
            notification_type="winner",
            related_auction_id=auction.id,
        )
        db.add(winner_notification)
        notifications_to_push.append(winner_notification)

    # Step 4: mark resolved regardless of whether there was a winner
    auction.is_resolved = True

    return notifications_to_push