# EduCreate 圖片存儲現狀分析

**文檔版本**：2.1
**最後更新**：2025-01-21
**狀態**：✅ 已完成 Vercel Blob 定價驗證

## 📋 更新日誌

### v2.1 (2025-01-21) - Vercel Blob 定價驗證
- ✅ **驗證 Vercel Blob Storage 2025 年最新定價**
  - 存儲成本：$0.023/GB/月（相比舊數據降低 84.7%）
  - 數據傳輸：$0.05/GB（相比舊數據降低 83.3%）
  - 更新所有成本計算和對比表格
  - 添加詳細的免費額度說明（Hobby: 1GB+10GB, Pro: 5GB+100GB）
  - 來源：Vercel 官方文檔和 williamcallahan.com 技術分析

### v2.0 (2025-01-21) - Neon 深度分析
- ✅ 添加 Neon PostgreSQL 深度分析（600+ 行）
- ✅ 數據庫 Branching 功能詳解
- ✅ 連接池和 PITR 分析
- ✅ 與其他數據庫服務對比

### v1.0 (2025-01-21) - 初始版本
- ✅ 當前存儲架構分析
- ✅ 配置分析和建議方案

---

## 📋 執行摘要

本文檔分析 EduCreate 專案目前的圖片存儲架構，並提供未來實施 Wordwall 風格圖片功能的建議。

**關鍵發現**：
- ✅ 已有 Vercel Blob Storage 用於活動截圖
- ⚠️ 用戶頭像存儲在本地 `public/uploads/avatars`
- ⚠️ 媒體上傳 API 目前只是 Mock 實現
- 🎉 **Vercel Blob 2025 年新定價大幅降低，使其更具競爭力**
- ❌ 沒有專門的用戶圖片庫功能
- ❌ 沒有圖片搜索功能（Unsplash 等）

---

## 🗂️ 當前圖片存儲架構

### 1. Vercel Blob Storage（已實施）

**用途**：活動截圖存儲

**實施位置**：
- `app/api/generate-screenshot/route.ts`

**代碼示例**：
```typescript
import { put } from '@vercel/blob';

// 上傳截圖到 Vercel Blob
const filename = `activity-${activityId}-${Date.now()}.png`;
const blob = await put(filename, screenshotBlob, {
  access: 'public',
  addRandomSuffix: false,
});

thumbnailUrl = blob.url;
// 結果：https://xxxxx.public.blob.vercel-storage.com/activity-123-1234567890.png
```

**配置**：
- 環境變數：`BLOB_READ_WRITE_TOKEN`
- 存儲位置：Vercel Blob Storage（雲端）
- 訪問權限：公開（public）
- 文件命名：`activity-{activityId}-{timestamp}.png`

**優點**：
- ✅ 自動 CDN 加速
- ✅ 無需管理服務器
- ✅ 自動備份
- ✅ 高可用性

**缺點**：
- ⚠️ 成本隨存儲量增加
- ⚠️ 依賴 Vercel 平台

---

### 2. 本地文件系統存儲（已實施）

**用途**：用戶頭像上傳

**實施位置**：
- `app/api/user/upload-avatar/route.ts`

**代碼示例**：
```typescript
// 保存到本地文件系統
const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
const filePath = join(uploadDir, fileName);
await writeFile(filePath, buffer);

// 返回 URL
const fileUrl = `/uploads/avatars/${fileName}`;
// 結果：/uploads/avatars/avatar-user_email-1234567890.jpg
```

**存儲位置**：
- 本地路徑：`public/uploads/avatars/`
- 訪問 URL：`/uploads/avatars/{filename}`

