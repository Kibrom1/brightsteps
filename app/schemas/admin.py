from typing import Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    details: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class FeatureFlagBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_enabled: bool = False

class FeatureFlagCreate(FeatureFlagBase):
    pass

class FeatureFlagUpdate(BaseModel):
    description: Optional[str] = None
    is_enabled: Optional[bool] = None

class FeatureFlagResponse(FeatureFlagBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemStats(BaseModel):
    total_users: int
    total_properties: int
    total_deals: int
    total_leads: int
    active_subscriptions: int

