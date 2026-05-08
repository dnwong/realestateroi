# Logical Components: backend-api

## PostgreSQL Connection Pool
- Single `pg.Pool` instance, exported as singleton from `src/db/index.js`
- Pool size: min 2, max 10 connections
- Connection string from `DATABASE_URL` env var
- TLS: `ssl: { rejectUnauthorized: true }` in production
- Graceful shutdown: `pool.end()` on SIGTERM

## Express Session Store
- `connect-pg-simple` uses the same PostgreSQL pool
- Sessions table auto-created on startup
- Session secret from `SESSION_SECRET` env var (min 32 chars)

## Login Attempt Tracker
- In-process `Map` for single-pod deployments
- Acceptable for MVP; can be replaced with Redis-backed store for multi-pod

## Environment Configuration
Required environment variables:
```
DATABASE_URL          # PostgreSQL connection string
SESSION_SECRET        # Min 32-char random string
NODE_ENV              # 'development' | 'production'
PORT                  # Default 3000
```
