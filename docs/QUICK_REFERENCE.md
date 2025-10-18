# EduCreate 快速參考卡片

## 🚀 快速開始（5 分鐘）

```bash
# 1. 檢查環境
git status
git log --oneline -5
node -v  # 應該 >= 18

# 2. 啟動開發服務器
npm run dev

# 3. 訪問
http://localhost:3000
```

---

## 📁 關鍵文件位置

### 最常修改的文件
```
components/activities/WordwallStyleActivityCard.tsx    # 活動卡片
components/activities/GameThumbnailPreview.tsx         # 遊戲預覽
app/games/switcher/page.tsx                            # 遊戲頁面
app/my-activities/page.tsx                             # 我的活動頁面
lib/vocabulary/loadVocabularyData.ts                   # 詞彙工具
```

### API 路由
```
app/api/activities/[id]/route.ts                       # 活動 CRUD
app/api/activities/[id]/view/route.ts                  # 瀏覽追蹤
app/api/assignments/route.ts                           # 課業分配
app/api/play/[activityId]/[assignmentId]/route.ts     # 遊戲數據
```

### 文檔
```
docs/HANDOVER_DOCUMENT.md                              # 專案交接
docs/TECHNICAL_HANDOVER.md                             # 技術細節
docs/QUICK_REFERENCE.md                                # 本文檔
.augment/rules/                                        # 開發規則
```

---

## 🔧 常用命令

### Git 操作
```bash
# 查看狀態
git status

# 查看最近提交
git log --oneline -10

# 添加文件
git add <file>

# 提交
git commit -m "feat: 描述"

# 推送
git push

# 回退（謹慎使用）
git reset --hard <commit-hash>
git push -f origin master
```

### 開發命令
```bash
# 啟動開發服務器
npm run dev

# 構建
npm run build

# 檢查類型
npm run type-check

# 資料庫操作
npx prisma studio      # 打開資料庫管理界面
npx prisma generate    # 生成 Prisma Client
npx prisma db push     # 同步資料庫模型
```

---

## 💡 核心概念速查

### 詞彙數據三層架構
```typescript
// 優先級：1 > 2 > 3
1. vocabularyItems  // 關聯到 VocabularySet（最新）
2. elements         // JSON 字段（中期）
3. content.vocabularyItems  // JSON 字段（舊版）

// 使用工具函數
import { loadVocabularyData } from '@/lib/vocabulary/loadVocabularyData';
const data = await loadVocabularyData(activity);
```

### 空數組檢查
```typescript
// ❌ 錯誤
if (arr && Array.isArray(arr)) { }

// ✅ 正確
if (arr && arr.length > 0) { }
```

### API 方法選擇
```typescript
GET     // 獲取數據
POST    // 創建或修改狀態
PATCH   // 部分更新（如重新命名）
PUT     // 完整更新（如拖拽到資料夾）
DELETE  // 刪除
```

### 遊戲模式
```typescript
// 姓名模式（記錄成績）
/games/switcher?game=xxx&activityId=xxx&assignmentId=xxx&studentName=xxx

// 匿名模式（不記錄成績）
/games/switcher?game=xxx&activityId=xxx
```

---

## 🎮 遊戲類型映射

### 支援的遊戲類型
```typescript
'quiz'          → ❓ 測驗
'matching'      → 🔗 配對遊戲
'flashcards'    → 📚 單字卡片
'vocabulary'    → 📝 詞彙遊戲
'hangman'       → 🎯 猜字遊戲
'airplane'      → ✈️ 飛機遊戲
'memory-cards'  → 🧠 記憶卡片
'whack-a-mole'  → 🔨 打地鼠
'spin-wheel'    → 🎡 轉盤
// ... 更多類型
```

### 添加新遊戲類型
```typescript
// 1. 更新映射（WordwallStyleActivityCard.tsx）
'new-game': { icon: '🎮', name: '新遊戲' }

// 2. 添加預覽（GameThumbnailPreview.tsx）
const renderNewGamePreview = () => (/* ... */);
if (gameTypeKey.includes('new-game')) {
  return renderNewGamePreview();
}
```

---

## 🐛 快速故障排除

### 詞彙不顯示
```typescript
// 1. 檢查 API 響應
const response = await fetch(`/api/activities/${id}`);
const data = await response.json();
console.log('vocabularyItems:', data.vocabularyItems);
console.log('elements:', data.elements);

// 2. 使用工具函數
const vocabularyData = await loadVocabularyData(data);
console.log('載入結果:', vocabularyData);

// 3. 檢查長度
if (vocabularyData.length === 0) {
  console.error('❌ 沒有詞彙數據！');
}
```

### 重新命名失敗
```typescript
// 檢查 API 路由是否有 PATCH 方法
// 文件：app/api/activities/[id]/route.ts
export async function PATCH(request, { params }) { /* ... */ }
```

### 瀏覽次數不增加
```typescript
// 檢查追蹤 API 調用
// 文件：app/games/switcher/page.tsx
fetch(`/api/activities/${activityId}/view`, { method: 'POST' });

// 檢查 API 是否存在
// 文件：app/api/activities/[id]/view/route.ts
```

