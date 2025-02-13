FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY . .

# Set up test environment
ENV CI=true
ENV NODE_ENV=test
ENV VENICE_API_KEY=dummy-key
ENV BRAVE_API_KEY=dummy-key

# Default command (can be overridden by docker-compose)
CMD ["npx", "tsx", "src/run.ts"]
