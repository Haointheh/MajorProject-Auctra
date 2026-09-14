# from pydantic import BaseModel, Field
# from datetime import datetime


# class BidCreate(BaseModel):
#     amount: int = Field(gt=0)


# class BidderInfo(BaseModel):
#     id: int
#     name: str

#     class Config:
#         from_attributes = True


# class BidResponse(BaseModel):
#     id: int
#     auction_id: int
#     amount: int
#     created_at: datetime
#     bidder: BidderInfo

#     class Config:
#         from_attributes = True

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

    # Populated from RiskAssessment (see collateral_routes.py's
    # deposit_collateral — one row per bidder per auction, written when they
    # first deposit collateral, before any bids exist). Both are None for a
    # brand-new bidder (no scoring history yet, see
    # Trust_Score_Engine.first_auction_policy) — the frontend already treats
    # a null score as "no data yet" rather than "zero risk".
    risk_tier: str | None = None
    final_risk_score: float | None = None

    class Config:
        from_attributes = True