# NFR Requirements: backend-api

## Performance
- Cached search response: < 3000ms end-to-end
- Cold search response: < 10000ms end-to-end
- Auth endpoints: < 500ms (bcrypt cost 12 adds ~200ms intentionally)
- ROI recalculation: < 500ms for up to 100 properties

## Security (Full baseline enforced — SECURITY-01 through SECURITY-15)
- SECURITY-04: HTTP security headers via helmet middleware (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- SECURITY-05: Input validation via joi on all endpoints
- SECURITY-08: Auth middleware on all protected routes; IDOR prevention on saved searches/favorites
- SECURITY-11: Rate limiting on login (5/15min), search (30/min), general (100/min)
- SECURITY-12: bcrypt cost 12, secure session cookies, brute-force lockout
- SECURITY-15: Global error handler, fail-closed on auth errors

## Reliability
- Global error handler catches all unhandled exceptions and returns generic 500
- All database queries use parameterized statements (no string concatenation)
- PostgreSQL connection pool with health checks
- Graceful shutdown: drain in-flight requests before closing DB pool

## Scalability
- Stateless API server (session state in PostgreSQL, not in-process)
- Horizontal scaling supported — multiple backend-api pods share same PostgreSQL + Redis
- No in-process state except login attempt tracker (acceptable for single-pod dev; Redis-backed for multi-pod prod)

## Observability
- Structured JSON logging (timestamp, requestId, level, message, durationMs)
- Request ID middleware generates UUID per request, attaches to `X-Request-Id` header
- Log all requests: method, path, status, durationMs (no query params that may contain PII)
- Alert on: repeated 401s (brute force), 5xx rate spikes

## Maintainability
- All dependencies pinned with exact versions + package-lock.json
- npm audit in CI pipeline
- Separation of concerns: routes → services → repositories (no business logic in route handlers)
