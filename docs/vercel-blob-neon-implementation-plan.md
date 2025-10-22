# Vercel Blob Storage + Neon PostgreSQL 實施計畫

**文檔版本**：1.0  
**創建日期**：2025-01-21  
**目標架構**：Vercel Blob Storage + Neon PostgreSQL  
**預估成本**：$44.75/月  
**預估時間**：3-5 天

---

## 📋 執行摘要

本文檔提供將 EduCreate 的圖片存儲統一到 Vercel Blob Storage 的實施計畫，同時保持使用 Neon PostgreSQL 數據庫。

### 架構選擇優勢

✅ **保留 Neon Branching**：繼續使用 Neon 的 Git-like 數據庫分支功能  
✅ **降低遷移風險**：無需遷移數據庫，只需遷移存儲  
✅ **成本優化**：利用 Vercel Blob 2025 新定價，總成本 $44.75/月  
✅ **工作量小**：只需 3-5 天即可完成  
✅ **已有基礎**：活動截圖已在使用 Vercel Blob

### 需要完成的工作

1. **遷移用戶頭像**：從本地文件系統遷移到 Vercel Blob
2. **實現媒體上傳 API**：將 mock 實現改為真實的 Vercel Blob 上傳
3. **更新前端組件**：確保所有圖片通過 CDN 加載
4. **清理舊代碼**：移除本地文件系統相關代碼

---

## 📊 當前架構 vs 目標架構

### 當前架構

```
┌─────────────────────────────────────────┐
│         Vercel Next.js App              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Neon         │  │ Vercel Blob     │ │
│  │ PostgreSQL   │  │ (活動截圖) ✅   │ │
│  │ (主數據庫)   │  │                 │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Local FS ❌  │  │ Supabase        │ │
│  │ (用戶頭像)   │  │ (Realtime)      │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

**問題**：
- ❌ 用戶頭像存儲在本地文件系統（不適合 serverless）
- ❌ 媒體上傳 API 只是 mock 實現
- ❌ 存儲位置不統一

### 目標架構

```
┌─────────────────────────────────────────┐
│         Vercel Next.js App              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Neon         │  │ Vercel Blob     │ │
│  │ PostgreSQL   │  │ Storage         │ │
│  │ (主數據庫)   │  │ ├─ 活動截圖     │ │
│  │ + Branching  │  │ ├─ 用戶頭像     │ │
│  │              │  │ └─ 其他媒體     │ │
│  └──────────────┘  │ + 全球 CDN      │ │
│                    └─────────────────┘ │
│  ┌─────────────────────────────────────┐│
│  │ Supabase Realtime (保留)           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**優勢**：
- ✅ 所有圖片統一存儲在 Vercel Blob
- ✅ 全球 CDN 加速
- ✅ 保留 Neon Branching 功能
- ✅ 適合 serverless 架構

---

## 🗓️ 實施時間表

### 階段 1：準備與評估（0.5 天）

**目標**：評估現有資源，準備遷移環境

#### 任務清單

- [ ] **1.1 評估現有資源**
  - 統計本地頭像文件數量和大小
  - 檢查 Vercel Blob 現有文件（活動截圖）
  - 確認 Vercel Blob 配置正確

- [ ] **1.2 成本確認**
  - 確認 Vercel Pro 計劃訂閱狀態
  - 計算預估存儲和帶寬成本
  - 設置 Vercel 成本警報

- [ ] **1.3 備份**
  - 備份本地頭像文件
  - 備份數據庫中的頭像 URL 記錄

**預估時間**：0.5 天  
**負責人**：開發團隊  
**風險**：低

---

### 階段 2：用戶頭像遷移（1-2 天）

**目標**：將所有用戶頭像從本地文件系統遷移到 Vercel Blob

#### 任務清單

- [ ] **2.1 編寫遷移腳本**
  - 創建 `scripts/migrate-avatars-to-blob.ts`
  - 實現批量上傳邏輯
  - 實現進度追蹤和錯誤處理

- [ ] **2.2 執行遷移**
  - 在測試環境執行遷移腳本
  - 驗證上傳成功
  - 在生產環境執行遷移

- [ ] **2.3 更新數據庫**
  - 批量更新用戶表中的 `image` 欄位
  - 將本地路徑替換為 Vercel Blob URL
  - 驗證所有 URL 有效

- [ ] **2.4 驗證**
  - 測試頭像顯示
  - 檢查 CDN 緩存
  - 確認所有用戶頭像可訪問

**預估時間**：1-2 天  
**負責人**：後端開發  
**風險**：低

#### 遷移腳本範例

