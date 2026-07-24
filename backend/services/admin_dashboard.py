def get_admin_dashboard_data(db):
    from model import Auction, Bid, User, Collateral
    from services.auction_status import compute_status
    from schemas.dashboard_schemas import BidHistoryEntry, AdminAuctionSummary, AdminDashboardResponse
    from services.seller_dashboard import compute_payment_status

    auctions = db.query(Auction).all()

    all_auctions = []

    for auction in auctions:
        status = compute_status(auction)

        seller = db.query(User).filter(User.id == auction.seller_id).first()

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

        all_auctions.append(
            AdminAuctionSummary(
                id=auction.id,
                title=auction.title,
                category=auction.category,
                base_price=auction.base_price,
                start_time=auction.start_time,
                end_time=auction.end_time,
                status=status,
                is_resolved=auction.is_resolved,
                is_cascaded=auction.is_cascaded,
                seller_id=auction.seller_id,
                seller_name=seller.name if seller else "Unknown",
                highest_bidder_id=highest_bidder_id,
                highest_bidder_name=highest_bidder_name,
                highest_bid_amount=highest_bid_amount,
                bid_history=bid_history,
                payment_status=payment_status,
            )
        )

    return AdminDashboardResponse(all_auctions=all_auctions)