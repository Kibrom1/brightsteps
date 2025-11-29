"""User management routes."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_admin
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.audit import log_action

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Get current user's profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Update current user's profile and preferences."""
    # Update allowed fields
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Don't allow role changes via this endpoint (use admin endpoint)
    if "role" in update_data:
        del update_data["role"]
    
    # Don't allow email changes via this endpoint (separate flow)
    if "email" in update_data:
        del update_data["email"]
    
    # Handle preferences separately (convert Pydantic model to dict for JSON storage)
    if "preferences" in update_data:
        preferences_dict = update_data.pop("preferences")
        if preferences_dict is not None:
            # Convert Pydantic model to dict
            if hasattr(preferences_dict, "model_dump"):
                preferences_dict = preferences_dict.model_dump()
            current_user.preferences = preferences_dict
        else:
            current_user.preferences = None
    
    # Update other fields
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    log_action(
        db=db,
        action="user_profile_update",
        user_id=current_user.id,
        resource_type="user",
        resource_id=str(current_user.id),
        request=request
    )
    
    return UserResponse.model_validate(current_user)


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> List[UserResponse]:
    """List all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(user) for user in users]
