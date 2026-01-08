import httpx
import secrets
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from starlette.requests import Request
from ....core.config import settings
from ....middleware.rate_limit import limiter

router = APIRouter()

# GitHub OAuth URLs and configuration
GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_CALLBACK_URL = f"http://localhost:8000{settings.API_V1_STR}/auth/callback"
GITHUB_SCOPES = "read:user user:email repo"  # Permissions needed for user data and repo access
FRONTEND_LOGIN_SUCCESS_URL = "http://localhost:3000/skills"  # Redirect after successful login
FRONTEND_LOGIN_FAILURE_URL = "http://localhost:3000/login?error=auth_failed"
FRONTEND_LOGOUT_REDIRECT_URL = "http://localhost:3000/login"

@router.get("/login")
@limiter.limit("10/minute")
async def github_login_redirect(request: Request):
    """
    Initiates GitHub OAuth flow by redirecting to GitHub's authorization page.
    """
    state = secrets.token_urlsafe(16)
    request.session['oauth_state'] = state

    github_auth_url = (
        f"{GITHUB_AUTH_URL}"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_CALLBACK_URL}"
        f"&scope={GITHUB_SCOPES}"
        f"&state={state}"
    )
    return RedirectResponse(url=github_auth_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/callback")
@limiter.limit("10/minute")
async def github_callback_handler(request: Request, code: str = None, state: str = None):
    """
    Handles the callback from GitHub after user authorization.
    Exchanges the code for an access token and stores it in the session.
    """
    # Verify state parameter to prevent CSRF attacks
    stored_state = request.session.get('oauth_state')
    if not state or not stored_state or state != stored_state:
        request.session.pop('oauth_state', None)  # Clean up state
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid state parameter. CSRF check failed."
        )

    request.session.pop('oauth_state', None)  # State verified, consume it

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code not provided by GitHub."
        )

    # Exchange code for access token
    payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_CALLBACK_URL,
    }
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(GITHUB_TOKEN_URL, data=payload, headers=headers)
            response.raise_for_status()
            token_data = response.json()
        except (httpx.RequestError, httpx.HTTPStatusError) as exc:
            print(f"GitHub token exchange failed: {exc}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Could not exchange code for token with GitHub: {exc}"
            )

    access_token = token_data.get("access_token")
    error = token_data.get("error")

    if error or not access_token:
        error_desc = token_data.get("error_description", "Unknown error.")
        print(f"GitHub OAuth Error during token exchange: {error} - {error_desc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to obtain access token from GitHub: {error_desc}"
        )

    # Store token securely in the server-side session
    request.session['github_token'] = access_token
    request.session['github_scope'] = token_data.get("scope", "")
    request.session['github_token_type'] = token_data.get("token_type", "bearer")

    # Redirect to the frontend page indicating successful login
    return RedirectResponse(url=FRONTEND_LOGIN_SUCCESS_URL, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

@router.get("/logout")
async def logout_user(request: Request):
    """
    Logs out the user by clearing their session.
    """
    request.session.clear()
    return RedirectResponse(url=FRONTEND_LOGOUT_REDIRECT_URL, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

# Dependency to extract GitHub token from session
async def get_github_token(request: Request) -> str:
    """
    Extracts and validates the GitHub token from the session.
    Used as a FastAPI dependency for protected endpoints.
    """
    token = request.session.get('github_token')
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated with GitHub. Please log in."
        )
    return token