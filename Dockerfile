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

# Install deps without postinstall scripts, then rebuild native modules
# and download the real @tensorflow/tfjs-node pre-built binary
RUN npm ci --ignore-scripts && \
    npm rebuild better-sqlite3 canvas && \
    npm rebuild @tensorflow/tfjs-node

# Copy source
COPY . .

# Build frontend (produces dist/)
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install runtime system dependencies (canvas, sqlite3 native libs, libtensorflow)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    libstdc++6 libgomp1 \
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
RUN mkdir -p /data && chown -R node:node /app /data

USER node

ENV NODE_ENV=production
ENV SERVER_PORT=8007

EXPOSE 8007

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8007/api/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["npx", "tsx", "server.ts"]
