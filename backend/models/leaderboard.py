from datetime import datetime

from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    id: str
    rank: int | None = None
    lifter: str
    team: str
    event: str
    division: str
    age: float | None = None
    bodyweight: float | None = None
    category: str
    squat: float | None = None
    bench: float | None = None
    deadlift: float | None = None
    total: float | None = None
    dots: float | None = None
    source_row: int


class LeaderboardResponse(BaseModel):
    source_url: str
    synced_at: datetime
    entries: list[LeaderboardEntry]
    total_entries: int
