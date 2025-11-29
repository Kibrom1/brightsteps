"""Property Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field

from app.models.property import PropertyType, PropertyStatus
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
    status: PropertyStatus = PropertyStatus.EVALUATING
    bedrooms: int = Field(..., ge=0)
    bathrooms: float = Field(..., ge=0)
    square_feet: int = Field(..., gt=0)
    year_built: Optional[int] = Field(None, ge=1800, le=2100)
    list_price: Optional[float] = Field(None, ge=0)
    tags: Optional[List[str]] = Field(default=None)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


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
    status: Optional[PropertyStatus] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[float] = Field(None, ge=0)
    square_feet: Optional[int] = Field(None, gt=0)
    year_built: Optional[int] = Field(None, ge=1800, le=2100)
    list_price: Optional[float] = Field(None, ge=0)
    tags: Optional[List[str]] = Field(default=None)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class PropertyResponse(PropertyBase):
    """Schema for property response."""

    id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class PropertyComparisonMetrics(BaseModel):
    """Key comparison metrics for a property."""

    price_per_sqft: Optional[float] = None
    bedroom_count: int
    bathroom_count: float
    square_feet: int
    list_price: Optional[float] = None
    year_built: Optional[int] = None


class PropertyComparisonItem(PropertyResponse):
    """Property representation within a comparison response."""

    comparison_metrics: PropertyComparisonMetrics


class PropertyComparisonSummary(BaseModel):
    """Aggregated metrics for compared properties."""

    average_price: Optional[float] = None
    average_price_per_sqft: Optional[float] = None
    average_square_feet: Optional[float] = None
    bedroom_range: Optional[str] = None
    bathroom_range: Optional[str] = None
    year_built_range: Optional[str] = None
    tags: List[str] = []
    statuses: List[PropertyStatus] = []


class PropertyComparisonResponse(BaseModel):
    """Response payload for property comparison."""

    properties: List[PropertyComparisonItem]
    summary: PropertyComparisonSummary


class PropertyMapPoint(BaseModel):
    """Represents a property point on a map visualization."""

    id: int
    latitude: Optional[float]
    longitude: Optional[float]
    label: str
    property_type: PropertyType
    status: PropertyStatus
    heat_metric: Optional[str] = None
    heat_value: Optional[float] = None
    key_metrics: Dict[str, Any]


class PropertyMapResponse(BaseModel):
    """Response for property map view."""

    points: List[PropertyMapPoint]


class PropertyImportResult(BaseModel):
    """Result of a property import operation."""

    imported: int
    skipped: int
    errors: List[str]
    created_ids: List[int]

