# Component Dependencies

## Dependency Matrix

| Component | Depends On |
|---|---|
| SearchComponent | PropertyRepository, RentalRepository, CostOfLivingRepository, ROIService, LoggerService |
| ROIComponent | ROIService, LoggerService |
| AuthComponent | SessionService, LoggerService, RateLimiterService |
| SavedSearchComponent | PostgreSQL (direct via ORM/query builder), LoggerService |
| PropertyRepository | PropertyApiProvider, ZillowScraperProvider, CacheService, LoggerService |
| RentalRepository | RentcastProvider, PropertyApiProvider, CacheService, LoggerService |
| CostOfLivingRepository | CostOfLivingApiProvider, CacheService, LoggerService |
| PropertyApiProvider | External API (HTTP), LoggerService |
| ZillowScraperProvider | Zillow (HTTP scraping), LoggerService |
| RentcastProvider | Rentcast API (HTTP), LoggerService |
| CostOfLivingApiProvider | COL API (HTTP), LoggerService |
| ROIService | (none — pure calculation, no I/O) |
| CacheService | Redis |
| SessionService | PostgreSQL (sessions table), express-session |
| LoggerService | (none — leaf service) |
| RateLimiterService | (none — express middleware) |

---

## Communication Patterns

### Request Flow: Property Search

```
Client (React)
  --> GET /api/search?query=78701&type=zip&filters=...
  --> SearchComponent.search()
        |-- parallel -->  PropertyRepository.findBySearch()
        |                   |-- CacheService.get('property:search:...')
        |                   |   [miss] --> PropertyApiProvider.search()
        |                   |   [fail] --> ZillowScraperProvider.scrape()
        |                   |-- CacheService.set(result, 86400s)
        |
        |-- parallel -->  CostOfLivingRepository.findByLocation()
        |                   |-- CacheService.get('col:...')
        |                   |   [miss] --> CostOfLivingApiProvider.getCostOfLiving()
        |                   |-- CacheService.set(result, 604800s)
        |
        |-- for each property -->  RentalRepository.findByArea()
        |                            |-- CacheService.get('rental:...')
        |                            |   [miss] --> RentcastProvider + PropertyApiProvider
        |                            |-- CacheService.set(result, 86400s)
        |
        |-- for each (property, rental, col) --> ROIService.calculate()
        |
  <-- sorted PropertyResult[] ranked by roiScore
```

### Request Flow: ROI Recalculation

```
Client (React)
  --> POST /api/roi/calculate { properties[], roiConfig }
  --> ROIComponent.calculate()
        |-- for each property --> ROIService.calculate(property, rental, col, newConfig)
  <-- updated PropertyResult[] with new scores
```

### Request Flow: Authentication

```
Client (React)
  --> POST /api/auth/login { email, password }
  --> AuthComponent.login()
        |-- RateLimiterService (check rate limit)
        |-- Query PostgreSQL for user by email
        |-- bcrypt.compare(password, hash)
        |-- [success] --> SessionService.createSession(userId)
        |-- [fail] --> increment failure counter, check lockout
  <-- 200 { user } or 401
```

---

## Data Flow Diagram

```
[React Frontend]
      |
      | HTTP/REST (TLS)
      |
[Express.js API Server]
      |
      +--[AuthComponent]-------->[PostgreSQL: users, sessions]
      |
      +--[SearchComponent]
      |       |
      |       +--[PropertyRepository]-->[Redis Cache]
      |       |         |               [miss]
      |       |         +--[PropertyApiProvider]-->[Third-party Property API]
      |       |         +--[ZillowScraperProvider]-->[Zillow (scraping)]
      |       |
      |       +--[RentalRepository]---->[Redis Cache]
      |       |         |               [miss]
      |       |         +--[RentcastProvider]-->[Rentcast API]
      |       |         +--[PropertyApiProvider] (rental data)
      |       |
      |       +--[CostOfLivingRepository]-->[Redis Cache]
      |       |         |                    [miss]
      |       |         +--[CostOfLivingApiProvider]-->[Numbeo/BestPlaces/Teleport API]
      |       |
      |       +--[ROIService] (pure calculation, no I/O)
      |
      +--[ROIComponent]-->[ROIService]
      |
      +--[SavedSearchComponent]-->[PostgreSQL: saved_searches, favorites]
```

---

## External Dependencies

| External System | Used By | Protocol | Auth Method |
|---|---|---|---|
| Third-party Property API | PropertyApiProvider | HTTPS/REST | API Key (header) |
| Zillow (scraping) | ZillowScraperProvider | HTTPS | None (scraping) |
| Rentcast API | RentcastProvider | HTTPS/REST | API Key (header) |
| COL API (Numbeo/etc.) | CostOfLivingApiProvider | HTTPS/REST | API Key (header) |
| PostgreSQL | AuthComponent, SavedSearchComponent, SessionService | TCP (TLS) | Username/Password |
| Redis | CacheService | TCP (TLS in prod) | Password |

---

## Deployment Unit Boundaries

| Unit | Components |
|---|---|
| backend-api | AuthComponent, SearchComponent, ROIComponent, SavedSearchComponent, PropertyRepository, RentalRepository, CostOfLivingRepository, PropertyApiProvider, ZillowScraperProvider, RentcastProvider, CostOfLivingApiProvider, ROIService, CacheService, SessionService, LoggerService, RateLimiterService |
| frontend | SearchPanel, ResultsDashboard, PropertyDetailPanel, ROIConfigPanel, AuthModule, SavedSearchesPanel, all TanStack Query hooks |
| infrastructure | PostgreSQL, Redis (separate containers/services) |
