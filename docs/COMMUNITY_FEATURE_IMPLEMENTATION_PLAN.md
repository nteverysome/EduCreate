# EduCreate 社區功能詳細實施方案

## 📋 文檔目的

本文檔提供 EduCreate 社區功能的完整實施方案，包括：
- 對原分析報告的評估和改進
- 詳細的資料庫 Schema 設計
- 完整的 API 設計（包括請求/響應格式）
- 具體的前端實現方案
- 分階段實施計畫（包括時間估算）
- 測試和部署策略

## 🔍 原分析報告評估

### ✅ 優點
1. **結構清晰**: 分析了 Wordwall 的頁面結構和功能
2. **數據推測合理**: 推測的數據結構基本符合需求
3. **分階段規劃**: 提供了優先級分級

### ⚠️ 需要改進的地方

#### 1. 資料庫設計不夠完善
**問題**:
- 缺少必要的索引優化
- 沒有考慮查詢效能
- 缺少軟刪除支援
- 沒有考慮數據完整性約束

**改進**: 見下方「完善的資料庫 Schema」

#### 2. API 設計過於簡化
**問題**:
- 只提供了基本的端點，沒有詳細的請求/響應格式
- 缺少錯誤處理和驗證邏輯
- 沒有考慮分頁、排序、篩選的具體參數
- 缺少權限檢查邏輯

**改進**: 見下方「完整的 API 設計」

#### 3. 前端實現缺乏細節
**問題**:
- 只提到了頁面結構，沒有具體的組件設計
- 沒有考慮狀態管理策略
- 缺少載入狀態、錯誤處理的 UI 設計
- 沒有考慮響應式設計

**改進**: 見下方「具體的前端實現」

#### 4. 實施計畫不夠具體
**問題**:
- 缺少每個階段的具體任務列表
- 沒有時間估算
- 缺少依賴關係說明
- 沒有測試計畫

**改進**: 見下方「分階段實施計畫」

---

## 🗄️ 完善的資料庫 Schema

### 1. 擴展現有的 Activity 模型

```prisma
model Activity {
  // ... 現有字段 ...
  
  // 社區分享功能（現有）
  isPublicShared  Boolean              @default(false)
  shareToken      String?              @unique
  communityPlays  Int                  @default(0)
  
  // 新增：社區功能增強字段
  publishedToCommunityAt DateTime?     // 發布到社區的時間
  communityCategory      String?       // 社區分類（例如：英文、數學、國語）
  communityTags          String[]      // 社區標籤（例如：國小、三年級、南一）
  communityDescription   String?       // 社區描述（可能與 description 不同）
  communityThumbnail     String?       // 社區縮圖 URL
  communityViews         Int           @default(0)  // 社區瀏覽數
  communityLikes         Int           @default(0)  // 社區喜歡數
  communityBookmarks     Int           @default(0)  // 社區收藏數
  isFeatured             Boolean       @default(false)  // 是否為精選活動
  featuredAt             DateTime?     // 精選時間
  
  // 關聯
  likes                  ActivityLike[]
  bookmarks              ActivityBookmark[]
  comments               ActivityComment[]
  
  // 索引優化
  @@index([isPublicShared, publishedToCommunityAt])  // 社區活動列表查詢
  @@index([communityCategory])                        // 分類查詢
  @@index([communityLikes])                           // 熱門排序
  @@index([communityViews])                           // 瀏覽排序
  @@index([isFeatured, featuredAt])                   // 精選活動
  @@index([userId, isPublicShared])                   // 用戶的公開活動
}
```

### 2. 新增 ActivityLike 模型（喜歡功能）

```prisma
model ActivityLike {
  id              String   @id @default(cuid())
  activityId      String
  userId          String
  createdAt       DateTime @default(now())
  
  // 關聯
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 約束：每個用戶只能對同一活動按讚一次
  @@unique([activityId, userId])
  
  // 索引：快速查詢用戶的所有喜歡
  @@index([userId])
  
  // 索引：快速查詢活動的所有喜歡
  @@index([activityId])
}
```

### 3. 新增 ActivityBookmark 模型（收藏功能）

```prisma
model ActivityBookmark {
  id              String   @id @default(cuid())
  activityId      String
  userId          String
  folderId        String?  // 可選：收藏到特定資料夾
  createdAt       DateTime @default(now())
  
  // 關聯
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder          Folder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  
  // 約束：每個用戶只能收藏同一活動一次
  @@unique([activityId, userId])
  
  // 索引：快速查詢用戶的所有收藏
  @@index([userId])
  
  // 索引：快速查詢活動的所有收藏
  @@index([activityId])
  
  // 索引：按資料夾查詢收藏
  @@index([folderId])
}
```