```typescript
// scripts/migrate-avatars-to-blob.ts
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function migrateAvatars() {
  const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  
  // 檢查目錄是否存在
  if (!fs.existsSync(avatarDir)) {
    console.log('❌ Avatar directory not found');
    return;
  }

  const files = fs.readdirSync(avatarDir);
  console.log(`📊 Found ${files.length} avatar files`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(avatarDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      // 上傳到 Vercel Blob
      const blob = await put(`avatars/${file}`, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
      });

      // 從文件名提取用戶 ID（假設格式：userId-timestamp.jpg）
      const userId = file.split('-')[0];
      
      // 更新數據庫
      await prisma.user.update({
        where: { id: userId },
        data: { image: blob.url },
      });

      successCount++;
      console.log(`✅ [${successCount}/${files.length}] Migrated: ${file} → ${blob.url}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to migrate ${file}:`, error);
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${files.length}`);
}

migrateAvatars()
  .then(() => console.log('🎉 Migration completed'))
  .catch((error) => console.error('❌ Migration failed:', error))
  .finally(() => prisma.$disconnect());
```

---

### 階段 3：API 實現與更新（1-2 天）

**目標**：實現真實的媒體上傳 API，更新頭像上傳 API

#### 任務清單

- [ ] **3.1 更新頭像上傳 API**
  - 修改 `app/api/user/upload-avatar/route.ts`
  - 移除本地文件系統代碼
  - 使用 Vercel Blob 上傳
  - 添加錯誤處理和驗證

- [ ] **3.2 實現媒體上傳 API**
  - 修改 `app/api/media/upload/route.ts`
  - 實現真實的 Vercel Blob 上傳
  - 支持多種文件類型（圖片、視頻）
  - 添加文件大小和類型驗證

- [ ] **3.3 添加圖片處理功能**
  - 實現圖片壓縮（可選）
  - 實現縮略圖生成（可選）
  - 添加圖片元數據提取

- [ ] **3.4 測試 API**
  - 測試頭像上傳
  - 測試媒體上傳
  - 測試錯誤處理
  - 測試文件大小限制

**預估時間**：1-2 天  
**負責人**：全棧開發  
**風險**：低

#### API 實現範例

##### 更新後的頭像上傳 API

```typescript
// app/api/user/upload-avatar/route.ts
import { put, del } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 獲取上傳的文件
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 驗證文件類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 驗證文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // 獲取當前用戶的舊頭像 URL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // 上傳新頭像到 Vercel Blob
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`;
    const blob = await put(`avatars/${fileName}`, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // 更新數據庫
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
    });

    // 刪除舊頭像（如果存在且是 Vercel Blob URL）
    if (user?.image && user.image.includes('blob.vercel-storage.com')) {
      try {
        await del(user.image);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
        // 不影響主流程，繼續執行
      }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
```

##### 實現媒體上傳 API

