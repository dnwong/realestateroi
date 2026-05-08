'use strict';

const cacheService = require('../cache/cacheService');
const { getActivePropertyProvider } = require('../providers/providerRegistry');
const zillowScraper = require('../providers/zillowScraperProvider');
const { normalizePropertyListing } = require('../normalizers/propertyNormalizer');
const { createDataUnavailableError } = require('../providers/interfaces/IPropertyProvider');

const TTL_PROPERTY = 86400; // 24 hours

/**
 * Applies PropertyFilters to a list of normalized listings.
 * @param {import('@zillow-roi/types/src/property').PropertyListing[]} listings
 * @param {import('@zillow-roi/types/src/property').PropertyFilters} filters
 * @returns {import('@zillow-roi/types/src/property').PropertyListing[]}
 */
function applyFilters(listings, filters = {}) {
  return listings.filter((l) => {
    if (filters.bedroomsMin != null && l.bedrooms < filters.bedroomsMin) return false;
    if (filters.bedroomsMax != null && l.bedrooms > filters.bedroomsMax) return false;
    if (filters.bathroomsMin != null && l.bathrooms < filters.bathroomsMin) return false;
    if (filters.sqftMin != null && l.sqft < filters.sqftMin) return false;
    if (filters.sqftMax != null && l.sqft > filters.sqftMax) return false;
    if (filters.priceMin != null && l.price < filters.priceMin) return false;
    if (filters.priceMax != null && l.price > filters.priceMax) return false;
    if (filters.hoaMax != null && l.hoaFee > filters.hoaMax) return false;
    if (filters.yearBuiltMin != null && l.yearBuilt > 0 && l.yearBuilt < filters.yearBuiltMin) return false;
    if (filters.yearBuiltMax != null && l.yearBuilt > 0 && l.yearBuilt > filters.yearBuiltMax) return false;
    if (filters.propertyType?.length && !filters.propertyType.includes(l.propertyType)) return false;
    return true;
  });
}

/**
 * Finds property listings for a search query.
 * Cache-first strategy with primary provider + Zillow scraper fallback.
 *
 * @param {import('@zillow-roi/types/src/property').SearchQuery} query
 * @returns {Promise<{listings: import('@zillow-roi/types/src/property').PropertyListing[], usingFallback: boolean}>}
 */
async function findBySearch(query) {
  const cacheKey = cacheService.buildKey('property:search', query.query, query.filters || {});

  // 1. Check cache
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  let listings = [];
  let usingFallback = false;
  let primaryError = null;

  // 2. Try primary provider
  const provider = getActivePropertyProvider();
  try {
    const raw = await provider.search(query, process.env.PROPERTY_API_KEY);
    listings = (raw.listings || []).map((l) => normalizePropertyListing(l, raw.provider, 'api'));
  } catch (err) {
    primaryError = err;
    console.error(JSON.stringify({ level: 'warn', message: 'Primary property provider failed, trying scraper', code: err.code }));

    // 3. Fallback to Zillow scraper
    try {
      const scraped = await zillowScraper.scrape(query);
      listings = (scraped.listings || []).map((l) => normalizePropertyListing(l, 'zillow-scraper', 'scraper'));
      usingFallback = true;
    } catch (fallbackErr) {
      throw createDataUnavailableError(primaryError, fallbackErr);
    }
  }

  // 4. Apply filters
  const filtered = applyFilters(listings, query.filters);
  const result = { listings: filtered, usingFallback };

  // 5. Cache result (fire-and-forget)
  cacheService.set(cacheKey, result, TTL_PROPERTY);

  return result;
}

module.exports = { findBySearch };
