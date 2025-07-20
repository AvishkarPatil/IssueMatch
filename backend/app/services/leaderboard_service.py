from app.services.firebase_service import get_firebase_admin
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

async def update_user_score(
    user_id: str, 
    username: str,
    avatar_url: str,
    contributions: Optional[int] = None,
    mentorships: Optional[int] = None,
    skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Update a user's score in the leaderboard.
    
    The score is calculated as:
    - 10 points per contribution
    - 20 points per mentorship
    
    Returns the updated user data.
    """
    try:
        db = get_firebase_admin().firestore_client
        user_ref = db.collection("leaderboard_scores").document(user_id)
        user_doc = user_ref.get()
        
        # Get existing data or create new
        if user_doc.exists:
            user_data = user_doc.to_dict()
            current_contributions = user_data.get("contributions", 0)
            current_mentorships = user_data.get("mentorships", 0)
            current_skills = user_data.get("skills", [])
        else:
            current_contributions = 0
            current_mentorships = 0
            current_skills = []
        
        # Update with new values if provided
        new_contributions = contributions if contributions is not None else current_contributions
        new_mentorships = mentorships if mentorships is not None else current_mentorships
        new_skills = skills if skills is not None else current_skills
        
        # Calculate score
        score = (new_contributions * 10) + (new_mentorships * 20)
        
        # Prepare update data
        update_data = {
            "username": username,
            "avatarUrl": avatar_url,
            "contributions": new_contributions,
            "mentorships": new_mentorships,
            "skills": new_skills,
            "score": score,
            "updatedAt": get_firebase_admin().server_timestamp()
        }
        
        # Update in Firestore
        user_ref.set(update_data, merge=True)
        
        return {**update_data, "id": user_id}
    except Exception as e:
        logger.error(f"Error updating user score: {str(e)}")
        raise

async def get_top_users(limit: int = 100, skill_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get the top users from the leaderboard.
    Optionally filter by skill.
    """
    try:
        db = get_firebase_admin().firestore_client
        leaderboard_ref = db.collection("leaderboard_scores")
        
        if skill_filter:
            query = leaderboard_ref.where("skills", "array_contains", skill_filter).order_by("score", direction="DESCENDING").limit(limit)
        else:
            query = leaderboard_ref.order_by("score", direction="DESCENDING").limit(limit)
            
        leaderboard_docs = query.get()
        
        result = []
        for i, doc in enumerate(leaderboard_docs):
            data = doc.to_dict()
            result.append({
                "id": doc.id,
                "rank": i + 1,
                "username": data.get("username", ""),
                "avatarUrl": data.get("avatarUrl", ""),
                "score": data.get("score", 0),
                "contributions": data.get("contributions", 0),
                "mentorships": data.get("mentorships", 0),
                "skills": data.get("skills", [])
            })
        
        return result
    except Exception as e:
        logger.error(f"Error getting top users: {str(e)}")
        raise