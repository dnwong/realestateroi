'use strict';

const express = require('express');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const { pool } = require('./db');
const securityHeaders = require('./middleware/securityHeaders');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./logger');

const authRouter = require('./routes/auth');
const searchRouter = require('./routes/search');
const roiRouter = require('./routes/roi');
const savedSearchesRouter = require('./routes/savedSearches');

const PgSession = connectPgSimple(session);

const app = express();

// Trust proxy (required for rate limiting behind load balancer/ingress)
app.set('trust proxy', 1);

// Security headers (SECURITY-04)
app.use(securityHeaders);

// Request ID (SECURITY-03)
app.use(requestId);

// Body parser — 10kb limit (SECURITY-05)
app.use(express.json({ limit: '10kb' }));

// General rate limiter (SECURITY-11)
app.use('/api', generalLimiter);

// Session middleware (SECURITY-12)
app.use(session({
  store: new PgSession({ pool, tableName: 'sessions', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('Request', {
      requestId: req.requestId,
      method: req.method,
      path: req.path, // Never log query params (may contain sensitive data)
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/roi', roiRouter);
app.use('/api/saved-searches', savedSearchesRouter);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Global error handler — must be last (SECURITY-15)
app.use(errorHandler);

module.exports = app;
