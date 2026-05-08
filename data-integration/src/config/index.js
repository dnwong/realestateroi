'use strict';

const joi = require('joi');

const schema = joi.object({
  REDIS_URL: joi.string().uri().required(),
  REDIS_PASSWORD: joi.string().allow('').default(''),
  PROPERTY_PROVIDER: joi.string().valid('rentcast', 'realtor', 'rapidapi-zillow').required(),
  PROPERTY_API_KEY: joi.string().required(),
  RENTCAST_API_KEY: joi.string().required(),
  RENTCAST_RELIABILITY_SCORE: joi.number().min(0).max(1).default(0.8),
  PROPERTY_API_RELIABILITY_SCORE: joi.number().min(0).max(1).default(0.6),
  COL_PROVIDER: joi.string().valid('numbeo', 'teleport').required(),
  COL_API_KEY: joi.string().allow('').default(''),
  SCRAPER_REQUEST_DELAY_MS: joi.number().integer().min(0).default(2000),
}).unknown(true);

const { error, value } = schema.validate(process.env);

if (error) {
  // Never log the actual values — only the missing/invalid key names
  const keys = error.details.map(d => d.context.key).join(', ');
  throw new Error(`Data-integration configuration error. Missing or invalid env vars: ${keys}`);
}

module.exports = {
  redis: {
    url: value.REDIS_URL,
    password: value.REDIS_PASSWORD || undefined,
  },
  providers: {
    property: {
      name: value.PROPERTY_PROVIDER,
      apiKey: value.PROPERTY_API_KEY,
      reliabilityScore: value.PROPERTY_API_RELIABILITY_SCORE,
    },
    rentcast: {
      apiKey: value.RENTCAST_API_KEY,
      reliabilityScore: value.RENTCAST_RELIABILITY_SCORE,
    },
    col: {
      name: value.COL_PROVIDER,
      apiKey: value.COL_API_KEY,
    },
  },
  scraper: {
    requestDelayMs: value.SCRAPER_REQUEST_DELAY_MS,
  },
};