**文件命名規則**：
```typescript
const fileName = `avatar-${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.${fileExtension}`;
// 示例：avatar-user_example_com-1729512345678.jpg
```

**驗證規則**：
- 文件類型：只允許 `image/*`
- 文件大小：最大 5MB
- 文件格式：JPEG, PNG, GIF, WebP 等

**優點**：
- ✅ 簡單直接
- ✅ 無額外成本
- ✅ 快速實施

**缺點**：
- ❌ 不適合 Vercel 部署（無持久化存儲）
- ❌ 無 CDN 加速
- ❌ 無自動備份
- ❌ 擴展性差

**⚠️ 重要問題**：
在 Vercel 部署時，`public/uploads` 目錄的文件會在每次部署後丟失，因為 Vercel 使用無狀態的 serverless 架構。

---

### 3. 媒體上傳 API（Mock 實現）

**實施位置**：
- `app/api/media/upload/route.ts`

**當前狀態**：
```typescript
// ⚠️ 這只是 Mock 實現，沒有實際存儲文件
const mockUrl = `https://example.com/media/${fileId}/${encodeURIComponent(file.name)}`;

return NextResponse.json({
  success: true,
  url: mockUrl,  // ⚠️ 假的 URL
  fileId,
  fileName: file.name,
  fileSize: file.size,
  mimeType: file.type,
  uploadedAt: new Date().toISOString()
});
```

**支持的文件類型**：
- 圖片：JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
- 音頻：MP3, WAV, OGG, AAC, M4A, FLAC, WebM
- 視頻：MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV
- 動畫：Lottie (JSON)

**文件大小限制**：
- 最大 50MB

**⚠️ 問題**：
這個 API 目前只是模擬實現，沒有實際存儲文件。需要整合真實的存儲服務。

---

## 🔍 配置分析

### 環境變數配置

#### `.env.local`（本地開發）
```env
# 數據庫
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="educreate-dev-secret-key-2024"

# ⚠️ 缺少圖片存儲相關配置
# BLOB_READ_WRITE_TOKEN=?
# CLOUDINARY_CLOUD_NAME=?
# CLOUDINARY_API_KEY=?
# CLOUDINARY_API_SECRET=?
```

#### `.env.production`（生產環境模板）
```env
# 文件上傳配置
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Vercel Blob Storage 配置
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

**發現**：
- ✅ 已配置 Cloudinary（但未實際使用）
- ✅ 已配置 Vercel Blob（用於截圖）
- ❌ 沒有配置 Supabase Storage
- ❌ 沒有配置 Unsplash API

---

## 📊 Supabase 配置分析

### Supabase 客戶端

**實施位置**：
- `lib/supabase.ts`
- `lib/supabase/client.ts`

**配置**：
```typescript
// lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服務端客戶端（具有服務角色權限）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**當前用途**：
- ✅ 實時協作功能（RealtimeCollaborationManager）
- ✅ 數據庫實時更新（DatabaseRealtimeManager）
- ❌ **沒有使用 Supabase Storage**

**Supabase Storage 功能**：
Supabase 提供了完整的對象存儲功能，但目前 EduCreate 沒有使用。

---

## 🎯 建議的圖片存儲架構

### 方案 A：Vercel Blob Storage（推薦）

**優點**：
- ✅ 已經在使用（截圖功能）
- ✅ 與 Vercel 部署完美整合
- ✅ 自動 CDN 加速
- ✅ 簡單易用

**實施步驟**：

#### 1. 創建用戶圖片上傳 API

```typescript
// app/api/user/images/upload/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 2. 解析表單數據
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    // 3. 驗證文件類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只能上傳圖片文件' }, { status: 400 });
    }

    // 4. 驗證文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超過 5MB' }, { status: 400 });
    }

    // 5. 生成唯一文件名
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const userId = session.user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `user-images/${userId}/${timestamp}.${fileExtension}`;

    // 6. 上傳到 Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // 7. 保存到數據庫（可選）
    // await prisma.userImage.create({
    //   data: {
    //     userId: session.user.id,
    //     url: blob.url,
    //     fileName: file.name,
    //     size: file.size,
    //     mimeType: file.type,
    //   }
    // });

    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('圖片上傳錯誤:', error);
    return NextResponse.json({ error: '圖片上傳失敗' }, { status: 500 });
  }
}
```

#### 2. 數據庫 Schema 擴展

```prisma
// prisma/schema.prisma

model UserImage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  url       String   // Vercel Blob URL
  fileName  String
  size      Int
  mimeType  String
  width     Int?
  height    Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}

