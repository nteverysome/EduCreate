# EduCreate 部署指南

本文檔提供了 EduCreate 平台的部署流程、監控設置和備份策略的詳細說明。

## 目錄

1. [生產環境配置](#生產環境配置)
2. [監控和日誌設置](#監控和日誌設置)
3. [備份策略](#備份策略)
4. [CI/CD 流程](#cicd-流程)

## 生產環境配置

### 環境變量設置

1. 複製 `.env.prod.example` 文件為 `.env.prod`：

```bash
cp .env.prod.example .env.prod
```

2. 編輯 `.env.prod` 文件，填入實際的生產環境值。

### 使用 Docker Compose 部署

1. 使用生產環境的 Docker Compose 文件啟動服務：

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

2. 初始化數據庫：

```bash
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 安全配置

生產環境使用了以下安全措施：

- 使用非 root 用戶運行應用
- 容器自動重啟策略
- 數據庫和服務健康檢查
- 環境變量分離

## 監控和日誌設置

### 日誌系統

EduCreate 使用 Winston 日誌庫進行日誌記錄，配置如下：

- 日誌文件每日輪轉
- 錯誤日誌單獨存儲
- 生產環境中集成 Sentry 進行錯誤追蹤

日誌文件存儲在 `/app/logs` 目錄中，可以通過 Docker 卷訪問。

### 監控系統

監控系統由以下組件組成：

1. **Prometheus**：收集和存儲指標數據
2. **Grafana**：可視化監控數據

訪問監控界面：
- Prometheus: http://your-domain.com:9090
- Grafana: http://your-domain.com:3001 (默認用戶名/密碼在 `.env.prod` 中設置)

### 監控指標

主要監控指標包括：

- 應用性能指標
- 數據庫性能指標
- Redis 緩存指標
- 系統資源使用情況

## 備份策略

### 自動備份

EduCreate 使用自動化腳本進行定期備份：

1. **每日備份**：每天凌晨 3 點執行
2. **週備份**：每週日凌晨 2 點執行並上傳到遠程存儲

備份內容包括：

- 數據庫完整備份
- MinIO 對象存儲數據
- 應用日誌

### 設置備份計劃

1. 編輯 `scripts/backup-cron` 文件，設置正確的路徑
2. 將其添加到 cron 任務：

```bash
sudo cp scripts/backup-cron /etc/cron.d/educreate-backup
sudo chmod 644 /etc/cron.d/educreate-backup
```

### 備份恢復

從備份恢復數據：

```bash
# 恢復數據庫
docker exec educreate_db_1 pg_restore -U postgres -d educreate -c /path/to/db_backup.dump

# 恢復 MinIO 數據
docker exec educreate_minio_1 sh -c "cd /data && tar -xzf /path/to/minio_backup.tar.gz"
```

## CI/CD 流程

EduCreate 使用 GitHub Actions 進行 CI/CD 自動化：

1. **測試階段**：運行單元測試和集成測試
2. **構建階段**：構建應用並上傳構建產物
3. **部署階段**：將構建產物部署到生產服務器

### 部署流程

1. 代碼推送到 `main` 分支觸發 CI/CD 流程
2. 通過 SSH 將構建產物傳輸到生產服務器
3. 在生產服務器上重啟應用

### 手動部署

如需手動部署，請執行：

```bash
git pull
npm ci
npm run build
npx prisma migrate deploy
pm2 restart educreate
```