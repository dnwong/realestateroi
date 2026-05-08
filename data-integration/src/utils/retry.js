'use strict';

/**
 * Executes an async function with exponential backoff retry.
 * Only retries if the error has `retryable: true`.
 *
 * @param {() => Promise<any>} fn - Async function to execute
 * @param {number} [maxRetries=2] - Maximum number of retry attempts
 * @param {number} [baseDelayMs=500] - Base delay in milliseconds
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxRetries = 2, baseDelayMs = 500) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!err.retryable || attempt === maxRetries) {
        throw err;
      }
      await sleep(baseDelayMs * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { withRetry, sleep };
