"""Deal database model."""
from __future__ import annotations

from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, JSON, Enum
from sqlalchemy.orm import relationship

from app.db.base import Base

class DealStage(str, enum.Enum):
    INITIAL_ANALYSIS = "initial_analysis"
    UNDER_REVIEW = "under_review"
    OFFER_SUBMITTED = "offer_submitted"
    DUE_DILIGENCE = "due_diligence"
    APPROVED = "approved"
    ACTIVE = "active"
    CLOSED = "closed"
    REJECTED = "rejected"

class Deal(Base):
    """Deal model."""

    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)

    # Financial Parameters
    purchase_price = Column(Float, nullable=False)
    down_payment = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)  # In percent, e.g., 5.5
    loan_term_years = Column(Integer, nullable=False)
    
    # Income
    monthly_rent = Column(Float, nullable=False)
    
    # Expenses
    property_tax_annual = Column(Float, nullable=True)
    insurance_annual = Column(Float, nullable=True)
    hoa_monthly = Column(Float, nullable=True)
    maintenance_percent = Column(Float, default=5.0) # Percent of rent
    vacancy_percent = Column(Float, default=5.0) # Percent of rent
    management_percent = Column(Float, default=0.0) # Percent of rent

    # Meta
    notes = Column(String, nullable=True)
    stage = Column(Enum(DealStage), default=DealStage.INITIAL_ANALYSIS, nullable=False)
    
    # Snapshots (JSON)
    snapshot_of_assumptions = Column(JSON, nullable=True)
    snapshot_of_analytics_result = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="deals")
    property = relationship("Property", back_populates="deals")
