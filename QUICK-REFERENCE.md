# EduCreate 快速參考卡片

## 🚀 快速啟動

```bash
# 啟動開發環境
npm run dev

# 數據庫管理
npx prisma studio

# 測試 OAuth 登入
node scripts/debug-google-oauth.js
```

## 🔐 認證系統速查

### NextAuth 配置
- **文件**：`lib/auth.ts`
- **策略**：數據庫會話 (不是 JWT)
- **適配器**：PrismaAdapter
- **提供者**：Google, GitHub, Credentials

### API 路由
```typescript
/api/auth/*           - NextAuth 端點
/api/activities       - NextAuth 兼容
/api/backend/*        - JWT 認證
```

### 智能路由邏輯
```typescript
const hasToken = localStorage.getItem('token');
const apiPath = hasToken ? '/api/backend/' : '/api/';
```

## 🗄️ 數據庫速查

### 核心表結構
```sql
User     - id, email, name, image, role
Account  - userId, provider, providerAccountId
Session  - sessionToken, userId, expires
Activity - id, title, content, userId
```

### 常用 Prisma 命令
```bash
npx prisma db push      # 推送 Schema
npx prisma generate     # 生成客戶端
npx prisma studio       # 數據庫 GUI
npx prisma db pull      # 拉取 Schema
```

## 🎮 遊戲系統速查

### 25 種記憶類型
1. **基礎記憶** (4種)：Quiz, Flash cards, Type answer, True/False
2. **壓力情緒記憶** (4種)：Gameshow Quiz, Open box, Win/Lose quiz, Spin wheel
3. **空間視覺記憶** (5種)：Matching Pairs, Find match, Flip tiles, Maze chase, Image quiz
4. **重構邏輯記憶** (4種)：Anagram, Unscramble, Group sort, Crossword
5. **動態反應記憶** (3種)：Flying fruit, Balloon pop, Airplane
6. **關聯配對記憶** (3種)：Match up, Pair/No Pair, Hangman
7. **搜索發現記憶** (1種)：Wordsearch
8. **語音聽覺記憶** (1種)：Speaking cards

### GEPT 分級
- **Kids**：300字 (幼兒園6學期)
- **初級**：1000字 (國小12學期)
- **中級**：2000字 (國中6學期)
- **中高級**：3000字 (高中6學期)

## 🚨 故障排除速查

### Google OAuth 問題
```bash
# 症狀：OAuthAccountNotLinked
node scripts/debug-google-oauth.js
node scripts/fix-google-oauth-display.js

# 檢查點：
- NextAuth 配置 (lib/auth.ts)
- 環境變數 (GOOGLE_CLIENT_ID/SECRET)
- 數據庫 Account 記錄
```

### API 404 錯誤
```bash
# 檢查點：
- 路由路徑 (/api/ vs /api/backend/)
- 認證狀態 (token vs session)
- 中間件配置
```

### 數據庫連接問題
```bash
# 檢查點：
- DATABASE_URL 環境變數
- Neon 數據庫狀態
- Prisma 客戶端生成
```

## 📁 重要文件速查

### 配置文件
```
lib/auth.ts              - NextAuth 配置
lib/api-client.ts        - API 客戶端
prisma/schema.prisma     - 數據庫 Schema
.env                     - 環境變數
```

### 診斷腳本
```
scripts/debug-google-oauth.js        - OAuth 診斷
scripts/fix-google-oauth-display.js  - OAuth 修復
scripts/check-oauth-accounts.js      - 帳號檢查
```

### 核心頁面
```
app/login/page.tsx           - 登入頁面
app/my-activities/page.tsx   - 活動管理
app/create/[templateId]/     - 活動創建
app/games/switcher/          - 遊戲載入
```

## 🌍 環境變數速查

### 必需變數
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://edu-create.vercel.app"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="413488883106-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

### 可選變數
```env
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

## 🔧 開發命令速查

### 開發環境
```bash
npm run dev              # 開發服務器
npm run build            # 構建
npm run start            # 生產服務器
npm run lint             # 代碼檢查
```

### 測試命令
```bash
npm run test:e2e         # E2E 測試
node EduCreate-Test-Videos/scripts/automation/generate-reports.js all
```

### Git 操作
```bash
git status               # 檢查狀態
git add .                # 添加變更
git commit -m "..."      # 提交
git push origin master   # 推送
```

## 📊 監控速查

### Vercel 監控
- **部署**：Vercel Dashboard → Deployments
- **函數**：Vercel Dashboard → Functions
- **日誌**：Vercel Dashboard → Function Logs

### 數據庫監控
- **Neon 控制台**：https://console.neon.tech
- **Prisma Studio**：`npx prisma studio`

## 🎯 測試檢查清單

### OAuth 登入測試
- [ ] Google 登入成功
- [ ] 用戶信息正確顯示
- [ ] 數據庫記錄完整
- [ ] 會話狀態正常

### 活動創建測試
- [ ] 選擇遊戲範本
- [ ] 輸入詞彙內容
- [ ] 保存活動成功
- [ ] 遊戲載入正常

### API 功能測試
- [ ] NextAuth API 正常
- [ ] JWT API 正常
- [ ] 智能路由工作
- [ ] 錯誤處理正確

## 🚨 緊急聯繫

### 生產問題
1. 檢查 Vercel 部署狀態
2. 查看 Vercel 函數日誌
3. 檢查 Neon 數據庫狀態
4. 運行診斷腳本

### 開發問題
1. 檢查本地環境變數
2. 重新生成 Prisma 客戶端
3. 清除 Next.js 緩存
4. 重啟開發服務器

---

**最後更新**：2025-10-14
**版本**：v2.0.0-unified
**狀態**：Google OAuth 問題已解決 ✅
