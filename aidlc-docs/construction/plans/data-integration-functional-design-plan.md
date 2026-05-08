# Functional Design Plan: data-integration

## Steps
- [x] Answer design questions below
- [x] Generate business-logic-model.md
- [x] Generate business-rules.md
- [x] Generate domain-entities.md

---

## Design Questions

Please fill in the `[Answer]:` tags below. Let me know when done.

---

### Question 1: Property API Provider Selection
Which third-party property data API should be the primary integration target?

A) RapidAPI Zillow wrapper (e.g., `zillow-com1` or `zillow56` on RapidAPI)
B) Rentcast API (covers both property listings and rental estimates)
C) Realtor.com API (via RapidAPI)
D) Make it configurable — the provider is selected via environment variable, with a standard interface
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 2: Zillow Scraper Approach
For the Zillow scraping fallback, which approach should be used?

A) Puppeteer/Playwright — headless browser (handles JavaScript-rendered pages, heavier)
B) Cheerio + axios — HTML parsing (lighter, faster, but may fail on JS-rendered content)
C) Puppeteer-stealth — headless browser with anti-detection measures
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Rental Data Aggregation
When aggregating rental data from multiple sources, how should conflicts be resolved?

A) Average the estimates from all available sources
B) Use the source with the most data points as primary, others as supplementary
C) Return all estimates separately and let the ROI engine pick the median
D) Weighted average based on source reliability score (configurable)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 4: Cache Key Strategy
How should cache keys be structured for property searches with filters?

A) Hash the full query + filters object into an MD5/SHA key
B) Structured key: `{namespace}:{zipCode}:{sortedFilterParams}` (human-readable, debuggable)
C) ZIP/region only — ignore filters in cache key (broader cache hits, less precise)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 5: Data Normalization
When normalizing data from different providers into common schemas, how should missing fields be handled?

A) Set missing optional fields to `null` (explicit absence)
B) Omit missing optional fields entirely (sparse objects)
C) Set missing fields to sensible defaults (e.g., `propertyTax: 0`, `hoaFee: 0`)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---
