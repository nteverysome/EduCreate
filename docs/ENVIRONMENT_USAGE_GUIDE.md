# 🔄 環境使用指南 - 如何使用三層環境

## 📋 目錄
1. [環境自動切換機制](#環境自動切換機制)
2. [如何使用每個環境](#如何使用每個環境)
3. [實際工作流程](#實際工作流程)
4. [常見問題解答](#常見問題解答)

---

## 🎯 環境自動切換機制

### ✨ 好消息：環境切換是**完全自動**的！

你**不需要手動切換**環境，系統會根據你的操作自動選擇正確的環境：

```
┌─────────────────────────────────────────────────────────┐
│                  環境自動切換邏輯                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  你訪問的 URL                → 自動使用的環境            │
│  ─────────────────────────────────────────────────      │
│                                                          │
│  https://edu-create.vercel.app                          │
│  → Production 環境 ✅                                    │
│  → 使用 Production 數據庫                                │
│  → 真實用戶數據                                          │
│                                                          │
│  https://edu-create-[hash].vercel.app                   │
│  → Preview 環境 ✅                                       │
│  → 使用 Preview 數據庫                                   │
│  → 測試數據（從 Production 複製）                        │
│                                                          │
│  http://localhost:3000                                  │
│  → Development 環境 ✅                                   │
│  → 使用 Development 數據庫                               │
│  → 開發數據（從 Production 複製）                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 🔧 技術實現

環境切換是通過 **Vercel 環境變數** 自動實現的：

```javascript
// Next.js 自動根據環境變數選擇數據庫
const DATABASE_URL = process.env.DATABASE_URL;

// Vercel 會根據部署環境自動設置：
// - Production: 使用 Production DATABASE_URL
// - Preview: 使用 Preview DATABASE_URL
// - Development: 使用本地 .env.local 的 DATABASE_URL
```

---

## 📱 如何使用每個環境

### 1️⃣ Production 環境（生產環境）

#### 🌐 訪問方式
直接訪問主網址：
```
https://edu-create.vercel.app
```

#### 🎯 用途
- **真實用戶使用**
- **正式的教學活動**
- **生產數據管理**

#### ⚠️ 注意事項
- 這是**真實環境**，所有操作都會影響真實用戶
- **不要在這裡測試新功能**
- **不要刪除或修改重要數據**

#### 📊 數據庫
- **分支**: `br-rough-field-a80z6kz8`
- **數據**: 真實用戶數據
- **保護**: 完全隔離，不受測試影響

---

### 2️⃣ Preview 環境（預覽/測試環境）

#### 🌐 訪問方式

**方式 1: 通過 GitHub Pull Request**
1. 創建一個新的 Pull Request
2. Vercel 會自動創建 Preview 部署
3. 在 PR 頁面點擊 Vercel 提供的 Preview URL

**方式 2: 通過 Vercel Dashboard**
1. 登入 Vercel Dashboard
2. 選擇 EduCreate 專案
3. 點擊 "Deployments" 標籤
4. 找到 Preview 部署並點擊 URL

**Preview URL 格式**:
```
https://edu-create-[隨機hash].vercel.app
```

#### 🎯 用途
- **測試新功能**
- **驗證 Bug 修復**
- **演示給團隊成員**
- **破壞性測試**（可以自由刪除數據）

#### ✅ 優勢
- 數據從 Production 複製，**真實但安全**
- 可以**自由測試**，不會影響 Production
- 每個 PR 都有**獨立的 Preview 環境**
- 測試完成後可以**清理數據**

#### 📊 數據庫
- **分支**: `br-winter-smoke-a8fhvngp`
- **數據**: 從 Production 複製的測試數據
- **狀態**: 已清理，準備測試

---

### 3️⃣ Development 環境（本地開發環境）

#### 🌐 訪問方式

**步驟 1: 啟動本地開發服務器**
```bash
cd EduCreate
npm run dev
```

**步驟 2: 訪問本地 URL**
```
http://localhost:3000
```

#### 🎯 用途
- **本地開發新功能**
- **調試代碼**
- **測試 API**
- **開發環境實驗**

#### ✅ 優勢
- **完全獨立**，不影響 Production 或 Preview
- **快速迭代**，修改代碼立即生效
- **離線開發**，不需要網絡連接
- **數據真實**，從 Production 複製

#### 📊 數據庫
- **分支**: `br-summer-fog-a8wizgpz`
- **數據**: 從 Production 複製的開發數據
- **連接**: 通過 `.env.local` 配置

#### 🔧 配置文件
`.env.local`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🔄 實際工作流程

### 場景 1: 開發新功能

```
1. 本地開發 (Development 環境)
   ├─ 啟動: npm run dev
   ├─ 訪問: http://localhost:3000
   ├─ 開發: 編寫代碼，測試功能
   └─ 提交: git commit & git push

2. 創建 Pull Request
   ├─ GitHub: 創建 PR
   ├─ Vercel: 自動創建 Preview 部署
   └─ 測試: 訪問 Preview URL 測試

3. 合併到 master
   ├─ GitHub: 合併 PR
   ├─ Vercel: 自動部署到 Production
   └─ 上線: https://edu-create.vercel.app
```

### 場景 2: 測試新功能

```
1. 在 Preview 環境測試
   ├─ 訪問: Preview URL
   ├─ 測試: 完整功能測試
   ├─ 驗證: 確認功能正常
   └─ 清理: 清理測試數據（可選）

2. 確認無誤後合併
   ├─ GitHub: 合併 PR
   └─ Production: 自動部署
```

### 場景 3: 修復 Bug

```
1. 本地重現 Bug (Development 環境)
   ├─ 訪問: http://localhost:3000
   ├─ 重現: 確認 Bug 存在
   └─ 修復: 修改代碼

2. Preview 環境驗證
   ├─ 創建: PR
   ├─ 測試: Preview URL
   └─ 確認: Bug 已修復

3. 部署到 Production
   ├─ 合併: PR
   └─ 上線: 自動部署
```

---

## ❓ 常見問題解答

### Q1: 我需要手動切換環境嗎？

**A**: **不需要！** 環境切換是完全自動的。你只需要：
- 本地開發 → 訪問 `http://localhost:3000`
- 測試功能 → 訪問 Preview URL
- 正式使用 → 訪問 `https://edu-create.vercel.app`

### Q2: 如何知道我現在在哪個環境？

**A**: 看 URL 就知道：
- `localhost:3000` → Development
- `edu-create-[hash].vercel.app` → Preview
- `edu-create.vercel.app` → Production

### Q3: 我在 Preview 環境刪除數據會影響 Production 嗎？

**A**: **不會！** 這就是環境隔離的意義：
- Preview 有自己的數據庫分支
- 刪除 Preview 數據不會影響 Production
- 已經通過破壞性測試驗證 ✅

### Q4: 如何在本地開發時使用 Development 環境？

**A**: 只需要：
1. 確保 `.env.local` 配置正確（已配置好）
2. 運行 `npm run dev`
3. 訪問 `http://localhost:3000`
4. 系統會自動使用 Development 數據庫

### Q5: Preview 環境的 URL 每次都不一樣嗎？

**A**: 是的，每個 PR 都會生成一個新的 Preview URL。你可以：
- 在 GitHub PR 頁面找到 Vercel 的評論
- 在 Vercel Dashboard 查看所有 Preview 部署
- 點擊 URL 訪問對應的 Preview 環境

### Q6: 我可以同時使用多個環境嗎？

**A**: 可以！例如：
- 在一個瀏覽器標籤訪問 Production（查看正式環境）
- 在另一個標籤訪問 Preview（測試新功能）
- 在本地運行 Development（開發新代碼）

### Q7: 如何清理 Preview 環境的測試數據？

**A**: 有兩種方式：
1. **手動清理**: 使用 Neon Console SQL Editor 執行 DELETE 語句
2. **重新創建**: 刪除並重新創建 Preview 分支（會從 Production 重新複製數據）

### Q8: Development 環境的數據會過期嗎？

**A**: 不會自動更新。如果需要最新的 Production 數據：
1. 刪除 Development 分支
2. 從 Production 重新創建分支
3. 更新 `.env.local` 的連接字串

---

## 🎯 最佳實踐

### ✅ 推薦做法

1. **本地開發優先**
   - 所有新功能先在 Development 環境開發
   - 確保本地測試通過再提交

2. **Preview 環境驗證**
   - 每個 PR 都在 Preview 環境測試
   - 確認功能正常再合併

3. **Production 環境保護**
   - 不要在 Production 直接測試
   - 重要操作前先在 Preview 驗證

4. **數據清理習慣**
   - Preview 測試完成後清理測試數據
   - 保持 Preview 環境乾淨

### ❌ 避免做法

1. **不要在 Production 測試新功能**
   - 可能影響真實用戶
   - 可能造成數據污染

2. **不要跳過 Preview 環境**
   - Preview 是安全網
   - 可以發現部署問題

3. **不要混淆環境**
   - 確認當前環境再操作
   - 避免誤刪 Production 數據

---

## 📊 環境對比表

| 特性 | Production | Preview | Development |
|------|-----------|---------|-------------|
| **URL** | edu-create.vercel.app | edu-create-[hash].vercel.app | localhost:3000 |
| **數據庫** | Production Branch | Preview Branch | Development Branch |
| **數據來源** | 真實用戶數據 | 從 Production 複製 | 從 Production 複製 |
| **用途** | 正式使用 | 測試驗證 | 本地開發 |
| **可以刪除數據** | ❌ 不可以 | ✅ 可以 | ✅ 可以 |
| **影響真實用戶** | ✅ 會影響 | ❌ 不會 | ❌ 不會 |
| **自動部署** | ✅ master 合併時 | ✅ PR 創建時 | ❌ 手動啟動 |
| **訪問權限** | 公開 | 需要 URL | 僅本地 |

---

## 🚀 快速參考

### 我想開發新功能
```bash
# 1. 啟動本地開發
npm run dev

# 2. 訪問
http://localhost:3000

# 3. 開發完成後提交
git add .
git commit -m "feat: 新功能"
git push
```

### 我想測試功能
```bash
# 1. 創建 PR
# 2. 等待 Vercel 自動部署
# 3. 訪問 PR 頁面的 Preview URL
# 4. 測試功能
```

### 我想部署到正式環境
```bash
# 1. 確認 Preview 測試通過
# 2. 合併 PR 到 master
# 3. Vercel 自動部署到 Production
# 4. 訪問 https://edu-create.vercel.app 確認
```

---

**文檔創建時間**: 2025-10-16 20:10  
**狀態**: ✅ 完整  
**適用版本**: EduCreate v2.0.0-unified

