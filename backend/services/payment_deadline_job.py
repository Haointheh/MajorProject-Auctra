from datetime import datetime, timedelta

from model import Auction, Bid, Collateral, CollateralStatusEnum, Notification


def send_payment_reminders(db):
    """
    Situation 1: original winner's payment is overdue (3+ days),
    no reminder sent yet. Send a reminder notification.
    """
    overdue_collaterals = (
        db.query(Collateral)
        .join(Auction, Auction.id == Collateral.auction_id)
        .filter(
            Collateral.status == CollateralStatusEnum.held_for_payment,
            Auction.payment_due_at.isnot(None),
            Auction.payment_due_at < datetime.now(),
            Auction.reminder_sent_at.is_(None),
        )
        .all()
    )

    for collateral in overdue_collaterals:
        auction = db.query(Auction).filter(Auction.id == collateral.auction_id).first()
        notification = Notification(
            user_id=collateral.bidder_id,
            message=f"Your payment for Auction #{collateral.auction_id} is overdue. Please complete payment soon.",
            notification_type="payment_reminder",
            related_auction_id=collateral.auction_id,
        )
        db.add(notification)
        auction.reminder_sent_at = datetime.now()

def cascade_overdue_payments(db):
    """
    Situation 2: original winner still hasn't paid, 1+ day after reminder.
    Forfeit their collateral, cascade to the second-highest bidder if one exists.
    """
    cascade_cutoff_collaterals = (
        db.query(Collateral)
        .join(Auction, Auction.id == Collateral.auction_id)
        .filter(
            Collateral.status == CollateralStatusEnum.held_for_payment,
            Auction.reminder_sent_at.isnot(None),
            Auction.reminder_sent_at < datetime.now() - timedelta(days=1),
        )
        .all()
    )
    # rest of the function stays exactly the same
    
def fail_expired_cascades(db):
    """
    Situation 3: cascaded (2nd bidder) also failed to pay in time.
    Sale fails entirely — no further cascade.
    """
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