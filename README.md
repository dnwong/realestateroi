# Zillow ROI Analyzer

A Node.js web application that searches for properties for sale, compares rental rates, and ranks them by estimated ROI — helping real estate investors identify the best opportunities in any ZIP code or region.

## Features

- Search properties by ZIP code or city/region
- Aggregates rental rate data from multiple sources (Rentcast + property API)
- Fetches cost-of-living data (Teleport or Numbeo) for area adjustment
- Configurable ROI engine: cap rate, vacancy rate, maintenance, property tax, COL adjustment
- Full dashboard: sortable table, interactive map (Leaflet), ROI charts (Recharts)
- User accounts: save searches, favorite properties
- Zillow scraper fallback when primary API is unavailable
- Containerized with Docker Compose for local dev, Kubernetes manifests for production

## Quick Start (Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) v24+
- API keys (see [API Keys](#api-keys) below)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/zillow-roi-analyzer.git
cd zillow-roi-analyzer
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Required — get from https://www.rentcast.io/
RENTCAST_API_KEY=your_rentcast_api_key

# Required — choose one provider and get an API key
PROPERTY_PROVIDER=rentcast
PROPERTY_API_KEY=your_property_api_key

# Session security — generate a random 32+ char string
SESSION_SECRET=replace-with-random-32-char-string

# Cost of living — teleport is free (no key needed)
COL_PROVIDER=teleport
COL_API_KEY=

# These are set automatically by Docker Compose
POSTGRES_PASSWORD=devpassword
REDIS_PASSWORD=devpassword
```

### 3. Start the application

```bash
# Pull and start using pre-built GHCR images (recommended)
docker compose -f infrastructure/docker-compose.yml up
```

Or build from source locally:

```bash
docker compose -f infrastructure/docker-compose.build.yml up --build
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **backend-api** on port 3000
- **frontend** (Nginx) on port 8080

### 4. Run database migrations

In a separate terminal (after containers are healthy):

```bash
docker compose -f infrastructure/docker-compose.yml exec backend-api node db/migrate.js
```

### 5. Open the app

Navigate to **http://localhost:8080**

Register an account, enter a ZIP code, and start analyzing properties.

---

## API Keys

| Provider | Purpose | Free Tier | Link |
|---|---|---|---|
| Rentcast | Property listings + rental estimates | 50 req/mo | [rentcast.io](https://www.rentcast.io/) |
| RapidAPI Zillow | Property listings (alternative) | Limited | [rapidapi.com](https://rapidapi.com/apimaker/api/zillow-com1) |
| Realtor.com | Property listings (alternative) | Limited | [rapidapi.com](https://rapidapi.com/letscrape-6bRBa3QguO5/api/realtor-com4) |
| Teleport | Cost of living data | Free, no key | [developers.teleport.org](https://developers.teleport.org/api/) |
| Numbeo | Cost of living data (alternative) | Paid | [numbeo.com/api](https://www.numbeo.com/api/) |

> **Note**: Zillow scraping (fallback) may violate Zillow's Terms of Service. The app displays a disclaimer when scraping is active. Use a proper API as your primary source.

---

## Project Structure

```
zillow-roi-analyzer/
├── packages/types/          # Shared JSDoc type definitions
├── data-integration/        # External API clients, repositories, Redis cache
├── backend-api/             # Express.js REST API, ROI engine, auth
├── frontend/                # React SPA (Vite, TanStack Query, Leaflet, Recharts)
├── infrastructure/
│   ├── docker/              # Dockerfiles for backend and frontend
│   ├── docker-compose.yml   # Local development stack
│   ├── k8s/                 # Kubernetes manifests
│   └── nginx/               # Nginx config for frontend serving + API proxy
└── .env.example             # Environment variable template
```

## Portainer Deployment

Portainer is a Docker management UI. This project includes a ready-made stack file for one-click deployment.

### Prerequisites

- Portainer CE or BE running on your server
- Docker installed on the server
- The GitHub Actions workflow has run at least once (pushes images to GHCR)

### Step 1: Trigger image builds

Push to `main` (or run the workflow manually in GitHub Actions > **Build and Push Docker Images** > **Run workflow**). This builds and pushes two images to GitHub Container Registry:

- `ghcr.io/dnwong/realestateroi-backend:latest`
- `ghcr.io/dnwong/realestateroi-frontend:latest`

### Step 2: Make GHCR images public (or configure pull credentials)

Go to **GitHub > Packages > realestateroi-backend** (and frontend) > **Package settings > Change visibility > Public**.

Or, if you keep them private, add a Portainer registry credential for `ghcr.io` using a GitHub Personal Access Token with `read:packages` scope.

### Step 3: Create the stack in Portainer

1. Open Portainer → **Stacks** → **Add stack**
2. Name it `zillow-roi`
3. Select **Web editor** and paste the contents of `infrastructure/portainer-stack.yml`
4. Scroll down to **Environment variables** and add:

| Variable | Value |
|---|---|
| `GHCR_OWNER` | `dnwong` |
| `POSTGRES_PASSWORD` | a strong password |
| `REDIS_PASSWORD` | a strong password |
| `SESSION_SECRET` | random 32+ char string |
| `PROPERTY_PROVIDER` | `rentcast` |
| `PROPERTY_API_KEY` | your Rentcast/property API key |
| `RENTCAST_API_KEY` | your Rentcast API key |
| `COL_PROVIDER` | `teleport` |
| `COL_API_KEY` | *(leave empty for Teleport)* |

5. Click **Deploy the stack**

Portainer will pull the images, run the `migrate` service (creates DB tables), then start all services.

### Step 4: Access the app

Navigate to `http://YOUR_SERVER_IP:8080`

### Updating to a new version

1. Push changes to `main` — GitHub Actions rebuilds the images automatically
2. In Portainer → **Stacks** → `zillow-roi` → **Editor** → **Update the stack**

Or pull new images manually:
```bash
docker pull ghcr.io/dnwong/realestateroi-backend:latest
docker pull ghcr.io/dnwong/realestateroi-frontend:latest
```
Then redeploy the stack in Portainer.

---

## Development (without Docker)

```bash
# Install all dependencies
npm run install:all

# Start PostgreSQL and Redis (still uses Docker for infra)
docker compose -f infrastructure/docker-compose.yml up postgres redis -d

# Run migrations
cd backend-api && cp .env.example .env  # fill in values
node db/migrate.js

# Start backend (terminal 1)
cd backend-api && node src/server.js

# Start frontend dev server (terminal 2) — proxies /api to localhost:3000
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

## Running Tests

```bash
# All unit tests
npm run test:all

# Per unit
cd data-integration && npm test
cd backend-api && npm test
cd frontend && npm test
```

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PROPERTY_PROVIDER` | Yes | `rentcast` \| `realtor` \| `rapidapi-zillow` |
| `PROPERTY_API_KEY` | Yes | API key for the chosen property provider |
| `RENTCAST_API_KEY` | Yes | Rentcast API key for rental estimates |
| `COL_PROVIDER` | Yes | `teleport` (free) \| `numbeo` |
| `COL_API_KEY` | No | Required only for Numbeo |
| `SESSION_SECRET` | Yes | Random 32+ char string for session signing |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `REDIS_PASSWORD` | No | Redis password (if set) |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password (Docker Compose) |
| `NODE_ENV` | No | `development` \| `production` (default: development) |
| `PORT` | No | Backend port (default: 3000) |

## Disclaimer

ROI scores are estimates for informational purposes only and do not constitute financial or investment advice. Property data accuracy depends on the configured data provider. Zillow scraping may violate Zillow's Terms of Service.
