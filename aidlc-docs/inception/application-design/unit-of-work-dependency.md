# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Type |
|---|---|---|
| shared-types | (none) | Leaf package |
| data-integration | shared-types | Build-time (types) |
| backend-api | data-integration, shared-types, PostgreSQL, Redis | Build-time (code) + Runtime (infra) |
| frontend | shared-types, backend-api (HTTP) | Build-time (types) + Runtime (HTTP) |
| infrastructure | backend-api, frontend (Docker images) | Deployment-time |

## Build Order

```
1. shared-types        (no dependencies — build first)
2. data-integration    (depends on shared-types)
3. backend-api         (depends on data-integration + shared-types)
4. frontend            (depends on shared-types; communicates with backend-api at runtime only)
5. infrastructure      (depends on built Docker images from backend-api + frontend)
```

## Dependency Diagram

```
[shared-types]
      |
      +------------------+------------------+
      |                  |                  |
      v                  v                  v
[data-integration]  [backend-api]      [frontend]
      |                  |
      +------------------+
               |
               v
        [infrastructure]
               |
               +---> PostgreSQL (runtime)
               +---> Redis (runtime)
```

## Integration Points

| From | To | Protocol | Notes |
|---|---|---|---|
| backend-api | data-integration | Node.js require/import | data-integration is a local package |
| frontend | backend-api | HTTPS REST | All API calls go through `/api/*` |
| backend-api | PostgreSQL | TCP (TLS) | Connection pool via pg library |
| backend-api | Redis | TCP (TLS in prod) | Via CacheService in data-integration |
| data-integration | Redis | TCP | CacheService manages connection |
| data-integration | External APIs | HTTPS | Property API, Rentcast, COL API |
| data-integration | Zillow | HTTPS | Scraping fallback |

## Deployment Dependencies

For local development (Docker Compose):
```
PostgreSQL + Redis must be healthy before backend-api starts
backend-api must be running before frontend can serve authenticated features
```

For Kubernetes:
```
postgres StatefulSet → backend-api Deployment (readiness probe)
redis Deployment → backend-api Deployment (readiness probe)
backend-api Deployment → frontend Deployment (optional — frontend can start independently)
```

## Parallel Development Opportunities

| Units | Can develop in parallel? | Notes |
|---|---|---|
| shared-types + infrastructure | Yes | No code dependencies between them |
| data-integration + frontend | Yes | After shared-types is defined |
| backend-api + frontend | Yes | After shared-types + data-integration interfaces are defined |
| All units | Yes (after shared-types) | Integration testing requires all units running |
