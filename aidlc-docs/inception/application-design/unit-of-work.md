# Units of Work

## Repository Structure

Monorepo with 4 top-level units + 1 shared types package:

```
zillow-roi-analyzer/
├── packages/
│   └── types/              # Unit 0: Shared TypeScript types (imported by all units)
├── backend-api/            # Unit 1: Express.js REST API
├── data-integration/       # Unit 2: Data providers and repositories
├── frontend/               # Unit 3: React SPA
├── infrastructure/         # Unit 4: Docker, Kubernetes, DB migrations
├── package.json            # Root package.json (scripts only, no workspaces)
└── aidlc-docs/             # Documentation only
```

---

## Unit 0: shared-types

**Type**: Shared package (not independently deployable)
**Directory**: `packages/types/`

**Purpose**: Single source of truth for all TypeScript types shared between backend-api, data-integration, and frontend.

**Contents**:
- `PropertyListing` — normalized property data schema
- `RentalRate` — normalized rental rate schema
- `CostOfLiving` — normalized cost-of-living schema
- `PropertyResult` — assembled search result (property + rental + COL + ROI)
- `ROIConfig` — ROI calculation configuration
- `ROIBreakdown` — per-step ROI breakdown
- `SearchQuery` — search parameters
- `PropertyFilters` — filter parameters
- `SavedSearch` — saved search schema
- `User` — user schema (public fields only, no password hash)
- API request/response types

**Dependencies**: None (leaf package)

**Consumed by**: backend-api, data-integration, frontend

---

## Unit 1: backend-api

**Type**: Deployable service
**Directory**: `backend-api/`
**Runtime**: Node.js + Express.js

**Purpose**: REST API server handling authentication, search orchestration, ROI calculation, and saved searches/favorites.

**Components**:
- AuthComponent (routes + session management)
- SearchComponent (search orchestration)
- ROIComponent (ROI recalculation endpoint)
- SavedSearchComponent (saved searches + favorites)
- ROIService (pipeline calculation engine)
- SessionService (express-session + connect-pg-simple)
- LoggerService (structured JSON logging)
- RateLimiterService (express-rate-limit)
- Global error handler middleware
- Input validation middleware
- HTTP security headers middleware (helmet)
- Auth middleware (session guard)

**External Dependencies**:
- PostgreSQL (users, sessions, saved_searches, favorites tables)
- Redis (via CacheService — delegates to data-integration)
- data-integration package (repositories)
- shared-types package

**API Surface**: 13 REST endpoints (see application-design.md)

**Key Files**:
```
backend-api/
├── src/
│   ├── app.js              # Express app setup, middleware registration
│   ├── server.js           # HTTP server entry point
│   ├── routes/
│   │   ├── auth.js
│   │   ├── search.js
│   │   ├── roi.js
│   │   └── savedSearches.js
│   ├── services/
│   │   ├── roiService.js
│   │   ├── roiPipeline/
│   │   │   ├── capRateStep.js
│   │   │   ├── vacancyStep.js
│   │   │   ├── propertyTaxStep.js
│   │   │   ├── maintenanceStep.js
│   │   │   └── costOfLivingStep.js
│   │   └── sessionService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── securityHeaders.js
│   │   ├── requestId.js
│   │   └── errorHandler.js
│   ├── db/
│   │   └── index.js        # PostgreSQL connection pool
│   └── logger/
│       └── index.js
├── package.json
└── .env.example
```

---

## Unit 2: data-integration

**Type**: Internal package (imported by backend-api, not independently deployed)
**Directory**: `data-integration/`
**Runtime**: Node.js (library)

**Purpose**: All external data source integrations — property API, Zillow scraper fallback, rental API, cost-of-living API — plus the repository layer with Redis caching.

**Components**:
- PropertyRepository (cache-first, primary/fallback provider logic)
- RentalRepository (cache-first, multi-source aggregation)
- CostOfLivingRepository (cache-first, 7-day TTL)
- PropertyApiProvider (third-party property API client)
- ZillowScraperProvider (Zillow scraping fallback)
- RentcastProvider (Rentcast rental API client)
- CostOfLivingApiProvider (Numbeo/BestPlaces/Teleport client)
- CacheService (Redis abstraction)

