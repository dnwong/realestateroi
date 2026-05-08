'use strict';

const bcrypt = require('bcryptjs');
const db = require('../db');
const logger = require('../logger');

const BCRYPT_ROUNDS = 12;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-process login attempt tracker (BR-AUTH-02)
const loginAttempts = new Map();

function checkLockout(email) {
  const record = loginAttempts.get(email);
  if (record?.lockedUntil && record.lockedUntil > new Date()) {
    const err = new Error('Account temporarily locked');
    err.statusCode = 429;
    err.code = 'ACCOUNT_LOCKED';
    throw err;
  }
}

function recordFailedAttempt(email) {
  const record = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    logger.warn('Account locked due to failed attempts', { email: '[redacted]' });
  }
  loginAttempts.set(email, record);
}

function resetAttempts(email) {
  loginAttempts.delete(email);
}

/**
 * Registers a new user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{id: string, email: string, createdAt: Date}>}
 */
async function register(email, password) {
  // Check for existing user
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const result = await db.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, hash]
  );
  return result.rows[0];
}

/**
 * Authenticates a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{id: string, email: string}>}
 */
async function login(email, password) {
  checkLockout(email);

  const result = await db.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    recordFailedAttempt(email);
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    recordFailedAttempt(email);
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  resetAttempts(email);
  return { id: user.id, email: user.email };
}

module.exports = { register, login };
