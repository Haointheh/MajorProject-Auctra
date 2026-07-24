from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from datetime import datetime
from model import CategoryEnum


class AuctionCreate(BaseModel):
    title: str
    description: str
    category: CategoryEnum
    condition: Literal["excellent", "good", "fair", "poor"]
    base_price: int = Field(gt=0)
    start_time: datetime
    duration_days: int = Field(gt=0)

class AuctionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    condition: Literal["excellent", "good", "fair", "poor"] | None = None
    start_time: datetime | None = None
    duration_days: int | None = Field(default=None, gt=0)


class SellerInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class AuctionImageResponse(BaseModel):
    id: int
    image_path: str

    class Config:
        from_attributes = True


class AuctionResponse(BaseModel):
    id: int
    title: str
    description: str
    category: CategoryEnum
    condition: str
    base_price: int
    start_time: datetime
    end_time: datetime
    status: str
    seller: SellerInfo
    images: List[AuctionImageResponse]
    created_at: datetime
    current_highest_bid: Optional[int] = None  # add this line
    estimated_collateral: Optional[int] = None  # required collateral, computed before deposit

    class Config:
        from_attributes = True

class CompletePurchaseRequest(BaseModel):
    payment_method: Literal["esewa", "bank_transfer"]
    transaction_reference: str

