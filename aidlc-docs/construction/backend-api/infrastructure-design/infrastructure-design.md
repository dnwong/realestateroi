# Infrastructure Design: backend-api

## PostgreSQL
- **Local dev**: `postgres:16-alpine` container via Docker Compose
- **Production**: `postgres:16-alpine` StatefulSet in Kubernetes
- **Connection**: `pg.Pool` via `DATABASE_URL` env var
- **TLS**: Enforced in production (`?sslmode=require` in connection string)
- **Migrations**: Run at startup via `db/migrations/` SQL scripts

## Redis
- Shared with data-integration (same Redis instance)
- Used by CacheService (data-integration) and optionally for session store upgrade

## Docker
- `backend-api.Dockerfile`: Node.js LTS Alpine base, pinned tag
- Puppeteer dependencies installed (shared image with data-integration)
- Non-root user for container security
- `COPY package*.json` before `npm ci --only=production` for layer caching

## Kubernetes
- `Deployment` with 2 replicas minimum
- `readinessProbe`: GET /health → 200
- `livenessProbe`: GET /health → 200
- `ConfigMap` for non-secret env vars (PORT, NODE_ENV)
- `Secret` for DATABASE_URL, SESSION_SECRET, API keys
- `Service`: ClusterIP (internal), exposed via Ingress

## Health Endpoint
- `GET /health` returns `{ status: 'ok', timestamp }` — no auth required
- Used by Kubernetes probes and Docker Compose healthcheck

## Security
- All secrets injected via Kubernetes Secrets (never in ConfigMaps or Docker images)
- Non-root container user
- Read-only root filesystem where possible
