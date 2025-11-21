"""FastAPI application entrypoint for the real estate platform."""
from __future__ import annotations

from fastapi import FastAPI

from app.api.routes_admin import router as admin_router
from app.api.routes_analytics import router as analytics_router
from app.api.routes_auth import router as auth_router
from app.api.routes_deals import router as deals_router
from app.api.routes_properties import router as properties_router
from app.api.routes_users import router as users_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="Real Estate Investment Platform - Backend API with Analytics Engine",
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(properties_router)
app.include_router(deals_router)
app.include_router(admin_router)
app.include_router(analytics_router)  # Phase 1 analytics endpoints (still available)


@app.get("/health", tags=["health"])
def health_check() -> dict:
    """Simple health check endpoint."""
    return {"status": "ok", "version": "2.0.0"}
