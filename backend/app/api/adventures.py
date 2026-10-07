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
You are the AI Game Master for Ruta Viva AI.

Create an outdoor adventure that encourages the player
to leave their screen and explore their real-world surroundings.

Adventure configuration:
- Duration: {request.duration} minutes
- Type: {request.adventure_type.value}
- Difficulty: {request.difficulty.value}

LANGUAGE:
- Write ALL content in Spanish.
- The title, description, mission titles and mission descriptions
  must be written in natural, clear Spanish.

OUTPUT:
Return ONLY valid JSON.
Do not use Markdown.
Do not use code fences.
Do not include explanations before or after the JSON.

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
  "total_xp": 75
}}

RULES:
- Create between 3 and 5 missions.
- Every mission must involve physical exploration.
- Missions must be possible during a normal outdoor walk.
- Missions must be safe for the player.
- Never ask the player to enter private property.
- Never ask the player to cross a dangerous road.
- Never ask the player to approach dangerous animals.
- Never ask the player to touch unknown substances or objects.
- Never require spending money.
- Never require special equipment.
- Do not instruct the player to damage, remove or disturb plants,
  animals, buildings or public property.
- Prefer observation, walking, discovering, photographing
  and identifying things around the player.
- Keep mission descriptions short and actionable.
- XP must be an integer.
- total_xp MUST equal the sum of the XP of all missions.
- The duration field MUST be exactly {request.duration}.
"""

    try:
        result = await ai_service.generate_adventure(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI provider error: {exc}",
        ) from exc

    try:
        cleaned_result = result.strip()

        if cleaned_result.startswith("`"):
            cleaned_result = cleaned_result.replace("`json", "", 1)
            cleaned_result = cleaned_result.replace("`", "", 1)
            cleaned_result = cleaned_result.strip()

        adventure_data = json.loads(cleaned_result)

        adventure = Adventure.model_validate(adventure_data)

        calculated_xp = sum(
            mission.xp for mission in adventure.missions
        )

        if calculated_xp != adventure.total_xp:
            raise ValueError("total_xp does not match mission XP")

        if not 3 <= len(adventure.missions) <= 5:
            raise ValueError("Adventure must contain between 3 and 5 missions")

    except (json.JSONDecodeError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned an invalid adventure format",
                "ai_response": result,
                "error": str(exc),
            },
        ) from exc

    return adventure
