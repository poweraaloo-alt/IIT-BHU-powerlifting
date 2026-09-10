import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from routers.nominations import router as nominations_router
from routers.leaderboard import router as leaderboard_router
from routers.live_scores import router as live_scores_router


# The current application reads its data directly from Google Sheets.
# MongoDB is not part of the data path, so the API must not depend on MongoDB
# being reachable during startup.
app = FastAPI(title="IIT BHU Powerlifting API")
api_router = APIRouter(prefix="/api")

api_router.include_router(nominations_router)
api_router.include_router(leaderboard_router)
api_router.include_router(live_scores_router)

origins = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app.include_router(api_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