### 遊戲預覽不顯示
```typescript
// 檢查組件導入
import GameThumbnailPreview from './GameThumbnailPreview';

// 檢查 props
<GameThumbnailPreview
  gameType={activity.gameType}
  vocabularyItems={activity.vocabularyItems}
/>
```

---

## 📊 資料庫模型速查

### Activity 模型（關鍵字段）
```prisma
model Activity {
  id              String   @id @default(cuid())
  title           String
  gameType        String
  playCount       Int      @default(0)      // 瀏覽次數
  shareCount      Int      @default(0)
  isPublic        Boolean  @default(false)
  isPublicShared  Boolean  @default(false)  // 社區分享
  
  // 詞彙數據（三種來源）
  vocabularyItems VocabularyItem[]          // 關聯（最新）
  elements        Json?                     // JSON（中期）
  content         Json?                     // JSON（舊版）
  
  // 關聯
  userId          String
  user            User     @relation(...)
  assignments     Assignment[]
  results         Result[]
}
```

### VocabularyItem 模型
```prisma
model VocabularyItem {
  id         String   @id @default(cuid())
  english    String
  chinese    String
  activityId String
  activity   Activity @relation(...)
}
```

---

## 🎯 開發工作流程

### 標準流程
```
1. 理解需求
   ↓
2. 查找相關代碼（codebase-retrieval）
   ↓
3. 查看現有實現（view）
   ↓
4. 修改代碼
   ↓
5. 檢查語法（diagnostics）
   ↓
6. 測試功能
   ↓
7. 提交代碼（git commit）
   ↓
8. 推送到 GitHub（git push）
   ↓
9. 等待 Vercel 部署
   ↓
10. 測試生產環境
```

### Commit Message 格式
```
feat: 添加新功能
fix: 修復問題
docs: 更新文檔
refactor: 重構代碼
test: 添加測試
style: 樣式調整
```

---

## 🔗 重要 URL

### 開發環境
- 本地：http://localhost:3000
- 我的活動：http://localhost:3000/my-activities
- 遊戲頁面：http://localhost:3000/games/switcher

### 生產環境
- 主站：https://edu-create.vercel.app
- 我的活動：https://edu-create.vercel.app/my-activities
- GitHub：https://github.com/nteverysome/EduCreate

### 管理工具
- Vercel Dashboard：https://vercel.com/dashboard
- Prisma Studio：`npx prisma studio`

---

## 📚 必讀規則文檔

### 最高優先級
```
.augment/rules/#強制檢查規則-最高優先級.md
```
- 每次任務完成後必須執行的檢查
- 包含 5 項強制檢查項目

### 核心規則
```
.augment/rules/#防止功能孤立的完整工作流程.md
.augment/rules/@代碼開發與驗證規範.md
.augment/rules/@專案記憶與上下文管理.md
.augment/rules/@統一架構提醒.md
```

### 領域規則
```
.augment/rules/@GEPT分級自動檢查.md
.augment/rules/@記憶科學遊戲設計.md
.augment/rules/@無障礙設計檢查.md
```

---

## 🆘 緊急情況

### 代碼出問題了
```bash
# 1. 查看最近提交
git log --oneline -10

# 2. 回退到上一個版本
git reset --hard HEAD~1

# 3. 強制推送（謹慎！）
git push -f origin master
```

### 部署失敗了
```bash
# 1. 檢查 Vercel 日誌
# 訪問 Vercel Dashboard

# 2. 本地測試構建
npm run build

# 3. 修復錯誤後重新推送
git push
```

### 資料庫問題
```bash
# 1. 打開資料庫管理界面
npx prisma studio

# 2. 同步資料庫模型
npx prisma db push

# 3. 重新生成 Prisma Client
npx prisma generate
```

---

## 💬 常見問題 FAQ

### Q: 如何添加新的遊戲類型？
A: 更新 `getGameTypeInfo` 映射 + 添加預覽函數

### Q: 詞彙數據為什麼有三種來源？
A: 專案演進的結果，保持向後兼容性

### Q: 為什麼要檢查數組長度？
A: JavaScript 空數組是 truthy 值，會導致錯誤判斷

### Q: PATCH 和 PUT 有什麼區別？
A: PATCH 部分更新，PUT 完整更新

### Q: 如何測試匿名模式？
A: 訪問 `/games/switcher?game=xxx&activityId=xxx`（不帶 assignmentId）

### Q: 瀏覽次數在哪裡追蹤？
A: `app/api/activities/[id]/view/route.ts` + 遊戲頁面自動調用

---

## 🎓 學習路徑

### 第一天
- [ ] 閱讀 HANDOVER_DOCUMENT.md
- [ ] 閱讀 TECHNICAL_HANDOVER.md
- [ ] 瀏覽所有規則文檔
- [ ] 啟動本地開發環境
- [ ] 測試主要功能

### 第一週
- [ ] 熟悉代碼結構
- [ ] 理解詞彙數據架構
- [ ] 掌握 API 路由
- [ ] 完成小型修改任務
- [ ] 學習 Git 工作流程

### 第一個月
- [ ] 獨立完成功能開發
- [ ] 理解記憶科學原理
- [ ] 掌握 GEPT 分級系統
- [ ] 優化現有功能
- [ ] 貢獻新的遊戲類型

---

**快速參考版本**：1.0  
**最後更新**：2025-01-18  
**提示**：將此文檔加入書籤，隨時查閱！

