from pydantic_settings import BaseSettings
from typing import Optional


class RateLimitConfig:
    ENABLED = True
    STORAGE = "memory"
    
    LIMITS = {
        "ai": "20/minute",
        "match": "30/minute",
        "github": "50/minute",
        "auth": "10/minute",
        "default": "100/minute"
    }
    
    REDIS_URL = "redis://localhost:6379"
    
    @classmethod
    def get_limit(cls, endpoint_type: str) -> str:
        return cls.LIMITS.get(endpoint_type, cls.LIMITS["default"])


rate_limit_config = RateLimitConfig()
