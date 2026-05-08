'use strict';

const { normalizePropertyListing } = require('../src/normalizers/propertyNormalizer');
const { normalizeRentalEstimate, aggregateRentalEstimates } = require('../src/normalizers/rentalNormalizer');
const { normalizeCOLData } = require('../src/normalizers/colNormalizer');

describe('propertyNormalizer', () => {
  describe('normalizePropertyListing', () => {
    it('maps Rentcast fields to PropertyListing schema', () => {
      const raw = {
        id: 'abc123',
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        price: 450000,
        bedrooms: 3,
        bathrooms: 2,
        livingArea: 1800,
        homeType: 'SINGLE_FAMILY',
        yearBuilt: 2005,
        annualTaxAmount: 5000,
        hoaFee: 0,
        latitude: 30.267,
        longitude: -97.743,
        detailUrl: 'https://example.com/listing/abc123',
      };
      const result = normalizePropertyListing(raw, 'rentcast', 'api');
      expect(result.id).toBe('abc123');
      expect(result.price).toBe(450000);
      expect(result.bedrooms).toBe(3);
      expect(result.propertyType).toBe('SFH');
      expect(result.dataSource).toBe('api');
    });

    it('estimates propertyTax as 1.1% of price when missing', () => {
      const raw = { price: 400000, bedrooms: 3, bathrooms: 2, livingArea: 1500 };
      const result = normalizePropertyListing(raw, 'test', 'api');
      expect(result.propertyTax).toBe(Math.round(400000 * 0.011));
    });

    it('sets hoaFee to 0 when missing', () => {
      const raw = { price: 300000 };
      const result = normalizePropertyListing(raw, 'test', 'api');
      expect(result.hoaFee).toBe(0);
    });

    it('normalizes condo property type', () => {
      const raw = { price: 200000, homeType: 'CONDO' };
      const result = normalizePropertyListing(raw, 'test', 'api');
      expect(result.propertyType).toBe('Condo');
    });
  });
});

describe('rentalNormalizer', () => {
  describe('normalizeRentalEstimate', () => {
    it('maps raw rental estimate to RentalRate schema', () => {
      const raw = { rent: 2000, bedrooms: 3, bathrooms: 2, propertyType: 'SFH' };
      const result = normalizeRentalEstimate(raw, 'rentcast', '78701');
      expect(result.estimatedMonthlyRent).toBe(2000);
      expect(result.bedrooms).toBe(3);
      expect(result.dataSource).toBe('rentcast');
    });
  });

  describe('aggregateRentalEstimates', () => {
    it('returns single estimate directly when only one source', () => {
      const estimate = { estimatedMonthlyRent: 2000, bedrooms: 3, bathrooms: 2, sqft: 0, propertyType: 'SFH', rentRangeMin: 1800, rentRangeMax: 2200, dataSource: 'rentcast', zipCode: '78701' };
      const result = aggregateRentalEstimates([{ estimate, weight: 0.8 }], '78701');
      expect(result.estimatedMonthlyRent).toBe(2000);
    });

    it('computes weighted average from two sources', () => {
      const e1 = { estimatedMonthlyRent: 2000, bedrooms: 3, bathrooms: 2, sqft: 0, propertyType: 'SFH', rentRangeMin: 1800, rentRangeMax: 2200, dataSource: 'rentcast', zipCode: '78701' };
      const e2 = { estimatedMonthlyRent: 2200, bedrooms: 3, bathrooms: 2, sqft: 0, propertyType: 'SFH', rentRangeMin: 2000, rentRangeMax: 2400, dataSource: 'property-api', zipCode: '78701' };
      const result = aggregateRentalEstimates([{ estimate: e1, weight: 0.8 }, { estimate: e2, weight: 0.6 }], '78701');
      // weighted avg: (2000*0.8 + 2200*0.6) / (0.8+0.6) = (1600+1320)/1.4 = 2085.7 → 2086
      expect(result.estimatedMonthlyRent).toBe(Math.round((2000 * 0.8 + 2200 * 0.6) / 1.4));
      expect(result.rentRangeMin).toBe(1800);
      expect(result.rentRangeMax).toBe(2400);
    });
  });
});

describe('colNormalizer', () => {
  it('sets all indices to 100 for unknown provider', () => {
    const raw = { provider: 'unknown', fetchedAt: new Date() };
    const result = normalizeCOLData(raw, 'Austin, TX');
    expect(result.overallIndex).toBe(100);
    expect(result.housingIndex).toBe(100);
  });
});
