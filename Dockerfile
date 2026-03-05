# ---- Stage 1: Builder ----
FROM node:20-bookworm AS builder

WORKDIR /app

# Install system dependencies required by canvas, better-sqlite3, face-api
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install deps, skip only the postinstall tfjs shim (uses require() in ESM package)
# Then rebuild native modules (better-sqlite3, canvas) with build tools
RUN npm ci --ignore-scripts && \
    npm rebuild better-sqlite3 canvas && \
    mkdir -p node_modules/@tensorflow/tfjs-node && \
    printf '{"name":"@tensorflow/tfjs-node","version":"0.0.0-shim","main":"index.js"}' \
      > node_modules/@tensorflow/tfjs-node/package.json && \
    printf 'module.exports = require("@tensorflow/tfjs");\n' \
      > node_modules/@tensorflow/tfjs-node/index.js

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

# Copy package.json for module resolution
COPY package.json ./

# Copy pre-compiled node_modules from builder (native .node files already compiled for linux/x64)
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server source + src/data (server imports syllabus data from src/)
COPY server.ts ./
COPY server/ ./server/
COPY src/data/ ./src/data/
COPY tsconfig.json ./
COPY scripts/ ./scripts/

# Data directory for SQLite (will be mounted as volume)
RUN mkdir -p /data

ENV NODE_ENV=production
ENV SERVER_PORT=8007

EXPOSE 8007

CMD ["npx", "tsx", "server.ts"]
