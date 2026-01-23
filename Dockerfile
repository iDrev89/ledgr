# syntax=docker/dockerfile:1

# ============================================
# Base stage with pnpm
# ============================================
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies with cache mount for faster builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma client in deps stage
RUN pnpm prisma generate

# ============================================
# Stage 2: Build the application
# ============================================
FROM base AS build

WORKDIR /app

# Copy dependencies from deps stage (including generated Prisma client)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN pnpm build

# ============================================
# Stage 3: Production runner (dokploy)
# ============================================
FROM base AS dokploy

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy necessary files from build stage
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Copy Prisma schema for potential migrations
COPY --from=build /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Healthcheck for Dokploy rollbacks
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
