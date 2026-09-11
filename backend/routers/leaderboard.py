import csv
import io
import os
import re
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from models.leaderboard import LeaderboardEntry, LeaderboardResponse


router = APIRouter()
SHEET_URL = os.environ.get("LEADERBOARD_SHEET_URL", "")
BOYS_CATEGORIES = ["53 kg", "59 kg", "66 kg", "74 kg", "83 kg", "93 kg", "105 kg", "120 kg", "120+ kg"]
GIRLS_CATEGORIES = ["43 kg", "47 kg", "52 kg", "57 kg", "63 kg", "69 kg", "76 kg", "84 kg", "84+ kg"]
HEADER_ALIASES = {
    "rank": {"rank", "position", "place"},
    "lifter": {"lifter", "name", "athlete", "fullname", "liftername"},
    "team": {"team", "college", "institution", "club"},
    "division": {"sex", "gender", "division"},
    "age": {"age", "years"},
    "bodyweight": {"weight", "bodyweight", "bw", "bodyweightkg"},
    "category": {"category", "weightcategory", "weightclass", "wtcat", "class"},
    "squat": {"squat", "sq"},
    "bench": {"bench", "bp", "benchpress"},
    "deadlift": {"deadlift", "dl"},
    "total": {"total", "tot"},
    "dots": {"dots", "dotsscore"},
}


def _normalise(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _find_column(headers: list[str], field: str) -> str | None:
    aliases = HEADER_ALIASES[field]
    normalised = {header: _normalise(header) for header in headers}
    for header, value in normalised.items():
        if value in aliases:
            return header
    for header, value in normalised.items():
        if any(alias in value for alias in aliases if len(alias) > 2):
            return header
    return None


def _number(value: str | None) -> float | None:
    if not value:
        return None
    match = re.search(r"-?\d+(?:[.,]\d+)?", value.replace(",", "."))
    return float(match.group(0)) if match else None


def _division(value: str | None) -> str:
    raw = (value or "").strip().lower()
    if raw in {"m", "male", "man", "men", "boy", "boys"} or "male" in raw or "boy" in raw:
        return "Boys"
    if raw in {"f", "female", "woman", "women", "girl", "girls"} or "female" in raw or "girl" in raw:
        return "Girls"
    return (value or "—").strip() or "—"


def _category(division: str, bodyweight: float | None, supplied: str | None) -> str:
    supplied_value = (supplied or "").strip()
    if supplied_value:
        return supplied_value
    if bodyweight is None or division not in {"Boys", "Girls"}:
        return "—"
    categories = BOYS_CATEGORIES if division == "Boys" else GIRLS_CATEGORIES
    for category in categories:
        if bodyweight <= float(category.split("+")[0].split()[0]):
            return category
    return categories[-1]


def _csv_url(sheet_url: str) -> str:
    match = re.search(r"/spreadsheets/d/([^/]+)", sheet_url)
    if not match:
        raise ValueError("Invalid Google Sheets URL")
    spreadsheet_id = match.group(1)
    gid_match = re.search(r"(?:[?&])gid=(\d+)", sheet_url)
    suffix = f"&gid={gid_match.group(1)}" if gid_match else ""
    return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv{suffix}"


async def _fetch_entries() -> list[LeaderboardEntry]:
    if not SHEET_URL:
        raise HTTPException(status_code=503, detail="Leaderboard sheet URL is not configured")
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            response = await client.get(_csv_url(SHEET_URL), headers={"User-Agent": "IIT BHU Leaderboard/1.0"})
            response.raise_for_status()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="The leaderboard data could not be read") from exc

    reader = csv.DictReader(io.StringIO(response.content.decode("utf-8-sig")))
    headers = [header for header in (reader.fieldnames or []) if header]
    if not headers:
        raise HTTPException(status_code=502, detail="The leaderboard has no header row")
    columns = {field: _find_column(headers, field) for field in HEADER_ALIASES}
    if not columns["lifter"]:
        raise HTTPException(status_code=502, detail="The leaderboard needs a lifter column")

    entries: list[LeaderboardEntry] = []
    for source_row, row in enumerate(reader, start=2):
        lifter = (row.get(columns["lifter"]) or "").strip()
        if not lifter:
            continue
        team = (row.get(columns["team"]) or "").strip() if columns["team"] else ""
        division = _division(row.get(columns["division"]) if columns["division"] else None)
        squat = _number(row.get(columns["squat"])) if columns["squat"] else None
        bench = _number(row.get(columns["bench"])) if columns["bench"] else None
        deadlift = _number(row.get(columns["deadlift"])) if columns["deadlift"] else None
        total = _number(row.get(columns["total"])) if columns["total"] else None
        if total is None and squat is not None and bench is not None and deadlift is not None:
            total = squat + bench + deadlift
        entries.append(
            LeaderboardEntry(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{SHEET_URL}:{source_row}:{lifter}:{team}")),
                rank=int(_number(row.get(columns["rank"]))) if columns["rank"] and _number(row.get(columns["rank"])) is not None else None,
                lifter=lifter,
                team=team,
                division=division,
                age=_number(row.get(columns["age"])) if columns["age"] else None,
                bodyweight=_number(row.get(columns["bodyweight"])) if columns["bodyweight"] else None,
                category=_category(division, _number(row.get(columns["bodyweight"])) if columns["bodyweight"] else None, row.get(columns["category"]) if columns["category"] else None),
                squat=squat,
                bench=bench,
                deadlift=deadlift,
                total=total,
                dots=_number(row.get(columns["dots"])) if columns["dots"] else None,
                source_row=source_row,
            )
        )
    return entries


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard() -> LeaderboardResponse:
    entries = await _fetch_entries()
    return LeaderboardResponse(source_url=SHEET_URL, synced_at=datetime.now(timezone.utc), entries=entries, total_entries=len(entries))