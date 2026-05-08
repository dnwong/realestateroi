# Integration Test Instructions

## Purpose

Test the interactions between units running together: frontend → backend-api → data-integration → external APIs/Redis/PostgreSQL.

## Setup Integration Test Environment

### 1. Start all services

```bash
# From monorepo root
docker compose -f infrastructure/docker-compose.yml up -d

# Wait for all services to be healthy
docker compose -f infrastructure/docker-compose.yml ps
# All services should show "healthy"
```

### 2. Run database migrations

```bash
npm run migrate
```

### 3. Verify services are reachable

```bash
# Backend health check
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
curl http://localhost:8080
# Expected: HTML response
```

## Integration Test Scenarios

### Scenario 1: User Registration and Login Flow

**Test Steps**:
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Expected: 201 {"success":true,"data":{"user":{"id":"...","email":"test@example.com"}}}

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'
# Expected: 200 with session cookie set

# Verify session
curl http://localhost:3000/api/auth/me -b cookies.txt
# Expected: 200 {"success":true,"data":{"user":{"id":"...","email":"test@example.com"}}}
```

### Scenario 2: Property Search (with real or mocked API key)

```bash
# Search by ZIP code (requires valid PROPERTY_API_KEY in .env)
curl "http://localhost:3000/api/search?query=78701&type=zip" \
  -H "Content-Type: application/json"
# Expected: 200 {"success":true,"data":[...],"total":N,"usingFallback":false}

# Verify ROI scores are present
# Each result should have roiScore, roiBreakdown, rentalRate fields
```

### Scenario 3: ROI Recalculation

```bash
# First get search results (from Scenario 2), then recalculate with custom config
curl -X POST http://localhost:3000/api/roi/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "properties": [/* paste results from search */],
    "roiConfig": {"vacancyRate": 0.15, "enableCostOfLiving": false}
  }'
# Expected: 200 with updated roiScore values
```

### Scenario 4: Saved Searches (requires authenticated session)

```bash
# Save a search (use cookies from login)
curl -X POST http://localhost:3000/api/saved-searches \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Austin 3BR","query":{"query":"78701","type":"zip","filters":{"bedroomsMin":3}}}'
# Expected: 201

# List saved searches
curl http://localhost:3000/api/saved-searches -b cookies.txt
# Expected: 200 with array containing the saved search
```

### Scenario 5: Redis Cache Verification

```bash
# Run the same search twice — second should be faster (cache hit)
time curl "http://localhost:3000/api/search?query=78701&type=zip"
time curl "http://localhost:3000/api/search?query=78701&type=zip"
# Second request should be significantly faster (< 100ms vs > 1000ms)

# Verify cache key in Redis
docker compose -f infrastructure/docker-compose.yml exec redis \
  redis-cli -a devpassword keys "property:search:*"
```

### Scenario 6: Brute-Force Protection

```bash
# Attempt 6 failed logins
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
done
# 6th attempt should return 429 (account locked)
```

## Cleanup

```bash
docker compose -f infrastructure/docker-compose.yml down -v
# -v removes volumes (clears database and Redis data)
```
