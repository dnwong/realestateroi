# NFR Design Patterns: backend-api

## Pattern 1: Middleware Stack (Security Layering)
Applied at Express app level — defense in depth (SECURITY-11):

```
Request
  → requestId middleware (UUID, X-Request-Id header)
  → helmet (HTTP security headers)
  → express-rate-limit (general 100/min)
  → express.json() (body parser, 10kb limit)
  → express-session (session validation)
  → Route-specific: auth middleware (session guard)
  → Route-specific: stricter rate limiter (login: 5/15min, search: 30/min)
  → Route handler
  → Global error handler
```

## Pattern 2: Auth Middleware (Fail-Closed)
```js
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
}
```
Applied to all protected routes. Fails closed — no session = no access.

## Pattern 3: Input Validation Middleware
Each route defines a joi schema. Validation middleware runs before handler:
```js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query || req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, error: 'Validation failed', details: error.details.map(d => d.message) });
    req.validated = value;
    next();
  };
}
```

## Pattern 4: Global Error Handler (Fail-Safe)
```js
function globalErrorHandler(err, req, res, next) {
  logger.error('Unhandled error', err, { requestId: req.requestId });
  res.status(500).json({ success: false, error: 'An unexpected error occurred' });
}
```
Registered as the last middleware. Never exposes stack traces in production (SECURITY-09, SECURITY-15).

## Pattern 5: IDOR Prevention (Object-Level Authorization)
All saved search and favorite queries include `WHERE user_id = $userId`:
```js
const result = await db.query(
  'SELECT * FROM saved_searches WHERE id = $1 AND user_id = $2',
  [id, req.session.userId]
);
if (!result.rows[0]) return res.status(404).json(...); // 404 not 403
```

## Pattern 6: Brute-Force Protection
```js
const loginAttempts = new Map(); // email → { count, lockedUntil }

function checkLoginAttempts(email) {
  const record = loginAttempts.get(email);
  if (record?.lockedUntil && record.lockedUntil > new Date()) throw new LockedError();
}
function recordFailedAttempt(email) {
  const record = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  record.count++;
  if (record.count >= 5) record.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  loginAttempts.set(email, record);
}
function resetAttempts(email) { loginAttempts.delete(email); }
```
