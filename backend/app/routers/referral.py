from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from app.services.firebase_service import get_firebase_admin
from app.dependencies import get_current_user
import uuid
from datetime import datetime

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

@router.post("/validate", response_model=dict)
async def validate_referral(
    referral: ReferralCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Validate a referral code and return the referrer's information
    """
    try:
        db = get_firebase_admin().firestore_client
        
        # Find the user with this referral code
        users_ref = db.collection("users")
        query = users_ref.where("referralCode", "==", referral.referralCode).limit(1)
        results = query.get()
        
        if not results:
            raise HTTPException(status_code=404, detail="Invalid referral code")
            
        referrer = results[0]
        referrer_data = referrer.to_dict()
        
        # Don't allow self-referrals
        if referrer.id == current_user["uid"]:
            raise HTTPException(status_code=400, detail="Cannot use your own referral code")
            
        return {
            "valid": True,
            "referrerId": referrer.id,
            "referrerName": referrer_data.get("displayName", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate referral: {str(e)}")

@router.post("/complete", response_model=ReferralResponse)
async def complete_referral(
    referral: ReferralCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Complete a referral after user signs up with a referral code
    """
    try:
        db = get_firebase_admin().firestore_client
        
        # Validate the referral code first
        users_ref = db.collection("users")
        query = users_ref.where("referralCode", "==", referral.referralCode).limit(1)
        results = query.get()
        
        if not results:
            raise HTTPException(status_code=404, detail="Invalid referral code")
            
        referrer = results[0]
        
        # Don't allow self-referrals
        if referrer.id == current_user["uid"]:
            raise HTTPException(status_code=400, detail="Cannot use your own referral code")
        
        # Check if this user has already been referred
        referrals_ref = db.collection("referrals")
        existing_query = referrals_ref.where("referredUserId", "==", current_user["uid"]).limit(1)
        existing_results = existing_query.get()
        
        if existing_results:
            raise HTTPException(status_code=400, detail="User has already been referred")
        
        # Create the referral record
        referral_id = str(uuid.uuid4())
        points_awarded = 50  # 50 points per successful referral
        now = datetime.now().isoformat()
        
        referral_data = {
            "referrerId": referrer.id,
            "referredUserId": current_user["uid"],
            "status": "completed",
            "pointsAwarded": points_awarded,
            "createdAt": now
        }
        
        # Save to Firestore
        referrals_ref.document(referral_id).set(referral_data)
        
        # Update the referrer's leaderboard score
        leaderboard_ref = db.collection("leaderboard_scores").document(referrer.id)
        leaderboard_doc = leaderboard_ref.get()
        
        if leaderboard_doc.exists:
            leaderboard_data = leaderboard_doc.to_dict()
            current_score = leaderboard_data.get("score", 0)
            current_referrals = leaderboard_data.get("referrals", 0)
            
            leaderboard_ref.update({
                "score": current_score + points_awarded,
                "referrals": current_referrals + 1
            })
        else:
            # Create a new leaderboard entry for the referrer
            referrer_data = users_ref.document(referrer.id).get().to_dict()
            
            leaderboard_ref.set({
                "username": referrer_data.get("displayName", ""),
                "avatarUrl": referrer_data.get("photoURL", ""),
                "score": points_awarded,
                "contributions": 0,
                "mentorships": 0,
                "referrals": 1,
                "skills": referrer_data.get("skills", []),
                "updatedAt": now
            })
        
        return {
            "id": referral_id,
            **referral_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete referral: {str(e)}")

@router.get("/stats", response_model=dict)
async def get_referral_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Get referral statistics for the current user
    """
    try:
        db = get_firebase_admin().firestore_client
        referrals_ref = db.collection("referrals")
        query = referrals_ref.where("referrerId", "==", current_user["uid"])
        results = query.get()
        
        total_referrals = len(results)
        successful_referrals = sum(1 for doc in results if doc.to_dict().get("status") == "completed")
        points_earned = sum(doc.to_dict().get("pointsAwarded", 0) for doc in results)
        
        return {
            "totalReferrals": total_referrals,
            "successfulReferrals": successful_referrals,
            "pointsEarned": points_earned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get referral stats: {str(e)}")