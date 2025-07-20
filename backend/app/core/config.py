from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "OS Contribution Matchmaker"
    API_V1_STR: str = "/api/v1"

    # GitHub OAuth settings
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str

    # Security
    SECRET_KEY: str

    # Google Sheets
    SHEETS_ID: Optional[str] = None
    
    # Firebase and Google AI Studio
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    GOOGLE_AI_STUDIO_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
print(f"--- DEBUG [config.py]: Loaded GITHUB_CLIENT_ID = '{settings.GITHUB_CLIENT_ID}' ---")
