# My Activities 資料夾系統實施完整文檔

## 📋 目錄

1. [項目概述](#項目概述)
2. [技術架構](#技術架構)
3. [數據庫設計](#數據庫設計)
4. [API 端點設計](#api-端點設計)
5. [前端組件設計](#前端組件設計)
6. [實施步驟](#實施步驟)
7. [測試與驗證](#測試與驗證)
8. [性能優化](#性能優化)
9. [後續擴展](#後續擴展)

---

## 項目概述

### 🎯 目標

在 `/my-activities` 頁面實現 **10 層資料夾嵌套系統**，提供類似 Wordwall 的資料夾管理功能。

### ✨ 核心功能

- ✅ 10 層資料夾嵌套支援
- ✅ 資料夾 CRUD 操作（創建、讀取、更新、刪除）
- ✅ 活動在資料夾間移動
- ✅ 麵包屑導航
- ✅ 資料夾樹狀顯示
- ✅ URL 狀態同步
- ✅ 瀏覽器歷史支援

### 📊 技術棧

- **後端**: Next.js 14 App Router, Prisma ORM
- **前端**: React 18, TypeScript, Tailwind CSS
- **數據庫**: PostgreSQL (Neon)
- **UI 組件**: shadcn/ui

---

## 技術架構

### 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│                     用戶界面層                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 資料夾管理器  │  │ 活動列表     │  │ 麵包屑導航    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     API 層                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ /api/folders │  │ /api/activities│ │ /api/activities│
│  │              │  │                │  │ /move         │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   數據訪問層 (Prisma)                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL 數據庫 (Neon)                   │
└─────────────────────────────────────────────────────────┘
```

### 資料夾層級結構

```
根目錄 (depth: 0)
├── 資料夾 A (depth: 1)
│   ├── 資料夾 A1 (depth: 2)
│   │   ├── 資料夾 A1a (depth: 3)
│   │   │   └── ... (最多到 depth: 9)
│   │   └── 資料夾 A1b (depth: 3)
│   └── 資料夾 A2 (depth: 2)
├── 資料夾 B (depth: 1)
│   └── 資料夾 B1 (depth: 2)
└── 資料夾 C (depth: 1)
```

---

## 數據庫設計

### Prisma Schema

**文件**: `prisma/schema.prisma`

```prisma
model Folder {
  id        String   @id @default(cuid())
  name      String
  userId    String
  type      FolderType
  parentId  String?  // 父資料夾 ID
  depth     Int      @default(0)  // 層級深度（0-9）
  path      String?  // 完整路徑
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 關聯
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent     Folder?    @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children   Folder[]   @relation("FolderHierarchy")
  activities Activity[]
  results    Result[]

  @@index([userId, type])
  @@index([parentId])
  @@index([userId, type, parentId])
}

enum FolderType {
  ACTIVITIES
  RESULTS
}
```

### 關鍵字段說明

| 字段 | 類型 | 說明 | 範例 |
|------|------|------|------|
| `id` | String | 唯一標識符 | `clfx1234...` |
| `name` | String | 資料夾名稱 | `國小三年級` |
| `userId` | String | 所屬用戶 ID | `user123` |
| `type` | FolderType | 資料夾類型 | `ACTIVITIES` |
| `parentId` | String? | 父資料夾 ID | `clfx5678...` 或 `null` |
| `depth` | Int | 層級深度 | `0` (根) 到 `9` (最深) |
| `path` | String? | 完整路徑 | `國小/三年級/上學期` |

### 設計決策

#### 1. 自引用關係

使用 `parentId` 和 `"FolderHierarchy"` 關係實現樹狀結構：

```prisma
parent     Folder?    @relation("FolderHierarchy", fields: [parentId], references: [id])
children   Folder[]   @relation("FolderHierarchy")
```

**優點**:
- 靈活的層級結構
- 支援任意深度嵌套
- 易於查詢和遍歷

#### 2. 深度限制

使用 `depth` 字段限制為 0-9（共 10 層）：

```typescript
if (depth >= 10) {
  throw new Error('已達到最大資料夾層級（10層）');
}
```

**優點**:
- 防止無限嵌套
- 提升查詢性能
- 符合用戶使用習慣

#### 3. 路徑存儲

使用 `path` 字段存儲完整路徑：

```typescript
path = `${parentFolder.path}/${name}`;
// 範例: "國小/三年級/上學期"
```

**優點**:
- 快速構建麵包屑導航
- 便於搜索和過濾
- 減少遞歸查詢

#### 4. 級聯刪除

使用 `onDelete: Cascade` 確保數據一致性：

```prisma
parent Folder? @relation(..., onDelete: Cascade)
```

**行為**:
- 刪除父資料夾時，自動刪除所有子資料夾
- 刪除資料夾時，自動解除活動關聯

#### 5. 索引優化

添加多個索引加速查詢：

```prisma
@@index([userId, type])           // 用戶的所有資料夾
@@index([parentId])                // 子資料夾查詢
@@index([userId, type, parentId])  // 組合查詢
```

### 數據庫遷移

**執行命令**:

```bash
# 創建遷移
npx prisma migrate dev --name add_folder_hierarchy

# 生成 Prisma Client
npx prisma generate

# 推送到生產環境
npx prisma migrate deploy
```

**遷移內容**:
1. 添加 `parentId`, `depth`, `path` 欄位
2. 創建自引用外鍵約束
3. 創建性能優化索引
4. 設置級聯刪除規則

---

## API 端點設計

### 1. 資料夾 CRUD API

**文件**: `app/api/folders/route.ts`

#### GET - 獲取資料夾列表

**端點**: `GET /api/folders`

**查詢參數**:
```typescript
{
  type: 'ACTIVITIES' | 'RESULTS';  // 必需
  parentId?: string | null;         // 可選，null 表示根目錄
}
```

**響應**:
```typescript
{
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  path: string;
  _count: {
    activities: number;  // 活動數量
    children: number;    // 子資料夾數量
  };
}[]
```

**實現邏輯**:

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as FolderType;
  const parentId = searchParams.get('parentId') || null;

  const folders = await prisma.folder.findMany({
    where: {
      userId: session.user.id,
      type,
      parentId,
    },
    include: {
      _count: {
        select: {
          activities: type === 'ACTIVITIES',
          results: type === 'RESULTS',
          children: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json(folders);
}
```

**關鍵點**:
- ✅ 只返回當前層級的資料夾（不遞歸）
- ✅ 包含活動/結果數量統計
- ✅ 包含子資料夾數量
- ✅ 按名稱排序
- ✅ 權限驗證

#### POST - 創建新資料夾

**端點**: `POST /api/folders`

**請求體**:
```typescript
{
  name: string;                      // 必需
  type: 'ACTIVITIES' | 'RESULTS';    // 必需
  parentId?: string | null;          // 可選
}
```

**響應**:
```typescript
{
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  path: string;
  createdAt: string;
}
```

**實現邏輯**:

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, parentId } = body;

  // 驗證輸入
  if (!name || !type) {
    return NextResponse.json(
      { error: '缺少必要參數' },
      { status: 400 }
    );
  }

  // 計算深度和路徑
  let depth = 0;
  let path = name;

  if (parentId) {
    const parentFolder = await prisma.folder.findUnique({
      where: { id: parentId },
      select: { depth: true, path: true, userId: true },
    });

    if (!parentFolder) {
      return NextResponse.json(
        { error: '父資料夾不存在' },
        { status: 404 }
      );
    }

    // 驗證父資料夾所有權
    if (parentFolder.userId !== session.user.id) {
      return NextResponse.json(
        { error: '無權訪問此資料夾' },
        { status: 403 }
      );
    }

    depth = parentFolder.depth + 1;

    // 檢查深度限制
    if (depth >= 10) {
      return NextResponse.json(
        { error: '已達到最大資料夾層級（10層）' },
        { status: 400 }
      );
    }

    path = `${parentFolder.path}/${name}`;
  }

  // 創建資料夾
  const folder = await prisma.folder.create({
    data: {
      name,
      type,
      userId: session.user.id,
      parentId,
      depth,
      path,
    },
  });

  return NextResponse.json(folder);
}
```

**關鍵點**:
- ✅ 自動計算深度
- ✅ 強制執行 10 層限制
- ✅ 自動構建完整路徑
- ✅ 驗證父資料夾存在性和所有權
- ✅ 完整的錯誤處理

**錯誤處理**:

| 錯誤碼 | 錯誤信息 | 原因 |
|--------|----------|------|
| 400 | 缺少必要參數 | name 或 type 未提供 |
| 400 | 已達到最大資料夾層級 | 深度超過 9 |
| 401 | 未授權 | 未登入 |
| 403 | 無權訪問此資料夾 | 父資料夾不屬於當前用戶 |
| 404 | 父資料夾不存在 | parentId 無效 |

#### PATCH - 更新資料夾

**端點**: `PATCH /api/folders`

**請求體**:
```typescript
{
  id: string;                    // 必需
  name?: string;                 // 可選
  parentId?: string | null;      // 可選
}
```

**功能**:
- 重命名資料夾
- 移動資料夾到其他位置

**實現邏輯**:

```typescript
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { id, name, parentId } = body;

  // 獲取當前資料夾
  const currentFolder = await prisma.folder.findUnique({
    where: { id },
    include: { children: true },
  });

  if (!currentFolder || currentFolder.userId !== session.user.id) {
    return NextResponse.json(
      { error: '資料夾不存在或無權訪問' },
      { status: 404 }
    );
  }

  // 如果移動資料夾，檢查深度
  if (parentId !== undefined && parentId !== currentFolder.parentId) {
    // 防止循環引用
    if (parentId === id) {
      return NextResponse.json(
        { error: '不能將資料夾移動到自己' },
        { status: 400 }
      );
    }

    // 檢查是否移動到自己的子資料夾
    if (parentId && await isDescendant(parentId, id)) {
      return NextResponse.json(
        { error: '不能將資料夾移動到自己的子資料夾' },
        { status: 400 }
      );
    }

    let newDepth = 0;
    let newPath = name || currentFolder.name;

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
        select: { depth: true, path: true, userId: true },
      });

      if (!parentFolder || parentFolder.userId !== session.user.id) {
        return NextResponse.json(
          { error: '目標資料夾不存在或無權訪問' },
          { status: 404 }
        );
      }

      newDepth = parentFolder.depth + 1;

      // 檢查移動後的深度
      const maxChildDepth = await getMaxChildDepth(id);
      const totalDepth = newDepth + maxChildDepth;

      if (totalDepth >= 10) {
        return NextResponse.json(
          { error: '移動後會超過最大層級限制' },
          { status: 400 }
        );
      }

      newPath = `${parentFolder.path}/${name || currentFolder.name}`;
    }

    // 更新資料夾及其所有子資料夾
    await updateFolderHierarchy(id, newDepth, newPath);
  }

  // 更新資料夾
  const folder = await prisma.folder.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(parentId !== undefined && { parentId }),
    },
  });

  return NextResponse.json(folder);
}

