import asyncio
import httpx
import base64
import re
import os
import traceback
from fastapi import HTTPException, status
from typing import Dict, List, Set, Optional, Any
import time

_STATS_CACHE: dict[str, dict] = {}
CACHE_TTL_SECONDS = 60 * 60  # 1 hour


# --- GitHub API Constants ---
GITHUB_API_URL = "https://api.github.com"
MAX_REPOS_FOR_README = 7


async def get_user_profile(token: str) -> Dict[str, Any]:
    """ Fetches the authenticated user's GitHub profile. """
    if not token: raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub token not provided for get_user_profile")
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28"}
        url = f"{GITHUB_API_URL}/user"
        try:
            print(f"DEBUG [GitHub Service]: Fetching user profile from {url}")
            response = await client.get(url, headers=headers, timeout=10.0)
            response.raise_for_status(); profile = response.json()
            print(f"DEBUG [GitHub Service]: Successfully fetched profile for user {profile.get('login')}"); return profile
        except httpx.HTTPStatusError as exc:
            detail = f"GitHub API error fetching user profile: {exc.response.status_code}"; status_code = exc.response.status_code
            if status_code == 401: detail = "GitHub token invalid or expired."
            elif status_code == 403: detail = "GitHub API rate limit likely exceeded or token lacks permissions for user profile."
            print(f"ERROR [GitHub Service]: {detail}"); raise HTTPException(status_code=status_code, detail=detail) from exc
        except httpx.RequestError as exc: print(f"ERROR [GitHub Service]: Could not connect to GitHub API for user profile: {exc}"); raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to GitHub API: {exc}") from exc
        except Exception as exc: print(f"ERROR [GitHub Service]: Unexpected error fetching user profile: {exc}"); print(traceback.format_exc()); raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred fetching user profile.") from exc


async def get_user_repos(token: str, per_page: int = 30) -> List[Dict[str, Any]]:
    """ Fetches the authenticated user's repositories, sorted by recent push date. """
    if not token: raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub token not provided for get_user_repos")
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28"}
        repos_url = f"{GITHUB_API_URL}/user/repos?sort=pushed&per_page={per_page}"
        try:
            # print(f"DEBUG [GitHub Service]: Fetching user repos from {repos_url}")
            repo_response = await client.get(repos_url, headers=headers, timeout=15.0)
            repo_response.raise_for_status(); repos_data = repo_response.json()
            if not isinstance(repos_data, list): print(f"Warning [GitHub Service]: Unexpected repo data format: {type(repos_data)}"); return []
            print(f"DEBUG [GitHub Service]: Fetched {len(repos_data)} repos."); return repos_data
        except httpx.HTTPStatusError as exc:
            detail = f"GitHub API error fetching user repos: {exc.response.status_code}"; status_code = exc.response.status_code
            if status_code == 401: detail = "GitHub token invalid or expired."
            elif status_code == 403: detail = "GitHub API rate limit likely exceeded or token lacks permissions for user repos."
            print(f"ERROR [GitHub Service]: {detail}"); raise HTTPException(status_code=status_code, detail=detail) from exc
        except httpx.RequestError as exc: print(f"ERROR [GitHub Service]: Could not connect to GitHub API for user repos: {exc}"); raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to GitHub API: {exc}") from exc
        except Exception as exc: print(f"ERROR [GitHub Service]: Unexpected error fetching user repos: {exc}"); print(traceback.format_exc()); raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred fetching user repos.") from exc


