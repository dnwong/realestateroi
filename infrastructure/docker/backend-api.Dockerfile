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
# Tell npm to skip Puppeteer's Chromium download via .npmrc as well
ENV npm_config_puppeteer_skip_chromium_download=true

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the entire monorepo so file: dependencies resolve correctly
# packages/types must be present before npm install runs in any unit
COPY packages/types ./packages/types

# Install data-integration dependencies
# file:../packages/types resolves to /app/packages/types — correct
COPY data-integration/package.json ./data-integration/package.json
RUN cd data-integration && npm install --omit=dev --no-package-lock --legacy-peer-deps

# Copy data-integration source
COPY data-integration/src ./data-integration/src

# Install backend-api dependencies
# file:../data-integration resolves to /app/data-integration — correct
COPY backend-api/package.json ./backend-api/package.json
RUN cd backend-api && npm install --omit=dev --no-package-lock --legacy-peer-deps

# Copy backend-api source and db scripts
COPY backend-api/src ./backend-api/src
COPY backend-api/db ./backend-api/db

RUN chown -R appuser:appgroup /app
USER appuser

WORKDIR /app/backend-api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
