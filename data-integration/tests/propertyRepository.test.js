'use strict';

jest.mock('../src/cache/cacheService');
jest.mock('../src/providers/providerRegistry');
jest.mock('../src/providers/zillowScraperProvider');

const cacheService = require('../src/cache/cacheService');
const { getActivePropertyProvider } = require('../src/providers/providerRegistry');
const zillowScraper = require('../src/providers/zillowScraperProvider');
const propertyRepository = require('../src/repositories/propertyRepository');

const mockProvider = { search: jest.fn(), getRentalEstimates: jest.fn() };
getActivePropertyProvider.mockReturnValue(mockProvider);
cacheService.buildKey.mockReturnValue('property:search:78701:');
cacheService.get.mockResolvedValue(null);
cacheService.set.mockImplementation(() => {});

const mockRawListing = {
  id: '1', address: '123 Main St', city: 'Austin', state: 'TX', zipCode: '78701',
  price: 400000, bedrooms: 3, bathrooms: 2, livingArea: 1800, homeType: 'SINGLE_FAMILY',
  detailUrl: 'https://example.com/1',
};

describe('propertyRepository.findBySearch', () => {
  const query = { query: '78701', type: 'zip', filters: {} };

  beforeEach(() => jest.clearAllMocks());

  it('returns cached result on cache hit', async () => {
    const cached = { listings: [mockRawListing], usingFallback: false };
    cacheService.get.mockResolvedValueOnce(cached);
    const result = await propertyRepository.findBySearch(query);
    expect(result).toBe(cached);
    expect(mockProvider.search).not.toHaveBeenCalled();
  });

  it('fetches from primary provider on cache miss', async () => {
    mockProvider.search.mockResolvedValue({ provider: 'rentcast', listings: [mockRawListing], fetchedAt: new Date() });
    const result = await propertyRepository.findBySearch(query);
    expect(result.usingFallback).toBe(false);
    expect(result.listings).toHaveLength(1);
    expect(result.listings[0].dataSource).toBe('api');
  });

  it('falls back to scraper when primary fails', async () => {
    const err = Object.assign(new Error('Rate limit'), { name: 'ProviderError', code: 'RATE_LIMIT', retryable: false });
    mockProvider.search.mockRejectedValue(err);
    zillowScraper.scrape.mockResolvedValue({ provider: 'zillow-scraper', listings: [mockRawListing], fetchedAt: new Date(), usedScraper: true });
    const result = await propertyRepository.findBySearch(query);
    expect(result.usingFallback).toBe(true);
    expect(result.listings[0].dataSource).toBe('scraper');
  });

  it('throws DataUnavailableError when both providers fail', async () => {
    const primaryErr = Object.assign(new Error('Primary failed'), { name: 'ProviderError', retryable: false });
    const fallbackErr = Object.assign(new Error('Scraper failed'), { name: 'ProviderError', retryable: false });
    mockProvider.search.mockRejectedValue(primaryErr);
    zillowScraper.scrape.mockRejectedValue(fallbackErr);
    await expect(propertyRepository.findBySearch(query)).rejects.toMatchObject({ name: 'DataUnavailableError' });
  });
});
