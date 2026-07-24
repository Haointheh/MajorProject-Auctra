from pydantic import BaseModel
from datetime import datetime


class BidHistoryEntry(BaseModel):
    bidder_id: int
    bidder_name: str
    amount: float
    created_at: datetime


class SellerAuctionSummary(BaseModel):
    id: int
    title: str
    category: str
    base_price: float
    start_time: datetime
    end_time: datetime
    status: str
    is_resolved: bool
    is_cascaded: bool
    highest_bidder_id: int | None
    highest_bidder_name: str | None
    highest_bid_amount: float | None
    bid_history: list[BidHistoryEntry]
    payment_status: str


class SellerDashboardResponse(BaseModel):
    current: list[SellerAuctionSummary]
    future: list[SellerAuctionSummary]
    past: list[SellerAuctionSummary]

class BidderAuctionSummary(BaseModel):
    id: int
    title: str
    category: str
    base_price: float
    end_time: datetime
    status: str
    my_highest_bid: float
    is_current_highest_bidder: bool
    is_resolved: bool
    is_cascaded: bool
    my_role_in_outcome: str
    payment_status: str | None

class NotificationEntry(BaseModel):
    id: int
    message: str
    notification_type: str
    related_auction_id: int | None
    is_read: bool
    created_at: datetime


class BidderDashboardResponse(BaseModel):
    my_bids: list[BidderAuctionSummary]
    notifications: list[NotificationEntry]

