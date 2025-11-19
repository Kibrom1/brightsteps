import math

from app.core.analytics import (
    analyze_deal,
    calculate_cap_rate,
    calculate_cash_flow,
    calculate_dscr,
    estimate_rent,
)
from app.core.assumptions import Assumptions


def test_calculate_cap_rate_basic():
    cap_rate, noi = calculate_cap_rate(purchase_price=200000, annual_rent=24000, annual_expenses=6000)
    assert round(cap_rate, 2) == 9.0
    assert noi == 18000


def test_cash_flow_and_noi():
    payload = {
        "purchase_price": 250000,
        "down_payment": 50000,
        "interest_rate": 5.0,
        "loan_term_years": 30,
        "monthly_rent": 2200,
        "property_tax_annual": 3000,
        "insurance_annual": 1200,
        "hoa_monthly": 150,
        "maintenance_percent": 8,
        "vacancy_percent": 5,
        "management_percent": 8,
    }
    result = calculate_cash_flow(payload)
    assert result["noi_annual"] > 0
    assert result["monthly_debt_service"] > 0
    assert math.isclose(result["annual_cash_flow"], result["monthly_cash_flow"] * 12)


def test_dscr_zero_debt_service():
    dscr, interpretation = calculate_dscr(10000, 0)
    assert dscr == math.inf
    assert "No debt" in interpretation


def test_rent_estimate_rule_based():
    estimate, assumptions = estimate_rent(
        {
            "bedrooms": 3,
            "bathrooms": 2,
            "square_feet": 1500,
            "zip_code": "12345",
            "property_type": "single_family",
        }
    )
    assert estimate > 0
    assert "base_rent_per_sqft" in assumptions


def test_analyze_deal_scores_and_labels():
    payload = {
        "purchase_price": 300000,
        "down_payment": 60000,
        "monthly_rent": 2500,
        "interest_rate": 4.5,
        "loan_term_years": 30,
        "hoa_monthly": 0,
        "assumptions": Assumptions(vacancy_percent=4, maintenance_percent=7, management_percent=7),
    }
    result = analyze_deal(payload)
    assert 0 <= result["overall_score"] <= 100
    assert result["label"] in {"Strong Deal", "Neutral", "Weak Deal"}
    assert result["cash_flow"]["monthly_cash_flow"] != 0