### 4. 新增 ActivityComment 模型（評論功能）

```prisma
model ActivityComment {
  id              String   @id @default(cuid())
  activityId      String
  userId          String
  content         String   @db.Text
  parentId        String?  // 支援回覆評論
  likes           Int      @default(0)
  isEdited        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?  // 軟刪除
  
  // 關聯
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent          ActivityComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies         ActivityComment[] @relation("CommentReplies")
  
  // 索引：快速查詢活動的所有評論
  @@index([activityId, deletedAt])
  
  // 索引：快速查詢用戶的所有評論
  @@index([userId])
  
  // 索引：快速查詢回覆
  @@index([parentId])
}
```

### 5. 新增 CommunityReport 模型（舉報功能）

```prisma
model CommunityReport {
  id              String       @id @default(cuid())
  activityId      String
  reporterId      String
  reason          ReportReason
  description     String?      @db.Text
  status          ReportStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  reviewNotes     String?      @db.Text
  createdAt       DateTime     @default(now())
  
  // 關聯
  activity        Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  reporter        User     @relation("ReportedBy", fields: [reporterId], references: [id], onDelete: Cascade)
  reviewer        User?    @relation("ReviewedBy", fields: [reviewedBy], references: [id], onDelete: SetNull)
  
  // 索引：快速查詢待審核的舉報
  @@index([status, createdAt])
  
  // 索引：快速查詢活動的所有舉報
  @@index([activityId])
}

enum ReportReason {
  INAPPROPRIATE_CONTENT  // 不當內容
  SPAM                   // 垃圾信息
  COPYRIGHT              // 版權問題
  MISLEADING             // 誤導性內容
  OTHER                  // 其他
}

enum ReportStatus {
  PENDING    // 待審核
  REVIEWING  // 審核中
  RESOLVED   // 已解決
  REJECTED   // 已拒絕
}
```

### 6. 更新 User 模型

```prisma
model User {
  // ... 現有字段 ...
  
  // 新增關聯
  activityLikes       ActivityLike[]
  activityBookmarks   ActivityBookmark[]
  activityComments    ActivityComment[]
  reportsSubmitted    CommunityReport[] @relation("ReportedBy")
  reportsReviewed     CommunityReport[] @relation("ReviewedBy")
}
```

### 7. 更新 Folder 模型（支援收藏資料夾）

```prisma
model Folder {
  // ... 現有字段 ...
  
  // 新增：支援收藏資料夾
  bookmarks       ActivityBookmark[]
}
```

---

## 🔌 完整的 API 設計

### 階段 1: 基礎社區功能 API

#### 1.1 發布活動到社區

**端點**: `POST /api/activities/{activityId}/publish-to-community`

**權限**: 需要登入，且必須是活動的擁有者

**請求體**:
```typescript
{
  category: string;           // 必填：社區分類（例如：英文、數學）
  tags: string[];             // 必填：社區標籤（例如：國小、三年級）
  description?: string;       // 可選：社區描述
  thumbnailUrl?: string;      // 可選：自定義縮圖
}
```

**響應**:
```typescript
{
  success: true,
  activity: {
    id: string;
    title: string;
    shareToken: string;
    shareUrl: string;          // 例如：/community/activity/{shareToken}
    publishedAt: string;       // ISO 8601 格式
  }
}
```

**錯誤響應**:
```typescript
// 401 Unauthorized
{ error: "未授權" }

// 403 Forbidden
{ error: "您沒有權限發布此活動" }

// 400 Bad Request
{ error: "缺少必要字段", details: { field: "category", message: "分類為必填" } }

// 404 Not Found
{ error: "活動不存在" }
```

