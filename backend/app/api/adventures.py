import json

from fastapi import APIRouter, HTTPException

from app.models.adventure import Adventure, AdventureRequest
from app.services.ai_service import ai_service
from app.services.catalog_service import (
    choose_fallback,
    get_candidates,
    load_catalog,
)

router = APIRouter(
    prefix="/api/adventures",
    tags=["Adventures"],
)


@router.post("/generate", response_model=Adventure)
async def generate_adventure(
    request: AdventureRequest,
) -> Adventure:
    try:
        catalog = load_catalog()
        candidates = get_candidates(catalog, request)
    except (OSError, ValueError, json.JSONDecodeError, KeyError) as exc:
        raise HTTPException(
            status_code=500,
            detail="No se pudo cargar el catálogo de aventuras",
        ) from exc

    selected = None

    prompt = json.dumps(
        {
            "preferencias": {
                "duracion_minutos": request.duration,
                "tipo": request.adventure_type.value,
                "dificultad": request.difficulty.value,
            },
            "candidatas": [
                {
                    "id": item["id"],
                    "tipo": item["adventure_type"],
                    "dificultad": item["difficulty"],
                    "titulo": item["title"],
                    "descripcion": item["description"],
                    "misiones": item["missions"],
                }
                for item in candidates
            ],
            "instruccion": (
                "Selecciona la aventura más apropiada para el usuario. "
                "Devuelve únicamente un JSON con la propiedad "
                "adventure_id y un ID existente."
            ),
        },
        ensure_ascii=False,
    )

    try:
        result = await ai_service.select_adventure(prompt)
        result = result.strip()

        if result.startswith("```"):
            result = result.removeprefix("```json").removeprefix("```")
            result = result.removesuffix("```").strip()

        selection = json.loads(result)
        selected_id = selection["adventure_id"]

        selected = next(
            (
                item
                for item in candidates
                if item["id"] == selected_id
            ),
            None,
        )
    except Exception:
        # Timeout, error del proveedor o respuesta inválida.
        selected = None

    if selected is None:
        selected = choose_fallback(candidates)

    try:
        # Conserva el contrato de respuesta de Angular.
        adventure_data = {
            **selected,
            "duration": request.duration,
        }

        adventure = Adventure.model_validate(adventure_data)

        if not 3 <= len(adventure.missions) <= 5:
            raise ValueError("La aventura debe tener entre 3 y 5 misiones")

        calculated_xp = sum(
            mission.xp for mission in adventure.missions
        )

        if calculated_xp != adventure.total_xp:
            raise ValueError("El total de XP no coincide con las misiones")

        return adventure

    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=500,
            detail="La aventura del catálogo no es válida",
        ) from exc