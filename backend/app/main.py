from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .api.v1.router import api_router as api_router_v1
from .services.mongodb_service import connect_to_mongo, close_mongo_connection
from .middleware.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://issuematch-frontend.onrender.com",
    "https://issuematchpro.onrender.com"
]

import os
if os.environ.get("RENDER", False):
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
)

@app.get("/", tags=["Status"])
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

app.include_router(api_router_v1, prefix=settings.API_V1_STR)

