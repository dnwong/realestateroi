'use strict';

const cacheService = require('../cache/cacheService');
const colApiProvider = require('../providers/costOfLivingApiProvider');
const { normalizeCOLData } = require('../normalizers/colNormalizer');
const config = require('../config');

const TTL_COL = 604800; // 7 days

/**
 * Finds cost-of-living data for a location.
 * Cache-first with 7-day TTL.
 *
 * @param {string} location - City or region name
 * @returns {Promise<import('@zillow-roi/types/src/rental').CostOfLiving>}
 */
async function findByLocation(location) {
  const cacheKey = cacheService.buildKey('col', location.toLowerCase().replace(/\s+/g, '-'));

  // 1. Check cache
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  // 2. Fetch from COL API provider
  const raw = await colApiProvider.getCostOfLiving(location, config.providers.col.apiKey);
  const col = normalizeCOLData(raw, location);

  // 3. Cache result (fire-and-forget)
  cacheService.set(cacheKey, col, TTL_COL);

  return col;
}

module.exports = { findByLocation };
