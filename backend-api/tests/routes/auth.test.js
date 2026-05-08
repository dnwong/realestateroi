'use strict';

jest.mock('../../src/db');
jest.mock('../../src/services/authService');

const request = require('supertest');
const app = require('../../src/app');
const authService = require('../../src/services/authService');

// Suppress session store errors in tests
beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-32-chars-minimum-here';
  process.env.NODE_ENV = 'test';
});

describe('POST /api/auth/register', () => {
  it('returns 201 on successful registration', async () => {
    authService.register.mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    const err = Object.assign(new Error('Email taken'), { statusCode: 409, code: 'EMAIL_EXISTS' });
    authService.register.mockRejectedValue(err);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'taken@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 on successful login', async () => {
    authService.login.mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('returns 401 for invalid credentials', async () => {
    const err = Object.assign(new Error('Invalid'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    authService.login.mockRejectedValue(err);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
