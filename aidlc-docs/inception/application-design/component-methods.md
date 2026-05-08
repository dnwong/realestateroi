# Component Methods

Note: Detailed business logic and validation rules are defined in Functional Design (CONSTRUCTION phase). This document captures method signatures, purposes, and input/output types.

---

## AuthComponent

```js
// POST /api/auth/register
register(req: { body: { email: string, password: string } }, res): Promise<void>
// Creates a new user account. Returns 201 on success, 409 if email exists.

// POST /api/auth/login
login(req: { body: { email: string, password: string } }, res): Promise<void>
// Authenticates user, creates server-side session. Returns 200 + user object, 401 on failure.

// POST /api/auth/logout
logout(req, res): Promise<void>
// Destroys server-side session. Returns 204.

// GET /api/auth/me
getSession(req, res): Promise<void>
// Returns current authenticated user from session. Returns 200 + user, 401 if not authenticated.
```

---

## SearchComponent

```js
// GET /api/search?query=&type=zip|region&filters=...
search(req: { query: SearchQuery }, res): Promise<void>
// Orchestrates property search, rental matching, COL fetch, and ROI scoring.
// Returns ranked PropertyResult[] array.

// Types
SearchQuery {
  query: string          // ZIP code or city/region name
  type: 'zip' | 'region'
  filters: PropertyFilters
  roiConfig?: ROIConfig
}

PropertyFilters {
  bedroomsMin?: number
  bedroomsMax?: number
  bathroomsMin?: number
  sqftMin?: number
  sqftMax?: number
  propertyType?: string[]   // 'SFH' | 'Condo' | 'Multi-Family' | 'Townhouse'
  yearBuiltMin?: number
  yearBuiltMax?: number
  priceMin?: number
  priceMax?: number
  hoaMax?: number
  lotSizeMin?: number
}

PropertyResult {
  property: PropertyListing
  rentalRate: RentalRate
  costOfLiving: CostOfLiving
  roiScore: number
  roiBreakdown: ROIBreakdown
  dataSource: 'api' | 'scraper'
}
```

---

## ROIComponent

```js
// POST /api/roi/calculate
calculate(req: { body: { properties: PropertyResult[], roiConfig: ROIConfig } }, res): Promise<void>
// Recalculates ROI scores for a set of properties with updated config.
// Returns updated PropertyResult[] with new scores and breakdowns.

// GET /api/roi/config
getDefaultConfig(req, res): Promise<void>
// Returns the default ROI configuration.

// Types
ROIConfig {
  vacancyRate: number          // 0.0 - 1.0, default 0.08
  maintenanceRate: number      // 0.0 - 1.0, default 0.01
  enableVacancy: boolean
  enablePropertyTax: boolean
  enableMaintenance: boolean
  enableCostOfLiving: boolean
  factorWeights?: {
    capRate: number
    vacancy: number
    propertyTax: number
    maintenance: number
    costOfLiving: number
  }
}
```

---

## SavedSearchComponent

```js
// GET /api/saved-searches
listSavedSearches(req, res): Promise<void>
// Returns all saved searches for the authenticated user.

// POST /api/saved-searches
createSavedSearch(req: { body: { name: string, query: SearchQuery } }, res): Promise<void>
// Creates a new saved search. Returns 201 + saved search object.

// DELETE /api/saved-searches/:id
deleteSavedSearch(req: { params: { id: string } }, res): Promise<void>
// Deletes a saved search by ID. Verifies ownership before deletion.

// GET /api/favorites
listFavorites(req, res): Promise<void>
// Returns all favorited properties for the authenticated user.

// POST /api/favorites
addFavorite(req: { body: { propertyId: string, propertyData: PropertyListing } }, res): Promise<void>
// Adds a property to favorites. Returns 201.

// DELETE /api/favorites/:id
removeFavorite(req: { params: { id: string } }, res): Promise<void>
// Removes a property from favorites. Verifies ownership.
```

---

## PropertyRepository

```js
findBySearch(query: SearchQuery): Promise<PropertyListing[]>
// Checks Redis cache first. On miss, calls PropertyApiProvider.
// Falls back to ZillowScraperProvider if primary fails.
// Normalizes and caches results. Returns PropertyListing[].

// Types
PropertyListing {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  propertyType: string
  yearBuilt?: number
  propertyTax?: number
  hoaFee?: number
  lotSize?: number
  latitude?: number
  longitude?: number
  listingUrl: string
  dataSource: 'api' | 'scraper'
}
```

---

## RentalRepository

```js
findByArea(zipCode: string, filters: PropertyFilters): Promise<RentalRate[]>
// Checks Redis cache. On miss, aggregates from RentcastProvider and PropertyApiProvider.
// Deduplicates and normalizes. Returns RentalRate[].

// Types
RentalRate {
  zipCode: string
  bedrooms: number
  bathrooms?: number
  sqft?: number
  propertyType?: string
  estimatedMonthlyRent: number
  rentRangeMin: number
  rentRangeMax: number
  dataSource: string
}
```

