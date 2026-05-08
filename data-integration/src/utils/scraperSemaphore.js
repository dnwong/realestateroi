'use strict';

/**
 * Simple semaphore to limit concurrent Puppeteer scraping sessions.
 */
class ScraperSemaphore {
  /**
   * @param {number} [limit=1]
   */
  constructor(limit = 1) {
    this.limit = limit;
    this.active = 0;
    this.queue = [];
  }

  /**
   * Acquires the semaphore. Waits if at capacity.
   * @returns {Promise<void>}
   */
  acquire() {
    if (this.active < this.limit) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  /**
   * Releases the semaphore, allowing the next queued caller to proceed.
   */
  release() {
    this.active--;
    if (this.queue.length > 0) {
      this.active++;
      const next = this.queue.shift();
      next();
    }
  }
}

// Singleton instance — one scraper session at a time across the whole process
const scraperSemaphore = new ScraperSemaphore(1);

module.exports = { ScraperSemaphore, scraperSemaphore };
