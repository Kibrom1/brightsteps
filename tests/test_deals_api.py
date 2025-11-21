"""Tests for deals API with analytics integration."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def get_auth_token(email: str = "dealuser@example.com", password: str = "dealpass123") -> str:
    """Helper to register and get auth token."""
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Deal User",
        },
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return response.json()["access_token"]


def test_create_deal_with_analytics():
    """Test creating a deal and verify analytics are calculated."""
    token = get_auth_token()

    response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
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
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["purchase_price"] == 250000
    assert "snapshot_of_analytics_result" in data
    assert data["snapshot_of_analytics_result"] is not None

    # Verify analytics structure
    analytics = data["snapshot_of_analytics_result"]
    assert "cash_flow" in analytics
    assert "dscr" in analytics
    assert "deal_analysis" in analytics
    assert "monthly_cash_flow" in analytics["cash_flow"]
    assert "overall_score" in analytics["deal_analysis"]


def test_create_deal_with_property():
    """Test creating a deal linked to a property."""
    token = get_auth_token("propdeal@example.com")

    # Create property first
    prop_response = client.post(
        "/api/v1/properties",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "address_line1": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94102",
            "property_type": "single_family",
            "bedrooms": 3,
            "bathrooms": 2,
            "square_feet": 1500,
        },
    )
    property_id = prop_response.json()["id"]

    # Create deal with property
    response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "property_id": property_id,
            "purchase_price": 300000,
            "down_payment": 60000,
            "interest_rate": 4.5,
            "loan_term_years": 30,
            "monthly_rent": 2500,
            "maintenance_percent": 7,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["property_id"] == property_id


def test_list_deals():
    """Test listing deals for current user."""
    token = get_auth_token("listdeals@example.com")

    # Create a deal
    client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "purchase_price": 200000,
            "down_payment": 40000,
            "interest_rate": 6.0,
            "loan_term_years": 30,
            "monthly_rent": 1800,
            "maintenance_percent": 8,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )

    # List deals
    response = client.get(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_deal():
    """Test getting a specific deal."""
    token = get_auth_token("getdeal@example.com")

    # Create a deal
    create_response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "purchase_price": 150000,
            "down_payment": 30000,
            "interest_rate": 5.5,
            "loan_term_years": 30,
            "monthly_rent": 1500,
            "maintenance_percent": 8,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )
    deal_id = create_response.json()["id"]

    # Get the deal
    response = client.get(
        f"/api/v1/deals/{deal_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == deal_id
    assert "snapshot_of_analytics_result" in data


def test_update_deal_recalculates_analytics():
    """Test that updating a deal recalculates analytics."""
    token = get_auth_token("updatedeal@example.com")

    # Create a deal
    create_response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "purchase_price": 200000,
            "down_payment": 40000,
            "interest_rate": 6.0,
            "loan_term_years": 30,
            "monthly_rent": 1800,
            "maintenance_percent": 8,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )
    deal_id = create_response.json()["id"]
    original_cash_flow = create_response.json()["snapshot_of_analytics_result"]["cash_flow"]["monthly_cash_flow"]

    # Update the deal (change monthly rent)
    update_response = client.put(
        f"/api/v1/deals/{deal_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"monthly_rent": 2500},  # Increase rent
    )

    assert update_response.status_code == 200
    updated_cash_flow = update_response.json()["snapshot_of_analytics_result"]["cash_flow"]["monthly_cash_flow"]
    # Cash flow should increase with higher rent
    assert updated_cash_flow > original_cash_flow


def test_recalculate_deal():
    """Test recalculating deal analytics."""
    token = get_auth_token("recalc@example.com")

    # Create a deal
    create_response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "purchase_price": 200000,
            "down_payment": 40000,
            "interest_rate": 6.0,
            "loan_term_years": 30,
            "monthly_rent": 1800,
            "maintenance_percent": 8,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )
    deal_id = create_response.json()["id"]

    # Recalculate
    response = client.post(
        f"/api/v1/deals/{deal_id}/recalculate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert "snapshot_of_analytics_result" in response.json()


def test_deal_ownership_enforcement():
    """Test that users can only access their own deals."""
    token1 = get_auth_token("user1@example.com")
    token2 = get_auth_token("user2@example.com")

    # User 1 creates a deal
    create_response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "purchase_price": 200000,
            "down_payment": 40000,
            "interest_rate": 6.0,
            "loan_term_years": 30,
            "monthly_rent": 1800,
            "maintenance_percent": 8,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )
    deal_id = create_response.json()["id"]

    # User 2 tries to access user 1's deal
    response = client.get(
        f"/api/v1/deals/{deal_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 403  # Forbidden


def test_delete_deal():
    """Test deleting a deal."""
    token = get_auth_token("delete@example.com")

    # Create a deal
    create_response = client.post(
        "/api/v1/deals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "purchase_price": 200000,
            "down_payment": 40000,
            "interest_rate": 6.0,
            "loan_term_years": 30,
            "monthly_rent": 1800,
            "maintenance_percent": 8,
            "vacancy_percent": 5,
            "management_percent": 8,
        },
    )
    deal_id = create_response.json()["id"]

    # Delete the deal
    response = client.delete(
        f"/api/v1/deals/{deal_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204

    # Verify it's deleted
    get_response = client.get(
        f"/api/v1/deals/{deal_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_response.status_code == 404

