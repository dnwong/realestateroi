/**
 * @fileoverview Saved search and favorites types
 */

/**
 * @typedef {Object} SavedSearch
 * @property {string} id - Unique saved search identifier
 * @property {string} userId - Owner user ID
 * @property {string} name - User-defined name for the search
 * @property {import('./property').SearchQuery} query - The saved search parameters
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} FavoriteProperty
 * @property {string} id - Unique favorite identifier
 * @property {string} userId - Owner user ID
 * @property {string} propertyId - The favorited property ID
 * @property {import('./property').PropertyListing} propertyData - Snapshot of property data at time of favoriting
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} CreateSavedSearchRequest
 * @property {string} name - Name for the saved search
 * @property {import('./property').SearchQuery} query - Search parameters to save
 */

/**
 * @typedef {Object} AddFavoriteRequest
 * @property {string} propertyId - Property ID to favorite
 * @property {import('./property').PropertyListing} propertyData - Property data snapshot
 */

module.exports = {};
