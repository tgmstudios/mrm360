# Build stage
FROM node:23-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:23-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/index.js .

# Set environment variables
ENV NODE_ENV=production

# Expose API port
EXPOSE 80

# Start the application
CMD ["node", "index.js"]
