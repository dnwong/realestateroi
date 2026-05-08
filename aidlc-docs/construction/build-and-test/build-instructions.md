# Build Instructions

## Prerequisites

- **Node.js**: v20.x LTS
- **npm**: v10.x (bundled with Node.js 20)
- **Docker**: v24+ (for containerized builds)
- **Docker Compose**: v2.x
- **System**: 4GB RAM minimum, 10GB disk space

## Environment Setup

### 1. Clone and configure environment

```bash
# Copy root env file and fill in your API keys
cp .env.example .env
# Edit .env with your actual values:
#   PROPERTY_API_KEY, RENTCAST_API_KEY, SESSION_SECRET, etc.
```

### 2. Install all dependencies

```bash
# From monorepo root
npm run install:all
```

Or install each unit individually:

```bash
cd packages/types && npm install && cd ..
cd data-integration && npm install && cd ..
cd backend-api && npm install && cd ..
cd frontend && npm install && cd ..
```

## Local Development Build

### 3. Run database migrations

```bash
# Requires PostgreSQL running (use Docker Compose for local dev)
docker compose -f infrastructure/docker-compose.yml up postgres redis -d

# Wait for postgres to be healthy, then run migrations
npm run migrate
```

### 4. Start development servers

```bash
# Terminal 1: Start backend-api
cd backend-api
cp .env.example .env  # fill in values
node src/server.js

# Terminal 2: Start frontend dev server (proxies /api to localhost:3000)
cd frontend
npm run dev
```

Frontend available at: `http://localhost:5173`
Backend API available at: `http://localhost:3000`

## Docker Build

### 5. Build Docker images

```bash
npm run docker:build
# Or directly:
docker compose -f infrastructure/docker-compose.yml build
```

### 6. Start full stack with Docker Compose

```bash
npm run docker:up
# Or:
docker compose -f infrastructure/docker-compose.yml up
```

Application available at: `http://localhost:8080`

### 7. Verify build success

```bash
# Check all containers are healthy
docker compose -f infrastructure/docker-compose.yml ps

# Expected output: all services showing "healthy" status
# backend-api, frontend, postgres, redis
```

## Build Artifacts

| Artifact | Location | Description |
|---|---|---|
| Frontend static assets | `frontend/dist/` | Built React SPA |
| Backend-api Docker image | `zillow-roi/backend-api:latest` | Node.js API server |
| Frontend Docker image | `zillow-roi/frontend:latest` | Nginx + React SPA |

## Troubleshooting

### `npm install` fails with peer dependency errors
- Ensure Node.js v20.x is installed: `node --version`
- Clear npm cache: `npm cache clean --force`

### Puppeteer fails to launch in Docker
- Ensure `PUPPETEER_EXECUTABLE_PATH` is set to `/usr/bin/chromium-browser` in the container
- The backend-api Dockerfile installs Chromium via `apk`

### PostgreSQL connection refused
- Ensure postgres container is healthy before running migrations
- Check `DATABASE_URL` in `.env` matches Docker Compose service name (`postgres`)

### Redis connection refused
- Ensure redis container is running: `docker compose ps redis`
- Check `REDIS_URL` and `REDIS_PASSWORD` in `.env`
