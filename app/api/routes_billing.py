"""Billing routes with Stripe integration."""
from __future__ import annotations

import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.db.base import get_db
from app.models.billing import Plan, Subscription, SubscriptionStatus
from app.models.user import User
from app.schemas.billing import PlanResponse, SubscriptionResponse, SubscriptionCreate

import stripe

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

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

@router.post("/create-checkout-session")
def create_checkout_session(
    sub_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a Stripe Checkout session for subscription."""
    plan = db.query(Plan).filter(Plan.id == sub_in.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Fallback for development/demo if no Stripe ID OR if using placeholder key
    if not plan.stripe_price_id or stripe.api_key == "sk_test_placeholder":
        # This simulates a successful subscription for testing without Stripe
        return {
            "url": f"{FRONTEND_URL}/billing?success=true&plan_id={plan.id}&session_id=mock_session"
        }

    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email if not current_user.stripe_customer_id else None,
            customer=current_user.stripe_customer_id,
            line_items=[
                {
                    'price': plan.stripe_price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=FRONTEND_URL + '/billing?success=true&session_id={CHECKOUT_SESSION_ID}',
            cancel_url=FRONTEND_URL + '/billing?canceled=true',
            metadata={
                "user_id": current_user.id,
                "plan_id": plan.id
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session_completed(session, db)
        
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription, db)
        
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_deleted(subscription, db)

    return {"status": "success"}

def handle_checkout_session_completed(session, db: Session):
    """Fulfill the purchase."""
    user_id = session.get("metadata", {}).get("user_id")
    plan_id = session.get("metadata", {}).get("plan_id")
    stripe_customer_id = session.get("customer")
    stripe_subscription_id = session.get("subscription")
    
    if user_id and plan_id:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user:
            # Update user stripe id
            user.stripe_customer_id = stripe_customer_id
            
            # Update/Create subscription
            sub = user.subscription
            if not sub:
                sub = Subscription(user_id=user.id)
                db.add(sub)
            
            sub.plan_id = int(plan_id)
            sub.stripe_subscription_id = stripe_subscription_id
            sub.status = SubscriptionStatus.ACTIVE
            
            db.commit()

def handle_subscription_updated(stripe_sub, db: Session):
    """Update subscription status."""
    sub = db.query(Subscription).filter(Subscription.stripe_subscription_id == stripe_sub["id"]).first()
    if sub:
        sub.status = SubscriptionStatus(stripe_sub["status"])
        # sub.current_period_end = datetime.fromtimestamp(stripe_sub["current_period_end"])
        db.commit()

def handle_subscription_deleted(stripe_sub, db: Session):
    """Handle cancellation."""
    sub = db.query(Subscription).filter(Subscription.stripe_subscription_id == stripe_sub["id"]).first()
    if sub:
        sub.status = SubscriptionStatus.CANCELED
        db.commit()

# Admin Routes for Billing (Managing Plans)
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
        Plan(name="Pro", price=29.0, features=["Advanced Analytics", "Unlimited Leads", "AI Property Desc"], stripe_price_id="price_H5ggYJDqQ8"),
        Plan(name="Enterprise", price=99.0, features=["Everything in Pro", "API Access", "Priority Support"], stripe_price_id="price_H5ggYJDqQ9"),
    ]
    
    db.add_all(plans)
    db.commit()
    return {"message": "Plans seeded successfully"}
