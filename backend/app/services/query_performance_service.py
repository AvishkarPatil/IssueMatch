import asyncio
import hashlib
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import logging
from collections import defaultdict
import statistics

from app.models.query_performance import (
    QueryPerformanceMetrics, 
    QueryInteraction, 
    QueryFeedback,
    SuccessPattern,
    ABTestVariant,
    QueryStrategy,
    InteractionType
)
from app.services.firebase_service import get_firebase_admin

logger = logging.getLogger(__name__)

class QueryPerformanceTracker:
    """Service for tracking and analyzing query performance"""
    
    def __init__(self):
        self.db = get_firebase_admin().firestore_client
        
    async def track_query_creation(
        self,
        query_string: str,
        strategy: QueryStrategy,
        user_id: str,
        keywords: List[str],
        languages: List[str],
        topics: List[str],
        total_results: int = 0
    ) -> str:
        """Track when a new query is generated"""
        query_id = str(uuid.uuid4())
        
        metrics = QueryPerformanceMetrics(
            query_id=query_id,
            user_id=user_id,
            query_string=query_string,
            strategy=strategy,
            keywords=keywords,
            languages=languages,
            topics=topics,
            total_results=total_results
        )
        
        try:
            # Store in Firebase
            self.db.collection("query_performance").document(query_id).set(
                metrics.model_dump(mode='json')
            )
            logger.info(f"Tracked query creation: {query_id}")
            return query_id
        except Exception as e:
            logger.error(f"Failed to track query creation: {e}")
            return query_id
    
    async def track_query_interaction(
        self,
        query_id: str,
        user_id: str,
        interaction_type: InteractionType,
        issue_id: Optional[str] = None,
        result_position: Optional[int] = None,
        time_spent: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Track user interactions with query results"""
        interaction_id = str(uuid.uuid4())
        
        interaction = QueryInteraction(
            interaction_id=interaction_id,
            query_id=query_id,
            user_id=user_id,
            interaction_type=interaction_type,
            issue_id=issue_id,
            result_position=result_position,
            time_spent=time_spent,
            metadata=metadata or {}
        )
        
        try:
            # Store interaction
            self.db.collection("query_interactions").document(interaction_id).set(
                interaction.model_dump(mode='json')
            )
            
            # Update query metrics
            await self._update_query_metrics(query_id, interaction_type, time_spent)
            
            logger.info(f"Tracked interaction: {interaction_id} for query: {query_id}")
            return interaction_id
        except Exception as e:
            logger.error(f"Failed to track interaction: {e}")
            return interaction_id
    
    async def collect_feedback(
        self,
        query_id: str,
        user_id: str,
        relevance_score: float,
        usefulness_score: float,
        comments: Optional[str] = None,
        suggested_keywords: Optional[List[str]] = None,
        suggested_languages: Optional[List[str]] = None,
        suggested_topics: Optional[List[str]] = None
    ) -> str:
        """Collect user feedback on query results"""
        feedback_id = str(uuid.uuid4())
        
        feedback = QueryFeedback(
            feedback_id=feedback_id,
            query_id=query_id,
            user_id=user_id,
            relevance_score=relevance_score,
            usefulness_score=usefulness_score,
            comments=comments,
            suggested_keywords=suggested_keywords or [],
            suggested_languages=suggested_languages or [],
            suggested_topics=suggested_topics or []
        )
        
        try:
            # Store feedback
            self.db.collection("query_feedback").document(feedback_id).set(
                feedback.model_dump(mode='json')
            )
            
            # Update query with feedback score
            await self._update_query_feedback(query_id, relevance_score, usefulness_score)
            
            logger.info(f"Collected feedback: {feedback_id} for query: {query_id}")
            return feedback_id
        except Exception as e:
            logger.error(f"Failed to collect feedback: {e}")
            return feedback_id
    
    async def get_successful_patterns(
        self, 
        user_profile: Optional[Dict[str, Any]] = None,
        min_conversion_rate: float = 0.1,
        min_usage_count: int = 3
    ) -> List[SuccessPattern]:
        """Get patterns that lead to successful queries"""
        try:
            # Query successful queries
            successful_queries = []
            
            # Get queries with good performance metrics
            query_ref = self.db.collection("query_performance")
            query_docs = query_ref.where("conversion_rate", ">=", min_conversion_rate).get()
            
            # Group by pattern characteristics
            patterns = defaultdict(list)
            
            for doc in query_docs:
                data = doc.to_dict()
                
                # Create pattern key
                pattern_key = self._create_pattern_key(
                    data.get("keywords", []),
                    data.get("languages", []),
                    data.get("topics", []),
                    data.get("strategy")
                )
                
                patterns[pattern_key].append(data)
            
            # Convert to SuccessPattern objects
            success_patterns = []
            for pattern_key, queries in patterns.items():
                if len(queries) >= min_usage_count:
                    avg_conversion_rate = statistics.mean([q.get("conversion_rate", 0) for q in queries])
                    avg_engagement_score = statistics.mean([q.get("engagement_score", 0) for q in queries])
                    
                    # Extract pattern characteristics from first query
                    first_query = queries[0]
                    
                    pattern = SuccessPattern(
                        pattern_id=pattern_key,
                        keywords=first_query.get("keywords", []),
                        languages=first_query.get("languages", []),
                        topics=first_query.get("topics", []),
                        strategy=first_query.get("strategy"),
                        avg_conversion_rate=avg_conversion_rate,
                        avg_engagement_score=avg_engagement_score,
                        usage_count=len(queries)
                    )
                    
                    success_patterns.append(pattern)
            
            # Sort by performance
            success_patterns.sort(key=lambda p: p.avg_conversion_rate, reverse=True)
            
            return success_patterns
            
        except Exception as e:
            logger.error(f"Failed to get successful patterns: {e}")
            return []
    
    async def optimize_prompt_strategy(
        self, 
        learned_patterns: List[SuccessPattern],
        base_strategy: QueryStrategy = QueryStrategy.GENERAL_BEGINNER
    ) -> str:
        """Generate optimized prompt based on learned patterns"""
        if not learned_patterns:
            return self._get_base_prompt_template(base_strategy)
        
        # Get top performing patterns
        top_patterns = learned_patterns[:3]
        
        # Analyze common elements
        common_keywords = set()
        common_languages = set()
        common_topics = set()
        
        for pattern in top_patterns:
            common_keywords.update(pattern.keywords)
            common_languages.update(pattern.languages)
            common_topics.update(pattern.topics)
        
        # Build optimized prompt
        base_prompt = self._get_base_prompt_template(base_strategy)
        
        # Add learned optimizations
        optimizations = []
        
        if common_keywords:
            optimizations.append(f"Based on successful patterns, prioritize these high-performing keywords: {', '.join(list(common_keywords)[:5])}")
        
        if common_languages:
            optimizations.append(f"Successful queries often focus on these languages: {', '.join(list(common_languages)[:3])}")
        
        if common_topics:
            optimizations.append(f"High-engagement topics include: {', '.join(list(common_topics)[:3])}")
        
        if optimizations:
            optimization_text = "\n\nLearned Optimizations:\n" + "\n".join(f"- {opt}" for opt in optimizations)
            optimized_prompt = base_prompt + optimization_text
        else:
            optimized_prompt = base_prompt
        
        return optimized_prompt
    
    async def get_user_query_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics for a specific user's query performance"""
        try:
            # Get user's queries
            query_ref = self.db.collection("query_performance")
            user_queries = query_ref.where("user_id", "==", user_id).get()
            
            if not user_queries:
                return {"total_queries": 0, "avg_conversion_rate": 0, "avg_engagement_score": 0}
            
            # Calculate analytics
            queries_data = [doc.to_dict() for doc in user_queries]
            
            total_queries = len(queries_data)
            avg_conversion_rate = statistics.mean([q.get("conversion_rate", 0) for q in queries_data])
            avg_engagement_score = statistics.mean([q.get("engagement_score", 0) for q in queries_data])
            
            # Get interactions count
            interactions_ref = self.db.collection("query_interactions")
            user_interactions = interactions_ref.where("user_id", "==", user_id).get()
            total_interactions = len(user_interactions)
            
            return {
                "total_queries": total_queries,
                "total_interactions": total_interactions,
                "avg_conversion_rate": avg_conversion_rate,
                "avg_engagement_score": avg_engagement_score,
                "queries_last_30_days": len([q for q in queries_data if self._is_recent(q.get("created_at"), 30)])
            }
            
        except Exception as e:
            logger.error(f"Failed to get user analytics: {e}")
            return {}
    
    def _create_pattern_key(
        self, 
        keywords: List[str], 
        languages: List[str], 
        topics: List[str], 
        strategy: str
    ) -> str:
        """Create a unique key for pattern identification"""
        pattern_data = {
            "keywords": sorted(keywords),
            "languages": sorted(languages),
            "topics": sorted(topics),
            "strategy": strategy
        }
        pattern_json = json.dumps(pattern_data, sort_keys=True)
        return hashlib.md5(pattern_json.encode()).hexdigest()
    
    async def _update_query_metrics(
        self, 
        query_id: str, 
        interaction_type: InteractionType, 
        time_spent: Optional[float]
    ):
        """Update query performance metrics based on interaction"""
        try:
            query_ref = self.db.collection("query_performance").document(query_id)
            query_doc = query_ref.get()
            
            if query_doc.exists:
                data = query_doc.to_dict()
                
                # Update metrics
                if interaction_type == InteractionType.CLICK:
                    data["click_count"] = data.get("click_count", 0) + 1
                
                if time_spent:
                    data["view_duration"] = data.get("view_duration", 0) + time_spent
                
                # Calculate conversion rate
                total_results = data.get("total_results", 1)
                clicks = data.get("click_count", 0)
                data["conversion_rate"] = clicks / total_results if total_results > 0 else 0
                
                # Calculate engagement score
                data["engagement_score"] = self._calculate_engagement_score(data)
                data["last_interaction"] = datetime.utcnow().isoformat()
                
                query_ref.update(data)
                
        except Exception as e:
            logger.error(f"Failed to update query metrics: {e}")
    
    async def _update_query_feedback(
        self, 
        query_id: str, 
        relevance_score: float, 
        usefulness_score: float
    ):
        """Update query with user feedback score"""
        try:
            query_ref = self.db.collection("query_performance").document(query_id)
            
            # Calculate combined feedback score
            user_feedback_score = (relevance_score + usefulness_score) / 2
            
            query_ref.update({
                "user_feedback_score": user_feedback_score,
                "last_interaction": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to update query feedback: {e}")
    
    def _calculate_engagement_score(self, query_data: Dict[str, Any]) -> float:
        """Calculate overall engagement score for a query"""
        # Weighted combination of various metrics
        conversion_rate = query_data.get("conversion_rate", 0)
        view_duration = min(query_data.get("view_duration", 0), 300) / 300  # Normalize to 0-1
        feedback_score = (query_data.get("user_feedback_score", 3) - 1) / 4  # Normalize 1-5 to 0-1
        
        # Weighted average
        engagement_score = (conversion_rate * 0.4 + view_duration * 0.3 + feedback_score * 0.3)
        
        return min(engagement_score, 1.0)
    
    def _is_recent(self, date_str: Optional[str], days: int) -> bool:
        """Check if a date string is within the last N days"""
        if not date_str:
            return False
        
        try:
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return (datetime.utcnow() - date_obj.replace(tzinfo=None)).days <= days
        except:
            return False
    
    def _get_base_prompt_template(self, strategy: QueryStrategy) -> str:
        """Get base prompt template for a strategy"""
        templates = {
            QueryStrategy.GENERAL_BEGINNER: """You are an expert at crafting GitHub Issue Search API query strings to help developers find relevant open-source contribution opportunities.

Your goal is to generate the most effective query string possible based on the developer's profile with a focus on beginner-friendly issues.

Include relevant `label:"good first issue"` or `label:"beginner"` qualifiers when appropriate.""",
            
            QueryStrategy.HELP_WANTED: """You are an expert at crafting GitHub Issue Search API query strings to help developers find relevant open-source contribution opportunities.

Your goal is to generate the most effective query string possible based on the developer's profile with a focus on issues that need help.

Include relevant `label:"help wanted"` or `label:"bug"` qualifiers when appropriate.""",
            
            QueryStrategy.SPECIFIC_TECHNICAL: """You are an expert at crafting GitHub Issue Search API query strings to help developers find relevant open-source contribution opportunities.

Your goal is to generate the most effective query string possible based on the developer's profile with a focus on specific technical implementations.

Focus on technical keywords and include labels like `label:"enhancement"` when appropriate.""",
        }
        
        return templates.get(strategy, templates[QueryStrategy.GENERAL_BEGINNER])
