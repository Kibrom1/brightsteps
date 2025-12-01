"""FastAPI application entrypoint for the real estate platform."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

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

# Security: Add security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if not settings.DEBUG:
            # Only add HSTS in production
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

if not settings.DEBUG:
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Trusted host middleware for production
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["brightsteps.com", "*.brightsteps.com", "localhost", "127.0.0.1"]
    )

# Configure CORS
# Allow all origins in development for easier debugging
# In production, specify exact origins
if settings.DEBUG:
    cors_origins = [
        "http://localhost:5173",  # Vite default port (primary)
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # Keep for compatibility
        "http://127.0.0.1:3000",
        "http://10.0.0.184:3000", # Network address
    ]
else:
    # Production: Use environment variable or default to empty list
    import os
    cors_origins_env = os.getenv("CORS_ORIGINS", "")
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Never use "*" with allow_credentials=True
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
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
    """Health check endpoint for monitoring and load balancers."""
    from app.db.base import SessionLocal
    from sqlalchemy import text
    
    # Check database connectivity
    db_status = "ok"
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
    finally:
        # Always close the database session, even if an exception occurred
        db.close()
    
    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": "2.0.0",
        "database": db_status,
        "debug": settings.DEBUG,
    }
