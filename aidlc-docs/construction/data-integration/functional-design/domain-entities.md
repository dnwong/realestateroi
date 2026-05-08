# Domain Entities: data-integration

## Core Entities

### ProviderConfig
Represents the runtime configuration for a data provider.

```
ProviderConfig {
  name: string                    // Provider identifier (e.g., 'rentcast', 'realtor', 'zillow-scraper')
  apiKey: string | null           // API key (null for scraper)
  baseUrl: string                 // Base URL for the provider API
  timeoutMs: number               // Request timeout (default: 10000)
  maxRetries: number              // Max retry attempts on 5xx (default: 2)
  reliabilityScore: number        // 0.0-1.0, used for weighted rental aggregation
}
```

### RawPropertyApiResponse
Raw response from a property data provider before normalization.

```
RawPropertyApiResponse {
  provider: string                // Provider name
  listings: RawListing[]          // Raw listing objects (provider-specific shape)
  totalCount: number
  fetchedAt: Date
}
```

### RawListing
Provider-specific property listing before normalization. Shape varies by provider.

### RawRentalApiResponse
Raw response from a rental data provider before normalization.

```
RawRentalApiResponse {
  provider: string
  estimates: RawRentalEstimate[]
  fetchedAt: Date
}
```

### RawCOLApiResponse
Raw response from a cost-of-living API before normalization.

```
RawCOLApiResponse {
  provider: string
  location: string
  indices: object                 // Provider-specific index structure
  fetchedAt: Date
}
```

### CacheEntry
Represents a cached data record in Redis.

```
CacheEntry {
  key: string                     // Structured cache key
  data: object                    // Serialized cached value
  ttlSeconds: number              // Time-to-live
  cachedAt: Date
}
```

### ProviderError
Represents a failure from a data provider.

```
ProviderError {
  provider: string
  code: 'RATE_LIMIT' | 'TIMEOUT' | 'AUTH_FAILURE' | 'NOT_FOUND' | 'PARSE_ERROR' | 'UNKNOWN'
  message: string
  retryable: boolean
  statusCode: number | null
}
```

### DataUnavailableError
Thrown when all providers (primary + fallback) fail.

```
DataUnavailableError {
  message: string
  primaryError: ProviderError
  fallbackError: ProviderError | null
}
```

## Entity Relationships

```
SearchQuery
  |
  v
PropertyRepository
  |-- checks --> CacheEntry (Redis)
  |-- on miss --> PropertyApiProvider (primary, configurable)
  |               |-- on fail --> ZillowScraperProvider (fallback)
  |-- normalizes --> PropertyListing[]
  |-- writes --> CacheEntry

SearchQuery + PropertyFilters
  |
  v
RentalRepository
  |-- checks --> CacheEntry (Redis)
  |-- on miss --> RentcastProvider + PropertyApiProvider (if rental-capable)
  |-- aggregates with weighted average --> RentalRate[]
  |-- writes --> CacheEntry

Location string
  |
  v
CostOfLivingRepository
  |-- checks --> CacheEntry (Redis, 7-day TTL)
  |-- on miss --> CostOfLivingApiProvider (configurable)
  |-- normalizes --> CostOfLiving
  |-- writes --> CacheEntry
```
