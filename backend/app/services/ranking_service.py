from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


class RankingDimension(ABC):
    """
    Abstract base class for ranking dimensions.
    Each dimension computes a normalized score (0-1) for an issue.
    """

    def __init__(self, name: str, weight: float = 1.0):
        self.name = name
        self.weight = weight

    @abstractmethod
    def score(self, issue: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> float:
        """
        Compute a normalized score (0-1) for the given issue and user context.

        Args:
            issue: GitHub issue data
            user: Optional user context (skills, experience, etc.)

        Returns:
            Normalized score between 0 and 1
        """
        pass


class SemanticRelevanceScorer(RankingDimension):
    """
    Scores issues based on semantic relevance using FAISS similarity.
    Wraps the existing similarity_score calculation.
    """

    def __init__(self, weight: float = 1.0):
        super().__init__("semantic_relevance", weight)

    def score(self, issue: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> float:
        """
        Return the existing similarity_score if available, otherwise 0.
        """
        return issue.get("similarity_score", 0.0)


class RepoActivityScorer(RankingDimension):
    """
    Scores issues based on repository activity metrics.
    Evaluates recent commits, issue closure rate, and maintainer activity.
    """

    def __init__(self, weight: float = 0.8):
        super().__init__("repo_activity", weight)

    def score(self, issue: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate repository activity score based on:
        - Recent commits (last 30 days)
        - Issue closure rate
        - Maintainer activity
        """
        try:
            # Extract repository information
            repo_url = issue.get("repository_url") or issue.get("html_url", "").replace("/issues/", "").replace("/pull/", "")
            if not repo_url:
                return 0.5  # Neutral score if no repo info

            # For now, use a simplified scoring based on available issue data
            # In a full implementation, this would query GitHub API for repo stats

            # Score based on issue recency (newer issues might indicate more active repos)
            created_at = issue.get("created_at", "")
            if created_at:
                # Simple heuristic: issues from last 30 days get higher score
                from datetime import datetime, timedelta
                try:
                    created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    days_since_creation = (datetime.now(created_date.tzinfo) - created_date).days
                    recency_score = max(0, 1 - (days_since_creation / 365))  # Decay over a year
                except:
                    recency_score = 0.5
            else:
                recency_score = 0.5

            # Score based on issue state (open issues might indicate active maintenance)
            is_open = issue.get("state", "").lower() == "open"
            state_score = 0.8 if is_open else 0.4

            # Score based on number of comments (more discussion = more active)
            comments = issue.get("comments", 0)
            comment_score = min(1.0, comments / 10)  # Cap at 10 comments

            # Combine scores with weights
            final_score = (recency_score * 0.4) + (state_score * 0.3) + (comment_score * 0.3)

            return min(1.0, max(0.0, final_score))

        except Exception as e:
            logger.warning(f"Error calculating repo activity score: {str(e)}")
            return 0.5  # Return neutral score on error


class DifficultyMatchScorer(RankingDimension):
    """
    Scores issues based on how well the difficulty matches user skill level.
    Evaluates issue difficulty labels against user experience and contribution history.
    """

    def __init__(self, weight: float = 0.7):
        super().__init__("difficulty_match", weight)

    def score(self, issue: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate difficulty match score based on:
        - Issue difficulty labels (good first issue, beginner-friendly, etc.)
        - User skill level and contribution history
        """
        try:
            # Extract issue difficulty indicators
            title = issue.get("title", "").lower()
            body = issue.get("body", "").lower() if issue.get("body") else ""
            labels = [label.get("name", "").lower() for label in issue.get("labels", [])]

            # Determine issue difficulty level (0-1 scale, where 1 is most difficult)
            difficulty_score = self._assess_issue_difficulty(title, body, labels)

            # If no user context, return neutral preference score
            if not user:
                return 0.5

            # Assess user skill level based on their profile
            user_skill_level = self._assess_user_skill_level(user)

            # Calculate match score - optimal when user skill matches issue difficulty
            # Perfect match = 1.0, complete mismatch = 0.0
            skill_diff = abs(user_skill_level - difficulty_score)

            # Gaussian-like scoring: best match at skill_diff = 0, decreasing as difference increases
            match_score = max(0.0, 1.0 - (skill_diff ** 2))

            return match_score

        except Exception as e:
            logger.warning(f"Error calculating difficulty match score: {str(e)}")
            return 0.5  # Return neutral score on error

    def _assess_issue_difficulty(self, title: str, body: str, labels: List[str]) -> float:
        """
        Assess issue difficulty based on title, body, and labels.
        Returns 0-1 scale where 1 is most difficult.
        """
        difficulty_indicators = {
            'easy': ['good first issue', 'beginner', 'starter', 'easy', 'simple'],
            'medium': ['intermediate', 'medium', 'moderate'],
            'hard': ['advanced', 'expert', 'hard', 'complex', 'difficult']
        }

        # Check labels first (most reliable)
        for label in labels:
            for level, keywords in difficulty_indicators.items():
                if any(keyword in label for keyword in keywords):
                    if level == 'easy':
                        return 0.2
                    elif level == 'medium':
                        return 0.5
                    elif level == 'hard':
                        return 0.8

        # Check title and body for keywords
        text = title + " " + body
        for level, keywords in difficulty_indicators.items():
            if any(keyword in text for keyword in keywords):
                if level == 'easy':
                    return 0.3
                elif level == 'medium':
                    return 0.5
                elif level == 'hard':
                    return 0.7

        # Default to medium difficulty if no clear indicators
        return 0.5

    def _assess_user_skill_level(self, user: Dict[str, Any]) -> float:
        """
        Assess user skill level based on their profile data.
        Returns 0-1 scale where 1 is most skilled.
        """
        # Check contribution count
        contributions = user.get("contributions", 0)
        if contributions > 100:
            return 0.8
        elif contributions > 50:
            return 0.6
        elif contributions > 10:
            return 0.4
        else:
            return 0.2

        # Could also check skills, languages, etc. for more sophisticated assessment
        # For now, using contribution count as primary indicator


class MentorAvailabilityScorer(RankingDimension):
    """
    Scores issues based on availability of mentors for the relevant tech stack.
    Boosts issues that have mentors who can provide guidance.
    """

    def __init__(self, weight: float = 0.6):
        super().__init__("mentor_availability", weight)

    def score(self, issue: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate mentor availability score based on:
        - Presence of mentor-related labels
        - Tech stack matching with available mentors
        - Issue characteristics that suggest mentor support
        """
        try:
            # Check for mentor-related labels
            labels = [label.get("name", "").lower() for label in issue.get("labels", [])]
            mentor_labels = ['help wanted', 'mentor available', 'mentorship', 'good first issue']

            has_mentor_label = any(any(keyword in label for keyword in mentor_labels) for label in labels)

            # Check issue body for mentor mentions
            body = issue.get("body", "").lower() if issue.get("body") else ""
            has_mentor_mention = any(keyword in body for keyword in ['mentor', 'mentorship', 'guidance', 'help'])

            # Base score from explicit mentor indicators
            base_score = 0.8 if has_mentor_label else (0.6 if has_mentor_mention else 0.3)

            # If user context is available, check tech stack matching
            if user:
                user_languages = set(user.get("languages", []))
                user_skills = set(user.get("skills", []))

                # Extract tech stack from issue (simplified - would need more sophisticated NLP in production)
                issue_languages = self._extract_issue_languages(issue)

                # Boost score if user's tech stack matches issue requirements
                tech_match = len(user_languages.intersection(issue_languages)) > 0
                if tech_match:
                    base_score = min(1.0, base_score + 0.2)

            return base_score

        except Exception as e:
            logger.warning(f"Error calculating mentor availability score: {str(e)}")
            return 0.3  # Return low score on error (conservative approach)

    def _extract_issue_languages(self, issue: Dict[str, Any]) -> set:
        """
        Extract programming languages mentioned in the issue.
        Returns a set of language names.
        """
        # Common programming languages to check for
        languages = {
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'typescript', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'shell', 'bash',
            'html', 'css', 'sql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'
        }

        text = ""
        if issue.get("title"):
            text += issue["title"].lower() + " "
        if issue.get("body"):
            text += issue["body"].lower() + " "
        if issue.get("labels"):
            text += " ".join([label.get("name", "").lower() for label in issue["labels"]])

        found_languages = set()
        for lang in languages:
            if lang in text:
                found_languages.add(lang)

        return found_languages


class ImpactScorer(RankingDimension):
    """
    Scores issues based on their potential impact and contribution value.
    Evaluates issue type, repository popularity, and estimated user impact.
    """

    def __init__(self, weight: float = 0.9):
        super().__init__("impact", weight)

    def score(self, issue: Dict[str, Any], user: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate impact score based on:
        - Issue type (bug, feature, documentation, etc.)
        - Repository popularity and reach
        - Estimated contribution impact
        """
        try:
            # Score based on issue type
            issue_type_score = self._score_issue_type(issue)

            # Score based on repository metrics (simplified)
            repo_score = self._score_repository(issue)

            # Score based on issue characteristics
            issue_score = self._score_issue_characteristics(issue)

            # Combine scores with weights
            final_score = (issue_type_score * 0.4) + (repo_score * 0.4) + (issue_score * 0.2)

            return min(1.0, max(0.0, final_score))

        except Exception as e:
            logger.warning(f"Error calculating impact score: {str(e)}")
            return 0.5  # Return neutral score on error

    def _score_issue_type(self, issue: Dict[str, Any]) -> float:
        """
        Score based on issue type and labels.
        """
        labels = [label.get("name", "").lower() for label in issue.get("labels", [])]

        # High impact issue types
        high_impact = ['bug', 'security', 'critical', 'breaking change', 'performance']
        medium_impact = ['enhancement', 'feature', 'improvement', 'documentation']
        low_impact = ['question', 'discussion', 'wontfix', 'duplicate']

        if any(label in high_impact for label in labels):
            return 0.9
        elif any(label in medium_impact for label in labels):
            return 0.7
        elif any(label in low_impact for label in labels):
            return 0.3
        else:
            return 0.5  # Default medium impact

    def _score_repository(self, issue: Dict[str, Any]) -> float:
        """
        Score based on repository characteristics (simplified).
        In production, this would query GitHub API for stars, forks, etc.
        """
        # Use issue URL to extract repo info
        html_url = issue.get("html_url", "")
        if "github.com" in html_url:
            # Simple heuristic based on URL patterns
            # Popular repos often have shorter, well-known names
            repo_path = html_url.split("github.com/")[1].split("/")[1] if len(html_url.split("github.com/")) > 1 else ""

            # Known popular repos get higher scores
            popular_repos = ['tensorflow', 'pytorch', 'kubernetes', 'react', 'vue', 'angular', 'django', 'flask']
            if repo_path.lower() in popular_repos:
                return 0.9

            # Medium popularity for established projects
            established_repos = ['requests', 'pandas', 'numpy', 'matplotlib', 'scikit-learn']
            if repo_path.lower() in established_repos:
                return 0.7

        return 0.5  # Default score

    def _score_issue_characteristics(self, issue: Dict[str, Any]) -> float:
        """
        Score based on issue characteristics like upvotes, comments, etc.
        """
        # Score based on comment count (more discussion = higher impact)
        comments = issue.get("comments", 0)
        comment_score = min(1.0, comments / 20)  # Cap at 20 comments

        # Score based on issue age (slightly older issues might be more established)
        created_at = issue.get("created_at", "")
        if created_at:
            from datetime import datetime
            try:
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                days_old = (datetime.now(created_date.tzinfo) - created_date).days
                # Sweet spot around 30-90 days old
                age_score = 1.0 - abs(days_old - 60) / 120
                age_score = max(0.1, min(1.0, age_score))
            except:
                age_score = 0.5
        else:
            age_score = 0.5

        return (comment_score * 0.6) + (age_score * 0.4)


class CompositeRanker:
    """
    Aggregates scores from multiple ranking dimensions using weighted sum.
    """

    def __init__(self, dimensions: List[RankingDimension], strategy_id: Optional[str] = None, strategy_version: Optional[int] = None):
        self.dimensions = dimensions
        self.total_weight = sum(dim.weight for dim in dimensions)
        self.strategy_id = strategy_id
        self.strategy_version = strategy_version

        if self.total_weight == 0:
            raise ValueError("Total weight of dimensions cannot be zero")

        logger.info(f"Initialized CompositeRanker with {len(dimensions)} dimensions, total weight: {self.total_weight}, strategy: {strategy_id}")

    def rank_issues(self, issues: List[Dict[str, Any]], user: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Rank issues using composite scoring.

        Args:
            issues: List of GitHub issues
            user: Optional user context

        Returns:
            Issues with added 'final_score' and 'dimension_scores' fields
        """
        for issue in issues:
            dimension_scores = {}
            weighted_sum = 0.0

            for dimension in self.dimensions:
                score = dimension.score(issue, user)
                dimension_scores[dimension.name] = score
                weighted_sum += score * dimension.weight

            final_score = weighted_sum / self.total_weight

            issue['final_score'] = final_score
            issue['dimension_scores'] = dimension_scores

        # Sort by final score descending
        issues.sort(key=lambda x: x.get('final_score', 0), reverse=True)

        logger.info(f"Ranked {len(issues)} issues using composite scoring")
        return issues


# Default ranking configuration with all dimensions
def create_default_ranker() -> CompositeRanker:
    """
    Create a ranker with all implemented scoring dimensions and balanced weights.
    Weights are tuned for optimal issue recommendations.
    """
    return CompositeRanker([
        SemanticRelevanceScorer(weight=1.2),      # Core relevance (highest weight)
        RepoActivityScorer(weight=0.8),           # Repository health
        DifficultyMatchScorer(weight=0.7),        # User skill matching
        MentorAvailabilityScorer(weight=0.6),     # Mentorship support
        ImpactScorer(weight=0.9)                  # Contribution impact
    ])


# Legacy function for backward compatibility
def create_simple_ranker() -> CompositeRanker:
    """
    Create a ranker with only semantic relevance for backward compatibility.
    """
    return CompositeRanker([SemanticRelevanceScorer(weight=1.0)])
