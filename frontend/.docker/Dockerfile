# Build stage
FROM node:22-bookworm-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files needed for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Install dependencies (only frontend workspace)
RUN pnpm install --frozen-lockfile --filter mrm360-frontend

# Copy frontend source code
COPY frontend/ ./frontend/

# Build the application
RUN pnpm --filter mrm360-frontend run build

# Production stage
FROM nginx:alpine

RUN apk add --no-cache bash gettext

COPY frontend/.docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/.docker/env.js.template /usr/share/nginx/html/env.js.template

COPY frontend/.docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    sed -i 's/\r$//' /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
