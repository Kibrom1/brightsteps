"""Billing routes."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.db.base import get_db
from app.models.billing import Plan, Subscription, SubscriptionStatus
from app.models.user import User
from app.schemas.billing import PlanResponse, SubscriptionResponse, SubscriptionCreate

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

@router.get("/plans", response_model=List[PlanResponse])
def list_plans(
    db: Session = Depends(get_db),
) -> List[PlanResponse]:
    """List available subscription plans."""
    plans = db.query(Plan).all()
    return [PlanResponse.model_validate(plan) for plan in plans]

@router.get("/subscription", response_model=SubscriptionResponse)
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> SubscriptionResponse:
    """Get current user's subscription."""
    if not current_user.subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    # Ensure plan is loaded
    if not current_user.subscription.plan:
         current_user.subscription.plan = db.query(Plan).get(current_user.subscription.plan_id)
         
    return SubscriptionResponse.model_validate(current_user.subscription)

@router.post("/subscription", response_model=SubscriptionResponse)
def subscribe_to_plan(
    sub_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> SubscriptionResponse:
    """Subscribe to a plan (stub implementation)."""
    plan = db.query(Plan).filter(Plan.id == sub_in.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check if already subscribed
    if current_user.subscription:
        # For now, just update the plan
        current_user.subscription.plan_id = plan.id
        current_user.subscription.status = SubscriptionStatus.ACTIVE
        # Reset period end etc if we were doing real billing
        db.commit()
        db.refresh(current_user.subscription)
        return SubscriptionResponse.model_validate(current_user.subscription)
    
    # Create new subscription
    sub = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE,
        # current_period_end=datetime.utcnow() + timedelta(days=30)
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Load plan for response
    sub.plan = plan
    
    return SubscriptionResponse.model_validate(sub)

# Admin Routes for Billing (Managing Plans) could go here or in admin router
# For now, I'll add a seed endpoint to creating default plans if they don't exist
@router.post("/seed-plans", status_code=201)
def seed_plans(
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_admin), # Protect this
):
    """Seed default plans."""
    if db.query(Plan).count() > 0:
        return {"message": "Plans already seeded"}
    
    plans = [
        Plan(name="Free", price=0.0, features=["Basic Analytics", "10 Leads/mo"]),
        Plan(name="Pro", price=29.0, features=["Advanced Analytics", "Unlimited Leads", "AI Property Desc"]),
        Plan(name="Enterprise", price=99.0, features=["Everything in Pro", "API Access", "Priority Support"]),
    ]
    
    db.add_all(plans)
    db.commit()
    return {"message": "Plans seeded successfully"}

