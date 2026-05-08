'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Log without exposing connection string
  console.error(JSON.stringify({ level: 'error', message: 'PostgreSQL pool error', code: err.code }));
});

/**
 * Executes a parameterized query. Never use string concatenation for user input.
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {any[]} [params] - Query parameters
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(JSON.stringify({ level: 'debug', message: 'DB query', durationMs: duration, rows: result.rowCount }));
  return result;
}

async function getClient() {
  return pool.connect();
}

async function end() {
  await pool.end();
}

module.exports = { query, getClient, end, pool };
