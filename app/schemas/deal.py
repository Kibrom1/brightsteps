"""Deal Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, model_validator

from app.core.assumptions import Assumptions
from app.schemas.property import PropertyResponse
from app.schemas.user import UserResponse


class DealBase(BaseModel):
    """Base deal schema."""

    property_id: Optional[int] = None
    purchase_price: float = Field(..., gt=0)
    down_payment: float = Field(..., gt=0)
    interest_rate: float = Field(..., ge=0)
    loan_term_years: int = Field(..., gt=0)
    monthly_rent: float = Field(..., ge=0)
    property_tax_annual: Optional[float] = Field(None, ge=0)
    insurance_annual: Optional[float] = Field(None, ge=0)
    hoa_monthly: Optional[float] = Field(None, ge=0)
    maintenance_percent: float = Field(..., ge=0, le=100)
    vacancy_percent: float = Field(..., ge=0, le=100)
    management_percent: float = Field(..., ge=0, le=100)
    notes: Optional[str] = None


class DealCreate(DealBase):
    """Schema for creating a deal."""

    assumptions: Optional[Assumptions] = None

    @model_validator(mode="after")
    def validate_down_payment(self) -> "DealCreate":
        """Validate down payment is less than purchase price."""
        if self.down_payment >= self.purchase_price:
            raise ValueError("Down payment must be less than purchase price.")
        return self


class DealUpdate(BaseModel):
    """Schema for updating a deal."""

    property_id: Optional[int] = None
    purchase_price: Optional[float] = Field(None, gt=0)
    down_payment: Optional[float] = Field(None, gt=0)
    interest_rate: Optional[float] = Field(None, ge=0)
    loan_term_years: Optional[int] = Field(None, gt=0)
    monthly_rent: Optional[float] = Field(None, ge=0)
    property_tax_annual: Optional[float] = Field(None, ge=0)
    insurance_annual: Optional[float] = Field(None, ge=0)
    hoa_monthly: Optional[float] = Field(None, ge=0)
    maintenance_percent: Optional[float] = Field(None, ge=0, le=100)
    vacancy_percent: Optional[float] = Field(None, ge=0, le=100)
    management_percent: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None


class DealResponse(DealBase):
    """Schema for deal response."""

    id: int
    user_id: int
    snapshot_of_assumptions: Optional[Dict[str, Any]] = None
    snapshot_of_analytics_result: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    property: Optional[PropertyResponse] = None

    class Config:
        from_attributes = True