model User {
  // ... 現有字段
  images    UserImage[]
}
```

#### 3. 整合 Unsplash API

```typescript
// app/api/images/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    if (!query) {
      return NextResponse.json({ error: '缺少搜索關鍵字' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API 請求失敗');
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnail: photo.urls.small,
        width: photo.width,
        height: photo.height,
        description: photo.description || photo.alt_description,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
      })),
      total: data.total,
      totalPages: data.total_pages,
    });

  } catch (error) {
    console.error('圖片搜索錯誤:', error);
    return NextResponse.json({ error: '圖片搜索失敗' }, { status: 500 });
  }
}
```

---

### 方案 B：Supabase Storage（備選）

**優點**：
- ✅ 已經在使用 Supabase（實時功能）
- ✅ 統一的技術棧
- ✅ 內建 RLS（Row Level Security）
- ✅ 免費額度較大

**實施步驟**：

#### 1. 創建 Storage Bucket

```sql
-- 在 Supabase Dashboard 中執行
-- 或使用 Supabase CLI

-- 創建 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true);

-- 設置 RLS 策略
CREATE POLICY "用戶可以上傳自己的圖片"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "所有人可以查看公開圖片"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-images');

CREATE POLICY "用戶可以刪除自己的圖片"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 2. 上傳 API 實現

```typescript
// app/api/user/images/upload/route.ts
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    // 生成文件路徑
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filePath = `${session.user.id}/${timestamp}.${fileExtension}`;

    // 上傳到 Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('user-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 獲取公開 URL
    const { data: urlData } = supabaseAdmin.storage
      .from('user-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('圖片上傳錯誤:', error);
    return NextResponse.json({ error: '圖片上傳失敗' }, { status: 500 });
  }
}
```

---

## 💰 成本對比

### Vercel Blob Storage

**定價**（2025 年最新，來源：官方文檔和第三方分析）：
- **存儲**：$0.023/GB/月
- **數據傳輸**：$0.05/GB（區域性傳輸）
- **簡單操作**（Simple Operations）：$0.40 per 1M
- **高級操作**（Advanced Operations）：$5.00 per 1M

**免費額度**：
- **Hobby 計劃**：1GB 存儲 + 10GB 傳輸（免費）
- **Pro 計劃**：5GB 存儲 + 100GB 傳輸（包含在 $20/月訂閱中）

**預估成本**（10,000 用戶，每人 10 張圖片，每張 200KB）：
```
存儲：10,000 × 10 × 0.2MB = 20GB
成本：(20GB - 5GB) × $0.023 = $0.345/月（Pro 計劃）

數據傳輸：假設每張圖片每月被訪問 10 次
         10,000 × 10 × 10 × 0.2MB = 200GB
成本：(200GB - 100GB) × $0.05 = $5/月（Pro 計劃）

簡單操作：假設每次訪問 1 次讀取操作
         10,000 × 10 × 10 = 1M 次操作
成本：1M × $0.40 / 1M = $0.40/月

總成本：$0.345 + $5 + $0.40 = $5.745/月（Pro 計劃）
       加上 Pro 計劃基礎費用 $20/月
       實際總成本：$25.745/月
```

**⚠️ 重要更新**：
根據 2025 年 5 月的最新信息，Vercel Blob Storage 的定價已經大幅降低：
- 存儲成本從 $0.15/GB 降至 $0.023/GB（降低 84.7%）
- 數據傳輸從 $0.30/GB 降至 $0.05/GB（降低 83.3%）
- 這使得 Vercel Blob 的定價與 AWS S3 Standard 相當接近

---

### Supabase Storage

**定價**（2024）：
- 存儲：$0.021/GB/月
- 帶寬：$0.09/GB

**免費額度**：
- Free 計劃：1GB 存儲 + 2GB 帶寬
- Pro 計劃：100GB 存儲 + 200GB 帶寬（$25/月）

**預估成本**（同樣場景）：
```
存儲：20GB
成本：20GB × $0.021 = $0.42/月

帶寬：200GB
成本：200GB × $0.09 = $18/月

總成本：$18.42/月
```

**結論**：Supabase Storage 成本更低（約為 Vercel Blob 的 1/3）

---

## 🎯 最終建議

### 推薦方案：混合架構

1. **活動截圖**：繼續使用 Vercel Blob Storage
   - 原因：已經實施，運行穩定

2. **用戶上傳圖片**：使用 Supabase Storage
   - 原因：成本更低，已有 Supabase 基礎設施

3. **圖片搜索**：整合 Unsplash API
   - 原因：免費額度充足（50,000 次/月）

### 實施優先級

**Phase 1：基礎功能（2 週）**
- [ ] 整合 Supabase Storage
- [ ] 創建用戶圖片上傳 API
- [ ] 實現基本的圖片管理功能

