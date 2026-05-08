'use strict';

const axios = require('axios');
const { withRetry } = require('../utils/retry');
const { createProviderError } = require('./interfaces/IPropertyProvider');
const config = require('../config');

const TIMEOUT_MS = 10000;

const PROVIDER_CONFIGS = {
  teleport: {
    name: 'teleport',
    baseUrl: 'https://api.teleport.org/api',
    requiresKey: false,
  },
  numbeo: {
    name: 'numbeo',
    baseUrl: 'https://www.numbeo.com/api',
    requiresKey: true,
  },
};

function mapAxiosError(providerName, err) {
  const status = err.response?.status;
  if (status === 429) return createProviderError(providerName, 'RATE_LIMIT', 'Rate limit exceeded', false, status);
  if (status === 401 || status === 403) return createProviderError(providerName, 'AUTH_FAILURE', 'Authentication failed', false, status);
  if (status >= 500) return createProviderError(providerName, 'UNKNOWN', 'Server error', true, status);
  if (err.code === 'ECONNABORTED') return createProviderError(providerName, 'TIMEOUT', 'Request timed out', true, null);
  return createProviderError(providerName, 'UNKNOWN', 'Request failed', false, status || null);
}

/**
 * Fetches cost-of-living data for a location.
 * @param {string} location - City or region name
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
async function getCostOfLiving(location, apiKey) {
  const providerName = config.providers.col.name;
  const providerConfig = PROVIDER_CONFIGS[providerName];

  if (!providerConfig) {
    throw createProviderError('col', 'UNKNOWN', `Unknown COL provider: ${providerName}`, false, null);
  }

  return withRetry(async () => {
    try {
      if (providerName === 'teleport') {
        // Teleport API: search for city slug, then fetch scores
        const searchResp = await axios.get(`${providerConfig.baseUrl}/cities/`, {
          params: { search: location, limit: 1 },
          timeout: TIMEOUT_MS,
        });
        const citySlug = searchResp.data?._embedded?.['city:search-results']?.[0]?._links?.['city:item']?.href;
        if (!citySlug) throw createProviderError(providerName, 'NOT_FOUND', 'City not found', false, null);

        const scoresResp = await axios.get(`${citySlug}scores/`, { timeout: TIMEOUT_MS });
        return { provider: providerName, location, indices: scoresResp.data, fetchedAt: new Date() };
      }

      if (providerName === 'numbeo') {
        const response = await axios.get(`${providerConfig.baseUrl}/city_prices`, {
          params: { api_key: apiKey, query: location },
          timeout: TIMEOUT_MS,
        });
        return { provider: providerName, location, indices: response.data, fetchedAt: new Date() };
      }
    } catch (err) {
      if (err.name === 'ProviderError') throw err;
      throw mapAxiosError(providerName, err);
    }
  });
}

module.exports = { getCostOfLiving };
