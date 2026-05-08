'use strict';

const DEFAULT_CONFIG = {
  vacancyRate: 0.08,
  maintenanceRate: 0.01,
  enableVacancy: true,
  enablePropertyTax: true,
  enableMaintenance: true,
  enableCostOfLiving: true,
};

/**
 * Calculates ROI for a property using the pipeline pattern (BR-ROI-01 through BR-ROI-04).
 *
 * @param {import('@zillow-roi/types/src/property').PropertyListing} property
 * @param {import('@zillow-roi/types/src/rental').RentalRate|null} rentalRate
 * @param {import('@zillow-roi/types/src/rental').CostOfLiving|null} col
 * @param {import('@zillow-roi/types/src/roi').ROIConfig} [userConfig]
 * @returns {import('@zillow-roi/types/src/roi').ROIResult}
 */
function calculate(property, rentalRate, col, userConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // BR-ROI-04: No rental data → zero ROI
  if (!rentalRate || !rentalRate.estimatedMonthlyRent) {
    return {
      roiScore: 0,
      breakdown: {
        capRate: 0,
        annualEstimatedRent: 0,
        annualExpenses: 0,
        missingRentalData: true,
      },
    };
  }

  const annualRent = rentalRate.estimatedMonthlyRent * 12;
  const price = property.price || 1; // guard against division by zero

  // Step 1: Base annual expenses (property tax)
  let annualExpenses = config.enablePropertyTax ? (property.propertyTax || 0) : 0;

  // Step 2: Vacancy adjustment
  let vacancyAdjustment = 0;
  if (config.enableVacancy) {
    vacancyAdjustment = annualRent * (config.vacancyRate ?? DEFAULT_CONFIG.vacancyRate);
    annualExpenses += vacancyAdjustment;
  }

  // Step 3: Maintenance adjustment
  let maintenanceAdjustment = 0;
  if (config.enableMaintenance) {
    maintenanceAdjustment = price * (config.maintenanceRate ?? DEFAULT_CONFIG.maintenanceRate);
    annualExpenses += maintenanceAdjustment;
  }

  // Step 4: Cap rate
  const capRate = (annualRent - annualExpenses) / price;

  // Step 5: Cost of living adjustment
  let colAdjustment = null;
  let roiScore = capRate;
  if (config.enableCostOfLiving && col) {
    const colFactor = 1 + (col.overallIndex - 100) / 100;
    colAdjustment = colFactor;
    roiScore = capRate * colFactor;
  }

  return {
    roiScore: Math.round(roiScore * 10000) / 10000, // 4 decimal places
    breakdown: {
      capRate: Math.round(capRate * 10000) / 10000,
      vacancyAdjustment: config.enableVacancy ? Math.round(vacancyAdjustment * 100) / 100 : undefined,
      maintenanceAdjustment: config.enableMaintenance ? Math.round(maintenanceAdjustment * 100) / 100 : undefined,
      propertyTaxAdjustment: config.enablePropertyTax ? (property.propertyTax || 0) : undefined,
      costOfLivingAdjustment: colAdjustment,
      annualEstimatedRent: annualRent,
      annualExpenses: Math.round(annualExpenses * 100) / 100,
    },
  };
}

module.exports = { calculate, DEFAULT_CONFIG };
