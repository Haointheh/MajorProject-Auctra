from datetime import datetime
from model import Auction


def compute_status(auction: Auction) -> str:
    if auction.status == "cancelled":
        return "cancelled"

    now = datetime.now()  # converts to laptop's time zone
    if now < auction.start_time:
        return "scheduled"
    elif auction.start_time <= now < auction.end_time:
        return "live"
    else:
        return "ended"