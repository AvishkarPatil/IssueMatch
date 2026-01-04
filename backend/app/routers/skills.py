from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List
from app.services.mongodb_service import get_database
from datetime import datetime

router = APIRouter(
    prefix="/skills",
    tags=["skills"],
)

class SkillsSubmit(BaseModel):
    skills: List[str]

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

@router.post("/submit")
async def submit_skills(skills_data: SkillsSubmit, request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        token = request.session.get('github_token')
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {token}"}
            )
            github_user = response.json()
        
        user = await db.users.find_one({"githubId": user_id})
        referral_code = user.get("referralCode") if user else None
        
        if not referral_code:
            import secrets
            referral_code = secrets.token_urlsafe(6).upper().replace('-', '').replace('_', '')[:8]
            while await db.users.find_one({"referralCode": referral_code}):
                referral_code = secrets.token_urlsafe(6).upper().replace('-', '').replace('_', '')[:8]
        
        now = datetime.utcnow().isoformat()
        
        user_data = {
            "githubId": user_id,
            "login": github_user.get("login"),
            "name": github_user.get("name"),
            "email": github_user.get("email"),
            "avatarUrl": github_user.get("avatar_url"),
            "bio": github_user.get("bio"),
            "location": github_user.get("location"),
            "company": github_user.get("company"),
            "publicRepos": github_user.get("public_repos", 0),
            "totalPrivateRepos": github_user.get("total_private_repos", 0),
            "followers": github_user.get("followers", 0),
            "following": github_user.get("following", 0),
            "skills": skills_data.skills,
            "skillsTestCompleted": True,
            "skillsTestCompletedAt": now,
            "referralCode": referral_code,
            "isMentor": False,
            "referralCount": 0,
            "createdAt": now,
            "updatedAt": now
        }
        
        await db.users.update_one(
            {"githubId": user_id},
            {"$set": user_data},
            upsert=True
        )
        
        return {"message": "Skills saved successfully", "skills": skills_data.skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-with-referral")
async def submit_skills_with_referral(skills_data: SkillsSubmit, request: Request, referralCode: str = None):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        existing = await db.referrals.find_one({"referredUserId": user_id})
        if existing:
            return await submit_skills(skills_data, request)
        
        if referralCode:
            referrer = await db.users.find_one({"referralCode": referralCode})
            if referrer and referrer["githubId"] != user_id:
                referral_data = {
                    "referrerId": referrer["githubId"],
                    "referredUserId": user_id,
                    "status": "completed",
                    "pointsAwarded": 5,
                    "createdAt": datetime.utcnow().isoformat()
                }
                await db.referrals.insert_one(referral_data)
                
                await db.users.update_one(
                    {"githubId": referrer["githubId"]},
                    {"$inc": {"referralCount": 1}}
                )
                
                await db.leaderboard.update_one(
                    {"githubId": referrer["githubId"]},
                    {
                        "$inc": {"score": 5, "referrals": 1},
                        "$set": {"updatedAt": datetime.utcnow().isoformat()}
                    },
                    upsert=True
                )
        
        return await submit_skills(skills_data, request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_skills_status(request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        user = await db.users.find_one({"githubId": user_id})
        
        if not user:
            return {
                "skillsTestCompleted": False,
                "skills": []
            }
        
        return {
            "skillsTestCompleted": user.get("skillsTestCompleted", False),
            "skills": user.get("skills", [])
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-skills")
async def get_my_skills(request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        user = await db.users.find_one({"githubId": user_id})
        
        if not user or not user.get("skills"):
            return {"skills": []}
        
        return {"skills": user.get("skills", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
