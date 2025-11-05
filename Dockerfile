FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY . .

# Default command (expects .env to be mounted or env vars set externally)
CMD ["npx", "tsx", "src/run.ts"]
