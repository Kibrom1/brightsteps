"""AI generation routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.ai import PropertyDescriptionRequest, PropertyDescriptionResponse

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


def _generate_template_description(request: PropertyDescriptionRequest) -> str:
    """Simple template-based generator for MVP."""
    adjectives = {
        "professional": "excellent",
        "luxury": "stunning",
        "cozy": "charming",
        "urgent": "great value",
    }
    adj = adjectives.get(request.tone, "wonderful")
    
    desc = f"Check out this {adj} {request.property_type.replace('_', ' ')}! "
    desc += f"Featuring {request.bedrooms} bedrooms and {request.bathrooms} bathrooms, "
    desc += f"this {request.square_feet} sqft home is perfect for you. "
    
    if request.features:
        desc += f"Key highlights include: {', '.join(request.features)}. "
        
    if request.address:
        desc += f"Located at {request.address}. "
        
    desc += "Schedule a viewing today!"
    return desc


@router.post("/generate-description", response_model=PropertyDescriptionResponse)
def generate_property_description(
    request: PropertyDescriptionRequest,
    current_user: User = Depends(get_current_active_user),
) -> PropertyDescriptionResponse:
    """Generate a property description using AI (Template-based for MVP)."""
    # In a real implementation, this would call OpenAI/Anthropic API
    description = _generate_template_description(request)
    return PropertyDescriptionResponse(description=description)


