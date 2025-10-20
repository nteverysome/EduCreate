# EduCreate 專案交接文檔

## 📋 專案概述

### 專案名稱
**EduCreate** - 教育遊戲創建平台

### 專案描述
一個基於 Wordwall 風格的教育遊戲平台，支援 25+ 種遊戲類型，專注於英語詞彙學習，整合記憶科學原理和 GEPT 分級系統。

### 技術棧
- **前端框架**：Next.js 14 (App Router)
- **UI 框架**：React 18 + TypeScript
- **樣式**：Tailwind CSS
- **資料庫**：PostgreSQL + Prisma ORM
- **身份驗證**：NextAuth.js
- **部署平台**：Vercel
- **版本控制**：Git + GitHub

### 專案 URL
- **生產環境**：https://edu-create.vercel.app
- **GitHub 倉庫**：https://github.com/nteverysome/EduCreate
- **本地開發**：http://localhost:3000

---

## 🗂️ 專案結構

### 核心目錄結構
```
EduCreate/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API 路由
│   │   ├── activities/           # 活動 CRUD API
│   │   ├── assignments/          # 課業分配 API
│   │   ├── play/                 # 遊戲遊玩 API
│   │   ├── results/              # 成績記錄 API
│   │   └── leaderboard/          # 排行榜 API
│   ├── games/                    # 遊戲頁面
│   │   └── switcher/             # 遊戲切換器頁面
│   ├── my-activities/            # 我的活動頁面
│   ├── create/                   # 活動創建頁面
│   └── community/                # 社區頁面
├── components/                   # React 組件
│   ├── activities/               # 活動相關組件
│   │   ├── WordwallStyleActivityCard.tsx  # 活動卡片
│   │   └── GameThumbnailPreview.tsx       # 遊戲預覽
│   ├── games/                    # 遊戲組件
│   └── ui/                       # UI 組件
├── lib/                          # 工具函數庫
│   ├── vocabulary/               # 詞彙處理
│   │   └── loadVocabularyData.ts # 詞彙載入工具
│   ├── game-templates/           # 遊戲模板管理
│   └── wordwall/                 # Wordwall 風格管理
├── prisma/                       # Prisma ORM
│   └── schema.prisma             # 資料庫模型定義
├── public/                       # 靜態資源
│   └── games/                    # 遊戲資源
└── docs/                         # 文檔
    ├── API_DOCUMENTATION.md      # API 文檔
    └── HANDOVER_DOCUMENT.md      # 本文檔
```

---

## 🎮 核心功能模組

### 1. 活動管理系統

#### 活動卡片組件
**文件**：`components/activities/WordwallStyleActivityCard.tsx`

**功能**：
- 顯示活動信息（標題、遊戲類型、瀏覽次數）
- 動態遊戲預覽縮略圖
- 遊戲類型標籤（圖標 + 名稱）
- 操作按鈕（遊玩、編輯、複製、刪除、分享）
- 重新命名功能
- 拖拽到資料夾功能
- 課業分配功能

**重要更新**：
- 遊戲類型標籤改為 Wordwall 風格（白色半透明 + 圖標 + 名稱）
- 添加動態遊戲預覽功能（顯示實際遊戲畫面和單字）
- 瀏覽次數改為真實追蹤（每次訪問自動增加）

#### 遊戲預覽組件
**文件**：`components/activities/GameThumbnailPreview.tsx`

**功能**：
- 根據遊戲類型動態生成預覽畫面
- 顯示活動的前 3 個單字（英文 + 中文）
- 支援 7+ 種遊戲類型的專屬預覽

**支援的遊戲類型**：
- Shimozurdo Game：深色背景 + Logo + 單字列表
- Quiz 測驗：問題 + 選項佈局
- Matching 配對：左右配對網格
- Flashcards 單字卡片：堆疊卡片效果
- Hangman 猜字：字母空格預覽
- Airplane 飛機：天空背景 + 單字
- Memory Cards 記憶：卡片網格佈局

### 2. 詞彙管理系統

#### 詞彙載入工具
**文件**：`lib/vocabulary/loadVocabularyData.ts`

