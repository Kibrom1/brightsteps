"""Property Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.property import PropertyType
from app.schemas.user import UserResponse


class PropertyBase(BaseModel):
    """Base property schema."""

    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str = Field(..., min_length=5, max_length=10)
    country: str = Field(default="USA", max_length=100)
    property_type: PropertyType
    bedrooms: int = Field(..., ge=0)
    bathrooms: float = Field(..., ge=0)
    square_feet: int = Field(..., gt=0)
    year_built: Optional[int] = Field(None, ge=1800, le=2100)


class PropertyCreate(PropertyBase):
    """Schema for creating a property."""

    pass


class PropertyUpdate(BaseModel):
    """Schema for updating a property."""

    address_line1: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=2)
    zip_code: Optional[str] = Field(None, min_length=5, max_length=10)
    country: Optional[str] = Field(None, max_length=100)
    property_type: Optional[PropertyType] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[float] = Field(None, ge=0)
    square_feet: Optional[int] = Field(None, gt=0)
    year_built: Optional[int] = Field(None, ge=1800, le=2100)


class PropertyResponse(PropertyBase):
    """Schema for property response."""

    id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True

