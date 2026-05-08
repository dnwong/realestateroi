# Tech Stack Decisions: backend-api

| Concern | Decision | Rationale |
|---|---|---|
| Runtime | Node.js LTS | Specified in requirements |
| Framework | Express.js 4.x (pinned) | Specified in requirements |
| Password hashing | bcryptjs 2.4.3 (pinned) | Pure JS, no native deps, adaptive cost factor |
| Session management | express-session 1.18.0 + connect-pg-simple 9.0.1 (pinned) | Server-side sessions in PostgreSQL |
| Input validation | joi 17.12.2 (pinned) | Consistent with data-integration |
| HTTP security headers | helmet 7.1.0 (pinned) | Sets all required SECURITY-04 headers |
| Rate limiting | express-rate-limit 7.2.0 (pinned) | Simple, well-maintained |
| Database client | pg 8.11.3 (pinned) | PostgreSQL driver, parameterized queries |
| UUID generation | uuid 9.0.1 (pinned) | Request IDs |
| Logging | Custom structured logger (console JSON) | No external dependency needed |
| Testing | jest 29.7.0 + supertest 7.0.0 (pinned) | Standard Node.js testing |
| Dependency scanning | npm audit | Built-in |
