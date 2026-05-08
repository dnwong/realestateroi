'use strict';

const config = require('../config');
const rentcastProvider = require('./rentcastProvider');
const realtorProvider = require('./realtorProvider');
const rapidApiZillowProvider = require('./rapidApiZillowProvider');

const PROVIDERS = {
  rentcast: rentcastProvider,
  realtor: realtorProvider,
  'rapidapi-zillow': rapidApiZillowProvider,
};

const providerName = config.providers.property.name;
const activeProvider = PROVIDERS[providerName];

if (!activeProvider) {
  throw new Error(`Unknown PROPERTY_PROVIDER: "${providerName}". Valid options: ${Object.keys(PROVIDERS).join(', ')}`);
}

/**
 * Returns the active property data provider (configured via PROPERTY_PROVIDER env var).
 * @returns {import('./interfaces/IPropertyProvider').IPropertyProvider}
 */
function getActivePropertyProvider() {
  return activeProvider;
}

module.exports = { getActivePropertyProvider };
