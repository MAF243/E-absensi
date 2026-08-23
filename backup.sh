#!/bin/bash

# E-Absensi Database Backup Script
# This script executes mysqldump inside the Docker container and compresses the output.

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="eabsensi_db"
DB_USER="root"
# We read the DB password and DB name from the backend/.env file
ENV_FILE="./backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

source $ENV_FILE

if [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: DB_PASSWORD or DB_NAME is missing in the .env file."
    exit 1
fi

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting database backup for $DB_NAME..."

# Execute mysqldump inside the container and compress it
docker exec $CONTAINER_NAME /usr/bin/mysqldump -u $DB_USER --password=$DB_PASSWORD $DB_NAME | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup successfully created at: $BACKUP_FILE"
else
    echo "❌ Backup failed."
    exit 1
fi

# Retention policy: Keep only the last 7 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
echo "Cleanup: Removed backups older than 7 days."
