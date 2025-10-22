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

#### Shimozurdo Game 五列布局系統
**文件**：
- `public/games/shimozurdo-game/scenes/title.js` - 遊戲主場景
- `public/games/shimozurdo-game/managers/GEPTManager.js` - 詞彙管理器
- `app/create/[templateId]/page.tsx` - 活動創建頁面
- `components/vocabulary-item-with-image/index.tsx` - 詞彙項目組件

**功能**：
- **獨立圖片功能**：英文和中文可以各自添加獨立的圖片
- **動態布局調整**：根據內容可用性動態調整布局（1-5 列）
- **靈活顯示邏輯**：只顯示存在的內容（圖片或文字）
- **居中對齊**：布局始終居中，視覺效果更好

**資料庫欄位**：
```prisma
model VocabularyItem {
  imageUrl          String?  // 英文圖片 URL
  imageId           String?  // 英文圖片 ID
  chineseImageUrl   String?  // 中文圖片 URL
  chineseImageId    String?  // 中文圖片 ID
}
```

**布局效果**：
- **5 列**：分數 | 英文圖 | 英文 | 中文圖 | 中文（所有內容都存在）
- **4 列**：分數 | 英文圖 | 英文 | 中文（只有英文圖）
- **4 列**：分數 | 英文 | 中文圖 | 中文（只有中文圖）
- **3 列**：分數 | 英文 | 中文（沒有圖片）
- **2 列**：分數 | 英文圖（只有英文圖）
- **2 列**：分數 | 中文圖（只有中文圖）

**關鍵實現**：
```javascript
// 檢查圖片和文字是否存在
const hasEnglishImage = this.englishImage && this.englishImage.visible;
const hasChineseImage = this.chineseImage && this.chineseImage.visible;
const hasEnglishText = this.currentTargetWord?.english && this.currentTargetWord.english.trim() !== '';
const hasChineseText = this.currentTargetWord?.chinese && this.currentTargetWord.chinese.trim() !== '';

// 動態計算列數
let totalColumns = 1;  // 基礎：分數
if (hasEnglishImage) totalColumns++;
if (hasEnglishText) totalColumns++;
if (hasChineseImage) totalColumns++;
if (hasChineseText) totalColumns++;
```

**重要修復**：
- ✅ 修復刪除按鈕布局問題（添加 `flex-shrink-0`）
- ✅ 修復交換列功能（圖片不跟著交換）
- ✅ 添加中文框圖片功能
- ✅ 實施獨立圖片功能（英文和中文各自獨立）
- ✅ 實施動態布局調整（根據內容可用性）
- ✅ 修復圖片混淆問題（只使用 `chineseImageUrl`，不使用 `imageUrl` 作為 fallback）

**相關提交**：
- `f291a68`：修復圖片混淆問題
- `a16d69e`：靈活顯示邏輯
- `143380a`：動態布局調整
- `f315791`：保留圖片欄位

**詳細文檔**：
- [SHIMOZURDO_FIVE_COLUMN_LAYOUT_IMPLEMENTATION.md](./SHIMOZURDO_FIVE_COLUMN_LAYOUT_IMPLEMENTATION.md)

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

## 🖼️ 圖片管理功能

### 概述

EduCreate 現在支援完整的圖片管理功能，包括：
- Vercel Blob Storage 圖片存儲
- Unsplash 圖片搜索和整合
- 圖片上傳、管理和刪除
- 三個前端組件（ImagePicker、ContentItemWithImage、ImageGallery）

### 技術架構

**存儲方案**：
- **Vercel Blob Storage**：用於存儲用戶上傳的圖片
- **Neon PostgreSQL**：存儲圖片元數據
- **Unsplash API**：提供免費高質量圖片

**數據庫模型**：
```prisma
model UserImage {
  id            String   @id @default(cuid())
  userId        String
  url           String
  blobPath      String?
  fileName      String
  fileSize      Int
  mimeType      String
  width         Int
  height        Int
  alt           String?
  tags          String[]
  source        String   // 'upload' | 'unsplash'
  sourceId      String?
  usageCount    Int      @default(0)
  lastUsedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
  activityImages ActivityImage[]
}

model ActivityImage {
  id          String   @id @default(cuid())
  activityId  String
  imageId     String
  position    Int
  context     String?
  createdAt   DateTime @default(now())

  activity    Activity  @relation(fields: [activityId], references: [id])
  image       UserImage @relation(fields: [imageId], references: [id])
}

model ImageTag {
  id        String   @id @default(cuid())
  name      String
  userId    String?
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id])
}
```

