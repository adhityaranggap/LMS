# ---- Stage 1: Builder ----
FROM node:20-bookworm AS builder

WORKDIR /app

# Install system dependencies required by canvas, better-sqlite3, face-api
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source
COPY . .

# Build frontend (produces dist/)
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install runtime system dependencies (canvas, sqlite3 native libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install production + devDependencies needed for tsx to run server
RUN npm ci

# Run postinstall script
RUN node scripts/setup-tfjs-shim.js

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server source
COPY server.ts ./
COPY server/ ./server/
COPY tsconfig.json ./
COPY scripts/ ./scripts/

# Data directory for SQLite (will be mounted as volume)
RUN mkdir -p /data

ENV NODE_ENV=production
ENV SERVER_PORT=3001

EXPOSE 3001

CMD ["npx", "tsx", "server.ts"]
