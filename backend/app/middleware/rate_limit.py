from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request
from typing import Optional


def get_user_identifier(request: Request) -> str:
    try:
        github_id = request.session.get('github_token')
        if github_id:
            user_data = request.session.get('user_data', {})
            user_id = user_data.get('id') if user_data else None
            if user_id:
                return f"user:{user_id}"
    except:
        pass
    
    return get_remote_address(request)


limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["100/minute"],
    storage_uri="memory://"
)