**功能**：
- 統一的詞彙數據載入邏輯
- 支援三種數據來源（按優先級）：
  1. `vocabularyItems`：關聯到 VocabularySet 模型（最新架構）
  2. `elements`：JSON 字段存儲（中期架構）
  3. `content.vocabularyItems`：舊版存儲（最舊架構）
- 自動標準化詞彙格式
- 長度驗證（避免空數組問題）

**核心函數**：
```typescript
loadVocabularyData(activity)           // 載入詞彙數據
normalizeVocabularyItem(item, index)   // 標準化格式
hasVocabularyData(activity)            // 檢查是否有詞彙
getSourceDisplayName(source)           // 獲取來源名稱
```

**重要修復**：
- 修復了 JavaScript 空數組陷阱（空數組是 truthy 值）
- 所有檢查都添加了 `&& arr.length > 0` 驗證

### 3. 遊戲系統

#### 遊戲切換器頁面
**文件**：`app/games/switcher/page.tsx`

**功能**：
- 支援匿名模式和姓名模式
- 從 URL 參數載入活動和遊戲類型
- 自動追蹤瀏覽次數
- 顯示活動信息框
- 嵌入遊戲 iframe

**URL 參數**：
```
/games/switcher?game=vocabulary&activityId=xxx&assignmentId=xxx&studentName=xxx
```

**模式判斷**：
- 有 `assignmentId` + `studentName`：姓名模式（記錄成績）
- 只有 `activityId`：匿名模式（不記錄成績）

#### 瀏覽次數追蹤
**API**：`app/api/activities/[id]/view/route.ts`

**功能**：
- POST 請求增加活動的 `playCount` 字段
- 不需要身份驗證（任何人訪問都計數）
- 異步執行，不阻塞頁面載入

**調用位置**：
- `app/games/switcher/page.tsx` 的 `loadActivityInfo` 函數

### 4. API 系統

#### 活動 API
**文件**：`app/api/activities/[id]/route.ts`

**支援的方法**：
- `GET`：獲取活動詳情（包含 elements 和 vocabularyItems）
- `PUT`：完整更新活動（用於拖拽到資料夾）
- `PATCH`：部分更新活動（用於重新命名）
- `DELETE`：刪除活動

**重要更新**：
- GET 方法添加了 `elements` 和 `vocabularyItems` 字段
- 添加了 PATCH 方法支援重新命名功能

#### 課業分配 API
**文件**：`app/api/assignments/route.ts`

**功能**：
- 創建課業分配
- 生成唯一的分配 ID
- 設定截止日期和其他參數

### 5. 資料夾系統

#### 資料夾架構
**Prisma 模型**：`prisma/schema.prisma` - `Folder` 模型

**核心特性**：
- **10 層資料夾嵌套**：支援最多 10 層的資料夾結構（depth 0-9）
- **自引用關係**：使用 `parentId` 和 `parent/children` 關係實現樹狀結構
- **深度控制**：自動計算和驗證資料夾深度
- **路徑管理**：自動維護完整路徑（`path` 字段）
- **類型區分**：支援 `activities` 和 `results` 兩種類型

**資料庫字段**：
```prisma
model Folder {
  id        String     @id @default(cuid())
  name      String
  userId    String
  type      FolderType  // 'activities' 或 'results'
  parentId  String?     // 父資料夾 ID
  depth     Int         @default(0)  // 層級深度（0-9）
  path      String?     // 完整路徑
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  parent     Folder?    @relation("FolderHierarchy", fields: [parentId], references: [id])
  children   Folder[]   @relation("FolderHierarchy")
  activities Activity[]
  results    Result[]
}
```

#### 資料夾 API
**文件**：`app/api/folders/route.ts`

**支援的方法**：
- `GET`：獲取資料夾列表（支援 `parentId` 和 `includeBreadcrumbs` 參數）
- `POST`：創建新資料夾
- `PATCH`：重新命名資料夾
- `DELETE`：刪除空資料夾

**重要功能**：
- **麵包屑導航**：當 `includeBreadcrumbs=true` 時，返回完整的資料夾路徑
- **遞歸計數**：自動計算包含所有子資料夾的活動/結果總數
- **深度限制**：防止超過 10 層嵌套

