'use strict';

/**
 * Normalizes a raw rental estimate from any provider into the standard RentalRate schema.
 * Applies BR-07 defaults for missing fields.
 *
 * @param {object} raw - Raw rental estimate from provider
 * @param {string} providerName
 * @param {string} zipCode
 * @returns {import('@zillow-roi/types/src/rental').RentalRate}
 */
function normalizeRentalEstimate(raw, providerName, zipCode) {
  const rent = toNumber(raw.rent || raw.rentEstimate || raw.price || 0);
  const low = toNumber(raw.rentRangeLow || raw.low || rent * 0.9);
  const high = toNumber(raw.rentRangeHigh || raw.high || rent * 1.1);

  return {
    zipCode: raw.zipCode || raw.zip || zipCode,
    bedrooms: toNumber(raw.bedrooms || raw.beds || 0),
    bathrooms: toNumber(raw.bathrooms || raw.baths || 0),
    sqft: toNumber(raw.squareFootage || raw.sqft || 0),
    propertyType: raw.propertyType || 'Unknown',
    estimatedMonthlyRent: rent,
    rentRangeMin: Math.min(low, rent),
    rentRangeMax: Math.max(high, rent),
    dataSource: providerName,
  };
}

/**
 * Aggregates rental estimates from multiple sources using weighted average (BR-06).
 *
 * @param {Array<{estimate: import('@zillow-roi/types/src/rental').RentalRate, weight: number}>} weightedEstimates
 * @param {string} zipCode
 * @returns {import('@zillow-roi/types/src/rental').RentalRate}
 */
function aggregateRentalEstimates(weightedEstimates, zipCode) {
  if (weightedEstimates.length === 0) return null;
  if (weightedEstimates.length === 1) return weightedEstimates[0].estimate;

  const totalWeight = weightedEstimates.reduce((sum, { weight }) => sum + weight, 0);
  const weightedRent = weightedEstimates.reduce(
    (sum, { estimate, weight }) => sum + estimate.estimatedMonthlyRent * weight,
    0
  );

  const allRents = weightedEstimates.map(({ estimate }) => estimate.estimatedMonthlyRent);
  const allMins = weightedEstimates.map(({ estimate }) => estimate.rentRangeMin);
  const allMaxes = weightedEstimates.map(({ estimate }) => estimate.rentRangeMax);

  return {
    zipCode,
    bedrooms: weightedEstimates[0].estimate.bedrooms,
    bathrooms: weightedEstimates[0].estimate.bathrooms,
    sqft: weightedEstimates[0].estimate.sqft,
    propertyType: weightedEstimates[0].estimate.propertyType,
    estimatedMonthlyRent: Math.round(weightedRent / totalWeight),
    rentRangeMin: Math.min(...allMins),
    rentRangeMax: Math.max(...allMaxes),
    dataSource: weightedEstimates.map(({ estimate }) => estimate.dataSource).join('+'),
  };
}

function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

module.exports = { normalizeRentalEstimate, aggregateRentalEstimates };
