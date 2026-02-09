import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.roadmap_service import RoadmapService, roadmap_service
from app.models.roadmap import (
    RoadmapGenerationRequest, DifficultyLevel,
    RoadmapItemStatus, RoadmapItem, RoadmapPhase
)


class TestRoadmapService:
    """Test cases for RoadmapService."""

    @pytest.fixture
    def roadmap_svc(self):
        """Create a fresh RoadmapService instance for testing."""
        return RoadmapService()

    @pytest.fixture
    def mock_db(self):
        """Mock database for testing."""
        return AsyncMock()

    @pytest.fixture
    def sample_user_profile(self):
        """Sample user profile data."""
        return {
            "skills": ["Python", "JavaScript", "API"],
            "languages": ["Python", "JavaScript"],
            "topics": ["web development", "backend"]
        }

    @pytest.fixture
    def sample_ranked_issues(self):
        """Sample ranked issues from FAISS search."""
        return [
            {
                "issue_id": 1,
                "issue_url": "https://github.com/test/repo/issues/1",
                "title": "Add documentation for API endpoints",
                "labels": ["documentation", "good first issue"],
                "similarity_score": 0.9,
                "short_description": "Improve API documentation"
            },
            {
                "issue_id": 2,
                "issue_url": "https://github.com/test/repo/issues/2",
                "title": "Fix database connection bug",
                "labels": ["bug", "database"],
                "similarity_score": 0.8,
                "short_description": "Database connection issue"
            },
            {
                "issue_id": 3,
                "issue_url": "https://github.com/test/repo/issues/3",
                "title": "Implement user authentication",
                "labels": ["feature", "authentication"],
                "similarity_score": 0.7,
                "short_description": "Add user auth system"
            }
        ]

    def test_determine_difficulty_beginner(self, roadmap_svc):
        """Test difficulty determination for beginner issues."""
        issue = {
            "labels": ["good first issue", "documentation"],
            "title": "Add README",
            "short_description": "Create a README file"
        }

        difficulty = roadmap_svc._determine_difficulty(issue)
        assert difficulty == DifficultyLevel.BEGINNER

    def test_determine_difficulty_intermediate(self, roadmap_svc):
        """Test difficulty determination for intermediate issues."""
        issue = {
            "labels": ["bug", "api"],
            "title": "Fix API bug",
            "short_description": "Fix an issue in the API"
        }

        difficulty = roadmap_svc._determine_difficulty(issue)
        assert difficulty == DifficultyLevel.INTERMEDIATE

    def test_determine_difficulty_advanced(self, roadmap_svc):
        """Test difficulty determination for advanced issues."""
        issue = {
            "labels": ["architecture", "performance"],
            "title": "Optimize database queries",
            "short_description": "Performance optimization"
        }

        difficulty = roadmap_svc._determine_difficulty(issue)
        assert difficulty == DifficultyLevel.ADVANCED

    def test_calculate_skill_gap_no_gap(self, roadmap_svc):
        """Test skill gap calculation when user has all required skills."""
        issue = {
            "labels": ["python", "api"],
            "title": "Python API task",
            "short_description": "Python API development"
        }
        user_skills = ["Python", "API", "JavaScript"]

        gap = roadmap_svc._calculate_skill_gap(issue, user_skills)
        assert gap == 0.0  # No gap

    def test_calculate_skill_gap_full_gap(self, roadmap_svc):
        """Test skill gap calculation when user has no required skills."""
        issue = {
            "labels": ["rust", "systems"],
            "title": "Rust systems programming",
            "short_description": "Low-level systems code"
        }
        user_skills = ["Python", "JavaScript"]

        gap = roadmap_svc._calculate_skill_gap(issue, user_skills)
        assert gap == 1.0  # Full gap

    def test_calculate_skill_gap_partial_gap(self, roadmap_svc):
        """Test skill gap calculation with partial skill match."""
        issue = {
            "labels": ["python", "django", "react"],
            "title": "Full stack app",
            "short_description": "Python Django and React"
        }
        user_skills = ["Python", "JavaScript"]  # Has Python, missing Django/React

        gap = roadmap_svc._calculate_skill_gap(issue, user_skills)
        assert 0 < gap < 1  # Partial gap

    def test_create_phases_empty_issues(self, roadmap_svc):
        """Test phase creation with no issues."""
        phases = roadmap_svc._create_phases([])
        assert phases == []

    def test_create_phases_with_issues(self, roadmap_svc, sample_ranked_issues):
        """Test phase creation with sample issues."""
        # Add difficulty and other required fields to sample issues
        for issue in sample_ranked_issues:
            issue["difficulty"] = roadmap_svc._determine_difficulty(issue)
            issue["skill_gap"] = 0.0
            issue["fit_score"] = 0.0
            issue["skills_gained"] = roadmap_svc._extract_skills_gained(issue)
            issue["estimated_effort"] = roadmap_svc._estimate_effort(issue["difficulty"])

        phases = roadmap_svc._create_phases(sample_ranked_issues)

        assert len(phases) > 0
        assert all(isinstance(phase, RoadmapPhase) for phase in phases)
        assert all(len(phase.issues) > 0 for phase in phases)

        # Check that issues are distributed across phases
        total_issues_in_phases = sum(len(phase.issues) for phase in phases)
        assert total_issues_in_phases == len(sample_ranked_issues)

    @pytest.mark.asyncio
    async def test_generate_roadmap_success(self, roadmap_svc, mock_db, sample_user_profile, sample_ranked_issues):
        """Test successful roadmap generation."""
        # Mock dependencies
        roadmap_svc._get_db = AsyncMock(return_value=mock_db)
        roadmap_svc._get_user_profile = AsyncMock(return_value=sample_user_profile)
        roadmap_svc._get_ranked_issues = AsyncMock(return_value=sample_ranked_issues)
        roadmap_svc._save_roadmap = AsyncMock()

        request = RoadmapGenerationRequest(user_id="test_user")

        roadmap = await roadmap_svc.generate_roadmap(request)

        assert roadmap.user_id == "test_user"
        assert len(roadmap.phases) > 0
        assert roadmap.total_issues > 0
        assert roadmap.completed_issues == 0

        # Verify save was called
        roadmap_svc._save_roadmap.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_after_completion_success(self, roadmap_svc, mock_db):
        """Test successful roadmap update after issue completion."""
        # Mock existing roadmap in DB
        existing_roadmap = {
            "user_id": "test_user",
            "phases": [
                {
                    "title": "Phase 1",
                    "description": "First phase",
                    "difficulty_range": "Beginner",
                    "issues": [
                        {
                            "issue_id": 1,
                            "issue_url": "https://github.com/test/repo/issues/1",
                            "title": "Test Issue",
                            "difficulty": "beginner",
                            "skills_gained": ["Python"],
                            "estimated_effort": "1-2 hours",
                            "status": "not_started"
                        }
                    ]
                }
            ],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "total_issues": 1,
            "completed_issues": 0
        }

        mock_db.roadmaps.find_one.return_value = existing_roadmap
        roadmap_svc._get_db = AsyncMock(return_value=mock_db)

        updated_roadmap = await roadmap_svc.update_after_completion("test_user", 1)

        assert updated_roadmap.completed_issues == 1
        assert updated_roadmap.total_issues == 1

        # Verify the issue status was updated
        issue = updated_roadmap.phases[0].issues[0]
        assert issue.status == RoadmapItemStatus.COMPLETED

        # Verify database was updated
        mock_db.roadmaps.replace_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_after_completion_issue_not_found(self, roadmap_svc, mock_db):
        """Test roadmap update when issue is not found."""
        existing_roadmap = {
            "user_id": "test_user",
            "phases": [],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "total_issues": 0,
            "completed_issues": 0
        }

        mock_db.roadmaps.find_one.return_value = existing_roadmap
        roadmap_svc._get_db = AsyncMock(return_value=mock_db)

        with pytest.raises(ValueError, match="Issue 999 not found in roadmap"):
            await roadmap_svc.update_after_completion("test_user", 999)

    @pytest.mark.asyncio
    async def test_get_current_roadmap_found(self, roadmap_svc, mock_db):
        """Test retrieving existing roadmap."""
        roadmap_data = {
            "user_id": "test_user",
            "phases": [],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "total_issues": 0,
            "completed_issues": 0
        }

        mock_db.roadmaps.find_one.return_value = roadmap_data
        roadmap_svc._get_db = AsyncMock(return_value=mock_db)

        roadmap = await roadmap_svc.get_current_roadmap("test_user")

        assert roadmap is not None
        assert roadmap.user_id == "test_user"

    @pytest.mark.asyncio
    async def test_get_current_roadmap_not_found(self, roadmap_svc, mock_db):
        """Test retrieving non-existent roadmap."""
        mock_db.roadmaps.find_one.return_value = None
        roadmap_svc._get_db = AsyncMock(return_value=mock_db)

        roadmap = await roadmap_svc.get_current_roadmap("test_user")

        assert roadmap is None


if __name__ == "__main__":
    pytest.main([__file__])
