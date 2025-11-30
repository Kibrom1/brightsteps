"""Pure calculation helpers for the analytics engine."""
from __future__ import annotations

from typing import Dict, Optional, Tuple

from app.core.assumptions import Assumptions


RENT_CONFIG = {
    "base_rent_per_sqft": 1.2,
    "bedroom_multiplier": 75.0,
    "bathroom_multiplier": 50.0,
    "property_type_adjustments": {
        "single_family": 1.0,
        "multi_family": 0.95,
        "condo": 0.9,
        "townhouse": 0.97,
    },
}


def calculate_cap_rate(purchase_price: float, annual_rent: float, annual_expenses: float) -> Tuple[float, float]:
    """Return cap rate percentage and NOI based on inputs."""

    noi = annual_rent - annual_expenses
    cap_rate = (noi / purchase_price) * 100 if purchase_price else 0.0
    return cap_rate, noi


def _compute_monthly_debt_service(loan_amount: float, interest_rate: float, loan_term_years: int) -> float:
    rate = interest_rate / 100 / 12
    periods = loan_term_years * 12
    if loan_amount <= 0 or periods <= 0:
        return 0.0
    if rate == 0:
        return loan_amount / periods
    numerator = loan_amount * rate * (1 + rate) ** periods
    denominator = (1 + rate) ** periods - 1
    return numerator / denominator


def calculate_cash_flow(data: Dict[str, float]) -> Dict[str, float]:
    """Calculate cash flow metrics from the given payload."""

    loan_amount = data["purchase_price"] - data["down_payment"]
    monthly_debt_service = _compute_monthly_debt_service(
        loan_amount=loan_amount,
        interest_rate=data["interest_rate"],
        loan_term_years=data["loan_term_years"],
    )

    maintenance = data["monthly_rent"] * data["maintenance_percent"] / 100
    management = data["monthly_rent"] * data["management_percent"] / 100
    vacancy_loss = data["monthly_rent"] * data["vacancy_percent"] / 100
    property_tax_monthly = data["property_tax_annual"] / 12
    insurance_monthly = data["insurance_annual"] / 12

    effective_gross_income = data["monthly_rent"] - vacancy_loss
    operating_expenses = maintenance + management + property_tax_monthly + insurance_monthly + data.get("hoa_monthly", 0.0)
    noi_monthly = effective_gross_income - operating_expenses
    noi_annual = noi_monthly * 12

    monthly_cash_flow = noi_monthly - monthly_debt_service
    annual_cash_flow = monthly_cash_flow * 12
    cash_on_cash_return = (annual_cash_flow / data["down_payment"] * 100) if data["down_payment"] else 0.0

    summary_parts = [
        f"NOI: ${noi_monthly:,.2f}/mo",
        f"Debt Service: ${monthly_debt_service:,.2f}/mo",
        f"Cash Flow: ${monthly_cash_flow:,.2f}/mo",
        f"Cash-on-Cash: {cash_on_cash_return:.2f}%",
    ]

    return {
        "monthly_cash_flow": monthly_cash_flow,
        "annual_cash_flow": annual_cash_flow,
        "noi_annual": noi_annual,
        "monthly_debt_service": monthly_debt_service,
        "cash_on_cash_return": cash_on_cash_return,
        "summary": " | ".join(summary_parts),
    }


def calculate_dscr(noi_annual: float, annual_debt_service: float) -> Tuple[Optional[float], str]:
    """Calculate DSCR and provide interpretation.
    
    Returns None for dscr_value when there's no debt service (cash purchase).
    This is JSON-safe and can be handled by frontend clients.
    """

    if annual_debt_service == 0:
        return None, "No debt service (cash purchase or paid-off loan)"
    dscr_value = noi_annual / annual_debt_service
    if dscr_value < 1.0:
        interpretation = "Negative cash flow / risk"
    elif dscr_value <= 1.2:
        interpretation = "Borderline"
    else:
        interpretation = "Healthy coverage"
    return dscr_value, interpretation


