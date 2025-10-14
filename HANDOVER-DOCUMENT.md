# EduCreate 項目交接文檔

## 📋 項目概述

**EduCreate** 是一個記憶科學驅動的智能教育遊戲平台，支援 25 種記憶科學遊戲類型，基於主動回憶和間隔重複原理。

### 🎯 核心功能
- **25 種記憶科學遊戲**：涵蓋基礎記憶、壓力情緒記憶、空間視覺記憶等
- **GEPT 分級系統**：支援初級、中級、高級詞彙分級
- **統一全棧架構**：Next.js + Prisma + Neon PostgreSQL
- **多重認證系統**：NextAuth (Google OAuth) + JWT 認證
- **智能 API 路由**：自動選擇最適合的認證方式

## 🏗️ 技術架構

### **當前架構版本：v2.0.0-unified**

#### **前端技術棧**
- **框架**：Next.js 14 (App Router)
- **UI 庫**：Tailwind CSS + Headless UI
- **狀態管理**：React Hooks + Context API
- **認證**：NextAuth.js v4

#### **後端技術棧**
- **API**：Next.js API Routes (統一架構)
- **ORM**：Prisma 6.9.0
- **數據庫**：Neon PostgreSQL (雲端)
- **認證**：NextAuth + JWT 雙重認證

#### **部署架構**
- **主機平台**：Vercel (統一部署)
- **數據庫**：Neon PostgreSQL (獨立服務)
- **CDN**：Vercel Edge Network
- **域名**：https://edu-create.vercel.app

### **重要架構變更歷史**
```
v1.0 (舊版): Railway Express.js + Vercel Next.js (雙平台)
v2.0 (現版): Vercel Next.js 統一全棧架構 ✅
```

## 🔐 認證系統

### **雙重認證架構**
1. **NextAuth (OAuth)**：Google、GitHub 社交登入
2. **JWT 認證**：傳統郵箱密碼登入

### **智能 API 路由**
```typescript
// 自動選擇認證方式
const hasToken = localStorage.getItem('token');
const apiPath = hasToken ? '/api/backend/' : '/api/';
```

### **重要配置**
- **NextAuth 配置**：`lib/auth.ts`
- **數據庫會話策略**：使用 PrismaAdapter
- **OAuth 提供者**：Google、GitHub
- **環境變數**：`.env` 和 Vercel 環境變數

## 📊 數據庫架構

### **核心數據表**
```sql
User        - 用戶基本信息
Account     - OAuth 帳號關聯
Session     - 用戶會話記錄
Activity    - 學習活動
Folder      - 活動資料夾
GameStats   - 遊戲統計
```

### **數據庫連接**
- **提供者**：Neon PostgreSQL
- **連接字串**：`DATABASE_URL` 環境變數
- **連接池**：Prisma 自動管理

## 🎮 遊戲系統

### **25 種記憶類型**
1. **基礎記憶**：Quiz, Flash cards, Type answer, True/False
2. **壓力情緒記憶**：Gameshow Quiz, Open box, Win/Lose quiz, Spin wheel
3. **空間視覺記憶**：Matching Pairs, Find match, Flip tiles, Maze chase, Image quiz
4. **重構邏輯記憶**：Anagram, Unscramble, Group sort, Crossword
5. **動態反應記憶**：Flying fruit, Balloon pop, Airplane
6. **關聯配對記憶**：Match up, Pair/No Pair, Hangman
7. **搜索發現記憶**：Wordsearch
8. **語音聽覺記憶**：Speaking cards

### **GEPT 分級系統**
- **GEPT Kids**：基礎 300 字（幼兒園 6 個學期）
- **GEPT 初級**：基礎 1000 字（國小 12 個學期）
- **GEPT 中級**：進階 2000 字（國中 6 個學期）
- **GEPT 中高級**：高級 3000 字（高中 6 個學期）

## 🚨 最近重要修復

### **Google OAuth 登入問題 (2025-10-14 解決)**

