#!/bin/bash
# One-time server setup script
# Run this ONCE on the server: bash setup-server.sh
# Usage: SERVER_HOST=103.105.79.91 bash setup-server.sh

set -e

SERVER_HOST="${SERVER_HOST:-103.105.79.91}"
APP_DIR="/root/biulms"

echo "=== BIULMS Server Setup ==="
echo "Server: $SERVER_HOST"

# Prompt for secrets
read -rp "GitHub repo (e.g. adhityaranggap/LMS): " GITHUB_REPO
read -rp "GEMINI_API_KEY: " GEMINI_API_KEY
read -rp "JWT_SECRET (leave blank to auto-generate): " JWT_SECRET
read -rp "LECTURER_DEFAULT_PASSWORD (default: admin123): " LECTURER_PASS
read -rp "GROQ_API_KEY: " GROQ_API_KEY
read -rp "PHOTO_ENCRYPTION_KEY (leave blank to auto-generate): " PHOTO_KEY

LECTURER_PASS="${LECTURER_PASS:-admin123}"

ssh -o StrictHostKeyChecking=no "root@${SERVER_HOST}" bash << REMOTE
set -e

# Generate secrets if not provided
JWT_SECRET="${JWT_SECRET}"
PHOTO_KEY="${PHOTO_KEY}"
if [ -z "\$JWT_SECRET" ]; then
  JWT_SECRET=\$(openssl rand -hex 32)
  echo "Generated JWT_SECRET: \$JWT_SECRET"
fi
if [ -z "\$PHOTO_KEY" ]; then
  PHOTO_KEY=\$(openssl rand -hex 32)
  echo "Generated PHOTO_ENCRYPTION_KEY: \$PHOTO_KEY"
fi

# Install git if missing
apt-get install -y git 2>/dev/null || true

# Clone repo
if [ ! -d "${APP_DIR}/.git" ]; then
  git clone "https://github.com/${GITHUB_REPO}.git" "${APP_DIR}"
fi

cd "${APP_DIR}"

# Create data directory for SQLite persistence
mkdir -p data

# Create .env.local
cat > .env.local << EOF
GEMINI_API_KEY=${GEMINI_API_KEY}
JWT_SECRET=\${JWT_SECRET}
LECTURER_DEFAULT_PASSWORD=${LECTURER_PASS}
GROQ_API_KEY=${GROQ_API_KEY}
PHOTO_ENCRYPTION_KEY=\${PHOTO_KEY}
ALLOWED_ORIGIN=http://${SERVER_HOST}
SERVER_PORT=3001
NODE_ENV=production
EOF

echo ".env.local created."

# First deploy
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "=== Setup Complete ==="
echo "App: http://${SERVER_HOST}"
echo "DB seeded automatically on first startup."
REMOTE

echo ""
echo "=== Done! Now add these GitHub Secrets ==="
echo "  SERVER_HOST = $SERVER_HOST"
echo "  SERVER_USER = root"
echo "  SSH_PRIVATE_KEY = (your private SSH key, e.g. cat ~/.ssh/id_rsa)"
