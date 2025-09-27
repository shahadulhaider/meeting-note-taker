# Production Dockerfile for Backend API
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y redis-server supervisor && apt-get clean
RUN npm install -g pnpm

# Build stage
FROM base AS build
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build
RUN pnpm --filter @meeting-note-taker/shared build || true
RUN pnpm --filter @meeting-note-taker/api build

# Production stage
FROM base AS production
WORKDIR /app

# Copy built application
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./

# Setup supervisor config
RUN echo "[supervisord]\n\
nodaemon=true\n\
\n\
[program:redis]\n\
command=redis-server\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/redis.err.log\n\
stdout_logfile=/var/log/redis.out.log\n\
\n\
[program:api]\n\
command=node apps/api/dist/index.js\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/api.err.log\n\
stdout_logfile=/var/log/api.out.log\n\
environment=NODE_ENV=\"production\",REDIS_URL=\"redis://localhost:6379\"" > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3001

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
