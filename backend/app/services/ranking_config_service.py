from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import logging
from .mongodb_service import get_database
from .ranking_service import RankingDimension, CompositeRanker, SemanticRelevanceScorer, RepoActivityScorer, DifficultyMatchScorer, MentorAvailabilityScorer, ImpactScorer

logger = logging.getLogger(__name__)


class RankingStrategy:
    """
    Represents a ranking strategy configuration stored in MongoDB.
    """

    def __init__(self, strategy_id: str, name: str, description: str, dimension_configs: List[Dict[str, Any]], version: int = 1, is_active: bool = False, created_at: Optional[datetime] = None, updated_at: Optional[datetime] = None):
        self.strategy_id = strategy_id
        self.name = name
        self.description = description
        self.dimension_configs = dimension_configs  # List of {"name": str, "weight": float}
        self.version = version
        self.is_active = is_active
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "strategy_id": self.strategy_id,
            "name": self.name,
            "description": self.description,
            "dimension_configs": self.dimension_configs,
            "version": self.version,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RankingStrategy':
        return cls(
            strategy_id=data["strategy_id"],
            name=data["name"],
            description=data["description"],
            dimension_configs=data["dimension_configs"],
            version=data.get("version", 1),
            is_active=data.get("is_active", False),
            created_at=datetime.fromisoformat(data["created_at"]) if "created_at" in data else None,
            updated_at=datetime.fromisoformat(data["updated_at"]) if "updated_at" in data else None
        )


