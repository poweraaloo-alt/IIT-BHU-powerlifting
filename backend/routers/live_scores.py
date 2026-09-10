import csv
import io
import os
import re
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from models.live_scores import LiveScoreResponse, LiveScoreRow


router = APIRouter()
SHEET_URL = os.environ.get("LIVE_SCORE_SHEET_URL", "")


def _normalise(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _find_lifter_column(headers: list[str]) -> str | None:
    aliases = {"name", "lifter", "athlete", "fullname", "liftername"}
    normalised = {header: _normalise(header) for header in headers}
    for header, value in normalised.items():
        if value in aliases:
            return header
    for header, value in normalised.items():
        if any(alias in value for alias in aliases if len(alias) > 2):
            return header
    return None


def _csv_url(sheet_url: str) -> str:
    match = re.search(r"/spreadsheets/d/([^/]+)", sheet_url)
    if not match:
        raise ValueError("Invalid Google Sheets URL")
    spreadsheet_id = match.group(1)
    gid_match = re.search(r"(?:[?&])gid=(\d+)", sheet_url)
    suffix = f"&gid={gid_match.group(1)}" if gid_match else ""
    return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv{suffix}"


async def _fetch_live_scores() -> tuple[list[str], list[LiveScoreRow]]:
    if not SHEET_URL:
        raise HTTPException(status_code=503, detail="Live score sheet URL is not configured")
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            response = await client.get(_csv_url(SHEET_URL), headers={"User-Agent": "IIT BHU Live Score Board/1.0"})
            response.raise_for_status()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="The live score data could not be read") from exc

    reader = csv.DictReader(io.StringIO(response.content.decode("utf-8-sig")))
    headers = [header for header in (reader.fieldnames or []) if header]
    if not headers:
        raise HTTPException(status_code=502, detail="The live score sheet has no header row")
    lifter_column = _find_lifter_column(headers)
    if not lifter_column:
        raise HTTPException(status_code=502, detail="The live score sheet needs a name or lifter column")

    rows: list[LiveScoreRow] = []
    for source_row, row in enumerate(reader, start=2):
        values = {header: (row.get(header) or "").strip() for header in headers}
        if not values[lifter_column]:
            continue
        rows.append(LiveScoreRow(id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{SHEET_URL}:{source_row}:{values[lifter_column]}")), values=values, source_row=source_row))
    return headers, rows


@router.get("/live-scores", response_model=LiveScoreResponse)
async def get_live_scores() -> LiveScoreResponse:
    headers, rows = await _fetch_live_scores()
    return LiveScoreResponse(source_url=SHEET_URL, synced_at=datetime.now(timezone.utc), headers=headers, rows=rows, total_rows=len(rows))