from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.models.query_performance import (
    QueryFeedback,
    QueryInteraction,
    InteractionType,
    QueryStrategy
)
from app.services.query_performance_service import QueryPerformanceTracker
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI Query Feedback"],
)

# Request/Response Models
class QueryFeedbackRequest(BaseModel):
    query_id: str = Field(..., description="Query ID to provide feedback for")
    relevance_score: float = Field(..., ge=1.0, le=5.0, description="How relevant were the results (1-5)")
    usefulness_score: float = Field(..., ge=1.0, le=5.0, description="How useful were the results (1-5)")
    comments: Optional[str] = Field(default=None, description="Additional feedback comments")
    suggested_keywords: Optional[List[str]] = Field(default=None, description="Better keywords to use")
    suggested_languages: Optional[List[str]] = Field(default=None, description="Better languages to focus on")
    suggested_topics: Optional[List[str]] = Field(default=None, description="Better topics to include")

class InteractionRequest(BaseModel):
    query_id: str = Field(..., description="Query ID this interaction relates to")
    interaction_type: InteractionType = Field(..., description="Type of interaction")
    issue_id: Optional[str] = Field(default=None, description="GitHub issue ID if applicable")
    result_position: Optional[int] = Field(default=None, description="Position in search results (0-based)")
    time_spent: Optional[float] = Field(default=None, description="Time spent in seconds")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional interaction metadata")

class AnalyticsResponse(BaseModel):
    total_queries: int = Field(..., description="Total queries generated")
    total_interactions: int = Field(..., description="Total user interactions")
    avg_conversion_rate: float = Field(..., description="Average click-through rate")
    avg_engagement_score: float = Field(..., description="Average engagement score")
    queries_last_30_days: int = Field(..., description="Queries in last 30 days")

class OptimizedQueryRequest(BaseModel):
    keywords: List[str] = Field(default_factory=list, description="Technical keywords/skills")
    languages: List[str] = Field(default_factory=list, description="Programming languages")
    topics: List[str] = Field(default_factory=list, description="Topics of interest")

class OptimizedQueryResponse(BaseModel):
    queries: List[Dict[str, Any]] = Field(..., description="Generated optimized queries with metadata")
    total_generated: int = Field(..., description="Number of queries generated")
    message: str = Field(..., description="Status message")

# --- API Endpoints ---

@router.post("/query-feedback", status_code=status.HTTP_201_CREATED)
async def submit_query_feedback(
    feedback_request: QueryFeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit feedback on query results quality and relevance.
    Used to improve future query generation through machine learning.
    """
    try:
        tracker = QueryPerformanceTracker()
        user_id = current_user.get("uid", "anonymous")
        
        feedback_id = await tracker.collect_feedback(
            query_id=feedback_request.query_id,
            user_id=user_id,
            relevance_score=feedback_request.relevance_score,
            usefulness_score=feedback_request.usefulness_score,
            comments=feedback_request.comments,
            suggested_keywords=feedback_request.suggested_keywords,
            suggested_languages=feedback_request.suggested_languages,
            suggested_topics=feedback_request.suggested_topics
        )
        
        return {
            "feedback_id": feedback_id,
            "message": "Feedback submitted successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.post("/query-interaction", status_code=status.HTTP_201_CREATED)
async def track_query_interaction(
    interaction_request: InteractionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Track user interactions with query results.
    Used to measure query effectiveness and optimize future generations.
    """
    try:
        tracker = QueryPerformanceTracker()
        user_id = current_user.get("uid", "anonymous")
        
        interaction_id = await tracker.track_query_interaction(
            query_id=interaction_request.query_id,
            user_id=user_id,
            interaction_type=interaction_request.interaction_type,
            issue_id=interaction_request.issue_id,
            result_position=interaction_request.result_position,
            time_spent=interaction_request.time_spent,
            metadata=interaction_request.metadata
        )
        
        return {
            "interaction_id": interaction_id,
            "message": "Interaction tracked successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track interaction: {str(e)}"
        )

@router.get("/query-analytics/{user_id}", response_model=AnalyticsResponse)
async def get_query_analytics(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get analytics and performance metrics for a user's query history.
    Provides insights into query effectiveness and user engagement patterns.
    """
    try:
        # Allow users to only see their own analytics unless admin
        requesting_user_id = current_user.get("uid", "anonymous")
        if user_id != requesting_user_id and not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own analytics"
            )
        
        tracker = QueryPerformanceTracker()
        analytics = await tracker.get_user_query_analytics(user_id)
        
        return AnalyticsResponse(
            total_queries=analytics.get("total_queries", 0),
            total_interactions=analytics.get("total_interactions", 0),
            avg_conversion_rate=analytics.get("avg_conversion_rate", 0.0),
            avg_engagement_score=analytics.get("avg_engagement_score", 0.0),
            queries_last_30_days=analytics.get("queries_last_30_days", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        )

@router.post("/generate-optimized-queries", response_model=OptimizedQueryResponse)
async def generate_optimized_queries(
    query_request: OptimizedQueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate optimized GitHub queries using machine learning and user feedback data.
    This endpoint uses the enhanced AI service with learning capabilities.
    """
    try:
        from app.services.vertex_ai_service import generate_optimized_github_query_with_genai
        
        user_id = current_user.get("uid", "anonymous")
        
        # Get user history for personalization
        tracker = QueryPerformanceTracker()
        user_history = await tracker.get_user_query_analytics(user_id)
        
        # Generate optimized queries
        generated_queries = await generate_optimized_github_query_with_genai(
            keywords=query_request.keywords,
            languages=query_request.languages,
            topics=query_request.topics,
            user_id=user_id,
            user_history=user_history
        )
        
        if generated_queries is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service is not available"
            )
        
        return OptimizedQueryResponse(
            queries=generated_queries,
            total_generated=len(generated_queries),
            message="Optimized queries generated successfully using machine learning"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate optimized queries: {str(e)}"
        )

@router.get("/successful-patterns")
async def get_successful_patterns(
    current_user: dict = Depends(get_current_user),
    min_conversion_rate: float = 0.1,
    min_usage_count: int = 3,
    limit: int = 10
):
    """
    Get patterns that have historically led to successful query results.
    Useful for understanding what works well for similar users.
    """
    try:
        tracker = QueryPerformanceTracker()
        user_id = current_user.get("uid", "anonymous")
        
        # Get user history for context
        user_history = await tracker.get_user_query_analytics(user_id)
        
        patterns = await tracker.get_successful_patterns(
            user_profile=user_history,
            min_conversion_rate=min_conversion_rate,
            min_usage_count=min_usage_count
        )
        
        # Limit results
        patterns = patterns[:limit]
        
        return {
            "patterns": [pattern.model_dump() for pattern in patterns],
            "total_patterns": len(patterns),
            "message": "Successful patterns retrieved"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get successful patterns: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for AI feedback services"""
    try:
        # Test basic functionality
        tracker = QueryPerformanceTracker()
        
        return {
            "status": "healthy",
            "service": "AI Query Feedback",
            "timestamp": "2025-01-27T00:00:00Z",
            "message": "All services operational"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )
