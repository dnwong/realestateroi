'use strict';

const cacheService = require('../cache/cacheService');
const rentcastProvider = require('../providers/rentcastProvider');
const { getActivePropertyProvider } = require('../providers/providerRegistry');
const { normalizeRentalEstimate, aggregateRentalEstimates } = require('../normalizers/rentalNormalizer');
const config = require('../config');

const TTL_RENTAL = 86400; // 24 hours

/**
 * Finds rental rate estimates for a ZIP code and property filters.
 * Aggregates from multiple sources using weighted average (BR-06).
 *
 * @param {string} zipCode
 * @param {import('@zillow-roi/types/src/property').PropertyFilters} filters
 * @returns {Promise<import('@zillow-roi/types/src/rental').RentalRate[]>}
 */
async function findByArea(zipCode, filters = {}) {
  const cacheKey = cacheService.buildKey('rental', zipCode, {
    beds: filters.bedroomsMin,
    type: filters.propertyType?.[0],
  });

  // 1. Check cache
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // 2. Fetch from all sources in parallel (partial failure tolerant)
  const fetchTasks = [
    rentcastProvider.getRentalEstimates(zipCode, filters, process.env.RENTCAST_API_KEY)
      .then((raw) => ({ raw, weight: config.providers.rentcast.reliabilityScore }))
      .catch((err) => {
        console.error(JSON.stringify({ level: 'warn', message: 'Rentcast rental fetch failed', code: err.code }));
        return null;
      }),
    getActivePropertyProvider().getRentalEstimates(zipCode, filters, process.env.PROPERTY_API_KEY)
      .then((raw) => ({ raw, weight: config.providers.property.reliabilityScore }))
      .catch(() => null), // Many property providers don't support rental — silently skip
  ];

  const results = (await Promise.all(fetchTasks)).filter(Boolean);

  if (results.length === 0) return [];

  // 3. Normalize each result
  const weightedEstimates = results.flatMap(({ raw, weight }) =>
    (raw.estimates || []).map((e) => ({
      estimate: normalizeRentalEstimate(e, raw.provider, zipCode),
      weight,
    }))
  );

  // 4. Group by bedrooms + propertyType and aggregate
  const groups = {};
  for (const we of weightedEstimates) {
    const groupKey = `${we.estimate.bedrooms}:${we.estimate.propertyType}`;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(we);
  }

  const aggregated = Object.values(groups).map((group) => aggregateRentalEstimates(group, zipCode));

  // 5. Cache result (fire-and-forget)
  cacheService.set(cacheKey, aggregated, TTL_RENTAL);

  return aggregated;
}

module.exports = { findByArea };
