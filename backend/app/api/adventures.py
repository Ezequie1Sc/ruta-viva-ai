import json

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

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not include explanations.

Use exactly this structure:

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

Rules:
- Create exactly 3 missions.
- Each mission must encourage the user to physically explore
  their real-world surroundings.
- Missions must be safe and possible during a normal outdoor walk.
- Do not require entering private property.
- Do not require spending money.
- Keep descriptions short and clear.
- total_xp must equal the sum of all mission XP.
"""

    try:
        result = await ai_service.generate_adventure(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI provider error: {exc}",
        ) from exc

    try:
        # Remove possible markdown code fences if the model adds them.
        cleaned_result = result.strip()

        if cleaned_result.startswith("```"):
            cleaned_result = cleaned_result.replace("```json", "", 1)
            cleaned_result = cleaned_result.replace("```", "", 1)
            cleaned_result = cleaned_result.strip()

        adventure_data = json.loads(cleaned_result)

        adventure = Adventure.model_validate(adventure_data)

    except (json.JSONDecodeError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned an invalid adventure format",
                "ai_response": result,
            },
        ) from exc

    return adventure