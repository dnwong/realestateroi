'use strict';

const logger = require('../logger');

/**
 * Global error handler — must be registered as the last middleware (SECURITY-09, SECURITY-15).
 * Never exposes stack traces or internal details in production.
 */
// eslint-disable-next-line no-unused-vars
module.exports = function globalErrorHandler(err, req, res, next) {
  logger.error('Unhandled error', err, { requestId: req.requestId, path: req.path, method: req.method });

  // Never send stack traces or internal error details to clients
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
};
