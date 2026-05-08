# Domain Entities: backend-api

## Database Entities (PostgreSQL)

### users
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       VARCHAR(255) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL  -- bcrypt/argon2 hash
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

### sessions
Managed by connect-pg-simple (express-session).
```sql
sid     VARCHAR NOT NULL PRIMARY KEY
sess    JSON NOT NULL
expire  TIMESTAMPTZ NOT NULL
```

### saved_searches
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
name        VARCHAR(255) NOT NULL
query       JSONB NOT NULL  -- SearchQuery object
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

### favorites
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
property_id     VARCHAR(255) NOT NULL
property_data   JSONB NOT NULL  -- PropertyListing snapshot
created_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(user_id, property_id)
```

## Application-Level Entities

### Session
Server-side session managed by express-session.
```
{
  userId: string,
  email: string,
  loginAt: Date
}
```

### ROIPipelineStep
Internal representation of one step in the ROI calculation pipeline.
```
{
  stepName: string,
  value: number,
  enabled: boolean
}
```

### LoginAttemptTracker
In-memory (or Redis) tracker for brute-force protection.
```
{
  email: string,
  attempts: number,
  lockedUntil: Date | null
}
```
