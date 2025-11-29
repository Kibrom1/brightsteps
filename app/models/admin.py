"""Admin and System models."""
from __future__ import annotations

from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Integer, String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base

class AuditLog(Base):
    """Audit log model for tracking user activity."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False) # e.g. "create_deal", "login", "update_user"
    resource_type = Column(String, nullable=True) # e.g. "deal", "user"
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True) # Extra data about the event
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")


class FeatureFlag(Base):
    """Feature flag model for toggling system features."""
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_enabled = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

