from fastapi import APIRouter, HTTPException
from app.services.mongodb_service import get_database
from typing import List, Optional

router = APIRouter(
    prefix="/leaderboard",
    tags=["leaderboard"],
)

@router.get("/")
async def get_leaderboard(skill_filter: Optional[str] = None, limit: int = 100):
    try:
        db = get_database()
        
        query = {}
        if skill_filter:
            query["skills"] = skill_filter
        
        leaderboard = await db.leaderboard.find(query).sort("score", -1).limit(limit).to_list(limit)
        
        result = []
        for entry in leaderboard:
            result.append({
                "id": entry.get("githubId"),
                "username": entry.get("username"),
                "avatarUrl": entry.get("avatarUrl"),
                "score": entry.get("score", 0),
                "contributions": entry.get("contributions", 0),
                "mentorships": entry.get("mentorships", 0),
                "referrals": entry.get("referrals", 0),
                "skills": entry.get("skills", [])
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
async def get_user_score(user_id: str):
    try:
        db = get_database()
        user = await db.leaderboard.find_one({"githubId": user_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found in leaderboard")
        
        return {
            "id": user.get("githubId"),
            "username": user.get("username"),
            "avatarUrl": user.get("avatarUrl"),
            "score": user.get("score", 0),
            "contributions": user.get("contributions", 0),
            "mentorships": user.get("mentorships", 0),
            "referrals": user.get("referrals", 0),
            "skills": user.get("skills", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
