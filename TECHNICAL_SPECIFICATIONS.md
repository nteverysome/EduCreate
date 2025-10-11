# EduCreate 技術規格文檔

## 🏗️ 系統架構

### 技術棧
- **前端**：Next.js 14.0.1 (App Router)
- **後端**：Next.js API Routes
- **數據庫**：PostgreSQL (Railway)
- **ORM**：Prisma
- **認證**：NextAuth.js (JWT)
- **部署**：Vercel
- **測試**：Playwright

### 環境配置
```bash
# 必要環境變數
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://edu-create.vercel.app"
```

## 📊 數據庫架構

### 核心表結構
```sql
-- 用戶表
User {
  id: String @id @default(cuid())
  email: String @unique
  name: String?
  role: Role @default(USER)
  activities: Activity[]
  vocabularySets: VocabularySet[]
}

-- 活動表（主要實體）
Activity {
  id: String @id @default(cuid())
  title: String
  description: String?
  content: Json?  // { vocabularySetId: "xxx", gameTemplateId: "yyy" }
  type: String
  userId: String
  createdAt: DateTime @default(now())
  user: User @relation(fields: [userId], references: [id])
}

-- 詞彙集合表
VocabularySet {
  id: String @id @default(cuid())
  title: String
  description: String?
  geptLevel: GEPTLevel @default(ELEMENTARY)
  userId: String
  items: VocabularyItem[]
  user: User @relation(fields: [userId], references: [id])
}

-- 詞彙項目表
VocabularyItem {
  id: String @id @default(cuid())
  setId: String  // 注意：字段名是 setId，不是 vocabularySetId
  english: String
  chinese: String
  phonetic: String?
  set: VocabularySet @relation(fields: [setId], references: [id])
}
```

### 關聯關係問題
⚠️ **當前架構問題**：
- Activity 通過 JSON 字段 `content.vocabularySetId` 關聯 VocabularySet
- 不是標準的外鍵關聯，造成查詢複雜性
- VocabularyItem.setId 字段名容易與 vocabularySetId 混淆

## 🔌 API 端點規格

### 活動管理 API

#### GET /api/activities
```typescript
// 獲取用戶所有活動
Response: {
  id: string;
  title: string;
  description?: string;
  type: string;
  createdAt: string;
  vocabularyInfo?: {
    totalWords: number;
    geptLevel: string;
  };
}[]
```

#### DELETE /api/activities/[id]
```typescript
// 刪除活動（已修復）
// 注意：使用 Activity.id，不是 VocabularySet.id
Request: { id: string }  // Activity ID
Response: {
  message: string;
  deletedActivityId: string;
}
```

#### POST /api/activities
```typescript
// 創建活動
Request: {
  title: string;
  gameTemplateId: string;
  vocabularyItems: VocabularyItem[];
}
Response: {
  id: string;  // Activity ID
  vocabularySetId: string;  // VocabularySet ID
  message: string;
}
```

### 認證 API
- **NextAuth 端點**：`/api/auth/[...nextauth]`
- **Session 檢查**：使用 `getServerSession(authOptions)`

## 🎨 前端組件架構

### 頁面結構
```
app/
├── page.tsx                 # 首頁
├── my-activities/page.tsx   # 我的活動（Wordwall 風格）
├── create/page.tsx          # 創建活動
└── login/page.tsx           # 登入頁面
```

### 核心組件
```
components/
├── activities/
│   └── WordwallStyleMyActivities.tsx  # 主要活動展示組件
├── navigation/
│   └── UnifiedNavigation.tsx          # 統一導航
└── auth/
    └── LoginPrompt.tsx                # 登入提示
```

### 狀態管理
- **認證狀態**：NextAuth useSession hook
- **活動數據**：React useState + useEffect
- **無全域狀態管理**：使用 React 內建狀態

## 🔧 已修復的關鍵問題

### 1. DELETE API Prisma 字段名錯誤
**文件**：`app/api/activities/[id]/route.ts`
**問題**：第 69 行使用 `vocabularySetId` 字段名
**修復**：改為 `setId`
```typescript
// 錯誤的寫法
where: { vocabularySetId: vocabularySetId }

// 正確的寫法
where: { setId: vocabularySetId }
```

### 2. 路由衝突問題
**問題**：Pages Router 和 App Router 重複路由
**解決**：刪除 `pages/api/activities/[id].ts`，保留 `app/api/activities/[id]/route.ts`

### 3. 認證問題
**問題**：API 使用錯誤的用戶查找方式
**解決**：直接使用 `session.user.id`，不需要額外查找

## 🎯 Wordwall 功能對應

### 已實現功能
- ✅ 活動網格佈局
- ✅ 活動縮略圖和標題
- ✅ 詞彙數量顯示
- ✅ 難度等級標籤
- ✅ 播放/編輯/更多選項按鈕
- ✅ 搜尋功能
- ✅ 篩選功能
- ✅ 創建活動按鈕

### UI 組件對應
```typescript
// Wordwall 風格的活動卡片
<div className="activity-card">
  <img src={thumbnail} />
  <h3>{title}</h3>
  <div className="stats">
    <span>{totalWords} 詞</span>
    <span>{geptLevel}</span>
  </div>
  <div className="actions">
    <button>播放</button>
    <button>編輯</button>
    <button>更多選項</button>
  </div>
</div>
```

## 🚨 已知限制和建議

### 架構限制
1. **雙表複雜性**：Activity + VocabularySet 造成維護困難
2. **JSON 關聯**：非標準外鍵關聯，查詢效率低
3. **ID 系統混亂**：前端和後端使用不同 ID

### 建議改進
1. **架構簡化**：合併到單表架構（Activity 表）
2. **標準化關聯**：使用標準外鍵替代 JSON 關聯
3. **統一 ID 系統**：全系統使用 Activity.id

## 🧪 測試策略

### E2E 測試（Playwright）
- **測試範圍**：完整用戶流程
- **關鍵測試**：創建、刪除、編輯活動
- **測試環境**：https://edu-create.vercel.app

### 測試用例
```typescript
// 刪除功能測試
test('刪除活動功能', async ({ page }) => {
  await page.goto('/my-activities');
  await page.click('[data-testid="more-options"]');
  await page.click('[data-testid="delete-button"]');
  await page.click('[data-testid="confirm-delete"]');
  // 驗證活動已刪除且不會重新出現
});
```

## 📦 部署配置

### Vercel 配置
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Next.js 配置
```javascript
// next.config.js
module.exports = {
  reactStrictMode: false,  // 簡化配置
  experimental: {
    serverComponentsExternalPackages: ['prisma']
  }
}
```

## 🔄 開發工作流程

### Git 工作流程
1. **功能開發**：在本地分支開發
2. **測試驗證**：運行 Playwright 測試
3. **提交推送**：推送到 master 分支
4. **自動部署**：Vercel 自動部署
5. **生產驗證**：在生產環境測試功能

### 代碼規範
- **提交信息**：使用表情符號前綴
- **文件命名**：使用 PascalCase（組件）和 camelCase（函數）
- **API 設計**：RESTful 風格

---

**文檔版本**：v1.0
**最後更新**：2025-10-11
**維護者**：EduCreate 開發團隊
