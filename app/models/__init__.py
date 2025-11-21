"""Database models package."""
from __future__ import annotations

from app.models.deal import Deal
from app.models.property import Property, PropertyType
from app.models.user import User, UserRole

__all__ = ["User", "UserRole", "Property", "PropertyType", "Deal"]

