from fastapi import APIRouter, Depends, HTTPException, status, Query
from starlette.requests import Request
from ....services import github_service
from .auth import get_github_token
from typing import Optional
from httpx import AsyncClient
import re
from bs4 import BeautifulSoup

router = APIRouter()

@router.get("/profile")
async def get_github_profile(token: str = Depends(get_github_token)):
    """
    Fetches the authenticated user's GitHub profile.
    """
    try:
        profile = await github_service.get_user_profile(token)
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"GitHub API error: {str(e)}"
        )

@router.get("/repos")
async def get_github_repos(token: str = Depends(get_github_token)):
    """
    Fetches the authenticated user's repositories.
    """
    try:
        repos = await github_service.get_user_repos(token)
        return repos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"GitHub API error: {str(e)}"
        )

@router.get("/search/issues")
async def search_github_issues(
    query: str = Query(..., description="Search query for GitHub issues"),
    token: str = Depends(get_github_token)
):
    """
    Searches for issues on GitHub.
    """
    try:
        issues = await github_service.search_issues(token, query)
        return issues
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"GitHub API error: {str(e)}"
        )

@router.get("/profile-text-data")
async def get_profile_text_data(
    max_repos: Optional[int] = Query(5, description="Maximum number of repositories to fetch READMEs for"),
    token: str = Depends(get_github_token)
):
    """
    Fetches repository data (languages, topics, descriptions) and README content
    for a user's top repositories.
    """
    try:
        profile_data = await github_service.get_profile_text_data(token, max_repos)
        return profile_data
    except HTTPException as e:
        # Pass through HTTPExceptions raised by the service
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"GitHub API error: {str(e)}"
        )

