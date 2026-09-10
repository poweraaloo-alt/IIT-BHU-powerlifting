import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from routers.nominations import router as nominations_router
from routers.leaderboard import router as leaderboard_router
from routers.live_scores import router as live_scores_router


# The current application reads its data directly from Google Sheets.
# MongoDB is not part of the data path, so the API must not depend on MongoDB
# being reachable during startup.
ENABLE_API_DOCS = os.environ.get("ENABLE_API_DOCS", "false").strip().lower() == "true"
app = FastAPI(
    title="IIT BHU Powerlifting API",
    docs_url="/docs" if ENABLE_API_DOCS else None,
    redoc_url="/redoc" if ENABLE_API_DOCS else None,
    openapi_url="/openapi.json" if ENABLE_API_DOCS else None,
)
api_router = APIRouter(prefix="/api")

api_router.include_router(nominations_router)
api_router.include_router(leaderboard_router)
api_router.include_router(live_scores_router)

# Keep the browser API surface restricted to the deployed frontend by default.
# CORS_ORIGINS may contain a comma-separated list when additional trusted
# frontends are needed.
origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "https://poweraaloo-alt.github.io").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=origins,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)

# Reject unexpected Host headers. Add any future custom API domain to
# ALLOWED_HOSTS in Render as a comma-separated list.
allowed_hosts = [
    host.strip()
    for host in os.environ.get(
        "ALLOWED_HOSTS",
        "iit-bhu-powerlifting.onrender.com,localhost,127.0.0.1",
    ).split(",")
    if host.strip()
]
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# Baseline response hardening for the public API.
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app.include_router(api_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
