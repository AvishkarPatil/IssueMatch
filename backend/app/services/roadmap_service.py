from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timezone
from ..models.roadmap import (
    Roadmap, RoadmapPhase, RoadmapItem,
    DifficultyLevel, RoadmapItemStatus,
    RoadmapGenerationRequest
)
from .faiss_search import get_top_matched_issues
from .mongodb_service import get_database
from ..routers.skills import get_github_user_id
import math

logger = logging.getLogger(__name__)


class RoadmapService:
    """
    Service for generating and managing personalized learning roadmaps.

    This service creates progressive issue roadmaps based on user skills,
    difficulty progression, and skill gap analysis.
    """

    def __init__(self):
        self.db = None

    async def _get_db(self):
        if self.db is None:
            self.db = get_database()
        return self.db

    async def generate_roadmap(self, request: RoadmapGenerationRequest) -> Roadmap:
        """
        Generate a personalized roadmap for a user.

        Args:
            request: RoadmapGenerationRequest containing user_id and preferences

        Returns:
            Roadmap: Generated roadmap with phases and issues
        """
        logger.info(f"Generating roadmap for user {request.user_id}")

        # Get user profile and skills
        user_profile = await self._get_user_profile(request.user_id)
        user_skills = user_profile.get("skills", [])

        # Get ranked issues using existing matching system
        ranked_issues = await self._get_ranked_issues(request, user_profile)

        # Apply difficulty progression and skill gap analysis
        filtered_issues = self._filter_and_score_issues(ranked_issues, user_skills)

        # Group into phases
        phases = self._create_phases(filtered_issues)

        # Create roadmap
        now = datetime.now(timezone.utc).isoformat()
        roadmap = Roadmap(
            user_id=request.user_id,
            phases=phases,
            created_at=now,
            updated_at=now,
            total_issues=sum(len(phase.issues) for phase in phases),
            completed_issues=0
        )

        # Save to database
        await self._save_roadmap(roadmap)

        logger.info(f"Generated roadmap with {roadmap.total_issues} issues in {len(phases)} phases")
        return roadmap

    async def update_after_completion(self, user_id: str, completed_issue_id: int) -> Roadmap:
        """
        Update roadmap after user completes an issue.

        Args:
            user_id: User ID
            completed_issue_id: ID of completed issue

        Returns:
            Roadmap: Updated roadmap
        """
        logger.info(f"Updating roadmap for user {user_id} after completing issue {completed_issue_id}")

        db = await self._get_db()

        # Find and update the roadmap
        roadmap_doc = await db.roadmaps.find_one({"user_id": user_id})
        if not roadmap_doc:
            raise ValueError(f"No roadmap found for user {user_id}")

        # Update issue status
        updated = False
        for phase in roadmap_doc["phases"]:
            for issue in phase["issues"]:
                if issue["issue_id"] == completed_issue_id:
                    issue["status"] = RoadmapItemStatus.COMPLETED.value
                    updated = True
                    break
            if updated:
                break

        if not updated:
            raise ValueError(f"Issue {completed_issue_id} not found in roadmap")

        # Update metadata
        roadmap_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        roadmap_doc["completed_issues"] = sum(
            1 for phase in roadmap_doc["phases"]
            for issue in phase["issues"]
            if issue["status"] == RoadmapItemStatus.COMPLETED.value
        )

        # Save updated roadmap
        await db.roadmaps.replace_one({"user_id": user_id}, roadmap_doc)

        # Convert back to Roadmap model
        roadmap = Roadmap(**roadmap_doc)
        logger.info(f"Updated roadmap: {roadmap.completed_issues}/{roadmap.total_issues} completed")
        return roadmap

    async def get_current_roadmap(self, user_id: str) -> Optional[Roadmap]:
        """
        Get the current roadmap for a user.

        Args:
            user_id: User ID

        Returns:
            Roadmap or None if not found
        """
        db = await self._get_db()
        roadmap_doc = await db.roadmaps.find_one({"user_id": user_id})
        if roadmap_doc:
            return Roadmap(**roadmap_doc)
        return None

    async def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile including skills from database."""
        db = await self._get_db()
        user = await db.users.find_one({"githubId": user_id})
        if not user:
            return {"skills": []}
        return {
            "skills": user.get("skills", []),
            "languages": [],  # Could be extended
            "topics": []  # Could be extended
        }

    async def _get_ranked_issues(self, request: RoadmapGenerationRequest, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get ranked issues using the existing FAISS search system."""
        # Use profile data or request parameters
        keywords = request.keywords or user_profile.get("skills", [])
        languages = request.languages or user_profile.get("languages", [])
        topics = request.topics or user_profile.get("topics", [])

        # Get issues from FAISS search
        result = get_top_matched_issues(
            query_text=" ".join(keywords + languages + topics),
            keywords=keywords,
            languages=languages,
            top_k=request.max_issues
        )

        return result.get("recommendations", [])

    def _filter_and_score_issues(self, issues: List[Dict[str, Any]], user_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Filter and score issues based on difficulty progression and skill gaps.

        Args:
            issues: List of issue dictionaries from FAISS search
            user_skills: User's current skills

        Returns:
            Filtered and scored issues
        """
        scored_issues = []

        for issue in issues:
            # Determine difficulty based on labels and content
            difficulty = self._determine_difficulty(issue)

            # Calculate skill gap
            skill_gap = self._calculate_skill_gap(issue, user_skills)

            # Score the issue (lower score = better fit)
            score = self._calculate_fit_score(difficulty, skill_gap, issue)

            if score < 10:  # Threshold for inclusion
                scored_issue = {
                    **issue,
                    "difficulty": difficulty,
                    "skill_gap": skill_gap,
                    "fit_score": score,
                    "skills_gained": self._extract_skills_gained(issue),
                    "estimated_effort": self._estimate_effort(difficulty)
                }
                scored_issues.append(scored_issue)

        # Sort by fit score
        scored_issues.sort(key=lambda x: x["fit_score"])
        return scored_issues[:10]  # Limit to top 10

    def _determine_difficulty(self, issue: Dict[str, Any]) -> DifficultyLevel:
        """Determine issue difficulty based on labels and content analysis."""
        labels = [label.lower() for label in issue.get("labels", [])]
        title = issue.get("title", "").lower()
        body = issue.get("short_description", "").lower()

        # Check for explicit difficulty labels
        if any(label in ["good first issue", "beginner", "easy"] for label in labels):
            return DifficultyLevel.BEGINNER
        if any(label in ["intermediate", "medium"] for label in labels):
            return DifficultyLevel.INTERMEDIATE
        if any(label in ["advanced", "expert", "hard"] for label in labels):
            return DifficultyLevel.ADVANCED

        # Heuristic based on keywords
        beginner_keywords = ["documentation", "typo", "test", "readme", "config"]
        advanced_keywords = ["architecture", "performance", "security", "refactor"]

        text = title + " " + body
        if any(keyword in text for keyword in beginner_keywords):
            return DifficultyLevel.BEGINNER
        if any(keyword in text for keyword in advanced_keywords):
            return DifficultyLevel.ADVANCED

        return DifficultyLevel.INTERMEDIATE  # Default

    def _calculate_skill_gap(self, issue: Dict[str, Any], user_skills: List[str]) -> float:
        """
        Calculate skill gap for an issue.

        Returns:
            Float between 0-1, where 0 means no gap (perfect fit)
        """
        # Extract required skills from issue
        required_skills = self._extract_required_skills(issue)
        user_skills_lower = [skill.lower() for skill in user_skills]

        if not required_skills:
            return 0.0  # No specific skills required

        # Count matching skills
        matches = sum(1 for skill in required_skills if skill.lower() in user_skills_lower)
        gap = 1.0 - (matches / len(required_skills))

        return gap

    def _extract_required_skills(self, issue: Dict[str, Any]) -> List[str]:
        """Extract required skills from issue labels and content."""
        skills = []

        # From labels
        labels = issue.get("labels", [])
        for label in labels:
            if label.lower() in ["python", "javascript", "java", "c++", "go", "rust",
                               "react", "vue", "angular", "django", "flask", "fastapi",
                               "html", "css", "typescript", "sql", "mongodb", "postgres"]:
                skills.append(label)

        # From title/body (simple keyword extraction)
        text = (issue.get("title", "") + " " + issue.get("short_description", "")).lower()
        tech_keywords = ["api", "database", "frontend", "backend", "testing", "ci/cd",
                        "docker", "kubernetes", "aws", "gcp", "azure"]

        for keyword in tech_keywords:
            if keyword in text:
                skills.append(keyword.title())

        return list(set(skills))  # Remove duplicates

    def _extract_skills_gained(self, issue: Dict[str, Any]) -> List[str]:
        """Extract skills that would be gained by working on this issue."""
        return self._extract_required_skills(issue)

    def _calculate_fit_score(self, difficulty: DifficultyLevel, skill_gap: float, issue: Dict[str, Any]) -> float:
        """
        Calculate overall fit score for an issue.

        Lower score = better fit
        """
        # Base score from skill gap (0-5 points)
        gap_score = skill_gap * 5

        # Difficulty adjustment (prefer issues at or slightly above user level)
        difficulty_score = 0
        if difficulty == DifficultyLevel.BEGINNER:
            difficulty_score = 1  # Slight preference for learning
        elif difficulty == DifficultyLevel.INTERMEDIATE:
            difficulty_score = 0  # Perfect match
        elif difficulty == DifficultyLevel.ADVANCED:
            difficulty_score = 2  # Some penalty for advanced

        # Similarity bonus (from FAISS)
        similarity = issue.get("similarity_score", 0.5)
        similarity_bonus = (1 - similarity) * 2  # Lower distance = better

        total_score = gap_score + difficulty_score + similarity_bonus
        return total_score

    def _estimate_effort(self, difficulty: DifficultyLevel) -> str:
        """Estimate effort required for an issue."""
        if difficulty == DifficultyLevel.BEGINNER:
            return "1-2 hours"
        elif difficulty == DifficultyLevel.INTERMEDIATE:
            return "2-4 hours"
        else:
            return "4-8 hours"

    def _create_phases(self, scored_issues: List[Dict[str, Any]]) -> List[RoadmapPhase]:
        """Group issues into logical phases."""
        if not scored_issues:
            return []

        # Sort by difficulty and fit score
        sorted_issues = sorted(scored_issues, key=lambda x: (x["difficulty"], x["fit_score"]))

        phases = []
        phase_size = max(2, len(sorted_issues) // 3)  # Aim for 3 phases

        # Track used issue IDs to avoid duplicates
        used_issue_ids = set()

        # Phase 1: Onboarding (Beginner focused)
        phase1_issues = []
        for issue in sorted_issues:
            if len(phase1_issues) >= phase_size or issue["issue_id"] in used_issue_ids:
                continue
            if issue["difficulty"] in [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE]:
                roadmap_item = RoadmapItem(
                    issue_id=issue["issue_id"],
                    issue_url=issue["issue_url"],
                    title=issue["title"],
                    difficulty=issue["difficulty"],
                    skills_gained=issue["skills_gained"],
                    estimated_effort=issue["estimated_effort"],
                    labels=issue.get("labels"),
                    repo_url=issue.get("repo_url")
                )
                phase1_issues.append(roadmap_item)
                used_issue_ids.add(issue["issue_id"])

        if phase1_issues:
            phases.append(RoadmapPhase(
                title="Onboarding & Getting Started",
                description="Begin with accessible issues to build confidence and learn the basics",
                difficulty_range="Beginner to Intermediate",
                issues=phase1_issues
            ))

        # Phase 2: Core Contributions
        phase2_issues = []
        for issue in sorted_issues:
            if len(phase2_issues) >= phase_size or issue["issue_id"] in used_issue_ids:
                continue
            roadmap_item = RoadmapItem(
                issue_id=issue["issue_id"],
                issue_url=issue["issue_url"],
                title=issue["title"],
                difficulty=issue["difficulty"],
                skills_gained=issue["skills_gained"],
                estimated_effort=issue["estimated_effort"],
                labels=issue.get("labels"),
                repo_url=issue.get("repo_url")
            )
            phase2_issues.append(roadmap_item)
            used_issue_ids.add(issue["issue_id"])

        if phase2_issues:
            phases.append(RoadmapPhase(
                title="Core Contributions",
                description="Tackle more substantial issues to deepen your skills",
                difficulty_range="Intermediate",
                issues=phase2_issues
            ))

        # Phase 3: Advanced Impact (if we have remaining issues)
        phase3_issues = []
        for issue in sorted_issues:
            if issue["issue_id"] in used_issue_ids:
                continue
            roadmap_item = RoadmapItem(
                issue_id=issue["issue_id"],
                issue_url=issue["issue_url"],
                title=issue["title"],
                difficulty=issue["difficulty"],
                skills_gained=issue["skills_gained"],
                estimated_effort=issue["estimated_effort"],
                labels=issue.get("labels"),
                repo_url=issue.get("repo_url")
            )
            phase3_issues.append(roadmap_item)
            used_issue_ids.add(issue["issue_id"])

        if phase3_issues:
            phases.append(RoadmapPhase(
                title="Advanced Impact",
                description="Take on challenging issues that make a significant impact",
                difficulty_range="Intermediate to Advanced",
                issues=phase3_issues
            ))

        return phases

    async def _save_roadmap(self, roadmap: Roadmap):
        """Save roadmap to database."""
        db = await self._get_db()
        await db.roadmaps.replace_one(
            {"user_id": roadmap.user_id},
            roadmap.dict(),
            upsert=True
        )


# Global service instance
roadmap_service = RoadmapService()
