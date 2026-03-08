#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${DB_PATH:-/data/data.db}"
BACKUP_DIR="${BACKUP_DIR:-/data/backups}"
DAILY_KEEP=7
WEEKLY_KEEP=4

mkdir -p "$BACKUP_DIR"

# WAL checkpoint before backup
sqlite3 "$DB_PATH" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null || true

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DAY_OF_WEEK=$(date +%u)
BACKUP_FILE="$BACKUP_DIR/data-$TIMESTAMP.db"

cp "$DB_PATH" "$BACKUP_FILE"
echo "[backup] Created: $BACKUP_FILE"

# Tag weekly backups (Sunday = day 7)
if [ "$DAY_OF_WEEK" -eq 7 ]; then
  WEEKLY_FILE="$BACKUP_DIR/weekly-$TIMESTAMP.db"
  cp "$BACKUP_FILE" "$WEEKLY_FILE"
  echo "[backup] Weekly backup: $WEEKLY_FILE"
fi

# Cleanup old daily backups (keep last N)
ls -t "$BACKUP_DIR"/data-*.db 2>/dev/null | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f

# Cleanup old weekly backups (keep last N)
ls -t "$BACKUP_DIR"/weekly-*.db 2>/dev/null | tail -n +$((WEEKLY_KEEP + 1)) | xargs -r rm -f

echo "[backup] Cleanup complete. Daily: $DAILY_KEEP kept, Weekly: $WEEKLY_KEEP kept."
