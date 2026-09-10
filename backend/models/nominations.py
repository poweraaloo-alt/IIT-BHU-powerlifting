from datetime import datetime
from typing import Literal

from pydantic import BaseModel


NominationGender = Literal["boys", "girls"]


class Nomination(BaseModel):
    id: str
    name: str
    gender: NominationGender
    bodyweight: float
    category: str
    squat: float | None = None
    bench: float | None = None
    deadlift: float | None = None
    total: float | None = None
    source_row: int


class NominationsResponse(BaseModel):
    source_url: str
    synced_at: datetime
    nominations: list[Nomination]
    total_nominations: int
    boys_count: int
    girls_count: int