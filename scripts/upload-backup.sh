#!/bin/bash

# EduCreate 備份上傳腳本
# 用法: ./upload-backup.sh [備份目錄]

# 設置變量
BACKUP_DIR=${1:-"/var/backups/educreate"}
REMOTE_BUCKET="s3://educreate-backups"
TIMESTAMP=$(date +%Y%m%d)
AWS_PROFILE="educreate-backup"

# 檢查備份目錄是否存在
if [ ! -d "$BACKUP_DIR" ]; then
  echo "錯誤：備份目錄 $BACKUP_DIR 不存在"
  exit 1
fi

# 檢查是否有完成的備份
LATEST_BACKUP=$(find "$BACKUP_DIR" -type f -name "backup_completed" | sort -r | head -n 1 | xargs dirname)

if [ -z "$LATEST_BACKUP" ]; then
  echo "錯誤：在 $BACKUP_DIR 中找不到完成的備份"
  exit 1
fi

echo "找到最新備份：$LATEST_BACKUP"

# 創建壓縮文件
BACKUP_FILENAME="educreate-backup-$TIMESTAMP.tar.gz"
echo "正在創建壓縮文件..."
tar -czf "/tmp/$BACKUP_FILENAME" -C "$LATEST_BACKUP" .

# 上傳到S3
echo "正在上傳到遠程存儲..."
aws s3 cp "/tmp/$BACKUP_FILENAME" "$REMOTE_BUCKET/" --profile "$AWS_PROFILE"

# 清理臨時文件
rm "/tmp/$BACKUP_FILENAME"

# 設置生命週期策略（可選）
# aws s3api put-bucket-lifecycle-configuration --bucket educreate-backups --lifecycle-configuration file://lifecycle.json --profile "$AWS_PROFILE"

echo "備份上傳完成：$REMOTE_BUCKET/$BACKUP_FILENAME"