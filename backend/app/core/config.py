from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "OS Contribution Matchmaker"
    API_V1_STR: str = "/api/v1"

    # GitHub OAuth settings
    # Provide safe defaults for local development/tests. In production, set these via env or .env file.
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # Security
    SECRET_KEY: str = "dev-secret"

    # Google Sheets
    SHEETS_ID: Optional[str] = None
    
    # Firebase and Google AI Studio
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    GOOGLE_AI_STUDIO_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
# Avoid printing secrets in logs; only confirm that config loaded in debug scenarios.
if settings.GITHUB_CLIENT_ID:
    print(f"--- DEBUG [config.py]: Loaded GITHUB_CLIENT_ID (non-empty) ---")
