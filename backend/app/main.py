from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import os

from .core.config import settings
from .api.v1.router import api_router as api_router_v1
from .services.mongodb_service import connect_to_mongo, close_mongo_connection


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

# 🔥 IMPORTANT: localhost only
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 THIS IS THE FIX
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site="lax",     # NOT none for localhost
    https_only=False,   # localhost = http
    max_age=60 * 60 * 24
)

@app.get("/", tags=["Status"])
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

app.include_router(api_router_v1, prefix=settings.API_V1_STR)
