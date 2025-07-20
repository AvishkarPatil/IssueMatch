from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.firebase_service import get_firebase_admin
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/leaderboard",
    tags=["leaderboard"],
)

class LeaderboardUser(BaseModel):
    id: str
    username: str
    avatarUrl: str
    score: int
    contributions: int
    mentorships: int
    skills: List[str]

@router.get("/", response_model=List[LeaderboardUser])
async def get_leaderboard(
    current_user: dict = Depends(get_current_user),
    skill_filter: Optional[str] = None,
    limit: int = 100
):
    """
    Get the leaderboard of top users by score.
    Optionally filter by skill.
    """
    try:
        db = get_firebase_admin().firestore_client
        
        # Query leaderboard scores
        leaderboard_ref = db.collection("leaderboard_scores")
        
        if skill_filter:
            # If skill filter is provided, use a more complex query
            query = leaderboard_ref.where("skills", "array_contains", skill_filter).order_by("score", direction="DESCENDING").limit(limit)
        else:
            # Otherwise just sort by score
            query = leaderboard_ref.order_by("score", direction="DESCENDING").limit(limit)
            
        leaderboard_docs = query.get()
        
        # Convert to response model
        result = []
        for doc in leaderboard_docs:
            data = doc.to_dict()
            result.append(
                LeaderboardUser(
                    id=doc.id,
                    username=data.get("username", ""),
                    avatarUrl=data.get("avatarUrl", ""),
                    score=data.get("score", 0),
                    contributions=data.get("contributions", 0),
                    mentorships=data.get("mentorships", 0),
                    skills=data.get("skills", [])
                )
            )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

@router.get("/user/{user_id}", response_model=LeaderboardUser)
async def get_user_score(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific user's leaderboard data
    """
    try:
        db = get_firebase_admin().firestore_client
        user_doc = db.collection("leaderboard_scores").document(user_id).get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found in leaderboard")
            
        data = user_doc.to_dict()
        return LeaderboardUser(
            id=user_doc.id,
            username=data.get("username", ""),
            avatarUrl=data.get("avatarUrl", ""),
            score=data.get("score", 0),
            contributions=data.get("contributions", 0),
            mentorships=data.get("mentorships", 0),
            skills=data.get("skills", [])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user score: {str(e)}")