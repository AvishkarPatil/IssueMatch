from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from datetime import datetime
import time
import psutil

from ....services.mongodb_service import get_database
from ....core.config import settings

router = APIRouter()
START_TIME = time.time()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Basic health check for load balancers."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with dependency validation."""
    health_status = {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.API_V1_STR,
        "uptime_seconds": int(time.time() - START_TIME),
        "dependencies": {}
    }
    
    try:
        db = await get_database()
        await db.command("ping")
        health_status["dependencies"]["mongodb"] = {"status": "healthy"}
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["dependencies"]["mongodb"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        return JSONResponse(status_code=503, content=health_status)
    
    return health_status


@router.get("/health/metrics")
async def system_metrics():
    """System resource metrics."""
    memory = psutil.virtual_memory()
    process = psutil.Process()
    
    return {
        "service": settings.PROJECT_NAME,
        "uptime_seconds": int(time.time() - START_TIME),
        "memory_percent": memory.percent,
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "process_memory_mb": round(process.memory_info().rss / (1024 * 1024), 2)
    }
