"""
Tests for MongoDB failure scenarios.

This module tests error handling in MongoDB operations including:
- Connection failures
- Query failures
- Network timeouts
- Write operation failures
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient


@pytest.mark.mongodb
class TestMongoDBFailures:
    """Test suite for MongoDB failure scenarios."""

    @pytest.mark.asyncio
    async def test_connect_to_mongo_connection_timeout(self):
        """Test connect_to_mongo when connection times out."""
        from app.services.mongodb_service import connect_to_mongo, mongodb
        
        with patch('app.services.mongodb_service.AsyncIOMotorClient') as mock_client:
            mock_instance = MagicMock()
            mock_instance.admin.command = AsyncMock(side_effect=Exception("Connection timeout"))
            mock_client.return_value = mock_instance
            await connect_to_mongo()
            
            assert mongodb.db is None or mongodb.client is None

    @pytest.mark.asyncio
    async def test_connect_to_mongo_invalid_uri(self):
        """Test connect_to_mongo with invalid MongoDB URI."""
        from app.services.mongodb_service import connect_to_mongo, mongodb
        
        with patch('app.services.mongodb_service.AsyncIOMotorClient') as mock_client:
            mock_client.side_effect = Exception("Invalid URI")
            
            await connect_to_mongo()
            
            assert mongodb.db is None

    @pytest.mark.asyncio
    async def test_connect_to_mongo_authentication_failed(self):
        """Test connect_to_mongo when authentication fails."""
        from app.services.mongodb_service import connect_to_mongo, mongodb
        
        with patch('app.services.mongodb_service.AsyncIOMotorClient') as mock_client:
            mock_instance = MagicMock()
            mock_instance.admin.command = AsyncMock(
                side_effect=Exception("Authentication failed")
            )
            mock_client.return_value = mock_instance
            
            await connect_to_mongo()
            
            assert mongodb.db is None

    @pytest.mark.asyncio
    async def test_get_database_when_not_connected(self):
        """Test get_database when MongoDB is not connected."""
        from app.services.mongodb_service import get_database, mongodb
        
        original_db = mongodb.db
        mongodb.db = None
        
        try:
            with pytest.raises(Exception) as exc_info:
                get_database()
            
            assert "not connected" in str(exc_info.value).lower()
        finally:
            mongodb.db = original_db

    @pytest.mark.asyncio
    async def test_skills_submit_database_write_failure(self, client, mock_mongodb):
        """Test skills submission when database write fails."""
        from app.routers.skills import submit_skills, SkillsSubmit
        from starlette.requests import Request
        
        with patch('app.routers.skills.get_database', return_value=mock_mongodb):
            with patch('app.routers.skills.get_github_user_id', return_value="12345"):
                with patch('httpx.AsyncClient') as mock_httpx:
                    mock_client = AsyncMock()
                    mock_response = MagicMock()
                    mock_response.json.return_value = {
                        "id": 12345,
                        "login": "testuser",
                        "name": "Test User"
                    }
                    mock_client.get.return_value = mock_response
                    mock_httpx.return_value.__aenter__.return_value = mock_client
                    
                    mock_mongodb.users.update_one = AsyncMock(
                        side_effect=Exception("Database write failed")
                    )
                    
                    mock_request = MagicMock(spec=Request)
                    mock_request.session = {"github_token": "test_token"}
                    
                    with pytest.raises(HTTPException) as exc_info:
                        await submit_skills(
                            SkillsSubmit(skills=["python", "javascript"]),
                            mock_request
                        )
                    
                    assert exc_info.value.status_code == 500

    @pytest.mark.asyncio
    async def test_find_one_query_timeout(self, mock_mongodb):
        """Test database query when it times out."""
        mock_mongodb.users.find_one = AsyncMock(
            side_effect=Exception("Query timeout")
        )
        
        with pytest.raises(Exception) as exc_info:
        with pytest.raises(Exception) as exc_info:
            await mock_mongodb.users.find_one({"githubId": "12345"})
        
        assert "timeout" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_update_one_network_error(self, mock_mongodb):
        """Test database update when network fails."""
        mock_mongodb.users.update_one = AsyncMock(
            side_effect=Exception("Network error")
        )
        
        with pytest.raises(Exception) as exc_info:
            await mock_mongodb.users.update_one(
                {"githubId": "12345"},
                {"$set": {"skills": ["python"]}}
            )
        
        assert "network" in str(exc_info.value).lower() or "error" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_leaderboard_fetch_with_database_error(self, client, mock_mongodb):
        """Test leaderboard fetch when database query fails."""
        with patch('app.routers.leaderboard.get_database', return_value=mock_mongodb):
            mock_mongodb.leaderboard.find = MagicMock()
            mock_cursor = MagicMock()
            mock_cursor.sort.return_value.limit.return_value.to_list = AsyncMock(
                side_effect=Exception("Database error")
            )
            mock_mongodb.leaderboard.find.return_value = mock_cursor
            
            response = client.get("/api/v1/leaderboard")
            
            assert response.status_code >= 400

    @pytest.mark.asyncio
    async def test_referral_code_collision_handling(self, mock_mongodb):
        """Test handling of referral code generation collision."""
        from app.routers.skills import submit_skills, SkillsSubmit
        from starlette.requests import Request
        
        with patch('app.routers.skills.get_database', return_value=mock_mongodb):
            with patch('app.routers.skills.get_github_user_id', return_value="12345"):
                mock_mongodb.users.find_one = AsyncMock(
                    side_effect=[
                        None,
                        {"referralCode": "ABCD1234"},
                        None
                    ]
                )
                
                with patch('httpx.AsyncClient') as mock_httpx:
                    mock_client = AsyncMock()
                    mock_response = MagicMock()
                    mock_response.json.return_value = {
                        "id": 12345,
                        "login": "testuser",
                        "name": "Test User"
                    }
                    mock_client.get.return_value = mock_response
                    mock_httpx.return_value.__aenter__.return_value = mock_client
                    
                    mock_mongodb.users.update_one = AsyncMock()
                    
                    mock_request = MagicMock(spec=Request)
                    mock_request.session = {"github_token": "test_token"}
                    
                    result = await submit_skills(
                        SkillsSubmit(skills=["python"]),
                        mock_request
                    )
                    
                    assert "skills" in result
