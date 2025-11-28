from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.deal import Deal
from app.models.property import Property, PropertyType
from app.models.user import User

def test_get_deal_comps_no_property(client: TestClient, normal_user_token_headers: dict, db: Session, normal_user: User):
    # Create a base deal with no property
    base_deal = Deal(
        user_id=normal_user.id,
        purchase_price=100000,
        down_payment=20000,
        interest_rate=5.0,
        loan_term_years=30,
        monthly_rent=1000,
        maintenance_percent=5,
        vacancy_percent=5,
        management_percent=5,
    )
    db.add(base_deal)
    
    # Create a comparable deal (within 20% price)
    comp_deal = Deal(
        user_id=normal_user.id,
        purchase_price=110000,
        down_payment=22000,
        interest_rate=5.0,
        loan_term_years=30,
        monthly_rent=1100,
        maintenance_percent=5,
        vacancy_percent=5,
        management_percent=5,
    )
    db.add(comp_deal)
    
    # Create a non-comparable deal (outside price range)
    non_comp_deal = Deal(
        user_id=normal_user.id,
        purchase_price=200000,
        down_payment=40000,
        interest_rate=5.0,
        loan_term_years=30,
        monthly_rent=2000,
        maintenance_percent=5,
        vacancy_percent=5,
        management_percent=5,
    )
    db.add(non_comp_deal)
    db.commit()
    
    response = client.get(
        f"/api/v1/deals/{base_deal.id}/comps",
        headers=normal_user_token_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == comp_deal.id

def test_get_deal_comps_with_property(client: TestClient, normal_user_token_headers: dict, db: Session, normal_user: User):
    # Create properties
    prop1 = Property(
        owner_user_id=normal_user.id,
        address_line1="123 Main St",
        city="Austin",
        state="TX",
        zip_code="78701",
        property_type=PropertyType.SINGLE_FAMILY,
        bedrooms=3,
        bathrooms=2,
        square_feet=1500
    )
    prop2 = Property(
        owner_user_id=normal_user.id,
        address_line1="456 Oak St",
        city="Austin", # Same city
        state="TX",
        zip_code="78702",
        property_type=PropertyType.MULTI_FAMILY, # Different type
        bedrooms=4,
        bathrooms=3,
        square_feet=2000
    )
    prop3 = Property(
        owner_user_id=normal_user.id,
        address_line1="789 Pine St",
        city="Dallas", # Different city
        state="TX",
        zip_code="75201",
        property_type=PropertyType.SINGLE_FAMILY, # Same type
        bedrooms=3,
        bathrooms=2,
        square_feet=1500
    )
    db.add(prop1)
    db.add(prop2)
    db.add(prop3)
    db.commit()

    # Create deals linked to properties
    deal1 = Deal(
        user_id=normal_user.id,
        property_id=prop1.id,
        purchase_price=300000,
        down_payment=60000,
        interest_rate=5.0,
        loan_term_years=30,
        monthly_rent=2500,
        maintenance_percent=5,
        vacancy_percent=5,
        management_percent=5,
    )
    deal2 = Deal(
        user_id=normal_user.id,
        property_id=prop2.id,
        purchase_price=350000, # Different price
        down_payment=70000,
        interest_rate=5.0,
        loan_term_years=30,
        monthly_rent=3000,
        maintenance_percent=5,
        vacancy_percent=5,
        management_percent=5,
    )
    deal3 = Deal(
        user_id=normal_user.id,
        property_id=prop3.id,
        purchase_price=300000,
        down_payment=60000,
        interest_rate=5.0,
        loan_term_years=30,
        monthly_rent=2500,
        maintenance_percent=5,
        vacancy_percent=5,
        management_percent=5,
    )
    db.add(deal1)
    db.add(deal2)
    db.add(deal3)
    db.commit()
    
    # Search comps for deal1 (Austin, Single Family)
    # deal2 is Austin (match city)
    # deal3 is Single Family (match type)
    # Both should be returned
    
    response = client.get(
        f"/api/v1/deals/{deal1.id}/comps",
        headers=normal_user_token_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    ids = [d["id"] for d in data]
    assert deal2.id in ids
    assert deal3.id in ids
    assert len(data) == 2