### API 端點

**圖片管理 API** (7 個):
1. `POST /api/images/upload` - 單張圖片上傳
2. `POST /api/images/batch-upload` - 批量上傳（最多 10 張）
3. `GET /api/images/list` - 圖片列表（分頁、篩選、搜索）
4. `GET /api/images/stats` - 圖片統計
5. `DELETE /api/images/delete` - 單張刪除
6. `POST /api/images/batch-delete` - 批量刪除（最多 50 張）
7. `PATCH /api/images/update` - 更新圖片信息

**Unsplash 整合 API** (2 個):
8. `GET /api/unsplash/search` - Unsplash 搜索
9. `POST /api/unsplash/download` - Unsplash 下載

### 前端組件

**1. ImagePicker 組件**
- **位置**：`components/image-picker/index.tsx`
- **功能**：圖片選擇器（Unsplash 搜索、上傳、圖片庫）
- **使用**：
```typescript
import ImagePicker from '@/components/image-picker';

<ImagePicker
  onSelect={(images) => console.log(images)}
  onClose={() => setShowPicker(false)}
  multiple={true}
  maxSelection={5}
/>
```

**2. ContentItemWithImage 組件**
- **位置**：`components/content-item-with-image/index.tsx`
- **功能**：內容項目編輯器（圖片 + 文字）
- **使用**：
```typescript
import ContentItemWithImage from '@/components/content-item-with-image';

<ContentItemWithImage
  value={contentItem}
  onChange={(value) => setContentItem(value)}
  onRemove={() => removeItem(contentItem.id)}
  autoSave={true}
/>
```

**3. ImageGallery 組件**
- **位置**：`components/image-gallery/index.tsx`
- **功能**：圖片庫管理器（瀏覽、搜索、批量操作）
- **使用**：
```typescript
import ImageGallery from '@/components/image-gallery';

<ImageGallery
  onSelect={(image) => console.log(image)}
  selectable={true}
  multiple={true}
/>
```

### 環境變數

需要在 `.env.local` 中添加：
```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Unsplash API
UNSPLASH_ACCESS_KEY="..."
UNSPLASH_SECRET_KEY="..."
```

### 功能特性

**圖片上傳**：
- ✅ 文件類型驗證（JPEG, PNG, WebP, GIF）
- ✅ 文件大小限制（10MB）
- ✅ 圖片尺寸限制（4096x4096）
- ✅ 圖片壓縮和優化
- ✅ 批量上傳（最多 10 張）
- ✅ 拖放上傳支持

**Unsplash 整合**：
- ✅ 關鍵字搜索
- ✅ 尺寸篩選（橫向、縱向、正方形）
- ✅ 顏色篩選（11 種顏色）
- ✅ 分頁瀏覽
- ✅ 符合 Unsplash API 使用條款

**圖片管理**：
- ✅ 圖片列表（網格/列表視圖）
- ✅ 搜索和篩選
- ✅ 標籤管理
- ✅ 批量選擇和刪除
- ✅ 統計信息顯示

### 相關文檔

- **使用指南**：`docs/image-components-usage-guide.md`
- **API 文檔**：`docs/phase2-api-summary.md`
- **Phase 4 完成報告**：`docs/phase4-complete-report.md`
- **總體進度**：`docs/overall-progress-report.md`

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

### 5. 視圖模式偏好記錄功能

**功能描述**：
- 記錄用戶選擇的視圖模式（網格/小網格/列表）
- 刷新頁面後自動恢復用戶的偏好設置
- 每個頁面獨立記錄，互不干擾

**實施範圍**：
- `/my-activities` 頁面
- `/my-results` 頁面
- `/community/author/[authorId]` 頁面

**技術實現**：
使用瀏覽器原生 `localStorage` API 保存用戶偏好

**localStorage 鍵名**：
| 頁面 | localStorage 鍵名 |
|------|------------------|
| 我的活動 | `myActivitiesViewMode` |
| 我的結果 | `myResultsViewMode` |
| 社區作者 | `communityAuthorViewMode` |

**實現模式**：
```typescript
// 1. 狀態初始化（讀取偏好）
const [viewMode, setViewMode] = useState<'grid' | 'small-grid' | 'list'>(() => {
  if (typeof window !== 'undefined') {
    const savedViewMode = localStorage.getItem('myActivitiesViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'small-grid' || savedViewMode === 'list') {
      return savedViewMode;
    }
  }
  return 'grid'; // 默認值
});

// 2. 保存偏好（監聽變化）
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('myActivitiesViewMode', viewMode);
    console.log('💾 保存視圖模式偏好:', viewMode);
  }
}, [viewMode]);
```