**API 響應格式**：
```typescript
// 普通響應（不包含麵包屑）
FolderData[]

// 包含麵包屑的響應
{
  folders: FolderData[],
  breadcrumbs: Array<{ id: string; name: string }>,
  currentFolder: { id: string; name: string; parentId: string | null } | null
}
```

#### 統一 API 管理器
**文件**：`lib/api/folderApiManager.ts`

**功能**：
- 統一管理所有資料夾相關的 API 調用
- 自動處理不同的響應格式
- 提供類型安全的 API 接口

**主要方法**：
```typescript
class FolderApiManager {
  // 獲取資料夾列表
  async getFolders(type: FolderType, parentId?: string | null, includeBreadcrumbs?: boolean)

  // 創建資料夾
  async createFolder(name: string, type: FolderType, parentId?: string | null)

  // 重新命名資料夾
  async renameFolder(folderId: string, newName: string)

  // 刪除資料夾
  async deleteFolder(folderId: string)

  // 移動活動到資料夾
  async moveActivityToFolder(activityId: string, folderId: string | null)
}
```

#### 資料夾組件
**文件**：`components/activities/FolderManager.tsx`

**功能**：
- 資料夾樹狀顯示
- 資料夾 CRUD 操作
- 拖放移動活動
- 右鍵選單（重新命名、刪除、在新分頁開啟）

#### 麵包屑導航
**實現位置**：
- `/my-activities` 頁面：`components/activities/WordwallStyleMyActivities.tsx`
- `/my-results` 頁面：`components/results/WordwallStyleMyResults.tsx`
- 社區作者頁面：`app/community/author/[authorId]/page.tsx`

**功能**：
- 顯示完整的資料夾路徑（例如：我的活動 > 資料夾1 > 資料夾2）
- 點擊任意麵包屑快速導航到該資料夾
- 自動從 API 獲取麵包屑數據

**實現模式**：
```typescript
// 1. 請求包含麵包屑的數據
const foldersData = await folderApi.getFolders('activities', currentFolderId, !!currentFolderId);

// 2. 檢查響應類型並設置麵包屑
if (currentFolderId && 'folders' in foldersData) {
  const { folders, breadcrumbs } = foldersData as FoldersWithBreadcrumbs;
  setFolders(folders);
  setBreadcrumbs(breadcrumbs);
}

// 3. 渲染麵包屑 UI
{breadcrumbs.length > 0 && (
  <div className="flex items-center gap-2">
    <button onClick={() => handleFolderSelect(null)}>我的活動</button>
    {breadcrumbs.map((crumb) => (
      <>
        <ChevronRight size={16} />
        <button onClick={() => handleFolderSelect(crumb.id)}>{crumb.name}</button>
      </>
    ))}
  </div>
)}
```

#### 遞歸活動/結果計數
**實現位置**：`app/api/folders/route.ts`

**功能**：
- 計算資料夾中的活動/結果數量
- 包含所有子資料夾的活動/結果
- 支援不同的過濾條件（如只計算已發布的活動）

**實現邏輯**：
```typescript
// 遞歸計算活動數量
async function getActivityCount(folderId: string, userId: string, onlyPublished: boolean = false) {
  // 1. 獲取當前資料夾的活動數量
  const directCount = await prisma.activity.count({
    where: {
      folderId,
      userId,
      ...(onlyPublished && { isPublished: true })
    }
  });

  // 2. 獲取所有子資料夾
  const children = await prisma.folder.findMany({
    where: { parentId: folderId, userId }
  });

  // 3. 遞歸計算子資料夾的活動數量
  let childrenCount = 0;
  for (const child of children) {
    childrenCount += await getActivityCount(child.id, userId, onlyPublished);
  }

  return directCount + childrenCount;
}
```

#### 社區作者頁面資料夾系統
**文件**：`app/community/author/[authorId]/page.tsx`

**特殊功能**：
- 只顯示包含已發布活動的資料夾
- 遞歸檢查子資料夾是否有已發布活動
- 活動數量只計算已發布的活動
- 支援資料夾導航和麵包屑

**API 端點**：`app/api/community/authors/[authorId]/activities/route.ts`

**查詢參數**：
- `folderId`：當前資料夾 ID
- 自動過濾只包含已發布活動的資料夾

---

## 🐛 已知問題和解決方案

### 1. 詞彙數據消失問題（已修復）

