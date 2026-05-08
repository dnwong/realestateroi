# Unit Test Execution

## Run All Unit Tests

```bash
# From monorepo root — runs all unit tests across all units
npm run test:all
```

## Per-Unit Test Execution

### data-integration

```bash
cd data-integration
npm test
# Or with coverage:
npm run test:coverage
```

**Test files**:
- `tests/cacheService.test.js` — Redis cache abstraction (get/set/buildKey/fail-open)
- `tests/propertyRepository.test.js` — Primary/fallback logic, cache hit/miss, DataUnavailableError
- `tests/rentalRepository.test.js` — Multi-source aggregation, partial failure tolerance
- `tests/normalizers.test.js` — Property/rental/COL normalization, BR-07 defaults
- `tests/retry.test.js` — Exponential backoff, retryable vs non-retryable errors

**Expected**: All tests pass. Coverage target: >80% for repositories and normalizers.

### backend-api

```bash
cd backend-api
npm test
# Or with coverage:
npm run test:coverage
```

**Test files**:
- `tests/authService.test.js` — Register (duplicate email), login (wrong password, unknown email)
- `tests/roiService.test.js` — Cap rate formula, COL adjustment, disabled factors, missing rental data
- `tests/routes/auth.test.js` — Register/login/me endpoints, validation errors, 409/401 responses
- `tests/routes/search.test.js` — Valid search, missing params, fallback disclosure, 502 on unavailable

**Expected**: All tests pass. Coverage target: >80% for services and routes.

### frontend

```bash
cd frontend
npm test
# Or in watch mode during development:
npm run test:watch
```

**Test files**:
- `src/components/Auth/AuthForm.test.jsx` — Login/register form validation, success/error flows
- `src/components/SearchPanel/SearchPanel.test.jsx` — ZIP validation, region search, filter toggle
- `src/hooks/useSearchQuery.test.js` — Enabled/disabled query behavior

**Expected**: All tests pass.

## Reviewing Test Results

- Test output is printed to stdout
- Coverage reports generated in `coverage/` directory per unit
- Failed tests show the specific assertion that failed with diff output

## Fixing Failing Tests

1. Read the error message — it shows which assertion failed and the actual vs expected values
2. Check if the test is testing the right behavior (test may need updating if requirements changed)
3. Fix the implementation or test as appropriate
4. Rerun: `npm test` in the affected unit directory
