# EduCreate 技術交接文檔

## 🎯 給新 Agent 的快速指南

### 第一次接手時必讀

1. **閱讀順序**：
   - 先讀 `HANDOVER_DOCUMENT.md`（專案概述）
   - 再讀本文檔（技術細節）
   - 查看 `.augment/rules/` 下的所有規則文檔

2. **立即檢查**：
   - Git 狀態：`git status`
   - 分支：`git branch`（應該在 master）
   - 最新提交：`git log --oneline -5`
   - 部署狀態：訪問 https://edu-create.vercel.app

3. **環境確認**：
   - Node.js 版本：`node -v`（應該 >= 18）
   - npm 版本：`npm -v`
   - 資料庫連接：檢查 `.env.local`

---

## 🔑 關鍵技術決策

### 1. 詞彙數據的三層架構

**為什麼有三種數據來源？**

這是專案演進的結果：

```
時間線：
舊版 → content.vocabularyItems (JSON 字段)
中期 → elements (JSON 字段)
新版 → vocabularyItems (關聯到 VocabularySet 模型)
```

**為什麼不統一？**
- 保持向後兼容性
- 舊活動仍然可以正常運作
- 逐步遷移而非一次性重構

**如何處理？**
使用統一工具函數：`lib/vocabulary/loadVocabularyData.ts`

```typescript
// ✅ 正確做法
import { loadVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

const vocabularyData = await loadVocabularyData(activity);
// 自動處理三種來源，返回標準化格式

// ❌ 錯誤做法
const words = activity.vocabularyItems || activity.elements || activity.content?.vocabularyItems;
// 這樣會遇到空數組問題
```

### 2. 空數組陷阱

**JavaScript 的坑**：
```javascript
const arr = [];
if (arr) {
  console.log('這會執行！'); // 空數組是 truthy
}

if (arr && arr.length > 0) {
  console.log('這才不會執行'); // 正確檢查
}
```

**實際案例**：
```typescript
// 複製活動時，Prisma 創建了空數組
const copiedActivity = await prisma.activity.create({
  data: {
    vocabularyItems: [] // 空數組！
  }
});

// 錯誤檢查
if (copiedActivity.vocabularyItems && Array.isArray(copiedActivity.vocabularyItems)) {
  // 這會匹配！但數組是空的
  return copiedActivity.vocabularyItems; // 返回 []
}

// 正確檢查
if (copiedActivity.vocabularyItems && copiedActivity.vocabularyItems.length > 0) {
  // 這才不會匹配
  return copiedActivity.vocabularyItems;
}
```

**修復位置**：
- `app/create/[templateId]/page.tsx`（編輯頁面）
- `components/activities/WordwallStyleActivityCard.tsx`（活動卡片）
- `lib/vocabulary/loadVocabularyData.ts`（工具函數）

### 3. API 方法的語義

**為什麼需要 PATCH 和 PUT？**

```typescript
// PATCH - 部分更新（只更新指定字段）
PATCH /api/activities/[id]
Body: { title: "新標題" }
// 只更新 title，其他字段不變

// PUT - 完整更新（替換整個資源）
PUT /api/activities/[id]
Body: { title: "新標題", folderId: "xxx", ... }
// 更新多個字段，可能覆蓋其他數據
```

**實際應用**：
- **重新命名**：使用 PATCH（只改標題）
- **拖拽到資料夾**：使用 PUT（改標題和資料夾）
- **完整編輯**：使用 PUT（改多個字段）

### 4. 遊戲模式判斷

**兩種模式**：

```typescript
// 1. 姓名模式（記錄成績）
/games/switcher?game=vocabulary&activityId=xxx&assignmentId=xxx&studentName=xxx

// 2. 匿名模式（不記錄成績）
/games/switcher?game=vocabulary&activityId=xxx
```

**判斷邏輯**：
```typescript
const isNameMode = assignmentId && studentName;
const isAnonymousMode = !assignmentId && !studentName;

if (isNameMode) {
  // 記錄成績到資料庫
  await saveResult({ assignmentId, studentName, score });
}

if (isAnonymousMode) {
  // 只顯示遊戲，不記錄成績
  console.log('匿名模式，不記錄成績');
}
```

### 5. 資料夾系統架構

