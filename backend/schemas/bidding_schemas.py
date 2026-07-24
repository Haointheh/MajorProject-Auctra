from pydantic import BaseModel, Field
from datetime import datetime


class BidCreate(BaseModel):
    amount: int = Field(gt=0)


class BidderInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class BidResponse(BaseModel):
    id: int
    auction_id: int
    amount: int
    created_at: datetime
    bidder: BidderInfo

    class Config:
        from_attributes = True