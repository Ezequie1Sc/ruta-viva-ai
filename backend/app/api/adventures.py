from fastapi import APIRouter, HTTPException

from app.models.adventure import Adventure, AdventureRequest
from app.services.ai_service import ai_service

router = APIRouter(
    prefix="/api/adventures",
    tags=["Adventures"],
)


@router.post("/generate", response_model=Adventure)
async def generate_adventure(request: AdventureRequest) -> Adventure:
    prompt = f"""
Create an outdoor adventure for Ruta Viva AI.

Duration: {request.duration} minutes
Adventure type: {request.adventure_type.value}
Difficulty: {request.difficulty.value}

Return ONLY valid JSON with this structure:

{{
  "title": "string",
  "description": "string",
  "duration": {request.duration},
  "missions": [
    {{
      "title": "string",
      "description": "string",
      "xp": 25
    }}
  ],
  "total_xp": 100
}}

Create 3 to 5 missions.
The missions must encourage the user to physically explore
their real-world surroundings.
"""

    try:
        result = await ai_service.generate_adventure(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI provider error: {exc}",
        ) from exc

    # Temporalmente devolveremos el texto de la IA.
    # En el siguiente bloque lo convertiremos a Adventure.
    raise HTTPException(
        status_code=501,
        detail={
            "message": "AI connected, JSON parsing pending",
            "ai_response": result,
        },
    )