**為什麼使用自引用關係？**

資料夾系統需要支援多層嵌套（最多 10 層），使用 Prisma 的自引用關係是最佳選擇：

```prisma
model Folder {
  id       String   @id @default(cuid())
  name     String
  parentId String?  // 指向父資料夾
  depth    Int      @default(0)  // 層級深度

  // 自引用關係
  parent   Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children Folder[] @relation("FolderHierarchy")
}
```

**關鍵設計決策**：

1. **深度控制**：
   - 使用 `depth` 字段記錄層級（0 = 根目錄，9 = 最深層）
   - 創建資料夾時自動計算深度：`depth = parent.depth + 1`
   - 防止超過 10 層限制

2. **路徑管理**：
   - 使用 `path` 字段存儲完整路徑（例如：`/folder1/folder2/folder3`）
   - 方便快速查詢和顯示
   - 移動資料夾時自動更新子樹的路徑

3. **遞歸計數**：
   - 資料夾顯示的活動/結果數量包含所有子資料夾
   - 使用遞歸函數計算：`count = directCount + sum(children.count)`
   - 支援不同的過濾條件（如只計算已發布的活動）

4. **類型區分**：
   - 使用 `type` 字段區分 `activities` 和 `results` 資料夾
   - 同一用戶可以有兩套獨立的資料夾樹

**實現範例**：

```typescript
// 遞歸計算活動數量
async function getActivityCount(folderId: string, userId: string): Promise<number> {
  // 1. 獲取當前資料夾的活動數量
  const directCount = await prisma.activity.count({
    where: { folderId, userId }
  });

  // 2. 獲取所有子資料夾
  const children = await prisma.folder.findMany({
    where: { parentId: folderId, userId }
  });

  // 3. 遞歸計算子資料夾的活動數量
  let childrenCount = 0;
  for (const child of children) {
    childrenCount += await getActivityCount(child.id, userId);
  }

  return directCount + childrenCount;
}
```

### 6. Next.js URL 參數處理最佳實踐

**問題：為什麼不能使用 `window.location.search`？**

在 Next.js 14 App Router 中，使用 `window.location.search` 讀取 URL 參數不可靠：

```typescript
// ❌ 錯誤做法
const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const folderIdFromUrl = urlParams.get('folderId');
  if (folderIdFromUrl) {
    setCurrentFolderId(folderIdFromUrl);
  }
}, []);
```

**問題**：
1. 組件掛載時 `window.location.search` 可能還沒準備好
2. 導致額外的重新渲染（先渲染 `null`，然後渲染實際值）
3. 用戶看到閃爍（先顯示根目錄，然後跳轉到目標資料夾）
4. 麵包屑導航可能不顯示

**正確做法：使用 `useSearchParams` hook**

```typescript
// ✅ 正確做法
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const folderIdFromUrl = searchParams?.get('folderId') || null;

// 直接從 URL 參數初始化狀態
const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderIdFromUrl);
```

**優點**：
1. ✅ `useSearchParams` 在組件掛載時立即可用
2. ✅ 狀態直接初始化為正確的值，沒有額外的重新渲染
3. ✅ 沒有閃爍，用戶體驗更好
4. ✅ 符合 Next.js 14 App Router 最佳實踐
5. ✅ 麵包屑導航正確顯示

**狀態初始化時機**：

```typescript
// ❌ 錯誤：在 useEffect 中設置狀態
const [state, setState] = useState(null);
useEffect(() => {
  setState(valueFromProps);
}, []);

// ✅ 正確：直接初始化狀態
const [state, setState] = useState(valueFromProps);
```

**關鍵原則**：
- 如果狀態的初始值可以從 props 或 hooks 獲取，直接在 `useState` 中初始化
- 避免在 `useEffect` 中設置狀態，除非是響應外部事件或副作用

### 7. 麵包屑導航實現模式

**設計目標**：
- 顯示完整的資料夾路徑（例如：我的活動 > 資料夾1 > 資料夾2 > 資料夾3）
- 點擊任意麵包屑快速導航到該資料夾
- 自動從 API 獲取麵包屑數據

**實現步驟**：

