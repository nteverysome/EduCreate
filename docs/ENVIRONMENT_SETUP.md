# EduCreate 環境設置指南

本文檔說明如何設置 EduCreate 專案的開發、預覽和生產環境。

---

## 目錄

1. [環境概覽](#環境概覽)
2. [Production 環境設置](#production-環境設置)
3. [Preview 環境設置](#preview-環境設置)
4. [Development 環境設置](#development-環境設置)
5. [環境變數配置](#環境變數配置)
6. [數據庫分支管理](#數據庫分支管理)
7. [常見問題](#常見問題)

---

## 環境概覽

EduCreate 使用三個獨立的環境來確保開發和測試不會影響生產數據：

| 環境 | 用途 | 數據庫 | 部署方式 |
|------|------|--------|----------|
| **Production** | 生產環境 | Neon Production Branch | 自動部署 (master 分支) |
| **Preview** | 預覽/測試環境 | Neon Preview Branch | 自動部署 (PR/非 master 分支) |
| **Development** | 本地開發 | 本地 PostgreSQL 或 Neon Dev Branch | 手動啟動 |

### 環境隔離架構

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel 部署平台                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Production 環境                                             │
│  ├─ URL: https://edu-create.vercel.app                     │
│  ├─ Branch: master                                          │
│  └─ DATABASE_URL → Neon Production Branch                  │
│                                                              │
│  Preview 環境                                                │
│  ├─ URL: https://edu-create-[hash].vercel.app             │
│  ├─ Branch: feature/* / test/*                             │
│  └─ DATABASE_URL → Neon Preview Branch                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Neon PostgreSQL 數據庫                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Production Branch (br-rough-field-a80z6kz8)               │
│  ├─ Compute: ep-curly-salad-a85exs3f                       │
│  ├─ 數據: 生產數據                                          │
│  └─ 狀態: 持續運行                                          │
│                                                              │
│  Preview Branch (br-winter-smoke-a8fhvngp)                 │
│  ├─ Compute: ep-soft-resonance-a8hnscfv                    │
│  ├─ 數據: 測試數據 (從 Production 複製)                     │
│  └─ 狀態: 按需啟動                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Production 環境設置

### 自動部署

Production 環境會在 `master` 分支有新提交時自動部署。

### 環境變數

在 Vercel Dashboard 中配置以下環境變數（僅限 Production）：

```env
# 數據庫連接
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

# NextAuth 配置
NEXTAUTH_URL=https://edu-create.vercel.app
NEXTAUTH_SECRET=[your-production-secret]

# OAuth 提供商
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
GITHUB_CLIENT_ID=[your-github-client-id]
GITHUB_CLIENT_SECRET=[your-github-client-secret]
```

### 數據庫遷移

Production 環境的數據庫遷移應該謹慎執行：

```bash
# 1. 在本地測試遷移
npm run db:migrate:dev

# 2. 確認遷移無誤後，在 Production 執行
npm run db:migrate:deploy
```

---

## Preview 環境設置

### 自動部署

Preview 環境會在非 `master` 分支推送到 GitHub 時自動部署。

### 環境變數

在 Vercel Dashboard 中配置以下環境變數（僅限 Preview）：

```env
# 數據庫連接
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-soft-resonance-a8hnscfv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth 配置
NEXTAUTH_URL=[preview-url-will-be-dynamic]
NEXTAUTH_SECRET=[your-preview-secret]

# OAuth 提供商（可選，Preview 環境可能無法使用 OAuth）
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
```

### 創建新的 Preview 分支

當需要新的 Preview 環境時：

1. **在 Neon Console 創建新分支**：
   ```
   1. 訪問 https://console.neon.tech
   2. 選擇 EduCreate 專案
   3. 點擊 "New Branch"
   4. 選擇 "production" 作為父分支
   5. 命名分支（例如：preview-feature-x）
   6. 點擊 "Create Branch"
   ```

2. **更新 Vercel 環境變數**：
   ```
   1. 訪問 Vercel Dashboard
   2. 選擇 EduCreate 專案
   3. 進入 Settings → Environment Variables
   4. 更新 DATABASE_URL (Preview) 為新分支的連接字串
   ```

3. **觸發 Preview 部署**：
   ```bash
   git checkout -b test/new-feature
   git push origin test/new-feature
   ```

---

## Development 環境設置

### 本地開發環境

#### 選項 1：使用本地 PostgreSQL（推薦）

1. **安裝 PostgreSQL**：
   ```bash
   # Windows (使用 Chocolatey)
   choco install postgresql

   # macOS (使用 Homebrew)
   brew install postgresql

   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql
   ```

2. **創建本地數據庫**：
   ```bash
   createdb educreate_dev
   ```

3. **配置環境變數**：
   創建 `.env.local` 文件：
   ```env
   DATABASE_URL=postgresql://localhost:5432/educreate_dev
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=[your-dev-secret]
   ```

4. **執行數據庫遷移**：
   ```bash
   npm run db:migrate:dev
   ```

#### 選項 2：使用 Neon Dev Branch

1. **在 Neon Console 創建 Dev 分支**：
   - 從 Production 分支創建新分支
   - 命名為 `dev-[your-name]`

2. **配置環境變數**：
   創建 `.env.local` 文件：
   ```env
   DATABASE_URL=[your-neon-dev-branch-url]
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=[your-dev-secret]
   ```

### 啟動開發服務器

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

訪問 http://localhost:3000

---

## 環境變數配置

### 必需的環境變數

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 連接字串 | `postgresql://...` |
| `NEXTAUTH_URL` | NextAuth 回調 URL | `https://edu-create.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth 加密密鑰 | `[random-string]` |

### 可選的環境變數

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `[your-client-id]` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `[your-secret]` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `[your-client-id]` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | `[your-secret]` |

### 環境變數優先級

1. `.env.local` (本地開發，不提交到 Git)
2. `.env.production` (生產環境)
3. `.env` (所有環境的默認值)

---

## 數據庫分支管理

### 查看所有分支

```bash
# 使用 Neon CLI
neon branches list

# 或訪問 Neon Console
https://console.neon.tech/app/projects/dry-cloud-00816876/branches
```

### 創建新分支

```bash
# 使用 Neon CLI
neon branches create --name preview-feature-x --parent production

# 或使用 Neon Console UI
```

### 刪除分支

```bash
# 使用 Neon CLI
neon branches delete preview-feature-x

# 或使用 Neon Console UI
```

### 分支命名規範

- `production` - 生產環境（默認分支）
- `preview` - 主要預覽環境
- `preview-[feature-name]` - 特定功能的預覽環境
- `dev-[developer-name]` - 個人開發環境

---

## 常見問題

### Q: 如何在 Preview 環境測試數據庫遷移？

A: 
1. 創建新的 Preview 分支
2. 在本地執行遷移：`npm run db:migrate:dev`
3. 推送到 GitHub 觸發 Preview 部署
4. 驗證遷移成功後，再在 Production 執行

### Q: Preview 環境的數據會影響 Production 嗎？

A: 不會。Preview 和 Production 使用完全獨立的數據庫分支，數據完全隔離。

### Q: 如何重置 Preview 環境的數據？

A: 
1. 刪除現有的 Preview 分支
2. 從 Production 分支創建新的 Preview 分支
3. 更新 Vercel 環境變數
4. 觸發新的 Preview 部署

### Q: 本地開發時如何使用 Production 數據？

A: 
**不推薦**直接使用 Production 數據。建議：
1. 從 Production 分支創建 Dev 分支
2. 使用 Dev 分支進行本地開發
3. 定期從 Production 同步數據（如需要）

### Q: 如何監控數據庫使用情況？

A: 
1. 訪問 Neon Console
2. 選擇對應的分支
3. 查看 Monitoring 頁面
4. 監控 Compute hours、Storage、Connections 等指標

---

## 相關文檔

- [數據庫架構文檔](./DATABASE_ARCHITECTURE.md)
- [環境隔離實施計畫](./ENVIRONMENT_ISOLATION_IMPLEMENTATION_PLAN.md)
- [Phase 4 數據遷移和測試計畫](./PHASE4_DATA_MIGRATION_AND_TESTING_PLAN.md)
- [Phase 4 步驟 5 數據隔離驗證報告](./PHASE4_STEP5_DATA_ISOLATION_VERIFICATION_COMPLETE.md)

---

**最後更新**: 2025-10-16  
**維護者**: EduCreate 開發團隊

