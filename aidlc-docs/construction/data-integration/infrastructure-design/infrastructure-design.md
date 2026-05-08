# Infrastructure Design: data-integration

## Overview
data-integration is a Node.js library package — it has no independent deployment. It runs inside the backend-api process. Infrastructure concerns are therefore shared with backend-api.

## Redis
- **Local dev**: Redis container via Docker Compose (`redis:7-alpine`, pinned tag)
- **Production**: Redis container in Kubernetes (`redis:7-alpine`, pinned tag)
- **Connection**: `ioredis` client using `REDIS_URL` env var
- **TLS**: Enabled in production via `rediss://` protocol
- **Persistence**: RDB snapshots enabled (data survives pod restarts)
- **Auth**: Redis password via `REDIS_PASSWORD` env var

## External APIs
All external API calls go outbound over HTTPS from the backend-api container:
- Third-party property API (RapidAPI / Rentcast / Realtor.com)
- Rentcast rental API
- Cost-of-living API (Numbeo / BestPlaces / Teleport)
- Zillow (scraping fallback)

No inbound infrastructure needed for data-integration.

## Puppeteer in Docker
Puppeteer requires additional system dependencies in the Docker image:
```dockerfile
# Required for Puppeteer in Alpine/Debian containers
RUN apt-get install -y chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    lsb-release \
    xdg-utils
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Security
- API keys injected via Kubernetes Secrets (not ConfigMaps)
- Redis password injected via Kubernetes Secret
- No API keys in Docker images or source code (SECURITY-12)
