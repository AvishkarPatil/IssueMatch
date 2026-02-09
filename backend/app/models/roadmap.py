from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class DifficultyLevel(str, Enum):
    """Difficulty levels for issues."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class RoadmapItemStatus(str, Enum):
    """Status of roadmap items."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class RoadmapItem(BaseModel):
    """Represents a single issue in the roadmap."""
    issue_id: int
    issue_url: str
    title: str
    difficulty: DifficultyLevel
    skills_gained: List[str] = Field(default_factory=list)
    estimated_effort: str
    status: RoadmapItemStatus = RoadmapItemStatus.NOT_STARTED
    labels: Optional[List[str]] = None
    repo_url: Optional[str] = None
    completed_at: Optional[str] = None


class RoadmapPhase(BaseModel):
    """Represents a phase in the roadmap."""
    title: str
    description: str
    difficulty_range: str
    issues: List[RoadmapItem] = Field(default_factory=list)


class Roadmap(BaseModel):
    """Complete roadmap for a user."""
    user_id: str
    phases: List[RoadmapPhase] = Field(default_factory=list)
    created_at: str
    updated_at: str
    total_issues: int = 0
    completed_issues: int = 0
    strategy_version: str = "v1.0"


class RoadmapGenerationRequest(BaseModel):
    """Request model for generating a roadmap."""
    user_id: str
    keywords: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    max_issues: int = Field(default=10, ge=1, le=50)
    preferences: Optional[Dict[str, Any]] = None


class RoadmapUpdateRequest(BaseModel):
    """Request model for updating roadmap after completion."""
    user_id: str
    completed_issue_id: int
    completion_notes: Optional[str] = None


class RoadmapResponse(BaseModel):
    """Response model for roadmap API."""
    roadmap: Roadmap
    message: str = "Roadmap generated successfully"


class RoadmapStatusResponse(BaseModel):
    """Response model for roadmap status."""
    has_roadmap: bool
    total_issues: int = 0
    completed_issues: int = 0
    completion_percentage: float = 0.0
    current_phase: Optional[str] = None
    next_recommended_issue: Optional[RoadmapItem] = None
