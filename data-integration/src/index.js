'use strict';

/**
 * @fileoverview Public API for the data-integration package.
 * Consumed by backend-api.
 */

const propertyRepository = require('./repositories/propertyRepository');
const rentalRepository = require('./repositories/rentalRepository');
const costOfLivingRepository = require('./repositories/costOfLivingRepository');
const cacheService = require('./cache/cacheService');

module.exports = {
  propertyRepository,
  rentalRepository,
  costOfLivingRepository,
  cacheService,
};
