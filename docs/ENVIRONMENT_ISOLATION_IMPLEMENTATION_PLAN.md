# 環境隔離實施計畫

## 📅 計畫信息
**創建日期**: 2025-10-16
**狀態**: Phase 2 完成，進行中
**預計完成時間**: 2-3 小時
**風險等級**: 低（Production 零影響）

## 🚀 實施進度追蹤

```
Phase 1: Neon Preview 分支創建 ✅ COMPLETE (2025-10-16)
Phase 2: Vercel 環境變數更新 ✅ COMPLETE (2025-10-16)
Phase 3: 本地開發環境設置 ⏳ PENDING
Phase 4: 數據遷移和測試 ⏳ PENDING
Phase 5: 文檔和監控 ⏳ PENDING
```

**詳細報告**:
- Phase 1: 參見 `docs/NEON_PREVIEW_BRANCH_INFO.md`
- Phase 2: 參見 `docs/PHASE2_VERCEL_ENV_VARS_UPDATE_COMPLETE.md`

---

## 🎯 目標

將 EduCreate 從單一資料庫架構轉換為環境隔離架構：

### 當前架構
```
Production  ─┐
Preview     ─┼─→ 同一個 Neon Database
Development ─┘
```

### 目標架構
```
Production  → Neon Database (production branch)
Preview     → Neon Database (preview branch)
Development → Local PostgreSQL
```

---

## ✨ 預期效果

### 優點
- ✅ **完全隔離**: 測試不會影響生產數據
- ✅ **安全測試**: 可以放心測試破壞性操作
- ✅ **獨立備份**: 每個環境可以獨立恢復
- ✅ **更好的開發體驗**: 本地開發更快速
- ✅ **符合最佳實踐**: 業界標準架構

### 成本
- ✅ **Neon 免費計畫**: 支援 10 個分支，目前只用 1 個
- ✅ **本地 PostgreSQL**: 完全免費
- ✅ **預計成本**: $0（無額外成本）

---

## 📋 實施階段

### 階段 1: Neon Preview 分支創建 ⏱️ 15 分鐘

#### 1.1 登入 Neon Console
1. 訪問 https://console.neon.tech
2. 選擇 EduCreate 專案 (dry-cloud-00816876)

#### 1.2 創建 Preview 分支
1. 點擊左側 "Branches" 選單
2. 點擊 "Create Branch" 按鈕
3. 配置分支：
   ```
   Branch name: preview
   Parent branch: production (default)
   Copy data from parent: Yes ✅
   ```
4. 點擊 "Create Branch"

#### 1.3 獲取 Preview 分支連接字串
1. 選擇新創建的 "preview" 分支
2. 點擊 "Connection Details"
3. 複製以下連接字串：
   - **Pooled connection** (用於應用程式)
   - **Direct connection** (用於 Prisma Migrate)

**預期結果**:
```
Pooled: postgresql://neondb_owner:xxx@ep-preview-xxx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
Direct: postgresql://neondb_owner:xxx@ep-preview-xxx.eastus2.azure.neon.tech/neondb?sslmode=require
```

---

### 階段 2: Vercel 環境變數更新 ⏱️ 20 分鐘

#### 2.1 備份當前環境變數
1. 訪問 Vercel Dashboard
2. 進入 EduCreate 專案
3. Settings → Environment Variables
4. 截圖保存當前配置（以防需要回滾）

#### 2.2 更新 DATABASE_URL 為環境特定

**步驟**:
1. 找到 `DATABASE_URL` 變數
2. 點擊右側的 "..." → "Edit"
3. 取消勾選 "All Environments"
4. 分別設置：

**Production**:
```
DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
（保持不變，使用當前的 production 分支）

**Preview**:
```
DATABASE_URL=postgresql://neondb_owner:xxx@ep-preview-xxx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
（使用新創建的 preview 分支的 Pooled connection）

**Development**:
```
DATABASE_URL=postgresql://localhost:5432/educreate_dev
```
（稍後設置本地資料庫）

#### 2.3 更新其他 Neon 相關變數

需要更新的變數（共 27 個）：
- `NEON_DATABASE_DATABASE_URL`
- `NEON_DATABASE_POSTGRES_URL`
- `NEON_DATABASE_POSTGRES_PRISMA_URL`
- `NEON_DATABASE_DATABASE_URL_UNPOOLED`
- `NEON_DATABASE_POSTGRES_URL_NON_POOLING`
- `NEON_DATABASE_POSTGRES_URL_NO_SSL`
- `NEON_DATABASE_PGHOST`
- `NEON_DATABASE_PGHOST_UNPOOLED`
- `NEON_DATABASE_POSTGRES_HOST`
- ... 等

**簡化方案**: 
實際上，只需要更新 `DATABASE_URL`，其他 Neon 變數可以保持 "All Environments"，因為它們主要用於 Neon 內部管理。

