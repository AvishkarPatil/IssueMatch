from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from .auth import get_github_token
from ....services.firebase_service import get_firebase_admin

router = APIRouter()

class IssueMetadata(BaseModel):
    issue_id: str
    title: str
    repo: str
    url: str
    labels: List[str] = []
    description: Optional[str] = None
    skills: List[str] = []
    skillMatch: Optional[int] = None

class SaveIssueRequest(BaseModel):
    issue: IssueMetadata

@router.post("/save")
async def save_issue(
    request: SaveIssueRequest,
    token: str = Depends(get_github_token)
):
    """
    Save an issue to the user's profile in Firebase.
    """
    try:
        firebase_admin = get_firebase_admin()
        db = firebase_admin.firestore_client
        
        # Get user info from GitHub token to identify user
        from ....services import github_service
        user_profile = await github_service.get_user_profile(token)
        user_id = str(user_profile.get("id"))
        
        # Reference to the user's document
        user_ref = db.collection("users").document(user_id)
        
        # Get the current user document
        user_doc = user_ref.get()
        
        # Prepare issue data
        issue_data = request.issue.dict()
        issue_data["saved_at"] = firebase_admin.server_timestamp()
        
        if user_doc.exists:
            # Update existing user document
            user_data = user_doc.to_dict()
            saved_issues = user_data.get("saved_issues", [])
            
            # Check if issue is already saved
            if any(issue.get("issue_id") == request.issue.issue_id for issue in saved_issues):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Issue already saved"
                )
            
            # Add new issue to saved_issues array
            saved_issues.append(issue_data)
            user_ref.update({"saved_issues": saved_issues})
        else:
            # Create new user document with saved issue
            user_ref.set({
                "user_id": user_id,
                "saved_issues": [issue_data]
            })
        
        return {
            "message": "Issue saved successfully",
            "issue_id": request.issue.issue_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save issue: {str(e)}"
        )

@router.delete("/save/{issue_id}")
async def unsave_issue(
    issue_id: str,
    token: str = Depends(get_github_token)
):
    """
    Remove an issue from the user's saved issues.
    """
    try:
        firebase_admin = get_firebase_admin()
        db = firebase_admin.firestore_client
        
        # Get user info
        from ....services import github_service
        user_profile = await github_service.get_user_profile(token)
        user_id = str(user_profile.get("id"))
        
        # Reference to the user's document
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        saved_issues = user_data.get("saved_issues", [])
        
        # Filter out the issue to unsave
        updated_issues = [issue for issue in saved_issues if issue.get("issue_id") != issue_id]
        
        if len(updated_issues) == len(saved_issues):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found in saved issues"
            )
        
        # Update the user document
        user_ref.update({"saved_issues": updated_issues})
        
        return {
            "message": "Issue removed from saved",
            "issue_id": issue_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsave issue: {str(e)}"
        )

@router.get("/saved")
async def get_saved_issues(token: str = Depends(get_github_token)):
    """
    Get all saved issues for the authenticated user.
    """
    try:
        firebase_admin = get_firebase_admin()
        db = firebase_admin.firestore_client
        
        # Get user info
        from ....services import github_service
        user_profile = await github_service.get_user_profile(token)
        user_id = str(user_profile.get("id"))
        
        # Reference to the user's document
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return {"saved_issues": []}
        
        user_data = user_doc.to_dict()
        saved_issues = user_data.get("saved_issues", [])
        
        return {"saved_issues": saved_issues}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch saved issues: {str(e)}"
        )
