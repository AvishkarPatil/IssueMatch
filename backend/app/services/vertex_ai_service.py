import os
from google.cloud import language_v1
from google.oauth2 import service_account
from google.api_core import exceptions as google_exceptions
from typing import Dict, List, Set, Optional
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationResponse, Candidate
from vertexai.generative_models._generative_models import SafetyRating


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


# --- NEW FUNCTION for Gen AI Query Generation ---
def generate_github_query_with_genai(
    keywords: List[str],
    languages: List[str], # Re-added based on user paste
    topics: List[str],    # Re-added based on user paste
    # desired_labels are now generated by AI based on prompt instructions
) -> Optional[List[str]]: # Return type changed to List[str]
    """
    Uses a Generative AI model (Gemini) via Vertex AI to generate MULTIPLE
    GitHub Issues Search API query strings based on input criteria, aiming for
    different angles (e.g., general, beginner, specific topic).

    Args:
        keywords: List of technical keywords/skills.
        languages: List of programming languages.
        topics: List of relevant topics.

    Returns:
        A list of generated GitHub query strings (typically 2-3 variations),
        or None if a critical error occurs during initialization or all API calls fail.
        Returns an empty list if initialization succeeded but no queries could be generated.
    """
    # Check if the generative model client initialized correctly
    if gen_model is None:
        print(f"ERROR in generate_github_query_with_genai: Generative model client not initialized. Error: {initialization_error}")
        return None # Return None if model itself failed to load

    generated_queries: List[str] = [] # Initialize list to store results

    # --- Define Prompt Variations ---
    # We'll create slightly different instructions for each query variation.
    prompt_variations = [
        # Variation 1: General query, include "good first issue"
        {
            "focus": "general skills match, including beginner-friendly issues",
            "label_suggestion": 'Suggest 1-2 relevant labels, prioritizing "good first issue" if applicable.'
        },
        # Variation 2: Broader skills/topics, include "help wanted"
        {
            "focus": "broader skills and topics match, including issues needing help",
            "label_suggestion": 'Suggest 1-2 relevant labels, prioritizing "help wanted" or "bug" if applicable.'
        },
        # Variation 3: Focus on specific keywords/topics, maybe documentation
        {
            "focus": "specific technical keywords/topics match, potentially including documentation",
            "label_suggestion": 'Suggest 1-2 relevant labels, prioritizing "documentation" or "enhancement" if applicable.'
        }
    ]

    # Convert base inputs to strings once
    keywords_str = ", ".join(keywords) if keywords else "general software development"
    languages_str = ", ".join(languages) if languages else "Any"
    topics_str = ", ".join(topics) if topics else "Any"

    # --- Loop through variations and call the AI Model ---
    for i, variation in enumerate(prompt_variations):
        print(f"\n--- Generating Query Variation {i+1} ---")
        print(f"Focus: {variation['focus']}")

        # Construct the specific prompt for this variation
        prompt = f"""
You are an expert at crafting GitHub Issue Search API query strings to help developers find relevant open-source contribution opportunities.

Your goal is to generate the most effective query string possible based on the developer's profile and the specific focus for this query variation.

Developer Profile:
Keywords/Skills: {keywords_str}
Programming Languages: {languages_str}
Topics of Interest: {topics_str}

Query Focus: {variation['focus']}

Instructions:
1.  Analyze the keywords, languages, and topics.
2.  {variation['label_suggestion']} Use quotes for labels with spaces (e.g., label:"good first issue").
3.  Create a single, optimized query string suitable for the GitHub Issues Search API (https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests).
4.  The query MUST filter for issues that are open (`state:open`) and are issues, not pull requests (`type:issue`).
5.  Include relevant `language:` qualifiers based on the provided languages. If 'Any' or none provided, infer from keywords if possible (e.g., 'react' implies 'javascript').
6.  Include `label:` qualifiers based ONLY on the labels you suggested in step 2.
7.  Combine the most relevant input keywords effectively using GitHub search syntax (space for AND, OR, quotes for phrases). Focus on distinctive technical terms relevant to the Query Focus.
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

            # --- Parse the Response ---
            if response.candidates and response.candidates[0].content.parts:
                if response.candidates[0].finish_reason != Candidate.FinishReason.SAFETY:
                    generated_query = response.text.strip()
                    if generated_query and len(generated_query) > 10: # Basic check
                        print(f"DEBUG: Successfully generated query variation {i+1}: {generated_query}")
                        generated_queries.append(generated_query) # Add to list
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

    # --- Return the list of generated queries ---
    if not generated_queries:
        print("WARN: Failed to generate any valid queries after attempting all variations.")
        # Return empty list if initialization was okay but generation failed
        return []
    else:
        print(f"DEBUG: Returning {len(generated_queries)} generated query variations.")
        return generated_queries

# Note: The if __name__ == "__main__": block should be removed if running via FastAPI.
