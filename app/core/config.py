"""Application configuration."""
from __future__ import annotations

import os
import secrets
from typing import Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database
    # For development, you can use SQLite: "sqlite:///./brightsteps.db"
    # For production, use PostgreSQL: "postgresql://user:pass@localhost:5432/brightsteps"
    DATABASE_URL: str = Field(
        default=os.getenv("DATABASE_URL", "sqlite:///./brightsteps.db"),
        description="Database connection URL"
    )

    # App - Check DEBUG first so we can use it in validators
    DEBUG: bool = Field(
        default=os.getenv("DEBUG", "False").lower() == "true",
        description="Debug mode (disable in production)"
    )

    # JWT
    SECRET_KEY: str = Field(
        default="",
        description="Secret key for JWT tokens (minimum 32 characters)"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1, description="Token expiration in minutes")
    PROJECT_NAME: str = Field(
        default="BrightSteps Real Estate Platform",
        description="Application name"
    )

    # CORS
    CORS_ORIGINS: str = Field(
        default=os.getenv("CORS_ORIGINS", ""),
        description="Comma-separated list of allowed CORS origins"
    )

    @model_validator(mode="after")
    def validate_secret_key(self):
        """Validate or generate secret key."""
        # Use self.DEBUG (the validated field value) to determine production mode
        # self.DEBUG=False means production (require SECRET_KEY)
        # self.DEBUG=True means development (auto-generate SECRET_KEY)
        # Note: When DEBUG env var is unset, self.DEBUG defaults to False (production mode)
        is_production = not self.DEBUG
        
        if not self.SECRET_KEY:
            if is_production:
                raise ValueError(
                    "SECRET_KEY must be set in production. "
                    "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
                )
            else:
                # Generate a random key for development
                self.SECRET_KEY = secrets.token_urlsafe(32)
        
        if len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return self

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


settings = Settings()

