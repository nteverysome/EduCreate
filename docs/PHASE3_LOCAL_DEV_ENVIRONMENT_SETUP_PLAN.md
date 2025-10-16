# Phase 3: 本地開發環境設置計畫

**執行日期**: 2025-10-16  
**狀態**: 🔄 執行中  
**預計完成時間**: 30 分鐘

---

## 🎯 目標

為本地開發環境設置獨立的數據庫，確保本地開發不會影響 Production 和 Preview 環境。

---

## 📋 當前狀態分析

### 本地環境檢查結果

1. **PostgreSQL 安裝狀態**: ❌ 未安裝
2. **現有 .env 文件**: ✅ 存在 7 個環境配置文件
3. **當前 .env.local 配置**: ⚠️ 使用 Production 數據庫

### 當前 .env.local 配置

```env
DATABASE_URL="postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="https://edu-create.vercel.app"
NEXTAUTH_SECRET="educreate-dev-secret-key-2024"
NODE_ENV="production"
```

**問題**: 本地開發環境直接連接到 Production 數據庫，存在數據污染風險。

---

## 🔧 實施方案

### 選項 1: 使用 Neon Dev 分支（推薦）✅

**優點**:
- ✅ 無需安裝本地 PostgreSQL
- ✅ 與 Production/Preview 架構一致
- ✅ 自動備份和 PITR
- ✅ 快速設置（< 10 分鐘）
- ✅ 雲端訪問，任何地方都能開發

**缺點**:
- ⚠️ 需要網絡連接
- ⚠️ 受 Neon 免費計畫限制（10 個分支）

**實施步驟**:
1. 在 Neon Console 創建 Dev 分支
2. 獲取 Dev 分支連接字串
3. 更新 .env.local 配置
4. 測試本地開發環境

### 選項 2: 安裝本地 PostgreSQL

**優點**:
- ✅ 完全離線開發
- ✅ 無網絡延遲
- ✅ 無雲端限制

**缺點**:
- ❌ 需要安裝和配置 PostgreSQL
- ❌ 需要手動備份
- ❌ 設置時間較長（30+ 分鐘）
- ❌ 需要維護本地數據庫

---

## 📝 選定方案：選項 1 - 使用 Neon Dev 分支

### 步驟 1: 創建 Neon Dev 分支 ⏱️ 10 分鐘

#### 1.1 訪問 Neon Console
1. 使用 Playwright 自動化訪問 https://console.neon.tech
2. 選擇 EduCreate 專案 (dry-cloud-00816876)
3. 進入 Branches 頁面

#### 1.2 創建 Dev 分支
1. 點擊 "Create Branch" 按鈕
2. 配置分支：
   ```
   Branch name: development
   Parent branch: production (default)
   Copy data from parent: Yes ✅
   ```
3. 點擊 "Create Branch"

#### 1.3 獲取 Dev 分支連接字串
1. 選擇新創建的 "development" 分支
2. 點擊 "Connection Details"
3. 複製 Pooled connection 字串

**預期結果**:
```
Pooled: postgresql://neondb_owner:xxx@ep-dev-xxx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```

---

### 步驟 2: 更新本地環境配置 ⏱️ 5 分鐘

#### 2.1 備份當前 .env.local
```bash
Copy-Item .env.local .env.local.backup
```

#### 2.2 更新 .env.local
```env
# EduCreate 本地開發環境配置

# Neon Development Branch 數據庫連接
DATABASE_URL="postgresql://neondb_owner:xxx@ep-dev-xxx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"

# NextAuth 配置（本地開發）
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="educreate-dev-secret-key-2024"

# 開發環境配置
NODE_ENV="development"

# 本地開發 URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"

# 可選配置 (根據需要啟用)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### 2.3 創建 .env.development
為了更清晰的環境管理，創建專門的開發環境配置文件：

```env
# EduCreate Development Environment
# 本地開發專用配置

DATABASE_URL="postgresql://neondb_owner:xxx@ep-dev-xxx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="educreate-dev-secret-key-2024"
NODE_ENV="development"
```

---

### 步驟 3: 測試本地開發環境 ⏱️ 10 分鐘

#### 3.1 安裝依賴
```bash
npm install
```

#### 3.2 執行數據庫遷移
```bash
npm run db:migrate:dev
```

#### 3.3 啟動開發服務器
```bash
npm run dev
```

#### 3.4 驗證數據庫連接
1. 訪問 http://localhost:3000
2. 嘗試登入或創建測試數據
3. 檢查 Neon Console 確認數據寫入 Dev 分支

---

### 步驟 4: 驗證環境隔離 ⏱️ 5 分鐘

#### 4.1 檢查三個環境的數據庫

使用 Neon SQL Editor 查詢三個分支：

**Production Branch**:
```sql
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as activity_count FROM "Activity";
```

**Preview Branch**:
```sql
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as activity_count FROM "Activity";
```

**Development Branch**:
```sql
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as activity_count FROM "Activity";
```

#### 4.2 在本地創建測試數據
1. 在本地開發環境創建測試用戶或活動
2. 確認數據只出現在 Development 分支
3. 確認 Production 和 Preview 分支不受影響

---

## ✅ 驗收標準

### 必須達成的目標

1. ✅ **Dev 分支創建成功**
   - Neon Console 顯示 "development" 分支
   - 分支狀態正常
   - 數據從 Production 複製成功

2. ✅ **.env.local 配置正確**
   - DATABASE_URL 指向 Dev 分支
   - NEXTAUTH_URL 設置為 localhost:3000
   - NODE_ENV 設置為 development

3. ✅ **本地開發環境運行正常**
   - npm run dev 成功啟動
   - 可以訪問 http://localhost:3000
   - 數據庫連接正常

4. ✅ **環境隔離驗證成功**
   - 本地創建的數據只在 Dev 分支
   - Production 和 Preview 分支不受影響
   - 三個環境完全獨立

---

## 📊 預期結果

### 三層環境隔離架構完成

```
Production 環境 ✅
├─ URL: https://edu-create.vercel.app
├─ 數據庫: Neon Production Branch (br-rough-field-a80z6kz8)
├─ 用途: 生產環境，真實用戶數據
└─ 狀態: ✅ 正常運行，完全隔離

Preview 環境 ✅
├─ URL: https://edu-create-[hash].vercel.app
├─ 數據庫: Neon Preview Branch (br-winter-smoke-a8fhvngp)
├─ 用途: PR 測試，功能驗證
└─ 狀態: ✅ 部署成功，完全隔離

Development 環境 🔄 (執行中)
├─ URL: http://localhost:3000
├─ 數據庫: Neon Development Branch (待創建)
├─ 用途: 本地開發，功能開發
└─ 狀態: 🔄 設置中
```

---

## 🎯 下一步

1. **立即開始**: 使用 Playwright 創建 Neon Dev 分支
2. **更新配置**: 修改 .env.local 文件
3. **測試環境**: 啟動本地開發服務器
4. **驗證隔離**: 確認三個環境完全獨立

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-16  
**狀態**: 🔄 執行中

