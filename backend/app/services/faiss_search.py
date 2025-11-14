import asyncio
import aiohttp
from sentence_transformers import SentenceTransformer
import faiss, re
import numpy as np
import json
from typing import List, Dict, Any, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
TOP_PER_KEYWORD = 5  # Number of issues to fetch per keyword
MODEL_NAME = "all-MiniLM-L6-v2"  # Sentence transformer model to use

# Global variables
model = None

def load_model():
    global model
    if model is None:
        try:
            logger.info(f"Loading sentence transformer model: {MODEL_NAME}")
            model = SentenceTransformer(MODEL_NAME)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            model = None

load_model()

async def fetch_issues_for_keyword(session: aiohttp.ClientSession, keyword: str, top_k: int, headers: Dict[str, str]) -> List[Dict[str, Any]]:
    query = f'{keyword}+state:open+type:issue'
    url = f"https://api.github.com/search/issues?q={query}&per_page={top_k}"
    logger.info(f"Fetching issues for keyword: {keyword}")
    async with session.get(url, headers=headers) as response:
        if response.status == 200:
            json_response = await response.json()
            items = json_response.get('items', [])
            logger.info(f"Found {len(items)} issues for keyword: {keyword}")
            return items[:top_k]
        else:
            logger.error(f"Error for keyword: {keyword}, Status Code: {response.status}")
            if response.status == 403:
                logger.error("Rate limit exceeded or authentication required")
            elif response.status == 401:
                logger.error("Unauthorized - check your GitHub token")
            return []

async def fetch_github_issues(keywords: List[str], top_k: int = TOP_PER_KEYWORD, github_token: Optional[str] = None) -> List[Dict[str, Any]]:
    logger.info(f"Fetching GitHub issues for keywords: {keywords}")
    headers = {"Accept": "application/vnd.github+json"}
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_issues_for_keyword(session, keyword, top_k, headers) for keyword in keywords]
        results = await asyncio.gather(*tasks)
    
    all_issues = [issue for sublist in results for issue in sublist]

    # Deduplicate by URL
    unique_issues = list({issue['html_url']: issue for issue in all_issues}.values())
    logger.info(f"Total unique issues fetched: {len(unique_issues)}")

    return unique_issues


def embed_texts(texts: List[str], model: SentenceTransformer) -> np.ndarray:
    """
    Embed texts using the sentence transformer model.

    Args:
        texts: List of texts to embed
        model: Sentence transformer model

    Returns:
        Array of embeddings
    """
    logger.info(f"Embedding {len(texts)} texts")
    return model.encode(texts, convert_to_numpy=True)


def build_faiss_index(embeddings: np.ndarray) -> faiss.Index:
    """
    Build a FAISS index from embeddings.

    Args:
        embeddings: Array of embeddings

    Returns:
        FAISS index
    """
    logger.info("Building FAISS index")
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    logger.info(f"FAISS index built with {index.ntotal} vectors of dimension {dim}")
    return index


