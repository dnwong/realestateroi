# Code Generation Plan: backend-api

## Unit Context
- **Unit**: backend-api
- **Directory**: `backend-api/`
- **Dependencies**: data-integration, shared-types, PostgreSQL, Redis
- **FRs**: FR-01, FR-02, FR-03, FR-04, FR-05, FR-07, FR-08

## Steps

- [x] Step 1: Create `backend-api/package.json`
- [x] Step 2: Create `backend-api/.env.example`
- [x] Step 3: Create `backend-api/src/db/index.js` — PostgreSQL pool
- [x] Step 4: Create `backend-api/src/logger/index.js` — structured JSON logger
- [x] Step 5: Create `backend-api/src/middleware/requestId.js`
- [x] Step 6: Create `backend-api/src/middleware/auth.js` — session guard
- [x] Step 7: Create `backend-api/src/middleware/validate.js` — joi validation
- [x] Step 8: Create `backend-api/src/middleware/rateLimiter.js`
- [x] Step 9: Create `backend-api/src/middleware/errorHandler.js` — global error handler
- [x] Step 10: Create `backend-api/src/middleware/securityHeaders.js` — helmet config
- [x] Step 11: Create `backend-api/src/services/authService.js` — register, login, brute-force
- [x] Step 12: Create `backend-api/src/services/roiService.js` — ROI pipeline
- [x] Step 13: Create `backend-api/src/services/searchService.js` — search orchestration
- [x] Step 14: Create `backend-api/src/routes/auth.js`
- [x] Step 15: Create `backend-api/src/routes/search.js`
- [x] Step 16: Create `backend-api/src/routes/roi.js`
- [x] Step 17: Create `backend-api/src/routes/savedSearches.js`
- [x] Step 18: Create `backend-api/src/app.js` — Express app setup
- [x] Step 19: Create `backend-api/src/server.js` — HTTP server entry point
- [x] Step 20: Create DB migration scripts (`backend-api/db/migrations/`)
- [x] Step 21: Create unit tests — `backend-api/tests/authService.test.js`
- [x] Step 22: Create unit tests — `backend-api/tests/roiService.test.js`
- [x] Step 23: Create integration tests — `backend-api/tests/routes/auth.test.js`
- [x] Step 24: Create integration tests — `backend-api/tests/routes/search.test.js`