1. **API 端點支援麵包屑**：
```typescript
// app/api/folders/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  const includeBreadcrumbs = searchParams.get('includeBreadcrumbs') === 'true';

  // 如果需要麵包屑，遞歸構建路徑
  if (includeBreadcrumbs && parentId) {
    const breadcrumbs: Array<{ id: string; name: string }> = [];
    let currentFolder = await prisma.folder.findUnique({
      where: { id: parentId },
      select: { id: true, name: true, parentId: true }
    });

    while (currentFolder) {
      breadcrumbs.unshift({ id: currentFolder.id, name: currentFolder.name });
      if (currentFolder.parentId) {
        currentFolder = await prisma.folder.findUnique({
          where: { id: currentFolder.parentId },
          select: { id: true, name: true, parentId: true }
        });
      } else {
        break;
      }
    }

    return NextResponse.json({
      folders: foldersWithCount,
      breadcrumbs,
      currentFolder
    });
  }

  return NextResponse.json(foldersWithCount);
}
```

2. **前端請求麵包屑數據**：
```typescript
// 只有在有 currentFolderId 時才請求麵包屑
const foldersData = await folderApi.getFolders('activities', currentFolderId, !!currentFolderId);

// 檢查響應類型
if (currentFolderId && 'folders' in foldersData) {
  // 包含麵包屑的響應
  const { folders, breadcrumbs } = foldersData as FoldersWithBreadcrumbs;
  setFolders(folders);
  setBreadcrumbs(breadcrumbs);
} else {
  // 普通的資料夾列表響應
  setFolders(foldersData as FolderData[]);
  setBreadcrumbs([]);
}
```

3. **渲染麵包屑 UI**：
```typescript
{breadcrumbs.length > 0 && (
  <div className="flex items-center gap-2">
    <button onClick={() => handleFolderSelect(null)}>
      我的活動
    </button>
    {breadcrumbs.map((crumb) => (
      <div key={crumb.id} className="flex items-center gap-2">
        <ChevronRight size={16} />
        <button onClick={() => handleFolderSelect(crumb.id)}>
          {crumb.name}
        </button>
      </div>
    ))}
  </div>
)}
```

**關鍵點**：
- API 返回不同的響應格式（有麵包屑 vs 無麵包屑）
- 前端根據 `currentFolderId` 決定是否請求麵包屑
- 使用類型守衛檢查響應格式（`'folders' in foldersData`）

---

## 🛠️ 常見開發任務

### 任務 1：添加新的遊戲類型

**步驟**：

1. **更新遊戲類型映射**（`components/activities/WordwallStyleActivityCard.tsx`）：
```typescript
const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
  const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
    // ... 現有類型
    'new-game': { icon: '🎮', name: '新遊戲' }, // 添加這行
  };
  return gameTypeMap[gameType] || { icon: '🎮', name: gameType || '遊戲' };
};
```

2. **添加遊戲預覽**（`components/activities/GameThumbnailPreview.tsx`）：
```typescript
const renderNewGamePreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
    <div className="text-3xl mb-3">🎮</div>
    {/* 添加預覽內容 */}
  </div>
);

// 在 renderPreview() 中添加判斷
if (gameTypeKey.includes('new-game') || gameTypeKey === '新遊戲') {
  return renderNewGamePreview();
}
```

3. **測試**：
```bash
# 創建測試活動
# 訪問 /my-activities
# 確認預覽顯示正確
```

### 任務 2：修復詞彙載入問題

**診斷步驟**：

1. **檢查數據來源**：
```typescript
console.log('vocabularyItems:', activity.vocabularyItems);
console.log('elements:', activity.elements);
console.log('content:', activity.content);
```

2. **使用工具函數**：
```typescript
import { loadVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';

const { data, source } = await loadVocabularyData(activity);
console.log('載入來源:', getSourceDisplayName(source));
console.log('詞彙數量:', data.length);
```

3. **檢查長度**：
```typescript
if (data.length === 0) {
  console.error('❌ 沒有詞彙數據！');
  // 檢查資料庫
  // 檢查 API 響應
}
```

### 任務 3：添加新的 API 端點

**範例：添加活動統計 API**

