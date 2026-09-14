from datetime import datetime, timedelta

from model import Auction, Bid, Collateral, CollateralStatusEnum, Notification

# How far ahead of the due date to warn the winner.
REMINDER_LEAD_TIME = timedelta(minutes=5)


def send_payment_reminders(db):
    """
    Situation 1: original winner's payment is due soon (within 5 minutes
    of the deadline), no reminder sent yet. Send a heads-up notification
    before they run out of time.

    Returns the list of Notification objects created (not yet committed),
    so the caller can push them over the websocket after committing.
    """
    notifications_created = []

    upcoming_due_collaterals = (
        db.query(Collateral)
        .join(Auction, Auction.id == Collateral.auction_id)
        .filter(
            Collateral.status == CollateralStatusEnum.held_for_payment,
            Auction.payment_due_at.isnot(None),
            Auction.payment_due_at <= datetime.now() + REMINDER_LEAD_TIME,
            Auction.reminder_sent_at.is_(None),
        )
        .all()
    )

    for collateral in upcoming_due_collaterals:
        auction = db.query(Auction).filter(Auction.id == collateral.auction_id).first()
        notification = Notification(
            user_id=collateral.bidder_id,
            message=f"Your payment for Auction #{collateral.auction_id} is due soon. Please complete payment before the deadline.",
            notification_type="payment_reminder",
            related_auction_id=collateral.auction_id,
        )
        db.add(notification)
        notifications_created.append(notification)
        auction.reminder_sent_at = datetime.now()

    return notifications_created


def cascade_overdue_payments(db):
    """
    Situation 2: original winner's payment deadline has passed.
    Forfeit their collateral, cascade to the second-highest bidder if one
    exists, otherwise fail the sale immediately.

    Returns the list of Notification objects created (not yet committed),
    so the caller can push them over the websocket after committing.
    """
    notifications_created = []

    cascade_cutoff_collaterals = (
        db.query(Collateral)
        .join(Auction, Auction.id == Collateral.auction_id)
        .filter(
            Collateral.status == CollateralStatusEnum.held_for_payment,
            Auction.payment_due_at.isnot(None),
            Auction.payment_due_at < datetime.now(),
        )
        .all()
    )

    for collateral in cascade_cutoff_collaterals:
        auction = db.query(Auction).filter(Auction.id == collateral.auction_id).first()

        # Step 1: forfeit the original winner's collateral
        collateral.status = CollateralStatusEnum.forfeited

        # Step 1.5: let them know why — previously silent, so the only way
        # a bidder found out their collateral was seized was by checking
        # their account manually. Applies regardless of whether there's a
        # second bidder to cascade to (their collateral is gone either way).
        forfeited_notification = Notification(
            user_id=collateral.bidder_id,
            message=(
                f"Your collateral for Auction #{auction.id} has been forfeited because "
                f"payment wasn't completed by the deadline."
            ),
            notification_type="collateral_forfeited",
            related_auction_id=auction.id,
        )
        db.add(forfeited_notification)
        notifications_created.append(forfeited_notification)

        # Step 2: find the second-highest bid for this auction
        second_bid = (
            db.query(Bid)
            .filter(Bid.auction_id == auction.id)
            .order_by(Bid.amount.desc())
            .offset(1)
            .first()
        )

        if second_bid:
            # Step 3: cascade to the second-highest bidder
            auction.is_cascaded = True
            auction.payment_due_at = datetime.now() + timedelta(days=3)
            auction.reminder_sent_at = None  # reset so they get their own reminder cycle later if needed

            cascade_offer_notification = Notification(
                user_id=second_bid.bidder_id,
                message=(
                    f"The original winner of Auction #{auction.id} did not complete payment. "
                    f"You are now eligible to purchase it for {second_bid.amount}, Thank youuuu"
                ),
                notification_type="cascade_offer",
                related_auction_id=auction.id,
            )
            db.add(cascade_offer_notification)
            notifications_created.append(cascade_offer_notification)

            seller_cascade_notification = Notification(
                user_id=auction.seller_id,
                message=f"The original winner of Auction #{auction.id} did not pay. The sale has cascaded to the next highest bidder.",
                notification_type="auction_cascaded",
                related_auction_id=auction.id,
            )
            db.add(seller_cascade_notification)
            notifications_created.append(seller_cascade_notification)
        else:
            # Step 4: no second bidder to cascade to — the sale fails now
            sale_failed_notification = Notification(
                user_id=auction.seller_id,
                message=f"Auction #{auction.id} failed to sell — the winner did not pay, and there was no other bidder.",
                notification_type="sale_failed",
                related_auction_id=auction.id,
            )
            db.add(sale_failed_notification)
            notifications_created.append(sale_failed_notification)

    return notifications_created


def fail_expired_cascades(db):
    """
    Situation 3: cascaded (2nd bidder) also failed to pay in time.
    Sale fails entirely — no further cascade.

    Returns the list of Notification objects created (not yet committed),
    so the caller can push them over the websocket after committing.
    """
    notifications_created = []

    expired_cascades = (
        db.query(Auction)
        .filter(
            Auction.is_cascaded == True,
            Auction.payment_completed == False,
            Auction.payment_due_at.isnot(None),
            Auction.payment_due_at < datetime.now(),
        )
        .all()
    )

    for auction in expired_cascades:
        # Sale has failed. Nothing further to forfeit — the second bidder
        # never had collateral held again in this design. We just leave
        # the auction as resolved-but-unpaid; no explicit "failed" status.
        notification = Notification(
            user_id=auction.seller_id,
            message=f"Auction #{auction.id} failed to sell — no payment was received from either bidder.",
            notification_type="sale_failed",
            related_auction_id=auction.id,
        )
        db.add(notification)
        notifications_created.append(notification)

    return notifications_created