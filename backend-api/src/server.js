'use strict';

// Load .env file for local development only — in Docker, env vars are injected directly
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (_) { /* dotenv optional in production */ }
}

const app = require('./app');
const { end: closeDb } = require('./db');
const logger = require('./logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
});

// Graceful shutdown
async function shutdown(signal) {
  logger.info('Shutdown signal received', { signal });
  server.close(async () => {
    logger.info('HTTP server closed');
    await closeDb();
    logger.info('Database pool closed');
    process.exit(0);
  });
  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Global unhandled rejection handler (SECURITY-15)
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

module.exports = server;