#### **問題**：
- 用戶無法使用 Google 帳號登入
- 出現 `OAuthAccountNotLinked` 錯誤

#### **根本原因**：
- NextAuth 配置衝突：`PrismaAdapter` + `JWT 策略`不兼容
- 複雜的 `signIn callback` 與 NextAuth 內部邏輯衝突

#### **解決方案**：
1. 移除 `session: { strategy: 'jwt' }` 配置
2. 簡化 `signIn callback`，讓 NextAuth 自動處理
3. 使用數據庫會話策略替代 JWT 策略

#### **修復提交**：
- `cfbb488`: 修復 NextAuth 配置衝突
- `e7087e4`: 簡化 signIn callback
- `599ea78`: 深度修復 Google OAuth 顯示問題

## 📁 重要文件結構

### **核心配置文件**
```
lib/auth.ts              - NextAuth 配置
lib/api-client.ts        - 統一 API 客戶端
prisma/schema.prisma     - 數據庫 Schema
.env                     - 本地環境變數
```

### **API 路由結構**
```
app/api/                 - NextAuth 兼容 API
app/api/backend/         - JWT 認證 API
app/api/auth/            - NextAuth 端點
```

### **前端頁面結構**
```
app/                     - Next.js App Router
app/login/               - 登入頁面
app/my-activities/       - 用戶活動管理
app/create/              - 活動創建
app/games/               - 遊戲載入器
```

## 🔧 開發工具和腳本

### **診斷腳本**
```bash
node scripts/debug-google-oauth.js     - OAuth 問題診斷
node scripts/fix-google-oauth-display.js - OAuth 修復腳本
node scripts/check-oauth-accounts.js   - 帳號檢查
```

### **測試系統**
```bash
# Playwright 測試
npm run test:e2e

# 測試影片生成
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
```

### **開發命令**
```bash
npm run dev              - 啟動開發服務器
npm run build            - 構建生產版本
npx prisma studio        - 數據庫管理界面
npx prisma db push       - 推送 Schema 變更
```

## 🌍 環境變數

### **必需環境變數**
```env
# 數據庫
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://edu-create.vercel.app"
NEXTAUTH_SECRET="development-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="413488883106-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# GitHub OAuth (可選)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

## 📊 監控和日誌

### **Vercel 部署監控**
- **部署歷史**：Vercel Dashboard
- **函數日誌**：Vercel Functions 面板
- **性能監控**：Vercel Analytics

### **數據庫監控**
- **Neon 控制台**：數據庫性能和連接
- **Prisma Studio**：數據查看和編輯

## 🚀 部署流程

### **自動部署**
1. 推送到 `master` 分支
2. Vercel 自動觸發部署
3. 構建和部署約 1-2 分鐘
4. 自動更新生產環境

### **手動部署檢查**
```bash
git status                    - 檢查本地變更
git add .                     - 添加變更
git commit -m "描述"          - 提交變更
git push origin master        - 推送到遠程
```

## ⚠️ 重要注意事項

### **認證系統**
- 不要同時修改 NextAuth 和 JWT 認證邏輯
- OAuth 問題優先檢查 NextAuth 配置
- 數據庫會話策略不要改回 JWT

### **數據庫操作**
- Schema 變更必須通過 Prisma
- 不要直接修改生產數據庫
- 重要操作前先備份

### **API 設計**
- 新 API 優先使用 NextAuth 兼容路由
- 保持 `/api/` 和 `/api/backend/` 雙路由支援
- 智能路由邏輯不要破壞

### **測試要求**
- 重要功能變更必須 Playwright 測試
- OAuth 相關變更必須測試完整登入流程
- 遊戲功能變更必須測試創建活動流程

## 📞 聯繫信息

### **GitHub 倉庫**
- **URL**：https://github.com/nteverysome/EduCreate.git
- **主分支**：master
- **用戶**：nteverysome

### **生產環境**
- **URL**：https://edu-create.vercel.app
- **Vercel 項目**：edu-create

---

## 🎯 交接檢查清單

- [ ] 閱讀完整交接文檔
- [ ] 檢查本地開發環境設置
- [ ] 驗證 Google OAuth 登入功能
- [ ] 測試創建活動和遊戲載入
- [ ] 熟悉診斷腳本使用
- [ ] 了解部署流程和監控
- [ ] 確認環境變數配置

**交接完成日期**：2025-10-14
**交接人**：Previous Agent
**接收人**：New Agent

---

## 🔍 常見問題和故障排除

### **Google OAuth 登入問題**

#### **症狀**：`OAuthAccountNotLinked` 錯誤
```bash
# 診斷步驟
node scripts/debug-google-oauth.js