1. **創建文件**：`app/api/activities/[id]/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 驗證用戶
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 2. 獲取活動
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        playCount: true,
        shareCount: true,
        // ... 其他字段
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    // 3. 返回統計數據
    return NextResponse.json({
      playCount: activity.playCount,
      shareCount: activity.shareCount,
      // ... 其他統計
    });

  } catch (error) {
    console.error('❌ 獲取統計失敗:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
```

2. **測試 API**：
```bash
# 使用 curl 測試
curl http://localhost:3000/api/activities/xxx/stats

# 或在瀏覽器中訪問
```

3. **在前端調用**：
```typescript
const response = await fetch(`/api/activities/${activityId}/stats`);
const stats = await response.json();
console.log('統計數據:', stats);
```

### 任務 4：添加資料夾功能到新頁面

**目標**：在新頁面添加資料夾導航和麵包屑功能

**步驟**：

1. **導入必要的依賴**：
```typescript
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { folderApi, FolderData, Breadcrumb, FoldersWithBreadcrumbs } from '@/lib/api/folderApiManager';
```

2. **添加狀態管理**：
```typescript
// 使用 useSearchParams 讀取 URL 參數
const searchParams = useSearchParams();
const folderIdFromUrl = searchParams?.get('folderId') || null;

// 狀態
const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderIdFromUrl);
const [folders, setFolders] = useState<FolderData[]>([]);
const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
```

3. **實現 loadFolders 函數**：
```typescript
const loadFolders = useCallback(async () => {
  try {
    // 請求資料夾數據，如果有 currentFolderId 則請求麵包屑
    const foldersData = await folderApi.getFolders('activities', currentFolderId, !!currentFolderId);

    // 檢查響應類型
    if (currentFolderId && 'folders' in foldersData) {
      // 包含麵包屑的響應
      const { folders: foldersList, breadcrumbs: breadcrumbsList } = foldersData as FoldersWithBreadcrumbs;
      setFolders(foldersList);
      setBreadcrumbs(breadcrumbsList);
    } else {
      // 普通的資料夾列表響應
      const foldersList = foldersData as FolderData[];
      const filteredFolders = foldersList.filter(folder => folder.parentId === currentFolderId);
      setFolders(filteredFolders);
      setBreadcrumbs([]);
    }
  } catch (error) {
    console.error('載入資料夾失敗:', error);
    setFolders([]);
  }
}, [currentFolderId]);
```

4. **添加 useEffect 監聽 currentFolderId 變化**：
```typescript
useEffect(() => {
  loadFolders();
}, [currentFolderId, loadFolders]);
```

5. **實現資料夾導航函數**：
```typescript
const handleFolderSelect = (folderId: string | null) => {
  setCurrentFolderId(folderId);
  // 更新 URL
  const url = new URL(window.location.href);
  if (folderId) {
    url.searchParams.set('folderId', folderId);
  } else {
    url.searchParams.delete('folderId');
  }
  window.history.pushState({}, '', url);
};
```

6. **渲染麵包屑 UI**：
```typescript
{breadcrumbs.length > 0 && (
  <div className="flex items-center gap-2 mb-6 text-sm bg-white rounded-lg shadow-sm p-4">
    <button
      onClick={() => handleFolderSelect(null)}
      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
    >
      我的活動
    </button>
    {breadcrumbs.map((crumb) => (
      <div key={crumb.id} className="flex items-center gap-2">
        <ChevronRight size={16} className="text-gray-400" />
        <button
          onClick={() => handleFolderSelect(crumb.id)}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {crumb.name}
        </button>
      </div>
    ))}
  </div>
)}
```

7. **渲染資料夾卡片**：
```typescript
{folders.map((folder) => (
  <div
    key={folder.id}
    onClick={() => handleFolderSelect(folder.id)}
    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-3">
      <FolderIcon className="w-8 h-8 text-blue-500" />
      <div>
        <h3 className="font-medium">{folder.name}</h3>
        <p className="text-sm text-gray-500">{folder.activityCount} 個活動</p>
      </div>
    </div>
  </div>
))}
```

**關鍵點**：
- ✅ 使用 `useSearchParams` 而不是 `window.location.search`
- ✅ 直接從 URL 參數初始化 `currentFolderId`
- ✅ 只有在有 `currentFolderId` 時才請求麵包屑
- ✅ 使用類型守衛檢查響應格式
- ✅ 更新 URL 以支援瀏覽器前進/後退

