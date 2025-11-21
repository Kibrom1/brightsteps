"""Deal database model."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Deal(Base):
    """Deal model."""

    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True, index=True)

    # Deal financials
    purchase_price = Column(Float, nullable=False)
    down_payment = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    loan_term_years = Column(Integer, nullable=False)
    monthly_rent = Column(Float, nullable=False)
    property_tax_annual = Column(Float, nullable=True)
    insurance_annual = Column(Float, nullable=True)
    hoa_monthly = Column(Float, nullable=True)

    # Assumptions
    maintenance_percent = Column(Float, nullable=False)
    vacancy_percent = Column(Float, nullable=False)
    management_percent = Column(Float, nullable=False)

    # Metadata
    notes = Column(Text, nullable=True)
    snapshot_of_assumptions = Column(JSON, nullable=True)
    snapshot_of_analytics_result = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="deals")
    property = relationship("Property", back_populates="deals")

