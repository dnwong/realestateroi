'use strict';

const express = require('express');
const joi = require('joi');
const searchService = require('../services/searchService');
const validate = require('../middleware/validate');
const { searchLimiter } = require('../middleware/rateLimiter');
const logger = require('../logger');

const router = express.Router();

const filtersSchema = joi.object({
  bedroomsMin: joi.number().integer().min(0),
  bedroomsMax: joi.number().integer().min(0),
  bathroomsMin: joi.number().min(0),
  sqftMin: joi.number().min(0),
  sqftMax: joi.number().min(0),
  propertyType: joi.array().items(joi.string().valid('SFH', 'Condo', 'Multi-Family', 'Townhouse')),
  yearBuiltMin: joi.number().integer().min(1800),
  yearBuiltMax: joi.number().integer().max(2100),
  priceMin: joi.number().min(0),
  priceMax: joi.number().min(0),
  hoaMax: joi.number().min(0),
  lotSizeMin: joi.number().min(0),
}).and('bedroomsMin', 'bedroomsMax').when(
  joi.object({ bedroomsMin: joi.exist(), bedroomsMax: joi.exist() }),
  { then: joi.object({ bedroomsMin: joi.number().max(joi.ref('bedroomsMax')) }) }
);

const searchSchema = joi.object({
  query: joi.string().min(1).max(100).required(),
  type: joi.string().valid('zip', 'region').required(),
  bedroomsMin: joi.number().integer().min(0),
  bedroomsMax: joi.number().integer().min(0),
  bathroomsMin: joi.number().min(0),
  sqftMin: joi.number().min(0),
  sqftMax: joi.number().min(0),
  priceMin: joi.number().min(0),
  priceMax: joi.number().min(0),
  hoaMax: joi.number().min(0),
  propertyType: joi.alternatives().try(
    joi.string().valid('SFH', 'Condo', 'Multi-Family', 'Townhouse'),
    joi.array().items(joi.string().valid('SFH', 'Condo', 'Multi-Family', 'Townhouse'))
  ),
  vacancyRate: joi.number().min(0).max(1),
  maintenanceRate: joi.number().min(0).max(1),
  enableVacancy: joi.boolean(),
  enablePropertyTax: joi.boolean(),
  enableMaintenance: joi.boolean(),
  enableCostOfLiving: joi.boolean(),
});

// GET /api/search
router.get('/', searchLimiter, validate(searchSchema, 'query'), async (req, res, next) => {
  try {
    const { query, type, vacancyRate, maintenanceRate, enableVacancy, enablePropertyTax, enableMaintenance, enableCostOfLiving, ...filterParams } = req.validated;

    const searchQuery = {
      query,
      type,
      filters: {
        bedroomsMin: filterParams.bedroomsMin,
        bedroomsMax: filterParams.bedroomsMax,
        bathroomsMin: filterParams.bathroomsMin,
        sqftMin: filterParams.sqftMin,
        sqftMax: filterParams.sqftMax,
        priceMin: filterParams.priceMin,
        priceMax: filterParams.priceMax,
        hoaMax: filterParams.hoaMax,
        propertyType: filterParams.propertyType
          ? (Array.isArray(filterParams.propertyType) ? filterParams.propertyType : [filterParams.propertyType])
          : undefined,
      },
    };

    const roiConfig = { vacancyRate, maintenanceRate, enableVacancy, enablePropertyTax, enableMaintenance, enableCostOfLiving };

    const { results, usingFallback } = await searchService.search(searchQuery, roiConfig, req.requestId);

    res.json({
      success: true,
      data: results,
      total: results.length,
      usingFallback,
      disclaimer: usingFallback
        ? 'Some results were retrieved via web scraping and may be less accurate. Scraping Zillow may violate their Terms of Service.'
        : undefined,
    });
  } catch (err) {
    if (err.name === 'DataUnavailableError') {
      logger.warn('Data unavailable for search', { requestId: req.requestId });
      return res.status(502).json({ success: false, error: 'Property data is temporarily unavailable. Please try again.' });
    }
    next(err);
  }
});

module.exports = router;
