from fastapi import APIRouter
from .endpoints import auth, github, ai, match

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(github.router, prefix="/github", tags=["github"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(match.router, prefix="/match", tags=["match"])

# Import and include new routers if available
try:
    from app.routers import leaderboard
    api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
except ImportError:
    print("Leaderboard router not available")

try:
    from app.routers import referral
    api_router.include_router(referral.router, prefix="/referral", tags=["referral"])
except ImportError:
    print("Referral router not available")

try:
    from app.routers import mentor
    api_router.include_router(mentor.router, prefix="/mentor", tags=["mentor"])
except ImportError:
    print("Mentor router not available")

try:
    from app.routers import ai_feedback
    api_router.include_router(ai_feedback.router, prefix="/ai", tags=["ai-feedback"])
except ImportError:
    print("AI feedback router not available")
