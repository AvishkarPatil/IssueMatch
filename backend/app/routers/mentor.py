from fastapi import APIRouter, HTTPException, Request
from app.services.mongodb_service import get_database
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/mentor",
    tags=["mentor"],
)

class MentorSuggestionRequest(BaseModel):
    issueTitle: str
    issueBody: str
    issueLanguages: List[str]
    userSkills: List[str]

class MentorshipRequest(BaseModel):
    mentorId: str
    message: str

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

@router.post("/suggest")
async def suggest_mentors(request: MentorSuggestionRequest):
    try:
        db = get_database()
        
        mentors = await db.mentors.find({"availability": {"$ne": "unavailable"}}).limit(20).to_list(20)
        
        if not mentors:
            return []
        
        result = []
        for mentor in mentors[:5]:
            result.append({
                "id": str(mentor.get("_id")),
                "name": mentor.get("name"),
                "avatarUrl": mentor.get("avatarUrl"),
                "githubUrl": mentor.get("githubUrl"),
                "skills": mentor.get("skills", []),
                "bio": mentor.get("bio"),
                "availability": mentor.get("availability"),
                "rating": mentor.get("rating", 5.0)
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/request")
async def send_mentor_request(mentor_request: MentorshipRequest, request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        user = await db.users.find_one({"githubId": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        existing = await db.mentorship_requests.find_one({
            "requesterId": user_id,
            "mentorGithubId": mentor_request.mentorId,
            "status": {"$in": ["pending", "accepted"]}
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Request already exists")
        
        now = datetime.utcnow().isoformat()
        
        request_data = {
            "mentorGithubId": mentor_request.mentorId,
            "requesterId": user_id,
            "requesterName": user.get("name") or user.get("login"),
            "requesterAvatarUrl": user.get("avatarUrl"),
            "requesterEmail": user.get("email"),
            "message": mentor_request.message,
            "status": "pending",
            "createdAt": now,
            "updatedAt": now
        }
        
        result = await db.mentorship_requests.insert_one(request_data)
        
        return {
            "id": str(result.inserted_id),
            "message": "Mentorship request sent successfully",
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/requests")
async def get_mentorship_requests(request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        requests = await db.mentorship_requests.find({"mentorGithubId": user_id}).to_list(None)
        
        result = []
        for req in requests:
            result.append({
                "id": str(req.get("_id")),
                "requesterId": req.get("requesterId"),
                "requesterName": req.get("requesterName"),
                "requesterAvatarUrl": req.get("requesterAvatarUrl"),
                "requesterEmail": req.get("requesterEmail"),
                "message": req.get("message"),
                "status": req.get("status", "pending"),
                "createdAt": req.get("createdAt"),
                "updatedAt": req.get("updatedAt")
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/request/{request_id}/status")
async def update_request_status(request_id: str, status: str, request: Request):
    try:
        user_id = await get_github_user_id(request)
        db = get_database()
        
        from bson import ObjectId
        mentor_request = await db.mentorship_requests.find_one({"_id": ObjectId(request_id)})
        
        if not mentor_request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        mentor = await db.mentors.find_one({"githubId": user_id})
        if not mentor or str(mentor["_id"]) != mentor_request["mentorId"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        await db.mentorship_requests.update_one(
            {"_id": ObjectId(request_id)},
            {
                "$set": {
                    "status": status,
                    "updatedAt": datetime.utcnow().isoformat()
                }
            }
        )
        
        return {"message": "Status updated successfully", "status": status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
