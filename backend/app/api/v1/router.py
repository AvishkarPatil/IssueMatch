from fastapi import APIRouter
from .endpoints import auth, github, match
from app.routers import leaderboard, referral, mentor, skills, contributions

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(github.router, prefix="/github", tags=["github"])
# api_router.include_router(ai.router, prefix="/ai", tags=["ai"])  # Temporarily disabled
api_router.include_router(match.router, prefix="/match", tags=["match"])
api_router.include_router(skills.router, tags=["skills"])
api_router.include_router(contributions.router, tags=["contributions"])
api_router.include_router(leaderboard.router, tags=["leaderboard"])
api_router.include_router(referral.router, tags=["referral"])
api_router.include_router(mentor.router, tags=["mentor"])
