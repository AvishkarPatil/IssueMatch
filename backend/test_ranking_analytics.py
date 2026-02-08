"""
Tests for the Ranking Analytics Service.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.ranking_analytics_service import RankingAnalyticsService


@pytest.mark.asyncio
class TestRankingAnalyticsService:
    """Test the RankingAnalyticsService class."""

    @patch('app.services.ranking_analytics_service.get_database')
    async def test_track_recommendation_click(self, mock_get_database):
        """Test tracking recommendation clicks."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        mock_collection.insert_one.return_value = MagicMock()

        result = await RankingAnalyticsService.track_recommendation_click(
            user_id="user123",
            issue_id=456,
            strategy_id="strategy1",
            final_score=0.85,
            dimension_scores={"semantic_relevance": 0.9, "repo_activity": 0.8},
            position=2
        )

        assert result == True
        mock_collection.insert_one.assert_called_once()

    @patch('app.services.ranking_analytics_service.get_database')
    async def test_track_recommendation_view(self, mock_get_database):
        """Test tracking recommendation views."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        mock_collection.insert_one.return_value = MagicMock()

        result = await RankingAnalyticsService.track_recommendation_view(
            user_id="user123",
            strategy_id="strategy1",
            recommendations_count=10,
            query_keywords=["python", "web"]
        )

        assert result == True
        mock_collection.insert_one.assert_called_once()

    @patch('app.services.ranking_analytics_service.get_database')
    async def test_get_strategy_performance(self, mock_get_database):
        """Test getting strategy performance metrics."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        # Mock aggregation results
        clicks_result = [{"total_clicks": 50, "avg_position": 3.2, "avg_final_score": 0.75}]
        views_result = [{"total_views": 200, "avg_recommendations": 8.5}]

        mock_clicks_cursor = MagicMock()
        mock_clicks_cursor.to_list = AsyncMock(return_value=clicks_result)
        mock_views_cursor = MagicMock()
        mock_views_cursor.to_list = AsyncMock(return_value=views_result)

        mock_collection.aggregate = MagicMock(side_effect=[mock_clicks_cursor, mock_views_cursor])

        performance = await RankingAnalyticsService.get_strategy_performance("strategy1", days=30)

        assert performance["strategy_id"] == "strategy1"
        assert performance["total_views"] == 200
        assert performance["total_clicks"] == 50
        assert performance["click_through_rate"] == 0.25  # 50/200
        assert performance["avg_position_clicked"] == 3.2

    @patch('app.services.ranking_analytics_service.get_database')
    async def test_get_user_engagement(self, mock_get_database):
        """Test getting user engagement metrics."""
        # Mock database
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_get_database.return_value = mock_db

        # Mock aggregation results
        mock_results = [
            {"_id": "recommendation_view", "count": 15, "details": []},
            {"_id": "recommendation_click", "count": 3, "details": [
                {"position": 1, "strategy_id": "strategy1"}, {"position": 2, "strategy_id": "strategy2"}, {"position": 5, "strategy_id": "strategy1"}
            ]}
        ]

        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=mock_results)
        mock_collection.aggregate = MagicMock(return_value=mock_cursor)

        engagement = await RankingAnalyticsService.get_user_engagement("user123", days=30)

        assert engagement["user_id"] == "user123"
        assert engagement["views"] == 15
        assert engagement["clicks"] == 3
        assert engagement["avg_click_position"] == 2.6666666666666665  # (1+2+5)/3
        assert engagement["click_through_rate"] == 0.2  # 3/15


if __name__ == "__main__":
    pytest.main([__file__])
