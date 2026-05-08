'use strict';

/**
 * @fileoverview IPropertyProvider interface documentation.
 *
 * All property data providers must implement this interface.
 * This enables the configurable provider pattern (BR-01).
 *
 * @interface IPropertyProvider
 */

/**
 * @typedef {Object} IPropertyProvider
 *
 * @property {function(import('@zillow-roi/types/src/property').SearchQuery, string): Promise<import('../../../src/providers/types').RawPropertyApiResponse>} search
 * Search for property listings matching the given query.
 * Throws ProviderError on failure.
 *
 * @property {function(string, import('@zillow-roi/types/src/property').PropertyFilters, string): Promise<import('../../../src/providers/types').RawRentalApiResponse>} getRentalEstimates
 * Get rental rate estimates for a ZIP code and filters.
 * Throws ProviderError with code 'NOT_FOUND' if provider doesn't support rental data.
 */

/**
 * Creates a ProviderError.
 * @param {string} provider
 * @param {'RATE_LIMIT'|'TIMEOUT'|'AUTH_FAILURE'|'NOT_FOUND'|'PARSE_ERROR'|'UNKNOWN'} code
 * @param {string} message
 * @param {boolean} retryable
 * @param {number|null} [statusCode]
 * @returns {Error}
 */
function createProviderError(provider, code, message, retryable, statusCode = null) {
  const err = new Error(message);
  err.name = 'ProviderError';
  err.provider = provider;
  err.code = code;
  err.retryable = retryable;
  err.statusCode = statusCode;
  return err;
}

/**
 * Creates a DataUnavailableError.
 * @param {Error} primaryError
 * @param {Error|null} fallbackError
 * @returns {Error}
 */
function createDataUnavailableError(primaryError, fallbackError) {
  const err = new Error('All data providers failed. Data unavailable.');
  err.name = 'DataUnavailableError';
  err.primaryError = primaryError;
  err.fallbackError = fallbackError;
  return err;
}

module.exports = { createProviderError, createDataUnavailableError };
