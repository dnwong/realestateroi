'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Attaches a unique requestId to each request and response.
 * Included in all log entries for traceability (SECURITY-03).
 */
module.exports = function requestId(req, res, next) {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};
