# 🐘 PostgreSQL 安裝配置完整指南

## 📋 已創建的工具文件

### 🔧 安裝工具
1. **`install-postgresql-auto.ps1`** - 自動安裝 PowerShell 腳本
2. **`install-postgresql.bat`** - 一鍵安裝批處理文件
3. **`setup-env.ps1`** - 環境變量配置腳本

### 🔍 檢查工具
4. **`check-postgresql-simple.bat`** - 簡單狀態檢查
5. **`quick-db-test.js`** - 數據庫連接測試 (如果存在)
6. **`fix-postgresql-connection.ps1`** - 連接修復腳本 (如果存在)

### 📊 追蹤文件
7. **`postgresql-progress.md`** - 進度追蹤文檔
8. **`POSTGRESQL-SETUP-GUIDE.md`** - 原始安裝指南

## 🚀 推薦安裝流程

### 步驟 1: 系統檢查
```bash
# 運行系統檢查
check-postgresql-simple.bat
```

### 步驟 2: 自動安裝 (推薦)
```bash
# 方法 A: 雙擊運行
install-postgresql.bat

# 方法 B: 直接運行 PowerShell 腳本
# 以管理員身份打開 PowerShell，然後運行:
PowerShell -ExecutionPolicy Bypass -File install-postgresql-auto.ps1
```

### 步驟 3: 環境配置
```bash
# 配置環境變量
PowerShell -ExecutionPolicy Bypass -File setup-env.ps1
```

### 步驟 4: 驗證安裝
```bash
# 再次檢查狀態
check-postgresql-simple.bat

# 測試數據庫連接 (如果存在測試腳本)
node quick-db-test.js
```

## 📝 手動安裝步驟 (備選方案)

### 1. 安裝 Chocolatey
```powershell
# 以管理員身份運行 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 2. 安裝 PostgreSQL
```powershell
# 使用 Chocolatey 安裝
choco install postgresql14 --params '/Password:password' -y

# 或下載官方安裝程序
# https://www.postgresql.org/download/windows/
```

### 3. 啟動服務
```cmd
# 啟動 PostgreSQL 服務
net start postgresql-x64-14

# 檢查服務狀態
sc query postgresql-x64-14
```

### 4. 創建數據庫
```cmd
# 設置密碼環境變量
set PGPASSWORD=password

# 創建數據庫
createdb -U postgres -h localhost educreate
```

### 5. 配置環境變量
創建 `.env.local` 文件:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/educreate"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 🔧 故障排除

### 問題 1: 服務無法啟動
**解決方案**:
1. 檢查端口占用: `netstat -an | findstr :5432`
2. 檢查事件日誌: `eventvwr.msc`
3. 重新安裝 PostgreSQL

### 問題 2: 權限不足
**解決方案**:
1. 以管理員身份運行所有腳本
2. 檢查 UAC 設置
3. 確保用戶有安裝軟件的權限

### 問題 3: 連接被拒絕
**解決方案**:
1. 確認服務正在運行
2. 檢查防火牆設置
3. 驗證用戶名和密碼
4. 檢查 `pg_hba.conf` 配置

### 問題 4: 數據庫不存在
**解決方案**:
```sql
-- 連接到 PostgreSQL
psql -U postgres -h localhost

-- 創建數據庫
CREATE DATABASE educreate;

-- 退出
\q
```

## 📊 安裝驗證清單

完成安裝後，請確認以下項目:

- [ ] PostgreSQL 服務正在運行
- [ ] 端口 5432 可訪問
- [ ] 可以使用 psql 連接
- [ ] 創建了 educreate 數據庫
- [ ] 配置了正確的 DATABASE_URL
- [ ] Prisma 可以連接到數據庫
- [ ] 可以運行 `npx prisma db pull`
- [ ] 開發服務器可以正常啟動

## 🎯 完成後的下一步

1. **安裝項目依賴**:
   ```bash
   npm install
   ```

2. **初始化數據庫**:
   ```bash
   npx prisma db push
   ```

3. **啟動開發服務器**:
   ```bash
   npm run dev
   ```

4. **測試應用**:
   - 訪問 `http://localhost:3000`
   - 測試註冊功能
   - 驗證數據庫連接

## 📞 獲取幫助

如果遇到問題:
1. 查看生成的日誌文件
2. 運行診斷腳本
3. 檢查 PostgreSQL 官方文檔
4. 搜索相關錯誤信息

## 📁 文件說明

### 自動生成的文件
- `postgresql-install-log-*.txt` - 安裝日誌
- `postgresql-completion-report-*.txt` - 完成報告
- `.env.local.backup-*` - 環境文件備份
- `test-env-connection.js` - 連接測試腳本

### 重要提醒
- 不要將 `.env.local` 提交到版本控制
- 定期備份數據庫
- 生產環境使用更強的密碼
- 及時更新 PostgreSQL 版本

---

**創建時間**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**適用系統**: Windows 10/11
**PostgreSQL 版本**: 14+
**狀態**: ✅ 工具已準備就緒