import React, { useState } from 'react';
import { useSavedSearches, useDeleteSavedSearch, useFavorites, useDeleteFavorite } from '../../hooks/useSavedSearches';

export default function SavedSearchesPanel({ onLoadSearch, onClose }) {
  const [activeTab, setActiveTab] = useState('searches');
  const { data: savedSearches = [], isLoading: loadingSearches } = useSavedSearches();
  const { data: favorites = [], isLoading: loadingFavorites } = useFavorites();
  const deleteSearch = useDeleteSavedSearch();
  const deleteFavorite = useDeleteFavorite();

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div
        className="detail-panel saved-searches-panel"
        data-testid="saved-searches-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Saved searches and favorites"
      >
        <button className="close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        <h2>My Saved Items</h2>

        <div className="tab-bar" role="tablist">
          <button role="tab" aria-selected={activeTab === 'searches'}
            className={`tab-btn ${activeTab === 'searches' ? 'active' : ''}`}
            onClick={() => setActiveTab('searches')}>
            Saved Searches ({savedSearches.length})
          </button>
          <button role="tab" aria-selected={activeTab === 'favorites'}
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}>
            Favorites ({favorites.length})
          </button>
        </div>

        {activeTab === 'searches' && (
          <div className="saved-list">
            {loadingSearches && <p>Loading...</p>}
            {!loadingSearches && savedSearches.length === 0 && <p>No saved searches yet.</p>}
            {savedSearches.map((s) => (
              <div key={s.id} className="saved-item">
                <div className="saved-item-info">
                  <strong>{s.name}</strong>
                  <span>{s.query?.query} ({s.query?.type})</span>
                </div>
                <div className="saved-item-actions">
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => { onLoadSearch(s.query); onClose(); }}>
                    Load
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => deleteSearch.mutate(s.id)}
                    disabled={deleteSearch.isPending}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="saved-list">
            {loadingFavorites && <p>Loading...</p>}
            {!loadingFavorites && favorites.length === 0 && <p>No favorites yet.</p>}
            {favorites.map((f) => (
              <div key={f.id} className="saved-item">
                <div className="saved-item-info">
                  <strong>{f.property_data?.address}</strong>
                  <span>${f.property_data?.price?.toLocaleString()}</span>
                </div>
                <button className="btn btn-danger btn-sm"
                  onClick={() => deleteFavorite.mutate(f.id)}
                  disabled={deleteFavorite.isPending}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
