# 資料夾嵌套功能實現計畫

## 📋 功能需求

### 用戶需求描述
在 `/my-results` 頁面中實現資料夾嵌套和拖移功能，參考 Wordwall 的資料夾管理：
- https://wordwall.net/tc/myresults/folder/384633/%E4%B8%89%E5%B9%B4%E7%B4%9A%E4%B8%8A%E5%AD%B8%E6%9C%9F%E8%8B%B1%E6%96%87

### 核心功能
1. **資料夾可以拖移到其他資料夾中**
   - 創建子資料夾（資料夾中的資料夾）
   - 支援多層嵌套結構
   - 拖移時顯示目標資料夾高亮

2. **資料夾可以拖移回上一層**
   - 從子資料夾移回父資料夾
   - 從子資料夾移回根目錄
   - 提供拖移到根目錄的區域

3. **資料夾層級導航**
   - 麵包屑導航顯示當前路徑
   - 返回上一層按鈕
   - 顯示子資料夾列表

## 🔍 當前實現狀況

### ✅ 已實現的功能
1. 結果項目可以拖移到資料夾中
2. 結果項目可以拖移回根目錄
3. 資料夾的創建、重命名、刪除
4. 資料夾的顏色自定義
5. 資料夾的回收桶功能

### ❌ 缺少的功能
1. **資料夾嵌套**：
   - Prisma schema 中的 `Folder` 模型沒有 `parentId` 字段
   - 無法創建子資料夾
   - 無法查詢資料夾的子資料夾

2. **資料夾拖移**：
   - 資料夾不能拖移到其他資料夾中
   - 資料夾不能拖移回上一層
   - 沒有防止循環嵌套的邏輯

3. **資料夾層級顯示**：
   - 沒有麵包屑導航顯示當前路徑
   - 沒有返回上一層的按鈕
   - 沒有顯示子資料夾數量

## 📊 實現計畫

### 階段 1：數據庫 Schema 修改

#### 1.1 修改 Prisma Schema
**文件**：`prisma/schema.prisma`

```prisma
model Folder {
  id          String             @id @default(cuid())
  name        String
  description String?
  color       String?
  icon        String?
  type        FolderType         @default(ACTIVITIES)
  parentId    String?            // 新增：父資料夾 ID
  depth       Int                @default(0) // 新增：資料夾深度（0 = 根目錄）
  path        String?            // 新增：資料夾路徑（例如：/folder1/folder2）
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  deletedAt   DateTime?
  userId      String
  
  // 關聯
  activities  Activity[]
  results     AssignmentResult[]
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent      Folder?            @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Folder[]           @relation("FolderHierarchy")

  @@unique([name, userId, type, parentId]) // 同一用戶在同一父資料夾下不能有重名資料夾
  @@index([userId, type, parentId]) // 優化查詢性能
  @@index([userId, type, deletedAt]) // 優化查詢性能
}
```

#### 1.2 創建數據庫遷移
```bash
npx prisma migrate dev --name add_folder_hierarchy
```

#### 1.3 更新現有資料夾數據
創建遷移腳本來更新現有資料夾的 `depth` 和 `path` 字段：

```sql
-- 設置所有現有資料夾的 depth 為 0（根目錄）
UPDATE "Folder" SET "depth" = 0 WHERE "parentId" IS NULL;

-- 設置所有現有資料夾的 path
UPDATE "Folder" SET "path" = '/' || "id" WHERE "parentId" IS NULL;
```

### 階段 2：API 層修改

#### 2.1 創建資料夾 API 修改
**文件**：`app/api/folders/route.ts`

**修改內容**：
- 支援 `parentId` 參數
- 驗證父資料夾存在
- 計算資料夾深度
- 限制最大嵌套深度（建議 10 層）
- 生成資料夾路徑

```typescript
// POST /api/folders
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, icon, type, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '資料夾名稱不能為空' }, { status: 400 });
    }

    const folderType = type === 'results' ? 'RESULTS' : 'ACTIVITIES';

    // 如果有 parentId，驗證父資料夾
    let parentFolder = null;
    let depth = 0;
    let path = '/';

    if (parentId) {
      parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder) {
        return NextResponse.json({ error: '父資料夾不存在' }, { status: 404 });
      }

      if (parentFolder.userId !== session.user.id) {
        return NextResponse.json({ error: '無權訪問此資料夾' }, { status: 403 });
      }

      if (parentFolder.type !== folderType) {
        return NextResponse.json({ error: '資料夾類型不匹配' }, { status: 400 });
      }

      // 檢查深度限制
      if (parentFolder.depth >= 9) { // 最大深度 10 層（0-9）
        return NextResponse.json({ error: '資料夾嵌套深度不能超過 10 層' }, { status: 400 });
      }

      depth = parentFolder.depth + 1;
      path = `${parentFolder.path}/${parentId}`;
    }

    // 檢查是否已存在同名同類型資料夾（在同一父資料夾下）
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        type: folderType,
        parentId: parentId || null,
        deletedAt: null
      }
    });

    if (existingFolder) {
      return NextResponse.json({ error: '資料夾名稱已存在' }, { status: 400 });
    }

    const folderColor = color || '#3B82F6';

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: folderColor,
        icon: icon || 'folder',
        type: folderType,
        parentId: parentId || null,
        depth,
        path,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      parentId: folder.parentId,
      depth: folder.depth,
      path: folder.path,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      resultCount: 0,
      subfolderCount: 0
    });
  } catch (error) {
    console.error('創建資料夾失敗:', error);
    return NextResponse.json({ error: '創建資料夾失敗' }, { status: 500 });
  }
}
```

