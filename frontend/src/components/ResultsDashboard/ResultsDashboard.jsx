import React, { useState } from 'react';
import PropertyTable from './PropertyTable';
import PropertyMap from './PropertyMap';
import ROICharts from './ROICharts';

const TABS = ['Table', 'Map', 'Charts'];

export default function ResultsDashboard({ results, isLoading, usingFallback, onSelectProperty }) {
  const [activeTab, setActiveTab] = useState('Table');

  if (isLoading) {
    return <div className="loading-state" aria-live="polite">Searching for properties...</div>;
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="results-dashboard">
      {usingFallback && (
        <div className="fallback-banner" role="alert">
          ⚠️ Some results were retrieved via web scraping and may be less accurate.
          Scraping Zillow may violate their Terms of Service.
        </div>
      )}

      <div className="results-summary">
        Found <strong>{results.length}</strong> properties
      </div>

      <div className="tab-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            data-testid={`dashboard-tab-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content" role="tabpanel">
        {activeTab === 'Table' && (
          <PropertyTable results={results} onSelect={onSelectProperty} />
        )}
        {activeTab === 'Map' && (
          <PropertyMap results={results} onSelect={onSelectProperty} />
        )}
        {activeTab === 'Charts' && (
          <ROICharts results={results} />
        )}
      </div>
    </div>
  );
}