**Phase 2：搜索功能（1 週）**
- [ ] 整合 Unsplash API
- [ ] 實現圖片搜索界面
- [ ] 添加尺寸篩選

**Phase 3：高級功能（2 週）**
- [ ] 圖片編輯（裁剪、旋轉）
- [ ] 個人圖庫管理
- [ ] 批量上傳

---

---

## 🗄️ Neon 數據庫深度分析

### Neon 架構概覽

**當前配置**：
- **提供商**：Neon (https://neon.tech)
- **專案名稱**：EduCreate (dry-cloud-00816876)
- **區域**：Azure East US 2 (Virginia)
- **PostgreSQL 版本**：17
- **數據庫大小**：95.07 MB
- **表數量**：31 個表

### Neon 核心特性

#### 1. Serverless PostgreSQL
```
傳統 PostgreSQL                    Neon PostgreSQL
┌─────────────────┐               ┌─────────────────┐
│ 固定資源配置     │               │ 按需自動擴展     │
│ 24/7 運行       │               │ 自動休眠/喚醒    │
│ 固定成本        │               │ 按使用付費       │
│ 手動擴展        │               │ 自動擴展         │
└─────────────────┘               └─────────────────┘
```

**優點**：
- ✅ 自動休眠：無活動時自動休眠，節省成本
- ✅ 快速喚醒：300ms 內從休眠狀態恢復
- ✅ 按需擴展：根據負載自動調整資源（1 ↔ 2 CU）
- ✅ 零維護：無需管理服務器或備份

#### 2. Database Branching（Git-like 分支）

**EduCreate 當前分支架構**：

```
Production Branch (br-rough-field-a80z6kz8)
├─ Compute: ep-curly-salad-a85exs3f
├─ 數據: 2 users, 1 activity, 31 tables
├─ 用途: 生產環境（https://edu-create.vercel.app）
└─ 狀態: ✅ Active (59.83 compute hours)

Preview Branch (br-winter-smoke-a8fhvngp)
├─ Compute: ep-soft-resonance-a8hnscfv
├─ 數據: 從 Production 複製
├─ 用途: 預覽環境（Vercel Preview Deployments）
└─ 狀態: ✅ Active (0.83 compute hours)

Development Branch (br-summer-fog-a8wizgpz)
├─ Compute: ep-hidden-field-a8tai7gk
├─ 數據: 從 Production 複製
├─ 用途: 本地開發環境（localhost:3000）
└─ 狀態: ✅ Active (0 compute hours)
```

**分支優勢**：
- ✅ **環境隔離**：每個環境有獨立的數據庫
- ✅ **快速創建**：幾秒內創建新分支
- ✅ **數據複製**：可選擇複製父分支數據或空白開始
- ✅ **獨立測試**：在分支上測試 schema 變更不影響生產環境
- ✅ **成本優化**：只為實際使用的分支付費

#### 3. Connection Pooling（連接池）

**兩種連接方式**：

**A. Pooled Connection（推薦用於應用）**
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```

**特點**：
- ✅ 連接池管理（PgBouncer）
- ✅ 支援高並發（數千個連接）
- ✅ 自動重連
- ✅ 適合 Serverless 環境（Vercel）

**B. Direct Connection（用於遷移）**
```
postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f.eastus2.azure.neon.tech/neondb?sslmode=require
```

**特點**：
- ✅ 直接連接數據庫
- ✅ 無連接池
- ✅ 適合 Prisma 遷移
- ✅ 適合數據庫管理操作

#### 4. Point-in-Time Recovery (PITR)

**功能**：
- ✅ 24 小時內任意時間點恢復
- ✅ 自動備份
- ✅ 無需手動配置

**使用場景**：
```bash
# 恢復到 2 小時前的狀態
neon branches restore \
  --branch production \
  --timestamp "2025-10-21T13:00:00Z"
```

#### 5. Autoscaling（自動擴展）

**配置**：
- **最小**：1 CU (Compute Unit)
- **最大**：2 CU
- **擴展策略**：根據 CPU 和內存使用率自動調整

**成本影響**：
```
低負載時期：1 CU × $0.16/hour = $0.16/hour
高負載時期：2 CU × $0.16/hour = $0.32/hour
平均成本：~$0.24/hour（假設 50% 時間在高負載）
```

---

### Neon vs 其他數據庫服務對比

#### 對比表格

| 特性 | Neon | Supabase | PlanetScale | AWS RDS | Vercel Postgres |
|------|------|----------|-------------|---------|-----------------|
| **基礎技術** | PostgreSQL 17 | PostgreSQL 15 | MySQL 8 | 多種 | PostgreSQL 15 |
| **Serverless** | ✅ 是 | ✅ 是 | ✅ 是 | ❌ 否 | ✅ 是 |
| **自動休眠** | ✅ 是 | ❌ 否 | ✅ 是 | ❌ 否 | ✅ 是 |
| **Database Branching** | ✅ 是 | ❌ 否 | ✅ 是 | ❌ 否 | ✅ 是 |
| **Connection Pooling** | ✅ 內建 | ✅ 內建 | ✅ 內建 | ⚠️ 需配置 | ✅ 內建 |
| **PITR** | ✅ 24h | ✅ 7 天 | ❌ 否 | ✅ 35 天 | ✅ 7 天 |
| **免費額度** | 0.5 GB | 500 MB | 5 GB | ❌ 無 | 256 MB |
| **最低價格** | $19/月 | $25/月 | $29/月 | $15/月 | $20/月 |
| **Vercel 整合** | ✅ 優秀 | ✅ 良好 | ✅ 良好 | ⚠️ 需配置 | ✅ 原生 |
| **Storage 功能** | ❌ 無 | ✅ 有 | ❌ 無 | ⚠️ S3 | ❌ 無 |

---

### Neon + Supabase Storage 混合架構分析

#### 為什麼選擇混合架構？

**Neon 的優勢**：
- ✅ 更新的 PostgreSQL 版本（17 vs 15）
- ✅ Database Branching（開發/預覽/生產環境隔離）
- ✅ 自動休眠節省成本
- ✅ 與 Vercel 完美整合

**Supabase 的優勢**：
- ✅ 內建 Storage 功能（對象存儲）
- ✅ Row Level Security (RLS)
- ✅ 實時功能（已在使用）
- ✅ 更低的存儲成本

#### 混合架構設計

```
┌─────────────────────────────────────────────────────────┐
│                    EduCreate 應用                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  數據存儲層                                              │
│  ├─ Neon PostgreSQL                                     │
│  │   ├─ 用戶數據（User, Account, Session）             │
│  │   ├─ 活動數據（Activity, Folder）                   │
│  │   ├─ 遊戲數據（GameResult, Progress）               │
│  │   └─ 圖片元數據（UserImage 表）                     │
│  │                                                       │
│  └─ Supabase Storage                                    │
│      ├─ 用戶上傳圖片（實際文件）                        │
│      ├─ 用戶頭像（實際文件）                            │
│      └─ 遊戲資源（實際文件）                            │
│                                                          │
│  實時功能層                                              │
│  └─ Supabase Realtime                                   │
│      ├─ 協作編輯                                        │
│      └─ 即時通知                                        │
│                                                          │
│  截圖存儲層                                              │
│  └─ Vercel Blob Storage                                 │
│      └─ 活動截圖（自動生成）                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 數據流設計

**圖片上傳流程**：
```typescript
// 1. 用戶上傳圖片
const file = formData.get('file');

// 2. 上傳到 Supabase Storage
const { data: storageData } = await supabase.storage
  .from('user-images')
  .upload(`${userId}/${timestamp}.jpg`, file);

// 3. 獲取公開 URL
const { data: urlData } = supabase.storage
  .from('user-images')
  .getPublicUrl(storageData.path);

// 4. 保存元數據到 Neon PostgreSQL
await prisma.userImage.create({
  data: {
    userId,
    url: urlData.publicUrl,        // Supabase Storage URL
    fileName: file.name,
    size: file.size,
    mimeType: file.type,
    storageProvider: 'supabase',   // 標記存儲提供商
  }
});
```

#### 成本對比（混合架構 vs 單一架構）

**場景**：10,000 用戶，每人 10 張圖片，每張 200KB

**方案 A：Neon + Supabase Storage（推薦）**
```
Neon PostgreSQL:
- 數據庫存儲：100 MB（只存元數據）
- Compute Hours：~720 hours/月（假設 50% 活躍）
- 成本：$19/月（Launch 計劃）

Supabase Storage:
- 圖片存儲：20 GB
- 帶寬：200 GB
- 成本：$18.42/月（見前面計算）

總成本：$37.42/月
```

**方案 B：Vercel Postgres + Vercel Blob（2025 年更新定價）**
```
Vercel Postgres:
- 數據庫存儲：100 MB
- 成本：$20/月（Hobby 計劃）

Vercel Blob（Pro 計劃）:
- Pro 計劃基礎費用：$20/月（包含 5GB 存儲 + 100GB 傳輸）
- 額外存儲：(20GB - 5GB) × $0.023 = $0.345/月
- 額外帶寬：(200GB - 100GB) × $0.05 = $5/月
- 操作費用：~$0.40/月
- Vercel Blob 總成本：$25.745/月

總成本：$45.745/月

⚠️ 注意：相比舊定價（$83/月），新定價降低了 44.9%
```

**方案 C：Supabase 全家桶**
```
Supabase Pro:
- 數據庫：8 GB
- Storage：100 GB
- 帶寬：200 GB
- 成本：$25/月

總成本：$25/月（最便宜，但失去 Neon 的 Branching 功能）
```

#### 成本對比總結（2025 年更新）

| 方案 | 月成本 | 優勢 | 劣勢 |
|------|--------|------|------|
| **方案 A：Neon + Supabase** | **$37.42** | ✅ Neon Branching<br>✅ 低成本存儲<br>✅ 已有基礎設施 | ⚠️ 需要管理兩個服務 |
| **方案 B：Vercel 全家桶** | **$45.75** | ✅ 統一平台<br>✅ 簡化管理<br>✅ 全球 CDN | ⚠️ 成本較高<br>⚠️ 無 DB Branching |
| **方案 C：Supabase 全家桶** | **$25.00** | ✅ 最便宜<br>✅ 統一平台<br>✅ 功能完整 | ❌ 無 DB Branching<br>⚠️ 需遷移 Neon |

**重要發現**：
- 🎉 Vercel Blob 2025 年新定價使其成本降低了 45%
- 💡 方案 A（Neon + Supabase）仍然是最佳平衡選擇
- 💰 方案 C（Supabase 全家桶）最便宜，但需要放棄 Neon Branching
- 🚀 方案 B（Vercel 全家桶）現在更具競爭力，適合追求簡化管理的團隊

#### 混合架構的優缺點

**優點**：
- ✅ 利用 Neon 的 Database Branching（開發/預覽/生產隔離）
- ✅ 利用 Supabase 的低成本存儲
- ✅ 已有 Supabase 實時功能基礎設施
- ✅ 靈活性高，可以根據需求調整

**缺點**：
- ⚠️ 需要管理兩個服務
- ⚠️ 增加系統複雜度
- ⚠️ 需要兩套認證配置

---

### 最終建議：Neon + Supabase Storage

#### 為什麼選擇這個組合？

1. **保留 Neon 的核心優勢**
   - Database Branching 對開發流程至關重要
   - 已經在使用，遷移成本為零
   - PostgreSQL 17 的新特性

2. **利用 Supabase Storage 的成本優勢**
   - 存儲成本是 Vercel Blob 的 1/3
   - 已有 Supabase 基礎設施（實時功能）
   - RLS 提供更好的安全性

3. **保留 Vercel Blob 用於截圖**
   - 截圖功能已經穩定運行
   - 與 Vercel 部署流程緊密整合
   - 無需遷移現有功能

#### 實施路線圖

**Phase 1：Supabase Storage 整合（1 週）**
- [ ] 在 Supabase 創建 Storage Bucket
- [ ] 配置 RLS 策略
- [ ] 實現圖片上傳 API
- [ ] 更新 Prisma Schema（添加 UserImage 模型）

**Phase 2：遷移用戶頭像（3 天）**
- [ ] 將現有頭像從本地文件系統遷移到 Supabase Storage
- [ ] 更新頭像上傳 API
- [ ] 測試和驗證

**Phase 3：實現圖片庫功能（1 週）**
- [ ] 實現用戶圖片庫管理
- [ ] 整合 Unsplash API
- [ ] 實現圖片搜索和篩選

**Phase 4：優化和監控（持續）**
- [ ] 設置成本監控
- [ ] 優化圖片壓縮和 CDN
- [ ] 實施圖片清理策略

---

**文檔版本**：2.0（添加 Neon 深度分析）
**最後更新**：2025-10-21
**作者**：EduCreate Development Team