#### 2.2 移動資料夾 API
**文件**：`app/api/folders/[folderId]/move/route.ts`（新建）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/folders/[folderId]/move
export async function PATCH(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { folderId } = params;
    const body = await request.json();
    const { targetFolderId } = body; // null 表示移動到根目錄

    // 獲取要移動的資料夾
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        children: true
      }
    });

    if (!folder) {
      return NextResponse.json({ error: '資料夾不存在' }, { status: 404 });
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: '無權訪問此資料夾' }, { status: 403 });
    }

    // 如果移動到根目錄
    if (!targetFolderId) {
      await updateFolderHierarchy(folderId, null, 0, `/${folderId}`);
      
      return NextResponse.json({
        success: true,
        message: '資料夾已移動到根目錄'
      });
    }

    // 獲取目標資料夾
    const targetFolder = await prisma.folder.findUnique({
      where: { id: targetFolderId }
    });

    if (!targetFolder) {
      return NextResponse.json({ error: '目標資料夾不存在' }, { status: 404 });
    }

    if (targetFolder.userId !== session.user.id) {
      return NextResponse.json({ error: '無權訪問目標資料夾' }, { status: 403 });
    }

    if (targetFolder.type !== folder.type) {
      return NextResponse.json({ error: '資料夾類型不匹配' }, { status: 400 });
    }

    // 防止循環嵌套：不能移動到自己或自己的子資料夾中
    if (folderId === targetFolderId) {
      return NextResponse.json({ error: '不能移動到自己' }, { status: 400 });
    }

    if (await isDescendant(targetFolderId, folderId)) {
      return NextResponse.json({ error: '不能移動到自己的子資料夾中' }, { status: 400 });
    }

    // 檢查深度限制
    const newDepth = targetFolder.depth + 1;
    const maxChildDepth = await getMaxChildDepth(folderId);
    const totalDepth = newDepth + maxChildDepth;

    if (totalDepth > 9) {
      return NextResponse.json({ 
        error: `移動後的資料夾層級將超過 10 層限制（當前將達到 ${totalDepth + 1} 層）` 
      }, { status: 400 });
    }

    // 檢查同名資料夾
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name: folder.name,
        type: folder.type,
        parentId: targetFolderId,
        deletedAt: null,
        id: { not: folderId }
      }
    });

    if (existingFolder) {
      return NextResponse.json({ error: '目標資料夾中已存在同名資料夾' }, { status: 400 });
    }

    // 更新資料夾層級
    const newPath = `${targetFolder.path}/${targetFolderId}`;
    await updateFolderHierarchy(folderId, targetFolderId, newDepth, newPath);

    return NextResponse.json({
      success: true,
      message: '資料夾移動成功'
    });
  } catch (error) {
    console.error('移動資料夾失敗:', error);
    return NextResponse.json({ error: '移動資料夾失敗' }, { status: 500 });
  }
}

// 輔助函數：檢查是否為子孫資料夾
async function isDescendant(folderId: string, ancestorId: string): Promise<boolean> {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId }
  });

  if (!folder || !folder.parentId) {
    return false;
  }

  if (folder.parentId === ancestorId) {
    return true;
  }

  return isDescendant(folder.parentId, ancestorId);
}

// 輔助函數：獲取子資料夾的最大深度
async function getMaxChildDepth(folderId: string): Promise<number> {
  const children = await prisma.folder.findMany({
    where: { parentId: folderId }
  });

  if (children.length === 0) {
    return 0;
  }

  const childDepths = await Promise.all(
    children.map(child => getMaxChildDepth(child.id))
  );

  return Math.max(...childDepths) + 1;
}

