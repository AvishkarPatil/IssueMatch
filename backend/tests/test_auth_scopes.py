from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_invalid_scope_rejected():
    resp = client.get("/api/v1/auth/login?scopes=invalid_scope")
    assert resp.status_code == 400
    assert "Invalid scope" in resp.json().get("detail", "")


def test_valid_scopes_redirect():
    # Requesting allowed scopes should redirect to GitHub authorize URL (307)
    # Do not follow external redirects in tests; inspect initial redirect
    resp = client.get("/api/v1/auth/login?scopes=read:user,repo:status", allow_redirects=False)
    # Should be a redirect response from our service to GitHub
    assert resp.status_code in (301, 302, 307, 308)
    location = resp.headers.get("location", "")
    assert "github.com/login/oauth/authorize" in location
