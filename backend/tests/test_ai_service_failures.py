"""
Tests for AI service failure scenarios.

This module tests error handling in AI services including:
- Google Cloud NLP API failures
- Gemini AI API failures  
- Empty/invalid input text
- API quota exceeded
- Network timeouts
"""

import pytest
from unittest.mock import patch, MagicMock, Mock
import httpx


@pytest.mark.ai
class TestAIServiceFailures:
    """Test suite for AI service failure scenarios."""

    def test_analyze_profile_text_missing_credentials(self):
        """Test analyze_profile_text when credentials file is missing."""
        from app.services import vertex_ai_service
        
        # Check if initialization error is set
        if vertex_ai_service.initialization_error:
            # Service should handle missing credentials gracefully
            result = vertex_ai_service.analyze_profile_text("test text")
            
            # Should return empty or error result
            assert isinstance(result, dict)
            assert "keywords_entities" in result

    def test_analyze_profile_text_with_empty_string(self):
        """Test analyze_profile_text with empty input."""
        from app.services.vertex_ai_service import analyze_profile_text
        
        result = analyze_profile_text("")
        
        # Should handle gracefully
        assert isinstance(result, dict)
        assert "keywords_entities" in result
        assert len(result["keywords_entities"]) == 0

    def test_analyze_profile_text_with_none_input(self):
        """Test analyze_profile_text with None input."""
        from app.services.vertex_ai_service import analyze_profile_text
        
        # Should handle None gracefully or raise clear error
        try:
            result = analyze_profile_text(None)
            assert isinstance(result, dict)
        except (TypeError, AttributeError) as e:
            # Expected error for None input
            assert "None" in str(e) or "NoneType" in str(e)

    def test_analyze_profile_text_with_very_long_text(self):
        """Test analyze_profile_text with very long input (>10000 chars)."""
        from app.services.vertex_ai_service import analyze_profile_text
        
        # Create very long text
        long_text = "test " * 5000  # 25000 chars
        
        # Should handle gracefully (may truncate or process)
        result = analyze_profile_text(long_text)
        
        assert isinstance(result, dict)
        assert "keywords_entities" in result

    @patch('app.services.vertex_ai_service.client')
    def test_analyze_profile_text_api_error(self, mock_client):
        """Test analyze_profile_text when Google NLP API fails."""
        from app.services.vertex_ai_service import analyze_profile_text
        
        # Mock client to raise exception
        if mock_client:
            mock_client.analyze_entities.side_effect = Exception("API Error")
            
            result = analyze_profile_text("test text")
            
            # Should handle error gracefully
            assert isinstance(result, dict)
            assert "keywords_entities" in result

    @patch('app.services.vertex_ai_service.client')
    def test_analyze_profile_text_quota_exceeded(self, mock_client):
        """Test analyze_profile_text when API quota is exceeded."""
        from app.services.vertex_ai_service import analyze_profile_text
        from google.api_core import exceptions
        
        # Mock client to raise quota exceeded error
        if mock_client:
            mock_client.analyze_entities.side_effect = exceptions.ResourceExhausted("Quota exceeded")
            
            result = analyze_profile_text("test text")
            
            # Should handle gracefully
            assert isinstance(result, dict)

    @patch('app.services.vertex_ai_service.gen_model')
    def test_generate_github_query_with_invalid_api_key(self, mock_gen_model):
        """Test generate_github_query_with_genai with invalid API key."""
        from app.services.vertex_ai_service import generate_github_query_with_genai
        
        # Mock model to raise authentication error
        if mock_gen_model:
            mock_gen_model.generate_content.side_effect = Exception("Invalid API key")
            
            result = generate_github_query_with_genai(
                keywords=["python"],
                languages=["python"],
                topics=["web"]
            )
            
            # Should return None or fallback query
            assert result is None or isinstance(result, str)

    @patch('app.services.vertex_ai_service.gen_model')
    def test_generate_github_query_rate_limit(self, mock_gen_model):
        """Test generate_github_query_with_genai when rate limited."""
        from app.services.vertex_ai_service import generate_github_query_with_genai
        
        # Mock model to raise rate limit error
        if mock_gen_model:
            mock_gen_model.generate_content.side_effect = Exception("Rate limit exceeded")
            
            result = generate_github_query_with_genai(
                keywords=["python"],
                languages=["python"],
                topics=["web"]
            )
            
            # Should return None or fallback
            assert result is None or isinstance(result, str)

    @patch('app.services.vertex_ai_service.gen_model')
    def test_generate_github_query_timeout(self, mock_gen_model):
        """Test generate_github_query_with_genai when request times out."""
        from app.services.vertex_ai_service import generate_github_query_with_genai
        
        # Mock model to timeout
        if mock_gen_model:
            mock_gen_model.generate_content.side_effect = TimeoutError("Request timed out")
            
            result = generate_github_query_with_genai(
                keywords=["python"],
                languages=["python"],
                topics=["web"]
            )
            
            # Should return None or fallback
            assert result is None or isinstance(result, str)

    @patch('app.services.vertex_ai_service.gen_model')
    def test_generate_github_query_malformed_response(self, mock_gen_model):
        """Test generate_github_query_with_genai with malformed AI response."""
        from app.services.vertex_ai_service import generate_github_query_with_genai
        
        # Mock model to return malformed response
        if mock_gen_model:
            mock_response = MagicMock()
            mock_response.candidates = []  # Empty candidates
            mock_gen_model.generate_content.return_value = mock_response
            
            result = generate_github_query_with_genai(
                keywords=["python"],
                languages=["python"],
                topics=["web"]
            )
            
            # Should handle gracefully
            assert result is None or isinstance(result, str)

    def test_generate_github_query_with_empty_inputs(self):
        """Test generate_github_query_with_genai with all empty inputs."""
        from app.services.vertex_ai_service import generate_github_query_with_genai
        
        result = generate_github_query_with_genai(
            keywords=[],
            languages=[],
            topics=[]
        )
        
        # Should handle gracefully or return None
        assert result is None or isinstance(result, str)

    @patch('app.services.vertex_ai_service.gen_model')
    def test_generate_github_query_network_error(self, mock_gen_model):
        """Test generate_github_query_with_genai with network error."""
        from app.services.vertex_ai_service import generate_github_query_with_genai
        
        # Mock model to raise network error
        if mock_gen_model:
            mock_gen_model.generate_content.side_effect = ConnectionError("Network error")
            
            result = generate_github_query_with_genai(
                keywords=["python"],
                languages=["python"],
                topics=["web"]
            )
            
            # Should return None or fallback
            assert result is None or isinstance(result, str)
