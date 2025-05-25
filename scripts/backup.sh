#!/bin/bash

# EduCreate 自動備份腳本
# 用法: ./backup.sh [備份目錄]

# 設置變量
BACKUP_DIR=${1:-"/var/backups/educreate"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="educreate_db_1"
DB_USER="postgres"
DB_NAME="educreate"
MINIO_CONTAINER="educreate_minio_1"
APP_CONTAINER="educreate_app_1"

# 創建備份目錄
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# 備份數據庫
echo "正在備份數據庫..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c -f /tmp/db_backup.dump
docker cp $DB_CONTAINER:/tmp/db_backup.dump "$BACKUP_DIR/$TIMESTAMP/db_backup.dump"
docker exec $DB_CONTAINER rm /tmp/db_backup.dump

# 備份MinIO數據
echo "正在備份MinIO數據..."
docker exec $MINIO_CONTAINER sh -c "cd /data && tar -czf /tmp/minio_backup.tar.gz ."
docker cp $MINIO_CONTAINER:/tmp/minio_backup.tar.gz "$BACKUP_DIR/$TIMESTAMP/minio_backup.tar.gz"
docker exec $MINIO_CONTAINER rm /tmp/minio_backup.tar.gz

# 備份應用日誌
echo "正在備份應用日誌..."
docker exec $APP_CONTAINER sh -c "cd /app/logs && tar -czf /tmp/logs_backup.tar.gz ."
docker cp $APP_CONTAINER:/tmp/logs_backup.tar.gz "$BACKUP_DIR/$TIMESTAMP/logs_backup.tar.gz"
docker exec $APP_CONTAINER rm /tmp/logs_backup.tar.gz

# 清理舊備份（保留最近30天的備份）
echo "正在清理舊備份..."
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

# 創建備份完成標記
touch "$BACKUP_DIR/$TIMESTAMP/backup_completed"

echo "備份完成：$BACKUP_DIR/$TIMESTAMP"