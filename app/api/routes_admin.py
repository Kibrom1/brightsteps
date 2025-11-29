"""Admin-only routes."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import require_admin
from app.db.base import get_db
from app.models.user import User
from app.models.deal import Deal
from app.models.property import Property
from app.models.lead import Lead
from app.models.admin import AuditLog, FeatureFlag
from app.models.billing import Subscription, SubscriptionStatus

from app.schemas.deal import DealResponse
from app.schemas.property import PropertyResponse
from app.schemas.user import UserResponse
from app.schemas.admin import (
    AuditLogResponse, 
    FeatureFlagResponse, 
    FeatureFlagCreate, 
    FeatureFlagUpdate,
    SystemStats
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/stats", response_model=SystemStats)
def get_system_stats(
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> SystemStats:
    """Get system-wide statistics."""
    total_users = db.query(func.count(User.id)).scalar()
    total_properties = db.query(func.count(Property.id)).scalar()
    total_deals = db.query(func.count(Deal.id)).scalar()
    total_leads = db.query(func.count(Lead.id)).scalar()
    active_subscriptions = db.query(func.count(Subscription.id)).filter(
        Subscription.status == SubscriptionStatus.ACTIVE
    ).scalar() or 0

    return SystemStats(
        total_users=total_users,
        total_properties=total_properties,
        total_deals=total_deals,
        total_leads=total_leads,
        active_subscriptions=active_subscriptions
    )

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> List[UserResponse]:
    """List all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(user) for user in users]

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> List[AuditLogResponse]:
    """List audit logs (admin only)."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [AuditLogResponse.model_validate(log) for log in logs]

@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
def list_feature_flags(
    db: Session = Depends(get_db),
    # admin_user = Depends(require_admin), # Allow public read? No, maybe authenticated.
    # For now, admin only or authenticated. Let's keep it admin only for management, 
    # maybe a public endpoint for checking.
    admin_user = Depends(require_admin),
) -> List[FeatureFlagResponse]:
    """List all feature flags."""
    flags = db.query(FeatureFlag).all()
    return [FeatureFlagResponse.model_validate(flag) for flag in flags]

@router.post("/feature-flags", response_model=FeatureFlagResponse)
def create_feature_flag(
    flag_in: FeatureFlagCreate,
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> FeatureFlagResponse:
    """Create a new feature flag."""
    existing = db.query(FeatureFlag).filter(FeatureFlag.name == flag_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feature flag with this name already exists")
    
    flag = FeatureFlag(**flag_in.model_dump())
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return FeatureFlagResponse.model_validate(flag)

@router.put("/feature-flags/{flag_id}", response_model=FeatureFlagResponse)
def update_feature_flag(
    flag_id: int,
    flag_in: FeatureFlagUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(require_admin),
) -> FeatureFlagResponse:
    """Update a feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    update_data = flag_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flag, field, value)
    
    db.commit()
    db.refresh(flag)
    return FeatureFlagResponse.model_validate(flag)

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
