FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and environment file
COPY . .

# Default command (can be overridden by docker-compose)
CMD ["npx", "tsx", "src/run.ts"]
