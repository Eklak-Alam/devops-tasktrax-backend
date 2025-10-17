# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Final lightweight image
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built dependencies from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# Create .env file if it doesn't exist (for production)
RUN if [ ! -f .env ]; then \
      echo "PORT=5000" > .env && \
      echo "NODE_ENV=production" >> .env; \
    fi

USER nextjs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

CMD ["node", "server.js"]