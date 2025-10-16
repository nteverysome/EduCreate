# Phase 3: 本地開發環境設置 - 執行計畫

## 📅 計畫信息
- **開始時間**: 2025-10-16
- **預計耗時**: 30 分鐘
- **狀態**: 準備開始
- **風險等級**: 低（僅影響本地開發環境）

## 🎯 目標

設置完整的本地開發環境，使用本地 PostgreSQL 資料庫，實現與 Production 和 Preview 環境的完全隔離。

## 📋 執行步驟

### 步驟 1: 檢查系統狀態 ✅ COMPLETE

**檢查結果**:
- ❌ PostgreSQL 未安裝
- ✅ Node.js 已安裝
- ✅ npm 已安裝
- ✅ Prisma CLI 可用

### 步驟 2: 安裝 PostgreSQL 17 ⏳ PENDING

#### 選項 A: 使用官方安裝程式（推薦）

**下載連結**: https://www.postgresql.org/download/windows/

**安裝步驟**:
1. 下載 PostgreSQL 17 Windows 安裝程式
2. 運行安裝程式
3. 選擇安裝組件:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (圖形化管理工具)
   - ✅ Command Line Tools
   - ✅ Stack Builder (可選)
4. 設置資料庫超級用戶密碼（建議: `postgres`）
5. 選擇端口（預設: 5432）
6. 選擇語言環境（預設: Chinese, China）
7. 完成安裝

**預計時間**: 10-15 分鐘

#### 選項 B: 使用 Chocolatey（命令行安裝）

```powershell
# 安裝 Chocolatey (如果尚未安裝)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安裝 PostgreSQL
choco install postgresql17 -y
```

**預計時間**: 5-10 分鐘

#### 選項 C: 使用 Docker（輕量級方案）

```powershell
# 拉取 PostgreSQL 17 映像
docker pull postgres:17

# 運行 PostgreSQL 容器
docker run --name educreate-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=educreate_dev `
  -p 5432:5432 `
  -d postgres:17
```

**預計時間**: 2-5 分鐘

### 步驟 3: 驗證 PostgreSQL 安裝 ⏳ PENDING

```powershell
# 檢查 PostgreSQL 版本
psql --version

# 測試連接
psql -U postgres -c "SELECT version();"
```

**預期輸出**:
```
psql (PostgreSQL) 17.x
PostgreSQL 17.x on x86_64-pc-windows-msvc, compiled by Visual C++ build xxxx, 64-bit
```

### 步驟 4: 創建本地資料庫 ⏳ PENDING

```powershell
# 連接到 PostgreSQL
psql -U postgres

# 創建資料庫
CREATE DATABASE educreate_dev;

# 創建專用用戶（可選，建議）
CREATE USER educreate_user WITH PASSWORD 'educreate_password';

# 授予權限
GRANT ALL PRIVILEGES ON DATABASE educreate_dev TO educreate_user;

# 退出
\q
```

### 步驟 5: 更新本地 .env 文件 ⏳ PENDING

**當前 .env 文件狀態**:
- 需要檢查是否存在 `.env` 或 `.env.local`
- 需要添加或更新 `DATABASE_URL`

**新的 DATABASE_URL 配置**:

#### 選項 A: 使用 postgres 超級用戶（簡單）
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/educreate_dev?schema=public"
```

#### 選項 B: 使用專用用戶（推薦）
```env
DATABASE_URL="postgresql://educreate_user:educreate_password@localhost:5432/educreate_dev?schema=public"
```

### 步驟 6: 運行 Prisma 遷移 ⏳ PENDING

```powershell
# 生成 Prisma Client
npx prisma generate

# 運行所有遷移
npx prisma migrate deploy

# 或者重置資料庫並運行遷移（開發環境）
npx prisma migrate reset --force
```

**預期結果**:
- 所有遷移成功應用
- 資料庫 schema 與 Production 一致
- Prisma Client 生成成功

### 步驟 7: 測試本地開發伺服器 ⏳ PENDING

```powershell
# 啟動開發伺服器
npm run dev
```

**驗證項目**:
1. ✅ 伺服器成功啟動（通常在 http://localhost:3000）
2. ✅ 可以連接到本地資料庫
3. ✅ 可以訪問主頁
4. ✅ 可以登入（如果有測試帳號）
5. ✅ 可以創建測試活動

### 步驟 8: 創建測試數據（可選） ⏳ PENDING

```powershell
# 運行 seed 腳本（如果有）
npx prisma db seed

