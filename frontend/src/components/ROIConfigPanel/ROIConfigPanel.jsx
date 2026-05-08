import React from 'react';

const DEFAULT_CONFIG = {
  vacancyRate: 0.08,
  maintenanceRate: 0.01,
  enableVacancy: true,
  enablePropertyTax: true,
  enableMaintenance: true,
  enableCostOfLiving: true,
};

export default function ROIConfigPanel({ config, onChange }) {
  function update(field, value) {
    onChange({ ...config, [field]: value });
  }

  return (
    <div className="roi-config-panel">
      <h3>ROI Configuration</h3>

      <div className="config-group">
        <label htmlFor="vacancy-rate">
          Vacancy Rate: {Math.round((config.vacancyRate ?? 0.08) * 100)}%
        </label>
        <input
          id="vacancy-rate"
          type="range" min="0" max="0.30" step="0.01"
          value={config.vacancyRate ?? 0.08}
          onChange={(e) => update('vacancyRate', parseFloat(e.target.value))}
          data-testid="roi-vacancy-rate"
        />
        <label className="toggle-label">
          <input type="checkbox" checked={config.enableVacancy ?? true}
            onChange={(e) => update('enableVacancy', e.target.checked)}
            data-testid="roi-toggle-vacancy" />
          Include vacancy adjustment
        </label>
      </div>

      <div className="config-group">
        <label htmlFor="maintenance-rate">
          Maintenance Rate: {Math.round((config.maintenanceRate ?? 0.01) * 100)}%/yr
        </label>
        <input
          id="maintenance-rate"
          type="range" min="0" max="0.05" step="0.005"
          value={config.maintenanceRate ?? 0.01}
          onChange={(e) => update('maintenanceRate', parseFloat(e.target.value))}
          data-testid="roi-maintenance-rate"
        />
        <label className="toggle-label">
          <input type="checkbox" checked={config.enableMaintenance ?? true}
            onChange={(e) => update('enableMaintenance', e.target.checked)}
            data-testid="roi-toggle-maintenance" />
          Include maintenance adjustment
        </label>
      </div>

      <div className="config-group">
        <label className="toggle-label">
          <input type="checkbox" checked={config.enablePropertyTax ?? true}
            onChange={(e) => update('enablePropertyTax', e.target.checked)}
            data-testid="roi-toggle-property-tax" />
          Include property tax
        </label>
      </div>

      <div className="config-group">
        <label className="toggle-label">
          <input type="checkbox" checked={config.enableCostOfLiving ?? true}
            onChange={(e) => update('enableCostOfLiving', e.target.checked)}
            data-testid="roi-toggle-col" />
          Include cost of living adjustment
        </label>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onChange(DEFAULT_CONFIG)}
        data-testid="roi-reset-button"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
