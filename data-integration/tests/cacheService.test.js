'use strict';

jest.mock('ioredis');
const Redis = require('ioredis');

// Mock Redis instance
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();
Redis.mockImplementation(() => ({
  get: mockGet,
  set: mockSet,
  del: mockDel,
  on: jest.fn(),
  isConnected: () => true,
}));

const cacheService = require('../src/cache/cacheService');

describe('cacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildKey', () => {
    it('builds key without params', () => {
      expect(cacheService.buildKey('property:search', '78701')).toBe('property:search:78701');
    });

    it('builds key with sorted params', () => {
      const key = cacheService.buildKey('property:search', '78701', { type: 'SFH', beds: 3 });
      expect(key).toBe('property:search:78701:beds=3,type=SFH');
    });

    it('omits null/undefined params', () => {
      const key = cacheService.buildKey('rental', '78701', { beds: 3, type: null });
      expect(key).toBe('rental:78701:beds=3');
    });
  });

  describe('get', () => {
    it('returns parsed value on cache hit', async () => {
      mockGet.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
      const result = await cacheService.get('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('returns null on cache miss', async () => {
      mockGet.mockResolvedValue(null);
      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
    });

    it('returns null on Redis error (fail-open)', async () => {
      mockGet.mockRejectedValue(new Error('Connection refused'));
      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('serializes and stores value with TTL', (done) => {
      mockSet.mockResolvedValue('OK');
      cacheService.set('test-key', { foo: 'bar' }, 3600);
      // fire-and-forget — check after setImmediate
      setImmediate(() => {
        expect(mockSet).toHaveBeenCalledWith('test-key', JSON.stringify({ foo: 'bar' }), 'EX', 3600);
        done();
      });
    });
  });
});
