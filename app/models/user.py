"""User database model."""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, JSON, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""

    INVESTOR = "investor"
    REALTOR = "realtor"
    ADMIN = "admin"


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.INVESTOR, nullable=False)
    preferences = Column(JSON, nullable=True)  # User preferences stored as JSON
    
    # Phase 2: Authentication Enhancements
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    stripe_customer_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="user", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="owner", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
