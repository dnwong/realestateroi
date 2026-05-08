import React, { useState } from 'react';
import FilterPanel from './FilterPanel';

const DEFAULT_FILTERS = {
  bedroomsMin: '', bedroomsMax: '', bathroomsMin: '',
  sqftMin: '', sqftMax: '', priceMin: '', priceMax: '',
  hoaMax: '', propertyType: [],
};

export default function SearchPanel({ onSearch, isLoading }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('zip');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!searchInput.trim()) return 'Please enter a ZIP code or city/region.';
    if (searchType === 'zip' && !/^\d{5}$/.test(searchInput.trim())) return 'Please enter a valid 5-digit ZIP code.';
    if (filters.priceMin && filters.priceMax && Number(filters.priceMin) > Number(filters.priceMax)) return 'Price min must be less than price max.';
    if (filters.bedroomsMin && filters.bedroomsMax && Number(filters.bedroomsMin) > Number(filters.bedroomsMax)) return 'Bedrooms min must be less than or equal to max.';
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && !(Array.isArray(v) && v.length === 0))
    );

    onSearch({ query: searchInput.trim(), type: searchType, filters: cleanFilters });
  }

  return (
    <div className="search-panel">
      <form onSubmit={handleSubmit}>
        <div className="search-input-row">
          <div className="search-type-toggle" role="group" aria-label="Search type">
            <button
              type="button"
              className={`toggle-btn ${searchType === 'zip' ? 'active' : ''}`}
              onClick={() => setSearchType('zip')}
              data-testid="search-type-zip"
            >ZIP Code</button>
            <button
              type="button"
              className={`toggle-btn ${searchType === 'region' ? 'active' : ''}`}
              onClick={() => setSearchType('region')}
              data-testid="search-type-region"
            >City/Region</button>
          </div>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchType === 'zip' ? 'Enter ZIP code (e.g. 78701)' : 'Enter city or region (e.g. Austin, TX)'}
            className="search-input"
            data-testid="search-input"
            maxLength={100}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            data-testid="search-submit-button"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        <button
          type="button"
          className="btn btn-secondary filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          data-testid="filter-toggle-button"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        )}
      </form>
    </div>
  );
}
