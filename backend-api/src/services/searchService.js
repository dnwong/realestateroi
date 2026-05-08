'use strict';

const { propertyRepository, rentalRepository, costOfLivingRepository } = require('@zillow-roi/data-integration');
const roiService = require('./roiService');
const logger = require('../logger');

/**
 * Orchestrates the full property search flow.
 * Fetches properties, rental rates, COL data, calculates ROI, and returns ranked results.
 *
 * @param {import('@zillow-roi/types/src/property').SearchQuery} query
 * @param {import('@zillow-roi/types/src/roi').ROIConfig} [roiConfig]
 * @param {string} requestId
 * @returns {Promise<{results: import('@zillow-roi/types/src/roi').PropertyResult[], usingFallback: boolean}>}
 */
async function search(query, roiConfig, requestId) {
  const start = Date.now();

  // Parallel fetch: properties + COL data
  const [propertyResult, colData] = await Promise.all([
    propertyRepository.findBySearch(query),
    costOfLivingRepository.findByLocation(query.query).catch((err) => {
      logger.warn('COL data unavailable, proceeding without adjustment', { requestId, code: err.code });
      return null;
    }),
  ]);

  const { listings, usingFallback } = propertyResult;

  // Fetch rental data once per unique ZIP code (cache-friendly)
  const rentalCache = new Map();
  async function getRentalForZip(zipCode) {
    if (!rentalCache.has(zipCode)) {
      const rates = await rentalRepository.findByArea(zipCode, query.filters || {}).catch(() => []);
      rentalCache.set(zipCode, rates);
    }
    return rentalCache.get(zipCode);
  }

  // Calculate ROI for each property
  const results = await Promise.all(
    listings.map(async (property) => {
      const rentalRates = await getRentalForZip(property.zipCode);

      // Match rental rate by bedrooms (closest match)
      const matchedRental = rentalRates.find((r) => r.bedrooms === property.bedrooms)
        || rentalRates.find((r) => Math.abs(r.bedrooms - property.bedrooms) <= 1)
        || rentalRates[0]
        || null;

      const roiResult = roiService.calculate(property, matchedRental, colData, roiConfig);

      return {
        property,
        rentalRate: matchedRental,
        costOfLiving: colData,
        roiScore: roiResult.roiScore,
        roiBreakdown: roiResult.breakdown,
        dataSource: property.dataSource,
        usingFallbackData: usingFallback,
        missingRentalData: !matchedRental,
        missingCOLData: !colData,
      };
    })
  );

  // Sort by ROI score descending, then price ascending for ties (BR-SEARCH-02)
  results.sort((a, b) => b.roiScore - a.roiScore || a.property.price - b.property.price);

  logger.info('Search completed', { requestId, resultCount: results.length, durationMs: Date.now() - start, usingFallback });

  return { results, usingFallback };
}

module.exports = { search };
