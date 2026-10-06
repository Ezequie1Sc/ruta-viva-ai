from enum import Enum

from pydantic import BaseModel, Field


class AdventureType(str, Enum):
    NATURE = "nature"
    CULTURE = "culture"
    WALK = "walk"
    SURPRISE = "surprise"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class AdventureRequest(BaseModel):
    duration: int = Field(..., ge=15, le=120)
    adventure_type: AdventureType
    difficulty: Difficulty


class Mission(BaseModel):
    title: str
    description: str
    xp: int = Field(..., ge=1)


class Adventure(BaseModel):
    title: str
    description: str
    duration: int
    missions: list[Mission]
    total_xp: int