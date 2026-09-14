from sqlalchemy.orm import Session
from model import Collateral, CollateralStatusEnum


TERMINAL_COLLATERAL_STATUSES = (
    CollateralStatusEnum.released,
    CollateralStatusEnum.forfeited,
    CollateralStatusEnum.applied_to_purchase,
)


def count_completed_auctions(bidder_id: int, db: Session) -> int:
    """
    Number of auctions this bidder has fully participated in and finished
    (won, lost, or forfeited). Used to decide first-auction vs established
    for the risk engine.
    """
    return (
        db.query(Collateral)
        .filter(
            Collateral.bidder_id == bidder_id,
            Collateral.status.in_(TERMINAL_COLLATERAL_STATUSES),
        )
        .count()
    )

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func
from model import Bid, Auction, Collateral, CollateralStatusEnum


def _clip01(x: float) -> float:
    return max(0.0, min(1.0, x))


def compute_bidder_features(bidder_id: int, db: Session) -> pd.DataFrame:
    """
    Builds the 9 model feature columns from this bidder's PAST resolved
    auctions only (see caveat above — current auction has no bid history
    yet at collateral-deposit time). Returns a single-row DataFrame.
    """
    past_auction_ids = [
        c.auction_id
        for c in db.query(Collateral).filter(
            Collateral.bidder_id == bidder_id,
            Collateral.status.in_((
                CollateralStatusEnum.released,
                CollateralStatusEnum.forfeited,
                CollateralStatusEnum.applied_to_purchase,
            )),
        )
    ]

    if not past_auction_ids:
        # Shouldn't be reached if caller already checked completed_auctions == 0,
        # but guard anyway.
        return pd.DataFrame([{
            "Bidder_Tendency": 0.0, "Bidding_Ratio": 0.0,
            "Successive_Outbidding": 0.0, "Last_Bidding": 0.0,
            "Auction_Bids": 0.0, "Starting_Price_Average": 0.0,
            "Early_Bidding": 0.0, "Winning_Ratio": 0.0, "Auction_Duration": 0.0,
        }])

    bidding_ratios, last_biddings, early_biddings = [], [], []
    successive_flags, starting_price_ratios, auction_bid_counts, durations = [], [], [], []
    wins = 0

    for auction_id in past_auction_ids:
        auction = db.query(Auction).filter(Auction.id == auction_id).first()
        all_bids = (
            db.query(Bid)
            .filter(Bid.auction_id == auction_id)
            .order_by(Bid.created_at)
            .all()
        )
        if not auction or not all_bids:
            continue

        total_bids = len(all_bids)
        my_bids = [b for b in all_bids if b.bidder_id == bidder_id]
        if not my_bids:
            continue

        bidding_ratios.append(len(my_bids) / total_bids)
        auction_bid_counts.append(total_bids)

        duration_secs = (auction.end_time - auction.start_time).total_seconds()
        if duration_secs > 0:
            first_bid_pos = (my_bids[0].created_at - auction.start_time).total_seconds() / duration_secs
            last_bid_pos = (my_bids[-1].created_at - auction.start_time).total_seconds() / duration_secs
            early_biddings.append(_clip01(first_bid_pos))
            last_biddings.append(_clip01(last_bid_pos))

        durations.append(duration_secs / 86400)  # days

        avg_bid_price = sum(b.amount for b in all_bids) / total_bids
        if avg_bid_price > 0:
            starting_price_ratios.append(_clip01(auction.base_price / avg_bid_price))

        # successive outbidding: bidder appears 2+ times in a row at the
        # top of the bid order without another bidder in between
        successive = 0
        for i in range(1, len(all_bids)):
            if all_bids[i].bidder_id == bidder_id and all_bids[i - 1].bidder_id == bidder_id:
                successive = 1
                break
        successive_flags.append(successive)

        winning_bid = max(all_bids, key=lambda b: b.amount)
        if winning_bid.bidder_id == bidder_id:
            wins += 1

        # distinct sellers vs distinct auctions, for Bidder_Tendency
    distinct_auctions = len(past_auction_ids)
    seller_ids = {
        db.query(Auction).filter(Auction.id == aid).first().seller_id
        for aid in past_auction_ids
    }
    bidder_tendency = _clip01(1 - (len(seller_ids) / distinct_auctions)) if distinct_auctions else 0.0

    def avg(lst, cap=None):
        if not lst:
            return 0.0
        val = sum(lst) / len(lst)
        return _clip01(val / cap) if cap else _clip01(val)

    features = {
        "Bidder_Tendency": bidder_tendency,
        "Bidding_Ratio": avg(bidding_ratios),
        "Successive_Outbidding": avg(successive_flags),
        "Last_Bidding": avg(last_biddings),
        "Auction_Bids": avg(auction_bid_counts, cap=20),      # cap: 20+ bids = max activity
        "Starting_Price_Average": avg(starting_price_ratios),
        "Early_Bidding": avg(early_biddings),
        "Winning_Ratio": _clip01(wins / distinct_auctions) if distinct_auctions else 0.0,
        "Auction_Duration": avg(durations, cap=14),           # cap: 14+ days = max
    }

    return pd.DataFrame([features])