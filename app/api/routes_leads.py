"""Lead management routes."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_admin
from app.db.base import get_db
from app.models.lead import Lead, LeadActivity, LeadStatus
from app.models.user import User, UserRole
from app.schemas.lead import (
    LeadActivityCreate,
    LeadActivityResponse,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
)

router = APIRouter(prefix="/api/v1/leads", tags=["leads"])


@router.get("", response_model=List[LeadResponse])
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: List[LeadStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[LeadResponse]:
    """List leads."""
    query = db.query(Lead)
    
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Lead.owner_id == current_user.id)
        
    if status_filter:
        query = query.filter(Lead.status.in_(status_filter))
        
    leads = query.offset(skip).limit(limit).all()
    return [LeadResponse.model_validate(lead) for lead in leads]


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LeadResponse:
    """Create a new lead."""
    db_lead = Lead(
        **lead_data.model_dump(),
        owner_id=current_user.id,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return LeadResponse.model_validate(db_lead)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LeadResponse:
    """Get lead details."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )
    
    if current_user.role != UserRole.ADMIN and lead.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    return LeadResponse.model_validate(lead)


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LeadResponse:
    """Update a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )
    
    if current_user.role != UserRole.ADMIN and lead.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    update_data = lead_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
        
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )
    
    if current_user.role != UserRole.ADMIN and lead.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    db.delete(lead)
    db.commit()


@router.post("/{lead_id}/activities", response_model=LeadActivityResponse, status_code=status.HTTP_201_CREATED)
def create_lead_activity(
    lead_id: int,
    activity_data: LeadActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LeadActivityResponse:
    """Add an activity to a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )
    
    if current_user.role != UserRole.ADMIN and lead.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    db_activity = LeadActivity(
        **activity_data.model_dump(),
        lead_id=lead_id,
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return LeadActivityResponse.model_validate(db_activity)


