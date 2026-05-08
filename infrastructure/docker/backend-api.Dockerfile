FROM node:20.12.2-alpine3.19

# Install Chromium for Puppeteer (Zillow scraper fallback)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy shared types
COPY packages/types ./packages/types

# Copy data-integration
COPY data-integration/package*.json ./data-integration/
RUN cd data-integration && npm ci --only=production

COPY data-integration ./data-integration

# Copy backend-api
COPY backend-api/package*.json ./backend-api/
RUN cd backend-api && npm ci --only=production

COPY backend-api ./backend-api

RUN chown -R appuser:appgroup /app
USER appuser

WORKDIR /app/backend-api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
