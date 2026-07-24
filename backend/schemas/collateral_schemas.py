from pydantic import BaseModel
from datetime import datetime
from model import CollateralStatusEnum


class CollateralResponse(BaseModel):
    id: int
    auction_id: int
    bidder_id: int
    amount: int
    status: CollateralStatusEnum
    created_at: datetime

    class Config:
        from_attributes = True