### 任務 5：實現麵包屑導航

**目標**：在現有頁面添加麵包屑導航功能

**前提條件**：
- 頁面已經有資料夾導航功能
- 已經使用 `folderApi.getFolders()` 獲取資料夾數據

**步驟**：

1. **導入麵包屑類型**：
```typescript
import { Breadcrumb, FoldersWithBreadcrumbs } from '@/lib/api/folderApiManager';
import { ChevronRight } from 'lucide-react';
```

2. **添加麵包屑狀態**：
```typescript
const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
```

3. **修改 loadFolders 函數**：
```typescript
const loadFolders = useCallback(async () => {
  try {
    // 🔧 修改：添加第三個參數請求麵包屑
    const foldersData = await folderApi.getFolders('activities', currentFolderId, !!currentFolderId);

    // 🔧 修改：檢查響應類型並設置麵包屑
    if (currentFolderId && 'folders' in foldersData) {
      const { folders, breadcrumbs } = foldersData as FoldersWithBreadcrumbs;
      setFolders(folders);
      setBreadcrumbs(breadcrumbs);  // 🆕 設置麵包屑
    } else {
      setFolders(foldersData as FolderData[]);
      setBreadcrumbs([]);  // 🆕 清空麵包屑
    }
  } catch (error) {
    console.error('載入資料夾失敗:', error);
  }
}, [currentFolderId]);
```

4. **添加麵包屑 UI**（在資料夾列表前）：
```typescript
{breadcrumbs.length > 0 && (
  <div className="flex items-center gap-2 mb-6 text-sm bg-white rounded-lg shadow-sm p-4">
    <button
      onClick={() => handleFolderSelect(null)}
      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
    >
      我的活動
    </button>
    {breadcrumbs.map((crumb) => (
      <div key={crumb.id} className="flex items-center gap-2">
        <ChevronRight size={16} className="text-gray-400" />
        <button
          onClick={() => handleFolderSelect(crumb.id)}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {crumb.name}
        </button>
      </div>
    ))}
  </div>
)}
```

**測試**：
1. 導航到子資料夾，確認麵包屑顯示
2. 點擊麵包屑，確認能正確導航
3. 右鍵點擊資料夾選擇「在新分頁開啟」，確認新視窗顯示麵包屑

---

## 🐛 故障排除指南

### 問題 1：詞彙數據不顯示

**症狀**：
- 編輯頁面空白
- 活動卡片彈出框沒有單字
- 遊戲預覽沒有內容

**診斷**：
```typescript
// 1. 檢查 API 響應
const response = await fetch(`/api/activities/${activityId}`);
const data = await response.json();
console.log('API 響應:', data);

// 2. 檢查詞彙字段
console.log('vocabularyItems:', data.vocabularyItems);
console.log('elements:', data.elements);
console.log('content:', data.content);

// 3. 使用工具函數
const vocabularyData = await loadVocabularyData(data);
console.log('載入結果:', vocabularyData);
```

**解決方案**：
1. 確保 API 返回 `elements` 和 `vocabularyItems` 字段
2. 使用 `loadVocabularyData` 工具函數
3. 檢查數組長度（`arr.length > 0`）

### 問題 2：重新命名失敗

**症狀**：
- 點擊重新命名按鈕後顯示錯誤
- 控制台顯示 405 Method Not Allowed

**診斷**：
```typescript
// 檢查 API 路由是否支援 PATCH 方法
// 文件：app/api/activities/[id]/route.ts

// 應該有這個函數
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // ...
}
```

**解決方案**：
- 確保 API 路由有 PATCH 方法處理器
- 檢查請求方法是否正確（PATCH 而非 PUT）

### 問題 3：瀏覽次數不增加

**症狀**：
- 訪問遊戲頁面後，瀏覽次數沒有變化

**診斷**：
```typescript
// 1. 檢查追蹤 API 是否被調用
// 文件：app/games/switcher/page.tsx
// 在 loadActivityInfo 函數中應該有這段代碼

fetch(`/api/activities/${activityId}/view`, {
  method: 'POST',
}).catch(error => {
  console.error('❌ 增加瀏覽次數失敗:', error);
});

// 2. 檢查 API 是否存在
// 文件：app/api/activities/[id]/view/route.ts
```