**問題描述**：
- 複製活動後，詞彙數據消失
- 編輯頁面無法載入詞彙
- 活動卡片彈出框顯示空白

**根本原因**：
- JavaScript 空數組陷阱：`vocabularyItems: []` 是 truthy 值
- 代碼檢查 `if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems))` 會匹配空數組

**解決方案**：
- 所有檢查都添加 `&& arr.length > 0` 驗證
- 創建統一的詞彙載入工具（`lib/vocabulary/loadVocabularyData.ts`）

**相關提交**：
- d18ef4d：修復編輯頁面
- 5923e07：修復活動卡片
- e9315dd：創建統一工具函數

### 2. 重新命名功能失敗（已修復）

**問題描述**：
- 點擊重新命名按鈕後顯示「重新命名失敗，請稍後再試」

**根本原因**：
- RenameActivityModal 使用 PATCH 方法
- API 路由只有 GET、PUT、DELETE 方法，缺少 PATCH 處理器

**解決方案**：
- 添加 PATCH 方法處理器到 `app/api/activities/[id]/route.ts`
- PATCH 用於部分更新（如重新命名）
- PUT 保留用於完整更新（如拖拽到資料夾）

**相關提交**：
- 619588a：添加 PATCH 方法

### 3. 瀏覽次數顯示靜態數據（已修復）

**問題描述**：
- 「我的活動」頁面顯示的瀏覽次數不是真實數據

**解決方案**：
- 創建瀏覽次數追蹤 API（`app/api/activities/[id]/view/route.ts`）
- 在遊戲頁面自動調用追蹤 API
- 更新 `playCount` 字段

**相關提交**：
- 73f0c02：添加瀏覽次數追蹤功能

### 4. 「在新分頁開啟」功能無法正確導航（已修復）

**問題描述**：
- 右鍵點擊資料夾選擇「在新分頁開啟」後，新視窗直接回到根目錄
- 麵包屑導航不顯示
- 用戶看到閃爍（先顯示根目錄，然後跳轉到目標資料夾）

**根本原因**：
- 使用 `window.location.search` 讀取 URL 參數不可靠
- 在 Next.js 14 App Router 中，組件掛載時 `window.location.search` 可能還沒準備好
- 在 `useEffect` 中設置狀態導致額外的重新渲染

**解決方案**：
1. **使用 Next.js 的 `useSearchParams` hook**：
   ```typescript
   import { useSearchParams } from 'next/navigation';

   const searchParams = useSearchParams();
   const folderIdFromUrl = searchParams?.get('folderId') || null;
   ```

2. **直接從 URL 參數初始化狀態**：
   ```typescript
   // ✅ 正確：直接初始化
   const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderIdFromUrl);

   // ❌ 錯誤：在 useEffect 中設置
   const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
   useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const folderIdFromUrl = urlParams.get('folderId');
     if (folderIdFromUrl) {
       setCurrentFolderId(folderIdFromUrl);
     }
   }, []);
   ```

3. **移除舊的 URL 參數讀取邏輯**：
   - 刪除使用 `window.location.search` 的 `useEffect`

**修復效果**：
- ✅ 新視窗直接顯示目標資料夾，沒有閃爍
- ✅ 麵包屑導航正確顯示完整路徑
- ✅ 減少組件重新渲染次數，提升性能
- ✅ 符合 Next.js 14 App Router 最佳實踐

**影響的頁面**：
- `/my-activities` 頁面（`components/activities/WordwallStyleMyActivities.tsx`）
- `/my-results` 頁面（`components/results/WordwallStyleMyResults.tsx`）

**相關提交**：
- 62b49db：修復 /my-results 頁面「在新分頁開啟」功能
- 8226666：修復 /my-activities 頁面「在新分頁開啟」功能

---

## 📝 重要代碼模式

### 1. 詞彙數據載入模式

**正確做法**：
```typescript
import { loadVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

// 載入詞彙數據
const vocabularyData = await loadVocabularyData(activity);

if (vocabularyData.length > 0) {
  // 使用詞彙數據
  console.log('載入了', vocabularyData.length, '個詞彙');
}
```

