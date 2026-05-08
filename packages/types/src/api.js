/**
 * @fileoverview API request and response envelope types
 */

/**
 * @typedef {Object} ApiSuccessResponse
 * @property {boolean} success - Always true for success responses
 * @property {*} data - Response payload
 * @property {string} [message] - Optional success message
 */

/**
 * @typedef {Object} ApiErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} error - Human-readable error message (generic in production)
 * @property {string} [code] - Machine-readable error code
 */

/**
 * @typedef {Object} SearchResponse
 * @property {boolean} success
 * @property {import('./roi').PropertyResult[]} data - Ranked property results
 * @property {number} total - Total number of results
 * @property {boolean} [usingFallback] - True if Zillow scraper fallback was used
 */

/**
 * @typedef {Object} ROICalculateRequest
 * @property {import('./roi').PropertyResult[]} properties - Properties to recalculate
 * @property {import('./roi').ROIConfig} roiConfig - New ROI configuration
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} [page] - Page number (1-indexed), default 1
 * @property {number} [pageSize] - Results per page, default 20, max 100
 */

module.exports = {};
