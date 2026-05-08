'use strict';

/**
 * Normalizes a raw property listing from any provider into the standard PropertyListing schema.
 * Applies BR-07 defaults for missing fields.
 *
 * @param {object} raw - Raw listing from provider
 * @param {string} providerName - Provider identifier
 * @param {'api'|'scraper'} dataSource
 * @returns {import('@zillow-roi/types/src/property').PropertyListing}
 */
function normalizePropertyListing(raw, providerName, dataSource) {
  const price = toNumber(raw.price || raw.listPrice || raw.unformattedPrice || 0);

  return {
    id: String(raw.zpid || raw.id || raw.mlsId || `${providerName}-${Date.now()}-${Math.random()}`),
    address: raw.address || raw.streetAddress || raw.location?.address?.line || '',
    city: raw.city || raw.location?.address?.city || '',
    state: raw.state || raw.location?.address?.state_code || '',
    zipCode: raw.zipCode || raw.zip || raw.location?.address?.postal_code || '',
    price,
    bedrooms: toNumber(raw.bedrooms || raw.beds || 0),
    bathrooms: toNumber(raw.bathrooms || raw.baths || 0),
    sqft: toNumber(raw.livingArea || raw.sqft || raw.area || 0),
    propertyType: normalizePropertyType(raw.homeType || raw.propertyType || raw.type),
    yearBuilt: toNumber(raw.yearBuilt || raw.year_built || 0),
    propertyTax: toNumber(raw.annualTaxAmount || raw.propertyTax) || Math.round(price * 0.011),
    hoaFee: toNumber(raw.hoaFee || raw.hoa || 0),
    lotSize: toNumber(raw.lotAreaValue || raw.lotSize || 0),
    latitude: toNumberOrNull(raw.latitude || raw.lat),
    longitude: toNumberOrNull(raw.longitude || raw.lng || raw.lon),
    listingUrl: raw.detailUrl || raw.url || raw.hdpUrl || '',
    dataSource,
  };
}

function normalizePropertyType(raw) {
  if (!raw) return 'SFH';
  const t = String(raw).toUpperCase();
  if (t.includes('CONDO') || t.includes('APARTMENT')) return 'Condo';
  if (t.includes('MULTI') || t.includes('DUPLEX') || t.includes('TRIPLEX')) return 'Multi-Family';
  if (t.includes('TOWNHOUSE') || t.includes('TOWNHOME')) return 'Townhouse';
  return 'SFH';
}

function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function toNumberOrNull(val) {
  if (val == null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

module.exports = { normalizePropertyListing };
