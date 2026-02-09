from fastapi import APIRouter, HTTPException, Request, status, Depends
from typing import Optional
from pydantic import BaseModel
import logging

from ....services.roadmap_service import roadmap_service
from ....models.roadmap import (
    RoadmapGenerationRequest, RoadmapUpdateRequest,
    RoadmapResponse, RoadmapStatusResponse
)
from .auth import get_github_token

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_user_id(request: Request) -> str:
    """Extract user ID from session (requires authentication)."""
    token = request.session.get('github_token')
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Get user ID from GitHub token
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        user_data = response.json()
        return str(user_data["id"])


@router.post(
    "/generate",
    response_model=RoadmapResponse,
    summary="Generate a personalized learning roadmap",
    tags=["roadmap"]
)
async def generate_roadmap(
    request_data: RoadmapGenerationRequest,
    request: Request,
    token: str = Depends(get_github_token)
):
    """
    Generate a personalized roadmap for the authenticated user.

    This endpoint:
    1. Uses the user's skills and profile data
    2. Retrieves ranked issues from the matching system
    3. Applies difficulty progression and skill gap analysis
    4. Groups issues into logical phases
    5. Returns a structured learning path
    """
    try:
        logger.info(f"Generating roadmap for user {request_data.user_id}")

        # Generate the roadmap
        roadmap = await roadmap_service.generate_roadmap(request_data)

        response = RoadmapResponse(
            roadmap=roadmap,
            message="Roadmap generated successfully"
        )

        return response

    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )


@router.get(
    "/current",
    summary="Get the current user's roadmap",
    tags=["roadmap"]
)
async def get_current_roadmap(request: Request, token: str = Depends(get_github_token)):
    """
    Retrieve the current roadmap for the authenticated user.

    Returns the user's personalized learning path with progress tracking.
    """
    try:
        user_id = await get_user_id(request)

        roadmap = await roadmap_service.get_current_roadmap(user_id)

        if not roadmap:
            return {
                "has_roadmap": False,
                "message": "No roadmap found. Generate one first using POST /roadmap/generate"
            }

        # Calculate progress
        total_issues = roadmap.total_issues
        completed_issues = roadmap.completed_issues
        completion_percentage = (completed_issues / total_issues * 100) if total_issues > 0 else 0

        # Find current phase and next recommended issue
        current_phase = None
        next_issue = None

        for phase in roadmap.phases:
            incomplete_issues = [issue for issue in phase.issues if issue.status != "completed"]
            if incomplete_issues:
                current_phase = phase.title
                next_issue = incomplete_issues[0]
                break

        response = RoadmapStatusResponse(
            has_roadmap=True,
            total_issues=total_issues,
            completed_issues=completed_issues,
            completion_percentage=round(completion_percentage, 1),
            current_phase=current_phase,
            next_recommended_issue=next_issue
        )

        return {
            "status": response,
            "roadmap": roadmap
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving roadmap: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve roadmap: {str(e)}"
        )


@router.post(
    "/complete/{issue_id}",
    summary="Mark an issue as completed",
    tags=["roadmap"]
)
async def complete_issue(
    issue_id: int,
    request: Request,
    token: str = Depends(get_github_token)
):
    """
    Mark a roadmap issue as completed and regenerate the roadmap.

    This endpoint:
    1. Updates the issue status to completed
    2. Recalculates roadmap progress
    3. Returns the updated roadmap
    """
    try:
        user_id = await get_user_id(request)

        logger.info(f"Marking issue {issue_id} as completed for user {user_id}")

        # Update roadmap after completion
        updated_roadmap = await roadmap_service.update_after_completion(user_id, issue_id)

        return {
            "message": f"Issue {issue_id} marked as completed",
            "roadmap": updated_roadmap
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error completing issue: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete issue: {str(e)}"
        )


@router.get(
    "/status",
    summary="Get roadmap status summary",
    tags=["roadmap"]
)
async def get_roadmap_status(request: Request, token: str = Depends(get_github_token)):
    """
    Get a summary of the user's roadmap status without full roadmap data.
    """
    try:
        user_id = await get_user_id(request)

        roadmap = await roadmap_service.get_current_roadmap(user_id)

        if not roadmap:
            return RoadmapStatusResponse(
                has_roadmap=False,
                total_issues=0,
                completed_issues=0,
                completion_percentage=0.0
            )

        completion_percentage = (
            roadmap.completed_issues / roadmap.total_issues * 100
        ) if roadmap.total_issues > 0 else 0

        # Find next recommended issue
        next_issue = None
        for phase in roadmap.phases:
            for issue in phase.issues:
                if issue.status == "not_started":
                    next_issue = issue
                    break
            if next_issue:
                break

        return RoadmapStatusResponse(
            has_roadmap=True,
            total_issues=roadmap.total_issues,
            completed_issues=roadmap.completed_issues,
            completion_percentage=round(completion_percentage, 1),
            current_phase=roadmap.phases[0].title if roadmap.phases else None,
            next_recommended_issue=next_issue
        )

    except Exception as e:
        logger.error(f"Error getting roadmap status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get roadmap status: {str(e)}"
        )
