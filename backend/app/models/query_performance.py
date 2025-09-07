from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class QueryStrategy(str, Enum):
    GENERAL_BEGINNER = "general_beginner"
    HELP_WANTED = "help_wanted"
    SPECIFIC_TECHNICAL = "specific_technical"
    DOCUMENTATION = "documentation"
    ENHANCEMENT = "enhancement"

class InteractionType(str, Enum):
    CLICK = "click"
    VIEW = "view"
    BOOKMARK = "bookmark"
    APPLY = "apply"
    FEEDBACK = "feedback"

class QueryPerformanceMetrics(BaseModel):
    """Metrics for query performance tracking"""
    query_id: str = Field(..., description="Unique query identifier")
    user_id: str = Field(..., description="User who generated the query")
    query_string: str = Field(..., description="Generated query string")
    strategy: QueryStrategy = Field(..., description="Query generation strategy used")
    
    # Input parameters
    keywords: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    
    # Performance metrics
    click_count: int = Field(default=0, description="Number of clicks on results")
    view_duration: float = Field(default=0.0, description="Total time spent viewing results")
    conversion_rate: float = Field(default=0.0, description="Click-through rate")
    engagement_score: float = Field(default=0.0, description="Overall engagement score")
    
    # Feedback
    user_feedback_score: Optional[float] = Field(default=None, description="User feedback rating 1-5")
    feedback_comments: Optional[str] = Field(default=None)
    
    # Results data
    total_results: int = Field(default=0)
    relevant_results: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_interaction: Optional[datetime] = Field(default=None)

class QueryInteraction(BaseModel):
    """Individual interaction with query results"""
    interaction_id: str = Field(..., description="Unique interaction identifier")
    query_id: str = Field(..., description="Associated query ID")
    user_id: str = Field(..., description="User performing interaction")
    interaction_type: InteractionType = Field(..., description="Type of interaction")
    
    # Interaction details
    issue_id: Optional[str] = Field(default=None, description="GitHub issue ID if applicable")
    result_position: Optional[int] = Field(default=None, description="Position in search results")
    time_spent: Optional[float] = Field(default=None, description="Time spent on this interaction")
    
    # Context
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class QueryFeedback(BaseModel):
    """User feedback on query results"""
    feedback_id: str = Field(..., description="Unique feedback identifier")
    query_id: str = Field(..., description="Associated query ID")
    user_id: str = Field(..., description="User providing feedback")
    
    # Feedback data
    relevance_score: float = Field(..., ge=1.0, le=5.0, description="Relevance rating 1-5")
    usefulness_score: float = Field(..., ge=1.0, le=5.0, description="Usefulness rating 1-5")
    comments: Optional[str] = Field(default=None)
    
    # Improvement suggestions
    suggested_keywords: List[str] = Field(default_factory=list)
    suggested_languages: List[str] = Field(default_factory=list)
    suggested_topics: List[str] = Field(default_factory=list)
    
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SuccessPattern(BaseModel):
    """Patterns that lead to successful query results"""
    pattern_id: str = Field(..., description="Unique pattern identifier")
    
    # Pattern characteristics
    keywords: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    strategy: QueryStrategy = Field(..., description="Successful strategy")
    
    # Success metrics
    avg_conversion_rate: float = Field(..., description="Average conversion rate")
    avg_engagement_score: float = Field(..., description="Average engagement score")
    usage_count: int = Field(default=1, description="Number of times this pattern was successful")
    
    # User context
    user_skill_level: Optional[str] = Field(default=None)
    preferred_languages: List[str] = Field(default_factory=list)
    
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class ABTestVariant(BaseModel):
    """A/B test variant configuration"""
    variant_id: str = Field(..., description="Unique variant identifier")
    variant_name: str = Field(..., description="Human readable variant name")
    
    # Configuration
    strategy: QueryStrategy = Field(..., description="Query generation strategy")
    prompt_template: str = Field(..., description="AI prompt template")
    parameters: Dict[str, Any] = Field(default_factory=dict)
    
    # Test metrics
    user_count: int = Field(default=0)
    avg_conversion_rate: float = Field(default=0.0)
    avg_engagement_score: float = Field(default=0.0)
    confidence_score: float = Field(default=0.0)
    
    # Test configuration
    traffic_allocation: float = Field(default=0.5, ge=0.0, le=1.0)
    is_active: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
