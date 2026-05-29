#!/usr/bin/env bash
# backup-db.sh — MongoDB Atlas snapshot via mongodump + Cloudinary/S3 upload
#
# Usage:  ./scripts/backup-db.sh
# Cron:   0 2 * * * /path/to/backup-db.sh >> /var/log/printcity-backup.log 2>&1
#
# Required env vars:
#   DATABASE_URL          — MongoDB connection string
#   BACKUP_BUCKET         — S3 bucket name  (e.g. my-backup-bucket)
#   AWS_ACCESS_KEY_ID     — AWS access key  (or configure via ~/.aws)
#   AWS_SECRET_ACCESS_KEY — AWS secret key
#   AWS_DEFAULT_REGION    — e.g. ap-southeast-1
#   BACKUP_RETENTION_DAYS — how many days to keep backups (default 30)

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/printcity_backup_${TIMESTAMP}"
ARCHIVE="${BACKUP_DIR}.tar.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

# ── Validate required env vars ────────────────────────────────────────────────
for VAR in DATABASE_URL BACKUP_BUCKET; do
  if [[ -z "${!VAR:-}" ]]; then
    echo "ERROR: $VAR is not set"
    exit 1
  fi
done

log "Starting backup — timestamp: $TIMESTAMP"

# ── Dump ──────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
mongodump --uri="$DATABASE_URL" --out="$BACKUP_DIR" --gzip

# ── Compress ──────────────────────────────────────────────────────────────────
tar -czf "$ARCHIVE" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
ARCHIVE_SIZE=$(du -sh "$ARCHIVE" | cut -f1)
log "Archive size: $ARCHIVE_SIZE"

# ── Upload to S3 ──────────────────────────────────────────────────────────────
S3_KEY="printcity/backups/$(date +%Y/%m/%d)/backup_${TIMESTAMP}.tar.gz"
aws s3 cp "$ARCHIVE" "s3://${BACKUP_BUCKET}/${S3_KEY}" \
  --storage-class STANDARD_IA \
  --metadata "created-by=backup-script,app=printcity"

log "Uploaded to s3://${BACKUP_BUCKET}/${S3_KEY}"

# ── Cleanup local files ────────────────────────────────────────────────────────
rm -rf "$BACKUP_DIR" "$ARCHIVE"
log "Local temp files cleaned up"

# ── Prune old backups ─────────────────────────────────────────────────────────
CUTOFF=$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)
log "Pruning backups older than $CUTOFF"
aws s3 ls "s3://${BACKUP_BUCKET}/printcity/backups/" --recursive \
  | awk '{print $4}' \
  | while read -r key; do
      FILE_DATE=$(echo "$key" | grep -oE '[0-9]{4}/[0-9]{2}/[0-9]{2}' | tr '/' '-' || true)
      if [[ -n "$FILE_DATE" && "$FILE_DATE" < "$CUTOFF" ]]; then
        aws s3 rm "s3://${BACKUP_BUCKET}/${key}"
        log "Deleted old backup: $key"
      fi
    done

log "Backup complete"