**關鍵點**：
- ✅ 使用 `useState` 的初始化函數（只執行一次）
- ✅ SSR 安全檢查：`typeof window !== 'undefined'`
- ✅ 類型守衛：驗證讀取的值是否有效
- ✅ 默認值：無效值時使用 `'grid'`
- ✅ 控制台日誌：方便調試和驗證

**相關提交**：
- bea4509：我的活動頁面視圖模式記錄
- cbd231a：我的結果和社區作者頁面視圖模式記錄
- 7d6d5f8：添加完整實施文檔

**詳細文檔**：
參見 `docs/VIEW_MODE_PREFERENCE_IMPLEMENTATION.md`

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

1. **f291a68** - fix: 只使用 chineseImageUrl 作為中文圖片，不使用 imageUrl 作為 fallback
   - 修復中文圖片位置顯示英文圖片的問題
   - 只使用 `chineseImageUrl`，不使用 `imageUrl` 作為 fallback
   - 確保英文和中文圖片不會混淆

2. **a16d69e** - feat: 靈活顯示邏輯 - 根據內容可用性顯示/隱藏文字和圖片
   - 檢查圖片和文字是否存在
   - 動態計算列數（1-5 列）
   - 只顯示存在的內容
   - 支援所有組合（只有圖片、只有文字、混合配置）

3. **143380a** - feat: 動態布局調整 - 沒有圖片時隱藏中文圖片列
   - 根據圖片是否存在動態調整布局
   - 沒有中文圖片時，不佔用空間
   - 布局始終居中對齊

4. **f315791** - fix: 在 GEPTManager 中保留 imageUrl 和 chineseImageUrl 欄位以支持五列布局圖片顯示
   - 修改 GEPTManager.js 在三個詞彙載入路徑中保留圖片欄位
   - 確保遊戲可以訪問英文和中文圖片 URL
   - 支持五列布局的獨立圖片功能

5. **7d6d5f8** - docs: 添加視圖模式偏好記錄功能實施文檔
   - 創建完整的實施文檔（552 行）
   - 記錄三個頁面的視圖模式記錄功能
   - 包含技術實現、測試驗證、使用指南
   - 提供故障排除和下一步優化建議

6. **cbd231a** - feat: 為 /my-results 和社區作者頁面添加視圖模式記錄功能
   - /my-results 使用 localStorage 保存視圖模式（myResultsViewMode）
   - 社區作者頁面使用 localStorage 保存視圖模式（communityAuthorViewMode）
   - 頁面載入時自動恢復用戶的視圖模式偏好
   - 視圖模式變化時自動保存到 localStorage
   - 支援 'grid', 'small-grid', 'list' 三種模式

7. **bea4509** - feat: 記錄用戶的視圖模式偏好設置
   - 使用 localStorage 保存用戶選擇的視圖模式（網格/小網格/列表）
   - 頁面載入時自動恢復用戶的視圖模式偏好
   - 視圖模式變化時自動保存到 localStorage
   - 添加 console.log 記錄保存操作
   - 默認值為 'grid'（網格視圖）

8. **da0e71d** - fix: 修復手機版本按鈕溢出問題
   - 篩選和選擇按鈕在手機版本只顯示圖標
   - 減少按鈕內邊距和間距
   - 添加 title 屬性提供提示信息

9. **ae7da2a** - fix: 優化社區作者頁面手機版本排版
   - 將搜索/視圖控制與排序按鈕分為兩行
   - 改善手機版本的佈局和可用性

6. **8226666** - fix: 修復 /my-activities 頁面「在新分頁開啟」功能
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

**文檔版本**：2.3
**最後更新**：2025-10-23
**維護者**：EduCreate Team

**更新日誌**：
- 2.3 (2025-10-23)：添加 Shimozurdo Game 五列布局系統，實施獨立圖片功能和動態布局調整
- 2.2 (2025-10-21)：添加圖片管理功能（Vercel Blob + Unsplash 整合），完成 Phase 1-4 開發
- 2.1 (2025-10-21)：添加視圖模式偏好記錄功能，更新最新提交記錄，添加手機版本優化說明
- 2.0 (2025-10-20)：添加資料夾系統完整文檔，更新最新提交記錄，添加「在新分頁開啟」功能修復說明
- 1.0 (2025-01-18)：初始版本

