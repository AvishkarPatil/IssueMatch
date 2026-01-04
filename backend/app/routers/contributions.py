from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.mongodb_service import get_database
from datetime import datetime

router = APIRouter(
    prefix="/contributions",
    tags=["contributions"],
)

class ContributionCreate(BaseModel):
    issueUrl: str
    issueTitle: str
    repoName: str
    prUrl: str
    status: str  # "opened", "merged", "closed"
    difficulty: str  # "easy", "medium", "hard"

async def get_github_user_id(request: Request) -> str:
    token = request.session.get('github_token')
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_data = response.json()
        return str(user_data["id"])

@router.post("/add")
async def add_contribution(contribution: ContributionCreate, request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        points_map = {"easy": 10, "medium": 25, "hard": 50}
        points = points_map.get(contribution.difficulty, 10)
        
        now = datetime.utcnow().isoformat()
        
        contribution_data = {
            "userId": user_id,
            "issueUrl": contribution.issueUrl,
            "issueTitle": contribution.issueTitle,
            "repoName": contribution.repoName,
            "prUrl": contribution.prUrl,
            "status": contribution.status,
            "difficulty": contribution.difficulty,
            "points": points,
            "createdAt": now,
            "updatedAt": now
        }
        
        result = await db.contributions.insert_one(contribution_data)
        
        user = await db.users.find_one({"githubId": user_id})
        
        await db.leaderboard.update_one(
            {"githubId": user_id},
            {
                "$inc": {"score": points, "contributions": 1},
                "$set": {
                    "username": user.get("login"),
                    "avatarUrl": user.get("avatarUrl"),
                    "skills": user.get("skills", []),
                    "updatedAt": now
                }
            },
            upsert=True
        )
        
        return {
            "id": str(result.inserted_id),
            "message": "Contribution added successfully",
            "points": points,
            **contribution_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-contributions")
async def get_my_contributions(request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        contributions = await db.contributions.find({"userId": user_id}).sort("createdAt", -1).to_list(None)
        
        result = []
        for contrib in contributions:
            result.append({
                "id": str(contrib.get("_id")),
                "issueUrl": contrib.get("issueUrl"),
                "issueTitle": contrib.get("issueTitle"),
                "repoName": contrib.get("repoName"),
                "prUrl": contrib.get("prUrl"),
                "status": contrib.get("status"),
                "difficulty": contrib.get("difficulty"),
                "points": contrib.get("points"),
                "createdAt": contrib.get("createdAt")
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
