#!/bin/bash
set -e

echo "[lab-setup] Starting common setup..."

# Create base student user if not exists (pre-created in Dockerfile; this is a fallback)
id -u student &>/dev/null || useradd -m -s /bin/bash student || true

# Run module-specific setup if LAB_MODULE is set
if [ "$LAB_MODULE" -gt 0 ] 2>/dev/null; then
  SCRIPT="/opt/lab-setup/module-${LAB_MODULE}.sh"
  if [ -f "$SCRIPT" ]; then
    echo "[lab-setup] Running module $LAB_MODULE setup..."
    bash "$SCRIPT"
    echo "[lab-setup] Module $LAB_MODULE setup complete."
  else
    echo "[lab-setup] No setup script for module $LAB_MODULE"
  fi
fi

# Signal that setup is done
touch /tmp/.lab-setup-done
echo "[lab-setup] Ready."

# Execute CMD (default: sleep infinity)
exec "$@"
