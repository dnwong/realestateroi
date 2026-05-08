/**
 * @fileoverview Property listing and search filter types
 */

/**
 * @typedef {Object} PropertyListing
 * @property {string} id - Unique property identifier
 * @property {string} address - Street address
 * @property {string} city - City name
 * @property {string} state - State abbreviation
 * @property {string} zipCode - ZIP code
 * @property {number} price - Listing price in USD
 * @property {number} bedrooms - Number of bedrooms
 * @property {number} bathrooms - Number of bathrooms
 * @property {number} sqft - Square footage
 * @property {string} propertyType - 'SFH' | 'Condo' | 'Multi-Family' | 'Townhouse'
 * @property {number} [yearBuilt] - Year the property was built
 * @property {number} [propertyTax] - Annual property tax in USD
 * @property {number} [hoaFee] - Monthly HOA fee in USD
 * @property {number} [lotSize] - Lot size in square feet
 * @property {number} [latitude] - Geographic latitude
 * @property {number} [longitude] - Geographic longitude
 * @property {string} listingUrl - URL to the original listing
 * @property {'api' | 'scraper'} dataSource - Source of the listing data
 */

/**
 * @typedef {Object} PropertyFilters
 * @property {number} [bedroomsMin] - Minimum number of bedrooms
 * @property {number} [bedroomsMax] - Maximum number of bedrooms
 * @property {number} [bathroomsMin] - Minimum number of bathrooms
 * @property {number} [sqftMin] - Minimum square footage
 * @property {number} [sqftMax] - Maximum square footage
 * @property {string[]} [propertyType] - Allowed property types
 * @property {number} [yearBuiltMin] - Minimum year built
 * @property {number} [yearBuiltMax] - Maximum year built
 * @property {number} [priceMin] - Minimum price in USD
 * @property {number} [priceMax] - Maximum price in USD
 * @property {number} [hoaMax] - Maximum monthly HOA fee
 * @property {number} [lotSizeMin] - Minimum lot size in sq ft
 */

/**
 * @typedef {Object} SearchQuery
 * @property {string} query - ZIP code or city/region name
 * @property {'zip' | 'region'} type - Type of search query
 * @property {PropertyFilters} [filters] - Optional property filters
 * @property {import('./roi').ROIConfig} [roiConfig] - Optional custom ROI config
 */

module.exports = {};
