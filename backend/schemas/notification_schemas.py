from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    id: int
    message: str
    notification_type: str
    related_auction_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
