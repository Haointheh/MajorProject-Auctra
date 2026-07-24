from datetime import datetime
from model import Auction, Bid, Collateral, CollateralStatusEnum


def complete_purchase(auction: Auction, payment_method: str, transaction_reference: str, db):
    if not auction.is_resolved:
        raise ValueError("Auction not yet resolved")

    if auction.payment_completed:
        raise ValueError("Payment already completed for this auction")

    if auction.is_cascaded:
        # --- Cascaded case: second-highest bidder, no collateral involved ---
        second_bid = (
            db.query(Bid)
            .filter(Bid.auction_id == auction.id)
            .order_by(Bid.amount.desc())
            .offset(1)
            .first()
        )

        if not second_bid:
            raise ValueError("No cascaded bidder found for this auction")

        auction.payment_completed = True
        auction.payment_completed_at = datetime.now()
        auction.payment_method = payment_method
        auction.transaction_reference = transaction_reference

        return {
            "auction_id": auction.id,
            "winning_bid_amount": second_bid.amount,
            "collateral_amount": 0,
            "amount_paid": second_bid.amount,
            "payment_completed_at": auction.payment_completed_at,
        }

    else:
        # --- Original case: highest bidder, collateral counts toward price ---
        winning_bid = (
            db.query(Bid)
            .filter(Bid.auction_id == auction.id)
            .order_by(Bid.amount.desc())
            .first()
        )

        if not winning_bid:
            raise ValueError("No winning bid for this auction")

        collateral = (
            db.query(Collateral)
            .filter(
                Collateral.auction_id == auction.id,
                Collateral.bidder_id == winning_bid.bidder_id,
            )
            .first()
        )

        if not collateral or collateral.status != CollateralStatusEnum.held_for_payment:
            current_status = collateral.status if collateral else "no collateral found"
            raise ValueError(f"Collateral not in held_for_payment state (currently: {current_status})")

        collateral.status = CollateralStatusEnum.applied_to_purchase
        auction.payment_completed = True
        auction.payment_completed_at = datetime.now()
        auction.payment_method = payment_method
        auction.transaction_reference = transaction_reference

        amount_paid = winning_bid.amount - collateral.amount

        return {
            "auction_id": auction.id,
            "winning_bid_amount": winning_bid.amount,
            "collateral_amount": collateral.amount,
            "amount_paid": amount_paid,
            "payment_completed_at": auction.payment_completed_at,
        }