# PostgreSQL 快速安裝指南

## 🚀 快速安裝 PostgreSQL

### 方法 1: 官方安裝程序（推薦）

1. **下載安裝程序**
   - 訪問：https://www.postgresql.org/download/windows/
   - 下載 PostgreSQL 14 或更高版本

2. **安裝步驟**
   ```
   - 運行下載的 .exe 文件
   - 選擇安裝目錄（默認即可）
   - 選擇組件（全部勾選）
   - 設置數據目錄（默認即可）
   - 設置超級用戶密碼：password
   - 設置端口：5432（默認）
   - 選擇語言環境（默認即可）
   - 完成安裝
   ```

### 方法 2: 使用 Chocolatey

```powershell
# 安裝 Chocolatey（如果未安裝）
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安裝 PostgreSQL
choco install postgresql --params '/Password:password'
```

### 方法 3: 使用 Docker（開發環境）

```bash
# 拉取並運行 PostgreSQL 容器
docker run --name postgres-educreate \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=educreate \
  -p 5432:5432 \
  -d postgres:14
```

## 🔧 安裝後配置

### 1. 驗證安裝

```powershell
# 檢查服務狀態
Get-Service postgresql*

# 檢查端口
Get-NetTCPConnection -LocalPort 5432
```

### 2. 創建數據庫

```bash
# 使用 psql 命令行
psql -U postgres
CREATE DATABASE educreate;
\q

# 或使用 createdb 命令
createdb -U postgres educreate
```

### 3. 測試連接

```bash
# 運行我們的測試腳本
node quick-db-test.js

# 或使用 Prisma
npx prisma db push
```

## 🐛 常見問題解決

### 問題 1: 服務無法啟動

```powershell
# 檢查服務狀態
Get-Service postgresql*

# 手動啟動服務
Start-Service postgresql-x64-14

# 或使用 net 命令
net start postgresql-x64-14
```

### 問題 2: 端口被占用

```powershell
# 查看占用端口的進程
Get-NetTCPConnection -LocalPort 5432 | Select-Object OwningProcess
Get-Process -Id <進程ID>

# 如果是其他 PostgreSQL 實例，停止它
Stop-Service postgresql*
```

### 問題 3: 認證失敗

1. **重置密碼**
   ```bash
   # 編輯 pg_hba.conf 文件
   # 將 md5 改為 trust，重啟服務
   # 然後重置密碼
   psql -U postgres
   ALTER USER postgres PASSWORD 'password';
   ```

2. **檢查配置文件**
   - 位置：`C:\Program Files\PostgreSQL\14\data\pg_hba.conf`
   - 確保有以下行：
     ```
     host    all             all             127.0.0.1/32            md5
     ```

### 問題 4: 數據庫不存在

```sql
-- 連接到 PostgreSQL
psql -U postgres

-- 創建數據庫
CREATE DATABASE educreate;

-- 授予權限
GRANT ALL PRIVILEGES ON DATABASE educreate TO postgres;

-- 退出
\q
```

## 🎯 快速修復命令

```bash
# 一鍵修復腳本
powershell -ExecutionPolicy Bypass -File fix-postgresql-connection.ps1

# 或運行完整修復
fix-register-now.bat
```

## 📞 獲取幫助

如果仍有問題：
1. 檢查 Windows 事件日誌
2. 查看 PostgreSQL 日誌文件
3. 運行診斷腳本：`quick-diagnosis.js`
4. 參考官方文檔：https://www.postgresql.org/docs/

---

**注意**：確保以管理員身份運行所有命令和腳本。