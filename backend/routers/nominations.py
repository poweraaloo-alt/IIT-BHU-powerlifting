import csv
import io
import os
import re
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from models.nominations import Nomination, NominationsResponse


router = APIRouter()

SHEET_URL = os.environ.get("GOOGLE_SHEET_URL", "")

BOYS_CATEGORIES = ["53 kg", "59 kg", "66 kg", "74 kg", "83 kg", "93 kg", "105 kg", "120 kg", "120+ kg"]
GIRLS_CATEGORIES = ["43 kg", "47 kg", "52 kg", "57 kg", "63 kg", "69 kg", "76 kg", "84 kg", "84+ kg"]

HEADER_ALIASES = {
    "name": {"name", "lifter", "athlete", "fullname", "liftername"},
    "gender": {"gender", "sex", "division", "boysgirls", "teamtryingfor"},
    "bodyweight": {"bodyweight", "bodyweght", "bw", "weight", "bodyweightkg"},
    "category": {"category", "weightcategory", "wtcat", "class", "weightclass"},
    "squat": {"squat", "sq", "nominatedsquat"},
    "bench": {"bench", "bp", "benchpress", "nominatedbench"},
    "deadlift": {"deadlift", "dl", "nominateddeadlift"},
    "total": {"total", "tot", "nominatedtotal"},
}


def _normalise_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _find_column(headers: list[str], field: str) -> str | None:
    aliases = HEADER_ALIASES[field]
    normalised = {header: _normalise_header(header) for header in headers}
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


def _gender(value: str | None) -> str | None:
    value = (value or "").strip().lower()
    if any(token in value for token in ("girl", "female", "woman", "women")):
        return "girls"
    if any(token in value for token in ("boy", "male", "man", "men")):
        return "boys"
    return None


def _category(gender: str, bodyweight: float, supplied: str | None) -> str:
    categories = BOYS_CATEGORIES if gender == "boys" else GIRLS_CATEGORIES
    supplied_number = _number(supplied)
    if supplied_number is not None:
        for category in categories:
            if category.startswith(f"{int(supplied_number)} ") or category.startswith(f"{int(supplied_number)}+"):
                return category

    limits = [float(category.split("+")[0].split()[0]) for category in categories]
    for category, limit in zip(categories, limits):
        if bodyweight <= limit:
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


async def _fetch_nominations() -> list[Nomination]:
    if not SHEET_URL:
        raise HTTPException(status_code=503, detail="Google Sheet URL is not configured")
    try:
        csv_url = _csv_url(SHEET_URL)
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            response = await client.get(csv_url, headers={"User-Agent": "Meet Nominations Feed/1.0"})
            response.raise_for_status()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="The public Google Sheet could not be read") from exc

    reader = csv.DictReader(io.StringIO(response.content.decode("utf-8-sig")))
    headers = [header for header in (reader.fieldnames or []) if header]
    if not headers:
        raise HTTPException(status_code=502, detail="The Google Sheet has no header row")

    columns = {field: _find_column(headers, field) for field in HEADER_ALIASES}
    if not columns["name"] or not columns["gender"] or not columns["bodyweight"]:
        raise HTTPException(status_code=502, detail="The Google Sheet needs name, gender, and bodyweight columns")

    nominations: list[Nomination] = []
    for source_row, row in enumerate(reader, start=2):
        name = (row.get(columns["name"]) or "").strip()
        gender = _gender(row.get(columns["gender"]))
        bodyweight = _number(row.get(columns["bodyweight"]))
        if not name or not gender or bodyweight is None:
            continue

        squat = _number(row.get(columns["squat"])) if columns["squat"] else None
        bench = _number(row.get(columns["bench"])) if columns["bench"] else None
        deadlift = _number(row.get(columns["deadlift"])) if columns["deadlift"] else None
        supplied_category = row.get(columns["category"]) if columns["category"] else None
        total = _number(row.get(columns["total"])) if columns["total"] else None
        if total is None and squat is not None and bench is not None and deadlift is not None:
            total = squat + bench + deadlift

        nominations.append(
            Nomination(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{SHEET_URL}:{source_row}:{name}")),
                name=name,
                gender=gender,
                bodyweight=bodyweight,
                category=_category(gender, bodyweight, supplied_category),
                squat=squat,
                bench=bench,
                deadlift=deadlift,
                total=total,
                source_row=source_row,
            )
        )

    category_order = {category: index for index, category in enumerate(BOYS_CATEGORIES + GIRLS_CATEGORIES)}
    nominations.sort(key=lambda item: (0 if item.gender == "boys" else 1, category_order[item.category], item.bodyweight, item.name.lower()))
    return nominations


@router.get("/nominations", response_model=NominationsResponse)
async def get_nominations() -> NominationsResponse:
    nominations = await _fetch_nominations()
    return NominationsResponse(
        source_url=SHEET_URL,
        synced_at=datetime.now(timezone.utc),
        nominations=nominations,
        total_nominations=len(nominations),
        boys_count=sum(item.gender == "boys" for item in nominations),
        girls_count=sum(item.gender == "girls" for item in nominations),
    )