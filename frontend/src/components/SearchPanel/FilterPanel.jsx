import React from 'react';

const PROPERTY_TYPES = ['SFH', 'Condo', 'Multi-Family', 'Townhouse'];

export default function FilterPanel({ filters, onChange, onReset }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  function togglePropertyType(type) {
    const current = filters.propertyType || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    update('propertyType', updated);
  }

  return (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="filter-group">
          <label>Bedrooms</label>
          <div className="range-inputs">
            <input type="number" min="0" max="20" placeholder="Min"
              value={filters.bedroomsMin} onChange={(e) => update('bedroomsMin', e.target.value)}
              data-testid="filter-bedrooms-min" />
            <span>–</span>
            <input type="number" min="0" max="20" placeholder="Max"
              value={filters.bedroomsMax} onChange={(e) => update('bedroomsMax', e.target.value)}
              data-testid="filter-bedrooms-max" />
          </div>
        </div>

        <div className="filter-group">
          <label>Bathrooms (min)</label>
          <input type="number" min="0" max="20" step="0.5" placeholder="Min"
            value={filters.bathroomsMin} onChange={(e) => update('bathroomsMin', e.target.value)}
            data-testid="filter-bathrooms-min" />
        </div>

        <div className="filter-group">
          <label>Price ($)</label>
          <div className="range-inputs">
            <input type="number" min="0" placeholder="Min"
              value={filters.priceMin} onChange={(e) => update('priceMin', e.target.value)}
              data-testid="filter-price-min" />
            <span>–</span>
            <input type="number" min="0" placeholder="Max"
              value={filters.priceMax} onChange={(e) => update('priceMax', e.target.value)}
              data-testid="filter-price-max" />
          </div>
        </div>

        <div className="filter-group">
          <label>Sq Ft</label>
          <div className="range-inputs">
            <input type="number" min="0" placeholder="Min"
              value={filters.sqftMin} onChange={(e) => update('sqftMin', e.target.value)}
              data-testid="filter-sqft-min" />
            <span>–</span>
            <input type="number" min="0" placeholder="Max"
              value={filters.sqftMax} onChange={(e) => update('sqftMax', e.target.value)}
              data-testid="filter-sqft-max" />
          </div>
        </div>

        <div className="filter-group">
          <label>Max HOA ($/mo)</label>
          <input type="number" min="0" placeholder="Max HOA"
            value={filters.hoaMax} onChange={(e) => update('hoaMax', e.target.value)}
            data-testid="filter-hoa-max" />
        </div>
      </div>

      <div className="filter-group">
        <label>Property Type</label>
        <div className="checkbox-group">
          {PROPERTY_TYPES.map((type) => (
            <label key={type} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.propertyType || []).includes(type)}
                onChange={() => togglePropertyType(type)}
                data-testid={`filter-type-${type.toLowerCase().replace(/[^a-z]/g, '-')}`}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-secondary" onClick={onReset} data-testid="filter-reset-button">
        Reset Filters
      </button>
    </div>
  );
}