```typescript
// app/api/media/upload/route.ts
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 獲取上傳的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'media';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 驗證文件類型
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 驗證文件大小（圖片最大 10MB，視頻最大 50MB）
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${maxSize / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // 上傳到 Vercel Blob
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`;
    const blob = await put(`${folder}/${fileName}`, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

---

### 階段 4：前端更新與測試（1 天）

**目標**：更新前端組件，確保所有圖片功能正常

#### 任務清單

- [ ] **4.1 更新頭像顯示組件**
  - 確保使用 CDN URL
  - 添加加載狀態
  - 添加錯誤處理（顯示默認頭像）

- [ ] **4.2 更新圖片上傳組件**
  - 測試新的上傳 API
  - 添加上傳進度顯示
  - 添加文件預覽功能

- [ ] **4.3 全面測試**
  - 測試用戶註冊（默認頭像）
  - 測試頭像上傳和更新
  - 測試活動截圖生成
  - 測試媒體上傳功能

- [ ] **4.4 性能優化**
  - 驗證 CDN 緩存效果
  - 測試圖片加載速度
  - 優化圖片顯示組件

**預估時間**：1 天  
**負責人**：前端開發  
**風險**：低

---

### 階段 5：清理與部署（0.5 天）

**目標**：清理舊代碼，部署到生產環境

#### 任務清單

- [ ] **5.1 清理舊代碼**
  - 移除本地文件系統相關代碼
  - 刪除 `public/uploads/avatars` 目錄
  - 更新 `.gitignore`

- [ ] **5.2 更新文檔**
  - 更新 API 文檔
  - 更新部署文檔
  - 更新架構圖

- [ ] **5.3 部署到生產**
  - 在測試環境最後驗證
  - 部署到生產環境
  - 監控錯誤日誌

- [ ] **5.4 驗證**
  - 測試所有圖片功能
  - 檢查成本使用情況
  - 確認 CDN 緩存正常

**預估時間**：0.5 天  
**負責人**：DevOps + 開發團隊  
**風險**：低

---

## 💰 成本分析

### 當前成本（Neon + 混合存儲）

```
Neon PostgreSQL Launch: $19/月
Vercel Blob (活動截圖): ~$5/月（估計）
本地文件系統: $0/月
─────────────────────────────
總計: ~$24/月
```

### 實施後成本（Neon + Vercel Blob 完整）

```
Neon PostgreSQL Launch: $19/月

Vercel Blob Storage（Pro 計劃）:
├─ Pro 計劃基礎費用: $20/月（包含 5GB + 100GB）
├─ 額外存儲: (20GB - 5GB) × $0.023 = $0.345/月
├─ 額外帶寬: (200GB - 100GB) × $0.05 = $5/月
└─ 操作費用: ~$0.40/月
Vercel Blob 總成本: $25.745/月

Supabase Realtime: $0/月（免費額度）
─────────────────────────────
總計: $44.745/月
```

### 成本對比

| 項目 | 當前成本 | 實施後成本 | 差異 |
|------|---------|-----------|------|
| 數據庫 | Neon $19/月 | Neon $19/月 | $0 |
| 存儲 | ~$5/月 | Vercel Blob $25.75/月 | +$20.75 |
| **總計** | **~$24/月** | **$44.75/月** | **+$20.75** |

**注意**：成本增加主要是因為：
1. 需要 Vercel Pro 計劃（$20/月）才能使用 Vercel Blob
2. 當前本地文件系統存儲成本為 $0，但不適合生產環境
3. 新架構提供全球 CDN 和更好的可靠性

---

## 🔧 技術實施細節

### 環境變量配置

```bash
# .env.local

# Neon Database（保持不變）
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Supabase Realtime（保持不變）
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### 文件結構

```
app/
├── api/
│   ├── user/
│   │   └── upload-avatar/
│   │       └── route.ts          # ✅ 更新：使用 Vercel Blob
│   ├── media/
│   │   └── upload/
│   │       └── route.ts          # ✅ 實現：真實上傳功能
│   └── generate-screenshot/
│       └── route.ts              # ✅ 已有：使用 Vercel Blob

scripts/
└── migrate-avatars-to-blob.ts    # ✅ 新增：遷移腳本

public/
└── uploads/
    └── avatars/                  # ❌ 刪除：遷移後移除
```

---

## ⚠️ 風險管理

### 主要風險

| 風險 | 影響 | 概率 | 緩解措施 |
|------|------|------|----------|
| 頭像遷移失敗 | 中 | 低 | 完整備份 + 測試環境驗證 |
| URL 更新錯誤 | 中 | 低 | 批量驗證 + 回滾計劃 |
| 成本超支 | 低 | 低 | 成本監控 + 警報設置 |
| API 錯誤 | 中 | 低 | 完整測試 + 錯誤處理 |

### 回滾計劃

如果遷移失敗：

1. **恢復頭像 URL**
   ```sql
   -- 恢復到本地路徑
   UPDATE users SET image = '/uploads/avatars/' || id || '.jpg'
   WHERE image LIKE '%blob.vercel-storage.com%';
   ```

2. **恢復舊 API 代碼**
   ```bash
   git revert <migration-commit>
   vercel --prod
   ```

3. **驗證服務恢復**
   - 測試頭像顯示
   - 檢查錯誤日誌

---

## ✅ 驗收標準

### 功能驗收

- [ ] 所有用戶頭像正常顯示
- [ ] 頭像上傳功能正常
- [ ] 活動截圖生成正常
- [ ] 媒體上傳功能正常
- [ ] 所有圖片通過 CDN 加載

### 性能驗收

- [ ] 圖片加載時間 < 500ms
- [ ] CDN 緩存命中率 > 80%
- [ ] API 響應時間 < 200ms

### 成本驗收

- [ ] 月成本 < $50
- [ ] 成本警報設置完成
- [ ] 使用量監控正常

---

## 📚 參考資源

- [Vercel Blob 文檔](https://vercel.com/docs/storage/vercel-blob)
- [Neon 文檔](https://neon.tech/docs)
- [成本分析文檔](./educreate-image-storage-analysis.md)

---

**準備好開始了嗎？**

1. 閱讀完整實施計畫
2. 確認團隊資源
3. 開始階段 1！

**預估完成時間：3-5 天** 🎉

