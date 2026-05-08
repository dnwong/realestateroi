# Performance Test Instructions

## Performance Requirements (from NFR-01)

| Metric | Target |
|---|---|
| Cached search response | < 3000ms |
| Cold search response | < 10000ms |
| Dashboard render | < 2000ms after data load |
| Concurrent users | 50 without degradation |
| Auth endpoints | < 500ms |

## Recommended Tool: k6

Install k6: https://k6.io/docs/getting-started/installation/

## Load Test Script

Create `infrastructure/performance/load-test.js`:

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Hold at 50 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% of requests under 10s
    http_req_failed: ['rate<0.05'],     // Error rate under 5%
  },
};

export default function () {
  // Test cached search (after warm-up)
  const searchRes = http.get('http://localhost:3000/api/search?query=78701&type=zip');
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search under 10s': (r) => r.timings.duration < 10000,
  });

  // Test ROI config endpoint
  const configRes = http.get('http://localhost:3000/api/roi/config');
  check(configRes, { 'config status 200': (r) => r.status === 200 });

  sleep(1);
}
```

## Run Performance Tests

```bash
# Ensure services are running
docker compose -f infrastructure/docker-compose.yml up -d

# Warm up cache with one search
curl "http://localhost:3000/api/search?query=78701&type=zip"

# Run load test
k6 run infrastructure/performance/load-test.js
```

## Analyze Results

k6 outputs:
- `http_req_duration` — response time percentiles (p50, p90, p95, p99)
- `http_req_failed` — error rate
- `http_reqs` — total requests and throughput (req/s)

**Pass criteria**:
- p95 response time < 10000ms for search
- Error rate < 5%
- No memory leaks (monitor with `docker stats`)

## Performance Optimization Tips

If targets are not met:
1. **Slow cold searches**: Check external API response times — consider increasing cache TTL
2. **High error rate**: Check backend-api logs for 5xx errors
3. **Memory growth**: Check for connection pool exhaustion — increase `pg.Pool` max connections
4. **Redis bottleneck**: Check Redis memory usage — consider eviction policy
