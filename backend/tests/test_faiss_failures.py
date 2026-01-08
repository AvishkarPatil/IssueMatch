"""
Tests for FAISS and ML service failure scenarios.

This module tests error handling in FAISS vector search including:
- Model loading failures
- Empty issue results
- Embedding generation failures
- FAISS index build failures
- GitHub API failures during issue fetch
"""

import pytest
from unittest.mock import patch, MagicMock, Mock
import numpy as np
import httpx


@pytest.mark.faiss
class TestFAISSServiceFailures:
    """Test suite for FAISS and ML service failure scenarios."""

    def test_model_loading_failure(self):
        """Test get_top_matched_issues when model fails to load."""
        from app.services import faiss_search
        
        original_model = faiss_search.model
        faiss_search.model = None
        
        try:
            with patch('app.services.faiss_search.SentenceTransformer') as mock_transformer:

                mock_transformer.side_effect = Exception("Model loading failed")
                
                result = faiss_search.get_top_matched_issues(
                    query_text="test query",
                    keywords=["python"],
                    languages=["python"],
                    top_k=5
                )
                
                assert "recommendations" in result
                assert len(result["recommendations"]) == 0
                assert "error" in result["message"].lower() or result["issues_fetched"] == 0
        finally:
            
            faiss_search.model = original_model

    def test_empty_issues_from_github(self, respx_mock):
        """Test get_top_matched_issues when GitHub returns no issues."""
        from app.services.faiss_search import get_top_matched_issues
        
        respx_mock.get("https://api.github.com/search/issues").mock(
            return_value=httpx.Response(
                200,
                json={"total_count": 0, "incomplete_results": False, "items": []}
            )
        )
        
        result = get_top_matched_issues(
            query_text="test query",
            keywords=["nonexistent-keyword-xyz"],
            languages=[],
            top_k=5
        )
        
        assert result["recommendations"] == []
        assert result["issues_fetched"] == 0
        assert result["issues_indexed"] == 0
        assert "no issues" in result["message"].lower()

    def test_fetch_github_issues_rate_limit(self, respx_mock):
        """Test fetch_github_issues when rate limited."""
        from app.services.faiss_search import fetch_github_issues
        
        respx_mock.get("https://api.github.com/search/issues").mock(
            return_value=httpx.Response(
                403,
                json={"message": "API rate limit exceeded"}
            )
        )
        
        result = fetch_github_issues(
            keywords=["python"],
            top_k=5,
            github_token="test_token"
        )
        
        assert isinstance(result, list)
        assert len(result) == 0

    def test_fetch_github_issues_unauthorized(self, respx_mock):
        """Test fetch_github_issues with invalid token."""
        from app.services.faiss_search import fetch_github_issues
        
        respx_mock.get("https://api.github.com/search/issues").mock(
            return_value=httpx.Response(
                401,
                json={"message": "Bad credentials"}
            )
        )
        
        result = fetch_github_issues(
            keywords=["python"],
            top_k=5,
            github_token="invalid_token"
        )
        
        assert isinstance(result, list)
        assert len(result) == 0

    def test_embed_texts_with_invalid_input(self, mock_sentence_transformer):
        """Test embed_texts with invalid input."""
        from app.services.faiss_search import embed_texts
        
        mock_sentence_transformer.encode.side_effect = Exception("Encoding failed")
        
        with pytest.raises(Exception):
            embed_texts(["test text"], mock_sentence_transformer)

    def test_embed_texts_with_empty_list(self, mock_sentence_transformer):
        """Test embed_texts with empty text list."""
        from app.services.faiss_search import embed_texts
        
        mock_sentence_transformer.encode.return_value = np.array([])
        
        result = embed_texts([], mock_sentence_transformer)
        
        assert len(result) == 0

    def test_build_faiss_index_with_empty_embeddings(self):
        """Test build_faiss_index with empty embeddings."""
        from app.services.faiss_search import build_faiss_index
        
        empty_embeddings = np.array([]).reshape(0, 384)
        
        try:
            index = build_faiss_index(empty_embeddings)
            assert index.ntotal == 0
        except Exception as e:
            assert "empty" in str(e).lower() or "dimension" in str(e).lower()

    def test_build_faiss_index_with_invalid_dimensions(self):
        """Test build_faiss_index with wrong embedding dimensions."""
        from app.services.faiss_search import build_faiss_index
        
        wrong_dim_embeddings = np.random.rand(5, 128)  
        
        with pytest.raises(Exception):
            build_faiss_index(wrong_dim_embeddings)

    def test_search_similar_issues_with_invalid_index(self, mock_sentence_transformer):
        """Test search_similar_issues with invalid FAISS index."""
        from app.services.faiss_search import search_similar_issues
        
        mock_index = MagicMock()
        mock_index.search.side_effect = Exception("Index search failed")
        
        with pytest.raises(Exception):
            search_similar_issues(
                "test query",
                mock_sentence_transformer,
                mock_index,
                [{"title": "test", "body": "test"}],
                top_k=5
            )

    def test_search_similar_issues_with_out_of_bounds_indices(self, mock_sentence_transformer, mock_faiss_index):
        """Test search_similar_issues when FAISS returns invalid indices."""
        from app.services.faiss_search import search_similar_issues
        
        mock_faiss_index.search.return_value = (
            [[0.1, 0.2, 0.3]],  
            [[100, 200, 300]]  
        )
        
        issues = [
            {"title": "Issue 1", "body": "Body 1"},
            {"title": "Issue 2", "body": "Body 2"}
        ]
        
        result = search_similar_issues(
            "test query",
            mock_sentence_transformer,
            mock_faiss_index,
            issues,
            top_k=3
        )
        
        assert isinstance(result, list)

    def test_format_issues_json_with_none_body(self):
        """Test format_issues_json when issue body is None."""
        from app.services.faiss_search import format_issues_json
        
        issues = [
            {
                "id": 1,
                "html_url": "https://github.com/owner/repo/issues/1",
                "repository_url": "https://api.github.com/repos/owner/repo",
                "title": "Test Issue",
                "body": None,  # None body
                "created_at": "2024-01-01T00:00:00Z",
                "user": {"login": "testuser"},
                "labels": [],
                "similarity_score": 0.9
            }
        ]
        
        result = format_issues_json(issues)
        
        assert len(result) == 1
        assert result[0]["short_description"] == ""

    def test_format_issues_json_with_missing_fields(self):
        """Test format_issues_json with missing optional fields."""
        from app.services.faiss_search import format_issues_json
        
        issues = [
            {
                "id": 1,
                "html_url": "https://github.com/owner/repo/issues/1",
                "title": "Test Issue"
            }
        ]
        
        result = format_issues_json(issues)
        
        assert len(result) == 1
        assert result[0]["title"] == "Test Issue"
        assert result[0]["similarity_score"] == 0.0

    def test_get_top_matched_issues_with_network_error(self, respx_mock):
        """Test get_top_matched_issues when network fails during issue fetch."""
        from app.services.faiss_search import get_top_matched_issues
        
        respx_mock.get("https://api.github.com/search/issues").mock(
            side_effect=httpx.ConnectError("Network error")
        )
        
        result = get_top_matched_issues(
            query_text="test query",
            keywords=["python"],
            languages=["python"],
            top_k=5
        )
        
        assert "recommendations" in result
        assert len(result["recommendations"]) == 0
        assert "error" in result["message"].lower()

    def test_get_top_matched_issues_with_malformed_github_response(self, respx_mock):
        """Test get_top_matched_issues when GitHub returns malformed data."""
        from app.services.faiss_search import get_top_matched_issues
        
        respx_mock.get("https://api.github.com/search/issues").mock(
            return_value=httpx.Response(
                200,
                json={"items": [{"invalid": "structure"}]}  
            )
        )
        
        result = get_top_matched_issues(
            query_text="test query",
            keywords=["python"],
            languages=["python"],
            top_k=5
        )
        
        assert "recommendations" in result