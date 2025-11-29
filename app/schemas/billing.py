from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.billing import PlanInterval, SubscriptionStatus

class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    interval: PlanInterval = PlanInterval.MONTHLY
    features: Optional[List[str]] = None

class PlanCreate(PlanBase):
    stripe_price_id: Optional[str] = None

class PlanResponse(PlanBase):
    id: int
    stripe_price_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionBase(BaseModel):
    plan_id: int

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: SubscriptionStatus
    current_period_end: Optional[datetime]
    plan: PlanResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

