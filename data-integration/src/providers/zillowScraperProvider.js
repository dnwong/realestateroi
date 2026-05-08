'use strict';

const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const { createProviderError } = require('./interfaces/IPropertyProvider');
const { scraperSemaphore } = require('../utils/scraperSemaphore');
const config = require('../config');

puppeteerExtra.use(StealthPlugin());

const PROVIDER_NAME = 'zillow-scraper';
const PAGE_TIMEOUT_MS = 30000;

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteerExtra.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--disable-dev-shm-usage', '--no-first-run', '--disable-extensions'],
    });
  }
  return browserInstance;
}

/**
 * Scrapes Zillow for property listings matching the query.
 * @param {import('@zillow-roi/types/src/property').SearchQuery} query
 * @returns {Promise<object>}
 */
async function scrape(query) {
  await scraperSemaphore.acquire();
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    const searchUrl = `https://www.zillow.com/homes/for_sale/${encodeURIComponent(query.query)}_rb/`;

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: PAGE_TIMEOUT_MS });

    // Respect configured delay between requests
    await new Promise((r) => setTimeout(r, config.scraper.requestDelayMs));

    const html = await page.content();
    const listings = parseZillowHtml(html);

    return { provider: PROVIDER_NAME, listings, fetchedAt: new Date(), usedScraper: true };
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw createProviderError(PROVIDER_NAME, 'TIMEOUT', 'Page load timed out', true, null);
    }
    throw createProviderError(PROVIDER_NAME, 'UNKNOWN', 'Scraping failed', false, null);
  } finally {
    if (page) await page.close().catch(() => {});
    scraperSemaphore.release();
  }
}

/**
 * Parses Zillow HTML to extract listing data.
 * NOTE: Zillow's HTML structure changes frequently — this parser targets the
 * JSON-LD structured data embedded in the page, which is more stable than DOM scraping.
 * @param {string} html
 * @returns {object[]}
 */
function parseZillowHtml(html) {
  const $ = cheerio.load(html);
  const listings = [];

  // Attempt to extract from embedded JSON-LD or __NEXT_DATA__
  $('script[type="application/json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      // Zillow embeds listing data in various JSON structures — extract what's available
      const results = data?.cat1?.searchResults?.listResults || data?.searchResults?.listResults || [];
      listings.push(...results);
    } catch (_e) {
      // Skip unparseable script tags
    }
  });

  return listings;
}

module.exports = { scrape };
