# 資料夾嵌套功能實現指南

## 目錄
1. [功能概述](#功能概述)
2. [數據庫設計](#數據庫設計)
3. [API 端點實現](#api-端點實現)
4. [前端組件實現](#前端組件實現)
5. [常見問題與解決方案](#常見問題與解決方案)
6. [測試與驗證](#測試與驗證)

---

## 功能概述

### 實現的功能
- ✅ 10 層資料夾嵌套（0-9 層，共 10 層）
- ✅ 資料夾拖放移動
- ✅ 活動拖放到資料夾
- ✅ 麵包屑導航
- ✅ 資料夾重新命名
- ✅ 資料夾顏色變更
- ✅ 資料夾移動（帶可展開樹狀結構）
- ✅ 在新分頁開啟資料夾
- ✅ URL 參數支持直接進入資料夾

### 技術棧
- **數據庫**: PostgreSQL + Prisma ORM
- **後端**: Next.js 14 App Router API Routes
- **前端**: React + TypeScript
- **UI**: Tailwind CSS + Lucide Icons

---

## 數據庫設計

### Prisma Schema 修改

```prisma
model Folder {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#3B82F6")
  icon        String?
  type        String   // 'activities' 或 'results'
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 🔥 資料夾嵌套支持
  parentId    String?
  parent      Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Folder[] @relation("FolderHierarchy")
  
  depth       Int      @default(0)  // 層級深度 (0-9)
  path        String?                // 完整路徑 (例如: "root/folder1/folder2")

  // 關聯
  activities  Activity[]
  results     Result[]

  @@index([userId, type])
  @@index([parentId])
}
```

### 關鍵字段說明

| 字段 | 類型 | 說明 |
|------|------|------|
| `parentId` | String? | 父資料夾 ID，null 表示根級別資料夾 |
| `depth` | Int | 層級深度，0 = 根級別，最大 9（共 10 層） |
| `path` | String? | 完整路徑，用於快速查詢和顯示 |
| `children` | Folder[] | 子資料夾列表（自引用關係） |

### 數據庫遷移

```bash
# 1. 修改 schema.prisma 後執行
npx prisma migrate dev --name add-folder-nesting

# 2. 生成 Prisma Client
npx prisma generate
```

---

## API 端點實現

### 1. 獲取資料夾列表 API

**文件**: `app/api/folders/route.ts`

**關鍵實現**:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId'); // ⚠️ 返回 null（不是 undefined）

  // ✅ 正確的條件判斷
  const whereCondition: any = {
    userId: session.user.id,
    type: type || 'activities'
  };

  // 🔥 關鍵：檢查 parentId !== null（不是 !== undefined）
  if (parentId !== null) {
    whereCondition.parentId = parentId || null;
  }

  const folders = await prisma.folder.findMany({
    where: whereCondition,
    include: {
      _count: {
        select: {
          activities: true,
          children: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(folders);
}
```

**⚠️ 常見錯誤**:
```typescript
// ❌ 錯誤：searchParams.get() 返回 null，不是 undefined
if (parentId !== undefined) {
  // 這個條件永遠為 true！
}

// ✅ 正確
if (parentId !== null) {
  // 只有當 URL 包含 parentId 參數時才為 true
}
```

### 2. 創建資料夾 API

**文件**: `app/api/folders/route.ts`

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { name, color, type, parentId } = body;

  // 驗證父資料夾深度
  let depth = 0;
  let path = name;

  if (parentId) {
    const parentFolder = await prisma.folder.findUnique({
      where: { id: parentId }
    });

    if (!parentFolder) {
      return NextResponse.json(
        { error: '父資料夾不存在' },
        { status: 404 }
      );
    }

    // 🔥 檢查深度限制（最大 9 層）
    if (parentFolder.depth >= 9) {
      return NextResponse.json(
        { error: '已達到最大嵌套層數（10 層）' },
        { status: 400 }
      );
    }

    depth = parentFolder.depth + 1;
    path = `${parentFolder.path}/${name}`;
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      color: color || '#3B82F6',
      type: type || 'activities',
      userId: session.user.id,
      parentId: parentId || null,
      depth,
      path
    }
  });

  return NextResponse.json(folder);
}
```

### 3. 移動資料夾 API

**文件**: `app/api/folders/[id]/move/route.ts`

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { targetParentId } = await request.json();

  // 🔥 防止循環嵌套
  if (targetParentId) {
    const isDescendant = await checkIfDescendant(params.id, targetParentId);
    if (isDescendant) {
      return NextResponse.json(
        { error: '不能將資料夾移動到其子資料夾中' },
        { status: 400 }
      );
    }
  }

  // 計算新的深度和路徑
  let newDepth = 0;
  let newPath = folder.name;

  if (targetParentId) {
    const targetParent = await prisma.folder.findUnique({
      where: { id: targetParentId }
    });

    if (targetParent.depth >= 9) {
      return NextResponse.json(
        { error: '目標資料夾已達到最大嵌套層數' },
        { status: 400 }
      );
    }

    newDepth = targetParent.depth + 1;
    newPath = `${targetParent.path}/${folder.name}`;
  }

  // 更新資料夾
  const updatedFolder = await prisma.folder.update({
    where: { id: params.id },
    data: {
      parentId: targetParentId || null,
      depth: newDepth,
      path: newPath
    }
  });

  // 🔥 遞歸更新所有子資料夾的深度和路徑
  await updateChildrenDepthAndPath(params.id, newDepth, newPath);

  return NextResponse.json(updatedFolder);
}

// 檢查是否為子孫資料夾
async function checkIfDescendant(folderId: string, potentialAncestorId: string): Promise<boolean> {
  let currentId: string | null = potentialAncestorId;

  while (currentId) {
    if (currentId === folderId) {
      return true; // 找到循環
    }

    const folder = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true }
    });

    currentId = folder?.parentId || null;
  }

  return false;
}

// 遞歸更新子資料夾
async function updateChildrenDepthAndPath(parentId: string, parentDepth: number, parentPath: string) {
  const children = await prisma.folder.findMany({
    where: { parentId }
  });

  for (const child of children) {
    const newDepth = parentDepth + 1;
    const newPath = `${parentPath}/${child.name}`;

    await prisma.folder.update({
      where: { id: child.id },
      data: { depth: newDepth, path: newPath }
    });

    // 遞歸更新子資料夾的子資料夾
    await updateChildrenDepthAndPath(child.id, newDepth, newPath);
  }
}
```

---

## 前端組件實現

### 1. URL 參數支持

**文件**: `components/activities/WordwallStyleMyActivities.tsx`

```typescript
export const WordwallStyleMyActivities: React.FC<Props> = ({ userId }) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // 🔥 從 URL 參數初始化 currentFolderId
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderIdFromUrl = urlParams.get('folderId');
    if (folderIdFromUrl) {
      console.log('📂 從 URL 參數設置資料夾 ID:', folderIdFromUrl);
      setCurrentFolderId(folderIdFromUrl);
    }
  }, []);

  // 載入活動時根據 currentFolderId 過濾
  useEffect(() => {
    loadActivities();
  }, [currentFolderId]);

  const loadActivities = async () => {
    const allActivities = await fetchActivities();
    
    // 根據當前資料夾篩選
    const filteredActivities = currentFolderId
      ? allActivities.filter(activity => activity.folderId === currentFolderId)
      : allActivities.filter(activity => !activity.folderId);

    setActivities(filteredActivities);
  };
};
```

### 2. 麵包屑導航實現

**文件**: `components/activities/FolderManager.tsx`

```typescript
export const FolderManager: React.FC<Props> = ({ currentFolderId, onFolderSelect }) => {
  const [folders, setFolders] = useState<FolderData[]>([]); // 子資料夾列表
  const [currentFolder, setCurrentFolder] = useState<FolderData | null>(null); // 當前資料夾信息

  useEffect(() => {
    loadFolders(); // 載入子資料夾
    loadCurrentFolder(); // 載入當前資料夾信息
  }, [currentFolderId]);

  // 載入子資料夾
  const loadFolders = async () => {
    const response = await fetch(
      `/api/folders?type=activities&parentId=${currentFolderId || ''}`
    );
    const foldersData = await response.json();
    setFolders(foldersData);
  };

  // 🔥 載入當前資料夾信息（用於麵包屑導航）
  const loadCurrentFolder = async () => {
    if (!currentFolderId) {
      setCurrentFolder(null);
      return;
    }

    try {
      const response = await fetch(`/api/folders/${currentFolderId}`);
      if (response.ok) {
        const folderData = await response.json();
        setCurrentFolder(folderData);
        console.log('📂 載入當前資料夾信息:', folderData.name);
      }
    } catch (error) {
      console.error('載入當前資料夾信息失敗:', error);
    }
  };

  return (
    <div>
      {/* 麵包屑導航 */}
      <div className="breadcrumb mb-4">
        <button onClick={() => onFolderSelect(null)}>
          我的活動
        </button>
        {currentFolderId && (
          <>
            <span className="mx-2">/</span>
            <span>{currentFolder?.name || '載入中...'}</span>
          </>
        )}
      </div>
      
      {/* 資料夾列表 */}
      {folders.map(folder => (
        <FolderCard key={folder.id} folder={folder} />
      ))}
    </div>
  );
};
```

**⚠️ 常見錯誤**:
```typescript
// ❌ 錯誤：在子資料夾列表中查找當前資料夾
<span>{folders.find(f => f.id === currentFolderId)?.name || '未知資料夾'}</span>

// ✅ 正確：使用單獨的 currentFolder 狀態
<span>{currentFolder?.name || '載入中...'}</span>
```

### 3. 在新分頁開啟資料夾

**文件**: `components/activities/FolderCard.tsx`

```typescript
const handleOpenInNewTab = (e: React.MouseEvent) => {
  e.stopPropagation();
  setShowMenu(false);
  
  // 🔥 在新分頁開啟資料夾
  const url = `/my-activities?folderId=${folder.id}`;
  window.open(url, '_blank');
};

return (
  <div className="folder-card">
    {/* 資料夾選單 */}
    <div className="menu">
      <button onClick={handleOpenInNewTab}>
        <ExternalLink className="w-3 h-3" />
        在新分頁開啟
      </button>
      {/* 其他選單項目 */}
    </div>
  </div>
);
```

---

## 常見問題與解決方案

### 問題 1: API 只返回根資料夾

**症狀**: 調用 `/api/folders` 時，無論是否傳遞 `parentId` 參數，都只返回根級別資料夾。

**原因**: `searchParams.get('parentId')` 返回 `null`（不是 `undefined`），導致條件判斷錯誤。

**錯誤代碼**:
```typescript
if (parentId !== undefined) {
  whereCondition.parentId = parentId || null;
}
// parentId 永遠不等於 undefined，所以條件永遠為 true
```

**解決方案**:
```typescript
if (parentId !== null) {
  whereCondition.parentId = parentId || null;
}
```

### 問題 2: 麵包屑導航顯示「未知資料夾」

**症狀**: 進入資料夾後，麵包屑導航顯示「未知資料夾」而不是實際資料夾名稱。

**原因**: `loadFolders` 只載入子資料夾，不包含當前資料夾本身，導致無法在 `folders` 列表中找到當前資料夾。

**錯誤代碼**:
```typescript
<span>{folders.find(f => f.id === currentFolderId)?.name || '未知資料夾'}</span>
```

**解決方案**:
1. 添加 `currentFolder` 狀態存儲當前資料夾信息
2. 添加 `loadCurrentFolder` 函數單獨載入當前資料夾
3. 在麵包屑中使用 `currentFolder.name`

```typescript
const [currentFolder, setCurrentFolder] = useState<FolderData | null>(null);

const loadCurrentFolder = async () => {
  if (!currentFolderId) return;
  const response = await fetch(`/api/folders/${currentFolderId}`);
  const data = await response.json();
  setCurrentFolder(data);
};

<span>{currentFolder?.name || '載入中...'}</span>
```

### 問題 3: Vercel 部署後新代碼不生效

**症狀**: 代碼已推送到 GitHub，Vercel 顯示部署成功，但瀏覽器中看到的還是舊代碼。

**原因**: 
1. Vercel 可能使用了構建緩存
2. 瀏覽器緩存了舊的 JavaScript bundle

**解決方案**:
```bash
# 1. 創建空 commit 強制 Vercel 重新構建
git commit --allow-empty -m "chore: force Vercel rebuild"
git push

# 2. 等待 2 分鐘讓 Vercel 完成部署

# 3. 硬刷新瀏覽器（清除緩存）
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

---

## 測試與驗證

### 功能測試清單

#### 1. 資料夾創建測試
- [ ] 在根級別創建資料夾
- [ ] 在第 1 層資料夾內創建子資料夾
- [ ] 在第 9 層資料夾內創建子資料夾（應該成功）
- [ ] 在第 10 層資料夾內創建子資料夾（應該失敗）

#### 2. 資料夾移動測試
- [ ] 將資料夾移動到根級別
- [ ] 將資料夾移動到另一個資料夾內
- [ ] 嘗試將資料夾移動到其子資料夾內（應該失敗）
- [ ] 移動後檢查子資料夾的 `depth` 和 `path` 是否正確更新

#### 3. URL 參數測試
- [ ] 訪問 `/my-activities?folderId={id}` 應該直接進入該資料夾
- [ ] 麵包屑導航應該顯示正確的資料夾名稱
- [ ] 應該顯示該資料夾的子資料夾和活動

#### 4. 在新分頁開啟測試
- [ ] 點擊「在新分頁開啟」按鈕
- [ ] 新分頁應該開啟並進入該資料夾
- [ ] URL 應該包含 `?folderId={id}` 參數
- [ ] 麵包屑導航應該顯示正確的資料夾名稱

### 使用 Playwright 自動化測試

```typescript
import { test, expect } from '@playwright/test';

test('資料夾嵌套功能測試', async ({ page }) => {
  // 1. 登入
  await page.goto('https://edu-create.vercel.app/login');
  // ... 登入步驟

  // 2. 進入我的活動頁面
  await page.goto('https://edu-create.vercel.app/my-activities');

  // 3. 創建第 1 層資料夾
  await page.click('button:has-text("新增資料夾")');
  await page.fill('input[name="folderName"]', '第1層資料夾');
  await page.click('button:has-text("創建")');

  // 4. 進入第 1 層資料夾
  await page.click('text=第1層資料夾');

  // 5. 驗證麵包屑導航
  await expect(page.locator('.breadcrumb')).toContainText('我的活動 / 第1層資料夾');

  // 6. 測試在新分頁開啟
  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('button:has-text("在新分頁開啟")')
  ]);

  // 7. 驗證新分頁 URL
  expect(newPage.url()).toContain('folderId=');

  // 8. 驗證新分頁麵包屑導航
  await expect(newPage.locator('.breadcrumb')).toContainText('第1層資料夾');
});
```

---

## 在其他頁面實現相同功能

### 步驟 1: 複製數據庫結構

如果其他頁面使用不同的資料夾類型（例如 `results`），確保 Prisma schema 中的 `Folder` 模型支持該類型。

### 步驟 2: 複製 API 端點

將 `app/api/folders/` 目錄下的所有文件複製到新的 API 路徑，或者修改現有 API 以支持新的資料夾類型。

### 步驟 3: 複製前端組件

1. 複製 `FolderManager.tsx`
2. 複製 `FolderCard.tsx`
3. 複製 `MoveFolderModal.tsx`
4. 複製 `RenameFolderModal.tsx`
5. 複製 `EditFolderColorModal.tsx`

### 步驟 4: 修改頁面組件

在目標頁面組件中添加 URL 參數支持：

```typescript
// 例如: app/my-results/page.tsx
export default function MyResultsPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // 從 URL 參數初始化
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderIdFromUrl = urlParams.get('folderId');
    if (folderIdFromUrl) {
      setCurrentFolderId(folderIdFromUrl);
    }
  }, []);

  return (
    <div>
      <FolderManager
        currentFolderId={currentFolderId}
        onFolderSelect={setCurrentFolderId}
        type="results" // 指定資料夾類型
      />
      {/* 其他內容 */}
    </div>
  );
}
```

### 步驟 5: 測試

按照上面的測試清單進行完整測試。

---

## 總結

### 關鍵技術點

1. **自引用關係**: 使用 Prisma 的 `@relation("FolderHierarchy")` 實現資料夾嵌套
2. **深度限制**: 使用 `depth` 字段限制最大嵌套層數
3. **循環檢測**: 在移動資料夾時檢查是否會造成循環引用
4. **遞歸更新**: 移動資料夾時遞歸更新所有子資料夾的 `depth` 和 `path`
5. **URL 參數**: 使用 `URLSearchParams` 從 URL 讀取 `folderId` 參數
6. **分離關注點**: 子資料夾列表和當前資料夾信息分開載入

### 最佳實踐

1. **錯誤處理**: 所有 API 調用都應該有完整的錯誤處理
2. **用戶反饋**: 載入過程中顯示「載入中...」而不是「未知資料夾」
3. **性能優化**: 使用 `include` 和 `select` 只載入需要的字段
4. **類型安全**: 使用 TypeScript 確保類型正確
5. **測試驅動**: 使用 Playwright 進行 E2E 測試

### 參考資源

- [Prisma 自引用關係文檔](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/self-relations)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Playwright 測試文檔](https://playwright.dev/docs/intro)

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-20  
**作者**: EduCreate 開發團隊

