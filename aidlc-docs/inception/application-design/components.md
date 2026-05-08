# Components

## Overview

The application is organized into three top-level deployment units, each containing focused components.

---

## Backend Components

### 1. AuthComponent
**Purpose**: Handles user registration, login, logout, and session management.

**Responsibilities**:
- Register new users with email/password
- Authenticate users and establish server-side sessions
- Validate active sessions on protected routes
- Invalidate sessions on logout
- Enforce brute-force protection (lockout after 5 failed attempts)
- Hash passwords using bcrypt/argon2

**Interface**: Express router mounted at `/api/auth`

---

### 2. SearchComponent
**Purpose**: Accepts search requests from the frontend and orchestrates data retrieval across repositories.

**Responsibilities**:
- Accept search parameters (ZIP code or city/region, filters)
- Delegate property retrieval to PropertyRepository
- Delegate rental rate retrieval to RentalRepository
- Delegate cost-of-living retrieval to CostOfLivingRepository
- Pass retrieved data to ROIService for scoring
- Return ranked, filtered results to the client

**Interface**: Express router mounted at `/api/search`

---

### 3. ROIComponent
**Purpose**: Exposes ROI recalculation and configuration endpoints.

**Responsibilities**:
- Accept user-defined ROI factor weights/config
- Invoke ROIService with custom config
- Return recalculated ROI scores and factor breakdowns

**Interface**: Express router mounted at `/api/roi`

---

### 4. SavedSearchComponent
**Purpose**: Manages saved searches and favorited properties for authenticated users.

**Responsibilities**:
- Create, read, update, delete saved searches
- Create, read, delete favorited properties
- Enforce ownership — users can only access their own data

**Interface**: Express router mounted at `/api/saved-searches` and `/api/favorites`

---

### 5. PropertyRepository
**Purpose**: Abstract data access layer for property listing data.

**Responsibilities**:
- Check Redis cache for existing property data (by search key + TTL)
- On cache miss: delegate to PropertyApiProvider (primary) or ZillowScraperProvider (fallback)
- Write results to Redis cache with configured TTL
- Normalize data from different providers into a common PropertyListing schema

**Interface**: Internal module, consumed by SearchComponent

---

### 6. RentalRepository
**Purpose**: Abstract data access layer for rental rate data.

**Responsibilities**:
- Check Redis cache for existing rental data
- On cache miss: aggregate from RentcastProvider and PropertyApiProvider (if rental data available)
- Deduplicate and normalize rental records into a common RentalRate schema
- Write aggregated results to Redis cache

**Interface**: Internal module, consumed by SearchComponent

---

### 7. CostOfLivingRepository
**Purpose**: Abstract data access layer for cost-of-living data.

**Responsibilities**:
- Check Redis cache for existing COL data (longer TTL: 7 days)
- On cache miss: fetch from CostOfLivingApiProvider (Numbeo/BestPlaces/Teleport)
- Normalize into a common CostOfLiving schema
- Write to Redis cache

**Interface**: Internal module, consumed by SearchComponent

---

### 8. PropertyApiProvider
**Purpose**: Client for the primary third-party real estate data API.

**Responsibilities**:
- Execute property search requests against the configured API (RapidAPI Zillow wrapper / Rentcast / Realtor.com)
- Handle API authentication (user-configured API key)
- Handle rate limiting, timeouts, and retries
- Return raw API response for normalization by PropertyRepository

**Interface**: Internal provider, consumed by PropertyRepository

---

### 9. ZillowScraperProvider
**Purpose**: Fallback web scraper for Zillow property listings.

**Responsibilities**:
- Scrape Zillow search results for a given ZIP/region
- Parse HTML into structured property data
- Handle scraping failures gracefully
- Include disclaimer flag in response indicating scraping was used

**Interface**: Internal provider, consumed by PropertyRepository as fallback

---

### 10. RentcastProvider
**Purpose**: Client for the Rentcast rental data API.

**Responsibilities**:
- Fetch rental rate estimates for a given area and property attributes
- Handle API authentication and rate limiting
- Return raw rental data for normalization by RentalRepository

**Interface**: Internal provider, consumed by RentalRepository

---

### 11. CostOfLivingApiProvider
**Purpose**: Client for the cost-of-living API (Numbeo / BestPlaces / Teleport).

**Responsibilities**:
- Fetch cost-of-living indices for a given city/region
- Handle API authentication and rate limiting
- Return raw COL data for normalization by CostOfLivingRepository

**Interface**: Internal provider, consumed by CostOfLivingRepository

---

### 12. ROIService
**Purpose**: Core ROI calculation engine using a pipeline pattern.

**Responsibilities**:
- Accept a property, rental rate, cost-of-living data, and user ROI config
- Execute each enabled pipeline step in sequence: CapRateStep, VacancyStep, PropertyTaxStep, MaintenanceStep, CostOfLivingStep
- Aggregate step outputs into a final ROI score
- Return score + per-step breakdown for display

**Interface**: Internal service, consumed by SearchComponent and ROIComponent

---

### 13. CacheService
**Purpose**: Abstraction over Redis for cache read/write operations.

**Responsibilities**:
- Provide get/set/delete operations with TTL support
- Serialize/deserialize cached objects
- Handle Redis connection errors gracefully (fail open — return cache miss on error)

**Interface**: Internal service, consumed by all Repository components

---

### 14. LoggerService
**Purpose**: Structured logging infrastructure for the backend.

**Responsibilities**:
- Provide structured JSON log output (timestamp, request ID, level, message)
- Ensure no PII, passwords, or tokens appear in log output
- Route logs to stdout (for container log aggregation)

**Interface**: Internal service, consumed by all backend components

---

## Frontend Components

### 15. SearchPanel
**Purpose**: UI component for entering search parameters and filters.

**Responsibilities**:
- Accept ZIP code or city/region input
- Render filter controls (bedrooms, bathrooms, sq ft, property type, year built, price range)
- Trigger search on submit
- Show loading state during search

---

### 16. ResultsDashboard
**Purpose**: Main results view containing table, map, and charts.

**Responsibilities**:
- Render PropertyTable with sortable columns and ROI ranking
- Render PropertyMap with property location markers and ROI overlays
- Render ROICharts (bar/scatter comparison, rental yield graph)
- Coordinate selection state between table, map, and detail panel

---

### 17. PropertyDetailPanel
**Purpose**: Slide-in panel showing full ROI breakdown for a selected property.

**Responsibilities**:
- Display property details (address, price, beds/baths/sqft, type)
- Display ROI score and per-factor breakdown (cap rate, vacancy, tax, maintenance, COL adjustment)
- Show estimated rental rate and comparable rental data
- Allow user to favorite the property

---

### 18. ROIConfigPanel
**Purpose**: Settings panel for configuring ROI calculation factors and weights.

**Responsibilities**:
- Toggle each ROI factor on/off (vacancy, property tax, maintenance, COL)
- Adjust factor values (e.g., vacancy rate %, maintenance %)
- Trigger ROI recalculation on change
- Persist config to user account (if authenticated)

---

### 19. AuthModule (Frontend)
**Purpose**: Frontend authentication flows.

**Responsibilities**:
- Render login and registration forms
- Submit credentials to `/api/auth` endpoints
- Manage session state via TanStack Query + React context
- Protect routes that require authentication
- Handle session expiry and redirect to login

---

### 20. SavedSearchesPanel
**Purpose**: UI for managing saved searches and favorites.

**Responsibilities**:
- List saved searches with reload action
- List favorited properties with remove action
- Trigger saved search reload into SearchPanel

---
