# @zillow-roi/types

Shared JSDoc type definitions for the Zillow ROI Analyzer monorepo.

## Usage

Add to your unit's `package.json`:
```json
{
  "dependencies": {
    "@zillow-roi/types": "file:../packages/types"
  }
}
```

Then reference types via JSDoc:
```js
/**
 * @param {import('@zillow-roi/types/src/property').PropertyListing} property
 * @returns {import('@zillow-roi/types/src/roi').ROIResult}
 */
function calculateROI(property) { ... }
```

## Type Modules

| Module | Types |
|---|---|
| `src/property.js` | `PropertyListing`, `PropertyFilters`, `SearchQuery` |
| `src/rental.js` | `RentalRate`, `CostOfLiving` |
| `src/roi.js` | `ROIConfig`, `ROIFactorWeights`, `ROIBreakdown`, `ROIResult`, `PropertyResult` |
| `src/user.js` | `User`, `LoginRequest`, `RegisterRequest`, `AuthResponse` |
| `src/savedSearch.js` | `SavedSearch`, `FavoriteProperty`, `CreateSavedSearchRequest`, `AddFavoriteRequest` |
| `src/api.js` | `ApiSuccessResponse`, `ApiErrorResponse`, `SearchResponse`, `ROICalculateRequest`, `PaginationParams` |
