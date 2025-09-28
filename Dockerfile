# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the applicationRUN pnpm --filter @meeting-note-taker/api build

# Production stage
FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy shared source (no build needed, just TypeScript types)
COPY --from=builder /app/packages/shared/src ./packages/shared/src

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
