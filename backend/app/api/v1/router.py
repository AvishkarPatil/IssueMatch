from fastapi import APIRouter
import logging
import importlib

# Setup structured logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# Initialize main API router
api_router = APIRouter()

# Core routers (must always exist)
from .endpoints import auth, github, ai, match

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(github.router, prefix="/github", tags=["github"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(match.router, prefix="/match", tags=["match"])

# Optional routers (load dynamically if present)
OPTIONAL_ROUTERS = [
    ("leaderboard", "app.routers.leaderboard"),
    ("referral", "app.routers.referral"),
    ("mentor", "app.routers.mentor"),
]

for name, module_path in OPTIONAL_ROUTERS:
    try:
        module = importlib.import_module(module_path)
        api_router.include_router(module.router, prefix=f"/{name}", tags=[name])
        logger.info(f"✅ Loaded optional router: {name}")
    except ImportError:
        logger.warning(f"⚠ Skipping optional router: {name} (module not found)")
    except AttributeError:
        logger.error(f"❌ Failed to include router: {name} (no 'router' defined)")
