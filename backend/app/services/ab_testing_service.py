import asyncio
import hashlib
import json
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import logging
from collections import defaultdict
import statistics

from app.models.query_performance import (
    ABTestVariant,
    QueryStrategy,
    QueryPerformanceMetrics
)
from app.services.firebase_service import get_firebase_admin

logger = logging.getLogger(__name__)

class ABTestingFramework:
    """A/B Testing framework for query optimization strategies"""
    
    def __init__(self):
        self.db = get_firebase_admin().firestore_client
        
    async def create_ab_test(
        self,
        test_name: str,
        variants: List[Dict[str, Any]],
        traffic_split: Optional[List[float]] = None
    ) -> str:
        """
        Create a new A/B test with multiple variants
        
        Args:
            test_name: Human readable test name
            variants: List of variant configurations
            traffic_split: List of traffic allocation percentages (should sum to 1.0)
        
        Returns:
            Test ID
        """
        test_id = str(uuid.uuid4())
        
        if traffic_split is None:
            # Equal split between variants
            traffic_split = [1.0 / len(variants)] * len(variants)
        
        if len(traffic_split) != len(variants):
            raise ValueError("Traffic split must match number of variants")
        
        if abs(sum(traffic_split) - 1.0) > 0.001:
            raise ValueError("Traffic split must sum to 1.0")
        
        # Create AB test variants
        test_variants = []
        for i, (variant_config, traffic) in enumerate(zip(variants, traffic_split)):
            variant = ABTestVariant(
                variant_id=f"{test_id}_variant_{i}",
                variant_name=variant_config.get("name", f"Variant {i+1}"),
                strategy=QueryStrategy(variant_config["strategy"]),
                prompt_template=variant_config["prompt_template"],
                parameters=variant_config.get("parameters", {}),
                traffic_allocation=traffic
            )
            test_variants.append(variant)
        
        # Store test configuration
        test_config = {
            "test_id": test_id,
            "test_name": test_name,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True,
            "variants": [v.model_dump(mode='json') for v in test_variants]
        }
        
        try:
            self.db.collection("ab_tests").document(test_id).set(test_config)
            
            # Store individual variants for easier querying
            for variant in test_variants:
                self.db.collection("ab_test_variants").document(variant.variant_id).set(
                    variant.model_dump(mode='json')
                )
            
            logger.info(f"Created A/B test: {test_id} with {len(variants)} variants")
            return test_id
            
        except Exception as e:
            logger.error(f"Failed to create A/B test: {e}")
            raise
    
    async def assign_user_to_variant(
        self,
        test_id: str,
        user_id: str
    ) -> Optional[ABTestVariant]:
        """
        Assign a user to an A/B test variant based on traffic allocation
        
        Args:
            test_id: A/B test identifier
            user_id: User to assign
            
        Returns:
            Assigned variant or None if test not found
        """
        try:
            # Check if user is already assigned
            assignment_doc = self.db.collection("ab_test_assignments").document(f"{test_id}_{user_id}").get()
            
            if assignment_doc.exists:
                assignment_data = assignment_doc.to_dict()
                variant_id = assignment_data["variant_id"]
                
                # Get variant details
                variant_doc = self.db.collection("ab_test_variants").document(variant_id).get()
                if variant_doc.exists:
                    return ABTestVariant(**variant_doc.to_dict())
            
            # Get test configuration
            test_doc = self.db.collection("ab_tests").document(test_id).get()
            if not test_doc.exists or not test_doc.to_dict().get("is_active", False):
                return None
            
            test_data = test_doc.to_dict()
            variants = test_data["variants"]
            
            # Deterministic assignment based on user_id hash
            user_hash = int(hashlib.md5(f"{test_id}_{user_id}".encode()).hexdigest(), 16)
            assignment_score = (user_hash % 10000) / 10000  # 0-1 range
            
            # Find assigned variant based on traffic allocation
            cumulative_traffic = 0.0
            assigned_variant = None
            
            for variant_data in variants:
                cumulative_traffic += variant_data["traffic_allocation"]
                if assignment_score <= cumulative_traffic:
                    assigned_variant = ABTestVariant(**variant_data)
                    break
            
            if assigned_variant is None:
                # Fallback to last variant
                assigned_variant = ABTestVariant(**variants[-1])
            
            # Store assignment
            assignment = {
                "test_id": test_id,
                "user_id": user_id,
                "variant_id": assigned_variant.variant_id,
                "assigned_at": datetime.utcnow().isoformat(),
                "assignment_score": assignment_score
            }
            
            self.db.collection("ab_test_assignments").document(f"{test_id}_{user_id}").set(assignment)
            
            logger.info(f"Assigned user {user_id} to variant {assigned_variant.variant_id}")
            return assigned_variant
            
        except Exception as e:
            logger.error(f"Failed to assign user to variant: {e}")
            return None
    
    async def record_variant_result(
        self,
        variant_id: str,
        user_id: str,
        conversion_rate: float,
        engagement_score: float,
        query_id: Optional[str] = None
    ):
        """
        Record performance results for an A/B test variant
        
        Args:
            variant_id: Variant identifier
            user_id: User who generated the result
            conversion_rate: Click-through rate for this query
            engagement_score: Overall engagement score
            query_id: Optional query identifier
        """
        try:
            result_id = str(uuid.uuid4())
            
            result = {
                "result_id": result_id,
                "variant_id": variant_id,
                "user_id": user_id,
                "conversion_rate": conversion_rate,
                "engagement_score": engagement_score,
                "query_id": query_id,
                "recorded_at": datetime.utcnow().isoformat()
            }
            
            # Store result
            self.db.collection("ab_test_results").document(result_id).set(result)
            
            # Update variant statistics
            await self._update_variant_stats(variant_id, conversion_rate, engagement_score)
            
            logger.info(f"Recorded result for variant {variant_id}: CTR={conversion_rate:.3f}, ENG={engagement_score:.3f}")
            
        except Exception as e:
            logger.error(f"Failed to record variant result: {e}")
    
    async def get_test_results(
        self,
        test_id: str,
        min_sample_size: int = 30
    ) -> Dict[str, Any]:
        """
        Get comprehensive results for an A/B test
        
        Args:
            test_id: Test identifier
            min_sample_size: Minimum samples needed for statistical significance
            
        Returns:
            Test results with statistical analysis
        """
        try:
            # Get test configuration
            test_doc = self.db.collection("ab_tests").document(test_id).get()
            if not test_doc.exists:
                return {"error": "Test not found"}
            
            test_data = test_doc.to_dict()
            variants = test_data["variants"]
            
            # Get results for each variant
            variant_results = {}
            
            for variant_data in variants:
                variant_id = variant_data["variant_id"]
                
                # Get all results for this variant
                results_query = self.db.collection("ab_test_results").where("variant_id", "==", variant_id)
                results_docs = results_query.get()
                
                if len(results_docs) < min_sample_size:
                    variant_results[variant_id] = {
                        "variant_name": variant_data["variant_name"],
                        "strategy": variant_data["strategy"],
                        "sample_size": len(results_docs),
                        "status": "insufficient_data",
                        "min_required": min_sample_size
                    }
                    continue
                
                # Calculate statistics
                conversion_rates = []
                engagement_scores = []
                
                for doc in results_docs:
                    data = doc.to_dict()
                    conversion_rates.append(data["conversion_rate"])
                    engagement_scores.append(data["engagement_score"])
                
                variant_results[variant_id] = {
                    "variant_name": variant_data["variant_name"],
                    "strategy": variant_data["strategy"],
                    "sample_size": len(results_docs),
                    "avg_conversion_rate": statistics.mean(conversion_rates),
                    "std_conversion_rate": statistics.stdev(conversion_rates) if len(conversion_rates) > 1 else 0,
                    "avg_engagement_score": statistics.mean(engagement_scores),
                    "std_engagement_score": statistics.stdev(engagement_scores) if len(engagement_scores) > 1 else 0,
                    "status": "sufficient_data"
                }
            
            # Determine winner
            winner = self._determine_winner(variant_results)
            
            return {
                "test_id": test_id,
                "test_name": test_data["test_name"],
                "created_at": test_data["created_at"],
                "variants": variant_results,
                "winner": winner,
                "total_samples": sum(v.get("sample_size", 0) for v in variant_results.values())
            }
            
        except Exception as e:
            logger.error(f"Failed to get test results: {e}")
            return {"error": str(e)}
    
    async def promote_winning_variant(
        self,
        test_id: str,
        confidence_threshold: float = 0.95
    ) -> Optional[Dict[str, Any]]:
        """
        Promote the winning variant to production if confidence is high enough
        
        Args:
            test_id: Test identifier
            confidence_threshold: Minimum confidence required to promote
            
        Returns:
            Promotion details or None if no clear winner
        """
        try:
            results = await self.get_test_results(test_id)
            
            if "error" in results:
                return None
            
            winner = results.get("winner")
            if not winner or winner.get("confidence", 0) < confidence_threshold:
                return None
            
            winning_variant_id = winner["variant_id"]
            
            # Get variant details
            variant_doc = self.db.collection("ab_test_variants").document(winning_variant_id).get()
            if not variant_doc.exists:
                return None
            
            variant_data = variant_doc.to_dict()
            
            # Store as production configuration
            production_config = {
                "config_id": str(uuid.uuid4()),
                "source_test_id": test_id,
                "source_variant_id": winning_variant_id,
                "strategy": variant_data["strategy"],
                "prompt_template": variant_data["prompt_template"],
                "parameters": variant_data["parameters"],
                "promoted_at": datetime.utcnow().isoformat(),
                "performance_data": winner,
                "is_active": True
            }
            
            self.db.collection("production_query_configs").document(production_config["config_id"]).set(production_config)
            
            # Mark test as completed
            self.db.collection("ab_tests").document(test_id).update({
                "is_active": False,
                "completed_at": datetime.utcnow().isoformat(),
                "winner_variant_id": winning_variant_id
            })
            
            logger.info(f"Promoted winning variant {winning_variant_id} to production")
            return production_config
            
        except Exception as e:
            logger.error(f"Failed to promote winning variant: {e}")
            return None
    
    async def get_active_tests(self) -> List[Dict[str, Any]]:
        """Get all currently active A/B tests"""
        try:
            tests_query = self.db.collection("ab_tests").where("is_active", "==", True)
            tests_docs = tests_query.get()
            
            active_tests = []
            for doc in tests_docs:
                test_data = doc.to_dict()
                active_tests.append({
                    "test_id": test_data["test_id"],
                    "test_name": test_data["test_name"],
                    "created_at": test_data["created_at"],
                    "variant_count": len(test_data["variants"])
                })
            
            return active_tests
            
        except Exception as e:
            logger.error(f"Failed to get active tests: {e}")
            return []
    
    async def _update_variant_stats(
        self,
        variant_id: str,
        conversion_rate: float,
        engagement_score: float
    ):
        """Update cumulative statistics for a variant"""
        try:
            variant_ref = self.db.collection("ab_test_variants").document(variant_id)
            variant_doc = variant_ref.get()
            
            if variant_doc.exists:
                data = variant_doc.to_dict()
                
                # Update counters and averages
                current_count = data.get("user_count", 0)
                current_ctr = data.get("avg_conversion_rate", 0)
                current_eng = data.get("avg_engagement_score", 0)
                
                new_count = current_count + 1
                new_ctr = ((current_ctr * current_count) + conversion_rate) / new_count
                new_eng = ((current_eng * current_count) + engagement_score) / new_count
                
                variant_ref.update({
                    "user_count": new_count,
                    "avg_conversion_rate": new_ctr,
                    "avg_engagement_score": new_eng,
                    "updated_at": datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Failed to update variant stats: {e}")
    
    def _determine_winner(
        self,
        variant_results: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Determine the winning variant based on statistical significance"""
        valid_variants = {k: v for k, v in variant_results.items() 
                         if v.get("status") == "sufficient_data"}
        
        if len(valid_variants) < 2:
            return None
        
        # Find variant with highest conversion rate
        best_variant_id = max(valid_variants.keys(), 
                             key=lambda k: valid_variants[k]["avg_conversion_rate"])
        
        best_variant = valid_variants[best_variant_id]
        
        # Simple confidence calculation (would be more sophisticated in production)
        # Based on sample size and performance gap
        sample_size = best_variant["sample_size"]
        performance_gap = best_variant["avg_conversion_rate"] - statistics.mean(
            [v["avg_conversion_rate"] for v in valid_variants.values()]
        )
        
        # Heuristic confidence score
        confidence = min(0.99, 0.5 + (sample_size / 200) + (performance_gap * 2))
        
        return {
            "variant_id": best_variant_id,
            "variant_name": best_variant["variant_name"],
            "strategy": best_variant["strategy"],
            "avg_conversion_rate": best_variant["avg_conversion_rate"],
            "avg_engagement_score": best_variant["avg_engagement_score"],
            "sample_size": best_variant["sample_size"],
            "confidence": confidence,
            "performance_gap": performance_gap
        }
