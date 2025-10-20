# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY .env.production ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and production dependencies
COPY package*.json ./  # FIXED: package*..json -> package*.json
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --from=builder /app ./

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 5000

# Health check (wait for backend to start)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]