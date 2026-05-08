# Stage 1: Build React app
FROM node:20.12.2-alpine3.19 AS builder

WORKDIR /app

# Copy shared types first (file: dependency)
COPY packages/types ./packages/types

# Install frontend dependencies
COPY frontend/package.json ./frontend/package.json
RUN cd frontend && npm install --no-package-lock --legacy-peer-deps

# Copy frontend source and build
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25.4-alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY infrastructure/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1
