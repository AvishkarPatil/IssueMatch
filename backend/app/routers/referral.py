from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.mongodb_service import get_database
import secrets
from datetime import datetime
from bson import ObjectId

router = APIRouter(
    prefix="/referral",
    tags=["referral"],
)

class ReferralCreate(BaseModel):
    referralCode: str

class ReferralResponse(BaseModel):
    id: str
    referrerId: str
    referredUserId: str
    status: str
    pointsAwarded: int
    createdAt: str

def generate_referral_code():
    return secrets.token_urlsafe(6).upper().replace('-', '').replace('_', '')[:8]

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

@router.post("/generate-code", response_model=dict)
async def generate_code(request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        user = await db.users.find_one({"githubId": user_id})
        if user and user.get("referralCode"):
            return {"referralCode": user["referralCode"]}
        
        referral_code = generate_referral_code()
        
        while await db.users.find_one({"referralCode": referral_code}):
            referral_code = generate_referral_code()
        
        await db.users.update_one(
            {"githubId": user_id},
            {"$set": {"referralCode": referral_code}},
            upsert=True
        )
        
        return {"referralCode": referral_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=dict)
async def get_referral_stats(request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        referrals = await db.referrals.find({"referrerId": user_id}).to_list(None)
        
        total_referrals = len(referrals)
        successful_referrals = sum(1 for r in referrals if r.get("status") == "completed")
        points_earned = sum(r.get("pointsAwarded", 0) for r in referrals)
        
        return {
            "totalReferrals": total_referrals,
            "successfulReferrals": successful_referrals,
            "pointsEarned": points_earned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate", response_model=dict)
async def validate_referral(referral: ReferralCreate, request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        referrer = await db.users.find_one({"referralCode": referral.referralCode})
        if not referrer:
            raise HTTPException(status_code=404, detail="Invalid referral code")
        
        if referrer["githubId"] == user_id:
            raise HTTPException(status_code=400, detail="Cannot use your own referral code")
        
        return {
            "valid": True,
            "referrerId": referrer["githubId"],
            "referrerName": referrer.get("displayName", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complete", response_model=ReferralResponse)
async def complete_referral(referral: ReferralCreate, request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        referrer = await db.users.find_one({"referralCode": referral.referralCode})
        if not referrer:
            raise HTTPException(status_code=404, detail="Invalid referral code")
        
        if referrer["githubId"] == user_id:
            raise HTTPException(status_code=400, detail="Cannot use your own referral code")
        
        existing = await db.referrals.find_one({"referredUserId": user_id})
        if existing:
            raise HTTPException(status_code=400, detail="User has already been referred")
        
        now = datetime.utcnow().isoformat()
        referral_data = {
            "referrerId": referrer["githubId"],
            "referredUserId": user_id,
            "status": "completed",
            "pointsAwarded": 50,
            "createdAt": now
        }
        
        result = await db.referrals.insert_one(referral_data)
        
        await db.leaderboard.update_one(
            {"githubId": referrer["githubId"]},
            {
                "$inc": {"score": 50, "referrals": 1},
                "$set": {"updatedAt": now}
            },
            upsert=True
        )
        
        return {
            "id": str(result.inserted_id),
            **referral_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))