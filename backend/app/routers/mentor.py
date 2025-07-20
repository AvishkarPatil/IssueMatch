from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from pydantic import BaseModel
from app.services.firebase_service import get_firebase_admin
from app.dependencies import get_current_user
import google.generativeai as genai
import os
from datetime import datetime

router = APIRouter(
    prefix="/mentor",
    tags=["mentor"],
)

# Configure Gemini API
genai.configure(api_key=os.environ.get("GOOGLE_AI_STUDIO_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash-lite')

class MentorBase(BaseModel):
    name: str
    avatarUrl: str
    githubUrl: str
    skills: List[str]
    bio: str
    availability: str

class MentorCreate(MentorBase):
    userId: str

class MentorResponse(MentorBase):
    id: str
    rating: float
    createdAt: str
    updatedAt: str

class MentorSuggestionRequest(BaseModel):
    issueTitle: str
    issueBody: str
    issueLanguages: List[str]
    userSkills: List[str]

@router.post("/suggest", response_model=List[MentorResponse])
async def suggest_mentors(
    request: MentorSuggestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Suggest mentors based on issue and user skills using Gemini API
    """
    try:
        db = get_firebase_admin().firestore_client
        
        # Get all available mentors
        mentors_ref = db.collection("mentors")
        mentors_query = mentors_ref.where("availability", "!=", "unavailable").limit(20)
        mentors_docs = mentors_query.get()
        
        if not mentors_docs:
            return []
            
        # Extract mentor data
        mentors = []
        for doc in mentors_docs:
            data = doc.to_dict()
            mentors.append({
                "id": doc.id,
                "name": data.get("name", ""),
                "skills": data.get("skills", []),
                "rating": data.get("rating", 0.0),
                "availability": data.get("availability", "busy"),
                "avatarUrl": data.get("avatarUrl", ""),
                "githubUrl": data.get("githubUrl", ""),
                "bio": data.get("bio", ""),
                "createdAt": data.get("createdAt", datetime.now().isoformat()),
                "updatedAt": data.get("updatedAt", datetime.now().isoformat())
            })
        
        # If there are fewer than 3 mentors, return all of them
        if len(mentors) <= 3:
            return mentors
            
        # Use Gemini API to rank mentors based on issue and user skills
        prompt = f"""
        I need to match mentors with a GitHub issue based on skills and expertise.
        
        Issue Title: {request.issueTitle}
        Issue Description: {request.issueBody}
        Issue Languages: {', '.join(request.issueLanguages)}
        User Skills: {', '.join(request.userSkills)}
        
        Here are the available mentors with their skills:
        
        {[f"Mentor {i+1}: {mentor['name']} - Skills: {', '.join(mentor['skills'])}" for i, mentor in enumerate(mentors)]}
        
        Please rank the top 5 mentors who would be the best match for this issue, considering:
        1. Skill overlap with the issue languages
        2. Complementary skills to the user's skills (to help them learn)
        3. Availability (prefer 'available' over 'busy')
        
        Return only the mentor numbers in order of best match, like this: [3, 1, 5, 2, 4]
        """
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Extract mentor rankings from the response
        import re
        rankings_match = re.search(r'\[([0-9, ]+)\]', response_text)
        
        if not rankings_match:
            # If no valid ranking format is found, return mentors sorted by rating
            return sorted(mentors, key=lambda m: m["rating"], reverse=True)[:5]
            
        rankings = [int(r.strip()) for r in rankings_match.group(1).split(',')]
        
        # Map rankings back to mentors (adjust for 0-based indexing)
        ranked_mentors = []
        for rank in rankings:
            if 1 <= rank <= len(mentors):
                ranked_mentors.append(mentors[rank-1])
                
        # If we couldn't get enough ranked mentors, add the highest rated remaining ones
        if len(ranked_mentors) < 5:
            remaining_mentors = [m for m in mentors if m not in ranked_mentors]
            remaining_mentors = sorted(remaining_mentors, key=lambda m: m["rating"], reverse=True)
            ranked_mentors.extend(remaining_mentors[:5-len(ranked_mentors)])
            
        return ranked_mentors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suggest mentors: {str(e)}")

@router.post("", response_model=MentorResponse)
async def create_mentor(
    mentor: MentorCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Register as a mentor
    """
    try:
        # Verify that the user is creating their own mentor profile
        if mentor.userId != current_user["uid"]:
            raise HTTPException(status_code=403, detail="You can only create a mentor profile for yourself")
            
        db = get_firebase_admin().firestore_client
        
        # Check if mentor already exists
        existing_query = db.collection("mentors").where("userId", "==", mentor.userId).limit(1)
        existing_docs = existing_query.get()
        
        if existing_docs:
            raise HTTPException(status_code=400, detail="You are already registered as a mentor")
            
        # Create new mentor
        now = datetime.now().isoformat()
        mentor_data = {
            "userId": mentor.userId,
            "name": mentor.name,
            "avatarUrl": mentor.avatarUrl,
            "githubUrl": mentor.githubUrl,
            "skills": mentor.skills,
            "bio": mentor.bio,
            "availability": mentor.availability,
            "rating": 5.0,  # Default rating for new mentors
            "createdAt": now,
            "updatedAt": now
        }
        
        mentor_ref = db.collection("mentors").document()
        mentor_ref.set(mentor_data)
        
        return {
            "id": mentor_ref.id,
            **mentor_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create mentor: {str(e)}")

@router.get("/requests", response_model=List[dict])
async def get_mentorship_requests(
    current_user: dict = Depends(get_current_user)
):
    """
    Get mentorship requests for the current user (as a mentor)
    """
    try:
        db = get_firebase_admin().firestore_client
        
        # Find the mentor document for this user
        mentor_query = db.collection("mentors").where("userId", "==", current_user["uid"]).limit(1)
        mentor_docs = mentor_query.get()
        
        if not mentor_docs:
            raise HTTPException(status_code=404, detail="You are not registered as a mentor")
            
        mentor_id = mentor_docs[0].id
        
        # Get requests for this mentor
        requests_query = db.collection("mentorship_requests").where("mentorId", "==", mentor_id)
        requests_docs = requests_query.get()
        
        requests = []
        for doc in requests_docs:
            data = doc.to_dict()
            requests.append({
                "id": doc.id,
                "requesterId": data.get("requesterId", ""),
                "requesterName": data.get("requesterName", ""),
                "requesterAvatarUrl": data.get("requesterAvatarUrl", ""),
                "message": data.get("message", ""),
                "status": data.get("status", "pending"),
                "createdAt": data.get("createdAt", ""),
                "updatedAt": data.get("updatedAt", "")
            })
            
        return requests
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mentorship requests: {str(e)}")