// 輔助函數：檢查是否為子孫資料夾
async function isDescendant(folderId: string, ancestorId: string): Promise<boolean> {
  let currentId: string | null = folderId;

  while (currentId) {
    if (currentId === ancestorId) {
      return true;
    }

    const folder = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    currentId = folder?.parentId || null;
  }

  return false;
}

// 輔助函數：獲取最大子資料夾深度
async function getMaxChildDepth(folderId: string): Promise<number> {
  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  if (children.length === 0) {
    return 0;
  }

  const childDepths = await Promise.all(
    children.map(child => getMaxChildDepth(child.id))
  );

  return Math.max(...childDepths) + 1;
}

// 輔助函數：遞歸更新資料夾層級
async function updateFolderHierarchy(
  folderId: string,
  newDepth: number,
  newPath: string
) {
  // 更新當前資料夾
  await prisma.folder.update({
    where: { id: folderId },
    data: { depth: newDepth, path: newPath },
  });

  // 獲取所有子資料夾
  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true, name: true },
  });

  // 遞歸更新子資料夾
  await Promise.all(
    children.map(child =>
      updateFolderHierarchy(
        child.id,
        newDepth + 1,
        `${newPath}/${child.name}`
      )
    )
  );
}
```

**關鍵點**:
- ✅ 支援重命名和移動
- ✅ 防止循環引用
- ✅ 移動時檢查整個子樹的深度
- ✅ 遞歸更新所有子資料夾的深度和路徑
- ✅ 完整的權限驗證

#### DELETE - 刪除資料夾

**端點**: `DELETE /api/folders?id={folderId}`

**查詢參數**:
```typescript
{
  id: string;  // 必需
}
```

**實現邏輯**:

```typescript
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: '缺少資料夾 ID' },
      { status: 400 }
    );
  }

  // 檢查資料夾存在性和所有權
  const folder = await prisma.folder.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          children: true,
          activities: true,
        },
      },
    },
  });

  if (!folder || folder.userId !== session.user.id) {
    return NextResponse.json(
      { error: '資料夾不存在或無權訪問' },
      { status: 404 }
    );
  }

  // 檢查是否為空資料夾
  if (folder._count.children > 0 || folder._count.activities > 0) {
    return NextResponse.json(
      { error: '資料夾不為空，無法刪除' },
      { status: 400 }
    );
  }

  // 刪除資料夾
  await prisma.folder.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
