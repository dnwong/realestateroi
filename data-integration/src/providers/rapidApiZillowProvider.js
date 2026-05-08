'use strict';

const axios = require('axios');
const { withRetry } = require('../utils/retry');
const { createProviderError } = require('./interfaces/IPropertyProvider');

const PROVIDER_NAME = 'rapidapi-zillow';
const BASE_URL = 'https://zillow56.p.rapidapi.com';
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
  return withRetry(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: { location: query.query, status_type: 'ForSale', home_type: 'Houses' },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'zillow56.p.rapidapi.com',
        },
        timeout: TIMEOUT_MS,
      });
      return { provider: PROVIDER_NAME, listings: response.data?.results || [], fetchedAt: new Date() };
    } catch (err) {
      throw mapAxiosError(err);
    }
  });
}

/**
 * RapidAPI Zillow wrapper does not provide rental estimates.
 */
async function getRentalEstimates() {
  throw createProviderError(PROVIDER_NAME, 'NOT_FOUND', 'RapidAPI Zillow provider does not support rental estimates', false, null);
}

module.exports = { search, getRentalEstimates };
