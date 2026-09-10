from datetime import datetime

from pydantic import BaseModel


class LiveScoreRow(BaseModel):
    id: str
    values: dict[str, str]
    source_row: int


class LiveScoreResponse(BaseModel):
    source_url: str
    synced_at: datetime
    headers: list[str]
    rows: list[LiveScoreRow]
    total_rows: int