```

**關鍵點**:
- ✅ 只能刪除空資料夾
- ✅ 防止誤刪除包含內容的資料夾
- ✅ 權限驗證

### 2. 活動移動 API

**文件**: `app/api/activities/move/route.ts`

**端點**: `POST /api/activities/move`

**請求體**:
```typescript
{
  activityId: string;           // 必需
  folderId: string | null;      // 必需，null 表示移動到根目錄
}
```

**實現邏輯**:

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { activityId, folderId } = body;

  // 驗證活動存在且屬於用戶
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { userId: true },
  });

  if (!activity || activity.userId !== session.user.id) {
    return NextResponse.json(
      { error: '活動不存在或無權訪問' },
      { status: 404 }
    );
  }

  // 驗證資料夾存在且屬於用戶
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id,
        type: 'ACTIVITIES',
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: '資料夾不存在或無權訪問' },
        { status: 404 }
      );
    }
  }

  // 更新活動的資料夾
  const updatedActivity = await prisma.activity.update({
    where: { id: activityId },
    data: { folderId },
  });

  return NextResponse.json(updatedActivity);
}
```

---

## 前端組件設計

### 1. 主頁面組件

**文件**: `components/activities/WordwallStyleMyActivities.tsx`

#### 狀態管理

```typescript
const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
const [folders, setFolders] = useState<FolderData[]>([]);
const [currentFolder, setCurrentFolder] = useState<CurrentFolder | null>(null);
const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
const [activities, setActivities] = useState<Activity[]>([]);
```

