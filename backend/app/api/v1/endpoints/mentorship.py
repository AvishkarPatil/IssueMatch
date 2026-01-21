from fastapi import APIRouter, HTTPException
from app.services.mentor_service import get_all_mentors, match_mentors_for_user, assign_mentor_to_user

router = APIRouter(prefix="/mentorship", tags=["Mentorship"])

@router.get("/mentors")
def list_all_mentors():
    mentors = get_all_mentors()
    return {"mentors": mentors}

@router.get("/match/{username}")
def get_matched_mentors(username: str):
    matches = match_mentors_for_user(username)
    if not matches:
        raise HTTPException(status_code=404, detail="No mentors matched or user not found")
    return {"user": username, "matched_mentors": matches}

@router.post("/assign")
def assign_mentor(username: str, mentor_username: str):
    success = assign_mentor_to_user(username, mentor_username)
    if not success:
        raise HTTPException(status_code=400, detail="Assignment failed")
    return {"message": f"Mentor {mentor_username} assigned to user {username}"}
