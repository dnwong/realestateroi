'use strict';

const Redis = require('ioredis');
const config = require('../config');

let client = null;

/**
 * Returns the shared Redis client instance (lazy-initialized).
 * @returns {Redis}
 */
function getClient() {
  if (!client) {
    client = new Redis(config.redis.url, {
      password: config.redis.password,
      tls: config.redis.url.startsWith('rediss://') ? {} : undefined,
      retryStrategy: (times) => Math.min(times * 200, 5000),
      lazyConnect: false,
    });
    client.on('error', (err) => {
      // Log error without exposing connection details
      console.error(JSON.stringify({ level: 'error', message: 'Redis client error', code: err.code }));
    });
  }
  return client;
}

/**
 * Builds a deterministic, human-readable cache key.
 * @param {string} namespace
 * @param {string} identifier
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
function buildKey(namespace, identifier, params = {}) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] != null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join(',');
  return sorted ? `${namespace}:${identifier}:${sorted}` : `${namespace}:${identifier}`;
}

/**
 * Gets a cached value. Returns null on miss or Redis error.
 * @template T
 * @param {string} key
 * @returns {Promise<T|null>}
 */
async function get(key) {
  try {
    const raw = await getClient().get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(JSON.stringify({ level: 'warn', message: 'Cache get failed', key, code: err.code }));
    return null;
  }
}

/**
 * Sets a cached value with TTL. Fire-and-forget — errors are logged but not thrown.
 * @template T
 * @param {string} key
 * @param {T} value
 * @param {number} ttlSeconds
 * @returns {void}
 */
function set(key, value, ttlSeconds) {
  setImmediate(async () => {
    try {
      await getClient().set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      console.error(JSON.stringify({ level: 'warn', message: 'Cache set failed', key, code: err.code }));
    }
  });
}

/**
 * Deletes a cache entry.
 * @param {string} key
 * @returns {Promise<void>}
 */
async function del(key) {
  try {
    await getClient().del(key);
  } catch (err) {
    console.error(JSON.stringify({ level: 'warn', message: 'Cache delete failed', key, code: err.code }));
  }
}

module.exports = { get, set, del, buildKey, getClient };
