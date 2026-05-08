# Logical Components: data-integration

## Redis (Cache Store)
- Single shared `ioredis` client instance, exported as a singleton
- TLS enabled in production (`rediss://` protocol)
- Connection string from `REDIS_URL` environment variable
- Reconnect strategy: automatic with exponential backoff

## Puppeteer Browser Instance
- Single shared browser instance (lazy-initialized on first scrape request)
- Controlled by `ScraperSemaphore` (max 1 concurrent page)
- Browser closed and re-launched on crash detection
- Runs with `--disable-dev-shm-usage` flag for container compatibility

## Provider Registry
- A map of provider name → provider instance, built at startup from `PROPERTY_PROVIDER` env var
- Validates that the configured provider exists; throws startup error if not
- Exposes `getActivePropertyProvider()` function consumed by PropertyRepository

## Environment Configuration
Required environment variables:
```
REDIS_URL                    # Redis connection string (rediss:// in prod)
PROPERTY_PROVIDER            # 'rentcast' | 'realtor' | 'rapidapi-zillow'
PROPERTY_API_KEY             # API key for the active property provider
RENTCAST_API_KEY             # Rentcast API key (for rental data)
COL_API_KEY                  # Cost-of-living API key
COL_PROVIDER                 # 'numbeo' | 'bestplaces' | 'teleport'
RENTCAST_RELIABILITY_SCORE   # Optional, default 0.8
PROPERTY_API_RELIABILITY_SCORE # Optional, default 0.6
SCRAPER_REQUEST_DELAY_MS     # Optional, default 2000
```