def estimate_rent(request: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """Estimate rent using rule-based multipliers.
    
    Note: zip_code is accepted in the request but not currently used in calculations.
    It is reserved for future location-based rent adjustments.
    """

    base = RENT_CONFIG["base_rent_per_sqft"] * request["square_feet"]
    bedroom_adj = RENT_CONFIG["bedroom_multiplier"] * request["bedrooms"]
    bathroom_adj = RENT_CONFIG["bathroom_multiplier"] * request["bathrooms"]
    property_adjustment = RENT_CONFIG["property_type_adjustments"].get(request["property_type"], 1.0)

    # TODO: Implement zip_code-based adjustments in future enhancement
    # zip_code = request.get("zip_code")  # Reserved for future use

    estimated = (base + bedroom_adj + bathroom_adj) * property_adjustment
    assumptions = {
        "base_rent_per_sqft": RENT_CONFIG["base_rent_per_sqft"],
        "bedroom_multiplier": RENT_CONFIG["bedroom_multiplier"],
        "bathroom_multiplier": RENT_CONFIG["bathroom_multiplier"],
        "property_type_adjustment": property_adjustment,
        "zip_code_used": False,  # Indicate that zip_code is not yet implemented
    }
    return estimated, assumptions


def analyze_deal(payload: Dict) -> Dict:
    """Run cash flow and DSCR calculations and produce a rule-based score."""

    assumptions: Assumptions = payload.get("assumptions") or Assumptions()
    # Use provided values if available, otherwise calculate from assumptions
    property_tax_annual = payload.get("property_tax_annual")
    if property_tax_annual is None:
        property_tax_annual = payload["purchase_price"] * assumptions.property_tax_percent / 100
    
    insurance_annual = payload.get("insurance_annual")
    if insurance_annual is None:
        insurance_annual = payload["purchase_price"] * assumptions.insurance_percent / 100

    # Use provided percentages if available, otherwise use assumptions
    maintenance_percent = payload.get("maintenance_percent", assumptions.maintenance_percent)
    vacancy_percent = payload.get("vacancy_percent", assumptions.vacancy_percent)
    management_percent = payload.get("management_percent", assumptions.management_percent)
    
    cash_flow_inputs = {
        "purchase_price": payload["purchase_price"],
        "down_payment": payload["down_payment"],
        "interest_rate": payload["interest_rate"],
        "loan_term_years": payload["loan_term_years"],
        "monthly_rent": payload["monthly_rent"],
        "property_tax_annual": property_tax_annual,
        "insurance_annual": insurance_annual,
        "hoa_monthly": payload.get("hoa_monthly", 0.0),
        "maintenance_percent": maintenance_percent,
        "vacancy_percent": vacancy_percent,
        "management_percent": management_percent,
    }

    cash_flow_result = calculate_cash_flow(cash_flow_inputs)
    dscr_value, dscr_interp = calculate_dscr(
        noi_annual=cash_flow_result["noi_annual"],
        annual_debt_service=cash_flow_result["monthly_debt_service"] * 12,
    )

    score = 50.0
    reasons = []

    if cash_flow_result["monthly_cash_flow"] > 300:
        score += 20
        reasons.append("Monthly cash flow exceeds $300")
    elif cash_flow_result["monthly_cash_flow"] > 0:
        score += 10
        reasons.append("Positive monthly cash flow")
    else:
        score -= 10
        reasons.append("Negative monthly cash flow")

    if dscr_value is None:
        # Cash purchase - no debt service, which is generally positive
        score += 15
        reasons.append("Cash purchase - no debt service required")
    elif dscr_value > 1.25:
        score += 20
        reasons.append("DSCR above 1.25 indicates strong coverage")
    elif dscr_value > 1.1:
        score += 10
        reasons.append("DSCR above 1.1 is acceptable")
    else:
        score -= 10
        reasons.append("DSCR below 1.1 may be risky")

    # Use the actual vacancy_percent used in calculations (deal-specific or assumption)
    if vacancy_percent <= 5:
        score += 5
        reasons.append("Low assumed vacancy")

    score = max(0, min(100, score))
    if score >= 75:
        label = "Strong Deal"
    elif score >= 50:
        label = "Neutral"
    else:
        label = "Weak Deal"

    return {
        "overall_score": score,
        "label": label,
        "reasons": reasons,
        "cash_flow": cash_flow_result,
        "dscr": {"dscr": dscr_value, "interpretation": dscr_interp},
    }
