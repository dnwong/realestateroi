# Application Design Plan

## Steps

- [x] Answer design questions below
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate application-design.md (consolidated)
- [x] Validate design completeness

---

## Design Questions

Please fill in the `[Answer]:` tags below. Let me know when done.

---

### Question 1: API Architecture Style
How should the backend REST API be structured?

A) Flat route structure — all routes in a single `routes/` folder (e.g., `/api/search`, `/api/roi`, `/api/auth`)
B) Resource-based modules — each domain has its own router module (e.g., `routes/search.js`, `routes/roi.js`, `routes/auth.js`)
C) Controller + Router separation — routers delegate to controller classes/modules per domain
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2: ROI Engine Design
The ROI engine needs to support configurable factor weights. How should it be structured internally?

A) Single function — one `calculateROI(property, rental, costOfLiving, config)` function with all logic inline
B) Pipeline pattern — each factor (cap rate, vacancy, tax, maintenance, COL) is a separate step that can be enabled/disabled
C) Strategy pattern — each factor is a pluggable strategy class/module, composed at runtime based on user config
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3: Data Integration Layer
The system has multiple external data sources (property API, Zillow scraper fallback, rental APIs, cost-of-living API). How should these be organized?

A) Single data service — one `DataService` that handles all external sources internally
B) Provider pattern — each source is a separate provider module (e.g., `PropertyApiProvider`, `ZillowScraperProvider`, `RentcastProvider`, `NumbeoProvider`) with a common interface, orchestrated by a coordinator
C) Repository pattern — abstract repositories (e.g., `PropertyRepository`, `RentalRepository`) that internally select the right provider
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 4: Frontend State Management
The React frontend needs to manage search state, filter state, ROI config, and user session. How should state be managed?

A) React built-in only — useState/useContext/useReducer, no external library
B) Redux Toolkit — centralized store for all app state
C) Zustand — lightweight store, one store per domain (search, auth, ROI config)
D) React Query / TanStack Query for server state + useState for local UI state
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 5: Authentication Token Strategy
The app uses email/password auth with secure sessions. How should auth tokens/sessions be managed server-side?

A) Server-side sessions with express-session + session store (e.g., connect-pg-simple for PostgreSQL)
B) JWT access tokens (short-lived) + refresh tokens (long-lived, stored in HttpOnly cookie)
C) JWT stored entirely in HttpOnly cookie (single token, server validates on each request)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 6: Caching Layer
The system needs to cache property listings, rental data, and cost-of-living data. Where should the cache live?

A) In-process memory cache (e.g., node-cache) — simple, no extra infrastructure
B) PostgreSQL table with TTL column — reuse existing DB, no extra service
C) Redis — dedicated cache store, supports TTL natively, scales independently
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---
