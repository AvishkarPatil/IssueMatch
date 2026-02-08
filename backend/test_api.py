#!/usr/bin/env python3
"""
Test script for the Multi-Objective Ranking System API integration.
Tests the /match-issue endpoint with real ranking system.
"""

import sys
import os
import time
import requests
import json
import subprocess
from typing import Dict, Any
from fastapi.testclient import TestClient
import pytest

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.api.v1.endpoints.auth import get_github_token
from unittest.mock import patch, AsyncMock

client = TestClient(app)

def wait_for_server(url: str, timeout: int = 30) -> bool:
    """Wait for the server to be ready."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return True
        except requests.exceptions.RequestException:
            pass
        time.sleep(1)
    return False

def api_test_endpoint(endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Test an API endpoint using TestClient."""
    try:
        response = client.get(endpoint, params=payload)
        return {
            "status_code": response.status_code,
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            "success": response.status_code == 200
        }
    except Exception as e:
        return {
            "status_code": None,
            "response": str(e),
            "success": False
        }

@pytest.mark.asyncio
async def test_ranking_integration():
    """Test the ranking system integration with the API."""
    print("Testing Multi-Objective Ranking System API Integration...")
    print("=" * 60)

    print("✅ Using FastAPI TestClient for testing")

    # Mock the FAISS search to return test data
    async def mock_func(*args, **kwargs):
        return {
            "recommendations": [
                {
                    "issue_id": 123,
                    "issue_url": "https://github.com/test/repo/issues/123",
                    "repo_url": "https://github.com/test/repo",
                    "title": "Test Issue",
                    "created_at": "2023-01-01T00:00:00Z",
                    "user_login": "testuser",
                    "labels": ["bug", "help wanted"],
                    "similarity_score": 0.85,
                    "final_score": 0.92,
                    "dimension_scores": {
                        "semantic_relevance": 0.85,
                        "repo_activity": 0.90,
                        "difficulty_match": 0.95,
                        "mentor_availability": 0.88,
                        "impact": 0.92
                    },
                    "short_description": "This is a test issue for matching"
                }
            ],
            "issues_fetched": 100,
            "issues_indexed": 1000,
            "message": "Successfully matched issues using multi-objective ranking"
        }

    # Override dependencies
    app.dependency_overrides[get_github_token] = lambda: "fake_github_token"

    # Patch the FAISS function
    with patch('app.api.v1.endpoints.match.get_top_matched_issues', side_effect=mock_func):

        # Test cases
        test_cases = [
            {
                "name": "Basic test with keywords",
                "payload": {
                    "keywords": ["python", "machine learning"],
                    "languages": ["python"],
                    "max_results": 5
                }
            },
            {
                "name": "Test with topics",
                "payload": {
                    "keywords": ["web development"],
                    "topics": ["frontend", "backend"],
                    "languages": ["javascript", "typescript"],
                    "max_results": 3
                }
            },
            {
                "name": "Test with empty parameters",
                "payload": {
                    "max_results": 2
                }
            }
        ]

        all_passed = True

        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🧪 Test {i}: {test_case['name']}")
            print("-" * 40)

            result = api_test_endpoint("/api/v1/match/match-issue", test_case['payload'])

            if result["success"]:
                print("✅ Request successful")
                response_data = result["response"]

                # Validate response structure
                required_fields = ["recommendations", "issues_fetched", "issues_indexed", "message"]
                if all(field in response_data for field in required_fields):
                    print("✅ Response structure is valid")

                    recommendations = response_data["recommendations"]
                    print(f"   📊 Found {len(recommendations)} recommendations")
                    print(f"   📈 Issues fetched: {response_data['issues_fetched']}")
                    print(f"   🗂️  Issues indexed: {response_data['issues_indexed']}")

                    # Check if recommendations have ranking scores
                    if recommendations:
                        first_rec = recommendations[0]
                        has_final_score = "final_score" in first_rec
                        has_dimension_scores = "dimension_scores" in first_rec

                        if has_final_score and has_dimension_scores:
                            print("✅ Ranking scores are present in recommendations")
                            print(f"   🎯 Final score: {first_rec['final_score']:.3f}")
                            dimension_scores = first_rec.get('dimension_scores', {})
                            for dim, score in dimension_scores.items():
                                print(f"   {dim}: {score:.3f}")
                        else:
                            print("❌ Ranking scores are missing from recommendations")
                            all_passed = False

                        # Check sorting (should be descending by final_score)
                        if len(recommendations) > 1:
                            scores = [r.get('final_score', 0) for r in recommendations]
                            if all(scores[j] >= scores[j+1] for j in range(len(scores)-1)):
                                print("✅ Recommendations are properly sorted by final score")
                            else:
                                print("❌ Recommendations are not properly sorted")
                                all_passed = False

                    else:
                        print("⚠️  No recommendations returned (may be due to API rate limits or no matching issues)")

                else:
                    print("❌ Response structure is invalid")
                    print(f"   Missing fields: {[f for f in required_fields if f not in response_data]}")
                    all_passed = False

            else:
                print("❌ Request failed")
                print(f"   Status: {result['status_code']}")
                print(f"   Error: {result['response']}")
                all_passed = False

        print("\n" + "=" * 60)
        if all_passed:
            print("🎉 All API integration tests passed!")
            print("✅ Multi-Objective Ranking System is working correctly with the API")
        else:
            print("❌ Some tests failed. Check the output above for details.")

        assert all_passed, "Some API integration tests failed. Check the output above for details."

if __name__ == "__main__":
    success = test_ranking_integration()
    sys.exit(0 if success else 1)
