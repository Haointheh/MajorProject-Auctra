from datetime import datetime, timedelta
from model import Bid, Collateral, CollateralStatusEnum


def resolve_auction(auction, db):
    """
    Resolves an ended auction: determines the winner (if any),
    updates collateral statuses accordingly, and marks the auction
    as resolved. Does not commit — caller is responsible for committing.
    """

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
            winner_collateral.payment_due_at = datetime.now() + timedelta(days=3)

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

    # Step 4: mark resolved regardless of whether there was a winner
    auction.is_resolved = True