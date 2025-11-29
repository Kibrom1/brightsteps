"""AI Tools API routes."""
from __future__ import annotations

import os
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.ai import PropertyDescriptionRequest, PropertyDescriptionResponse

import openai

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# Initialize OpenAI client
# In production, use environment variable: os.getenv("OPENAI_API_KEY")
# For this demo, we'll handle the missing key gracefully
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    openai.api_key = openai_api_key

@router.post("/generate-description", response_model=PropertyDescriptionResponse)
def generate_property_description(
    request: PropertyDescriptionRequest,
    current_user: User = Depends(get_current_active_user),
) -> PropertyDescriptionResponse:
    """
    Generate a creative property description using OpenAI (or stub if no key).
    """
    
    # Fallback if no API key is configured
    if not openai_api_key:
        # Stub implementation (Phase 6 original)
        features_text = ", ".join(request.features) if request.features else "standard features"
        
        adjectives = {
            "professional": "Inviting and well-maintained",
            "luxury": "Stunning and sophisticated",
            "cozy": "Charming and intimate",
            "urgent": "Incredible opportunity",
        }
        
        adj = adjectives.get(request.tone, "Beautiful")
        
        description = (
            f"{adj} {request.property_type.value.replace('_', ' ')} located at {request.address or 'a prime location'}. "
            f"This spacious {request.square_feet} sqft home features {request.bedrooms} bedrooms and "
            f"{request.bathrooms} bathrooms. Highlights include {features_text}. "
            "Don't miss out on this potential-filled investment!"
        )
        return PropertyDescriptionResponse(description=description)

    # Real AI Implementation (Phase 8)
    try:
        prompt = f"""Generate a compelling property listing description for:
    
Property Type: {request.property_type}
Bedrooms: {request.bedrooms}
Bathrooms: {request.bathrooms}
Square Feet: {request.square_feet}
Features: {', '.join(request.features)}
Address: {request.address or 'N/A'}

Tone: {request.tone}

Requirements:
- Highlight key selling points
- Use professional real estate language
- Include emotional appeal
- Mention potential for investment if relevant
- Be concise (150-200 words)
"""
        
        # Use new OpenAI client format (v1.0+)
        client = openai.OpenAI(api_key=openai_api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Cost effective model
            messages=[
                {"role": "system", "content": "You are a professional real estate copywriter."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        description = response.choices[0].message.content.strip()
        return PropertyDescriptionResponse(description=description)

    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")
