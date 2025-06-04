# PostgreSQL 安裝配置進度追蹤

## 📋 安裝檢查清單

### 🔧 系統準備
- [ ] 管理員權限確認
- [ ] 檢查現有 PostgreSQL 安裝
- [ ] 檢查端口 5432 可用性
- [ ] 檢查 Chocolatey 安裝狀態

### 📦 軟件安裝
- [ ] Chocolatey 安裝 (如需要)
- [ ] PostgreSQL 14 安裝
- [ ] PostgreSQL 服務啟動
- [ ] 服務狀態驗證

### 🗄️ 數據庫配置
- [ ] 創建 `educreate` 數據庫
- [ ] 配置數據庫用戶權限
- [ ] 測試數據庫連接
- [ ] 運行 Prisma 遷移

### ⚙️ 環境配置
- [ ] 創建/更新 `.env.local` 文件
- [ ] 配置 `DATABASE_URL` 環境變量
- [ ] 驗證環境變量正確性

### 🧪 功能測試
- [ ] 數據庫連接測試通過
- [ ] Prisma 連接測試通過
- [ ] 註冊功能測試通過
- [ ] 開發服務器啟動正常

## 🚀 快速開始

### 方法 1: 一鍵安裝 (推薦)
```bash
# 雙擊運行
install-postgresql.bat
```

### 方法 2: PowerShell 直接運行
```powershell
# 以管理員身份運行 PowerShell
PowerShell -ExecutionPolicy Bypass -File install-postgresql-auto.ps1
```

### 方法 3: 手動步驟安裝
1. 安裝 Chocolatey
2. 使用 Chocolatey 安裝 PostgreSQL
3. 配置數據庫
4. 測試連接

## 📊 當前狀態

**安裝狀態**: 🔄 準備中
**完成度**: 0%
**最後更新**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## 🔍 故障排除

### 常見問題

#### 1. 服務無法啟動
**症狀**: PostgreSQL 服務啟動失敗
**解決方案**:
- 檢查端口 5432 是否被占用
- 檢查數據目錄權限
- 查看 Windows 事件日誌

#### 2. 數據庫連接失敗
**症狀**: 無法連接到 PostgreSQL
**解決方案**:
- 確認服務正在運行
- 檢查防火牆設置
- 驗證用戶名和密碼

#### 3. Prisma 遷移失敗
**症狀**: `npx prisma db push` 失敗
**解決方案**:
- 確認 DATABASE_URL 配置正確
- 檢查數據庫是否存在
- 驗證用戶權限

## 📝 安裝日誌

安裝過程中的詳細日誌將保存在:
- `postgresql-install-log-YYYYMMDD-HHMMSS.txt`
- `postgresql-completion-report-YYYYMMDD-HHMMSS.txt`

## 🆘 獲取幫助

如果遇到問題，請:
1. 查看安裝日誌文件
2. 運行診斷腳本: `fix-postgresql-connection.ps1`
3. 手動測試連接: `node quick-db-test.js`
4. 檢查 PostgreSQL 官方文檔

## 📋 驗證清單

安裝完成後，請確認以下項目:

```bash
# 1. 檢查服務狀態
sc query postgresql-x64-14

# 2. 檢查端口
netstat -an | findstr :5432

# 3. 測試連接
psql -U postgres -h localhost -c "\l"

# 4. 檢查數據庫
psql -U postgres -h localhost -c "\c educreate"

# 5. 測試 Prisma
npx prisma db pull

# 6. 啟動開發服務器
npm run dev
```

---

**最後更新**: 2024年12月
**適用版本**: PostgreSQL 14+, Windows 10/11
**狀態**: 🔄 進行中