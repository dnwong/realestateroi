import React from 'react';
import { useAddFavorite } from '../../hooks/useSavedSearches';
import { useAuth } from '../../context/AuthContext';

function formatCurrency(n) {
  return n != null ? `$${n.toLocaleString()}` : '—';
}
function formatPercent(n) {
  return n != null ? `${(n * 100).toFixed(2)}%` : '—';
}

export default function PropertyDetailPanel({ result, onClose }) {
  const { isAuthenticated } = useAuth();
  const addFavorite = useAddFavorite();

  if (!result) return null;

  const { property, rentalRate, costOfLiving, roiScore, roiBreakdown } = result;

  function handleFavorite() {
    addFavorite.mutate({ propertyId: property.id, propertyData: property });
  }

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div
        className="detail-panel"
        data-testid="property-detail-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Property details for ${property.address}`}
      >
        <button className="close-btn" onClick={onClose} aria-label="Close detail panel">✕</button>

        <div className="detail-header">
          <h2>{property.address}</h2>
          <p>{property.city}, {property.state} {property.zipCode}</p>
          <div className="detail-price">{formatCurrency(property.price)}</div>
          <div className="detail-specs">
            {property.bedrooms} bd · {property.bathrooms} ba · {property.sqft?.toLocaleString()} sqft · {property.propertyType}
          </div>
        </div>

        <div className="roi-score-display">
          <span className="roi-label">ROI Score</span>
          <span className="roi-value">{formatPercent(roiScore)}</span>
        </div>

        <div className="roi-breakdown">
          <h3>ROI Breakdown</h3>
          <table className="breakdown-table">
            <tbody>
              <tr><td>Cap Rate</td><td>{formatPercent(roiBreakdown?.capRate)}</td></tr>
              <tr><td>Annual Est. Rent</td><td>{formatCurrency(roiBreakdown?.annualEstimatedRent)}</td></tr>
              <tr><td>Annual Expenses</td><td>{formatCurrency(roiBreakdown?.annualExpenses)}</td></tr>
              {roiBreakdown?.vacancyAdjustment != null && (
                <tr><td>Vacancy Adj.</td><td>-{formatCurrency(roiBreakdown.vacancyAdjustment)}</td></tr>
              )}
              {roiBreakdown?.maintenanceAdjustment != null && (
                <tr><td>Maintenance Adj.</td><td>-{formatCurrency(roiBreakdown.maintenanceAdjustment)}</td></tr>
              )}
              {roiBreakdown?.costOfLivingAdjustment != null && (
                <tr><td>COL Factor</td><td>×{roiBreakdown.costOfLivingAdjustment.toFixed(2)}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {rentalRate && (
          <div className="rental-info">
            <h3>Rental Estimate</h3>
            <p>Est. Monthly Rent: <strong>{formatCurrency(rentalRate.estimatedMonthlyRent)}</strong></p>
            <p>Range: {formatCurrency(rentalRate.rentRangeMin)} – {formatCurrency(rentalRate.rentRangeMax)}</p>
          </div>
        )}

        {costOfLiving && (
          <div className="col-info">
            <h3>Cost of Living — {costOfLiving.location}</h3>
            <p>Overall Index: {costOfLiving.overallIndex} (100 = US avg)</p>
          </div>
        )}

        <div className="detail-actions">
          {property.listingUrl && (
            <a
              href={property.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              data-testid="listing-link"
            >
              View Listing ↗
            </a>
          )}
          {isAuthenticated && (
            <button
              className="btn btn-primary"
              onClick={handleFavorite}
              disabled={addFavorite.isPending}
              data-testid="favorite-button"
            >
              {addFavorite.isPending ? 'Saving...' : '♡ Save to Favorites'}
            </button>
          )}
        </div>

        <p className="disclaimer">
          ROI scores are estimates for informational purposes only and do not constitute financial advice.
        </p>
      </div>
    </div>
  );
}
