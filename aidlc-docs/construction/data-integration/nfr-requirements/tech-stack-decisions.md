# Tech Stack Decisions: data-integration

| Concern | Decision | Rationale |
|---|---|---|
| Runtime | Node.js LTS (CommonJS) | Consistent with backend-api, no build step |
| HTTP client | axios (pinned) | Interceptors for auth/logging, timeout support, retry-friendly |
| Redis client | ioredis (pinned) | Robust, supports TLS, connection pooling, widely used |
| Puppeteer | puppeteer (pinned, full) | Handles JS-rendered Zillow pages; stealth plugin added |
| Puppeteer stealth | puppeteer-extra + puppeteer-extra-plugin-stealth | Reduces bot detection risk |
| HTML parsing | cheerio (pinned) | Used for parsing Puppeteer page content after load |
| Input validation | joi (pinned) | Schema-based validation, clear error messages |
| Logging | Shared LoggerService (from backend-api context) | Structured JSON, no PII |
| Testing | jest (pinned) | Standard Node.js test runner, good mocking support |
| Dependency scanning | npm audit (built-in) | Run in CI pipeline |
