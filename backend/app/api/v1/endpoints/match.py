from fastapi import APIRouter, HTTPException, status, Depends, Query
from starlette.requests import Request
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from ....services.github_service import get_profile_text_data
from ....services.faiss_search import get_top_matched_issues
from ...v1.endpoints.auth import get_github_token
from ....middleware.rate_limit import limiter
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


# Models for response
class IssueResult(BaseModel):
    """Output model for a single matched issue."""
    issue_id: Optional[int] = None
    issue_url: Optional[str] = None
    repo_url: Optional[str] = None
    title: Optional[str] = None
    created_at: Optional[str] = None
    user_login: Optional[str] = None
    labels: Optional[List[str]] = None
    similarity_score: Optional[float] = None
    short_description: Optional[str] = None


class MatchResponse(BaseModel):
    """Output model for the FAISS matching endpoint."""
    recommendations: List[IssueResult]
    issues_fetched: int
    issues_indexed: int
    message: str


@router.get(
    "/match-issue",
    response_model=MatchResponse,
    summary="Match Issues using FAISS + Sentence Transformers",
    tags=["Matching", "Recommendations"]
)
@limiter.limit("30/minute")
async def match_issues(
        request: Request,
        keywords: List[str] = Query(default=[], description="Technical keywords/skills to match"),
        languages: List[str] = Query(default=[], description="Programming languages to match"),
        topics: List[str] = Query(default=[], description="Topics of interest to match"),
        max_results: int = Query(10, description="Maximum number of results to return"),
        token: str = Depends(get_github_token)
):
    """
    Find GitHub issues that match the user's profile and specified criteria.

    This endpoint:
    1. Takes keywords, languages, and topics as query parameters
    2. Optionally gets additional profile data from GitHub if available
    3. Uses FAISS and Sentence Transformers to find semantically similar issues
    4. Returns the results in a structured format
    """
    try:
        logger.info(f"Matching issues with: Keywords={keywords}, Languages={languages}, Topics={topics}")

        # Try to get additional profile data if token is valid
        try:
            profile_data = await get_profile_text_data(token)

            # Add profile keywords if we don't have any
            if not keywords and "keywords" in profile_data:
                keywords = profile_data.get("keywords", [])
                logger.info(f"Using profile keywords: {keywords}")

            # Add profile languages if we don't have any
            if not languages and "languages" in profile_data:
                languages = profile_data.get("languages", [])
                logger.info(f"Using profile languages: {languages}")

            # Add profile topics if we don't have any
            if not topics and "topics" in profile_data:
                topics = profile_data.get("topics", [])
                logger.info(f"Using profile topics: {topics}")

            # # Get the text blob for semantic matching
            text_blob_summ = profile_data.get("text_blob", "")

        except Exception as e:
            logger.warning(f"Could not get profile data: {str(e)}")
            # Continue with what we have from the request
            text_blob_summ = ""

        # Create a query text from keywords, languages, and topics if no text_blob
        text_blob = ""
        query_parts = []
        if keywords:
            query_parts.append("Keywords: " + ", ".join(keywords))
        if languages:
            query_parts.append("Languages: " + ", ".join(languages))
        if topics:
            query_parts.append("Topics: " + ", ".join(topics))

            text_blob = ". ".join(query_parts) if query_parts else "open source issues"

        text_blob = text_blob + ". " + text_blob_summ


        logger.info(f"Using query text: {text_blob[:100]}...")

        # Combine topics with keywords for better search
        all_keywords = keywords.copy()
        if topics:
            all_keywords.extend(topics)

        # Get top matched issues
        result = get_top_matched_issues(
            query_text=text_blob,
            keywords=all_keywords,
            languages=languages,
            top_k=max_results,
            github_token=token
        )

        # Convert to response model
        response = MatchResponse(
            recommendations=result["recommendations"],
            issues_fetched=result["issues_fetched"],
            issues_indexed=result["issues_indexed"],
            message=result["message"]
        )

        return response

    except Exception as e:
        logger.error(f"Error in match_issues endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to match issues: {str(e)}"
        )