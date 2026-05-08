# Frontend Components: frontend

## Component Hierarchy

```
App
├── AuthProvider (context)
├── QueryClientProvider (TanStack Query)
├── Router
│   ├── /login → LoginPage
│   │   └── AuthForm (login mode)
│   ├── /register → RegisterPage
│   │   └── AuthForm (register mode)
│   └── / → MainPage (protected)
│       ├── Header (nav + user menu)
│       ├── SearchPanel
│       │   ├── SearchInput (query + type toggle)
│       │   └── FilterPanel (collapsible)
│       ├── ROIConfigPanel (collapsible sidebar)
│       ├── ResultsDashboard
│       │   ├── PropertyTable
│       │   ├── PropertyMap
│       │   └── ROICharts
│       ├── PropertyDetailPanel (slide-in drawer)
│       └── SavedSearchesPanel (slide-in drawer)
```

## Component Specifications

### App
- Wraps everything in `QueryClientProvider` and `AuthProvider`
- Sets up React Router with protected route guard

### AuthProvider
- Provides `{ user, isLoading, login, logout, register }` via context
- Uses `useAuthQuery` (TanStack Query) to fetch `/api/auth/me` on mount
- Exposes `login()` and `register()` mutation functions

### SearchPanel
**Props**: `onSearch(query: SearchQuery): void`
**State**: `searchInput`, `searchType`, `filters` (local useState)
**UI Elements**:
- Text input for ZIP/region (`data-testid="search-input"`)
- Toggle for zip/region type (`data-testid="search-type-toggle"`)
- Submit button (`data-testid="search-submit-button"`)
- Collapsible FilterPanel

### FilterPanel
**Props**: `filters`, `onChange(filters): void`
**UI Elements**:
- Bedrooms min/max number inputs (`data-testid="filter-bedrooms-min"`, `filter-bedrooms-max`)
- Bathrooms min number input (`data-testid="filter-bathrooms-min"`)
- Price min/max inputs (`data-testid="filter-price-min"`, `filter-price-max`)
- Sq ft min/max inputs
- Property type checkboxes (SFH, Condo, Multi-Family, Townhouse)
- Reset button (`data-testid="filter-reset-button"`)

### ROIConfigPanel
**Props**: `config: ROIConfig`, `onChange(config): void`
**State**: local config state, synced to parent on change
**UI Elements**:
- Vacancy rate slider/input (0-30%) (`data-testid="roi-vacancy-rate"`)
- Maintenance rate slider/input (0-5%) (`data-testid="roi-maintenance-rate"`)
- Toggle switches for each factor (`data-testid="roi-toggle-vacancy"`, etc.)
- Reset to defaults button (`data-testid="roi-reset-button"`)

### ResultsDashboard
**Props**: `results: PropertyResult[]`, `isLoading: boolean`, `usingFallback: boolean`
**State**: `selectedProperty`, `activeTab` ('table' | 'map' | 'charts')
**UI Elements**:
- Tab bar for table/map/charts views (`data-testid="dashboard-tab-table"`, etc.)
- Fallback disclaimer banner (shown when `usingFallback`)
- Loading skeleton

### PropertyTable
**Props**: `results: PropertyResult[]`, `onSelect(result): void`
**State**: `sortColumn`, `sortDirection`, `page`
**UI Elements**:
- Sortable column headers (`data-testid="col-header-{name}"`)
- Property rows (`data-testid="property-row-{id}"`)
- ROI score badge with color coding (green > 5%, yellow 2-5%, red < 2%)
- Pagination controls (`data-testid="pagination-next"`, `pagination-prev"`)

### PropertyMap
**Props**: `results: PropertyResult[]`, `onSelect(result): void`
**Library**: Leaflet (react-leaflet)
**UI Elements**:
- Map container with OpenStreetMap tiles
- Property markers colored by ROI score
- Popup on marker click showing address + ROI score
- Properties without lat/lng are excluded from map

### ROICharts
**Props**: `results: PropertyResult[]`
**Library**: Recharts
**UI Elements**:
- Bar chart: top 20 properties by ROI score
- Scatter chart: price vs. ROI score
- Bar chart: estimated monthly rent by property

### PropertyDetailPanel
**Props**: `result: PropertyResult | null`, `onClose(): void`, `onFavorite(result): void`
**UI Elements**:
- Slide-in drawer (`data-testid="property-detail-panel"`)
- Property address, price, beds/baths/sqft
- ROI score (large, prominent)
- ROI breakdown table (cap rate, vacancy adj, maintenance adj, COL adj)
- Estimated rent + rent range
- Favorite button (`data-testid="favorite-button"`)
- Link to original listing (`data-testid="listing-link"`)

### SavedSearchesPanel
**Props**: `onLoadSearch(query: SearchQuery): void`
**UI Elements**:
- Slide-in drawer (`data-testid="saved-searches-panel"`)
- List of saved searches with load + delete actions
- List of favorited properties with remove action

### AuthForm
**Props**: `mode: 'login' | 'register'`
**UI Elements**:
- Email input (`data-testid="auth-email-input"`)
- Password input (`data-testid="auth-password-input"`)
- Submit button (`data-testid="auth-submit-button"`)
- Error message display
- Link to switch between login/register

## State Management

### Server State (TanStack Query)
| Hook | Key | Endpoint |
|---|---|---|
| `useSearchQuery` | `['search', searchParams]` | GET /api/search |
| `useROIRecalculate` | mutation | POST /api/roi/calculate |
| `useAuthQuery` | `['auth', 'me']` | GET /api/auth/me |
| `useSavedSearches` | `['saved-searches']` | GET /api/saved-searches |
| `useFavorites` | `['favorites']` | GET /api/favorites |
| `useAddFavorite` | mutation | POST /api/favorites |
| `useDeleteFavorite` | mutation | DELETE /api/favorites/:id |

### Local State (useState)
- `searchInput`, `searchType`, `filters` — SearchPanel
- `roiConfig` — ROIConfigPanel (synced to search params)
- `selectedProperty` — ResultsDashboard
- `activeTab` — ResultsDashboard
- `sortColumn`, `sortDirection`, `page` — PropertyTable

## Form Validation Rules
- Search input: required, min 1 char, max 100 chars
- ZIP code: must match `/^\d{5}$/` when type is 'zip'
- Email: valid email format
- Password: min 8 characters
- Vacancy rate: 0-30%
- Maintenance rate: 0-5%
- Price min must be ≤ price max
- Bedrooms min must be ≤ bedrooms max