**External Dependencies**:
- Redis (via CacheService)
- Third-party Property API (HTTP)
- Zillow (HTTP scraping)
- Rentcast API (HTTP)
- COL API (HTTP)
- shared-types package

**Key Files**:
```
data-integration/
├── src/
│   ├── repositories/
│   │   ├── propertyRepository.js
│   │   ├── rentalRepository.js
│   │   └── costOfLivingRepository.js
│   ├── providers/
│   │   ├── propertyApiProvider.js
│   │   ├── zillowScraperProvider.js
│   │   ├── rentcastProvider.js
│   │   └── costOfLivingApiProvider.js
│   ├── cache/
│   │   └── cacheService.js
│   └── index.js            # Public exports
├── package.json
└── .env.example
```

---

## Unit 3: frontend

**Type**: Deployable SPA
**Directory**: `frontend/`
**Runtime**: Browser (React + Vite)

**Purpose**: React single-page application providing the full user interface — search, dashboard (table + map + charts), ROI configuration, authentication, and saved searches.

**Components**:
- SearchPanel
- ResultsDashboard (PropertyTable + PropertyMap + ROICharts)
- PropertyDetailPanel
- ROIConfigPanel
- AuthModule (login/register/logout)
- SavedSearchesPanel
- TanStack Query hooks (useSearchQuery, useROIRecalculate, useAuthQuery, useSavedSearches, useFavorites)

**External Dependencies**:
- backend-api (HTTP/REST)
- shared-types package
- Mapping library (Leaflet or Mapbox GL JS)
- Charting library (Recharts or Chart.js)

**Key Files**:
```
frontend/
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Router + layout
│   ├── components/
│   │   ├── SearchPanel/
│   │   ├── ResultsDashboard/
│   │   │   ├── PropertyTable.jsx
│   │   │   ├── PropertyMap.jsx
│   │   │   └── ROICharts.jsx
│   │   ├── PropertyDetailPanel/
│   │   ├── ROIConfigPanel/
│   │   ├── Auth/
│   │   └── SavedSearchesPanel/
│   ├── hooks/
│   │   ├── useSearchQuery.js
│   │   ├── useROIRecalculate.js
│   │   ├── useAuthQuery.js
│   │   └── useSavedSearches.js
│   ├── api/
│   │   └── client.js       # Axios/fetch base client
│   └── store/
│       └── roiConfig.js    # Local ROI config state
├── package.json
├── vite.config.js
└── index.html
```

---

## Unit 4: infrastructure

**Type**: Configuration/IaC (not a deployable application)
**Directory**: `infrastructure/`

**Purpose**: All deployment configuration — Docker, Kubernetes manifests, database migrations, and environment configuration templates.

**Contents**:
- Dockerfiles for backend-api, data-integration (bundled with backend-api), frontend
- Docker Compose for local development (backend-api + frontend + PostgreSQL + Redis)
- Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets templates)
- Database migration scripts (users, sessions, saved_searches, favorites tables)
- Nginx config for frontend serving + API proxy

**Key Files**:
```
infrastructure/
├── docker/
│   ├── backend-api.Dockerfile
│   └── frontend.Dockerfile
├── docker-compose.yml      # Local dev
├── k8s/
│   ├── backend-api-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-statefulset.yaml
│   ├── redis-deployment.yaml
│   └── ingress.yaml
├── db/
│   └── migrations/
│       ├── 001_create_users.sql
│       ├── 002_create_sessions.sql
│       ├── 003_create_saved_searches.sql
│       └── 004_create_favorites.sql
└── nginx/
    └── nginx.conf
```

---

## Code Organization Strategy

```
zillow-roi-analyzer/          # Monorepo root
├── packages/types/           # Shared types (no build tool needed, plain JS/TS)
├── backend-api/              # Node.js + Express (CommonJS or ESM)
├── data-integration/         # Node.js library (CommonJS or ESM)
├── frontend/                 # React + Vite (ESM)
├── infrastructure/           # Config files only
└── package.json              # Root scripts: dev, build, test (delegates to each unit)
```

**Build approach**: Each unit has its own `package.json` and build scripts. Root `package.json` provides convenience scripts that run all units. No npm workspaces (per Q2 answer A — simple monorepo, not workspace-linked).

**Shared types**: `packages/types/` is referenced via relative path in each unit's `package.json` dependencies (e.g., `"@zillow-roi/types": "file:../packages/types"`).
