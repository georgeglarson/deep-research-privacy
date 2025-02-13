FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY . .

# Run tests in CI mode
ENV CI=true
ENV NODE_ENV=test

# Default command (can be overridden by docker-compose)
CMD ["npx", "tsx", "--env-file=.env.test", "src/run.ts"]
