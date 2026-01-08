"""
Pytest configuration and shared fixtures for IssueMatch backend tests.

This file provides common fixtures used across all test files.
"""

import pytest
from fastapi.testclient import TestClient
from starlette.middleware.sessions import SessionMiddleware
from unittest.mock import Mock, AsyncMock, MagicMock
from typing import Dict, Any
import httpx


@pytest.fixture
def mock_settings():
    """Mock application settings."""
    class MockSettings:
        PROJECT_NAME = "IssueMatch Test"
        API_V1_STR = "/api/v1"
        GITHUB_CLIENT_ID = "test_client_id"
        GITHUB_CLIENT_SECRET = "test_client_secret"
        SECRET_KEY = "test_secret_key_for_sessions_minimum_32_chars_long_enough"
        MONGODB_URI = "mongodb://localhost:27017/test"
        GOOGLE_AI_STUDIO_API_KEY = "test_gemini_key"
    
    return MockSettings()


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    # Import here to avoid circular imports
    from fastapi.testclient import TestClient
    from app.main import app
    
    return TestClient(app)


@pytest.fixture
def mock_session():
    """Mock session data for authenticated requests."""
    return {
        "github_token": "test_github_token_12345",
        "github_scope": "read:user user:email repo",
        "github_token_type": "bearer",
        "oauth_state": "test_state_12345"
    }


@pytest.fixture
def authenticated_client(client, mock_session):
    """Create a test client with an authenticated session."""
    with client.session_transaction() as session:
        session.update(mock_session)
    return client


@pytest.fixture
def mock_github_user_response():
    """Mock GitHub user API response."""
    return {
        "id": 12345678,
        "login": "testuser",
        "name": "Test User",
        "email": "test@example.com",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345678",
        "bio": "Test bio",
        "location": "Test Location",
        "company": "Test Company",
        "public_repos": 10,
        "total_private_repos": 5,
        "followers": 100,
        "following": 50
    }


@pytest.fixture
def mock_github_repos_response():
    """Mock GitHub repositories API response."""
    return [
        {
            "id": 1,
            "name": "test-repo-1",
            "full_name": "testuser/test-repo-1",
            "description": "A test repository for Python",
            "language": "Python",
            "topics": ["python", "testing", "api"],
            "pushed_at": "2024-01-01T00:00:00Z",
            "url": "https://api.github.com/repos/testuser/test-repo-1"
        },
        {
            "id": 2,
            "name": "test-repo-2",
            "full_name": "testuser/test-repo-2",
            "description": "A JavaScript project",
            "language": "JavaScript",
            "topics": ["javascript", "web", "frontend"],
            "pushed_at": "2024-01-02T00:00:00Z",
            "url": "https://api.github.com/repos/testuser/test-repo-2"
        }
    ]


@pytest.fixture
def mock_github_issues_response():
    """Mock GitHub issues search API response."""
    return {
        "total_count": 2,
        "incomplete_results": False,
        "items": [
            {
                "id": 1001,
                "html_url": "https://github.com/owner/repo/issues/1",
                "repository_url": "https://api.github.com/repos/owner/repo",
                "title": "Add Python support",
                "body": "We need to add Python support to this project",
                "state": "open",
                "created_at": "2024-01-01T00:00:00Z",
                "user": {"login": "contributor1"},
                "labels": [
                    {"name": "good first issue"},
                    {"name": "python"}
                ]
            },
            {
                "id": 1002,
                "html_url": "https://github.com/owner/repo/issues/2",
                "repository_url": "https://api.github.com/repos/owner/repo",
                "title": "Fix JavaScript bug",
                "body": "There's a bug in the JavaScript code",
                "state": "open",
                "created_at": "2024-01-02T00:00:00Z",
                "user": {"login": "contributor2"},
                "labels": [
                    {"name": "bug"},
                    {"name": "javascript"}
                ]
            }
        ]
    }


@pytest.fixture
def mock_mongodb():
    """Mock MongoDB database."""
    mock_db = MagicMock()
    
    # Mock collections
    mock_db.users = MagicMock()
    mock_db.leaderboard = MagicMock()
    mock_db.contributions = MagicMock()
    mock_db.mentorship_requests = MagicMock()
    mock_db.referrals = MagicMock()
    
    # Mock async methods
    mock_db.users.find_one = AsyncMock(return_value=None)
    mock_db.users.update_one = AsyncMock()
    mock_db.users.insert_one = AsyncMock()
    
    return mock_db


@pytest.fixture
def mock_sentence_transformer():
    """Mock SentenceTransformer model."""
    mock_model = MagicMock()
    mock_model.encode = MagicMock(return_value=[[0.1] * 384])  # 384-dim embedding
    return mock_model


@pytest.fixture
def mock_faiss_index():
    """Mock FAISS index."""
    mock_index = MagicMock()
    mock_index.ntotal = 10
    mock_index.add = MagicMock()
    mock_index.search = MagicMock(return_value=(
        [[0.1, 0.2, 0.3]],  # distances
        [[0, 1, 2]]  # indices
    ))
    return mock_index


@pytest.fixture
async def mock_httpx_client():
    """Mock httpx AsyncClient for testing."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    return mock_client


@pytest.fixture
def mock_google_nlp_response():
    """Mock Google Cloud NLP API response."""
    return {
        "entities": [
            {
                "name": "Python",
                "type": "OTHER",
                "salience": 0.5,
                "mentions": [{"text": {"content": "Python"}}]
            },
            {
                "name": "FastAPI",
                "type": "OTHER",
                "salience": 0.3,
                "mentions": [{"text": {"content": "FastAPI"}}]
            }
        ]
    }


@pytest.fixture
def mock_gemini_response():
    """Mock Gemini AI response."""
    return {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": 'state:open type:issue language:python label:"good first issue"'
                        }
                    ]
                }
            }
        ]
    }


# Pytest async configuration
@pytest.fixture(scope="session")
def event_loop_policy():
    """Set event loop policy for async tests."""
    import asyncio
    return asyncio.get_event_loop_policy()
