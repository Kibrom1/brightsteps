"""Audit logging utility."""
from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.admin import AuditLog
from app.models.user import User

def log_action(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """
    Create an audit log entry.
    
    Args:
        db: Database session
        action: Name of the action (e.g., "login", "create_deal")
        user_id: ID of the user performing the action
        resource_type: Type of resource affected (e.g., "deal", "user")
        resource_id: ID of the resource affected
        details: Additional details as a dictionary
        request: FastAPI request object to extract IP address
    """
    ip_address = None
    if request:
        ip_address = request.client.host if request.client else None
        
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        details=details,
        ip_address=ip_address
    )
    
    db.add(log_entry)
    db.commit()
    
    return log_entry

