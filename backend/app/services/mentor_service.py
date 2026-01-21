from pymongo import MongoClient
from typing import List, Dict, Optional

# MongoDB connection
client = MongoClient("mongodb://localhost:27017")
db = client.issuematch
mentors_collection = db.mentors
users_collection = db.users

def get_all_mentors() -> List[Dict]:
    """Return all users who opted in as mentors."""
    return list(mentors_collection.find({"is_mentor": True}, {"_id": 0}))

def match_mentors_for_user(user_id: str, top_n: int = 3) -> List[Dict]:
    """
    Match a user with mentors based on skill overlap.
    Returns top_n mentors with highest skill match count.
    """
    user = users_collection.find_one({"username": user_id})
    if not user or "skills" not in user:
        return []

    user_skills = set(user["skills"])
    all_mentors = get_all_mentors()

    # Calculate skill overlap
    matched_mentors = []
    for mentor in all_mentors:
        mentor_skills = set(mentor.get("skills", []))
        overlap = len(user_skills & mentor_skills)
        if overlap > 0:
            mentor_copy = mentor.copy()
            mentor_copy["matched_skills_count"] = overlap
            matched_mentors.append(mentor_copy)

    # Sort by highest match count
    matched_mentors.sort(key=lambda m: m["matched_skills_count"], reverse=True)
    return matched_mentors[:top_n]

def assign_mentor_to_user(user_id: str, mentor_username: str) -> bool:
    """
    Assign a mentor to a user.
    Returns True if successful.
    """
    mentor = mentors_collection.find_one({"user_id": mentor_username})
    if not mentor:
        return False
    result = users_collection.update_one(
        {"username": user_id},
        {"$set": {"mentor_id": mentor_username}}
    )
    return result.modified_count == 1
