# Application Design

## Overview

This document consolidates the full application design for the Zillow ROI Analyzer — a Node.js web application that searches for properties for sale, compares rental rates, and ranks properties by estimated ROI.

**Tech Stack**:
- Backend: Node.js + Express.js (resource-based router modules)
- Frontend: React + TanStack Query (server state) + useState (local UI state)
- Database: PostgreSQL (users, sessions, saved searches, favorites)
- Cache: Redis (property listings, rental rates, cost-of-living data)
- Auth: Server-side sessions via express-session + connect-pg-simple
- Deployment: Docker + Kubernetes

---

## Architecture Summary

The system is organized into three deployment units:

1. **backend-api** — Express.js REST API with resource-based routers, repository pattern for data access, pipeline-based ROI engine
2. **frontend** — React SPA with TanStack Query for server state management
3. **infrastructure** — PostgreSQL + Redis (separate containers)

---

## Components

See [components.md](./components.md) for full component definitions.

### Backend Components (20 total)

| Component | Type | Purpose |
|---|---|---|
| AuthComponent | Route handler | User registration, login, logout, session management |
| SearchComponent | Route handler + orchestrator | Search coordination, result assembly |
| ROIComponent | Route handler | ROI recalculation with custom config |
| SavedSearchComponent | Route handler | Saved searches and favorites CRUD |
| PropertyRepository | Repository | Property data access with cache + provider fallback |
| RentalRepository | Repository | Rental rate aggregation with cache |
| CostOfLivingRepository | Repository | COL data access with cache |
| PropertyApiProvider | Provider | Third-party property API client |
| ZillowScraperProvider | Provider | Zillow scraping fallback |
| RentcastProvider | Provider | Rentcast rental API client |
| CostOfLivingApiProvider | Provider | COL API client |
| ROIService | Domain service | Pipeline-based ROI calculation engine |
| CacheService | Infrastructure | Redis abstraction with TTL support |
| SessionService | Infrastructure | express-session + PostgreSQL session store |
| LoggerService | Infrastructure | Structured JSON logging |
| RateLimiterService | Security | Rate limiting middleware |

### Frontend Components

| Component | Purpose |
|---|---|
| SearchPanel | Search input + filter controls |
| ResultsDashboard | Table + map + charts dashboard |
| PropertyDetailPanel | Per-property ROI breakdown |
| ROIConfigPanel | ROI factor configuration |
| AuthModule | Login/register/logout flows |
| SavedSearchesPanel | Saved searches and favorites management |

---

## API Endpoints

| Method | Path | Component | Auth Required |
|---|---|---|---|
| POST | /api/auth/register | AuthComponent | No |
| POST | /api/auth/login | AuthComponent | No |
| POST | /api/auth/logout | AuthComponent | Yes |
| GET | /api/auth/me | AuthComponent | Yes |
| GET | /api/search | SearchComponent | No |
| POST | /api/roi/calculate | ROIComponent | No |
| GET | /api/roi/config | ROIComponent | No |
| GET | /api/saved-searches | SavedSearchComponent | Yes |
| POST | /api/saved-searches | SavedSearchComponent | Yes |
| DELETE | /api/saved-searches/:id | SavedSearchComponent | Yes |
| GET | /api/favorites | SavedSearchComponent | Yes |
| POST | /api/favorites | SavedSearchComponent | Yes |
| DELETE | /api/favorites/:id | SavedSearchComponent | Yes |

---

## ROI Pipeline

The ROI engine uses a pipeline pattern. Each step is independently enabled/disabled via ROIConfig:

```
Input: (PropertyListing, RentalRate, CostOfLiving, ROIConfig)
  |
  v
[CapRateStep]        → annualCapRate = (annualRent - baseExpenses) / propertyPrice
  |
  v
[VacancyStep]        → vacancyAdj = annualRent * vacancyRate  [if enabled]
  |
  v
[PropertyTaxStep]    → taxAdj = propertyTax / propertyPrice   [if enabled]
  |
  v
[MaintenanceStep]    → maintAdj = propertyPrice * maintenanceRate  [if enabled]
  |
  v
[CostOfLivingStep]   → colFactor = 1 + (colIndex - 100) / 100  [if enabled]
  |
  v
Output: roiScore = (capRate - vacancyAdj - taxAdj - maintAdj) * colFactor
        + ROIBreakdown (per-step values)
```

---

## Data Repository Pattern

Each repository follows this pattern:

```
Repository.find(params)
  1. Build cache key from params
  2. CacheService.get(key)
     → HIT: return cached data
     → MISS: fetch from provider(s)
  3. Normalize provider response to common schema
  4. CacheService.set(key, data, ttl)
  5. Return normalized data
```

PropertyRepository additionally implements primary/fallback:
```
  → Try PropertyApiProvider
  → On failure: try ZillowScraperProvider
  → On both fail: throw DataUnavailableError
```

---

## Security Design Highlights

- All routes default to requiring authentication; public routes are explicitly marked
- Session cookies: `httpOnly`, `secure`, `sameSite: strict`
- Rate limiting on login (5/15min), search (30/min), general API (100/min)
- Input validation on all API parameters before processing
- HTTP security headers on all responses (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- API keys stored in environment variables, never in source code or responses
- Structured logging with no PII/secrets in log output
- Global error handler returns generic messages in production

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API structure | Resource-based router modules | Clean domain separation, easy to extend |
| ROI engine | Pipeline pattern | Each factor independently toggleable, easy to add new factors |
| Data integration | Repository pattern | Hides provider complexity, enables cache-first strategy |
| Frontend state | TanStack Query + useState | Server state managed by TQ, local UI state stays simple |
| Auth | Server-side sessions + PostgreSQL | Simpler than JWT for this use case, no token refresh complexity |
| Cache | Redis | TTL support, scales independently, standard for this pattern |

---

## References

- [components.md](./components.md) — Full component definitions and responsibilities
- [component-methods.md](./component-methods.md) — Method signatures and types
- [services.md](./services.md) — Service definitions and orchestration patterns
- [component-dependency.md](./component-dependency.md) — Dependency matrix and data flow diagrams
