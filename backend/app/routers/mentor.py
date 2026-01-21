from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pymongo.database import Database
from pydantic import BaseModel

from app.database import get_db

router = APIRouter()

# --------------------
# Pydantic Model
# --------------------
class MentorModel(BaseModel):
    username: str
    skills: List[str]


# --------------------
# GET ALL MENTORS
# --------------------
@router.get("/mentor", response_model=List[MentorModel])
def get_all_mentors(db: Database = Depends(get_db)):
    """
    Fetch all users who opted in as mentors.
    """
    try:
        mentors_cursor = db.mentors.find({"is_mentor": True})
        mentors: List[MentorModel] = []

        for mentor in mentors_cursor:
            mentors.append(
                MentorModel(
                    username=mentor.get("user_id"),
                    skills=mentor.get("skills", [])
                )
            )

        return mentors

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------
# MATCH MENTORS BY SKILLS
# --------------------
@router.get("/mentor/match/{username}", response_model=List[MentorModel])
def get_matching_mentors(username: str, db: Database = Depends(get_db)):
    """
    Match mentors based on overlapping skills.
    """
    user = db.users.find_one({"username": username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_skills = set(user.get("skills", []))
    mentors_cursor = db.mentors.find({"is_mentor": True})

    matched_mentors: List[MentorModel] = []

    for mentor in mentors_cursor:
        mentor_skills = set(mentor.get("skills", []))

        if user_skills & mentor_skills:
            matched_mentors.append(
                MentorModel(
                    username=mentor.get("user_id"),
                    skills=mentor.get("skills", [])
                )
            )

    return matched_mentors
