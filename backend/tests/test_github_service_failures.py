"""
Tests for GitHub service failure scenarios.

This module tests error handling in GitHub API interactions including:
- GitHub API rate limiting
- Invalid/expired tokens
- Network timeouts
- Malformed API responses
- README fetch failures
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import httpx
from fastapi import HTTPException


@pytest.mark.github
class TestGitHubServiceFailures:
    """Test suite for GitHub service failure scenarios."""

    @pytest.mark.asyncio
    async def test_get_user_profile_rate_limit(self, respx_mock):
        """Test get_user_profile when GitHub API rate limit is exceeded."""
        from app.services.github_service import get_user_profile
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(
                403,
                json={"message": "API rate limit exceeded"},
                headers={
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": "1234567890"
                }
            )
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await get_user_profile("test_token")
        
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_get_user_profile_invalid_token(self, respx_mock):
        """Test get_user_profile with invalid/expired token."""
        from app.services.github_service import get_user_profile
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(
                401,
                json={"message": "Bad credentials"}
            )
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await get_user_profile("invalid_token")
        
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_user_profile_network_timeout(self, respx_mock):
        """Test get_user_profile when network request times out."""
        from app.services.github_service import get_user_profile
        
        respx_mock.get("https://api.github.com/user").mock(
            side_effect=httpx.TimeoutException("Request timed out")
        )
        
        with pytest.raises((HTTPException, httpx.TimeoutException)):
        with pytest.raises((HTTPException, httpx.TimeoutException)):
            await get_user_profile("test_token")

    @pytest.mark.asyncio
    async def test_get_user_profile_connection_error(self, respx_mock):
        """Test get_user_profile when connection fails."""
        from app.services.github_service import get_user_profile
        
        respx_mock.get("https://api.github.com/user").mock(
            side_effect=httpx.ConnectError("Connection failed")
        )
        
        with pytest.raises((HTTPException, httpx.ConnectError)):
            await get_user_profile("test_token")

    @pytest.mark.asyncio
    async def test_get_user_profile_malformed_json(self, respx_mock):
        """Test get_user_profile when GitHub returns malformed JSON."""
        from app.services.github_service import get_user_profile
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(
                200,
                content=b"not valid json{{{",
                headers={"content-type": "application/json"}
            )
        )
        
        with pytest.raises(Exception):
            await get_user_profile("test_token")

    @pytest.mark.asyncio
    async def test_get_user_repos_rate_limit(self, respx_mock):
        """Test get_user_repos when rate limited."""
        from app.services.github_service import get_user_repos
        
        respx_mock.get("https://api.github.com/user/repos").mock(
            return_value=httpx.Response(
                403,
                json={"message": "API rate limit exceeded"}
            )
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await get_user_repos("test_token")
        
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_get_user_repos_empty_response(self, respx_mock):
        """Test get_user_repos when user has no repositories."""
        from app.services.github_service import get_user_repos
        
        respx_mock.get("https://api.github.com/user/repos").mock(
            return_value=httpx.Response(200, json=[])
        )
        
        result = await get_user_repos("test_token")
        assert result == []

    @pytest.mark.asyncio
    async def test_search_issues_invalid_query(self, respx_mock):
        """Test search_issues with invalid query syntax."""
        from app.services.github_service import search_issues
        
        respx_mock.get("https://api.github.com/search/issues").mock(
            return_value=httpx.Response(
                422,
                json={
                    "message": "Validation Failed",
                    "errors": [{"message": "Invalid query syntax"}]
                }
            )
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await search_issues("test_token", "invalid:::query")
        
        assert exc_info.value.status_code == 422

    @pytest.mark.asyncio
    async def test_fetch_readme_not_found(self, respx_mock):
        """Test _fetch_readme_content when README doesn't exist."""
        from app.services.github_service import _fetch_readme_content
        
        respx_mock.get("https://api.github.com/repos/owner/repo/readme").mock(
            return_value=httpx.Response(
                404,
                json={"message": "Not Found"}
            )
        )
        
        async with httpx.AsyncClient() as client:
            result = await _fetch_readme_content(
                "https://api.github.com/repos/owner/repo",
                {"Authorization": "Bearer test_token"},
                client
            )
        
        assert result is None or result == ""

    @pytest.mark.asyncio
    async def test_fetch_readme_invalid_base64(self, respx_mock):
        """Test _fetch_readme_content with invalid base64 content."""
        from app.services.github_service import _fetch_readme_content
        
        respx_mock.get("https://api.github.com/repos/owner/repo/readme").mock(
            return_value=httpx.Response(
                200,
                json={
                    "content": "not!!!valid!!!base64",
                    "encoding": "base64"
                }
            )
        )
        
        async with httpx.AsyncClient() as client:
            result = await _fetch_readme_content(
                "https://api.github.com/repos/owner/repo",
                {"Authorization": "Bearer test_token"},
                client
            )
        
        assert result is None or result == ""

    @pytest.mark.asyncio
    async def test_get_profile_text_data_partial_failure(self, respx_mock, mock_github_user_response, mock_github_repos_response):
        """Test get_profile_text_data when some API calls fail but others succeed."""
        from app.services.github_service import get_profile_text_data
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(200, json=mock_github_user_response)
        )
        
        respx_mock.get("https://api.github.com/user/repos").mock(
            return_value=httpx.Response(200, json=mock_github_repos_response)
        )
        
        respx_mock.get("https://api.github.com/repos/testuser/test-repo-1/readme").mock(
            return_value=httpx.Response(404, json={"message": "Not Found"})
        )
        respx_mock.get("https://api.github.com/repos/testuser/test-repo-2/readme").mock(
            return_value=httpx.Response(404, json={"message": "Not Found"})
        )
        
        result = await get_profile_text_data("test_token")
        
        assert "languages" in result
        assert "topics" in result
        assert "text_blob" in result
        assert len(result["languages"]) > 0

    @pytest.mark.asyncio
    async def test_get_profile_text_data_complete_failure(self, respx_mock):
        """Test get_profile_text_data when all API calls fail."""
        from app.services.github_service import get_profile_text_data
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(503, json={"message": "Service Unavailable"})
        )
        
        with pytest.raises(HTTPException):
        with pytest.raises(HTTPException):
            await get_profile_text_data("test_token")

    @pytest.mark.asyncio
    async def test_get_user_profile_missing_fields(self, respx_mock):
        """Test get_user_profile when response is missing expected fields."""
        from app.services.github_service import get_user_profile
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(
                200,
                json={"login": "testuser"} 
            )
        )
        
        result = await get_user_profile("test_token")
        assert result["login"] == "testuser"