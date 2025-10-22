# Wordwall 圖片選擇器功能分析報告

## 📋 分析概述

本報告基於對 Wordwall (https://wordwall.net/create/entercontent?templateId=8) 圖片選擇功能的實際瀏覽器測試和分析。

**分析日期**：2025-10-21  
**分析工具**：Playwright Browser Automation  
**測試頁面**：Wordwall Spin the Wheel 模板編輯頁面

---

## 🎯 核心功能

### 1. 圖片搜索功能

#### 功能描述
- 提供搜索框，placeholder 為 "Search for images..."
- 用戶輸入關鍵字（如 "dog"）後按 Enter 或點擊搜索按鈕
- 搜索結果動態載入並以網格形式顯示

#### 測試結果
✅ **測試通過**：輸入 "dog" 後成功返回 100+ 張相關圖片

#### 技術實現推測
```typescript
// API 端點示例
GET /api/images/search?q=dog&size=medium&page=1

// 響應格式
{
  "results": [
    {
      "id": "image_123",
      "url": "https://...",
      "thumbnail": "https://...",
      "width": 800,
      "height": 600,
      "description": "A cute dog"
    }
  ],
  "total": 150,
  "page": 1
}
```

---

### 2. 尺寸篩選功能

#### 功能描述
- 提供下拉選單（combobox）包含 4 個選項：
  - **All**：所有尺寸
  - **Small**：小尺寸圖片
  - **Medium**：中等尺寸（默認選中）
  - **Large**：大尺寸圖片

#### 測試結果
✅ **測試通過**：
- Medium 模式：顯示 500px - 1000px 的圖片
- Large 模式：顯示 1000px 以上的圖片（測試顯示 1200×1197 到 6904×3883）

#### 尺寸分類標準（推測）
| 選項 | 尺寸範圍 | 用途 |
|------|---------|------|
| Small | < 500px | 圖標、小圖 |
| Medium | 500px - 1000px | 一般用途 |
| Large | > 1000px | 高清圖片 |
| All | 不限制 | 所有圖片 |

---

### 3. 圖片顯示功能

#### UI 設計
- **網格佈局**：響應式網格，自動調整列數
- **圖片卡片**：
  - 縮略圖顯示
  - 圖片尺寸標籤（寬 × 高）
  - 懸停效果（推測）
  - 點擊選擇

#### 顯示示例
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   [圖片]    │   [圖片]    │   [圖片]    │   [圖片]    │
│  710 × 430  │  863 × 625  │  800 × 600  │  740 × 448  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

### 4. 上傳功能

#### 功能描述
- 提供 "Upload" 按鈕
- 點擊後觸發文件選擇器
- 允許用戶上傳自己的圖片

#### 測試結果
✅ **測試通過**：點擊 Upload 按鈕成功觸發文件選擇器

#### 上傳流程（推測）
```
用戶點擊 Upload
    ↓
觸發文件選擇器
    ↓
用戶選擇圖片文件
    ↓
前端驗證（類型、大小）
    ↓
上傳到服務器
    ↓
服務器處理（調整大小、優化）
    ↓
保存到用戶圖庫
    ↓
返回圖片 URL
    ↓
顯示在 "My Images" 中
```

---

### 5. 個人圖庫功能

#### 功能描述
- 用戶上傳的圖片保存到個人圖庫
- 可以在後續使用中重複使用
- 每個用戶有獨立的圖片存儲空間

#### 存儲位置
- 用戶圖片 URL 格式：`//user.cdn.wordwall.net/profile-images/64/28122419/1`
- 使用 CDN 分發，提高載入速度

---

## 🏗️ 技術架構分析

### 前端技術棧
- **框架**：Saltarelle（C# to JavaScript 編譯器）
- **庫**：jQuery 1.10.2
- **CDN**：app.cdn.wordwall.net
- **特點**：代碼編譯和混淆，性能優化

### 後端推測
- **圖片來源**：
  - 可能整合第三方 API（Unsplash, Pixabay, Pexels）
  - 或自建圖片庫
- **存儲**：
  - 用戶上傳圖片存儲在 CDN
  - 使用用戶 ID 作為路徑分隔

### 數據流
```
前端 → API Gateway → 圖片搜索服務 → 第三方 API
                   ↓
                用戶圖庫服務 → CDN Storage
```

---

## 💡 為 EduCreate 專案的實現建議

### 推薦技術棧

#### 前端
- **框架**：React + TypeScript（現有技術棧）
- **UI 組件**：
  - shadcn/ui 或 Radix UI（模態框、下拉選單）
  - Tailwind CSS（樣式）
- **圖片處理**：
  - react-image-crop（如需裁剪功能）
  - sharp（服務端圖片處理）

#### 後端
- **API**：Next.js API Routes
- **存儲**：Supabase Storage 或 AWS S3
- **圖片搜索**：Unsplash API 或 Pexels API
- **數據庫**：Supabase PostgreSQL

---

### 數據庫設計

```sql
-- 用戶上傳圖片表
CREATE TABLE user_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_images_user_id ON user_images(user_id);
CREATE INDEX idx_user_images_created_at ON user_images(created_at DESC);

-- RLS 策略
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own images"
  ON user_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload images"
  ON user_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON user_images FOR DELETE
  USING (auth.uid() = user_id);
```

---

### API 實現

#### 1. 圖片搜索 API

```typescript
// app/api/images/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const size = searchParams.get('size') || 'medium';
  const page = parseInt(searchParams.get('page') || '1');

  try {
    // 調用 Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?` +
      `query=${encodeURIComponent(query)}&` +
      `page=${page}&` +
      `per_page=100`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    const data = await response.json();

    // 根據尺寸篩選
    const filtered = data.results.filter((img: any) => {
      const width = img.width;
      switch (size) {
        case 'small': return width < 500;
        case 'medium': return width >= 500 && width < 1000;
        case 'large': return width >= 1000;
        default: return true; // all
      }
    });

    // 格式化響應
    const images = filtered.map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      thumbnail: img.urls.small,
      width: img.width,
      height: img.height,
      description: img.description || img.alt_description,
      photographer: img.user.name,
      photographerUrl: img.user.links.html
    }));

    return NextResponse.json({
      images,
      total: filtered.length,
      page
    });
  } catch (error) {
    console.error('Image search failed:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
```

#### 2. 圖片上傳 API

```typescript
// app/api/images/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 獲取用戶 ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 獲取上傳的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // 驗證文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    // 讀取文件
    const buffer = Buffer.from(await file.arrayBuffer());

    // 使用 sharp 處理圖片
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // 生成縮略圖
    const thumbnail = await image
      .resize(300, 300, { fit: 'inside' })
      .toBuffer();

    // 生成文件名
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}_${file.name}`;
    const thumbnailName = `${user.id}/${timestamp}_thumb_${file.name}`;

    // 上傳原圖到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (uploadError) throw uploadError;

    // 上傳縮略圖
    await supabase.storage
      .from('user-images')
      .upload(thumbnailName, thumbnail, {
        contentType: file.type,
        cacheControl: '3600'
      });

    // 獲取公開 URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-images')
      .getPublicUrl(fileName);

    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('user-images')
      .getPublicUrl(thumbnailName);

    // 保存記錄到數據庫
    const { data: imageRecord, error: dbError } = await supabase
      .from('user_images')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        thumbnail_url: thumbnailUrl,
        width: metadata.width,
        height: metadata.height,
        file_size: file.size,
        file_name: file.name,
        mime_type: file.type
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      image: imageRecord
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
```

---

## 📦 完整的 React 組件實現

請參考下一個文件：`ImagePicker.tsx`

---

## 🎨 UI/UX 設計建議

### 模態框設計
- **尺寸**：最大寬度 1200px，最大高度 80vh
- **背景**：半透明黑色遮罩
- **動畫**：淡入淡出效果
- **響應式**：手機版本全屏顯示

### 控制欄設計
```
┌────────────────────────────────────────────────────────┐
│ [Search] [My Images]  [搜索框...]  [尺寸▼]  [🔍]  [📤 Upload] │
└────────────────────────────────────────────────────────┘
```

### 圖片網格
- **桌面版**：4 列
- **平板版**：3 列
- **手機版**：2 列
- **間距**：16px
- **圖片高度**：固定 200px，object-fit: cover

### 載入狀態
- 搜索時顯示骨架屏（Skeleton）
- 圖片載入時顯示模糊佔位符
- 上傳時顯示進度條

---

## ✅ 功能檢查清單

### 必須實現的功能
- [ ] 圖片搜索（關鍵字）
- [ ] 尺寸篩選（All/Small/Medium/Large）
- [ ] 圖片網格顯示
- [ ] 圖片選擇
- [ ] 圖片上傳
- [ ] 個人圖庫
- [ ] 響應式設計

### 可選功能
- [ ] 圖片裁剪
- [ ] 圖片編輯（濾鏡、調整）
- [ ] 批量上傳
- [ ] 拖放上傳
- [ ] 圖片分類/標籤
- [ ] 搜索歷史
- [ ] 收藏功能

---

## 🚀 實施步驟

### Phase 1：基礎功能（1-2 週）
1. 建立數據庫表結構
2. 實現圖片搜索 API（整合 Unsplash）
3. 實現基本的 ImagePicker 組件
4. 實現圖片網格顯示
5. 實現尺寸篩選功能

### Phase 2：上傳功能（1 週）
1. 設置 Supabase Storage
2. 實現圖片上傳 API
3. 實現縮略圖生成
4. 實現上傳進度顯示
5. 實現文件驗證

### Phase 3：個人圖庫（1 週）
1. 實現用戶圖片列表 API
2. 實現 "My Images" 標籤頁
3. 實現圖片刪除功能
4. 實現圖片管理功能

### Phase 4：優化和測試（1 週）
1. 性能優化（圖片懶加載）
2. 響應式設計優化
3. 錯誤處理和用戶反饋
4. 單元測試和 E2E 測試
5. 無障礙功能（a11y）

---

## 📊 性能優化建議

### 圖片優化
- 使用 WebP 格式（降低 30% 文件大小）
- 實現漸進式載入
- 使用 CDN 分發
- 實現圖片懶加載

### 搜索優化
- 實現搜索防抖（debounce）
- 緩存搜索結果
- 實現無限滾動或分頁

### 上傳優化
- 實現客戶端壓縮
- 顯示上傳進度
- 支持斷點續傳（可選）

---

## 🔒 安全考慮

### 文件驗證
- 驗證文件類型（MIME type）
- 驗證文件大小
- 驗證圖片尺寸
- 掃描惡意內容

### 存儲安全
- 使用 RLS（Row Level Security）
- 限制存儲配額
- 定期清理未使用的圖片
- 實現訪問控制

---

## 📝 總結

Wordwall 的圖片選擇器功能設計簡潔高效，提供了完整的圖片搜索、篩選、上傳和管理功能。對於 EduCreate 專案，我們可以：

1. ✅ 使用 React + TypeScript 實現類似的功能
2. ✅ 整合 Unsplash API 提供豐富的圖片資源
3. ✅ 使用 Supabase Storage 存儲用戶上傳的圖片
4. ✅ 實現響應式設計，支持各種設備
5. ✅ 提供良好的用戶體驗和性能

**預估開發時間**：4-5 週  
**技術難度**：中等  
**優先級**：高（核心功能）

---

**文檔版本**：1.0  
**最後更新**：2025-10-21  
**作者**：EduCreate Development Team

