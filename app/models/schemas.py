"""Pydantic schemas for the analytics engine."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, model_validator

from app.core.assumptions import Assumptions


class ResponseEnvelope(BaseModel):
    """Standard response envelope for React-friendly responses."""

    data: dict
    warnings: Optional[List[str]] = None
    errors: Optional[List[str]] = None


class CapRateRequest(BaseModel):
    purchase_price: float = Field(..., gt=0)
    annual_rent: float = Field(..., ge=0)
    annual_expenses: float = Field(..., ge=0)


class CapRateResponse(BaseModel):
    cap_rate: float
    noi: float
    annual_rent: float
    annual_expenses: float


class CashFlowRequest(BaseModel):
    purchase_price: float = Field(..., gt=0)
    down_payment: float = Field(..., gt=0)
    interest_rate: float = Field(..., ge=0)
    loan_term_years: int = Field(..., gt=0)
    monthly_rent: float = Field(..., ge=0)
    property_tax_annual: float = Field(..., ge=0)
    insurance_annual: float = Field(..., ge=0)
    hoa_monthly: float = Field(0.0, ge=0)
    maintenance_percent: float = Field(..., ge=0)
    vacancy_percent: float = Field(..., ge=0)
    management_percent: float = Field(..., ge=0)


class CashFlowResponse(BaseModel):
    monthly_cash_flow: float
    annual_cash_flow: float
    noi_annual: float
    monthly_debt_service: float
    cash_on_cash_return: float
    summary: str


class DSCRRequest(BaseModel):
    noi_annual: float = Field(..., ge=0)
    annual_debt_service: float = Field(..., ge=0)


class DSCRResponse(BaseModel):
    dscr: Optional[float]  # None when there's no debt service (cash purchase)
    interpretation: str


class RentEstimateRequest(BaseModel):
    bedrooms: int = Field(..., ge=0)
    bathrooms: float = Field(..., ge=0)
    square_feet: int = Field(..., gt=0)
    zip_code: str = Field(..., min_length=5, max_length=10)
    property_type: str = Field(..., pattern="^(single_family|multi_family|condo|townhouse)$")


class RentEstimateResponse(BaseModel):
    estimated_rent: float
    assumptions: dict


class DealAnalysisRequest(BaseModel):
    purchase_price: float = Field(..., gt=0)
    down_payment: float = Field(..., gt=0)
    monthly_rent: float = Field(..., ge=0)
    interest_rate: float = Field(..., ge=0)
    loan_term_years: int = Field(..., gt=0)
    hoa_monthly: float = Field(0.0, ge=0)
    assumptions: Optional[Assumptions] = None

    @model_validator(mode="after")
    def down_payment_not_exceed_purchase(self) -> "DealAnalysisRequest":
        """Validate that down payment is less than purchase price."""
        if self.down_payment >= self.purchase_price:
            raise ValueError("Down payment must be less than purchase price to leave room for financing.")
        return self


class DealAnalysisResponse(BaseModel):
    overall_score: float
    label: str
    reasons: List[str]
    cash_flow: CashFlowResponse
    dscr: DSCRResponse


__all__ = [
    "ResponseEnvelope",
    "CapRateRequest",
    "CapRateResponse",
    "CashFlowRequest",
    "CashFlowResponse",
    "DSCRRequest",
    "DSCRResponse",
    "RentEstimateRequest",
    "RentEstimateResponse",
    "DealAnalysisRequest",
    "DealAnalysisResponse",
]
