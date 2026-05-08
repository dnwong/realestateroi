# NFR Requirements: data-integration

## Performance
- Cache hit response time: < 50ms (Redis lookup + deserialization)
- Cache miss response time: < 8000ms (external API call + normalization + cache write)
- Puppeteer scraper response time: < 30000ms (page load timeout)
- Rental aggregation (parallel fetch): < 6000ms total
- All external HTTP calls must have a 10000ms timeout

## Reliability
- Redis failure must not crash the application — fail open (cache miss behavior)
- Primary provider failure must trigger automatic fallback to scraper
- All external calls must implement retry with exponential backoff (max 2 retries, base 500ms)
- `Promise.allSettled` must be used for parallel rental source fetching (one failure must not block others)

## Security
- API keys must be read from environment variables only — never hardcoded
- API keys must never appear in logs, error messages, or stack traces (SECURITY-03, SECURITY-12)
- All external API calls must use HTTPS (SECURITY-01)
- Input validation must be applied to all search parameters before provider calls (SECURITY-05)
- Puppeteer must run in a sandboxed environment (no `--no-sandbox` in production)

## Scalability
- The data-integration library is stateless — no in-process state between requests
- Redis connection pool must be shared across all repository instances (single client instance)
- Puppeteer instances must be limited to 1 concurrent session (semaphore/queue)
- Provider configs must support hot-reload via environment variable changes (restart required)

## Maintainability
- All providers must implement the `IPropertyProvider` interface for easy swapping
- Normalization functions must be pure (no side effects, easily unit-testable)
- All dependencies must use exact pinned versions in package.json (SECURITY-10)
- A lock file (package-lock.json) must be committed

## Observability
- All provider calls must be logged with: provider name, duration, status code, cache hit/miss
- Cache key must be included in log entries for debuggability
- Errors must be logged with provider name and error code (never API key values)
- Log format: structured JSON per LoggerService contract (SECURITY-03)