// 輔助函數：更新資料夾及其子資料夾的層級信息
async function updateFolderHierarchy(
  folderId: string,
  newParentId: string | null,
  newDepth: number,
  newPath: string
) {
  // 更新當前資料夾
  await prisma.folder.update({
    where: { id: folderId },
    data: {
      parentId: newParentId,
      depth: newDepth,
      path: newPath
    }
  });

  // 遞歸更新所有子資料夾
  const children = await prisma.folder.findMany({
    where: { parentId: folderId }
  });

  for (const child of children) {
    const childPath = `${newPath}/${folderId}`;
    await updateFolderHierarchy(child.id, folderId, newDepth + 1, childPath);
  }
}
```

#### 2.3 獲取資料夾 API 修改
**文件**：`app/api/folders/route.ts`

**修改內容**：
- 支援 `parentId` 查詢參數
- 返回子資料夾列表
- 返回資料夾路徑信息

### 階段 3：前端組件修改

#### 3.1 創建可拖移的資料夾卡片
**文件**：`components/results/DraggableFolderCard.tsx`（新建）

#### 3.2 修改拖放上下文
**文件**：`components/results/DragDropContext.tsx`

**修改內容**：
- 支援資料夾拖移邏輯
- 添加 `onMoveFolder` 回調
- 防止循環嵌套

#### 3.3 創建麵包屑導航組件
**文件**：`components/results/FolderBreadcrumb.tsx`（新建）

#### 3.4 修改主頁面組件
**文件**：`components/results/WordwallStyleMyResults.tsx`

**修改內容**：
- 顯示當前資料夾的子資料夾
- 添加麵包屑導航
- 支援資料夾拖移
- 添加返回上一層按鈕

### 階段 4：UI/UX 改進

#### 4.1 視覺反饋
- 拖移時顯示目標資料夾高亮
- 顯示不可拖移的提示（循環嵌套、深度限制）
- 拖移預覽顯示資料夾圖標和名稱

#### 4.2 導航改進
- 麵包屑導航顯示完整路徑
- 點擊麵包屑可以快速跳轉
- 返回上一層按鈕
- 顯示當前資料夾的子資料夾數量

#### 4.3 性能優化
- 使用索引優化資料夾查詢
- 緩存資料夾層級信息
- 懶加載子資料夾

## 🎯 實現優先級

### 高優先級（必須實現）
1. 數據庫 Schema 修改（添加 `parentId`、`depth`、`path`）
2. 創建資料夾 API 支援 `parentId`
3. 移動資料夾 API
4. 資料夾拖移前端邏輯
5. 防止循環嵌套邏輯

### 中優先級（建議實現）
1. 麵包屑導航
2. 返回上一層按鈕
3. 顯示子資料夾數量
4. 拖移視覺反饋

### 低優先級（可選實現）
1. 資料夾排序
2. 資料夾搜索（包含子資料夾）
3. 批量移動資料夾
4. 資料夾快捷鍵操作

## 📝 注意事項

### 數據完整性
1. 防止循環嵌套（資料夾不能移動到自己的子資料夾中）
2. 限制最大嵌套深度（建議 10 層）
3. 同一父資料夾下不能有重名資料夾
4. 刪除資料夾時級聯刪除所有子資料夾

### 性能考慮
1. 使用數據庫索引優化查詢
2. 緩存資料夾層級信息
3. 避免深度遞歸查詢
4. 使用批量更新減少數據庫操作

### 用戶體驗
1. 拖移時提供清晰的視覺反饋
2. 顯示不可拖移的原因
3. 提供撤銷操作
4. 顯示資料夾移動進度

## 🔗 相關文件

### 當前實現
- `prisma/schema.prisma` - 數據庫 Schema
- `app/api/folders/route.ts` - 資料夾 API
- `components/results/WordwallStyleMyResults.tsx` - 主頁面組件
- `components/results/DroppableFolderCard.tsx` - 可放置的資料夾卡片
- `components/results/DragDropContext.tsx` - 拖放上下文

### 需要創建的文件
- `app/api/folders/[folderId]/move/route.ts` - 移動資料夾 API
- `components/results/DraggableFolderCard.tsx` - 可拖移的資料夾卡片
- `components/results/FolderBreadcrumb.tsx` - 麵包屑導航組件

### 參考實現
- `pages/demo/folder-structure.tsx` - 資料夾結構演示頁面
- `lib/content/FolderManager.ts` - 資料夾管理工具類
- `components/content/DragDropFolderTree.tsx` - 拖拽資料夾樹組件

## 📅 預估工作量

- **數據庫遷移**：2-3 小時
- **API 開發**：4-6 小時
- **前端組件開發**：6-8 小時
- **測試和調試**：4-6 小時
- **總計**：16-23 小時

## ✅ 驗收標準

1. ✅ 資料夾可以拖移到其他資料夾中創建子資料夾
2. ✅ 資料夾可以拖移回上一層或根目錄
3. ✅ 防止循環嵌套（不能移動到自己的子資料夾中）
4. ✅ 限制最大嵌套深度（10 層）
5. ✅ 麵包屑導航顯示當前路徑
6. ✅ 返回上一層按鈕正常工作
7. ✅ 拖移時顯示清晰的視覺反饋
8. ✅ 同一父資料夾下不能有重名資料夾
9. ✅ 刪除資料夾時級聯刪除所有子資料夾
10. ✅ 性能良好，無明顯延遲

---

**文檔創建日期**：2025-10-16
**最後更新日期**：2025-10-16
**狀態**：待實現

