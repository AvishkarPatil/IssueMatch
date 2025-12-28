import sys
from pathlib import Path

# Ensure project root is on sys.path when running this script directly
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

resp = client.get('/api/v1/auth/login?scopes=read:user,repo:status')
print('status:', resp.status_code)
print('headers:', resp.headers)
print('text:', resp.text[:1000])
