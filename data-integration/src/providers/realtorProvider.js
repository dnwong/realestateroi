'use strict';

const axios = require('axios');
const { withRetry } = require('../utils/retry');
const { createProviderError } = require('./interfaces/IPropertyProvider');

const PROVIDER_NAME = 'realtor';
const BASE_URL = 'https://realtor-com4.p.rapidapi.com';
const TIMEOUT_MS = 10000;

function mapAxiosError(err) {
  const status = err.response?.status;
  if (status === 429) return createProviderError(PROVIDER_NAME, 'RATE_LIMIT', 'Rate limit exceeded', false, status);
  if (status === 401 || status === 403) return createProviderError(PROVIDER_NAME, 'AUTH_FAILURE', 'Authentication failed', false, status);
  if (status >= 500) return createProviderError(PROVIDER_NAME, 'UNKNOWN', 'Server error', true, status);
  if (err.code === 'ECONNABORTED') return createProviderError(PROVIDER_NAME, 'TIMEOUT', 'Request timed out', true, null);
  return createProviderError(PROVIDER_NAME, 'UNKNOWN', 'Request failed', false, status || null);
}

/**
 * @param {import('@zillow-roi/types/src/property').SearchQuery} query
 * @param {string} apiKey
 */
async function search(query, apiKey) {
  const params = {
    postal_code: query.type === 'zip' ? query.query : undefined,
    city: query.type === 'region' ? query.query : undefined,
    status: 'for_sale',
    limit: 100,
  };

  return withRetry(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/properties/search-by-zipcode`, {
        params,
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'realtor-com4.p.rapidapi.com',
        },
        timeout: TIMEOUT_MS,
      });
      return { provider: PROVIDER_NAME, listings: response.data?.data?.home_search?.results || [], fetchedAt: new Date() };
    } catch (err) {
      throw mapAxiosError(err);
    }
  });
}

/**
 * Realtor.com API does not provide rental estimates.
 */
async function getRentalEstimates() {
  throw createProviderError(PROVIDER_NAME, 'NOT_FOUND', 'Realtor.com provider does not support rental estimates', false, null);
}

module.exports = { search, getRentalEstimates };
