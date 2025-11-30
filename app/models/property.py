"""Property database model."""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Boolean, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


class PropertyType(str, enum.Enum):
    """Property type enumeration."""

    SINGLE_FAMILY = "single_family"
    MULTI_FAMILY = "multi_family"
    CONDO = "condo"
    TOWNHOUSE = "townhouse"
    OTHER = "other"

class PropertyStatus(str, enum.Enum):
    """Property status enumeration."""
    LEAD = "lead"
    EVALUATING = "evaluating"
    UNDER_CONTRACT = "under_contract"
    OWNED = "owned"
    FOR_SALE = "for_sale"
    SOLD = "sold"
    ARCHIVED = "archived"

class Property(Base):
    """Property model."""

    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Address
    address_line1 = Column(String, nullable=False)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, default="USA", nullable=False)

    # Property Details
    property_type = Column(Enum(PropertyType), nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)
    square_feet = Column(Integer, nullable=False)
    year_built = Column(Integer, nullable=True)
    list_price = Column(Float, nullable=True)
    tags = Column(JSON, nullable=True)

    # Geospatial (basic lat/long support for mapping)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Phase 2: Status
    status = Column(Enum(PropertyStatus), default=PropertyStatus.EVALUATING, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="properties")
    deals = relationship("Deal", back_populates="property", cascade="all, delete-orphan")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")


class PropertyImage(Base):
    """Property image model."""
    
    __tablename__ = "property_images"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    property = relationship("Property", back_populates="images")
