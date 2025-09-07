import os
import uuid
from google.cloud import language_v1
from google.oauth2 import service_account
from google.api_core import exceptions as google_exceptions
from typing import Dict, List, Set, Optional
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationResponse, Candidate
from vertexai.generative_models._generative_models import SafetyRating

from app.models.query_performance import QueryStrategy
from app.services.query_performance_service import QueryPerformanceTracker


VERTEX_AI_PROJECT_ID: Optional[str] = None
VERTEX_AI_LOCATION = "us-central1" #
GEMINI_MODEL_NAME = "gemini-2.0-flash-001"

key_path = os.path.join(os.path.dirname(__file__), '.', 'keys.json')

credentials = None
client: Optional[language_v1.LanguageServiceClient] = None
gen_model: Optional[GenerativeModel] = None
initialization_error: Optional[str] = None

try:
    if not os.path.isabs(key_path):
        script_dir = os.path.dirname(__file__)
        key_path_abs = os.path.join(script_dir, '..', key_path)
    else:
        key_path_abs = key_path

    print(f"DEBUG: Attempting to load credentials from absolute path: {key_path_abs}")
    if not os.path.exists(key_path_abs):
        raise FileNotFoundError(f"Service account key file not found at calculated path: {key_path_abs} (original path was '{key_path}')")

    credentials = service_account.Credentials.from_service_account_file(key_path_abs)
    print(f"DEBUG: Successfully loaded credentials from: {key_path_abs}")
    print(f"DEBUG: Using Project ID from credentials: {credentials.project_id}")

    print("DEBUG: Initializing Google Cloud Language client...")
    client = language_v1.LanguageServiceClient(credentials=credentials)
    print("DEBUG: Google Cloud Language client initialized successfully with explicit credentials.")

except FileNotFoundError as e:
    initialization_error = f"CRITICAL ERROR: {e}. Please ensure the 'key_path' variable points to the correct file location relative to the project structure."
    print(initialization_error)
except google_exceptions.GoogleAPICallError as e:
    initialization_error = f"CRITICAL ERROR: Failed to initialize Google Cloud Language client (API Call Error): {e}. Check permissions and network."
    print(initialization_error)
except Exception as e:
    initialization_error = f"CRITICAL ERROR: Failed to load credentials or initialize Google Cloud Language client: {e}"
    print(initialization_error)

# --- Service Function ---

def analyze_profile_text(text_blob: str) -> Dict[str, List[str]]:
    """
    Analyzes text blob using Google Cloud Natural Language API (analyzeEntities)
    to extract relevant keywords/entities.
    (Implementation details omitted for brevity - assume it's the same as your provided code)
    """
    if client is None:
        print(f"ERROR in analyze_profile_text: Language client was not initialized. Initialization error was: {initialization_error}")
        return {"keywords_entities": []}
    if not text_blob:
        print("Warning: Text blob provided to analyze_profile_text was empty.")
        return {"keywords_entities": []}

    # --- Filtering Configuration ---
    RELEVANT_ENTITY_TYPES = {
        language_v1.Entity.Type.ORGANIZATION, language_v1.Entity.Type.CONSUMER_GOOD,
        language_v1.Entity.Type.WORK_OF_ART, language_v1.Entity.Type.OTHER,
    }
    MIN_SALIENCE = 0.008 # Adjusted based on user code
    ENTITY_BLOCKLIST = {
        "developer", "engineer", "engineering", "software", "experience", "experienced",
        "proficiency", "proficient", "knowledge", "understanding", "technology",
        "technologies", "tool", "tools", "platform", "platforms", "system", "systems",
        "service", "services", "api", "apis", "contributor", "contribution",
        "open-source", "library", "framework", "cloud", "machine", "learning",
        "using", "like", "with", "and", "the", "for", "etc", "movie data",
        "telegram file", "## license mit license", "## 📝", "ai 3", "license",
        "mit license",
    }
    MAX_ENTITY_LENGTH = 50
    # --- End Filtering Configuration ---

    document = language_v1.Document(content=text_blob, type_=language_v1.Document.Type.PLAIN_TEXT)
    extracted_entities: Set[str] = set()
    try:
        print(f"DEBUG: Sending text blob (length: {len(text_blob)}) to Cloud NLP Analyze Entities...")
        response = client.analyze_entities(document=document, encoding_type=language_v1.EncodingType.UTF8)
        print(f"DEBUG: Received {len(response.entities)} entities from Cloud NLP.")

        for entity in response.entities:
            if entity.type_ in RELEVANT_ENTITY_TYPES and entity.salience >= MIN_SALIENCE:
                entity_name = entity.name.lower().strip()
                if (len(entity_name) > 2 and
                        entity_name not in ENTITY_BLOCKLIST and
                        len(entity_name) <= MAX_ENTITY_LENGTH and
                        not entity_name.startswith('#')):
                    extracted_entities.add(entity_name)

    except google_exceptions.PermissionDenied as e:
         print(f"ERROR: Cloud NLP API call failed - Permission Denied: {e}")
         print("Ensure the service account used has the 'Cloud Natural Language API User' role or equivalent permissions.")
    except google_exceptions.GoogleAPICallError as e:
        print(f"ERROR: Cloud NLP API call failed: {e}")
    except Exception as e:
        print(f"ERROR: Unexpected error during NLP analysis: {e}")

    print(f"DEBUG: Final extracted entities count: {len(extracted_entities)}")
    return {"keywords_entities": sorted(list(extracted_entities))}


