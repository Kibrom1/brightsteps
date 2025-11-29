"""AI generation schemas."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from app.models.property import PropertyType


class PropertyDescriptionRequest(BaseModel):
    """Request schema for generating property description."""
    address: Optional[str] = None
    property_type: PropertyType
    bedrooms: int
    bathrooms: float
    square_feet: int
    features: List[str] = []
    tone: str = "professional"  # professional, luxury, cozy, urgent


class PropertyDescriptionResponse(BaseModel):
    """Response schema for generated description."""
    description: str


