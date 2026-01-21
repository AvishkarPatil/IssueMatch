import requests
from fastapi import HTTPException
from app.core.config import settings

GITHUB_API_URL = "https://api.github.com"


def get_github_user(access_token: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }

    response = requests.get(f"{GITHUB_API_URL}/user", headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Failed to fetch GitHub user"
        )

    return response.json()

