'use strict';

jest.mock('../src/db');
const db = require('../src/db');
const authService = require('../src/services/authService');

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('creates a new user when email is not taken', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // email check
        .mockResolvedValueOnce({ rows: [{ id: 'uuid-1', email: 'test@example.com', created_at: new Date() }] }); // insert

      const user = await authService.register('test@example.com', 'password123');
      expect(user.email).toBe('test@example.com');
    });

    it('throws 409 when email already exists', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }] });
      await expect(authService.register('taken@example.com', 'password123'))
        .rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' });
    });
  });

  describe('login', () => {
    it('throws 401 for unknown email', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(authService.login('unknown@example.com', 'password'))
        .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
    });

    it('throws 401 for wrong password', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('correctpassword', 10);
      db.query.mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'test@example.com', password: hash }] });
      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
