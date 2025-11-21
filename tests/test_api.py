from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_cap_rate_endpoint():
    response = client.post(
        "/api/v1/calculate/cap-rate",
        json={"purchase_price": 200000, "annual_rent": 24000, "annual_expenses": 6000},
    )
    assert response.status_code == 200
    body = response.json()
    assert "data" in body and "cap_rate" in body["data"]


def test_cash_flow_invalid_missing_field():
    response = client.post(
        "/api/v1/calculate/cash-flow",
        json={"purchase_price": 200000},
    )
    assert response.status_code == 422


def test_assumptions_round_trip():
    get_resp = client.get("/api/v1/assumptions")
    assert get_resp.status_code == 200
    defaults = get_resp.json()["data"]

    updated_payload = {**defaults, "vacancy_percent": 4.0}
    put_resp = client.put("/api/v1/assumptions", json=updated_payload)
    assert put_resp.status_code == 200
    assert put_resp.json()["data"]["vacancy_percent"] == 4.0


def test_analyze_deal_endpoint():
    response = client.post(
        "/api/v1/analyze/deal",
        json={
            "purchase_price": 300000,
            "down_payment": 60000,
            "monthly_rent": 2500,
            "interest_rate": 4.5,
            "loan_term_years": 30,
            "hoa_monthly": 0,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "overall_score" in body["data"]
    assert "cash_flow" in body["data"]


def test_dscr_endpoint_zero_debt_service():
    """Test DSCR endpoint with zero debt service (cash purchase)."""
    response = client.post(
        "/api/v1/calculate/dscr",
        json={"noi_annual": 30000, "annual_debt_service": 0},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["dscr"] is None
    assert "No debt" in body["data"]["interpretation"]


def test_rent_estimate_invalid_property_type():
    """Test that API rejects invalid property_type values."""
    response = client.post(
        "/api/v1/estimate/rent",
        json={
            "bedrooms": 3,
            "bathrooms": 2,
            "square_feet": 1500,
            "zip_code": "90210",
            "property_type": "invalid_type",
        },
    )
    assert response.status_code == 422  # Validation error


def test_deal_analysis_down_payment_validation():
    """Test that API rejects down_payment >= purchase_price."""
    response = client.post(
        "/api/v1/analyze/deal",
        json={
            "purchase_price": 300000,
            "down_payment": 300000,  # Equal to purchase price
            "monthly_rent": 2500,
            "interest_rate": 4.5,
            "loan_term_years": 30,
        },
    )
    assert response.status_code == 422  # Validation error
