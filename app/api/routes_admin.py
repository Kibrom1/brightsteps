"""Admin-only routes."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.base import get_db
from app.models.deal import Deal
from app.models.property import Property
from app.schemas.deal import DealResponse
from app.schemas.property import PropertyResponse

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/deals", response_model=List[DealResponse])
def list_all_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> List[DealResponse]:
    """List all deals (admin only)."""
    deals = db.query(Deal).offset(skip).limit(limit).all()
    return [DealResponse.model_validate(deal) for deal in deals]


@router.get("/properties", response_model=List[PropertyResponse])
def list_all_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> List[PropertyResponse]:
    """List all properties (admin only)."""
    properties = db.query(Property).offset(skip).limit(limit).all()
    return [PropertyResponse.model_validate(prop) for prop in properties]

