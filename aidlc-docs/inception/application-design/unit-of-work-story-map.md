# Unit of Work — Story Map

## Functional Requirements to Unit Mapping

| Requirement | Primary Unit | Supporting Unit |
|---|---|---|
| FR-01: Property Search | backend-api (SearchComponent) | data-integration (PropertyRepository + providers) |
| FR-02: Rental Rate Comparison | backend-api (SearchComponent) | data-integration (RentalRepository + RentcastProvider) |
| FR-03: Cost of Living Data | backend-api (SearchComponent) | data-integration (CostOfLivingRepository + COLApiProvider) |
| FR-04: ROI Calculation Engine | backend-api (ROIService + ROIComponent) | shared-types (ROIConfig, ROIBreakdown) |
| FR-05: Property Filtering | backend-api (SearchComponent) + frontend (SearchPanel) | shared-types (PropertyFilters) |
| FR-06: Results Dashboard | frontend (ResultsDashboard, PropertyDetailPanel) | backend-api (search endpoint) |
| FR-07: User Authentication | backend-api (AuthComponent, SessionService) | infrastructure (PostgreSQL sessions table) |
| FR-08: Saved Searches & Favorites | backend-api (SavedSearchComponent) + frontend (SavedSearchesPanel) | infrastructure (PostgreSQL tables) |
| FR-09: Data Caching | data-integration (CacheService + repositories) | infrastructure (Redis) |
| FR-10: Data Source Configuration | backend-api (env config) + data-integration (providers) | infrastructure (.env templates) |

---

## User Scenario to Unit Mapping

| Scenario | Units Involved |
|---|---|
| Investor searches by ZIP code | frontend → backend-api → data-integration → external APIs |
| Investor saves a search | frontend → backend-api → PostgreSQL |
| API fallback (primary fails) | data-integration (PropertyRepository fallback logic) |
| Custom ROI weighting | frontend (ROIConfigPanel) → backend-api (ROIComponent + ROIService) |

---

## Implementation Sequence

Given the dependency order, the recommended implementation sequence is:

### Phase 1: Foundation
1. **shared-types** — Define all shared TypeScript/JS types first. Unblocks all other units.
2. **infrastructure** — Database migrations, Docker Compose for local dev. Unblocks backend-api development.

### Phase 2: Backend Core
3. **data-integration** — Providers, repositories, CacheService. Can be developed and tested independently with mocked Redis.
4. **backend-api** — Auth, search orchestration, ROI engine, saved searches. Depends on data-integration.

### Phase 3: Frontend
5. **frontend** — React SPA. Can be developed in parallel with backend-api using mocked API responses, integrated once backend-api is ready.

### Phase 4: Integration
6. Full integration testing across all units running in Docker Compose.

---

## Unit Summary

| Unit | Stories/FRs | Complexity | Est. Relative Size |
|---|---|---|---|
| shared-types | All (types only) | Low | XS |
| data-integration | FR-01, FR-02, FR-03, FR-09, FR-10 | High (external APIs, scraping, caching) | L |
| backend-api | FR-01, FR-04, FR-05, FR-07, FR-08 | High (auth, orchestration, ROI engine) | L |
| frontend | FR-05, FR-06, FR-07, FR-08 | Medium (dashboard, map, charts, auth UI) | L |
| infrastructure | FR-07, FR-08, FR-09 (infra support) | Medium (Docker, K8s, migrations) | M |
