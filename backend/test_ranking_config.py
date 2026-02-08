"""
Tests for the Ranking Configuration Service.
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.ranking_config_service import RankingConfigService, RankingStrategy
from app.services.mongodb_service import get_database


class TestRankingStrategy:
    """Test the RankingStrategy class."""

    def test_init(self):
        """Test RankingStrategy initialization."""
        config = [
            {"name": "semantic_relevance", "weight": 1.2},
            {"name": "repo_activity", "weight": 0.8}
        ]

        strategy = RankingStrategy(
            strategy_id="test_strategy",
            name="Test Strategy",
            description="A test strategy",
            dimension_configs=config
        )

        assert strategy.strategy_id == "test_strategy"
        assert strategy.name == "Test Strategy"
        assert strategy.description == "A test strategy"
        assert strategy.dimension_configs == config
        assert strategy.version == 1
        assert strategy.is_active == False
        assert strategy.created_at is not None
        assert strategy.updated_at is not None

    def test_to_dict(self):
        """Test conversion to dictionary."""
        config = [{"name": "semantic_relevance", "weight": 1.2}]
        strategy = RankingStrategy(
            strategy_id="test_strategy",
            name="Test Strategy",
            description="A test strategy",
            dimension_configs=config
        )

        data = strategy.to_dict()
        assert data["strategy_id"] == "test_strategy"
        assert data["name"] == "Test Strategy"
        assert data["description"] == "A test strategy"
        assert data["dimension_configs"] == config
        assert "created_at" in data
        assert "updated_at" in data

    def test_from_dict(self):
        """Test creation from dictionary."""
        data = {
            "strategy_id": "test_strategy",
            "name": "Test Strategy",
            "description": "A test strategy",
            "dimension_configs": [{"name": "semantic_relevance", "weight": 1.2}],
            "version": 1,
            "is_active": False,
            "created_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-01T00:00:00"
        }

        strategy = RankingStrategy.from_dict(data)
        assert strategy.strategy_id == "test_strategy"
        assert strategy.name == "Test Strategy"
        assert strategy.dimension_configs == [{"name": "semantic_relevance", "weight": 1.2}]


@pytest.mark.asyncio
class TestRankingConfigService:
    """Test the RankingConfigService class."""

    @patch('app.services.ranking_config_service.get_database')
    async def test_create_strategy_success(self, mock_get_database):
        """Test successful strategy creation."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        # Mock find_one to return None (strategy doesn't exist)
        mock_collection.find_one.return_value = None
        mock_collection.insert_one.return_value = MagicMock()

        config = [{"name": "semantic_relevance", "weight": 1.2}]
        strategy = RankingStrategy(
            strategy_id="test_strategy",
            name="Test Strategy",
            description="A test strategy",
            dimension_configs=config
        )

        result = await RankingConfigService.create_strategy(strategy)
        assert result == True

        mock_collection.insert_one.assert_called_once()

    @patch('app.services.ranking_config_service.get_database')
    async def test_create_strategy_duplicate(self, mock_get_database):
        """Test strategy creation with duplicate ID."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        # Mock find_one to return existing strategy
        mock_collection.find_one.return_value = {"strategy_id": "test_strategy"}

        config = [{"name": "semantic_relevance", "weight": 1.2}]
        strategy = RankingStrategy(
            strategy_id="test_strategy",
            name="Test Strategy",
            description="A test strategy",
            dimension_configs=config
        )

        result = await RankingConfigService.create_strategy(strategy)
        assert result == False

        mock_collection.insert_one.assert_not_called()

    @patch('app.services.ranking_config_service.get_database')
    async def test_get_strategy_success(self, mock_get_database):
        """Test successful strategy retrieval."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        data = {
            "strategy_id": "test_strategy",
            "name": "Test Strategy",
            "description": "A test strategy",
            "dimension_configs": [{"name": "semantic_relevance", "weight": 1.2}],
            "version": 1,
            "is_active": False,
            "created_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-01T00:00:00"
        }
        mock_collection.find_one.return_value = data

        strategy = await RankingConfigService.get_strategy("test_strategy")
        assert strategy is not None
        assert strategy.strategy_id == "test_strategy"

    @patch('app.services.ranking_config_service.get_database')
    async def test_get_strategy_not_found(self, mock_get_database):
        """Test strategy retrieval when not found."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        mock_collection.find_one.return_value = None

        strategy = await RankingConfigService.get_strategy("nonexistent")
        assert strategy is None

    @patch('app.services.ranking_config_service.get_database')
    async def test_get_active_strategy(self, mock_get_database):
        """Test getting the active strategy."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        data = {
            "strategy_id": "active_strategy",
            "name": "Active Strategy",
            "description": "An active strategy",
            "dimension_configs": [{"name": "semantic_relevance", "weight": 1.2}],
            "version": 1,
            "is_active": True,
            "created_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-01T00:00:00"
        }
        mock_collection.find_one.return_value = data

        strategy = await RankingConfigService.get_active_strategy()
        assert strategy is not None
        assert strategy.strategy_id == "active_strategy"
        assert strategy.is_active == True

    @patch('app.services.ranking_config_service.get_database')
    async def test_list_strategies(self, mock_get_database):
        """Test listing all strategies."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        data = [
            {
                "strategy_id": "strategy1",
                "name": "Strategy 1",
                "description": "First strategy",
                "dimension_configs": [{"name": "semantic_relevance", "weight": 1.2}],
                "version": 1,
                "is_active": False,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            },
            {
                "strategy_id": "strategy2",
                "name": "Strategy 2",
                "description": "Second strategy",
                "dimension_configs": [{"name": "semantic_relevance", "weight": 1.0}],
                "version": 1,
                "is_active": True,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        ]

        # Mock async cursor
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=data)
        mock_collection.find = MagicMock(return_value=mock_cursor)

        strategies = await RankingConfigService.list_strategies()
        assert len(strategies) == 2
        assert strategies[0].strategy_id == "strategy1"
        assert strategies[1].strategy_id == "strategy2"

    @patch('app.services.ranking_config_service.get_database')
    async def test_activate_strategy(self, mock_get_database):
        """Test activating a strategy."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        # Mock update operations
        mock_collection.update_many.return_value = MagicMock()
        mock_collection.update_one.return_value = MagicMock(modified_count=1)

        result = await RankingConfigService.activate_strategy("test_strategy")
        assert result == True

        # Verify that all strategies were deactivated first
        mock_collection.update_many.assert_called_once_with({}, {"$set": {"is_active": False}})

        # Verify that the specified strategy was activated
        mock_collection.update_one.assert_called_once()

    @patch('app.services.ranking_config_service.get_database')
    async def test_assign_user_strategy(self, mock_get_database):
        """Test assigning a strategy to a user."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        # Mock get_strategy to return a valid strategy
        with patch.object(RankingConfigService, 'get_strategy', return_value=AsyncMock()):
            mock_collection.update_one.return_value = MagicMock()

            result = await RankingConfigService.assign_user_strategy("user123", "strategy456")
            assert result == True

            mock_collection.update_one.assert_called_once()

    @patch('app.services.ranking_config_service.get_database')
    async def test_get_user_strategy(self, mock_get_database):
        """Test getting a user's assigned strategy."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        mock_collection.find_one.return_value = {"user_id": "user123", "strategy_id": "strategy456"}

        strategy_id = await RankingConfigService.get_user_strategy("user123")
        assert strategy_id == "strategy456"

    @patch('app.services.ranking_config_service.get_database')
    async def test_get_user_strategy_not_found(self, mock_get_database):
        """Test getting a user's strategy when not assigned."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        mock_collection.find_one.return_value = None

        strategy_id = await RankingConfigService.get_user_strategy("user123")
        assert strategy_id is None


if __name__ == "__main__":
    pytest.main([__file__])