# 修復步驟
node scripts/fix-google-oauth-display.js
```

#### **症狀**：用戶郵箱顯示不正確
- 檢查 NextAuth session callback
- 驗證數據庫 User 和 Account 記錄
- 確認 PrismaAdapter 配置正確

### **API 路由問題**

#### **症狀**：API 404 錯誤
- 檢查 `/api/` vs `/api/backend/` 路由
- 驗證智能路由邏輯
- 確認認證中間件配置

#### **症狀**：認證失敗
- 檢查 JWT token 有效性
- 驗證 NextAuth session 狀態
- 確認環境變數配置

### **數據庫連接問題**

#### **症狀**：Prisma 連接錯誤
```bash
# 檢查數據庫連接
npx prisma db pull

# 重置數據庫連接
npx prisma generate
```

#### **症狀**：Schema 同步問題
```bash
# 推送 Schema 變更
npx prisma db push

# 查看數據庫狀態
npx prisma studio
```

### **遊戲載入問題**

#### **症狀**：遊戲 iframe 載入失敗
- 檢查遊戲 URL 配置
- 驗證活動 ID 有效性
- 確認詞彙數據載入

#### **症狀**：詞彙數據錯誤
- 檢查活動創建流程
- 驗證數據庫記錄
- 確認 API 回應格式

## 📚 學習資源和文檔

### **技術文檔**
- **Next.js 文檔**：https://nextjs.org/docs
- **NextAuth 文檔**：https://next-auth.js.org
- **Prisma 文檔**：https://www.prisma.io/docs
- **Tailwind CSS**：https://tailwindcss.com/docs

### **項目特定文檔**
- **記憶科學原理**：基於主動回憶和間隔重複
- **GEPT 分級標準**：台灣英語能力分級檢定
- **遊戲設計原則**：25 種記憶類型對應

### **開發最佳實踐**
1. **代碼提交**：使用語義化提交信息
2. **功能開發**：先寫測試，後寫功能
3. **API 設計**：保持向後兼容性
4. **數據庫變更**：使用 Prisma 遷移
5. **部署檢查**：確認環境變數同步

## 🎯 未來發展方向

### **短期目標 (1-2 週)**
- [ ] 完善測試覆蓋率
- [ ] 優化遊戲載入性能
- [ ] 增強錯誤處理機制
- [ ] 改進用戶體驗流程

### **中期目標 (1-2 月)**
- [ ] 添加更多 OAuth 提供者
- [ ] 實現學習進度分析
- [ ] 開發移動端適配
- [ ] 建立 CI/CD 流程

### **長期目標 (3-6 月)**
- [ ] 多語言支援系統
- [ ] AI 個人化推薦
- [ ] 社群功能開發
- [ ] 商業化功能

## 🔒 安全考量

### **認證安全**
- NextAuth secret 定期更換
- OAuth 客戶端密鑰保護
- JWT token 過期時間控制
- 會話安全配置

### **數據安全**
- 數據庫連接加密
- 用戶數據隱私保護
- API 端點訪問控制
- 輸入數據驗證

### **部署安全**
- 環境變數安全管理
- HTTPS 強制使用
- CORS 政策配置
- 安全標頭設置

---

*此文檔包含 EduCreate 項目的核心信息，建議新 agent 詳細閱讀並實際操作驗證各項功能。如有疑問，請參考相關技術文檔或聯繫項目維護者。*
