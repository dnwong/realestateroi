# Business Rules: backend-api

## Authentication

### BR-AUTH-01: Password Requirements
- Minimum 8 characters
- Must be hashed with bcrypt (cost factor 12) before storage
- Plaintext password must never be logged or stored

### BR-AUTH-02: Login Brute-Force Protection
- After 5 consecutive failed login attempts for an email: lock account for 15 minutes
- Return HTTP 429 with a generic message (do not reveal lockout reason vs. wrong password)
- Track attempts per email address (not per IP, to prevent account enumeration via IP rotation)

### BR-AUTH-03: Session Management
- Sessions expire after 24 hours of inactivity
- Session must be destroyed on logout (not just cookie cleared)
- Session cookie: `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'`

### BR-AUTH-04: Protected Routes
- All routes except `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/search`, `POST /api/roi/calculate`, `GET /api/roi/config` require an active session
- Unauthenticated requests to protected routes return HTTP 401

## Search

### BR-SEARCH-01: Input Validation
- `query` must be a non-empty string (max 100 chars)
- `type` must be `'zip'` or `'region'`
- ZIP codes must match `/^\d{5}(-\d{4})?$/`
- All numeric filter values must be non-negative
- `priceMin` < `priceMax` if both provided
- `bedroomsMin` ≤ `bedroomsMax` if both provided
- Invalid input returns HTTP 400 with field-level error details

### BR-SEARCH-02: Result Ranking
- Results must be sorted by `roiScore` descending by default
- Ties broken by `price` ascending

### BR-SEARCH-03: Fallback Disclosure
- If Zillow scraper fallback was used, response must include `usingFallback: true`
- A disclaimer must be included in the response when scraper data is present

## ROI Calculation

### BR-ROI-01: Default Config
- `vacancyRate`: 0.08 (8%)
- `maintenanceRate`: 0.01 (1% of property value annually)
- All factors enabled by default

### BR-ROI-02: Cap Rate Formula
```
annualRent = rentalRate.estimatedMonthlyRent * 12
annualExpenses = (propertyTax) + (price * maintenanceRate) + (annualRent * vacancyRate)
capRate = (annualRent - annualExpenses) / price
```

### BR-ROI-03: COL Adjustment
```
colFactor = 1 + (col.overallIndex - 100) / 100
roiScore = capRate * colFactor
```
If COL data unavailable: `colFactor = 1.0` (neutral)

### BR-ROI-04: Missing Rental Data
- If no rental rate found for a property: `roiScore = 0`, `missingRentalData: true`

## Saved Searches & Favorites

### BR-SAVED-01: Ownership Enforcement
- Users can only read/delete their own saved searches and favorites
- Requests referencing another user's resource return HTTP 404 (not 403, to prevent enumeration)

### BR-SAVED-02: Limits
- Maximum 50 saved searches per user
- Maximum 200 favorites per user
- Exceeding limits returns HTTP 422

## General

### BR-GEN-01: Error Responses
- Production error responses must never include stack traces, internal paths, or DB details
- All error responses use the `ApiErrorResponse` schema: `{ success: false, error: string, code?: string }`

### BR-GEN-02: Request ID
- Every request must have a unique `requestId` (UUID v4) attached by middleware
- `requestId` must be included in all log entries and in the `X-Request-Id` response header
