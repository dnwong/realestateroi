'use strict';

const express = require('express');
const joi = require('joi');
const roiService = require('../services/roiService');
const validate = require('../middleware/validate');

const router = express.Router();

const roiConfigSchema = joi.object({
  vacancyRate: joi.number().min(0).max(1),
  maintenanceRate: joi.number().min(0).max(1),
  enableVacancy: joi.boolean(),
  enablePropertyTax: joi.boolean(),
  enableMaintenance: joi.boolean(),
  enableCostOfLiving: joi.boolean(),
});

const calculateSchema = joi.object({
  properties: joi.array().items(joi.object()).min(1).max(200).required(),
  roiConfig: roiConfigSchema.required(),
});

// GET /api/roi/config
router.get('/config', (req, res) => {
  res.json({ success: true, data: roiService.DEFAULT_CONFIG });
});

// POST /api/roi/calculate
router.post('/calculate', validate(calculateSchema), (req, res) => {
  const { properties, roiConfig } = req.validated;

  const updated = properties.map((item) => {
    const result = roiService.calculate(
      item.property,
      item.rentalRate,
      item.costOfLiving,
      roiConfig
    );
    return { ...item, roiScore: result.roiScore, roiBreakdown: result.breakdown };
  });

  // Re-sort by ROI score descending
  updated.sort((a, b) => b.roiScore - a.roiScore || a.property.price - b.property.price);

  res.json({ success: true, data: updated });
});

module.exports = router;