# 或者手動創建測試數據
node scripts/create-test-data.js
```

## 🔍 驗證檢查清單

### PostgreSQL 安裝驗證
- [ ] `psql --version` 顯示 PostgreSQL 17.x
- [ ] 可以使用 `psql -U postgres` 連接
- [ ] pgAdmin 4 可以正常啟動（如果安裝）

### 資料庫創建驗證
- [ ] `educreate_dev` 資料庫存在
- [ ] 可以連接到 `educreate_dev`
- [ ] 用戶權限正確設置

### Prisma 遷移驗證
- [ ] 所有遷移成功應用
- [ ] `prisma studio` 可以打開並顯示資料表
- [ ] 資料表結構與 schema.prisma 一致

### 開發伺服器驗證
- [ ] `npm run dev` 成功啟動
- [ ] 可以訪問 http://localhost:3000
- [ ] 資料庫連接正常（無連接錯誤）
- [ ] 可以執行基本操作（登入、創建活動等）

## ⚠️ 常見問題和解決方案

### 問題 1: PostgreSQL 安裝失敗
**症狀**: 安裝程式報錯或無法完成
**解決方案**:
1. 檢查系統是否有足夠的磁碟空間（至少 1GB）
2. 以管理員身份運行安裝程式
3. 關閉防毒軟體暫時
4. 嘗試使用 Docker 方案

### 問題 2: psql 命令找不到
**症狀**: `psql: 无法将"psql"项识别为 cmdlet`
**解決方案**:
1. 添加 PostgreSQL bin 目錄到 PATH:
   ```powershell
   $env:Path += ";C:\Program Files\PostgreSQL\17\bin"
   ```
2. 或者使用完整路徑:
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" --version
   ```

### 問題 3: 資料庫連接失敗
**症狀**: `Error: P1001: Can't reach database server`
**解決方案**:
1. 檢查 PostgreSQL 服務是否運行:
   ```powershell
   Get-Service postgresql*
   ```
2. 啟動服務:
   ```powershell
   Start-Service postgresql-x64-17
   ```
3. 檢查防火牆設置（端口 5432）

### 問題 4: Prisma 遷移失敗
**症狀**: 遷移過程中出現錯誤
**解決方案**:
1. 檢查 DATABASE_URL 格式是否正確
2. 確認資料庫存在且可訪問
3. 檢查用戶權限
4. 查看詳細錯誤訊息並根據提示修復

## 📊 環境隔離架構（Phase 3 完成後）

```
┌─────────────────────────────────────────────────────────┐
│                    EduCreate 環境架構                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Production Environment (Vercel)                         │
│  ├─ DATABASE_URL (Production)                           │
│  └─ → Neon Production Branch                            │
│      (br-curly-salad-a85exs3f)                          │
│      📊 生產數據，完全保護                               │
│                                                          │
│  Preview Environment (Vercel)                            │
│  ├─ DATABASE_URL (Preview)                              │
│  └─ → Neon Preview Branch                               │
│      (br-winter-smoke-a8fhvngp)                         │
│      🧪 測試環境，安全隔離                               │
│                                                          │
│  Development Environment (Local)                         │
│  ├─ DATABASE_URL (Local .env)                           │
│  └─ → Local PostgreSQL                                  │
│      (localhost:5432/educreate_dev)                     │
│      💻 本地開發，完全獨立                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 成功標準

Phase 3 完成的標準：
1. ✅ PostgreSQL 17 成功安裝並運行
2. ✅ `educreate_dev` 資料庫創建成功
3. ✅ 本地 `.env` 文件配置正確
4. ✅ Prisma 遷移成功應用
5. ✅ 開發伺服器可以正常啟動
6. ✅ 可以連接到本地資料庫
7. ✅ 基本功能測試通過

## 📝 下一步

Phase 3 完成後，將進入：
- **Phase 4**: 數據遷移和測試
- **Phase 5**: 文檔和監控

---

**文檔創建時間**: 2025-10-16
**創建者**: AI Assistant
**狀態**: 等待用戶確認安裝方案

