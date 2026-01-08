"""
Tests for authentication failure scenarios.

This module tests error handling in the authentication flow including:
- Invalid/expired GitHub tokens
- CSRF attack prevention
- GitHub OAuth token exchange failures
- Missing authorization codes
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
import httpx


@pytest.mark.auth
class TestAuthenticationFailures:
    """Test suite for authentication failure scenarios."""

    def test_get_github_token_no_session(self, client):
        """Test get_github_token with no session token returns 401."""
        from app.api.v1.endpoints.auth import get_github_token
        from starlette.requests import Request
        
        mock_request = MagicMock(spec=Request)
        mock_request.session = {}
        
        with pytest.raises(Exception) as exc_info:
            import asyncio
            asyncio.run(get_github_token(mock_request))
        
        assert "401" in str(exc_info.value) or "Not authenticated" in str(exc_info.value)

    def test_get_github_token_empty_token(self, client):
        """Test get_github_token with empty token returns 401."""
        from app.api.v1.endpoints.auth import get_github_token
        from starlette.requests import Request
        
        mock_request = MagicMock(spec=Request)
        mock_request.session = {"github_token": ""}
        
        with pytest.raises(Exception) as exc_info:
            import asyncio
            asyncio.run(get_github_token(mock_request))
        
        assert "401" in str(exc_info.value) or "Not authenticated" in str(exc_info.value)

    def test_callback_csrf_attack_mismatched_state(self, client):
        """Test callback with mismatched state parameter (CSRF attack)."""
        with client.session_transaction() as session:
            session["oauth_state"] = "correct_state_12345"
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "wrong_state_67890"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "CSRF" in response.json()["detail"] or "state" in response.json()["detail"]

    def test_callback_missing_state(self, client):
        """Test callback with missing state parameter."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        response = client.get(
            "/api/v1/auth/callback",
            params={"code": "test_code"}
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_callback_no_stored_state(self, client):
        """Test callback when no state is stored in session."""
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "some_state"
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_callback_missing_authorization_code(self, client):
        """Test callback without authorization code."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        response = client.get(
            "/api/v1/auth/callback",
            params={"state": "test_state_12345"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "code" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_callback_github_token_exchange_network_error(self, client, respx_mock):
        """Test callback when GitHub token exchange fails due to network error."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        respx_mock.post("https://github.com/login/oauth/access_token").mock(
            side_effect=httpx.ConnectError("Connection failed")
        )
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "test_state_12345"
            }
        )
        
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert "GitHub" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_callback_github_token_exchange_timeout(self, client, respx_mock):
        """Test callback when GitHub token exchange times out."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        respx_mock.post("https://github.com/login/oauth/access_token").mock(
            side_effect=httpx.TimeoutException("Request timed out")
        )
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "test_state_12345"
            }
        )
        
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    @pytest.mark.asyncio
    async def test_callback_github_returns_error(self, client, respx_mock):
        """Test callback when GitHub returns an error response."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        respx_mock.post("https://github.com/login/oauth/access_token").mock(
            return_value=httpx.Response(
                200,
                json={
                    "error": "bad_verification_code",
                    "error_description": "The code passed is incorrect or expired."
                }
            )
        )
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "invalid_code",
                "state": "test_state_12345"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access token" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_callback_github_malformed_json(self, client, respx_mock):
        """Test callback when GitHub returns malformed JSON."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        respx_mock.post("https://github.com/login/oauth/access_token").mock(
            return_value=httpx.Response(
                200,
                content=b"not valid json{{{",
                headers={"content-type": "application/json"}
            )
        )
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "test_state_12345"
            }
        )
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    @pytest.mark.asyncio
    async def test_callback_github_http_error(self, client, respx_mock):
        """Test callback when GitHub returns HTTP error status."""

        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        respx_mock.post("https://github.com/login/oauth/access_token").mock(
            return_value=httpx.Response(500, json={"error": "Internal Server Error"})
        )
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "test_state_12345"
            }
        )
        
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    @pytest.mark.asyncio
    async def test_callback_github_missing_access_token(self, client, respx_mock):
        """Test callback when GitHub response is missing access_token."""
        with client.session_transaction() as session:
            session["oauth_state"] = "test_state_12345"
        
        respx_mock.post("https://github.com/login/oauth/access_token").mock(
            return_value=httpx.Response(
                200,
                json={
                    "scope": "read:user",
                    "token_type": "bearer"
                }
            )
        )
        
        response = client.get(
            "/api/v1/auth/callback",
            params={
                "code": "test_code",
                "state": "test_state_12345"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "access token" in response.json()["detail"].lower()
