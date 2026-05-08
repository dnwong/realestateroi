# NFR Design Patterns: data-integration

## Pattern 1: Cache-Aside (Read-Through Cache)
Applied to all three repositories.

```
Request → Check Cache → HIT: return cached data
                      → MISS: fetch from provider → normalize → write cache (async) → return data
```

Redis errors are caught and treated as cache misses (fail-open). Cache writes are fire-and-forget (`setImmediate` or unhandled promise with error logging) to avoid blocking the response.

## Pattern 2: Primary/Fallback Chain (PropertyRepository)
```
Try primary provider
  → Success: normalize + cache + return
  → Failure (retryable): exponential backoff retry (max 2)
  → Failure (non-retryable or retries exhausted): try ZillowScraperProvider
    → Success: normalize + cache + return (with usingFallback flag)
    → Failure: throw DataUnavailableError
```

## Pattern 3: Retry with Exponential Backoff
Applied to all provider HTTP calls on 5xx and network timeouts.

```js
async function withRetry(fn, maxRetries = 2, baseDelayMs = 500) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!err.retryable || attempt === maxRetries) throw err;
      await sleep(baseDelayMs * Math.pow(2, attempt));
    }
  }
}
```

## Pattern 4: Parallel Fetch with Partial Failure Tolerance
Applied to rental data aggregation.

```js
const results = await Promise.allSettled([
  rentcastProvider.getRentalEstimates(...),
  propertyApiProvider.getRentalEstimates(...)
]);
const successful = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);
// Aggregate successful results; log failures
```

## Pattern 5: Semaphore for Puppeteer Concurrency
Limits Puppeteer to 1 concurrent scraping session to prevent resource exhaustion.

```js
class ScraperSemaphore {
  constructor(limit = 1) { this.limit = limit; this.queue = []; this.active = 0; }
  async acquire() { /* wait if active >= limit */ }
  release() { /* signal next in queue */ }
}
```

## Pattern 6: Structured Key Builder
Ensures deterministic, human-readable cache keys.

```js
buildKey(namespace, identifier, params = {}) {
  const sorted = Object.keys(params)
    .filter(k => params[k] != null)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join(',');
  return sorted ? `${namespace}:${identifier}:${sorted}` : `${namespace}:${identifier}`;
}
```
