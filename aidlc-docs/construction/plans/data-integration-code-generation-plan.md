# Code Generation Plan: data-integration

## Unit Context
- **Unit**: data-integration
- **Directory**: `data-integration/`
- **Type**: Node.js library (imported by backend-api)
- **Dependencies**: shared-types, Redis (ioredis), axios, puppeteer, puppeteer-extra, cheerio, joi
- **FRs**: FR-01 (property search), FR-02 (rental rates), FR-03 (cost of living), FR-09 (caching), FR-10 (API config)

## Steps

- [x] Step 1: Create `data-integration/package.json` with pinned dependencies
- [x] Step 2: Create `data-integration/.env.example`
- [x] Step 3: Create `data-integration/src/config/index.js` — env var loading + validation
- [x] Step 4: Create `data-integration/src/cache/cacheService.js` — Redis abstraction
- [x] Step 5: Create `data-integration/src/providers/interfaces/IPropertyProvider.js` — provider interface doc
- [x] Step 6: Create `data-integration/src/providers/rentcastProvider.js` — Rentcast API client
- [x] Step 7: Create `data-integration/src/providers/realtorProvider.js` — Realtor.com API client
- [x] Step 8: Create `data-integration/src/providers/rapidApiZillowProvider.js` — RapidAPI Zillow client
- [x] Step 9: Create `data-integration/src/providers/zillowScraperProvider.js` — Puppeteer scraper
- [x] Step 10: Create `data-integration/src/providers/costOfLivingApiProvider.js` — COL API client
- [x] Step 11: Create `data-integration/src/providers/providerRegistry.js` — configurable provider selection
- [x] Step 12: Create `data-integration/src/normalizers/propertyNormalizer.js` — normalize to PropertyListing
- [x] Step 13: Create `data-integration/src/normalizers/rentalNormalizer.js` — normalize to RentalRate
- [x] Step 14: Create `data-integration/src/normalizers/colNormalizer.js` — normalize to CostOfLiving
- [x] Step 15: Create `data-integration/src/repositories/propertyRepository.js` — cache-first + fallback
- [x] Step 16: Create `data-integration/src/repositories/rentalRepository.js` — cache-first + aggregation
- [x] Step 17: Create `data-integration/src/repositories/costOfLivingRepository.js` — cache-first
- [x] Step 18: Create `data-integration/src/utils/retry.js` — exponential backoff retry utility
- [x] Step 19: Create `data-integration/src/utils/scraperSemaphore.js` — concurrency limiter
- [x] Step 20: Create `data-integration/src/index.js` — public exports
- [x] Step 21: Create unit tests — `data-integration/tests/cacheService.test.js`
- [x] Step 22: Create unit tests — `data-integration/tests/propertyRepository.test.js`
- [x] Step 23: Create unit tests — `data-integration/tests/rentalRepository.test.js`
- [x] Step 24: Create unit tests — `data-integration/tests/normalizers.test.js`
- [x] Step 25: Create unit tests — `data-integration/tests/retry.test.js`
