'use strict';

/**
 * Structured JSON logger. Never logs PII, passwords, tokens, or API keys.
 * Log format: { timestamp, level, requestId, message, ...meta }
 */

function log(level, message, meta = {}) {
  // Strip any accidentally passed sensitive fields
  const { password, token, apiKey, secret, authorization, ...safeMeta } = meta;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...safeMeta,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, errorOrMeta, meta) => {
    const errMeta = errorOrMeta instanceof Error
      ? { errorMessage: errorOrMeta.message, errorName: errorOrMeta.name }
      : errorOrMeta || {};
    log('error', message, { ...errMeta, ...(meta || {}) });
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') log('debug', message, meta);
  },
};