**解決方案**：
1. 確保追蹤 API 存在（`app/api/activities/[id]/view/route.ts`）
2. 確保遊戲頁面調用追蹤 API
3. 檢查資料庫 `playCount` 字段是否更新

### 問題 4：遊戲預覽不顯示

**症狀**：
- 活動卡片縮略圖顯示空白或錯誤

**診斷**：
```typescript
// 1. 檢查組件是否正確導入
import GameThumbnailPreview from './GameThumbnailPreview';

// 2. 檢查傳遞的 props
<GameThumbnailPreview
  gameType={activity.gameType}
  vocabularyItems={activity.vocabularyItems}
  activityTitle={activity.title}
/>

// 3. 檢查遊戲類型是否支援
console.log('遊戲類型:', activity.gameType);
```

**解決方案**：
1. 確保 `GameThumbnailPreview.tsx` 文件存在
2. 確保組件正確導入和使用
3. 檢查遊戲類型是否在支援列表中
4. 添加新的遊戲類型預覽（如果需要）

### 問題 5：資料夾數量不正確

**症狀**：
- 資料夾顯示的活動/結果數量不包含子資料夾
- 數量與實際不符

**診斷**：
```typescript
// 1. 檢查 API 是否使用遞歸計數
console.log('資料夾數量:', folder.activityCount);

// 2. 檢查是否使用了正確的字段
// ❌ 錯誤：使用 activityCount 在 results 頁面
folder.activityCount

// ✅ 正確：使用 resultCount 在 results 頁面
folder.resultCount
```

**解決方案**：
1. 確保 API 使用遞歸計數函數（`getActivityCount` 或 `getResultCount`）
2. 確保前端使用正確的字段名稱
3. 檢查過濾條件（如只計算已發布的活動）

**相關文件**：
- `app/api/folders/route.ts`：遞歸計數實現
- `components/activities/WordwallStyleMyActivities.tsx`：activities 頁面
- `components/results/WordwallStyleMyResults.tsx`：results 頁面

### 問題 6：麵包屑導航不顯示

**症狀**：
- 導航到子資料夾後，麵包屑導航不顯示
- 右鍵點擊「在新分頁開啟」後，新視窗沒有麵包屑

**診斷**：
```typescript
// 1. 檢查是否請求了麵包屑數據
console.log('請求麵包屑:', !!currentFolderId);

// 2. 檢查 API 響應
console.log('響應數據:', foldersData);
console.log('是否包含 folders 字段:', 'folders' in foldersData);

// 3. 檢查麵包屑狀態
console.log('麵包屑:', breadcrumbs);
```

**常見原因**：
1. **沒有請求麵包屑數據**：
   ```typescript
   // ❌ 錯誤：第三個參數是 false
   await folderApi.getFolders('activities', currentFolderId, false);

   // ✅ 正確：第三個參數是 !!currentFolderId
   await folderApi.getFolders('activities', currentFolderId, !!currentFolderId);
   ```

2. **沒有檢查響應類型**：
   ```typescript
   // ❌ 錯誤：直接當作數組處理
   setFolders(foldersData);

   // ✅ 正確：檢查響應類型
   if (currentFolderId && 'folders' in foldersData) {
     const { folders, breadcrumbs } = foldersData as FoldersWithBreadcrumbs;
     setFolders(folders);
     setBreadcrumbs(breadcrumbs);
   }
   ```

3. **currentFolderId 初始化不正確**：
   ```typescript
   // ❌ 錯誤：使用 window.location.search
   const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
   useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     setCurrentFolderId(urlParams.get('folderId'));
   }, []);

   // ✅ 正確：使用 useSearchParams
   const searchParams = useSearchParams();
   const folderIdFromUrl = searchParams?.get('folderId') || null;
   const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderIdFromUrl);
   ```

**解決方案**：
1. 確保請求麵包屑數據（第三個參數是 `!!currentFolderId`）
2. 確保檢查響應類型並正確設置麵包屑狀態
3. 確保使用 `useSearchParams` 初始化 `currentFolderId`

### 問題 7：「在新分頁開啟」功能不工作

