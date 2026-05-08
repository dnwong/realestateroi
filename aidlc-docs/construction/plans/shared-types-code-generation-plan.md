# Code Generation Plan: shared-types

## Unit Context
- **Unit**: shared-types
- **Directory**: `packages/types/`
- **Type**: Shared package (no deployment, imported by all other units)
- **Dependencies**: None
- **Stories/FRs**: All (provides types consumed by all units)

## Steps

- [x] Step 1: Create package structure (`packages/types/`)
- [x] Step 2: Create `packages/types/package.json`
- [x] Step 3: Create property and search types (`src/property.js`)
- [x] Step 4: Create rental and cost-of-living types (`src/rental.js`)
- [x] Step 5: Create ROI types (`src/roi.js`)
- [x] Step 6: Create user and auth types (`src/user.js`)
- [x] Step 7: Create saved search and favorites types (`src/savedSearch.js`)
- [x] Step 8: Create API request/response types (`src/api.js`)
- [x] Step 9: Create main index export (`src/index.js`)
- [x] Step 10: Create README for the package

## Notes
- Using plain JavaScript with JSDoc type annotations (no TypeScript build step needed)
- All types exported from `src/index.js` as named exports
- Consumed via `"@zillow-roi/types": "file:../packages/types"` in dependent packages