---

## CostOfLivingRepository

```js
findByLocation(location: string): Promise<CostOfLiving>
// Checks Redis cache (7-day TTL). On miss, fetches from CostOfLivingApiProvider.
// Returns normalized CostOfLiving object.

// Types
CostOfLiving {
  location: string
  overallIndex: number
  housingIndex: number
  utilitiesIndex: number
  groceriesIndex: number
  transportationIndex: number
  healthcareIndex: number
  dataSource: string
  fetchedAt: Date
}
```

---

## PropertyApiProvider

```js
search(query: SearchQuery, apiKey: string): Promise<RawPropertyApiResponse>
// Executes search against configured third-party API.
// Handles auth headers, timeouts (10s), and up to 2 retries on 5xx.
// Throws ProviderError on rate limit or persistent failure.
```

---

## ZillowScraperProvider

```js
scrape(query: SearchQuery): Promise<RawScraperResponse>
// Scrapes Zillow search results page for given ZIP/region.
// Parses HTML into structured data.
// Returns { listings: RawListing[], usedScraper: true }.
// Throws ScraperError on failure.
```

---

## RentcastProvider

```js
getRentalEstimates(zipCode: string, filters: PropertyFilters, apiKey: string): Promise<RawRentalApiResponse>
// Fetches rental estimates from Rentcast API.
// Handles auth, timeouts (10s), and retries.
```

---

## CostOfLivingApiProvider

```js
getCostOfLiving(location: string, apiKey: string): Promise<RawCOLApiResponse>
// Fetches cost-of-living indices from configured COL API.
// Handles auth, timeouts (10s), and retries.
```

---

## ROIService

```js
calculate(property: PropertyListing, rental: RentalRate, col: CostOfLiving, config: ROIConfig): ROIResult
// Executes the ROI pipeline. Runs each enabled step in sequence.
// Returns final score and per-step breakdown.

// Pipeline steps (each returns a StepResult)
runCapRateStep(property, rental, config): StepResult
runVacancyStep(property, rental, config): StepResult
runPropertyTaxStep(property, config): StepResult
runMaintenanceStep(property, config): StepResult
runCostOfLivingStep(col, config): StepResult

// Types
ROIResult {
  roiScore: number
  breakdown: ROIBreakdown
}

ROIBreakdown {
  capRate: number
  vacancyAdjustment?: number
  propertyTaxAdjustment?: number
  maintenanceAdjustment?: number
  costOfLivingAdjustment?: number
  annualEstimatedRent: number
  annualExpenses: number
}

StepResult {
  stepName: string
  value: number
  enabled: boolean
}
```

---

## CacheService

```js
get<T>(key: string): Promise<T | null>
// Returns cached value or null on miss/error.

set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
// Stores value with TTL. Fails silently on Redis error.

delete(key: string): Promise<void>
// Removes a cache entry.

buildKey(namespace: string, params: Record<string, unknown>): string
// Generates a deterministic cache key from namespace + params.
```

---

## LoggerService

```js
info(message: string, meta?: Record<string, unknown>): void
warn(message: string, meta?: Record<string, unknown>): void
error(message: string, error?: Error, meta?: Record<string, unknown>): void
debug(message: string, meta?: Record<string, unknown>): void
// All methods output structured JSON: { timestamp, level, requestId, message, ...meta }
// requestId is injected via middleware from req context.
```

---

## Frontend Component Methods

### SearchPanel
```ts
onSearch(params: SearchQuery): void       // Triggers TanStack Query search mutation
onFilterChange(filters: PropertyFilters): void  // Updates local filter state
onReset(): void                           // Clears all filters and results
```

### ResultsDashboard
```ts
onPropertySelect(property: PropertyResult): void  // Opens PropertyDetailPanel
onSort(column: string, direction: 'asc' | 'desc'): void
onPageChange(page: number): void
```

### PropertyDetailPanel
```ts
onFavorite(property: PropertyResult): void   // Calls POST /api/favorites
onClose(): void
```

### ROIConfigPanel
```ts
onConfigChange(config: ROIConfig): void   // Triggers ROI recalculation via TanStack Query
onReset(): void                           // Resets to default config
```

### AuthModule
```ts
onLogin(credentials: { email: string, password: string }): Promise<void>
onRegister(credentials: { email: string, password: string }): Promise<void>
onLogout(): Promise<void>
```

### SavedSearchesPanel
```ts
onLoadSearch(savedSearch: SavedSearch): void   // Populates SearchPanel with saved params
onDeleteSearch(id: string): void
onRemoveFavorite(id: string): void
```
