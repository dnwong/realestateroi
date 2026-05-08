/**
 * @fileoverview User and authentication types
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email address
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email - User email address
 * @property {string} password - User password (plaintext, transmitted over TLS)
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} email - User email address
 * @property {string} password - User password (min 8 chars)
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User} user - Authenticated user (no password hash)
 * @property {string} message - Success message
 */

module.exports = {};
