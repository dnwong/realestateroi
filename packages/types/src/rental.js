/**
 * @fileoverview Rental rate and cost-of-living types
 */

/**
 * @typedef {Object} RentalRate
 * @property {string} zipCode - ZIP code for the rental area
 * @property {number} bedrooms - Number of bedrooms
 * @property {number} [bathrooms] - Number of bathrooms
 * @property {number} [sqft] - Square footage
 * @property {string} [propertyType] - Property type
 * @property {number} estimatedMonthlyRent - Estimated monthly rent in USD
 * @property {number} rentRangeMin - Minimum rent estimate in USD
 * @property {number} rentRangeMax - Maximum rent estimate in USD
 * @property {string} dataSource - Source of the rental data
 */

/**
 * @typedef {Object} CostOfLiving
 * @property {string} location - City or region name
 * @property {number} overallIndex - Overall cost of living index (100 = US average)
 * @property {number} housingIndex - Housing cost index
 * @property {number} utilitiesIndex - Utilities cost index
 * @property {number} groceriesIndex - Groceries cost index
 * @property {number} transportationIndex - Transportation cost index
 * @property {number} healthcareIndex - Healthcare cost index
 * @property {string} dataSource - Source of the COL data
 * @property {Date} fetchedAt - When this data was fetched
 */

module.exports = {};