#### 2.4 更新 NEXTAUTH_URL（如果需要）

**Production**:
```
NEXTAUTH_URL=https://edu-create.vercel.app
```

**Preview**:
```
NEXTAUTH_URL=https://edu-create-git-[branch-name]-[team].vercel.app
```
（Vercel 會自動設置，通常不需要手動配置）

**Development**:
```
NEXTAUTH_URL=http://localhost:3000
```

#### 2.5 觸發 Preview 部署測試
1. 創建一個測試分支並推送
2. 等待 Vercel 自動部署 Preview
3. 檢查部署日誌確認使用了新的 DATABASE_URL

---

### 階段 3: 本地開發環境設置 ⏱️ 30 分鐘

#### 3.1 安裝 PostgreSQL（如果尚未安裝）

**Windows**:
```powershell
# 使用 Chocolatey
choco install postgresql

# 或下載安裝程式
# https://www.postgresql.org/download/windows/
```

**macOS**:
```bash
# 使用 Homebrew
brew install postgresql@17
brew services start postgresql@17
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 3.2 創建本地資料庫

```bash
# 連接到 PostgreSQL
psql -U postgres

# 創建資料庫
CREATE DATABASE educreate_dev;

# 創建用戶（可選）
CREATE USER educreate_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE educreate_dev TO educreate_user;

# 退出
\q
```

#### 3.3 更新本地 .env 文件

編輯 `.env` 文件：

```env
# 本地開發資料庫
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/educreate_dev"

# 或使用自定義用戶
# DATABASE_URL="postgresql://educreate_user:your_password@localhost:5432/educreate_dev"

# 其他環境變數保持不變
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret"
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

#### 3.4 運行 Prisma 遷移

```bash
# 生成 Prisma Client
npx prisma generate

# 運行所有遷移
npx prisma migrate deploy

# 或使用 dev 模式（會自動創建遷移）
npx prisma migrate dev

# 查看資料庫狀態
npx prisma migrate status
```

#### 3.5 填充種子數據（可選）

```bash
# 運行種子腳本
npx prisma db seed

# 或手動創建測試數據
node prisma/seed-demo-user.ts
```

#### 3.6 測試本地開發環境

```bash
# 啟動開發伺服器
npm run dev

# 訪問 http://localhost:3000
# 測試登入和基本功能
```

---

### 階段 4: 數據遷移和測試 ⏱️ 30 分鐘

#### 4.1 驗證 Preview 分支數據

1. 訪問 Neon Console
2. 選擇 "preview" 分支
3. 使用 SQL Editor 查詢：
   ```sql
   -- 檢查用戶數量
   SELECT COUNT(*) FROM "User";
   
   -- 檢查活動數量
   SELECT COUNT(*) FROM "Activity";
   
   -- 檢查資料夾數量
   SELECT COUNT(*) FROM "Folder";
   ```

**預期結果**: 應該與 production 分支相同（因為是從 production 複製的）

#### 4.2 測試 Preview 環境

1. 推送代碼到測試分支
2. 等待 Vercel 部署 Preview
3. 訪問 Preview URL
4. 測試以下功能：
   - ✅ 用戶登入
   - ✅ 創建活動
   - ✅ 創建資料夾
   - ✅ 遊戲功能
   - ✅ 社區分享

#### 4.3 測試數據隔離

**在 Preview 環境**:
1. 創建測試活動 "Preview Test Activity"
2. 創建測試資料夾 "Preview Test Folder"
3. 刪除一些測試數據

**在 Production 環境**:
1. 訪問 https://edu-create.vercel.app
2. 確認 Preview 的測試數據 **不會出現** 在 Production
3. 確認 Production 的數據 **沒有被刪除**

**結論**: ✅ 數據完全隔離

#### 4.4 測試本地開發環境

1. 啟動本地開發伺服器 `npm run dev`
2. 創建測試數據
3. 確認本地數據不會影響 Production 或 Preview

---

### 階段 5: 文檔和監控 ⏱️ 20 分鐘

#### 5.1 更新開發文檔

創建或更新以下文檔：
- ✅ `docs/ENVIRONMENT_SETUP.md` - 環境設置指南
- ✅ `docs/DATABASE_ARCHITECTURE.md` - 資料庫架構說明
- ✅ `README.md` - 更新專案說明

#### 5.2 創建操作指南

**docs/ENVIRONMENT_SETUP.md** 應包含：
- 如何設置本地開發環境
- 如何連接到不同的資料庫
- 如何運行遷移
- 常見問題解答

#### 5.3 設置監控（可選）

1. **Neon Console 監控**:
   - 查看每個分支的使用量
   - 設置警報（接近存儲限制時）

2. **Vercel Analytics**:
   - 監控不同環境的部署狀態
   - 查看錯誤日誌

3. **資料庫備份**:
   - Neon 自動備份（1 天保留期）
   - 考慮手動備份腳本

---

