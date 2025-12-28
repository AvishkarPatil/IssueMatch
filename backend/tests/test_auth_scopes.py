from fastapi.testclient import TestClient
from ..app.main import app

client = TestClient(app)


def test_invalid_scope_rejected():
    resp = client.get("/api/v1/auth/login?scopes=invalid_scope")
    assert resp.status_code == 400
    assert "Invalid scope" in resp.json().get("detail", "")


def test_valid_scopes_redirect():
    # Requesting allowed scopes should redirect to GitHub authorize URL (307)
    resp = client.get("/api/v1/auth/login?scopes=read:user,repo:status")
    # Should be a redirect response
    assert resp.status_code in (301, 302, 307, 308)
    assert "github.com/login/oauth/authorize" in resp.headers.get("location", "")
