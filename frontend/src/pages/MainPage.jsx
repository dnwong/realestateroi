import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchQuery } from '../hooks/useSearchQuery';
import { useROIRecalculate } from '../hooks/useROIRecalculate';
import { useCreateSavedSearch } from '../hooks/useSavedSearches';
import SearchPanel from '../components/SearchPanel/SearchPanel';
import ROIConfigPanel from '../components/ROIConfigPanel/ROIConfigPanel';
import ResultsDashboard from '../components/ResultsDashboard/ResultsDashboard';
import PropertyDetailPanel from '../components/PropertyDetailPanel/PropertyDetailPanel';
import SavedSearchesPanel from '../components/SavedSearchesPanel/SavedSearchesPanel';

const DEFAULT_ROI_CONFIG = {
  vacancyRate: 0.08,
  maintenanceRate: 0.01,
  enableVacancy: true,
  enablePropertyTax: true,
  enableMaintenance: true,
  enableCostOfLiving: true,
};

export default function MainPage() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useState(null);
  const [roiConfig, setRoiConfig] = useState(DEFAULT_ROI_CONFIG);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  const { data: searchData, isLoading, isError, error } = useSearchQuery(
    searchParams ? { ...searchParams, ...roiConfig } : null,
    !!searchParams
  );

  const roiRecalculate = useROIRecalculate(searchParams);
  const createSavedSearch = useCreateSavedSearch();

  function handleSearch(query) {
    setSearchParams(query);
    setSelectedProperty(null);
  }

  function handleROIConfigChange(newConfig) {
    setRoiConfig(newConfig);
    // Recalculate ROI for existing results without re-fetching
    if (searchData?.data?.length) {
      roiRecalculate.mutate({ properties: searchData.data, roiConfig: newConfig });
    }
  }

  function handleSaveSearch() {
    if (!searchParams) return;
    const name = prompt('Name this search:');
    if (name) createSavedSearch.mutate({ name, query: searchParams });
  }

  const results = searchData?.data || [];

  return (
    <div className="main-page">
      <header className="app-header">
        <h1 className="app-title">Zillow ROI Analyzer</h1>
        <nav className="header-nav">
          {user && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSavedPanel(true)}>
                My Saved Items
              </button>
              {searchParams && (
                <button className="btn btn-secondary btn-sm" onClick={handleSaveSearch}>
                  Save Search
                </button>
              )}
              <span className="user-email">{user.email}</span>
              <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
          <ROIConfigPanel config={roiConfig} onChange={handleROIConfigChange} />
        </aside>

        <section className="results-section">
          {isError && (
            <div className="error-banner" role="alert">
              {error?.message || 'Search failed. Please try again.'}
            </div>
          )}
          <ResultsDashboard
            results={results}
            isLoading={isLoading}
            usingFallback={searchData?.usingFallback}
            onSelectProperty={setSelectedProperty}
          />
        </section>
      </main>

      {selectedProperty && (
        <PropertyDetailPanel
          result={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {showSavedPanel && (
        <SavedSearchesPanel
          onLoadSearch={(query) => { setSearchParams(query); }}
          onClose={() => setShowSavedPanel(false)}
        />
      )}
    </div>
  );
}
