FROM node:22-bookworm-slim

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Copy entrypoint script and ensure proper line endings
COPY .docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    sed -i 's/\r$//' /docker-entrypoint.sh

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 3000

ENV CONTAINER_TYPE=backend

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["pnpm", "run", "dev", "--", "-H", "0.0.0.0"]
