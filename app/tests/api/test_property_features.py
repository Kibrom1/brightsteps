from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.property import Property, PropertyType, PropertyStatus
from app.models.user import User


def create_sample_properties(db: Session, owner: User):
    db.query(Property).delete()
    prop1 = Property(
        owner_user_id=owner.id,
        address_line1="100 Alpha St",
        city="Austin",
        state="TX",
        zip_code="73301",
        property_type=PropertyType.SINGLE_FAMILY,
        bedrooms=3,
        bathrooms=2,
        square_feet=1500,
        year_built=2001,
        list_price=300000,
        tags=["pool", "corner"],
        latitude=30.266666,
        longitude=-97.73333,
    )
    prop2 = Property(
        owner_user_id=owner.id,
        address_line1="200 Beta Ave",
        city="Dallas",
        state="TX",
        zip_code="75001",
        property_type=PropertyType.MULTI_FAMILY,
        status=PropertyStatus.OWNED,
        bedrooms=4,
        bathrooms=3,
        square_feet=2200,
        year_built=2010,
        list_price=450000,
        tags=["downtown"],
        latitude=32.7767,
        longitude=-96.7970,
    )
    prop3 = Property(
        owner_user_id=owner.id,
        address_line1="300 Gamma Rd",
        city="Austin",
        state="TX",
        zip_code="73301",
        property_type=PropertyType.CONDO,
        status=PropertyStatus.FOR_SALE,
        bedrooms=2,
        bathrooms=1.5,
        square_feet=980,
        year_built=2015,
        list_price=210000,
        tags=["pool"],
        latitude=30.27,
        longitude=-97.75,
    )
    db.add_all([prop1, prop2, prop3])
    db.commit()
    return prop1, prop2, prop3


def test_property_filters_by_city_and_price(client: TestClient, db: Session, normal_user: User, normal_user_token_headers: dict):
    prop1, prop2, prop3 = create_sample_properties(db, normal_user)

    response = client.get(
        "/api/v1/properties",
        params=[("city", "Austin"), ("min_price", 250000), ("tags", "pool")],
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    ids = {item["id"] for item in data}

    assert prop1.id in ids
    assert prop3.id not in ids  # filtered out by price
    assert prop2.id not in ids  # different city


def test_property_comparison_summary(client: TestClient, db: Session, normal_user: User, normal_user_token_headers: dict):
    prop1, prop2, _ = create_sample_properties(db, normal_user)

    response = client.get(
        "/api/v1/properties/compare",
        params=[("property_ids", prop1.id), ("property_ids", prop2.id)],
        headers=normal_user_token_headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert "summary" in payload
    assert payload["summary"]["average_price"] == 375000
    assert len(payload["properties"]) == 2


def test_map_endpoint_returns_points(client: TestClient, db: Session, normal_user: User, normal_user_token_headers: dict):
    prop1, _, _ = create_sample_properties(db, normal_user)

    response = client.get(
        "/api/v1/properties/map",
        params={"city": "Austin", "radius_miles": 5, "latitude": 30.27, "longitude": -97.74},
        headers=normal_user_token_headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert any(point["id"] == prop1.id for point in payload["points"])
