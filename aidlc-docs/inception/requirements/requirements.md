# Requirements Document

## Intent Analysis

- **User Request**: Build a Node.js web application to search Zillow for properties for sale in a given region or ZIP code, compare them against rental rates using common factors (bedrooms, sq ft, amenities), and estimate cost of living to determine and rank potential ROI.
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: System-wide — multiple components (data ingestion, ROI engine, auth, persistence, frontend dashboard)
- **Complexity Estimate**: Complex — multiple external data integrations, configurable ROI model, full-stack with auth, containerized deployment

---

## Functional Requirements

### FR-01: Property Search
- The user shall be able to search for properties for sale by ZIP code or city/region name.
- Search results shall be retrieved from a third-party real estate data API (primary source, e.g., RapidAPI Zillow wrapper, Rentcast, or Realtor.com API).
- If the primary API fails, is rate-limited, or returns no results, the system shall fall back to scraping Zillow directly.
- The system shall display a clear indicator to the user when fallback scraping is active.

### FR-02: Rental Rate Comparison
- The system shall retrieve rental rate data for the searched area from multiple sources and aggregate/deduplicate results.
- Rental data sources shall include at minimum: the primary property API (if it includes rental data), and a dedicated rental-focused API (e.g., Rentcast).
- Rental rates shall be matched to for-sale properties using comparable attributes: number of bedrooms, bathrooms, square footage, and property type.

### FR-03: Cost of Living Data
- The system shall retrieve cost of living data for the searched area from a public cost-of-living API (e.g., Numbeo, BestPlaces, or Teleport).
- Cost of living data shall include at minimum: housing index, utilities, groceries, transportation, and healthcare indices.
- Cost of living data shall be used as an adjustment factor in the ROI calculation.

### FR-04: ROI Calculation Engine
- The system shall calculate an ROI score for each property using a full model including:
  - Cap rate: `(Annual Estimated Rent - Annual Expenses) / Property Price`
  - Cost of living adjustment factor (from FR-03)
  - Estimated vacancy rate (configurable, default 8%)
  - Property tax estimate (sourced from listing data or estimated by region)
  - Maintenance estimate (configurable, default 1% of property value per year)
- The user shall be able to configure the weight or inclusion of each ROI factor via a settings panel.
- The system shall display a breakdown of each factor contributing to the final ROI score.

### FR-05: Property Filtering
- The user shall be able to filter properties by:
  - Number of bedrooms
  - Number of bathrooms
  - Square footage (min/max)
  - Property type (Single Family Home, Condo, Multi-Family, Townhouse)
  - Year built (min/max)
  - User-configurable custom filters (price range, HOA fees, lot size)
- Filters shall update results dynamically without a full page reload.

### FR-06: Results Dashboard
- The system shall present results in a full dashboard containing:
  - A sortable, paginated data table ranked by ROI score (default sort)
  - An interactive map view showing property locations with ROI score overlays
  - ROI comparison charts (bar/scatter) and rental yield graphs
- The user shall be able to sort the table by any column.
- The user shall be able to click a property to view a detailed ROI breakdown panel.

### FR-07: User Authentication
- The system shall support user registration and login using email and password.
- Passwords shall be hashed using an adaptive algorithm (bcrypt or argon2).
- The system shall implement brute-force protection on the login endpoint (account lockout or progressive delay after 5 failed attempts).
- Sessions shall use secure, HttpOnly, SameSite cookies with server-side expiration.
- The system shall be designed to support MFA and OAuth in future iterations.

### FR-08: Saved Searches and Favorites
- Authenticated users shall be able to save search queries (ZIP/region + filters) for later retrieval.
- Authenticated users shall be able to bookmark/favorite individual properties.
- Saved searches and favorites shall persist across sessions.

### FR-09: Data Caching
- API results (property listings, rental rates, cost of living) shall be cached in a database to reduce redundant API calls.
- Cache entries shall have a configurable TTL (default: 24 hours for property data, 7 days for cost of living data).
- The system shall serve cached results when available and refresh in the background when TTL expires.

### FR-10: Data Source Configuration
- The system shall support user-configurable API keys for the third-party property and rental data providers.
- API keys shall be stored securely (encrypted at rest, never exposed in frontend responses).

---

## Non-Functional Requirements

