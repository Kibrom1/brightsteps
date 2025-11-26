"""User Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserPreferences(BaseModel):
    """User preferences schema."""
    
    notification_email_enabled: bool = True
    notification_summary_enabled: bool = True
    default_vacancy_percent: Optional[float] = None
    default_maintenance_percent: Optional[float] = None
    default_management_percent: Optional[float] = None


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.INVESTOR


class UserCreate(UserBase):
    """Schema for creating a user."""

    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[UserRole] = None
    preferences: Optional[UserPreferences] = None


class UserResponse(UserBase):
    """Schema for user response."""

    id: int
    preferences: Optional[UserPreferences] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('preferences', mode='before')
    @classmethod
    def convert_preferences(cls, v):
        """Convert preferences dict to UserPreferences model if needed.
        
        This validator is called after Pydantic extracts the value from the SQLAlchemy
        model (using from_attributes), so v will be a dict, not the SQLAlchemy instance.
        This avoids mutating the original database object.
        """
        if v is not None and isinstance(v, dict):
            return UserPreferences.model_validate(v)
        return v

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token data."""

    user_id: Optional[int] = None
    email: Optional[str] = None

