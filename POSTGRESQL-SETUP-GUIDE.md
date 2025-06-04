# 🐘 PostgreSQL 安裝和配置指南

## 🚀 快速檢查

### 1. 檢查 PostgreSQL 服務狀態
```bash
# Windows 批處理版本
check-postgresql.bat

# PowerShell 版本（推薦）
PowerShell -ExecutionPolicy Bypass -File check-postgresql.ps1
```

### 2. 測試數據庫連接
```bash
node test-database-connection.js
```

## 📥 PostgreSQL 安裝

### 方法 1: 官方安裝程序（推薦）

1. **下載 PostgreSQL**
   - 訪問: https://www.postgresql.org/download/windows/
   - 選擇最新穩定版本（建議 14.x 或 15.x）
   - 下載 Windows x86-64 安裝程序

2. **安裝步驟**
   ```
   ✅ 運行安裝程序
   ✅ 選擇安裝目錄（默認: C:\Program Files\PostgreSQL\14）
   ✅ 選擇組件:
      - PostgreSQL Server ✓
      - pgAdmin 4 ✓
      - Stack Builder ✓
      - Command Line Tools ✓
   ✅ 設置數據目錄（默認: C:\Program Files\PostgreSQL\14\data）
   ✅ 設置超級用戶密碼（記住這個密碼！）
   ✅ 設置端口（默認: 5432）
   ✅ 選擇語言環境（默認: Chinese, China）
   ✅ 完成安裝
   ```

3. **驗證安裝**
   ```bash
   # 檢查服務
   sc query postgresql-x64-14
   
   # 檢查端口
   netstat -an | findstr :5432
   ```

### 方法 2: 使用 Chocolatey

```powershell
# 安裝 Chocolatey（如果未安裝）
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安裝 PostgreSQL
choco install postgresql14 -y
```

### 方法 3: 使用 Docker（開發環境）

```bash
# 拉取 PostgreSQL 鏡像
docker pull postgres:14

# 運行 PostgreSQL 容器
docker run --name educreate-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=educreate \
  -p 5432:5432 \
  -d postgres:14
```

## ⚙️ 配置 PostgreSQL

### 1. 創建數據庫和用戶

```sql
-- 連接到 PostgreSQL（使用 psql 或 pgAdmin）
psql -U postgres -h localhost

-- 創建數據庫
CREATE DATABASE educreate;

-- 創建用戶
CREATE USER educreate_user WITH PASSWORD 'your_password';

-- 授予權限
GRANT ALL PRIVILEGES ON DATABASE educreate TO educreate_user;

-- 退出
\q
```

### 2. 配置環境變量

在 `.env.local` 文件中添加：

```env
# PostgreSQL 數據庫連接
DATABASE_URL="postgresql://educreate_user:your_password@localhost:5432/educreate"

# 或使用默認 postgres 用戶
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/educreate"
```

### 3. 測試連接

```bash
# 使用 Prisma 測試連接
npx prisma db pull

# 或使用我們的測試腳本
node test-database-connection.js
```

## 🔧 常見問題解決

### 問題 1: 服務無法啟動

**症狀**: `net start postgresql-x64-14` 失敗

**解決方案**:
```bash
# 1. 檢查服務狀態
sc query postgresql-x64-14

# 2. 檢查事件日誌
eventvwr.msc
# 導航到: Windows 日誌 > 應用程序

# 3. 檢查數據目錄權限
# 確保 PostgreSQL 服務帳戶有權訪問數據目錄

# 4. 重新初始化數據庫（謹慎使用）
"C:\Program Files\PostgreSQL\14\bin\initdb.exe" -D "C:\Program Files\PostgreSQL\14\data" -U postgres
```

### 問題 2: 端口被佔用

**症狀**: 端口 5432 被其他程序使用

**解決方案**:
```bash
# 1. 查找佔用端口的程序
netstat -ano | findstr :5432

# 2. 終止進程（替換 PID）
taskkill /PID <PID> /F

# 3. 或更改 PostgreSQL 端口
# 編輯: C:\Program Files\PostgreSQL\14\data\postgresql.conf
# 修改: port = 5433
# 重啟服務
```

### 問題 3: 認證失敗

**症狀**: `authentication failed for user`

**解決方案**:
```bash
# 1. 重置 postgres 用戶密碼
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';

# 2. 檢查 pg_hba.conf 配置
# 文件位置: C:\Program Files\PostgreSQL\14\data\pg_hba.conf
# 確保有以下行:
# host    all             all             127.0.0.1/32            md5

# 3. 重啟 PostgreSQL 服務
net stop postgresql-x64-14
net start postgresql-x64-14
```

### 問題 4: 數據庫不存在

**症狀**: `database "educreate" does not exist`

**解決方案**:
```bash
# 1. 連接到 PostgreSQL
psql -U postgres -h localhost

# 2. 創建數據庫
CREATE DATABASE educreate;

# 3. 或使用 Prisma 推送架構
npx prisma db push
```

## 🛠️ 維護和優化

### 定期維護

```sql
-- 清理和分析數據庫
VACUUM ANALYZE;

-- 重建索引
REINDEX DATABASE educreate;

-- 檢查數據庫大小
SELECT pg_size_pretty(pg_database_size('educreate'));
```

### 性能優化

```sql
-- 檢查慢查詢
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 檢查索引使用情況
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### 備份和恢復

```bash
# 備份數據庫
pg_dump -U postgres -h localhost educreate > backup.sql

# 恢復數據庫
psql -U postgres -h localhost educreate < backup.sql

# 自動備份腳本
echo "pg_dump -U postgres -h localhost educreate > backup_%date:~0,4%%date:~5,2%%date:~8,2%.sql" > backup.bat
```

## 📋 檢查清單

安裝完成後，請確認以下項目：

- [ ] PostgreSQL 服務正在運行
- [ ] 端口 5432 可訪問
- [ ] 可以使用 psql 連接
- [ ] 創建了 educreate 數據庫
- [ ] 配置了正確的 DATABASE_URL
- [ ] Prisma 可以連接到數據庫
- [ ] 可以運行 `npx prisma db pull`

## 🆘 獲取幫助

如果仍有問題：

1. **檢查日誌**:
   - PostgreSQL 日誌: `C:\Program Files\PostgreSQL\14\data\log\`
   - Windows 事件日誌: `eventvwr.msc`

2. **運行診斷**:
   ```bash
   node test-database-connection.js
   ```

3. **社區支持**:
   - PostgreSQL 官方文檔: https://www.postgresql.org/docs/
   - Stack Overflow: https://stackoverflow.com/questions/tagged/postgresql

---

**最後更新**: 2024年12月
**適用版本**: PostgreSQL 12+, Windows 10/11