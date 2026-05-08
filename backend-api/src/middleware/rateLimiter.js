'use strict';

const rateLimit = require('express-rate-limit');

/** General API rate limiter: 100 requests per minute per IP */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

/** Login rate limiter: 5 requests per 15 minutes per IP (SECURITY-12) */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

/** Search rate limiter: 30 requests per minute per IP */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many search requests, please try again later.' },
});

module.exports = { generalLimiter, loginLimiter, searchLimiter };
