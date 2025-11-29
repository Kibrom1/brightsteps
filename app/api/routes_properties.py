"""Property management routes."""
from __future__ import annotations

import os
import shutil
from typing import List
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_admin
from app.db.base import get_db
from app.models.property import Property, PropertyImage
from app.models.user import User, UserRole
from app.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate

router = APIRouter(prefix="/api/v1/properties", tags=["properties"])

# Configure upload directory
UPLOAD_DIR = Path("static/uploads/properties")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PropertyResponse:
    """Create a new property."""
    db_property = Property(
        owner_user_id=current_user.id,
        **property_data.model_dump(),
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return PropertyResponse.model_validate(db_property)


@router.get("", response_model=List[PropertyResponse])
def list_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[PropertyResponse]:
    """List properties for current user (or all if admin)."""
    query = db.query(Property)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Property.owner_user_id == current_user.id)
    properties = query.offset(skip).limit(limit).all()
    return [PropertyResponse.model_validate(prop) for prop in properties]


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PropertyResponse:
    """Get a property by ID."""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and property_obj.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return PropertyResponse.model_validate(property_obj)


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PropertyResponse:
    """Update a property."""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and property_obj.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Update fields
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property_obj, field, value)

    db.commit()
    db.refresh(property_obj)
    return PropertyResponse.model_validate(property_obj)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """Delete a property."""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # Check ownership (unless admin)
    if current_user.role != UserRole.ADMIN and property_obj.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    db.delete(property_obj)
    db.commit()

@router.post("/{property_id}/images", status_code=status.HTTP_201_CREATED)
def upload_property_image(
    property_id: int,
    file: UploadFile = File(...),
    is_primary: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Upload an image for a property."""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
        
    # Check ownership
    if current_user.role != UserRole.ADMIN and property_obj.owner_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Generate filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"prop_{property_id}_{os.urandom(4).hex()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # Create URL (assuming served from /static)
    image_url = f"/static/uploads/properties/{filename}"
    
    # Save to DB
    image = PropertyImage(
        property_id=property_id,
        url=image_url,
        is_primary=is_primary
    )
    db.add(image)
    db.commit()
    
    return {"url": image_url, "id": image.id}