async def search_issues(token: Optional[str], query: str) -> Dict[str, Any]:
    """ Searches for issues on GitHub using the provided query string. """
    headers = {"Accept": "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28"}
    if token: headers["Authorization"] = f"Bearer {token}"
    else: print("WARN [GitHub Service]: Performing GitHub issue search without authentication. Rate limits are stricter.")
    params = {"q": query, "per_page": 20}; url = f"{GITHUB_API_URL}/search/issues"
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG [GitHub Service]: Searching issues with query: '{query}'")
            response = await client.get(url, headers=headers, params=params, timeout=20.0)
            response.raise_for_status(); search_results = response.json()
            print(f"DEBUG [GitHub Service]: Found {search_results.get('total_count', 0)} total issues matching query."); return search_results
        except httpx.HTTPStatusError as exc:
            detail = f"GitHub API error searching issues: {exc.response.status_code}"; status_code = exc.response.status_code
            if status_code == 401: detail = "GitHub token invalid or expired (if provided)."
            elif status_code == 403: detail = "GitHub API rate limit likely exceeded or token lacks permissions for search."
            elif status_code == 422: detail = "GitHub query validation failed. Check query syntax."
            print(f"ERROR [GitHub Service]: {detail}. Query was: '{query}'"); raise HTTPException(status_code=status_code, detail=detail) from exc
        except httpx.RequestError as exc: print(f"ERROR [GitHub Service]: Could not connect to GitHub API for issue search: {exc}"); raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to GitHub API: {exc}") from exc
        except Exception as exc: print(f"ERROR [GitHub Service]: Unexpected error searching issues: {exc}"); print(traceback.format_exc()); raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred searching issues.") from exc


async def _fetch_readme_content(repo_url: str, headers: dict, client: httpx.AsyncClient) -> Optional[str]:
    """
    Fetches README metadata from repo URL, decodes base64 content.
    Expects headers with Accept: application/vnd.github.v3+json
    """
    readme_url = f"{repo_url}/readme"
    try:
        readme_response = await client.get(readme_url, headers=headers, timeout=10.0)
        if readme_response.status_code == 404:
            print(f"DEBUG [GitHub Service][_fetch_readme_content]: No README found (404) for {repo_url}")
            return None

        readme_response.raise_for_status() # Raise error for other bad statuses
        readme_data = readme_response.json()

        if readme_data.get("encoding") == "base64" and readme_data.get("content"):
            decoded_content = base64.b64decode(readme_data["content"]).decode('utf-8', errors='ignore')
            cleaned_content = re.sub(r'\n{3,}', '\n\n', decoded_content)
            max_readme_len = 2000
            return cleaned_content[:max_readme_len]
        else:
            print(f"WARN [GitHub Service][_fetch_readme_content]: README found but no base64 content for {repo_url}")
            return None
    except httpx.HTTPStatusError as exc:

        print(f"WARN [GitHub Service][_fetch_readme_content]: HTTP status error fetching README metadata for {repo_url}: {exc.response.status_code}")
        return None
    except Exception as exc:
        print(f"WARN [GitHub Service][_fetch_readme_content]: Unexpected error processing README for {repo_url}: {exc}")
        try:
            print(f"WARN [GitHub Service][_fetch_readme_content]: Response text was: {readme_response.text[:500]}...")
        except Exception:
            pass
        return None


