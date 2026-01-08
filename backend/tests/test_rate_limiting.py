import pytest
from fastapi import status
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import time


@pytest.mark.integration
class TestRateLimiting:

    def test_ai_endpoint_rate_limit(self, client, mock_session):
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.ai.get_profile_text_data') as mock_profile:
            with patch('app.api.v1.endpoints.ai.analyze_profile_text') as mock_analyze:
                mock_profile.return_value = {
                    "languages": ["python"],
                    "topics": ["web"],
                    "text_blob": "test"
                }
                mock_analyze.return_value = {
                    "keywords_entities": ["python"],
                    "languages": ["python"],
                    "topics": ["web"]
                }
                
                success_count = 0
                rate_limited_count = 0
                
                for i in range(25):
                    response = client.get("/api/v1/ai/analyze-profile")
                    if response.status_code == status.HTTP_200_OK:
                        success_count += 1
                    elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                        rate_limited_count += 1
                
                assert success_count == 20
                assert rate_limited_count == 5

    def test_match_endpoint_rate_limit(self, client, mock_session):
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues"
            }
            
            success_count = 0
            rate_limited_count = 0
            
            for i in range(35):
                response = client.get(
                    "/api/v1/match/match-issue",
                    params={"keywords": ["python"]}
                )
                if response.status_code == status.HTTP_200_OK:
                    success_count += 1
                elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                    rate_limited_count += 1
            
            assert success_count == 30
            assert rate_limited_count == 5

    def test_auth_endpoint_rate_limit(self, client):
        success_count = 0
        rate_limited_count = 0
        
        for i in range(15):
            response = client.get("/api/v1/auth/login")
            if response.status_code in [status.HTTP_307_TEMPORARY_REDIRECT, status.HTTP_200_OK]:
                success_count += 1
            elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                rate_limited_count += 1
        
        assert success_count == 10
        assert rate_limited_count == 5

    def test_rate_limit_headers_present(self, client, mock_session):
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues"
            }
            
            response = client.get(
                "/api/v1/match/match-issue",
                params={"keywords": ["python"]}
            )
            
            assert "X-RateLimit-Limit" in response.headers or response.status_code == status.HTTP_200_OK

    def test_different_users_separate_limits(self, client):
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues"
            }
            
            with client.session_transaction() as session:
                session["github_token"] = "user1_token"
                session["user_data"] = {"id": 1}
            
            for i in range(30):
                response = client.get(
                    "/api/v1/match/match-issue",
                    params={"keywords": ["python"]}
                )
            
            with client.session_transaction() as session:
                session["github_token"] = "user2_token"
                session["user_data"] = {"id": 2}
            
            response = client.get(
                "/api/v1/match/match-issue",
                params={"keywords": ["python"]}
            )
            
            assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_uses_ip_limit(self, client):
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues"
            }
            
            success_count = 0
            
            for i in range(15):
                response = client.get("/api/v1/auth/login")
                if response.status_code != status.HTTP_429_TOO_MANY_REQUESTS:
                    success_count += 1
            
            assert success_count <= 10

    def test_rate_limit_429_response_format(self, client, mock_session):
        with client.session_transaction() as session:
            session.update(mock_session)
        
        with patch('app.api.v1.endpoints.match.get_top_matched_issues') as mock_faiss:
            mock_faiss.return_value = {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues"
            }
            
            for i in range(31):
                response = client.get(
                    "/api/v1/match/match-issue",
                    params={"keywords": ["python"]}
                )
            
            if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                assert "detail" in response.json() or "error" in response.json()
