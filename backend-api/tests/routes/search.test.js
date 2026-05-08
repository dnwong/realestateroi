'use strict';

jest.mock('../../src/services/searchService');

const request = require('supertest');
const app = require('../../src/app');
const searchService = require('../../src/services/searchService');

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-32-chars-minimum-here';
  process.env.NODE_ENV = 'test';
});

const mockResults = [
  {
    property: { id: '1', address: '123 Main St', price: 400000, bedrooms: 3, bathrooms: 2, sqft: 1800, propertyType: 'SFH', dataSource: 'api' },
    rentalRate: { estimatedMonthlyRent: 2200, bedrooms: 3 },
    roiScore: 0.045,
    roiBreakdown: { capRate: 0.041 },
    dataSource: 'api',
  },
];

describe('GET /api/search', () => {
  it('returns 200 with results for valid ZIP search', async () => {
    searchService.search.mockResolvedValue({ results: mockResults, usingFallback: false });
    const res = await request(app).get('/api/search?query=78701&type=zip');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it('returns 400 for missing query param', async () => {
    const res = await request(app).get('/api/search?type=zip');
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const res = await request(app).get('/api/search?query=78701&type=invalid');
    expect(res.status).toBe(400);
  });

  it('includes fallback disclaimer when scraper was used', async () => {
    searchService.search.mockResolvedValue({ results: mockResults, usingFallback: true });
    const res = await request(app).get('/api/search?query=78701&type=zip');
    expect(res.body.usingFallback).toBe(true);
    expect(res.body.disclaimer).toBeDefined();
  });

  it('returns 502 when data is unavailable', async () => {
    const err = new Error('All providers failed');
    err.name = 'DataUnavailableError';
    searchService.search.mockRejectedValue(err);
    const res = await request(app).get('/api/search?query=78701&type=zip');
    expect(res.status).toBe(502);
  });
});