# --- ENHANCED FUNCTION for Gen AI Query Generation with Learning ---
async def generate_optimized_github_query_with_genai(
    keywords: List[str],
    languages: List[str],
    topics: List[str],
    user_id: str,
    user_history: Optional[Dict] = None
) -> Optional[List[Dict[str, str]]]:
    """
    Enhanced version that learns from user feedback and optimizes query generation.
    Uses successful patterns and A/B testing to improve query effectiveness.

    Args:
        keywords: List of technical keywords/skills.
        languages: List of programming languages.
        topics: List of relevant topics.
        user_id: User identifier for personalization and tracking.
        user_history: Optional user interaction history for personalization.

    Returns:
        A list of dictionaries containing query strings and their metadata,
        or None if a critical error occurs during initialization.
    """
    # Check if the generative model client initialized correctly
    if gen_model is None:
        print(f"ERROR in generate_optimized_github_query_with_genai: Generative model client not initialized. Error: {initialization_error}")
        return None

    # Initialize performance tracker
    tracker = QueryPerformanceTracker()
    
    # Get successful patterns to inform query generation
    try:
        successful_patterns = await tracker.get_successful_patterns(user_history)
        print(f"DEBUG: Found {len(successful_patterns)} successful patterns for optimization")
    except Exception as e:
        print(f"WARN: Could not load successful patterns: {e}")
        successful_patterns = []

    generated_queries: List[Dict[str, str]] = []

    # --- Enhanced Prompt Variations with Learning ---
    strategy_configs = [
        {
            "strategy": QueryStrategy.GENERAL_BEGINNER,
            "focus": "general skills match, including beginner-friendly issues",
            "label_suggestion": 'Suggest 1-2 relevant labels, prioritizing "good first issue" if applicable.'
        },
        {
            "strategy": QueryStrategy.HELP_WANTED,
            "focus": "broader skills and topics match, including issues needing help", 
            "label_suggestion": 'Suggest 1-2 relevant labels, prioritizing "help wanted" or "bug" if applicable.'
        },
        {
            "strategy": QueryStrategy.SPECIFIC_TECHNICAL,
            "focus": "specific technical keywords/topics match, potentially including documentation",
            "label_suggestion": 'Suggest 1-2 relevant labels, prioritizing "documentation" or "enhancement" if applicable.'
        }
    ]

    # Convert base inputs to strings once
    keywords_str = ", ".join(keywords) if keywords else "general software development"
    languages_str = ", ".join(languages) if languages else "Any"
    topics_str = ", ".join(topics) if topics else "Any"

    # --- Loop through strategy configurations and generate optimized queries ---
    for i, config in enumerate(strategy_configs):
        strategy = config["strategy"]
        print(f"\n--- Generating Query Variation {i+1}: {strategy.value} ---")
        print(f"Focus: {config['focus']}")

        # Get optimized prompt based on learned patterns
        try:
            base_prompt = await tracker.optimize_prompt_strategy(successful_patterns, strategy)
        except Exception as e:
            print(f"WARN: Could not get optimized prompt, using base: {e}")
            base_prompt = tracker._get_base_prompt_template(strategy)

        # Construct the enhanced prompt with learning
        prompt = f"""{base_prompt}

Developer Profile:
Keywords/Skills: {keywords_str}
Programming Languages: {languages_str}
Topics of Interest: {topics_str}

Query Focus: {config['focus']}

Instructions:
1.  Analyze the keywords, languages, and topics.
2.  {config['label_suggestion']} Use quotes for labels with spaces (e.g., label:"good first issue").
3.  Create a single, optimized query string suitable for the GitHub Issues Search API.
4.  The query MUST filter for issues that are open (`state:open`) and are issues, not pull requests (`type:issue`).
5.  Include relevant `language:` qualifiers based on the provided languages. If 'Any' or none provided, infer from keywords if possible.
6.  Include `label:` qualifiers based ONLY on the labels you suggested in step 2.
7.  Combine the most relevant input keywords effectively using GitHub search syntax. Focus on distinctive technical terms relevant to the Query Focus.
8.  Optionally use `topic:` qualifiers based on the provided topics if relevant to the Query Focus.
9.  Keep the query reasonably concise but effective for the specified focus.
10. Output ONLY the raw generated query string, with no explanation, preamble, markdown formatting, or quotation marks surrounding the entire string.

Generated Query String:"""

        print(f"DEBUG: Sending prompt variation {i+1} to Gen AI model...")
        # print(f"---PROMPT START---\n{prompt}\n---PROMPT END---") # Uncomment for full prompt debugging

        try:
            generation_config = {
                "temperature": 0.3 + (i * 0.1), # Slightly increase temp for variety
                "max_output_tokens": 256,
            }
            response: GenerationResponse = gen_model.generate_content(
                prompt,
                generation_config=generation_config,
                stream=False,
            )

            print(f"DEBUG: Received Gen AI response for variation {i+1}. Finish reason: {response.candidates[0].finish_reason}")

            # --- Parse the Response and Track Performance ---
            if response.candidates and response.candidates[0].content.parts:
                if response.candidates[0].finish_reason != Candidate.FinishReason.SAFETY:
                    generated_query = response.text.strip()
                    if generated_query and len(generated_query) > 10:
                        print(f"DEBUG: Successfully generated query variation {i+1}: {generated_query}")
                        
                        # Create query with metadata and tracking
                        query_with_metadata = {
                            "query": generated_query,
                            "strategy": strategy.value,
                            "query_id": str(uuid.uuid4()),
                            "focus": config['focus']
                        }
                        
                        # Track query creation for performance monitoring
                        try:
                            await tracker.track_query_creation(
                                query_string=generated_query,
                                strategy=strategy,
                                user_id=user_id,
                                keywords=keywords,
                                languages=languages,
                                topics=topics
                            )
                        except Exception as e:
                            print(f"WARN: Could not track query creation: {e}")
                        
                        generated_queries.append(query_with_metadata)
                    else:
                        print(f"WARN: Gen AI returned an empty or short response for variation {i+1}: '{generated_query}'")
                else:
                    print(f"ERROR: Gen AI response blocked due to safety settings for variation {i+1}. Finish Reason: {response.candidates[0].finish_reason}")
                    if response.candidates[0].safety_ratings:
                         for rating in response.candidates[0].safety_ratings:
                             print(f" - Safety Rating: {rating.category}, Probability: {rating.probability.name}")
            else:
                print(f"ERROR: Gen AI response was empty or malformed for variation {i+1}.")
                if response.prompt_feedback and response.prompt_feedback.block_reason:
                     print(f"ERROR: Prompt may have been blocked. Reason: {response.prompt_feedback.block_reason}")
                     if response.prompt_feedback.safety_ratings:
                          for rating in response.prompt_feedback.safety_ratings:
                               print(f" - Safety Rating: {rating.category}, Probability: {rating.probability.name}")

        except google_exceptions.GoogleAPICallError as e:
            print(f"ERROR: Vertex AI API call failed for variation {i+1}: {e}")
            # Continue to next variation
        except Exception as e:
            print(f"ERROR: Unexpected error during Gen AI query generation for variation {i+1}: {e}")
            # Continue to next variation

    # --- Return the enhanced list of generated queries with metadata ---
    if not generated_queries:
        print("WARN: Failed to generate any valid queries after attempting all variations.")
        return []
    else:
        print(f"DEBUG: Returning {len(generated_queries)} generated query variations with tracking.")
        return generated_queries


# --- LEGACY FUNCTION for Backward Compatibility ---
def generate_github_query_with_genai(
    keywords: List[str],
    languages: List[str],
    topics: List[str]
) -> Optional[List[str]]:
    """
    Legacy function that maintains backward compatibility.
    For new implementations, use generate_optimized_github_query_with_genai instead.
    """
    import asyncio
    
    # Create a dummy user_id for legacy calls
    dummy_user_id = "legacy_user"
    
    try:
        # Run the new async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            generate_optimized_github_query_with_genai(keywords, languages, topics, dummy_user_id)
        )
        
        if result:
            # Return just the query strings for backward compatibility
            return [query_data["query"] for query_data in result]
        else:
            return None
            
    except Exception as e:
        print(f"ERROR in legacy function: {e}")
        return None
    finally:
        loop.close()

# Note: The if __name__ == "__main__": block should be removed if running via FastAPI.
