'use strict';

const { calculate, DEFAULT_CONFIG } = require('../src/services/roiService');

const mockProperty = {
  id: '1', price: 400000, bedrooms: 3, bathrooms: 2, sqft: 1800,
  propertyType: 'SFH', propertyTax: 4400, hoaFee: 0, dataSource: 'api',
};
const mockRental = { estimatedMonthlyRent: 2200, bedrooms: 3, rentRangeMin: 2000, rentRangeMax: 2400 };
const mockCOL = { overallIndex: 110, housingIndex: 115, location: 'Austin, TX' };

describe('roiService.calculate', () => {
  it('returns zero ROI when rental data is missing', () => {
    const result = calculate(mockProperty, null, mockCOL);
    expect(result.roiScore).toBe(0);
    expect(result.breakdown.missingRentalData).toBe(true);
  });

  it('calculates cap rate correctly', () => {
    const result = calculate(mockProperty, mockRental, null, { ...DEFAULT_CONFIG, enableCostOfLiving: false });
    const annualRent = 2200 * 12; // 26400
    const vacancy = annualRent * 0.08; // 2112
    const maintenance = 400000 * 0.01; // 4000
    const expenses = 4400 + vacancy + maintenance; // 10512
    const expectedCapRate = (annualRent - expenses) / 400000;
    expect(result.roiScore).toBeCloseTo(expectedCapRate, 4);
  });

  it('applies COL adjustment factor', () => {
    const resultWithCOL = calculate(mockProperty, mockRental, mockCOL);
    const resultWithoutCOL = calculate(mockProperty, mockRental, null, { ...DEFAULT_CONFIG, enableCostOfLiving: false });
    // COL index 110 → factor 1.1 → higher ROI
    expect(resultWithCOL.roiScore).toBeCloseTo(resultWithoutCOL.roiScore * 1.1, 3);
  });

  it('skips vacancy when disabled', () => {
    const withVacancy = calculate(mockProperty, mockRental, null, { ...DEFAULT_CONFIG, enableVacancy: true, enableCostOfLiving: false });
    const withoutVacancy = calculate(mockProperty, mockRental, null, { ...DEFAULT_CONFIG, enableVacancy: false, enableCostOfLiving: false });
    expect(withoutVacancy.roiScore).toBeGreaterThan(withVacancy.roiScore);
  });

  it('includes breakdown with all factors', () => {
    const result = calculate(mockProperty, mockRental, mockCOL);
    expect(result.breakdown).toHaveProperty('capRate');
    expect(result.breakdown).toHaveProperty('annualEstimatedRent');
    expect(result.breakdown).toHaveProperty('annualExpenses');
    expect(result.breakdown).toHaveProperty('costOfLivingAdjustment');
  });
});