**症狀**：
- 右鍵點擊資料夾選擇「在新分頁開啟」
- 新視窗打開到根目錄而不是目標資料夾
- 看到閃爍（先顯示根目錄，然後跳轉）

**診斷**：
```typescript
// 1. 檢查 URL 參數
console.log('URL:', window.location.href);
console.log('folderId 參數:', new URLSearchParams(window.location.search).get('folderId'));

// 2. 檢查 currentFolderId 初始化
console.log('currentFolderId:', currentFolderId);

// 3. 檢查是否使用 useSearchParams
// ❌ 如果看到 window.location.search，這是問題所在
```

**根本原因**：
使用 `window.location.search` 在 Next.js 14 App Router 中不可靠：
- 組件掛載時 `window.location.search` 可能還沒準備好
- 導致 `currentFolderId` 初始化為 `null`
- 組件先渲染根目錄，然後在 `useEffect` 中更新狀態
- 用戶看到閃爍和跳轉

**解決方案**：
1. **使用 `useSearchParams` hook**：
   ```typescript
   import { useSearchParams } from 'next/navigation';

   const searchParams = useSearchParams();
   const folderIdFromUrl = searchParams?.get('folderId') || null;
   ```

2. **直接初始化狀態**：
   ```typescript
   const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderIdFromUrl);
   ```

3. **移除舊的 useEffect**：
   ```typescript
   // ❌ 刪除這段代碼
   useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const folderIdFromUrl = urlParams.get('folderId');
     if (folderIdFromUrl) {
       setCurrentFolderId(folderIdFromUrl);
     }
   }, []);
   ```

**修復效果**：
- ✅ 新視窗直接顯示目標資料夾
- ✅ 沒有閃爍或跳轉
- ✅ 麵包屑導航正確顯示
- ✅ 符合 Next.js 14 最佳實踐

**相關提交**：
- 62b49db：修復 /my-results 頁面
- 8226666：修復 /my-activities 頁面

---

## 📋 開發檢查清單

### 每次修改前

- [ ] 閱讀相關的規則文檔（`.augment/rules/`）
- [ ] 使用 `codebase-retrieval` 查找相關代碼
- [ ] 使用 `view` 查看現有實現
- [ ] 確認不會重複開發已存在的功能

### 每次修改後

- [ ] 運行 `diagnostics` 檢查語法錯誤
- [ ] 測試完整的用戶流程（從主頁開始）
- [ ] 檢查是否影響其他功能
- [ ] 更新相關文檔（如果需要）
- [ ] 提交清晰的 commit message

### 每次提交前

- [ ] 檢查 Git 狀態（`git status`）
- [ ] 確認只提交相關文件
- [ ] 寫清楚的 commit message（參考現有格式）
- [ ] 推送到 GitHub（`git push`）
- [ ] 等待 Vercel 部署完成
- [ ] 測試生產環境

---

## 🎓 學習資源

### 專案相關
- Next.js 14 文檔：https://nextjs.org/docs
- Prisma 文檔：https://www.prisma.io/docs
- Tailwind CSS：https://tailwindcss.com/docs

### 記憶科學
- 間隔重複理論
- 主動回憶原理
- 認知負荷理論

### GEPT 分級
- GEPT Kids：基礎 300 字
- GEPT 初級：基礎 1000 字
- GEPT 中級：進階 2000 字
- GEPT 中高級：高級 3000 字

---

## 🚨 緊急聯絡

### 如果遇到無法解決的問題

1. **檢查 Git 歷史**：
```bash
git log --oneline --graph -20
git show <commit-hash>
```

2. **回退到已知良好版本**：
```bash
git reset --hard <commit-hash>
git push -f origin master
```

3. **查看部署日誌**：
- 訪問 Vercel Dashboard
- 查看部署日誌和錯誤信息

4. **資料庫問題**：
```bash
npx prisma studio  # 打開資料庫管理界面
npx prisma db push # 同步資料庫模型
```

---

**文檔版本**：2.0
**最後更新**：2025-10-20
**維護者**：EduCreate Team

**更新日誌**：
- 2.0 (2025-10-20)：添加資料夾系統架構、Next.js URL 參數處理最佳實踐、麵包屑導航實現模式、資料夾相關開發任務和故障排除
- 1.0 (2025-01-18)：初始版本

