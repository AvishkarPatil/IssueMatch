from fastapi import APIRouter, HTTPException, status, Depends, Query
from starlette.requests import Request
from typing import Dict, List, Optional
from ....services.vertex_ai_service import analyze_profile_text, generate_github_query_with_genai
from ...v1.endpoints.auth import get_github_token
from ....services.github_service import get_profile_text_data, get_user_profile

router = APIRouter()


@router.get("/analyze-profile", response_model=Dict[str, List[str]])
async def analyze_github_profile(request: Request, token: str = Depends(get_github_token)):
    """
    Analyzes the authenticated GitHub user's profile using Google Cloud Natural Language API.
    """
    try:
        # Get profile text data from GitHub
        profile_data = await get_profile_text_data(token)
        print(
            f"DEBUG: Got profile_data with {len(profile_data.get('languages', []))} languages, {len(profile_data.get('topics', []))} topics")

        # Get user profile for additional information
        user_profile = await get_user_profile(token)

        # Extract components from profile_data
        languages = profile_data.get("languages", [])
        topics = profile_data.get("topics", [])
        text_blob = profile_data.get("text_blob", "")

        print(f"DEBUG: Original text_blob length: {len(text_blob)}")

        # Start with the existing text_blob
        combined_text = text_blob

        # Add bio if available
        if user_profile.get("bio"):
            combined_text += "\n\n" + user_profile["bio"]
            print(f"DEBUG: Added bio: {user_profile.get('bio')}")

        # Add languages and topics as explicit text to help the analysis
        if languages:
            lang_text = "\n\nProgramming Languages: " + ", ".join(languages)
            combined_text += lang_text
            print(f"DEBUG: Added languages text: {lang_text}")

        if topics:
            topic_text = "\n\nTopics and Technologies: " + ", ".join(topics)
            combined_text += topic_text
            print(f"DEBUG: Added topics text: {topic_text}")

        print(f"DEBUG: Final combined_text length: {len(combined_text)}")

        if len(combined_text) == 0:
            print("DEBUG: Combined text is empty after adding bio, languages, and topics.")
            combined_text = "No relevant information found in profile data."

        # Return early if no text to analyze
        if not combined_text:
            print("WARNING: No text to analyze!")
            return {
                "keywords_entities": [],
                "languages": languages,
                "topics": topics
            }


        test_text = """
        A developer exploring web technologies, primarily using HTML, CSS, and JavaScript for front-end tasks. Also familiar with Python for basic scripting and automation. Proficient with Git and GitHub version control. Actively looking for beginner-friendly open-source contribution opportunities, such as documentation improvements, UI tweaks, or issues marked as 'good first issue'. Interested in learning more about web development frameworks and contributing to community projects.
        """
        combined_text += "\n\n" + test_text
        print(f"DEBUG: Added test text for debugging. Final length: {len(combined_text)}")

        print("DEBUG: Calling analyze_profile_text...")
        analysis_result = analyze_profile_text(combined_text)
        print(f"DEBUG: Got analysis_result with {len(analysis_result.get('keywords_entities', []))} entities")

        analysis_result["languages"] = ["python", "javascript", "html", "css"]
        analysis_result["topics"] = ["web-development", "documentation", "good-first-issue", "git"]

        return analysis_result

    except Exception as e:
        print(f"ERROR in analyze_github_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze GitHub profile: {str(e)}"
        )


@router.get("/generate-query", response_model=Dict[str, str])
async def generate_github_query(
        request: Request,
        token: str = Depends(get_github_token),
        query_type: str = Query("issues",
                                description="Type of query to generate: 'issues', 'repositories', or 'custom'"),
        custom_prompt: Optional[str] = Query(None, description="Custom instructions for query generation")
):
    """
    Generates GitHub search queries based on the user's profile analysis.
    """
    try:
        # First, get the analyzed profile data
        profile_analysis = await analyze_github_profile(request, token)

        # Extract the relevant data
        keywords = profile_analysis.get("keywords_entities", [])
        languages = profile_analysis.get("languages", [])
        topics = profile_analysis.get("topics", [])

        print(f"DEBUG: Profile data for query generation:")
        print(f"DEBUG: - Keywords: {keywords}")
        print(f"DEBUG: - Languages: {languages}")
        print(f"DEBUG: - Topics: {topics}")

        # Generate the query using Vertex AI
        print(f"DEBUG: Calling generate_github_query_with_genai")
        generated_query = generate_github_query_with_genai(keywords, languages, topics)

        # Check if the query was generated successfully
        if generated_query is None:
            print("WARNING: generate_github_query_with_genai returned None")
            # Provide a fallback query if generation fails
            if languages:
                # Create a simple query based on languages
                fallback_query = f"state:open type:issue language:{languages[0]}"
                if len(languages) > 1:
                    fallback_query += f" OR language:{languages[1]}"
                if keywords:
                    fallback_query += f" {keywords[0]}"
                fallback_query += " label:\"good first issue\""
            else:
                # Very basic fallback
                fallback_query = "state:open type:issue label:\"good first issue\""

            print(f"DEBUG: Using fallback query: {fallback_query}")
            generated_query = fallback_query

        print(f"DEBUG: Final query: {generated_query}")

        return {
            "query": generated_query,
            "query_type": query_type
        }

    except Exception as e:
        print(f"ERROR in generate_github_query: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate GitHub query: {str(e)}"
        )