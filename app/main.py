"""FastAPI application entrypoint for the real estate platform."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_admin import router as admin_router
from app.api.routes_ai import router as ai_router
from app.api.routes_analytics import router as analytics_router
from app.api.routes_auth import router as auth_router
from app.api.routes_billing import router as billing_router
from app.api.routes_deals import router as deals_router
from app.api.routes_leads import router as leads_router
from app.api.routes_properties import router as properties_router
from app.api.routes_users import router as users_router
from app.core.config import settings
from app.db.base import init_db

from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="Real Estate Investment Platform - Backend API with Analytics Engine",
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
def startup_event():
    init_db()

# Configure CORS
# Allow all origins in development for easier debugging
# In production, specify exact origins
cors_origins = [
    "http://localhost:5173",  # Vite default port (primary)
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Keep for compatibility
    "http://127.0.0.1:3000",
]

# Add wildcard for development if needed
if settings.DEBUG:
    cors_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(properties_router)
app.include_router(deals_router)
app.include_router(admin_router)
app.include_router(analytics_router)  # Phase 1 analytics endpoints (still available)
app.include_router(leads_router)
app.include_router(ai_router)
app.include_router(billing_router)


@app.get("/health", tags=["health"])
def health_check() -> dict:
    """Simple health check endpoint."""
    return {"status": "ok", "version": "2.0.0"}
