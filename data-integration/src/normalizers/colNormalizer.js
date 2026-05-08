'use strict';

/**
 * Normalizes raw cost-of-living data from any provider into the standard CostOfLiving schema.
 * Sets individual indices to 100 (US average / neutral) if not provided (BR-07).
 *
 * @param {object} raw - Raw COL response from provider
 * @param {string} location
 * @returns {import('@zillow-roi/types/src/rental').CostOfLiving}
 */
function normalizeCOLData(raw, location) {
  const providerName = raw.provider;

  if (providerName === 'teleport') {
    return normalizeTeleport(raw, location);
  }
  if (providerName === 'numbeo') {
    return normalizeNumbeo(raw, location);
  }

  // Generic fallback — all neutral
  return buildNeutral(location, providerName);
}

function normalizeTeleport(raw, location) {
  const categories = raw.indices?.categories || [];
  const find = (name) => {
    const cat = categories.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    return cat ? Math.round(cat.score_out_of_10 * 10) : 100; // scale 0-10 → 0-100
  };

  return {
    location,
    overallIndex: find('summary') || 100,
    housingIndex: find('housing') || 100,
    utilitiesIndex: find('utilities') || 100,
    groceriesIndex: find('cost') || 100,
    transportationIndex: find('commute') || 100,
    healthcareIndex: find('healthcare') || 100,
    dataSource: 'teleport',
    fetchedAt: raw.fetchedAt || new Date(),
  };
}

function normalizeNumbeo(raw, location) {
  const prices = raw.indices?.prices || [];
  const find = (itemId) => {
    const item = prices.find((p) => p.item_id === itemId);
    return item ? Math.round(item.average_price) : 100;
  };

  return {
    location,
    overallIndex: 100, // Numbeo doesn't provide a single overall index
    housingIndex: find(27) || 100,   // Apartment rent
    utilitiesIndex: find(30) || 100, // Utilities
    groceriesIndex: find(1) || 100,  // Milk (proxy)
    transportationIndex: find(20) || 100, // Monthly pass
    healthcareIndex: find(40) || 100, // Doctor visit
    dataSource: 'numbeo',
    fetchedAt: raw.fetchedAt || new Date(),
  };
}

function buildNeutral(location, dataSource) {
  return {
    location,
    overallIndex: 100,
    housingIndex: 100,
    utilitiesIndex: 100,
    groceriesIndex: 100,
    transportationIndex: 100,
    healthcareIndex: 100,
    dataSource,
    fetchedAt: new Date(),
  };
}

module.exports = { normalizeCOLData };
