"""
Health Check and Monitoring Endpoints

Provides comprehensive health monitoring for production deployments:
- Basic health check for load balancers/orchestrators
- Detailed health with dependency status
- System metrics for monitoring
"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
import time
from datetime import datetime
import psutil
import sys

from ....services.mongodb_service import get_database
from ....core.config import settings

router = APIRouter()

# Track application start time for uptime calculation
START_TIME = time.time()


@router.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, str]:
    """
    Basic health check endpoint for load balancers and orchestrators.
    
    Returns:
        Simple status indicating the service is running
        
    Use this for:
    - Kubernetes liveness probes
    - Docker health checks
    - Load balancer health checks
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/detailed", tags=["Health"])
async def detailed_health_check() -> JSONResponse:
    """
    Detailed health check with dependency validation.
    
    Checks:
    - MongoDB connection status
    - API version
    - Uptime
    - System status
    
    Returns:
        Comprehensive health status with dependency checks
        
    Use this for:
    - Kubernetes readiness probes
    - Monitoring dashboards
    - Debugging deployment issues
    """
    health_status = {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.API_V1_STR,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": int(time.time() - START_TIME),
        "dependencies": {}
    }
    
    overall_healthy = True
    
    # Check MongoDB connection
    try:
        db = await get_database()
        # Ping MongoDB to verify connection
        await db.command("ping")
        health_status["dependencies"]["mongodb"] = {
            "status": "healthy",
            "message": "Connected and responsive"
        }
    except Exception as e:
        overall_healthy = False
        health_status["dependencies"]["mongodb"] = {
            "status": "unhealthy",
            "message": f"Connection failed: {str(e)}"
        }
    
    # Update overall status
    if not overall_healthy:
        health_status["status"] = "degraded"
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=health_status
    )


@router.get("/health/metrics", tags=["Health"])
async def system_metrics() -> Dict[str, Any]:
    """
    System metrics endpoint for monitoring and observability.
    
    Provides:
    - Memory usage statistics
    - CPU usage
    - Process information
    - Uptime
    
    Returns:
        System resource metrics
        
    Use this for:
    - Performance monitoring
    - Resource usage tracking
    - Capacity planning
    - Alert thresholds
    """
    # Get memory info
    memory = psutil.virtual_memory()
    process = psutil.Process()
    process_memory = process.memory_info()
    
    metrics = {
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": {
            "seconds": int(time.time() - START_TIME),
            "human_readable": _format_uptime(int(time.time() - START_TIME))
        },
        "system": {
            "memory": {
                "total_mb": round(memory.total / (1024 * 1024), 2),
                "available_mb": round(memory.available / (1024 * 1024), 2),
                "used_mb": round(memory.used / (1024 * 1024), 2),
                "percent": memory.percent
            },
            "cpu": {
                "percent": psutil.cpu_percent(interval=0.1),
                "count": psutil.cpu_count()
            }
        },
        "process": {
            "memory": {
                "rss_mb": round(process_memory.rss / (1024 * 1024), 2),
                "vms_mb": round(process_memory.vms / (1024 * 1024), 2)
            },
            "cpu_percent": process.cpu_percent(interval=0.1),
            "threads": process.num_threads(),
            "python_version": sys.version
        }
    }
    
    return metrics


def _format_uptime(seconds: int) -> str:
    """
    Format uptime seconds into human-readable string.
    
    Args:
        seconds: Uptime in seconds
        
    Returns:
        Formatted string like "2d 5h 30m 15s"
    """
    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if seconds > 0 or not parts:
        parts.append(f"{seconds}s")
    
    return " ".join(parts)