**錯誤做法**（會遇到空數組問題）：
```typescript
// ❌ 不要這樣做
if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems)) {
  // 這會匹配空數組！
}

// ✅ 應該這樣做
if (activity.vocabularyItems && activity.vocabularyItems.length > 0) {
  // 正確檢查
}
```

### 2. API 調用模式

**GET 請求**：
```typescript
const response = await fetch(`/api/activities/${activityId}`);
const data = await response.json();
```

**POST 請求**：
```typescript
const response = await fetch(`/api/activities/${activityId}/view`, {
  method: 'POST',
});
```

**PATCH 請求**（部分更新）：
```typescript
const response = await fetch(`/api/activities/${activityId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: newTitle }),
});
```

### 3. 遊戲類型映射模式

**文件**：`components/activities/WordwallStyleActivityCard.tsx`

```typescript
const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
  const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
    'quiz': { icon: '❓', name: '測驗' },
    'matching': { icon: '🔗', name: '配對遊戲' },
    // ... 更多遊戲類型
  };
  
  return gameTypeMap[gameType] || { icon: '🎮', name: gameType || '遊戲' };
};
```

---

## 🔧 開發環境設置

### 1. 克隆專案
```bash
git clone https://github.com/nteverysome/EduCreate.git
cd EduCreate
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境變數設置
創建 `.env.local` 文件：
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### 4. 資料庫設置
```bash
npx prisma generate
npx prisma db push
```

### 5. 啟動開發服務器
```bash
npm run dev
```

---

## 📚 重要文檔

### 專案文檔
- `README.md`：專案說明和快速開始
- `docs/API_DOCUMENTATION.md`：API 文檔
- `docs/VOCABULARY_LOADING_BUG_ANALYSIS.md`：詞彙載入問題分析
- `docs/GAME_SWITCHER_API_ANALYSIS.md`：遊戲頁面 API 分析

### 規則文檔（`.augment/rules/`）
- `#強制檢查規則-最高優先級.md`：每次任務完成後的強制檢查
- `#防止功能孤立的完整工作流程.md`：確保功能整合到主頁面
- `@代碼開發與驗證規範.md`：代碼開發標準
- `@專案記憶與上下文管理.md`：避免重複開發
- `@統一架構提醒.md`：25 種遊戲統一架構要求
- `@GEPT分級自動檢查.md`：GEPT 詞彙分級檢查
- `@記憶科學遊戲設計.md`：記憶科學原理

---

## 🚀 最近的重要更新

### 最新提交（按時間倒序）

1. **8226666** - fix: 修復 /my-activities 頁面「在新分頁開啟」功能
   - 使用 useSearchParams 替代 window.location.search
   - 直接從 URL 參數初始化 currentFolderId
   - 避免閃爍和跳轉，提升用戶體驗

2. **96717a9** - debug: 添加調試日誌診斷麵包屑導航問題
   - 添加 currentFolderId 值的日誌
   - 添加響應數據類型的日誌
   - 幫助診斷麵包屑不顯示的問題

3. **62b49db** - fix: 修復 /my-results 頁面「在新分頁開啟」功能
   - 使用 useSearchParams hook 讀取 URL 參數
   - 修復新視窗打開到根目錄的問題
   - 確保麵包屑導航正確顯示

4. **7a01fd3** - fix: 修復 /my-results 頁面資料夾結果數量顯示錯誤
   - 使用 resultCount 而不是 activityCount
   - 確保資料夾顯示正確的結果數量

5. **61c83f3** - feat: 在 /my-results 頁面添加麵包屑導航功能
   - 導入 ChevronRight 圖標和麵包屑類型
   - 添加麵包屑狀態管理
   - 修改 loadFolders 函數支持麵包屑請求
   - 添加麵包屑導航 UI

6. **f0242ea** - refactor: 移除 FolderManager 中的舊麵包屑導航
   - 避免與新的完整麵包屑導航重複
   - 保持代碼簡潔

7. **3aca9b5** - feat: 在 /my-activities 頁面添加完整麵包屑導航
   - API: 修改 /api/folders 端點支持 includeBreadcrumbs 參數
   - API: 遞歸構建麵包屑路徑
   - 前端: 添加麵包屑狀態管理
   - 前端: 添加麵包屑導航 UI
   - 功能: 點擊麵包屑快速導航

