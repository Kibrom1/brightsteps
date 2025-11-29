"""Lead database model."""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class LeadStatus(str, enum.Enum):
    """Lead status enumeration."""

    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    LOST = "lost"
    CLOSED = "closed"


class ActivityType(str, enum.Enum):
    """Activity type enumeration."""
    
    EMAIL = "email"
    CALL = "call"
    MEETING = "meeting"
    NOTE = "note"
    OTHER = "other"


class Lead(Base):
    """Lead model."""

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW, nullable=False)
    source = Column(String, nullable=True) # e.g. "website", "referral"
    notes = Column(Text, nullable=True)
    score = Column(Integer, default=0) # 0-100
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="leads")
    activities = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")


class LeadActivity(Base):
    """Lead activity model."""

    __tablename__ = "lead_activities"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    
    activity_type = Column(Enum(ActivityType), default=ActivityType.NOTE, nullable=False)
    summary = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="activities")
