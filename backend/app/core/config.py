from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "OS Contribution Matchmaker"
    API_V1_STR: str = "/api/v1"

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str

    SECRET_KEY: str

    MONGODB_URI: str

    SHEETS_ID: Optional[str] = None
    GOOGLE_AI_STUDIO_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
print(f"--- DEBUG [config.py]: Loaded GITHUB_CLIENT_ID = '{settings.GITHUB_CLIENT_ID}' ---")
