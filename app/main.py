"""FastAPI application entrypoint for the analytics engine."""
from __future__ import annotations

from fastapi import FastAPI

from app.api.routes_analytics import router as analytics_router

app = FastAPI(title="Real Estate Analytics Engine", version="1.0.0")

app.include_router(analytics_router)


@app.get("/health", tags=["health"])
def health_check() -> dict:
    """Simple health check endpoint."""

    return {"status": "ok"}
