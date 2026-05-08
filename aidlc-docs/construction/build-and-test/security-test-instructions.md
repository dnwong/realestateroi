# Security Test Instructions

## Dependency Vulnerability Scanning (SECURITY-10)

```bash
# Run npm audit for each unit
cd data-integration && npm audit
cd ../backend-api && npm audit
cd ../frontend && npm audit
```

**Pass criteria**: No critical or high severity vulnerabilities. Address any found before deployment.

## HTTP Security Headers Verification (SECURITY-04)

```bash
# Start the stack
docker compose -f infrastructure/docker-compose.yml up -d

# Check security headers on API response
curl -I http://localhost:3000/health

# Expected headers:
# Content-Security-Policy: default-src 'self'...
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Referrer-Policy: strict-origin-when-cross-origin
```

## Authentication Security Tests (SECURITY-12)

```bash
# 1. Verify password hashing — check DB directly
docker compose -f infrastructure/docker-compose.yml exec postgres \
  psql -U postgres -d zillow_roi -c "SELECT email, LEFT(password, 7) FROM users LIMIT 1;"
# Expected: password starts with '$2b$' (bcrypt) or '$argon2' (argon2)

# 2. Verify session cookie attributes
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' 2>&1 | grep -i "set-cookie"
# Expected: HttpOnly; SameSite=Strict in cookie attributes

# 3. Verify brute-force protection (see integration tests Scenario 6)
```

## Input Validation Tests (SECURITY-05)

```bash
# Test SQL injection attempt (should return 400, not 500)
curl "http://localhost:3000/api/search?query=78701%27%20OR%201%3D1--&type=zip"
# Expected: 400 validation error

# Test oversized payload
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$(python3 -c 'print("a"*10000)')@example.com\",\"password\":\"password123\"}"
# Expected: 400 or 413 (payload too large)

# Test XSS in search query
curl "http://localhost:3000/api/search?query=%3Cscript%3Ealert(1)%3C%2Fscript%3E&type=region"
# Expected: 400 validation error or sanitized response (no script execution)
```

## IDOR Prevention Tests (SECURITY-08)

```bash
# Login as user A, create a saved search, get its ID
# Then login as user B and try to delete user A's saved search
# Expected: 404 (not 403 — prevents enumeration)

# Test with invalid UUID
curl -X DELETE http://localhost:3000/api/saved-searches/00000000-0000-0000-0000-000000000000 \
  -b cookies_user_b.txt
# Expected: 404
```

## Error Response Verification (SECURITY-09)

```bash
# Trigger a server error and verify no stack trace is exposed
# (In production mode)
NODE_ENV=production curl http://localhost:3000/api/nonexistent-route
# Expected: {"success":false,"error":"Not found"} — no stack trace
```
