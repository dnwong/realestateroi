import React, { useState } from 'react';

const PAGE_SIZE = 20;

function roiColor(score) {
  if (score >= 0.05) return 'roi-green';
  if (score >= 0.02) return 'roi-yellow';
  return 'roi-red';
}

function formatCurrency(n) {
  return n != null ? `$${n.toLocaleString()}` : '—';
}

function formatPercent(n) {
  return n != null ? `${(n * 100).toFixed(2)}%` : '—';
}

export default function PropertyTable({ results, onSelect }) {
  const [sortCol, setSortCol] = useState('roiScore');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
    setPage(1);
  }

  const sorted = [...results].sort((a, b) => {
    const aVal = sortCol === 'roiScore' ? a.roiScore : a.property[sortCol];
    const bVal = sortCol === 'roiScore' ? b.roiScore : b.property[sortCol];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortHeader({ col, label }) {
    const active = sortCol === col;
    return (
      <th onClick={() => handleSort(col)} className="sortable-header" data-testid={`col-header-${col}`}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    );
  }

  return (
    <div className="property-table-container">
      <table className="property-table">
        <thead>
          <tr>
            <SortHeader col="roiScore" label="ROI Score" />
            <th>Address</th>
            <SortHeader col="price" label="Price" />
            <SortHeader col="bedrooms" label="Beds" />
            <SortHeader col="bathrooms" label="Baths" />
            <SortHeader col="sqft" label="Sq Ft" />
            <th>Est. Rent/mo</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((result) => (
            <tr
              key={result.property.id}
              onClick={() => onSelect(result)}
              className="property-row"
              data-testid={`property-row-${result.property.id}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(result)}
            >
              <td>
                <span className={`roi-badge ${roiColor(result.roiScore)}`}>
                  {formatPercent(result.roiScore)}
                </span>
              </td>
              <td>{result.property.address}, {result.property.city}, {result.property.state}</td>
              <td>{formatCurrency(result.property.price)}</td>
              <td>{result.property.bedrooms}</td>
              <td>{result.property.bathrooms}</td>
              <td>{result.property.sqft?.toLocaleString() || '—'}</td>
              <td>{result.rentalRate ? formatCurrency(result.rentalRate.estimatedMonthlyRent) : '—'}</td>
              <td>{result.property.propertyType}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} data-testid="pagination-prev">
            Previous
          </button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} data-testid="pagination-next">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
