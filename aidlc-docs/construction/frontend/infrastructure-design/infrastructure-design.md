# Infrastructure Design: frontend

## Build
- Vite builds static assets to `frontend/dist/`
- `dist/` is served by Nginx in production

## Docker
- Multi-stage Dockerfile: Node.js build stage → Nginx serve stage
- Nginx serves `dist/` and proxies `/api/*` to backend-api service
- `nginx.conf` handles SPA routing (all non-asset paths → `index.html`)

## Kubernetes
- `Deployment` with 2 replicas
- `ConfigMap` for Nginx config
- `Service`: ClusterIP, exposed via Ingress
- No secrets needed (all API calls go through backend-api)

## API Proxy (Development)
- Vite dev server proxies `/api/*` to `http://localhost:3000`
- Configured in `vite.config.js`