**狀態說明**:

| 狀態 | 類型 | 說明 |
|------|------|------|
| `currentFolderId` | `string \| null` | 當前所在資料夾的 ID |
| `folders` | `FolderData[]` | 當前層級的子資料夾列表 |
| `currentFolder` | `CurrentFolder \| null` | 當前資料夾的詳細信息 |
| `breadcrumbs` | `Breadcrumb[]` | 麵包屑導航路徑 |
| `activities` | `Activity[]` | 當前資料夾的活動列表 |

#### 資料夾導航邏輯

```typescript
const handleFolderClick = (folderId: string | null) => {
  setCurrentFolderId(folderId);
  setPage(1); // 重置分頁

  // 更新 URL 查詢參數
  const params = new URLSearchParams(window.location.search);
  if (folderId) {
    params.set('folderId', folderId);
  } else {
    params.delete('folderId');
  }

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
};

// 返回上一層
const handleBackToParent = () => {
  if (currentFolder?.parentId) {
    handleFolderClick(currentFolder.parentId);
  } else {
    handleFolderClick(null);
  }
};
```

**關鍵點**:
- ✅ 使用 URL 查詢參數保持狀態
- ✅ 支援瀏覽器前進/後退
- ✅ 切換資料夾時重置分頁

#### 麵包屑導航

```typescript
const buildBreadcrumbs = async (folderId: string | null) => {
  if (!folderId) {
    setBreadcrumbs([]);
    return;
  }

  const crumbs: Breadcrumb[] = [];
  let currentId: string | null = folderId;

  // 從當前資料夾向上遍歷到根目錄
  while (currentId) {
    const folder = await fetchFolderById(currentId);
    if (!folder) break;

    crumbs.unshift({
      id: folder.id,
      name: folder.name,
    });

    currentId = folder.parentId;
  }

  setBreadcrumbs(crumbs);
};

// 麵包屑渲染
<div className="flex items-center gap-2 text-sm">
  <button onClick={() => handleFolderClick(null)}>
    <HomeIcon className="w-4 h-4" />
  </button>
  {breadcrumbs.map((crumb, index) => (
    <React.Fragment key={crumb.id}>
      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
      <button
        onClick={() => handleFolderClick(crumb.id)}
        className="hover:text-blue-600"
      >
        {crumb.name}
      </button>
    </React.Fragment>
  ))}
</div>
```

