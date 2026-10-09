import json
import random
from pathlib import Path

from app.models.adventure import AdventureRequest


CATALOG_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "adventures.json"
)


def load_catalog() -> list[dict]:
    with CATALOG_PATH.open("r", encoding="utf-8") as file:
        catalog = json.load(file)

    if not isinstance(catalog, list) or not catalog:
        raise ValueError("El catálogo debe ser una lista no vacía")

    return catalog


def get_candidates(
    catalog: list[dict],
    request: AdventureRequest,
) -> list[dict]:
    candidates = [
        adventure
        for adventure in catalog
        if (
            request.adventure_type.value == "surprise"
            or adventure["adventure_type"]
            == request.adventure_type.value
        )
    ]

    matching_difficulty = [
        adventure
        for adventure in candidates
        if adventure["difficulty"] == request.difficulty.value
    ]

    if matching_difficulty:
        candidates = matching_difficulty

    return candidates or catalog


def choose_fallback(candidates: list[dict]) -> dict:
    return random.choice(candidates)