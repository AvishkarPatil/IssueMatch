from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from ....services.ranking_config_service import RankingConfigService, RankingStrategy
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for API
class DimensionConfig(BaseModel):
    name: str = Field(..., description="Dimension name (e.g., 'semantic_relevance')")
    weight: float = Field(..., ge=0.0, description="Weight for this dimension")


class RankingStrategyCreate(BaseModel):
    strategy_id: str = Field(..., description="Unique identifier for the strategy")
    name: str = Field(..., description="Human-readable name")
    description: str = Field(..., description="Description of the strategy")
    dimension_configs: List[DimensionConfig] = Field(..., description="List of dimension configurations")


class RankingStrategyResponse(BaseModel):
    strategy_id: str
    name: str
    description: str
    dimension_configs: List[Dict[str, Any]]
    version: int
    is_active: bool
    created_at: str
    updated_at: str


class RankingStrategyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    dimension_configs: Optional[List[DimensionConfig]] = None


@router.post(
    "/strategies",
    response_model=RankingStrategyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ranking strategy",
    tags=["Admin", "Ranking"]
)
async def create_strategy(strategy_data: RankingStrategyCreate):
    """
    Create a new ranking strategy configuration.

    This endpoint allows administrators to create new ranking strategies
    with custom dimension weights for A/B testing and experimentation.
    """
    try:
        strategy = RankingStrategy(
            strategy_id=strategy_data.strategy_id,
            name=strategy_data.name,
            description=strategy_data.description,
            dimension_configs=[config.dict() for config in strategy_data.dimension_configs]
        )

        success = await RankingConfigService.create_strategy(strategy)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Strategy with ID '{strategy.strategy_id}' already exists"
            )

        created_strategy = await RankingConfigService.get_strategy(strategy.strategy_id)
        if not created_strategy:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created strategy"
            )

        return RankingStrategyResponse(**created_strategy.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating strategy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create strategy: {str(e)}"
        )


@router.get(
    "/strategies",
    response_model=List[RankingStrategyResponse],
    summary="List all ranking strategies",
    tags=["Admin", "Ranking"]
)
async def list_strategies():
    """
    Get a list of all ranking strategies.
    """
    try:
        strategies = await RankingConfigService.list_strategies()
        return [RankingStrategyResponse(**s.to_dict()) for s in strategies]
    except Exception as e:
        logger.error(f"Error listing strategies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list strategies: {str(e)}"
        )


@router.get(
    "/strategies/{strategy_id}",
    response_model=RankingStrategyResponse,
    summary="Get a specific ranking strategy",
    tags=["Admin", "Ranking"]
)
async def get_strategy(strategy_id: str):
    """
    Get details of a specific ranking strategy.
    """
    try:
        strategy = await RankingConfigService.get_strategy(strategy_id)
        if not strategy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Strategy '{strategy_id}' not found"
            )
        return RankingStrategyResponse(**strategy.to_dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting strategy {strategy_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get strategy: {str(e)}"
        )


@router.put(
    "/strategies/{strategy_id}",
    response_model=RankingStrategyResponse,
    summary="Update a ranking strategy",
    tags=["Admin", "Ranking"]
)
async def update_strategy(strategy_id: str, updates: RankingStrategyUpdate):
    """
    Update an existing ranking strategy.
    """
    try:
        update_dict = updates.dict(exclude_unset=True)
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Convert dimension configs to dict format
        if "dimension_configs" in update_dict:
            update_dict["dimension_configs"] = [config.dict() for config in update_dict["dimension_configs"]]

        success = await RankingConfigService.update_strategy(strategy_id, update_dict)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Strategy '{strategy_id}' not found"
            )

        updated_strategy = await RankingConfigService.get_strategy(strategy_id)
        return RankingStrategyResponse(**updated_strategy.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating strategy {strategy_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update strategy: {str(e)}"
        )


@router.put(
    "/strategies/{strategy_id}/activate",
    summary="Activate a ranking strategy",
    tags=["Admin", "Ranking"]
)
async def activate_strategy(strategy_id: str):
    """
    Activate a ranking strategy. This will deactivate all other strategies.
    """
    try:
        success = await RankingConfigService.activate_strategy(strategy_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Strategy '{strategy_id}' not found"
            )

        return {"message": f"Strategy '{strategy_id}' activated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating strategy {strategy_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to activate strategy: {str(e)}"
        )


@router.delete(
    "/strategies/{strategy_id}",
    summary="Delete a ranking strategy",
    tags=["Admin", "Ranking"]
)
async def delete_strategy(strategy_id: str):
    """
    Delete a ranking strategy. Cannot delete active strategy.
    """
    try:
        # Check if strategy is active
        strategy = await RankingConfigService.get_strategy(strategy_id)
        if not strategy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Strategy '{strategy_id}' not found"
            )

        if strategy.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete active strategy"
            )

        success = await RankingConfigService.delete_strategy(strategy_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete strategy"
            )

        return {"message": f"Strategy '{strategy_id}' deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting strategy {strategy_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete strategy: {str(e)}"
        )


@router.get(
    "/strategies/active",
    response_model=Optional[RankingStrategyResponse],
    summary="Get the currently active ranking strategy",
    tags=["Admin", "Ranking"]
)
async def get_active_strategy():
    """
    Get the currently active ranking strategy.
    """
    try:
        strategy = await RankingConfigService.get_active_strategy()
        if strategy:
            return RankingStrategyResponse(**strategy.to_dict())
        return None
    except Exception as e:
        logger.error(f"Error getting active strategy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get active strategy: {str(e)}"
        )
