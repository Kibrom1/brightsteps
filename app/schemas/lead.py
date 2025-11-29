"""Lead schemas."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.lead import ActivityType, LeadStatus


class LeadActivityBase(BaseModel):
    """Base lead activity schema."""
    activity_type: ActivityType
    summary: str = Field(..., min_length=1)
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None


class LeadActivityCreate(LeadActivityBase):
    """Schema for creating a lead activity."""
    pass


class LeadActivityResponse(LeadActivityBase):
    """Schema for lead activity response."""
    id: int
    lead_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LeadBase(BaseModel):
    """Base lead schema."""
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: LeadStatus = LeadStatus.NEW
    source: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    """Schema for creating a lead."""
    pass


class LeadUpdate(BaseModel):
    """Schema for updating a lead."""
    first_name: Optional[str] = Field(None, min_length=1)
    last_name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[LeadStatus] = None
    source: Optional[str] = None
    notes: Optional[str] = None


class LeadResponse(LeadBase):
    """Schema for lead response."""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    activities: List[LeadActivityResponse] = []

    class Config:
        from_attributes = True