async def get_profile_text_data(token: str, max_repos_for_readme: int = MAX_REPOS_FOR_README) -> Dict[str, List[str] | str]:
    """
    Fetches repository data (languages, topics, descriptions) and
    README content, and combines text. Does NOT generate keywords.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub token not found")

    # Fetch user repos first
    repos_data = await get_user_repos(token, per_page=30) # Use the helper

    languages: Set[str] = set()
    topics: Set[str] = set()
    descriptions: List[str] = []
    readme_tasks = []
    print("DEBUG [GitHub Service]: Starting GitHub data processing...")

    # Process repos data (extract info, prepare tasks)
    for i, repo in enumerate(repos_data):
         if not isinstance(repo, dict): continue
         lang = repo.get("language")
         if lang and lang not in ['null', 'none']: languages.add(lang.lower())
         repo_topics = repo.get("topics", [])
         if repo_topics: topics.update([topic.lower() for topic in repo_topics])
         desc = repo.get("description")
         if desc: descriptions.append(desc)
         # Schedule README fetch task preparation (client/headers added below)
         if i < max_repos_for_readme and repo.get("url"):
             readme_tasks.append({"url": repo['url']}) # Store URL for task creation later

    # Fetch READMEs concurrently using a single client session
    readme_contents = []
    if readme_tasks:
        async with httpx.AsyncClient() as client:
            # Define standard headers for fetching README JSON metadata
            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json", # <<< Correct Accept header for metadata
                "X-GitHub-Api-Version": "2022-11-28"
            }
            # Create actual tasks with client and correct headers
            tasks_to_run = [
                _fetch_readme_content(task_info['url'], headers, client)
                for task_info in readme_tasks
            ]

            if tasks_to_run:
                 print(f"DEBUG [GitHub Service]: Fetching {len(tasks_to_run)} READMEs concurrently...")
                 results = await asyncio.gather(*tasks_to_run, return_exceptions=True)
                 for res in results:
                     if isinstance(res, Exception):
                         # Log errors from gather explicitly
                         print(f"WARN [GitHub Service]: Error during asyncio.gather for README fetch task: {res}")
                     elif res is not None:
                         readme_contents.append(res)
                 print(f"DEBUG [GitHub Service]: Fetched {len(readme_contents)} non-empty READMEs.")

    # Combine Text
    text_blob = "\n".join(descriptions + readme_contents)
    max_length = 50000
    text_blob = text_blob[:max_length]
    # print(f"DEBUG [GitHub Service]: Combined text blob length: {len(text_blob)}")

    # --- Keyword generation removed ---

    sorted_languages = sorted(list(languages))
    sorted_topics = sorted(list(topics))

    # If languages or topics are empty, use default values
    if not sorted_languages or not sorted_topics:
        default_profile = {
            "languages": ["Python", "JavaScript", "Java"],
            "topics": ["open source", "bug fixing", "documentation", "machine learning"],
            "text_blob": "This user is interested in contributing to open source projects. Common areas include fixing bugs, improving documentation, and working on beginner-friendly issues. Familiar with basic scripting in Python and JavaScript."
        }

        # Use defaults only for empty values
        if not sorted_languages:
            sorted_languages = default_profile["languages"]
            print(f"DEBUG [GitHub Service]: Using default languages: {sorted_languages}")

        if not sorted_topics:
            sorted_topics = default_profile["topics"]
            print(f"DEBUG [GitHub Service]: Using default topics: {sorted_topics}")

        if not text_blob:
            text_blob = default_profile["text_blob"]
            print(f"DEBUG [GitHub Service]: Using default text blob")

    # Return combined data (languages, topics, text_blob ONLY)
    final_result = {
        "languages": sorted_languages,
        "topics": sorted_topics,
        "text_blob": text_blob,
    }
    return final_result

# Helper Function to get the next page 
def get_next_link(link_header: Optional[str]) -> Optional[str]:
    """
    Parses the GitHub Link header and returns the URL with rel="next",
    or None if no next page exists.
    """
    if not link_header:
        return None

    # Example Link header:
    # <https://api.github.com/...&page=2>; rel="next",
    # <https://api.github.com/...&page=5>; rel="last"
    parts = link_header.split(",")

    for part in parts:
        if 'rel="next"' in part:
            start = part.find("<") + 1
            end = part.find(">")
            return part[start:end]

    return None

# Helper function to fetch stars using pagination(>100)
async def fetch_total_stars(client: httpx.AsyncClient, username: str, headers: dict) -> int:
    url = f"{GITHUB_API_URL}/users/{username}/repos?per_page=100&page=1"
    total_stars = 0

    while url:
        try:
            response = await client.get(url, headers=headers, timeout=15.0)
            response.raise_for_status()
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GitHub API unreachable while fetching stars"
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=exc.response.status_code,
                detail="GitHub API error while fetching stars"
            ) from exc

        repos = response.json()
        if not isinstance(repos, list):
            break

        total_stars += sum(repo.get("stargazers_count", 0) for repo in repos)
        url = get_next_link(response.headers.get("Link"))

    return total_stars

async def get_user_stats(token: str, username: str) -> Dict[str, Any]:
    """
    Fetches real-time stats for the user:
    1. Pull Requests count (Search API)
    2. Issues Closed count (Search API)
    3. Total Stars (Sum of stars from user's repos)
    4. Total Contributions(Using GraphQL)
    """

    # Implementing in-memory cache
    current_time = time.time()

    cached = _STATS_CACHE.get(username)
    if cached:
        if current_time - cached["timestamp"] < CACHE_TTL_SECONDS:
            print(f"DEBUG [GitHub Service]: Returning cached stats for {username}")
            return cached["data"]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="GitHub token required for stats"
        )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    graphql_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        
        # to get pull requests count
        pr_url = f"{GITHUB_API_URL}/search/issues"
        pr_params = {"q": f"author:{username} type:pr"}
        
        # Issues Closed Count
        issues_url = f"{GITHUB_API_URL}/search/issues"
        issues_params = {"q": f"author:{username} type:issue is:closed"}
        
        
        # To get the contributions
        graphql_url = "https://api.github.com/graphql"
        query = """ query($username: String!) {
                    user(login: $username) {
                        contributionsCollection {
                        contributionCalendar {
                            totalContributions
                        }
                        }
                    }
                } """
        payload = {"query": query, "variables": {"username": username} }
        # Execute requests concurrently for performance
        print(f"DEBUG [GitHub Service]: Fetching stats for {username}...")
        responses = await asyncio.gather(
            client.get(pr_url, headers=headers, params=pr_params),
            client.get(issues_url, headers=headers, params=issues_params),
            client.post(graphql_url, json=payload, headers=graphql_headers),
            return_exceptions=True
        )

        # Process PR Response
        pr_res = responses[0]
        total_prs = 0
        if isinstance(pr_res, httpx.Response) and pr_res.status_code == 200:
            total_prs = pr_res.json().get("total_count", 0)
        elif isinstance(pr_res, Exception):
            print(f"WARN [GitHub Service]: PR fetch network error: {str(pr_res)}")
        else:
            print(f"WARN [GitHub Service]: Failed to fetch PRs. Status: {getattr(pr_res, 'status_code', 'Unknown')}")
        
        # Process Issues Response
        issues_res = responses[1]
        closed_issues = 0
        if isinstance(issues_res, httpx.Response) and issues_res.status_code == 200:
            closed_issues = issues_res.json().get("total_count", 0)
        elif isinstance(issues_res, Exception):
            print(f"WARN [GitHub Service]: Issues fetch network error: {str(issues_res)}")
        else:
            print(f"WARN [GitHub Service]: Failed to fetch Issues. Status: {getattr(issues_res, 'status_code', 'Unknown')}")
            
        # Process Repos/Stars Response
        total_stars = 0
        try:
            total_stars = await fetch_total_stars(client, username, headers)
        except HTTPException:
            raise
        except Exception as e:
            print(f"ERROR [GitHub Service]: Failed to fetch total stars: {str(e)}")
            total_stars = 0

        graphql_res = responses[2]
        total_contributions = 0
        
        # Process Contributions
        if isinstance(graphql_res, httpx.Response) and graphql_res.status_code == 200:
            try:
                data = graphql_res.json()
                total_contributions = (
                    data["data"]["user"]
                    ["contributionsCollection"]["contributionCalendar"]
                    ["totalContributions"]
                )
            except (KeyError, TypeError) as e:
                # This catches API schema changes or empty data specifically
                print(f"WARN [GitHub GraphQL]: Error parsing contribution data: {e}. Payload: {data}")
        elif isinstance(graphql_res, Exception):
             print(f"WARN [GitHub GraphQL]: Network error: {str(graphql_res)}")
        else:
            print(f"WARN [GitHub GraphQL]: Query failed. Status: {getattr(graphql_res, 'status_code', 'Unknown')}")

        stats = {
            "contributions": total_contributions,
            "pullRequests": total_prs,
            "issuesClosed": closed_issues,
            "stars": total_stars
        }
        
        print(f"DEBUG [GitHub Service]: Stats fetched: {stats}")
        _STATS_CACHE[username] = {
            "data": stats,
            "timestamp": current_time
        }

        return stats