**關鍵點**:
- ✅ 從當前資料夾向上遍歷到根目錄
- ✅ 構建完整的路徑鏈
- ✅ 每個麵包屑都可點擊導航

#### 數據加載

```typescript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      // 加載資料夾列表
      const foldersResponse = await fetch(
        `/api/folders?type=ACTIVITIES&parentId=${currentFolderId || ''}`
      );
      const foldersData = await foldersResponse.json();
      setFolders(foldersData);

      // 加載當前資料夾信息
      if (currentFolderId) {
        const folderResponse = await fetch(`/api/folders/${currentFolderId}`);
        const folderData = await folderResponse.json();
        setCurrentFolder(folderData);
        await buildBreadcrumbs(currentFolderId);
      } else {
        setCurrentFolder(null);
        setBreadcrumbs([]);
      }

      // 加載活動列表
      const activitiesResponse = await fetch(
        `/api/activities?folderId=${currentFolderId || ''}&page=${page}&limit=${limit}`
      );
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData.activities);
      setTotalPages(activitiesData.totalPages);
    } catch (error) {
      console.error('加載數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [currentFolderId, page, limit]);
```

### 2. 資料夾管理組件

**文件**: `components/activities/FolderManager.tsx`

#### 資料夾樹狀顯示

```typescript
interface FolderTreeProps {
  folders: FolderData[];
  currentFolderId: string | null;
  onFolderClick: (folderId: string) => void;
  level?: number;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  currentFolderId,
  onFolderClick,
  level = 0
}) => {
  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <div key={folder.id}>
          <button
            onClick={() => onFolderClick(folder.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
              "hover:bg-gray-100 transition-colors",
              currentFolderId === folder.id && "bg-blue-50 text-blue-600"
            )}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
          >
            <FolderIcon className="w-4 h-4" />
            <span className="flex-1 text-left">{folder.name}</span>
            <span className="text-sm text-gray-500">
              {folder._count.activities}
            </span>
          </button>

          {/* 遞歸渲染子資料夾 */}
          {folder.children && folder.children.length > 0 && (
            <FolderTree
              folders={folder.children}
              currentFolderId={currentFolderId}
              onFolderClick={onFolderClick}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

**關鍵點**:
- ✅ 遞歸渲染子資料夾
- ✅ 視覺縮進表示層級
- ✅ 高亮當前資料夾
- ✅ 顯示活動數量

#### 新建資料夾對話框

```typescript
interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  onSuccess: () => void;
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  parentId,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('請輸入資料夾名稱');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type: 'ACTIVITIES',
          parentId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '創建失敗');
      }

      onSuccess();
      onClose();
      setName('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建資料夾</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="資料夾名稱"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
              {loading ? '創建中...' : '創建'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 3. 活動移動組件

**文件**: `components/activities/MoveToFolderModal.tsx`

```typescript
interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  currentFolderId: string | null;
  onSuccess: () => void;
}

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
  activityId,
  currentFolderId,
  onSuccess,
}) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    const response = await fetch('/api/folders?type=ACTIVITIES');
    const data = await response.json();
    setFolders(buildFolderTree(data));
  };

  const handleMove = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/activities/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          folderId: selectedFolderId,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('移動失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>移動到資料夾</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
                "hover:bg-gray-100 transition-colors",
                selectedFolderId === null && "bg-blue-50 text-blue-600"
              )}
            >
              <HomeIcon className="w-4 h-4" />
              <span>根目錄</span>
            </button>
            <FolderTree
              folders={folders}
              currentFolderId={selectedFolderId}
              onFolderClick={setSelectedFolderId}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleMove} disabled={loading}>
              {loading ? '移動中...' : '移動'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 實施步驟

### 步驟 1: 數據庫遷移

```bash
# 1. 修改 Prisma schema
# 添加 parentId, depth, path 字段

# 2. 創建遷移
npx prisma migrate dev --name add_folder_hierarchy

# 3. 生成 Prisma Client
npx prisma generate
```

### 步驟 2: 實現 API 端點

1. ✅ 創建 `app/api/folders/route.ts`
2. ✅ 實現 GET, POST, PATCH, DELETE 方法
3. ✅ 創建 `app/api/activities/move/route.ts`
4. ✅ 添加錯誤處理和驗證

### 步驟 3: 開發前端組件

1. ✅ 修改 `WordwallStyleMyActivities.tsx`
2. ✅ 創建 `FolderManager.tsx`
3. ✅ 創建 `NewFolderModal.tsx`
4. ✅ 創建 `MoveToFolderModal.tsx`

### 步驟 4: 測試

1. ✅ 單元測試 API 端點
2. ✅ 集成測試資料夾操作
3. ✅ E2E 測試用戶流程

---

## 測試與驗證

### 功能測試清單

- [x] 創建根目錄資料夾
- [x] 創建子資料夾（多層嵌套）
- [x] 重命名資料夾
- [x] 移動資料夾
- [x] 刪除空資料夾
- [x] 防止刪除非空資料夾
- [x] 移動活動到資料夾
- [x] 資料夾導航
- [x] 麵包屑導航
- [x] 深度限制（10層）
- [x] 防止循環引用
- [x] 瀏覽器前進/後退
- [x] URL 狀態同步

### 邊界測試

1. **深度限制測試**:
   - 創建 10 層資料夾 ✅
   - 嘗試創建第 11 層（應失敗）✅

2. **循環引用測試**:
   - 嘗試將資料夾移動到自己 ✅
   - 嘗試將資料夾移動到子資料夾 ✅

3. **權限測試**:
   - 訪問其他用戶的資料夾（應失敗）✅
   - 移動活動到其他用戶的資料夾（應失敗）✅

---

## 性能優化

### 1. 數據庫優化

**索引策略**:
```prisma
@@index([userId, type])           // 用戶的所有資料夾
@@index([parentId])                // 子資料夾查詢
@@index([userId, type, parentId])  // 組合查詢
```

**查詢優化**:
- 只加載當前層級的資料夾（不遞歸）
- 使用 `_count` 聚合計算數量
- 使用 `select` 只查詢需要的字段

### 2. 前端優化

**懶加載**:
```typescript
// 只在需要時加載子資料夾
const loadSubfolders = async (folderId: string) => {
  const response = await fetch(`/api/folders?parentId=${folderId}`);
  return response.json();
};
```

**緩存策略**:
```typescript
// 使用 React Query 緩存資料夾數據
const { data: folders } = useQuery(
  ['folders', currentFolderId],
  () => fetchFolders(currentFolderId),
  { staleTime: 5 * 60 * 1000 } // 5 分鐘
);
```

**防抖**:
```typescript
// 搜索和過濾使用防抖
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    setSearchQuery(value);
  }, 300),
  []
);
```

---

## 後續擴展

### 計劃功能

1. **拖放支援** 🔄
   - 拖放移動活動
   - 拖放移動資料夾
   - 拖放排序

2. **批量操作** 🔄
   - 批量移動活動
   - 批量刪除活動
   - 批量標記

3. **資料夾自定義** 🔄
   - 自定義資料夾顏色
   - 自定義資料夾圖標
   - 資料夾描述

4. **高級功能** 🔄
   - 資料夾排序（名稱、日期、活動數量）
   - 資料夾搜索
   - 資料夾收藏
   - 資料夾分享

---

## 總結

### 技術亮點

1. **自引用關係**: 使用 Prisma 的自引用關係實現樹狀結構
2. **遞歸組件**: React 遞歸組件渲染資料夾樹
3. **深度控制**: 自動計算和驗證資料夾深度
4. **路徑管理**: 自動維護完整路徑
5. **級聯更新**: 移動資料夾時自動更新子樹

### 實施成果

- ✅ 完整的 10 層資料夾嵌套系統
- ✅ 直觀的用戶界面
- ✅ 完善的錯誤處理
- ✅ 良好的性能表現
- ✅ 可擴展的架構設計

### 學習要點

1. **數據庫設計**: 樹狀結構的數據庫設計模式
2. **遞歸算法**: 遞歸遍歷和更新樹狀結構
3. **React 模式**: 遞歸組件和狀態管理
4. **API 設計**: RESTful API 設計最佳實踐
5. **性能優化**: 數據庫索引和前端緩存策略

---

**文檔版本**: 1.0
**最後更新**: 2025-10-20
**作者**: EduCreate Development Team


