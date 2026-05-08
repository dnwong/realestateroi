# Business Rules: data-integration

## BR-01: Provider Selection (Configurable)
- The active property API provider is determined by the `PROPERTY_PROVIDER` environment variable.
- Valid values: `rentcast`, `realtor`, `rapidapi-zillow`.
- If `PROPERTY_PROVIDER` is not set or invalid, the system must throw a startup configuration error.
- Each provider must implement the same `IPropertyProvider` interface.

## BR-02: Primary/Fallback Logic (PropertyRepository)
- The primary provider is always attempted first.
- Fallback to ZillowScraperProvider only if the primary throws a `ProviderError` with `retryable: false` OR after exhausting all retries.
- If both primary and fallback fail, throw `DataUnavailableError`.
- The response must include a `dataSource` flag: `'api'` (primary) or `'scraper'` (fallback).
- A `usingFallback: true` flag must be included in the repository response when scraper was used.

## BR-03: Retry Logic
- On HTTP 5xx responses: retry up to `maxRetries` times with exponential backoff (base 500ms, multiplier 2).
- On HTTP 429 (rate limit): do NOT retry — throw `ProviderError` with `code: 'RATE_LIMIT'`.
- On HTTP 401/403: do NOT retry — throw `ProviderError` with `code: 'AUTH_FAILURE'`.
- On network timeout: retry up to `maxRetries` times.

## BR-04: Cache-First Strategy
- All repositories must check Redis cache before calling any provider.
- Cache key format: `{namespace}:{identifier}:{sortedFilterString}`
  - Example: `property:search:78701:beds=3,baths=2,type=SFH`
  - Filter params must be sorted alphabetically for key consistency.
- On Redis connection error: log warning, treat as cache miss, proceed to provider.
- Cache writes must not block the response — fire-and-forget with error logging.

## BR-05: Cache TTL Rules
- Property listings: 86400 seconds (24 hours)
- Rental rate estimates: 86400 seconds (24 hours)
- Cost of living data: 604800 seconds (7 days)

## BR-06: Rental Data Weighted Aggregation
- When multiple rental sources return estimates for the same area/bedroom count:
  - Compute weighted average: `sum(estimate * reliabilityScore) / sum(reliabilityScore)`
  - Default reliability scores: Rentcast = 0.8, PropertyApi (rental) = 0.6
  - Scores are configurable via environment variables.
- `rentRangeMin` = minimum estimate across all sources.
- `rentRangeMax` = maximum estimate across all sources.
- If only one source returns data, use it directly (no aggregation needed).

## BR-07: Data Normalization — Missing Fields
- All missing optional fields in `PropertyListing` must be set to sensible defaults:
  - `propertyTax`: estimate as 1.1% of price annually if not provided by source
  - `hoaFee`: 0
  - `lotSize`: 0
  - `yearBuilt`: 0 (indicates unknown)
  - `latitude`, `longitude`: null (map display will skip these properties)
- All missing optional fields in `RentalRate`:
  - `bathrooms`: 0
  - `sqft`: 0
  - `propertyType`: 'Unknown'
- All missing optional fields in `CostOfLiving`:
  - Individual indices: 100 (US average, neutral adjustment)

## BR-08: Zillow Scraper Rules
- Scraper must use Puppeteer with a realistic user-agent string.
- Scraper must respect a configurable request delay (default: 2000ms between requests).
- Scraper must not run more than 1 concurrent scraping session.
- Scraper results must include `dataSource: 'scraper'` on all returned listings.
- If Puppeteer fails to launch or page load times out (30s), throw `ProviderError` with `code: 'TIMEOUT'`.

## BR-09: Input Validation
- `SearchQuery.query` must be a non-empty string.
- `SearchQuery.type` must be `'zip'` or `'region'`.
- ZIP codes must match pattern `/^\d{5}(-\d{4})?$/`.
- All numeric filter values must be non-negative.
- `priceMin` must be less than `priceMax` if both are provided.
- `bedroomsMin` must be less than or equal to `bedroomsMax` if both are provided.

## BR-10: API Key Security
- API keys must never be logged, included in error messages, or returned in any response.
- API keys are read from environment variables at startup and stored in `ProviderConfig`.
- If a required API key is missing at startup, throw a configuration error with the variable name (not the key value).
