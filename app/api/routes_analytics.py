"""API routes for analytics calculations."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.analytics import (
    analyze_deal,
    calculate_cap_rate,
    calculate_cash_flow,
    calculate_dscr,
    estimate_rent,
)
from app.core.assumptions import Assumptions, get_assumptions, update_assumptions
from app.models.schemas import (
    CapRateRequest,
    CashFlowRequest,
    DSCRRequest,
    DealAnalysisRequest,
    RentEstimateRequest,
    ResponseEnvelope,
)

router = APIRouter(prefix="/api/v1", tags=["analytics"])


@router.post("/calculate/cap-rate", response_model=ResponseEnvelope, summary="Calculate cap rate")
def cap_rate_endpoint(payload: CapRateRequest) -> ResponseEnvelope:
    """Compute cap rate using purchase price, annual rent, and expenses."""

    cap_rate, noi = calculate_cap_rate(
        purchase_price=payload.purchase_price,
        annual_rent=payload.annual_rent,
        annual_expenses=payload.annual_expenses,
    )
    return ResponseEnvelope(data={"cap_rate": cap_rate, "noi": noi, "annual_rent": payload.annual_rent, "annual_expenses": payload.annual_expenses})


@router.post("/calculate/cash-flow", response_model=ResponseEnvelope, summary="Calculate detailed cash flow")
def cash_flow_endpoint(payload: CashFlowRequest) -> ResponseEnvelope:
    """Run the cash flow engine using financing, rent, and expense inputs."""

    result = calculate_cash_flow(payload.model_dump())
    return ResponseEnvelope(data=result)


@router.post("/calculate/dscr", response_model=ResponseEnvelope, summary="Calculate DSCR")
def dscr_endpoint(payload: DSCRRequest) -> ResponseEnvelope:
    """Compute debt-service-coverage ratio with interpretation."""

    dscr_value, interpretation = calculate_dscr(payload.noi_annual, payload.annual_debt_service)
    return ResponseEnvelope(data={"dscr": dscr_value, "interpretation": interpretation})


@router.post("/estimate/rent", response_model=ResponseEnvelope, summary="Estimate market rent")
def rent_estimate_endpoint(payload: RentEstimateRequest) -> ResponseEnvelope:
    """Estimate rent using a rule-based model with tunable coefficients."""

    estimated_rent, assumptions = estimate_rent(payload.model_dump())
    return ResponseEnvelope(data={"estimated_rent": estimated_rent, "assumptions": assumptions})


@router.get("/assumptions", response_model=ResponseEnvelope, summary="Get default assumptions")
def get_assumptions_endpoint() -> ResponseEnvelope:
    """Return the current in-memory assumption set used by calculations."""

    return ResponseEnvelope(data=get_assumptions().model_dump())


@router.put("/assumptions", response_model=ResponseEnvelope, summary="Override assumptions")
def update_assumptions_endpoint(payload: Assumptions) -> ResponseEnvelope:
    """Update the in-memory default assumptions."""

    updated = update_assumptions(payload)
    return ResponseEnvelope(data=updated.model_dump())


@router.post("/analyze/deal", response_model=ResponseEnvelope, summary="Analyze a full deal")
def analyze_deal_endpoint(payload: DealAnalysisRequest) -> ResponseEnvelope:
    """Run the rule-based deal analyzer combining cash flow and DSCR logic."""

    assumptions = payload.assumptions or get_assumptions()
    analysis_payload = payload.model_dump()
    analysis_payload["assumptions"] = assumptions
    result = analyze_deal(analysis_payload)

    return ResponseEnvelope(data=result)
