'use strict';

const express = require('express');
const joi = require('joi');
const authService = require('../services/authService');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const logger = require('../logger');

const router = express.Router();

const registerSchema = joi.object({
  email: joi.string().email().max(255).required(),
  password: joi.string().min(8).max(128).required(),
});

const loginSchema = joi.object({
  email: joi.string().email().max(255).required(),
  password: joi.string().min(1).max(128).required(),
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.register(req.validated.email, req.validated.password);
    logger.info('User registered', { requestId: req.requestId });
    res.status(201).json({ success: true, data: { user: { id: user.id, email: user.email } } });
  } catch (err) {
    if (err.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await authService.login(req.validated.email, req.validated.password);
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.loginAt = new Date().toISOString();
    logger.info('User logged in', { requestId: req.requestId });
    res.json({ success: true, data: { user: { id: user.id, email: user.email } } });
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (err.code === 'ACCOUNT_LOCKED') {
      return res.status(429).json({ success: false, error: 'Too many failed attempts. Please try again later.' });
    }
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: { id: req.session.userId, email: req.session.email } } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
