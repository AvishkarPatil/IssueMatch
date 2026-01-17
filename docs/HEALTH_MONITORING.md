# Health Monitoring & Observability

This document describes the health check and monitoring endpoints available in the IssueMatch API.

## Overview

The health monitoring system provides three endpoints for different use cases:

1. **Basic Health Check** - Simple liveness probe
2. **Detailed Health Check** - Comprehensive readiness probe with dependency validation
3. **System Metrics** - Resource usage and performance monitoring

## Endpoints

### 1. Basic Health Check

**Endpoint:** `GET /api/v1/health`

**Purpose:** Simple health check for load balancers and orchestrators

**Response:**
```json
{
  "status": "healthy",
  "service": "IssueMatch API",
  "timestamp": "2026-01-17T09:30:00.000000"
}
```

**Status Codes:**
- `200 OK` - Service is running

**Use Cases:**
- Kubernetes liveness probes
- Docker health checks
- Load balancer health checks
- Simple uptime monitoring

---

### 2. Detailed Health Check

**Endpoint:** `GET /api/v1/health/detailed`

**Purpose:** Comprehensive health check with dependency validation

**Response (Healthy):**
```json
{
  "status": "healthy",
  "service": "IssueMatch API",
  "version": "/api/v1",
  "timestamp": "2026-01-17T09:30:00.000000",
  "uptime_seconds": 3600,
  "dependencies": {
    "mongodb": {
      "status": "healthy",
      "message": "Connected and responsive"
    }
  }
}
```

**Response (Degraded):**
```json
{
  "status": "degraded",
  "service": "IssueMatch API",
  "version": "/api/v1",
  "timestamp": "2026-01-17T09:30:00.000000",
  "uptime_seconds": 3600,
  "dependencies": {
    "mongodb": {
      "status": "unhealthy",
      "message": "Connection failed: Connection timeout"
    }
  }
}
```

**Status Codes:**
- `200 OK` - All dependencies healthy
- `503 Service Unavailable` - One or more dependencies unhealthy

**Use Cases:**
- Kubernetes readiness probes
- Monitoring dashboards
- Debugging deployment issues
- Dependency health tracking

---

### 3. System Metrics

**Endpoint:** `GET /api/v1/health/metrics`

**Purpose:** System resource usage and performance metrics

**Response:**
```json
{
  "service": "IssueMatch API",
  "timestamp": "2026-01-17T09:30:00.000000",
  "uptime": {
    "seconds": 3600,
    "human_readable": "1h 0m 0s"
  },
  "system": {
    "memory": {
      "total_mb": 8192.0,
      "available_mb": 4096.0,
      "used_mb": 4096.0,
      "percent": 50.0
    },
    "cpu": {
      "percent": 25.5,
      "count": 4
    }
  },
  "process": {
    "memory": {
      "rss_mb": 256.5,
      "vms_mb": 512.0
    },
    "cpu_percent": 5.2,
    "threads": 8,
    "python_version": "3.11.0 (main, Oct 24 2022, 18:26:48) [GCC 11.3.0]"
  }
}
```

**Status Codes:**
- `200 OK` - Metrics retrieved successfully

**Use Cases:**
- Performance monitoring
- Resource usage tracking
- Capacity planning
- Alert threshold configuration
- Debugging performance issues

---

## Integration Examples

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: issuematch-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: issuematch-backend:latest
        ports:
        - containerPort: 8000
        
        # Liveness probe - restart if unhealthy
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Readiness probe - remove from service if not ready
        readinessProbe:
          httpGet:
            path: /api/v1/health/detailed
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Docker Health Check

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Monitoring with Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'issuematch-backend'
    metrics_path: '/api/v1/health/metrics'
    scrape_interval: 30s
    static_configs:
      - targets: ['backend:8000']
```

### Uptime Monitoring (UptimeRobot, Pingdom, etc.)

- **URL:** `https://your-domain.com/api/v1/health`
- **Method:** GET
- **Expected Status:** 200
- **Check Interval:** 5 minutes
- **Alert on:** Status code != 200

---

## Monitoring Best Practices

### 1. Use Appropriate Endpoints

- **Liveness Probes:** Use `/health` (simple, fast)
- **Readiness Probes:** Use `/health/detailed` (validates dependencies)
- **Metrics Collection:** Use `/health/metrics` (resource monitoring)

### 2. Configure Timeouts Properly

- **Liveness:** Longer timeout (5-10s), fewer retries
- **Readiness:** Shorter timeout (2-3s), more frequent checks
- **Metrics:** Standard timeout (5s)

### 3. Set Alert Thresholds

Based on `/health/metrics` data:

- **Memory Usage:** Alert if > 80%
- **CPU Usage:** Alert if > 70% sustained
- **Process Memory:** Alert if growing continuously
- **Uptime:** Alert on unexpected restarts

### 4. Monitor Trends

Track over time:
- Response times for health endpoints
- Dependency failure rates
- Resource usage patterns
- Uptime and restart frequency

---

## Troubleshooting

### Health Check Returns 503

**Possible Causes:**
1. MongoDB connection failed
2. Database credentials incorrect
3. Network connectivity issues
4. MongoDB server down

**Debug Steps:**
1. Check `/health/detailed` response for specific dependency errors
2. Verify MongoDB connection string in environment variables
3. Test MongoDB connectivity manually
4. Check network policies/firewall rules

### High Memory Usage

**Possible Causes:**
1. Memory leak in application code
2. Too many concurrent requests
3. Large data processing operations
4. Insufficient container memory limits

**Debug Steps:**
1. Monitor `/health/metrics` over time
2. Check for growing `process.memory.rss_mb`
3. Review recent code changes
4. Analyze request patterns
5. Consider increasing memory limits

### Frequent Restarts

**Possible Causes:**
1. Liveness probe too aggressive
2. Application crashes
3. Out of memory errors
4. Dependency failures

**Debug Steps:**
1. Check application logs
2. Review liveness probe configuration
3. Monitor `/health/detailed` for dependency issues
4. Increase `initialDelaySeconds` and `failureThreshold`

---

## Security Considerations

### Public Exposure

The basic `/health` endpoint is safe to expose publicly for monitoring services.

### Sensitive Information

The `/health/detailed` and `/health/metrics` endpoints may expose:
- System architecture details
- Resource usage patterns
- Dependency information

**Recommendations:**
- Restrict access to internal networks only
- Use authentication for detailed endpoints in production
- Implement rate limiting
- Monitor for abuse

### Rate Limiting

Consider adding rate limiting to health endpoints to prevent abuse:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/health/metrics")
@limiter.limit("10/minute")
async def system_metrics():
    # ... implementation
```

---

## Future Enhancements

Potential improvements to the health monitoring system:

1. **Custom Health Checks**
   - Add checks for external APIs (GitHub, Google AI)
   - Validate API quotas and rate limits

2. **Metrics Export**
   - Prometheus metrics format
   - StatsD integration
   - OpenTelemetry support

3. **Historical Data**
   - Store health check history
   - Trend analysis
   - Anomaly detection

4. **Advanced Monitoring**
   - Request rate tracking
   - Error rate monitoring
   - Response time percentiles
   - Database query performance

5. **Alerting Integration**
   - PagerDuty integration
   - Slack notifications
   - Email alerts
   - Webhook support

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md)
- [Setup Instructions](../SETUP.md)
- [API Documentation](https://your-domain.com/api/v1/docs)

---

## Support

For issues or questions about health monitoring:
1. Check the troubleshooting section above
2. Review application logs
3. Open an issue on GitHub
4. Contact the development team