**實現邏輯**:
```typescript
// app/api/activities/[id]/publish-to-community/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. 驗證用戶身份
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  // 2. 獲取活動並驗證擁有權
  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!activity) {
    return NextResponse.json({ error: '活動不存在' }, { status: 404 });
  }

  if (activity.userId !== session.user.id) {
    return NextResponse.json({ error: '您沒有權限發布此活動' }, { status: 403 });
  }

  // 3. 解析請求體並驗證
  const body = await request.json();
  const { category, tags, description, thumbnailUrl } = body;

  if (!category || !tags || tags.length === 0) {
    return NextResponse.json(
      { error: '缺少必要字段', details: { field: !category ? 'category' : 'tags' } },
      { status: 400 }
    );
  }

  // 4. 生成 shareToken（如果還沒有）
  const shareToken = activity.shareToken || generateShareToken();

  // 5. 更新活動
  const updatedActivity = await prisma.activity.update({
    where: { id: params.id },
    data: {
      isPublicShared: true,
      shareToken: shareToken,
      publishedToCommunityAt: new Date(),
      communityCategory: category,
      communityTags: tags,
      communityDescription: description || activity.description,
      communityThumbnail: thumbnailUrl || null,
    }
  });

  // 6. 返回響應
  return NextResponse.json({
    success: true,
    activity: {
      id: updatedActivity.id,
      title: updatedActivity.title,
      shareToken: shareToken,
      shareUrl: `/community/activity/${shareToken}`,
      publishedAt: updatedActivity.publishedToCommunityAt?.toISOString(),
    }
  });
}
```

#### 1.2 取消發布活動

**端點**: `DELETE /api/activities/{activityId}/publish-to-community`

**權限**: 需要登入，且必須是活動的擁有者

**響應**:
```typescript
{
  success: true,
  message: "活動已從社區移除"
}
```

#### 1.3 獲取社區活動列表

**端點**: `GET /api/community/activities`

**權限**: 公開（無需登入）

**查詢參數**:
```typescript
{
  page?: number;              // 頁碼（默認：1）
  limit?: number;             // 每頁數量（默認：30，最大：100）
  category?: string;          // 分類篩選
  tags?: string[];            // 標籤篩選（多個標籤用逗號分隔）
  search?: string;            // 搜尋關鍵字（搜尋標題和描述）
  sortBy?: 'latest' | 'popular' | 'trending' | 'featured';  // 排序方式
  authorId?: string;          // 作者篩選
}
```

**響應**:
```typescript
{
  success: true,
  activities: Array<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    tags: string[];
    gameType: string;
    author: {
      id: string;
      name: string;
      image: string | null;
    };
    stats: {
      views: number;
      likes: number;
      bookmarks: number;
      plays: number;
    };
    publishedAt: string;
    shareUrl: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**實現邏輯**:
```typescript
// app/api/community/activities/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 解析查詢參數
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
  const category = searchParams.get('category');
  const tags = searchParams.get('tags')?.split(',').filter(Boolean);
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'latest';
  const authorId = searchParams.get('authorId');

  // 構建查詢條件
  const where: any = {
    isPublicShared: true,
    publishedToCommunityAt: { not: null },
    deletedAt: null,
  };

  if (category) {
    where.communityCategory = category;
  }

  if (tags && tags.length > 0) {
    where.communityTags = { hasSome: tags };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { communityDescription: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (authorId) {
    where.userId = authorId;
  }

  // 構建排序條件
  let orderBy: any = {};
  switch (sortBy) {
    case 'popular':
      orderBy = { communityLikes: 'desc' };
      break;
    case 'trending':
      // 簡化的熱門算法：最近7天的瀏覽數 + 喜歡數
      // 實際應該使用更複雜的算法
      orderBy = [
        { communityViews: 'desc' },
        { communityLikes: 'desc' },
      ];
      break;
    case 'featured':
      orderBy = [
        { isFeatured: 'desc' },
        { featuredAt: 'desc' },
      ];
      break;
    case 'latest':
    default:
      orderBy = { publishedToCommunityAt: 'desc' };
  }

  // 查詢總數
  const total = await prisma.activity.count({ where });

  // 查詢活動
  const activities = await prisma.activity.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  });

  // 格式化響應
  return NextResponse.json({
    success: true,
    activities: activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.communityDescription || activity.description,
      thumbnailUrl: activity.communityThumbnail,
      category: activity.communityCategory,
      tags: activity.communityTags,
      gameType: activity.templateType,
      author: {
        id: activity.user.id,
        name: activity.user.name,
        image: activity.user.image,
      },
      stats: {
        views: activity.communityViews,
        likes: activity.communityLikes,
        bookmarks: activity.communityBookmarks,
        plays: activity.communityPlays,
      },
      publishedAt: activity.publishedToCommunityAt?.toISOString(),
      shareUrl: `/community/activity/${activity.shareToken}`,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  });
}
```