class RankingConfigService:
    """
    Service for managing ranking strategy configurations in MongoDB.
    """

    COLLECTION_NAME = "ranking_strategies"
    USER_STRATEGIES_COLLECTION = "user_ranking_strategies"

    @staticmethod
    async def get_database():
        return get_database()

    @staticmethod
    def _get_dimension_class(name: str) -> type:
        """Get the dimension class by name."""
        dimension_map = {
            "semantic_relevance": SemanticRelevanceScorer,
            "repo_activity": RepoActivityScorer,
            "difficulty_match": DifficultyMatchScorer,
            "mentor_availability": MentorAvailabilityScorer,
            "impact": ImpactScorer
        }
        return dimension_map.get(name)

    @staticmethod
    def _create_ranker_from_config(dimension_configs: List[Dict[str, Any]]) -> CompositeRanker:
        """Create a CompositeRanker from dimension configurations."""
        dimensions = []
        for config in dimension_configs:
            dim_class = RankingConfigService._get_dimension_class(config["name"])
            if dim_class:
                dimensions.append(dim_class(weight=config["weight"]))
        return CompositeRanker(dimensions)

    @classmethod
    async def create_strategy(cls, strategy: RankingStrategy) -> bool:
        """Create a new ranking strategy."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            # Check if strategy_id already exists
            existing = await collection.find_one({"strategy_id": strategy.strategy_id})
            if existing:
                logger.warning(f"Strategy {strategy.strategy_id} already exists")
                return False

            await collection.insert_one(strategy.to_dict())
            logger.info(f"Created ranking strategy: {strategy.strategy_id}")
            return True
        except Exception as e:
            logger.error(f"Error creating strategy: {str(e)}")
            return False

    @classmethod
    async def get_strategy(cls, strategy_id: str) -> Optional[RankingStrategy]:
        """Get a ranking strategy by ID."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]
            data = await collection.find_one({"strategy_id": strategy_id})
            return RankingStrategy.from_dict(data) if data else None
        except Exception as e:
            logger.error(f"Error getting strategy {strategy_id}: {str(e)}")
            return None

    @classmethod
    async def get_active_strategy(cls) -> Optional[RankingStrategy]:
        """Get the currently active ranking strategy."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]
            data = await collection.find_one({"is_active": True})
            return RankingStrategy.from_dict(data) if data else None
        except Exception as e:
            logger.error(f"Error getting active strategy: {str(e)}")
            return None

    @classmethod
    async def list_strategies(cls) -> List[RankingStrategy]:
        """List all ranking strategies."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]
            cursor = collection.find({})
            docs = await cursor.to_list(length=None)
            strategies = [RankingStrategy.from_dict(doc) for doc in docs]
            return strategies
        except Exception as e:
            logger.error(f"Error listing strategies: {str(e)}")
            return []

    @classmethod
    async def update_strategy(cls, strategy_id: str, updates: Dict[str, Any]) -> bool:
        """Update a ranking strategy."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            updates["updated_at"] = datetime.now(timezone.utc).isoformat()
            result = await collection.update_one(
                {"strategy_id": strategy_id},
                {"$set": updates}
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated strategy: {strategy_id}")
            return success
        except Exception as e:
            logger.error(f"Error updating strategy {strategy_id}: {str(e)}")
            return False

    @classmethod
    async def activate_strategy(cls, strategy_id: str) -> bool:
        """Activate a ranking strategy (deactivate others)."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]

            # Deactivate all strategies
            await collection.update_many({}, {"$set": {"is_active": False}})

            # Activate the specified strategy
            result = await collection.update_one(
                {"strategy_id": strategy_id},
                {"$set": {"is_active": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Activated strategy: {strategy_id}")
            return success
        except Exception as e:
            logger.error(f"Error activating strategy {strategy_id}: {str(e)}")
            return False

    @classmethod
    async def delete_strategy(cls, strategy_id: str) -> bool:
        """Delete a ranking strategy."""
        try:
            db = await cls.get_database()
            collection = db[cls.COLLECTION_NAME]
            result = await collection.delete_one({"strategy_id": strategy_id})
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted strategy: {strategy_id}")
            return success
        except Exception as e:
            logger.error(f"Error deleting strategy {strategy_id}: {str(e)}")
            return False

    @classmethod
    async def get_ranker_for_strategy(cls, strategy_id: Optional[str] = None) -> CompositeRanker:
        """Get a CompositeRanker for the specified strategy or active one."""
        if strategy_id:
            strategy = await cls.get_strategy(strategy_id)
        else:
            strategy = await cls.get_active_strategy()

        if strategy:
            return cls._create_ranker_from_config(strategy.dimension_configs)
        else:
            # Fallback to default ranker
            from .ranking_service import create_default_ranker
            logger.warning("No active strategy found, using default ranker")
            return create_default_ranker()

    @classmethod
    async def assign_user_strategy(cls, user_id: str, strategy_id: str) -> bool:
        """Assign a ranking strategy to a user."""
        try:
            db = await cls.get_database()
            collection = db[cls.USER_STRATEGIES_COLLECTION]

            # Check if strategy exists
            strategy = await cls.get_strategy(strategy_id)
            if not strategy:
                logger.warning(f"Strategy {strategy_id} does not exist")
                return False

            # Upsert user strategy assignment
            await collection.update_one(
                {"user_id": user_id},
                {"$set": {
                    "strategy_id": strategy_id,
                    "assigned_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            logger.info(f"Assigned strategy {strategy_id} to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error assigning strategy to user: {str(e)}")
            return False

    @classmethod
    async def get_user_strategy(cls, user_id: str) -> Optional[str]:
        """Get the assigned strategy ID for a user."""
        try:
            db = await cls.get_database()
            collection = db[cls.USER_STRATEGIES_COLLECTION]
            data = await collection.find_one({"user_id": user_id})
            return data.get("strategy_id") if data else None
        except Exception as e:
            logger.error(f"Error getting user strategy: {str(e)}")
            return None

    @classmethod
    async def get_ranker_for_user(cls, user_id: Optional[str] = None) -> CompositeRanker:
        """Get a CompositeRanker for the user's assigned strategy or active one."""
        if user_id:
            user_strategy_id = await cls.get_user_strategy(user_id)
            if user_strategy_id:
                return await cls.get_ranker_for_strategy(user_strategy_id)

        # Fallback to active strategy or default
        return await cls.get_ranker_for_strategy()


# Initialize with default strategy on startup
async def initialize_default_strategy():
    """Create and activate the default ranking strategy if it doesn't exist."""
    try:
        service = RankingConfigService()
        existing = await service.get_strategy("default_v1")

        if not existing:
            default_config = [
                {"name": "semantic_relevance", "weight": 1.2},
                {"name": "repo_activity", "weight": 0.8},
                {"name": "difficulty_match", "weight": 0.7},
                {"name": "mentor_availability", "weight": 0.6},
                {"name": "impact", "weight": 0.9}
            ]

            default_strategy = RankingStrategy(
                strategy_id="default_v1",
                name="Default Multi-Objective Ranking",
                description="Balanced ranking with all dimensions enabled",
                dimension_configs=default_config,
                is_active=True
            )

            await service.create_strategy(default_strategy)
            logger.info("Initialized default ranking strategy")
    except Exception as e:
        logger.error(f"Error initializing default strategy: {str(e)}")
