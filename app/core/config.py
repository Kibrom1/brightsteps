"""Application configuration."""
from __future__ import annotations

import os
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database
    # For development, you can use SQLite: "sqlite:///./brightsteps.db"
    # For production, use PostgreSQL: "postgresql://user:pass@localhost:5432/brightsteps"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./brightsteps.db",  # Using SQLite for easy development
    )

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    PROJECT_NAME: str = "BrightSteps Real Estate Platform"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

