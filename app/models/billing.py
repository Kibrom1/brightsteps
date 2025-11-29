"""Billing and Subscription models."""
from __future__ import annotations

from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Integer, String, Float, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.db.base import Base

class PlanInterval(str, enum.Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"

class Plan(Base):
    """Subscription plan model."""
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) # e.g. "Pro", "Enterprise"
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    interval = Column(Enum(PlanInterval), default=PlanInterval.MONTHLY, nullable=False)
    features = Column(JSON, nullable=True) # List of features included
    stripe_price_id = Column(String, nullable=True) # For future integration
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class Subscription(Base):
    """User subscription model."""
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    current_period_end = Column(DateTime, nullable=True)
    stripe_subscription_id = Column(String, nullable=True) # For future integration
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="subscription")
    plan = relationship("Plan")

