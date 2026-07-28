from pydantic import BaseModel
from datetime import datetime
from model import CollateralStatusEnum
from typing import Literal


class CollateralResponse(BaseModel):
    id: int
    auction_id: int
    bidder_id: int
    amount: int
    status: CollateralStatusEnum
    payment_method: str
    transaction_reference: str
    created_at: datetime

    class Config:
        from_attributes = True

class CollateralCreate(BaseModel):
    payment_method: Literal["esewa", "khalti", "card"]

class CollateralPreviewResponse(BaseModel):
    auction_id: int
    amount: int