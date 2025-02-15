FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package.json.docker ./package.json
COPY package-lock.json ./
COPY deep-research-ui/package*.json ./deep-research-ui/
COPY deep-research-ui/package-lock.json ./deep-research-ui/

# Install root dependencies
RUN npm install

# Set up UI
WORKDIR /app/deep-research-ui

# Install UI dependencies
RUN npm install

# Copy UI source files
COPY deep-research-ui/tsconfig.json ./
COPY deep-research-ui/src ./src

# Build UI
RUN npm run build

# Back to root
WORKDIR /app

# Copy remaining source files
COPY . .

# Set up test environment
ENV CI=true
ENV NODE_ENV=test
ENV VENICE_API_KEY=dummy-key
ENV BRAVE_API_KEY=dummy-key

# Default command
CMD ["npx", "tsx", "src/run.ts"]