def search_similar_issues(query_text: str, model: SentenceTransformer, index: faiss.Index,
                          all_issues: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for similar issues using the FAISS index.

    Args:
        query_text: Query text
        model: Sentence transformer model
        index: FAISS index
        all_issues: List of all issues
        top_k: Number of top matches to return

    Returns:
        List of similar issues
    """
    # logger.info(f"Searching for similar issues to: {query_text[:100]}...")
    query_vector = model.encode([query_text], convert_to_numpy=True)
    distances, indices = index.search(query_vector, top_k)

    # Log the distances for debugging
    logger.info(f"Search distances: {distances[0]}")

    # Get the issues corresponding to the indices
    similar_issues = []
    for i, idx in enumerate(indices[0]):
        if idx < 0 or idx >= len(all_issues):
            logger.warning(f"Invalid index: {idx}, skipping")
            continue
        issue = all_issues[idx]
        issue['similarity_score'] = float(1.0 - distances[0][i] / 2.0)  # Convert L2 distance to similarity score
        similar_issues.append(issue)

    # logger.info(f"Found {len(similar_issues)} similar issues")
    return similar_issues


def format_issues_json(issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Format issues for JSON output.

    Args:
        issues: List of issues

    Returns:
        List of formatted issues
    """
    logger.info("Formatting issues for JSON output")
    results = []
    for issue in issues:
        body = issue.get("body", "")
        # Ensure body is a string before applying re.sub
        if body is None:
            body = ""
        cleaned_body = re.sub(r"\s+", " ", body).strip()
        short_description = (cleaned_body[:120] + "...") if len(cleaned_body) > 120 else cleaned_body

        results.append({
            "issue_id": issue.get("id"),
            "issue_url": issue.get("html_url"),
            "repo_url": issue.get("repository_url", "").replace("api.github.com/repos", "github.com"),
            "title": issue.get("title"),
            "created_at": issue.get("created_at"),
            "user_login": issue.get("user", {}).get("login"),
            "labels": [label.get("name") for label in issue.get("labels", [])],
            "similarity_score": issue.get("similarity_score", 0.0),
            "short_description": short_description
        })

    return results


async def get_top_matched_issues(
        query_text: str,
        keywords: List[str],
        languages: List[str] = None,
        top_k: int = 10,
        github_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get top matched issues for a query.

    Args:
        query_text: Query text
        keywords: List of keywords to search for
        languages: List of programming languages (used to refine keywords)
        top_k: Number of top matches to return
        github_token: GitHub API token for authentication

    Returns:
        Dictionary with recommendations, counts, and status message
    """
    global model

    try:
        logger.info(f"Getting top matched issues for query: {query_text[:100]}...")

        # Check if model is loaded
        if model is None:
            logger.info(f"Loading sentence transformer model: {MODEL_NAME}")
            model = SentenceTransformer(MODEL_NAME)

        # Prepare search keywords
        search_keywords = keywords.copy()

        # Add language-specific keywords
        if languages:
            for lang in languages:
                search_keywords.append(f"{lang}")

        # Add general keywords for good first issues
        search_keywords.extend(["good first issue", "beginner friendly", "easy"])

        # Remove duplicates
        search_keywords = list(set(search_keywords))
        logger.info(f"Search keywords: {search_keywords}")

        # Fetch issues asynchronously
        issues = await fetch_github_issues(search_keywords, top_k=TOP_PER_KEYWORD, github_token=github_token)

        # Fallback: If no issues found with specific keywords, try with general programming keywords
        if not issues:
            logger.warning("No issues fetched with specific keywords, trying fallback keywords")
            fallback_keywords = ["python", "javascript", "java", "react", "node", "good first issue"]
            issues = await fetch_github_issues(fallback_keywords, top_k=TOP_PER_KEYWORD, github_token=github_token)

        if not issues:
            logger.warning("No issues fetched even with fallback keywords")
            return {
                "recommendations": [],
                "issues_fetched": 0,
                "issues_indexed": 0,
                "message": "No issues found for the given keywords. Try adjusting your search criteria or check back later."
            }

        # Prepare issue texts for embedding
        issue_texts = [f"{issue['title']} {issue.get('body', '')}" for issue in issues]

        # Embed issues
        embeddings = embed_texts(issue_texts, model)

        # Build FAISS index
        index = build_faiss_index(np.array(embeddings))

        # Search for similar issues
        top_matches = search_similar_issues(query_text, model, index, issues, top_k=top_k)

        # Format issues for output
        formatted_issues = format_issues_json(top_matches)

        return {
            "recommendations": formatted_issues,
            "issues_fetched": len(issues),
            "issues_indexed": index.ntotal,
            "message": "Successfully matched issues"
        }

    except Exception as e:
        logger.error(f"Error in get_top_matched_issues: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "recommendations": [],
            "issues_fetched": 0,
            "issues_indexed": 0,
            "message": f"Error matching issues: {str(e)}"
        }