## ⚠️ 風險評估和緩解措施

### 風險 1: Prisma 遷移失敗 🟡

**可能性**: 低  
**影響**: 中  

**緩解措施**:
- ✅ 先在本地測試遷移
- ✅ 使用 Neon 分支功能可以快速回滾
- ✅ 保留 production 分支不變

**回滾計畫**:
```bash
# 如果遷移失敗，刪除 preview 分支重新創建
# 在 Neon Console 中刪除分支
# 重新執行階段 1
```

---

### 風險 2: 環境變數配置錯誤 🟡

**可能性**: 中  
**影響**: 中  

**緩解措施**:
- ✅ 先備份當前配置（截圖）
- ✅ 先測試 Preview 環境，確認無誤後再繼續
- ✅ Production 環境變數保持不變

**回滾計畫**:
```markdown
1. 在 Vercel Dashboard 中恢復環境變數
2. 將 DATABASE_URL 改回 "All Environments"
3. 使用備份的截圖恢復配置
```

---

### 風險 3: 本地 PostgreSQL 安裝問題 🟢

**可能性**: 低  
**影響**: 低（只影響本地開發）  

**緩解措施**:
- ✅ 提供詳細的安裝指南
- ✅ 提供多種安裝方法
- ✅ 如果安裝失敗，可以暫時繼續使用 Neon

**替代方案**:
```markdown
如果本地 PostgreSQL 安裝困難：
1. 可以暫時使用 Neon preview 分支進行本地開發
2. 或使用 Docker 運行 PostgreSQL
3. 或使用 Neon 創建專門的 development 分支
```

---

## 📝 測試檢查清單

### Preview 環境測試 ✅

- [ ] Preview 部署成功
- [ ] 可以訪問 Preview URL
- [ ] 用戶可以登入
- [ ] 可以創建活動
- [ ] 可以創建資料夾
- [ ] 遊戲功能正常
- [ ] 社區分享功能正常
- [ ] Preview 數據不會出現在 Production

### Production 環境驗證 ✅

- [ ] Production 仍然正常運行
- [ ] 用戶數據完整
- [ ] 所有功能正常
- [ ] 沒有受到 Preview 測試的影響

### 本地開發環境測試 ✅

- [ ] PostgreSQL 安裝成功
- [ ] 資料庫創建成功
- [ ] Prisma 遷移成功
- [ ] 開發伺服器啟動成功
- [ ] 可以創建測試數據
- [ ] 本地數據不會影響 Production 或 Preview

---

## 🔄 回滾計畫

如果實施過程中遇到嚴重問題，可以快速回滾：

### 完全回滾到原始狀態

1. **Vercel 環境變數**:
   ```markdown
   - 將 DATABASE_URL 改回 "All Environments"
   - 使用備份的截圖恢復所有配置
   ```

2. **Neon 分支**:
   ```markdown
   - 在 Neon Console 中刪除 preview 分支
   - Production 分支保持不變（未受影響）
   ```

3. **本地環境**:
   ```markdown
   - 將 .env 文件改回使用 Neon DATABASE_URL
   - 或保留本地 PostgreSQL（不影響線上環境）
   ```

**回滾時間**: < 5 分鐘  
**影響**: 零（Production 完全不受影響）

---

## 📊 成功標準

實施成功的標準：

1. ✅ **Preview 環境獨立運行**
   - 有自己的資料庫分支
   - 測試數據不會影響 Production

2. ✅ **Production 環境零影響**
   - 所有功能正常
   - 數據完整
   - 性能無變化

3. ✅ **本地開發環境可用**
   - PostgreSQL 運行正常
   - 可以快速測試功能
   - 不需要網絡連接

4. ✅ **文檔完整**
   - 團隊成員可以理解新架構
   - 有清晰的操作指南
   - 有問題排查指南

---

## 📅 實施時間表

| 階段 | 任務 | 預計時間 | 依賴 |
|------|------|----------|------|
| 1 | 創建 Neon Preview 分支 | 15 分鐘 | 無 |
| 2 | 更新 Vercel 環境變數 | 20 分鐘 | 階段 1 |
| 3 | 設置本地開發環境 | 30 分鐘 | 無（可並行） |
| 4 | 數據遷移和測試 | 30 分鐘 | 階段 1, 2, 3 |
| 5 | 文檔和監控 | 20 分鐘 | 階段 4 |

**總計**: 約 2 小時（不包括等待部署時間）

---

## 🎯 下一步

準備好開始實施了嗎？

1. **立即開始**: 按照階段 1 開始創建 Neon Preview 分支
2. **查看詳細步驟**: 閱讀每個階段的詳細說明
3. **提問**: 如有任何疑問，請隨時詢問

**建議**: 先完成階段 1 和階段 2，測試 Preview 環境無誤後，再進行階段 3（本地環境可以稍後設置）。

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-16  
**狀態**: ✅ 準備就緒

