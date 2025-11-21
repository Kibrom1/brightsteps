"""Deal management routes with analytics integration."""
from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.analytics import analyze_deal, calculate_cash_flow, calculate_dscr
from app.core.assumptions import Assumptions, get_assumptions
from app.core.dependencies import get_current_active_user, require_admin
from app.db.base import get_db
from app.models.deal import Deal
from app.models.property import Property
from app.models.user import User, UserRole
from app.schemas.deal import DealCreate, DealResponse, DealUpdate

router = APIRouter(prefix="/api/v1/deals", tags=["deals"])


def _calculate_deal_analytics(deal: Deal, assumptions: Assumptions) -> Dict[str, Any]:
    """Calculate analytics for a deal and return results."""
    # Prepare inputs for analytics
    property_tax_annual = deal.property_tax_annual
    if property_tax_annual is None:
        property_tax_annual = deal.purchase_price * assumptions.property_tax_percent / 100

    insurance_annual = deal.insurance_annual
    if insurance_annual is None:
        insurance_annual = deal.purchase_price * assumptions.insurance_percent / 100

    # Build payload for analyze_deal
    deal_payload = {
        "purchase_price": deal.purchase_price,
        "down_payment": deal.down_payment,
        "monthly_rent": deal.monthly_rent,
        "interest_rate": deal.interest_rate,
        "loan_term_years": deal.loan_term_years,
        "hoa_monthly": deal.hoa_monthly or 0.0,
        "assumptions": assumptions,
    }

    # Run full deal analysis
    analysis_result = analyze_deal(deal_payload)

    # Also calculate individual metrics for comprehensive snapshot
    cash_flow_inputs = {
        "purchase_price": deal.purchase_price,
        "down_payment": deal.down_payment,
        "interest_rate": deal.interest_rate,
        "loan_term_years": deal.loan_term_years,
        "monthly_rent": deal.monthly_rent,
        "property_tax_annual": property_tax_annual,
        "insurance_annual": insurance_annual,
        "hoa_monthly": deal.hoa_monthly or 0.0,
        "maintenance_percent": deal.maintenance_percent,
        "vacancy_percent": deal.vacancy_percent,
        "management_percent": deal.management_percent,
    }

    cash_flow_result = calculate_cash_flow(cash_flow_inputs)
    annual_debt_service = cash_flow_result["monthly_debt_service"] * 12
    dscr_value, dscr_interp = calculate_dscr(
        noi_annual=cash_flow_result["noi_annual"],
        annual_debt_service=annual_debt_service,
    )

    # Combine all analytics
    analytics_snapshot = {
        "cash_flow": cash_flow_result,
        "dscr": {"dscr": dscr_value, "interpretation": dscr_interp},
        "deal_analysis": analysis_result,
    }

    return analytics_snapshot


@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(
    deal_data: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DealResponse:
    """Create a new deal and calculate analytics."""
    # Validate property ownership if property_id is provided
    if deal_data.property_id:
        property_obj = db.query(Property).filter(Property.id == deal_data.property_id).first()
        if not property_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )
        if current_user.role != UserRole.ADMIN and property_obj.owner_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Property does not belong to you",
            )

    # Get assumptions (use provided or defaults)
    assumptions = deal_data.assumptions or get_assumptions()

    # Create deal
    deal_dict = deal_data.model_dump(exclude={"assumptions"})
    db_deal = Deal(
        user_id=current_user.id,
        **deal_dict,
    )

    # Calculate and store analytics
    analytics_snapshot = _calculate_deal_analytics(db_deal, assumptions)
    db_deal.snapshot_of_analytics_result = analytics_snapshot
    db_deal.snapshot_of_assumptions = assumptions.model_dump()

    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return DealResponse.model_validate(db_deal)


@router.get("", response_model=List[DealResponse])
def list_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[DealResponse]:
    """List deals for current user (or all if admin)."""
    query = db.query(Deal)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Deal.user_id == current_user.id)
    deals = query.offset(skip).limit(limit).all()
    return [DealResponse.model_validate(deal) for deal in deals]


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DealResponse:
    """Get a deal by ID."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and deal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return DealResponse.model_validate(deal)


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    deal_data: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DealResponse:
    """Update a deal and recalculate analytics."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and deal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Validate property ownership if property_id is being updated
    if deal_data.property_id is not None and deal_data.property_id != deal.property_id:
        property_obj = db.query(Property).filter(Property.id == deal_data.property_id).first()
        if not property_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )
        if current_user.role != UserRole.ADMIN and property_obj.owner_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Property does not belong to you",
            )

    # Update fields
    update_data = deal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deal, field, value)

    # Validate down payment if purchase_price or down_payment changed
    if "purchase_price" in update_data or "down_payment" in update_data:
        if deal.down_payment >= deal.purchase_price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Down payment must be less than purchase price",
            )

    # Recalculate analytics
    assumptions = Assumptions(**deal.snapshot_of_assumptions) if deal.snapshot_of_assumptions else get_assumptions()
    analytics_snapshot = _calculate_deal_analytics(deal, assumptions)
    deal.snapshot_of_analytics_result = analytics_snapshot

    db.commit()
    db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.post("/{deal_id}/recalculate", response_model=DealResponse)
def recalculate_deal_analytics(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DealResponse:
    """Recalculate deal analytics using latest assumptions."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and deal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Use latest assumptions
    assumptions = get_assumptions()
    analytics_snapshot = _calculate_deal_analytics(deal, assumptions)
    deal.snapshot_of_analytics_result = analytics_snapshot
    deal.snapshot_of_assumptions = assumptions.model_dump()

    db.commit()
    db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """Delete a deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and deal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    db.delete(deal)
    db.commit()

