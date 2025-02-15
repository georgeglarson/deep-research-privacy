FROM node:18-alpine

WORKDIR /app

# Copy UI package files first
WORKDIR /app/deep-research-ui
COPY deep-research-ui/package*.json ./
COPY deep-research-ui/tsconfig.json ./

# Install UI dependencies
RUN npm install

# Copy and build UI source
COPY deep-research-ui/src ./src
RUN npm run build

# Back to root to set up main package
WORKDIR /app
COPY package*.json ./

# Install root dependencies (which includes the built UI)
RUN npm install

# Copy remaining source files
COPY . .

# Test environment setup
ENV CI=true
ENV NODE_ENV=test

# Default command
CMD ["npx", "tsx", "src/run.ts"]