### NFR-01: Performance
- Property search results shall load within 3 seconds for cached queries.
- Initial search (cache miss) shall complete within 10 seconds.
- The dashboard map and charts shall render within 2 seconds of data load.
- The system shall support at least 50 concurrent users without degradation.

### NFR-02: Security
- All security baseline rules (SECURITY-01 through SECURITY-15) are enforced as blocking constraints.
- All data in transit shall use TLS 1.2+.
- All data at rest (database, cache) shall be encrypted.
- HTTP security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) shall be set on all responses.
- All API inputs shall be validated and sanitized before processing.
- No secrets, API keys, or credentials shall be hardcoded in source code.

### NFR-03: Scalability
- The application shall be containerized using Docker.
- The system shall be deployable to Kubernetes for horizontal scaling.
- The architecture shall support stateless backend instances behind a load balancer.

### NFR-04: Reliability
- The system shall handle third-party API failures gracefully with fallback behavior (FR-01) and user-facing error messages.
- The system shall have a global error handler that catches unhandled exceptions and returns safe, generic error responses.
- All external API calls shall have timeout and retry logic.

### NFR-05: Maintainability
- The codebase shall follow a clear separation of concerns: data ingestion, ROI engine, API layer, and frontend are distinct modules.
- All dependencies shall use exact pinned versions with a committed lock file.
- A dependency vulnerability scanner shall be configured (e.g., npm audit or Snyk).

### NFR-06: Observability
- The application shall use structured logging (JSON format) with timestamp, request ID, log level, and message.
- Logs shall not contain passwords, tokens, or PII.
- Log retention shall be a minimum of 90 days.
- Alerts shall be configured for repeated authentication failures and authorization violations.

### NFR-07: Usability
- The UI shall be responsive and usable on desktop and tablet screen sizes.
- The dashboard shall provide clear visual indicators for data loading states and errors.
- ROI score breakdowns shall be presented in plain language alongside technical values.

---

## User Scenarios

### Scenario 1: Investor searches by ZIP code
A real estate investor enters ZIP code 78701 (Austin, TX), sets filters for 3-bedroom SFH under $500k, and views a ranked list of properties with ROI scores. They click the top-ranked property to see the full ROI breakdown including cap rate, vacancy adjustment, and cost of living factor.

### Scenario 2: Investor saves a search
After configuring a search, the investor saves it to their account. On their next visit, they reload the saved search and see refreshed results.

### Scenario 3: API fallback
The primary property API returns a rate-limit error. The system automatically falls back to Zillow scraping, displays a notice to the user, and returns results.

### Scenario 4: Custom ROI weighting
An investor who believes vacancy rates are higher in a given market adjusts the vacancy rate to 15% and disables the cost of living adjustment. The ROI scores recalculate in real time.

---

## Technical Context

- **Runtime**: Node.js (LTS)
- **Backend Framework**: Express.js
- **Frontend Framework**: React
- **Database**: To be determined in design phase (PostgreSQL recommended for relational data + caching)
- **Containerization**: Docker + Kubernetes
- **Primary Data Source**: Third-party real estate API (user-configurable API key)
- **Fallback Data Source**: Zillow web scraping
- **Rental Data**: Aggregated from multiple sources (primary API + dedicated rental API)
- **Cost of Living**: Public cost-of-living API (Numbeo / BestPlaces / Teleport)
- **Authentication**: Email/password with bcrypt/argon2, secure sessions
- **Security**: Full security baseline enforced (SECURITY-01 through SECURITY-15)

---

## Constraints and Assumptions

- Zillow scraping may violate Zillow's Terms of Service; the application shall include a disclaimer and the scraping module shall be designed to be easily disabled.
- Third-party API availability and rate limits are outside the system's control; caching and fallback logic mitigate this risk.
- Cost of living API data accuracy depends on the chosen provider.
- The application is not a licensed financial advisor; ROI scores are estimates for informational purposes only and shall include a disclaimer.

---

## Success Criteria

- A user can search a ZIP code or region and receive a ranked list of for-sale properties with ROI scores within 10 seconds.
- ROI scores incorporate cap rate, cost of living, vacancy rate, property tax, and maintenance estimates.
- Users can configure ROI factor weights and see results update.
- Authenticated users can save searches and favorite properties.
- The application runs in Docker containers and is deployable to Kubernetes.
- All security baseline rules are satisfied.
