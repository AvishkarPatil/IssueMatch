"""
Tests for match endpoint failure scenarios.

This module tests error handling in the match endpoint including:
- Unauthenticated requests
- Profile data fetch failures
- FAISS service failures
- Invalid query parameters
"""

import pytest
from fastapi import status
from unittest.mock import patch, AsyncMock


@pytest.mark.integration
class TestMatchEndpointFailures:
    """Test suite for match endpoint failure scenarios."""

    def test_match_issues_unauthenticated(self, client):
        """Test /match-issue without authentication."""
        response = client.get("/api/v1/match/match-issue")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_match_issues_with_session_but_no_token(self, client):
        """Test /match-issue with session but no GitHub token."""
        with client.session_transaction() as session:
            session["some_other_key"] = "value"
        
        response = client.get("/api/v1/match/match-issue")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_match_issues_profile_fetch_failure(self, client, mock_session):
        """Test /match-issue when profile data fetch fails."""
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_profile_text_data') as mock_profile:
            mock_profile.side_effect = Exception("Profile fetch failed")
            
            with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
                mock_faiss.return_value = {
                    "recommendations": [],
                    "issues_fetched": 0,
                    "issues_indexed": 0,
                    "message": "No issues found"
                }
                
                response = client.get(
                    "/api/v1/match/match-issue",
                    params={
                        "keywords": ["python"],
                        "languages": ["python"],
                        "max_results": 5
                    }
                )
                
                assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_match_issues_faiss_service_failure(self, client, mock_session):
        """Test /match-issue when FAISS service fails."""
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.side_effect = Exception("FAISS service failed")
            
            response = client.get(
                "/api/v1/match/match-issue",
                params={
                    "keywords": ["python"],
                    "languages": ["python"]
                }
            )
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert "failed" in response.json()["detail"].lower()

    def test_match_issues_with_empty_parameters(self, client, mock_session):
        """Test /match-issue with all empty parameters."""
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_profile_text_data') as mock_profile:
            mock_profile.return_value = {
                "keywords": [],
                "languages": [],
                "topics": [],
                "text_blob": ""
            }
            
            with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
                mock_faiss.return_value = {
                    "recommendations": [],
                    "issues_fetched": 0,
                    "issues_indexed": 0,
                    "message": "No issues found"
                }
                
                response = client.get("/api/v1/match/match-issue")
                
                assert response.status_code == status.HTTP_200_OK
                data = response.json()
                assert "recommendations" in data

    def test_match_issues_with_very_large_max_results(self, client, mock_session):
        """Test /match-issue with very large max_results parameter."""
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues found"
            }
            
            response = client.get(
                "/api/v1/match/match-issue",
                params={
                    "keywords": ["python"],
                    "max_results": 10000  
                }
            )
            
            assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_match_issues_partial_profile_data(self, client, mock_session):
        """Test /match-issue when profile returns partial data."""
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_profile_text_data') as mock_profile:
            mock_profile.return_value = {
                "languages": ["python"],
            }
            
            with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
                mock_faiss.return_value = {
                    "recommendations": [],
                    "issues_fetched": 0,
                    "issues_indexed": 0,
                    "message": "No issues found"
                }
                
                response = client.get(
                    "/api/v1/match/match-issue",
                    params={"keywords": ["fastapi"]}
                )
                
                assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_match_issues_github_token_expired_during_request(self, client, mock_session, respx_mock):
        """Test /match-issue when GitHub token expires during request."""
        with client.session_transaction() as session:
            session.update(mock_session)
        
        respx_mock.get("https://api.github.com/user").mock(
            return_value=httpx.Response(401, json={"message": "Bad credentials"})
        )
        
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues found"
            }
            
            response = client.get(
                "/api/v1/match/match-issue",
                params={"keywords": ["python"]}
            )
            
            assert response.status_code == status.HTTP_200_OK
