'use strict';

jest.mock('../src/cache/cacheService');
jest.mock('../src/providers/rentcastProvider');
jest.mock('../src/providers/providerRegistry');

const cacheService = require('../src/cache/cacheService');
const rentcastProvider = require('../src/providers/rentcastProvider');
const { getActivePropertyProvider } = require('../src/providers/providerRegistry');
const rentalRepository = require('../src/repositories/rentalRepository');

const mockPropertyProvider = { getRentalEstimates: jest.fn() };
getActivePropertyProvider.mockReturnValue(mockPropertyProvider);
cacheService.buildKey.mockReturnValue('rental:78701:beds=3');
cacheService.get.mockResolvedValue(null);
cacheService.set.mockImplementation(() => {});

const mockRentcastEstimate = { rent: 2000, bedrooms: 3, bathrooms: 2, propertyType: 'SFH' };

describe('rentalRepository.findByArea', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns cached result on cache hit', async () => {
    const cached = [{ estimatedMonthlyRent: 2000 }];
    cacheService.get.mockResolvedValueOnce(cached);
    const result = await rentalRepository.findByArea('78701', { bedroomsMin: 3 });
    expect(result).toBe(cached);
    expect(rentcastProvider.getRentalEstimates).not.toHaveBeenCalled();
  });

  it('aggregates from rentcast when property provider has no rental data', async () => {
    rentcastProvider.getRentalEstimates.mockResolvedValue({
      provider: 'rentcast',
      estimates: [mockRentcastEstimate],
      fetchedAt: new Date(),
    });
    const notFoundErr = Object.assign(new Error('Not supported'), { code: 'NOT_FOUND' });
    mockPropertyProvider.getRentalEstimates.mockRejectedValue(notFoundErr);

    const result = await rentalRepository.findByArea('78701', { bedroomsMin: 3 });
    expect(result).toHaveLength(1);
    expect(result[0].estimatedMonthlyRent).toBe(2000);
  });

  it('returns empty array when all sources fail', async () => {
    rentcastProvider.getRentalEstimates.mockRejectedValue(new Error('Failed'));
    mockPropertyProvider.getRentalEstimates.mockRejectedValue(new Error('Failed'));
    const result = await rentalRepository.findByArea('78701', {});
    expect(result).toEqual([]);
  });
});
