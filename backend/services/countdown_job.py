from datetime import datetime
from model import Auction
from services.connection_manager import manager
from services.auction_status import compute_status


async def broadcast_countdowns(db):
    """
    For every auction currently being watched (has an active room in
    the connection manager), broadcast how many seconds remain until
    it ends, and separately broadcast if its status has just changed
    (e.g. scheduled -> live, live -> ended).
    """
    watched_auction_ids = list(manager.auction_rooms.keys())

    for auction_id in watched_auction_ids:
        auction = db.query(Auction).filter(Auction.id == auction_id).first()
        if auction is None:
            continue

        # Countdown broadcast (unchanged from before)
        remaining_seconds = (auction.end_time - datetime.now()).total_seconds()
        remaining_seconds = max(0, int(remaining_seconds))

        await manager.broadcast_to_room(auction_id, {
            "type": "countdown",
            "auction_id": auction_id,
            "remaining_seconds": remaining_seconds,
        })

        # Status transition check (new)
        current_status = compute_status(auction)
        previous_status = manager.last_known_status.get(auction_id)

        if current_status != previous_status:
            await manager.broadcast_to_room(auction_id, {
                "type": "status_changed",
                "auction_id": auction_id,
                "new_status": current_status,
            })
            manager.last_known_status[auction_id] = current_status