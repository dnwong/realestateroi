# Services

## Service Architecture Overview

The backend uses a layered service architecture:

```
HTTP Request
    |
    v
[Express Router] (resource-based modules)
    |
    v
[Route Handler / Component] (SearchComponent, ROIComponent, etc.)
    |
    v
[Repository Layer] (PropertyRepository, RentalRepository, CostOfLivingRepository)
    |         |
    v         v
[Providers]  [CacheService + Redis]
    |
    v
[External APIs / Zillow Scraper]
    |
[ROIService] <-- called by SearchComponent and ROIComponent
    |
    v
[ROI Pipeline Steps]
```

---

## Service Definitions

### SearchOrchestrationService
**Type**: Orchestration service (implemented within SearchComponent)

**Purpose**: Coordinates the full search flow — data retrieval, ROI scoring, and result assembly.

**Responsibilities**:
1. Receive validated search parameters
2. Invoke PropertyRepository.findBySearch() in parallel with CostOfLivingRepository.findByLocation()
3. For each property, invoke RentalRepository.findByArea() to find matching rental rates
4. Pass each (property, rental, COL) triple to ROIService.calculate()
5. Sort results by ROI score descending
6. Return assembled PropertyResult[] to the route handler

**Orchestration Pattern**: Parallel fetch for property + COL data, sequential per-property rental matching and ROI calculation.

**Error Handling**:
- If PropertyRepository fails entirely: return 502 with user-facing error
- If RentalRepository fails for a property: include property with null rental data and flag in response
- If CostOfLivingRepository fails: proceed without COL adjustment, flag in response

---

### ROIService
**Type**: Domain service

**Purpose**: Stateless ROI calculation engine using a configurable pipeline pattern.

**Pipeline Steps** (executed in order, each step can be enabled/disabled via ROIConfig):

| Step | Input | Output | Default |
|---|---|---|---|
| CapRateStep | property.price, rental.estimatedMonthlyRent | annualCapRate | Always enabled |
| VacancyStep | capRate, config.vacancyRate | vacancyAdjustedRate | Enabled |
| PropertyTaxStep | property.propertyTax or estimated rate | taxAdjustment | Enabled |
| MaintenanceStep | property.price, config.maintenanceRate | maintenanceAdjustment | Enabled |
| CostOfLivingStep | col.overallIndex | colAdjustmentFactor | Enabled |

**Final Score Calculation**:
```
roiScore = (capRate - vacancyAdj - taxAdj - maintenanceAdj) * colFactor
```
Each enabled step's weight can be further scaled by factorWeights from ROIConfig.

**Stateless**: No side effects, no I/O. Pure calculation function.

---

### CacheService
**Type**: Infrastructure service

**Purpose**: Provides a unified interface to Redis for all repository components.

**Cache Key Strategy**:
- Property search: `property:search:{hash(query+filters)}`
- Rental data: `rental:{zipCode}:{hash(filters)}`
- Cost of living: `col:{location}`
- Session data: managed by express-session (separate key namespace)

**TTL Defaults**:
- Property listings: 24 hours (86400s)
- Rental rates: 24 hours (86400s)
- Cost of living: 7 days (604800s)

**Failure Mode**: On Redis connection error, CacheService returns null (cache miss). Repositories proceed to fetch from providers. This ensures Redis failure does not break the application.

---

### SessionService
**Type**: Infrastructure service (via express-session + connect-pg-simple)

**Purpose**: Manages server-side user sessions stored in PostgreSQL.

**Responsibilities**:
- Create session on successful login
- Attach user ID and role to session data
- Validate session on each protected request via auth middleware
- Destroy session on logout
- Enforce session expiry (configurable, default 24 hours)

**Session Store**: PostgreSQL via connect-pg-simple. Sessions table auto-created by the library.

**Cookie Config**:
- `httpOnly: true`
- `secure: true` (production)
- `sameSite: 'strict'`
- `maxAge`: 24 hours

---

### LoggerService
**Type**: Cross-cutting infrastructure service

**Purpose**: Structured JSON logging for all backend components.

**Log Format**:
```json
{
  "timestamp": "2026-05-07T00:00:00.000Z",
  "level": "info",
  "requestId": "uuid-v4",
  "message": "Property search completed",
  "durationMs": 1234,
  "resultCount": 42
}
```

**Request ID Injection**: Express middleware generates a UUID per request and attaches it to `req.requestId`. LoggerService reads from async context or explicit parameter.

**Sensitive Data Rules**: Logger must never log: passwords, session tokens, API keys, email addresses, or any PII.

---

### RateLimiterService
**Type**: Security service (via express-rate-limit)

**Purpose**: Protects public-facing endpoints from abuse.

**Configurations**:
- Login endpoint: 5 requests per 15 minutes per IP → 429 + lockout message
- Search endpoint: 30 requests per minute per IP
- General API: 100 requests per minute per IP

---

## Frontend Services (TanStack Query)

### useSearchQuery
**Type**: TanStack Query query hook

**Purpose**: Fetches and caches search results from `/api/search`.

**Behavior**:
- Keyed by `['search', searchParams]`
- Stale time: 5 minutes
- Retry: 2 times on network error
- Returns: `{ data: PropertyResult[], isLoading, isError, error }`

---

### useROIRecalculate
**Type**: TanStack Query mutation hook

**Purpose**: Sends updated ROI config to `/api/roi/calculate` and returns recalculated results.

**Behavior**:
- On success: updates search results cache with new scores
- Returns: `{ mutate, isLoading, isError }`

---

### useAuthQuery
**Type**: TanStack Query query hook

**Purpose**: Fetches current session from `/api/auth/me`.

**Behavior**:
- Keyed by `['auth', 'session']`
- Stale time: 10 minutes
- Used by AuthModule and route guards

---

### useSavedSearches / useFavorites
**Type**: TanStack Query query + mutation hooks

**Purpose**: CRUD operations for saved searches and favorites.

**Behavior**:
- On mutation success: invalidate and refetch list queries
- Optimistic updates for delete operations
