/**
 * @fileoverview ROI calculation configuration and result types
 */

/**
 * @typedef {Object} ROIConfig
 * @property {number} [vacancyRate] - Vacancy rate as decimal (0.0-1.0), default 0.08
 * @property {number} [maintenanceRate] - Annual maintenance as % of property value (0.0-1.0), default 0.01
 * @property {boolean} [enableVacancy] - Include vacancy adjustment, default true
 * @property {boolean} [enablePropertyTax] - Include property tax adjustment, default true
 * @property {boolean} [enableMaintenance] - Include maintenance adjustment, default true
 * @property {boolean} [enableCostOfLiving] - Include cost of living adjustment, default true
 * @property {ROIFactorWeights} [factorWeights] - Optional custom factor weights
 */

/**
 * @typedef {Object} ROIFactorWeights
 * @property {number} [capRate] - Weight for cap rate factor
 * @property {number} [vacancy] - Weight for vacancy factor
 * @property {number} [propertyTax] - Weight for property tax factor
 * @property {number} [maintenance] - Weight for maintenance factor
 * @property {number} [costOfLiving] - Weight for cost of living factor
 */

/**
 * @typedef {Object} ROIBreakdown
 * @property {number} capRate - Calculated cap rate
 * @property {number} [vacancyAdjustment] - Vacancy rate adjustment
 * @property {number} [propertyTaxAdjustment] - Property tax adjustment
 * @property {number} [maintenanceAdjustment] - Maintenance cost adjustment
 * @property {number} [costOfLivingAdjustment] - Cost of living adjustment factor
 * @property {number} annualEstimatedRent - Annual estimated rental income
 * @property {number} annualExpenses - Total annual expenses
 */

/**
 * @typedef {Object} ROIResult
 * @property {number} roiScore - Final ROI score as decimal
 * @property {ROIBreakdown} breakdown - Per-step breakdown of the ROI calculation
 */

/**
 * @typedef {Object} PropertyResult
 * @property {import('./property').PropertyListing} property - The property listing
 * @property {import('./rental').RentalRate} [rentalRate] - Matched rental rate data
 * @property {import('./rental').CostOfLiving} [costOfLiving] - Cost of living data for the area
 * @property {number} roiScore - Calculated ROI score
 * @property {ROIBreakdown} roiBreakdown - Detailed ROI breakdown
 * @property {'api' | 'scraper'} dataSource - Source of property data
 * @property {boolean} [usingFallbackData] - True if scraper fallback was used
 * @property {boolean} [missingRentalData] - True if rental data was unavailable
 * @property {boolean} [missingCOLData] - True if COL data was unavailable
 */

module.exports = {};
