# Business Logic Model: data-integration

## Overview

The data-integration unit is a pure data access library. It has no HTTP server, no routes, and no business domain logic. Its sole responsibility is fetching, caching, normalizing, and aggregating data from external sources.

---

## Core Workflows

### Workflow 1: Property Search (PropertyRepository.findBySearch)

```
Input: SearchQuery

1. Build cache key:
   key = buildCacheKey('property:search', query, filters)

2. Check Redis cache:
   cached = await cacheService.get(key)
   IF cached → return cached (PropertyListing[])

3. Attempt primary provider:
   TRY:
     raw = await activePropertyProvider.search(query, apiKey)
     listings = normalizePropertyListings(raw, 'api')
   CATCH ProviderError:
     IF retryable → retry with backoff (up to maxRetries)
     IF still failing → proceed to fallback

4. Attempt fallback (ZillowScraperProvider):
   TRY:
     raw = await zillowScraper.scrape(query)
     listings = normalizePropertyListings(raw, 'scraper')
     listings.usingFallback = true
   CATCH ProviderError:
     THROW DataUnavailableError(primaryError, fallbackError)

5. Apply filters to listings (bedrooms, bathrooms, sqft, type, price, etc.)

6. Write to cache (fire-and-forget):
   cacheService.set(key, listings, TTL_PROPERTY)

7. Return filtered PropertyListing[]
```

### Workflow 2: Rental Rate Aggregation (RentalRepository.findByArea)

```
Input: zipCode, PropertyFilters

1. Build cache key:
   key = buildCacheKey('rental', zipCode, filters)

2. Check Redis cache:
   cached = await cacheService.get(key)
   IF cached → return cached (RentalRate[])

3. Fetch from all available rental sources in parallel:
   [rentcastResult, propertyApiRentalResult] = await Promise.allSettled([
     rentcastProvider.getRentalEstimates(zipCode, filters, apiKey),
     activePropertyProvider.getRentalEstimates(zipCode, filters, apiKey)  // if supported
   ])

4. Collect successful results, normalize each to RentalRate schema

5. Aggregate by (bedrooms, propertyType) grouping:
   FOR each group:
     IF multiple sources → weighted average (BR-06)
     IF single source → use directly
     rentRangeMin = min across sources
     rentRangeMax = max across sources

6. Write to cache (fire-and-forget):
   cacheService.set(key, aggregated, TTL_RENTAL)

7. Return RentalRate[]
```

### Workflow 3: Cost of Living Fetch (CostOfLivingRepository.findByLocation)

```
Input: location (city/region string)

1. Build cache key:
   key = buildCacheKey('col', location)

2. Check Redis cache (7-day TTL):
   cached = await cacheService.get(key)
   IF cached → return cached (CostOfLiving)

3. Fetch from COL API provider:
   TRY:
     raw = await colApiProvider.getCostOfLiving(location, apiKey)
     col = normalizeCOLData(raw)
   CATCH ProviderError:
     THROW (no fallback for COL — caller handles gracefully)

4. Write to cache (fire-and-forget):
   cacheService.set(key, col, TTL_COL)

5. Return CostOfLiving
```

### Workflow 4: Cache Key Construction (CacheService.buildKey)

```
Input: namespace, identifier, params (optional object)

1. IF params provided:
   sortedParams = Object.keys(params)
     .filter(k => params[k] !== undefined && params[k] !== null)
     .sort()
     .map(k => `${k}=${params[k]}`)
     .join(',')
   RETURN `${namespace}:${identifier}:${sortedParams}`

2. IF no params:
   RETURN `${namespace}:${identifier}`

Example: buildKey('property:search', '78701', { beds: 3, type: 'SFH' })
  → 'property:search:78701:beds=3,type=SFH'
```

---

## Normalization Functions

### normalizePropertyListing(raw, provider, dataSource)
Maps provider-specific raw listing fields to the standard `PropertyListing` schema.
- Applies BR-07 defaults for missing fields.
- Estimates `propertyTax` as `price * 0.011` if not provided.
- Sets `dataSource` to `'api'` or `'scraper'`.

### normalizeRentalEstimate(raw, provider)
Maps provider-specific rental estimate to `RentalRate` schema.
- Applies BR-07 defaults for missing fields.

### normalizeCOLData(raw, provider)
Maps provider-specific COL response to `CostOfLiving` schema.
- Sets individual indices to 100 (neutral) if not provided by source.

---

## Provider Interface (IPropertyProvider)

All property providers must implement:

```js
{
  search(query: SearchQuery, apiKey: string): Promise<RawPropertyApiResponse>
  getRentalEstimates(zipCode: string, filters: PropertyFilters, apiKey: string): Promise<RawRentalApiResponse>
  // getRentalEstimates may throw ProviderError with code 'NOT_FOUND' if provider doesn't support rental data
}
```

This interface enables the configurable provider selection (BR-01).

---

## Error Handling Model

| Scenario | Behavior |
|---|---|
| Primary provider rate-limited | Fallback to scraper immediately |
| Primary provider 5xx | Retry with backoff, then fallback |
| Primary provider auth failure | Throw ProviderError (no retry, no fallback) |
| Both primary and fallback fail | Throw DataUnavailableError |
| Redis connection error | Log warning, treat as cache miss, continue |
| COL API failure | Throw ProviderError (caller proceeds without COL) |
| Rental API all sources fail | Return empty array (caller proceeds without rental data) |
