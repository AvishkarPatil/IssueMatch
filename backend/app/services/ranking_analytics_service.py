from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import logging
from .mongodb_service import get_database

logger = logging.getLogger(__name__)


class RankingAnalyticsService:
    """
    Service for tracking ranking strategy performance and analytics.
    """

    COLLECTION_NAME = "ranking_analytics"

    @staticmethod
    async def get_database():
        return get_database()

    @classmethod
    async def track_recommendation_click(cls, user_id: str, issue_id: int, strategy_id: str, final_score: float, dimension_scores: Dict[str, float], position: int) -> bool:
        """Track when a user clicks on a recommendation."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            event = {
                "event_type": "recommendation_click",
                "user_id": user_id,
                "issue_id": issue_id,
                "strategy_id": strategy_id,
                "final_score": final_score,
                "dimension_scores": dimension_scores,
                "position": position,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await collection.insert_one(event)
            logger.info(f"Tracked recommendation click for user {user_id}, issue {issue_id}")
            return True
        except Exception as e:
            logger.error(f"Error tracking recommendation click: {str(e)}")
            return False

    @classmethod
    async def track_recommendation_view(cls, user_id: str, strategy_id: str, recommendations_count: int, query_keywords: List[str]) -> bool:
        """Track when recommendations are viewed."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            event = {
                "event_type": "recommendation_view",
                "user_id": user_id,
                "strategy_id": strategy_id,
                "recommendations_count": recommendations_count,
                "query_keywords": query_keywords,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await collection.insert_one(event)
            logger.info(f"Tracked recommendation view for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error tracking recommendation view: {str(e)}")
            return False

    @classmethod
    async def get_strategy_performance(cls, strategy_id: str, days: int = 30) -> Dict[str, Any]:
        """Get performance metrics for a ranking strategy."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            # Calculate date threshold
            from datetime import timedelta
            threshold_date = datetime.now(timezone.utc) - timedelta(days=days)

            # Get click events for this strategy
            clicks_pipeline = [
                {
                    "$match": {
                        "event_type": "recommendation_click",
                        "strategy_id": strategy_id,
                        "timestamp": {"$gte": threshold_date.isoformat()}
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_clicks": {"$sum": 1},
                        "avg_position": {"$avg": "$position"},
                        "avg_final_score": {"$avg": "$final_score"},
                        "click_positions": {"$push": "$position"}
                    }
                }
            ]

            clicks_cursor = collection.aggregate(clicks_pipeline)
            clicks_result = await clicks_cursor.to_list(length=1)

            # Get view events for this strategy
            views_pipeline = [
                {
                    "$match": {
                        "event_type": "recommendation_view",
                        "strategy_id": strategy_id,
                        "timestamp": {"$gte": threshold_date.isoformat()}
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_views": {"$sum": 1},
                        "avg_recommendations": {"$avg": "$recommendations_count"}
                    }
                }
            ]

            views_result = await collection.aggregate(views_pipeline).to_list(length=1)

            clicks_data = clicks_result[0] if clicks_result else {}
            views_data = views_result[0] if views_result else {}

            total_clicks = clicks_data.get("total_clicks", 0)
            total_views = views_data.get("total_views", 0)

            return {
                "strategy_id": strategy_id,
                "period_days": days,
                "total_views": total_views,
                "total_clicks": total_clicks,
                "click_through_rate": (total_clicks / total_views) if total_views > 0 else 0,
                "avg_position_clicked": clicks_data.get("avg_position", 0),
                "avg_final_score_clicked": clicks_data.get("avg_final_score", 0),
                "avg_recommendations_per_view": views_data.get("avg_recommendations", 0)
            }

        except Exception as e:
            logger.error(f"Error getting strategy performance: {str(e)}")
            return {}

    @classmethod
    async def get_user_engagement(cls, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get engagement metrics for a specific user."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            # Calculate date threshold
            from datetime import timedelta
            threshold_date = datetime.now(timezone.utc) - timedelta(days=days)

            # Get user's events
            pipeline = [
                {
                    "$match": {
                        "user_id": user_id,
                        "timestamp": {"$gte": threshold_date.isoformat()}
                    }
                },
                {
                    "$group": {
                        "_id": "$event_type",
                        "count": {"$sum": 1},
                        "details": {"$push": "$$ROOT"}
                    }
                }
            ]

            results_cursor = collection.aggregate(pipeline)
            results = await results_cursor.to_list(length=None)

            engagement = {
                "user_id": user_id,
                "period_days": days,
                "views": 0,
                "clicks": 0,
                "strategies_used": set(),
                "avg_click_position": 0
            }

            for result in results:
                event_type = result["_id"]
                count = result["count"]

                if event_type == "recommendation_view":
                    engagement["views"] = count
                elif event_type == "recommendation_click":
                    engagement["clicks"] = count
                    # Calculate average click position
                    positions = [detail["position"] for detail in result["details"]]
                    engagement["avg_click_position"] = sum(positions) / len(positions) if positions else 0

                    # Collect strategies used
                    for detail in result["details"]:
                        engagement["strategies_used"].add(detail["strategy_id"])

            engagement["strategies_used"] = list(engagement["strategies_used"])
            engagement["click_through_rate"] = (engagement["clicks"] / engagement["views"]) if engagement["views"] > 0 else 0

            return engagement

        except Exception as e:
            logger.error(f"Error getting user engagement: {str(e)}")
            return {}