8. **7309e22** - fix: 修復社區作者頁面 JSX 語法錯誤
   - 修復缺少的閉合括號
   - 移除多餘的閉合標籤

9. **a8eb980** - feat: 在社區作者頁面添加資料夾系統
   - API: 添加 folderId 查詢參數支援
   - API: 只顯示包含已發布活動的資料夾
   - API: 遞歸計算活動數量
   - 前端: 添加資料夾導航功能
   - 前端: 添加麵包屑導航 UI
   - 類似 Wordwall 的 Teacher Page 設計

10. **af332dd** - feat: 添加動態遊戲預覽縮略圖功能
    - 創建 GameThumbnailPreview 組件
    - 支援 7+ 種遊戲類型的專屬預覽
    - Shimozurdo Game 深色風格預覽

11. **901e375** - feat: 改進活動卡片遊戲類型標籤 - Wordwall 風格
    - 遊戲標籤改為白色半透明背景
    - 顯示圖標 + 名稱組合
    - 支援 25+ 種遊戲類型映射

12. **73f0c02** - feat: 添加活動瀏覽次數追蹤功能
    - 創建瀏覽次數追蹤 API
    - 遊戲頁面自動追蹤
    - 真實數據顯示

---

## ⚠️ 注意事項

### 1. 詞彙數據處理
- **永遠使用** `lib/vocabulary/loadVocabularyData.ts` 工具函數
- **不要直接訪問** `activity.vocabularyItems` 或 `activity.elements`
- **必須檢查** 數組長度（`arr.length > 0`）

### 2. API 方法選擇
- **PATCH**：部分更新（如重新命名）
- **PUT**：完整更新（如拖拽到資料夾）
- **POST**：創建或修改狀態（如增加瀏覽次數）

### 3. 遊戲類型
- 使用統一的遊戲類型映射（`getGameTypeInfo`）
- 支援英文和中文名稱
- 每種遊戲都有專屬圖標

### 4. 測試流程
- 每次修改後必須測試完整的用戶流程
- 從主頁開始測試（避免功能孤立）
- 使用 Playwright 進行 E2E 測試

---

## 📞 聯絡信息

### GitHub
- **倉庫**：https://github.com/nteverysome/EduCreate
- **用戶**：nteverysome

### 部署
- **平台**：Vercel
- **URL**：https://edu-create.vercel.app

---

## 🎯 下一步建議

### 短期任務
1. **資料夾系統優化**
   - 添加拖放移動資料夾功能
   - 添加批量移動多個活動到資料夾
   - 添加資料夾顏色和圖標自定義
   - 優化資料夾載入性能（懶加載）

2. **完善遊戲預覽功能**
   - 添加更多遊戲類型的預覽
   - 優化預覽載入速度

3. **優化詞彙載入性能**
   - 添加詞彙數據緩存
   - 優化大量詞彙的載入

4. **添加更多測試覆蓋**
   - 資料夾系統的單元測試
   - API 端點的集成測試

### 中期任務
1. **實現 25 種遊戲類型的完整支援**
   - 完成所有遊戲類型的開發
   - 統一遊戲架構和 API

2. **添加主題系統（風格切換）**
   - 設計主題抽象層
   - 支援動態更換遊戲視覺風格
   - 為未來主題商店預留接口

3. **完善社區分享功能**
   - 優化社區作者頁面
   - 添加活動評論和評分
   - 添加活動收藏功能

4. **資料夾系統高級功能**
   - 資料夾搜索功能
   - 資料夾排序和過濾
   - 資料夾分享功能

### 長期任務
1. **實現跨遊戲學習數據同步**
   - 統一的學習進度追蹤
   - 記憶科學數據分析
   - 個人化推薦系統

2. **添加 AI 圖片生成功能**
   - 整合 AI 圖片生成 API
   - 自動生成遊戲素材

3. **開發移動應用版本**
   - React Native 或 Flutter
   - 離線模式支援

---

**文檔版本**：2.0
**最後更新**：2025-10-20
**維護者**：EduCreate Team

**更新日誌**：
- 2.0 (2025-10-20)：添加資料夾系統完整文檔，更新最新提交記錄，添加「在新分頁開啟」功能修復說明
- 1.0 (2025-01-18)：初始版本

