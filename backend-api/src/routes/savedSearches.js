'use strict';

const express = require('express');
const joi = require('joi');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const logger = require('../logger');

const router = express.Router();

// All saved search and favorites routes require authentication
router.use(requireAuth);

const createSavedSearchSchema = joi.object({
  name: joi.string().min(1).max(255).required(),
  query: joi.object({
    query: joi.string().required(),
    type: joi.string().valid('zip', 'region').required(),
    filters: joi.object().optional(),
  }).required(),
});

const addFavoriteSchema = joi.object({
  propertyId: joi.string().min(1).max(255).required(),
  propertyData: joi.object().required(),
});

// --- Saved Searches ---

// GET /api/saved-searches
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, query, created_at, updated_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

// POST /api/saved-searches
router.post('/', validate(createSavedSearchSchema), async (req, res, next) => {
  try {
    // BR-SAVED-02: max 50 saved searches
    const count = await db.query('SELECT COUNT(*) FROM saved_searches WHERE user_id = $1', [req.session.userId]);
    if (parseInt(count.rows[0].count) >= 50) {
      return res.status(422).json({ success: false, error: 'Maximum saved searches limit (50) reached' });
    }
    const result = await db.query(
      'INSERT INTO saved_searches (user_id, name, query) VALUES ($1, $2, $3) RETURNING id, name, query, created_at',
      [req.session.userId, req.validated.name, JSON.stringify(req.validated.query)]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/saved-searches/:id
router.delete('/:id', async (req, res, next) => {
  try {
    // BR-SAVED-01: ownership check — return 404 to prevent enumeration
    const result = await db.query(
      'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.session.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

// --- Favorites ---

// GET /api/favorites
router.get('/favorites', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, property_id, property_data, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

// POST /api/favorites
router.post('/favorites', validate(addFavoriteSchema), async (req, res, next) => {
  try {
    // BR-SAVED-02: max 200 favorites
    const count = await db.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [req.session.userId]);
    if (parseInt(count.rows[0].count) >= 200) {
      return res.status(422).json({ success: false, error: 'Maximum favorites limit (200) reached' });
    }
    const result = await db.query(
      'INSERT INTO favorites (user_id, property_id, property_data) VALUES ($1, $2, $3) ON CONFLICT (user_id, property_id) DO NOTHING RETURNING id, property_id, created_at',
      [req.session.userId, req.validated.propertyId, JSON.stringify(req.validated.propertyData)]
    );
    if (result.rowCount === 0) {
      return res.status(200).json({ success: true, message: 'Already favorited' });
    }
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/favorites/:id
router.delete('/favorites/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.session.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
