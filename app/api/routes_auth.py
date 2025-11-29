"""Authentication routes."""
from __future__ import annotations

from datetime import timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse
from app.core.audit import log_action

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate, 
    request: Request, 
    db: Session = Depends(get_db)
) -> UserResponse:
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        verification_token=verification_token,
        is_verified=False # Explicitly set to False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # TODO: Send verification email here (using sendgrid, mailgun, etc.)
    # For now, we'll just log it or return it in debug mode if needed
    print(f"DEBUG: Verification link for {db_user.email}: /verify-email?token={verification_token}")
    
    log_action(
        db=db,
        action="user_registered",
        user_id=db_user.id,
        resource_type="user",
        resource_id=str(db_user.id),
        details={"email": db_user.email, "role": db_user.role},
        request=request
    )
    
    return UserResponse.model_validate(db_user)


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin, 
    request: Request,
    db: Session = Depends(get_db)
) -> Token:
    """Login and receive JWT access token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        # Could log failed login attempts here if desired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires,
    )
    
    log_action(
        db=db,
        action="user_login",
        user_id=user.id,
        resource_type="user",
        resource_id=str(user.id),
        request=request
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.post("/verify-email")
def verify_email(token: str, request: Request, db: Session = Depends(get_db)):
    """Verify email with token."""
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
        )
    
    if user.is_verified:
        return {"message": "Email already verified"}
        
    user.is_verified = True
    user.verification_token = None # Clear token after use
    db.commit()
    
    log_action(
        db=db,
        action="email_verified",
        user_id=user.id,
        resource_type="user",
        resource_id=str(user.id),
        request=request
    )
    
    return {"message": "Email verified successfully"}
