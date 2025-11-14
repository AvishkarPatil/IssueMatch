import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware


from .core.config import settings
from .api.v1.router import api_router as api_router_v1


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" # e.g., /api/v1/openapi.json
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    # --- Session Cookie Parameters ---
    session_cookie="issuematch_session", # Customize the cookie name
    max_age=7 * 24 * 60 * 60, # Example: Cookie expires after 7 days
    same_site="lax", # Use lax for localhost development to avoid CSRF issues
    https_only=False, # No HTTPS in development
)


origins = [
    "http://localhost:3000",      # Default for Create React App
    "http://localhost:5173",      # Default for Vite (React/Vue/Svelte)
    # Add your deployed frontend URL here when you deploy!
    "https://issuematch-frontend.onrender.com",
    "https://issuematchpro.onrender.com"
]

# In production, allow requests from any origin
if os.environ.get("RENDER", False):
    origins = ["*"]  # Allow all origins in production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Specifies which origins are allowed to make requests
    allow_credentials=True,         # Allows cookies (like our session cookie) to be sent/received
    allow_methods=["*"],            # Allows all standard HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all request headers
)

# --- Root Endpoint ---
# A simple endpoint at the base URL ("/") to quickly check if the API is running.
@app.get("/", tags=["Status"])
async def read_root():
    """
    Root endpoint providing basic project info.
    """
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

# --- Include API Routers ---
# This mounts all the API endpoints defined in api_router_v1 (from app/api/v1/router.py)
# under the prefix defined in settings.API_V1_STR (e.g., "/api/v1").
# This makes endpoints like "/api/v1/auth/login" or "/api/v1/match" accessible.
app.include_router(api_router_v1, prefix=settings.API_V1_STR)

# --- Optional: Startup/Shutdown Event Handlers ---
# These functions can run code when the server starts or stops.
# Useful for loading resources (like a FAISS index) or cleaning up.
from .services.faiss_search import load_model

@app.on_event("startup")
async def startup_event():
    """
    Code to run when the application starts up.
    Example: Load ML models, FAISS index, connect to databases.
    """
    print("Backend server starting up...")
    load_model()

# @app.on_event("shutdown")
# async def shutdown_event():
#     """
#     Code to run when the application shuts down gracefully.
#     Example: Save data, close connections.
#     """
#     print("Backend server shutting down...")

