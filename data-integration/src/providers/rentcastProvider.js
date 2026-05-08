'use strict';

const axios = require('axios');
const { withRetry } = require('../utils/retry');
const { createProviderError } = require('./interfaces/IPropertyProvider');

const PROVIDER_NAME = 'rentcast';
const BASE_URL = 'https://api.rentcast.io/v1';
const TIMEOUT_MS = 10000;

/**
 * Maps Rentcast HTTP error status to ProviderError.
 * @param {import('axios').AxiosError} err
 * @returns {Error}
 */
function mapAxiosError(err) {
  const status = err.response?.status;
  if (status === 429) return createProviderError(PROVIDER_NAME, 'RATE_LIMIT', 'Rate limit exceeded', false, status);
  if (status === 401 || status === 403) return createProviderError(PROVIDER_NAME, 'AUTH_FAILURE', 'Authentication failed', false, status);
  if (status >= 500) return createProviderError(PROVIDER_NAME, 'UNKNOWN', 'Server error', true, status);
  if (err.code === 'ECONNABORTED') return createProviderError(PROVIDER_NAME, 'TIMEOUT', 'Request timed out', true, null);
  return createProviderError(PROVIDER_NAME, 'UNKNOWN', 'Request failed', false, status || null);
}

/**
 * Searches for property listings via Rentcast API.
 * @param {import('@zillow-roi/types/src/property').SearchQuery} query
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
async function search(query, apiKey) {
  const params = {
    zipCode: query.type === 'zip' ? query.query : undefined,
    city: query.type === 'region' ? query.query : undefined,
    status: 'Active',
    limit: 100,
  };

  return withRetry(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/listings/sale`, {
        params,
        headers: { 'X-Api-Key': apiKey },
        timeout: TIMEOUT_MS,
      });
      return { provider: PROVIDER_NAME, listings: response.data, fetchedAt: new Date() };
    } catch (err) {
      throw mapAxiosError(err);
    }
  });
}

/**
 * Gets rental rate estimates from Rentcast.
 * @param {string} zipCode
 * @param {import('@zillow-roi/types/src/property').PropertyFilters} filters
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
async function getRentalEstimates(zipCode, filters, apiKey) {
  const params = {
    zipCode,
    bedrooms: filters.bedroomsMin,
    propertyType: filters.propertyType?.[0],
  };

  return withRetry(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/avm/rent/long-term`, {
        params,
        headers: { 'X-Api-Key': apiKey },
        timeout: TIMEOUT_MS,
      });
      return { provider: PROVIDER_NAME, estimates: [response.data], fetchedAt: new Date() };
    } catch (err) {
      throw mapAxiosError(err);
    }
  });
}

module.exports = { search, getRentalEstimates };
