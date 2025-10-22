# Wordwall 圖片功能在 Vercel Blob + Neon 架構上的實施計畫

**文檔版本**：1.0
**創建日期**：2025-01-21
**目標架構**：Vercel Blob Storage + Neon PostgreSQL
**預估時間**：6-8 週
**預估成本**：$44.75/月（基礎） + 圖片存儲增量

---

## 📋 執行摘要

本文檔整合了兩次深度分析的成果，提供在 Vercel Blob + Neon 架構上實施 Wordwall 風格圖片功能的完整計畫。

### 整合的分析成果

#### 分析 1：Wordwall 圖片功能深度分析
- ✅ 圖片選擇器（ImagePicker）組件設計
- ✅ 圖片插入（ContentItemWithImage）組件設計
- ✅ 性能優化（Base64 vs URL 對比）
- ✅ 安全性考慮（XSS 防護、圖片驗證）
- ✅ 可訪問性（WCAG 標準）
- ✅ 數據持久化（自動保存、版本控制）
- ✅ 測試策略（單元測試、E2E 測試）

#### 分析 2：EduCreate 圖片存儲現狀分析
- ✅ 當前架構評估（Vercel Blob、本地 FS、Mock API）
- ✅ 成本對比（Vercel Blob vs Supabase Storage）
- ✅ 配置分析（Supabase、Cloudinary、Unsplash）
- ✅ 實施建議（混合架構）

### 選定架構：Vercel Blob + Neon

**核心優勢**：
- ✅ 保留 Neon Database Branching（開發效率）
- ✅ 統一圖片存儲到 Vercel Blob（簡化管理）
- ✅ 全球 CDN 加速（性能優化）
- ✅ 與 Vercel 部署深度整合（開發體驗）
- ✅ 2025 新定價降低成本（經濟性）

---

## 🎯 功能目標

### 核心功能（基於 Wordwall 分析）

1. **圖片選擇器（ImagePicker）**
   - 🔍 Unsplash 圖片搜索
   - 📏 尺寸篩選（All/Small/Medium/Large）
   - 📤 本地圖片上傳
   - 🖼️ 個人圖片庫管理

2. **圖片插入（ContentItemWithImage）**
   - 🖼️ 圖片 + 文字混合輸入
   - 🎨 圖片預覽和編輯
   - 🗑️ 圖片刪除功能
   - 💾 自動保存

3. **圖片管理**
   - 📁 用戶個人圖片庫
   - 🏷️ 圖片標籤和分類
   - 🔄 圖片版本控制
   - 📊 使用統計

4. **性能優化**
   - ⚡ 圖片壓縮和優化
   - 🌐 CDN 緩存策略
   - 📦 懶加載和預加載
   - 📈 性能監控

5. **安全性**
   - 🔒 XSS 防護
   - ✅ 圖片驗證（類型、大小、內容）
   - 🛡️ CORS 處理
   - 🔐 用戶權限控制

6. **可訪問性**
   - ⌨️ 鍵盤導航
   - 📢 屏幕閱讀器支持
   - 🎨 高對比度模式
   - 🔍 焦點指示器

---

## 📊 架構設計

### 整體架構圖

```
┌─────────────────────────────────────────────────────────┐
│                  EduCreate Next.js App                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           前端組件層                              │  │
│  │  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ ImagePicker    │  │ ContentItemWithImage   │  │  │
│  │  │ - 搜索         │  │ - 圖片 + 文字輸入      │  │  │
│  │  │ - 尺寸篩選     │  │ - 預覽和編輯           │  │  │
│  │  │ - 上傳         │  │ - 自動保存             │  │  │
│  │  └────────────────┘  └────────────────────────┘  │  │
│  │                                                    │  │
│  │  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ ImageGallery   │  │ ImageEditor            │  │  │
│  │  │ - 個人圖片庫   │  │ - 裁剪、旋轉           │  │  │
│  │  │ - 標籤管理     │  │ - 濾鏡效果             │  │  │
│  │  └────────────────┘  └────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           API 路由層                              │  │
│  │  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ /api/images/   │  │ /api/unsplash/         │  │  │
│  │  │ - upload       │  │ - search               │  │  │
│  │  │ - list         │  │ - download             │  │  │
│  │  │ - delete       │  │                        │  │  │
│  │  └────────────────┘  └────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           數據層                                  │  │
│  │  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ Neon           │  │ Vercel Blob            │  │  │
│  │  │ PostgreSQL     │  │ Storage                │  │  │
│  │  │ ├─ users       │  │ ├─ avatars/            │  │  │
│  │  │ ├─ images      │  │ ├─ screenshots/        │  │  │
│  │  │ ├─ activities  │  │ ├─ user-uploads/       │  │  │
│  │  │ └─ tags        │  │ └─ activity-images/    │  │  │
│  │  └────────────────┘  └────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           外部服務                                │  │
│  │  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ Unsplash API   │  │ Vercel CDN             │  │  │
│  │  │ - 圖片搜索     │  │ - 全球加速             │  │  │
│  │  │ - 免費額度     │  │ - 自動緩存             │  │  │
│  │  └────────────────┘  └────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 數據模型設計

#### Prisma Schema 擴展

```prisma
// prisma/schema.prisma

// 用戶圖片表
model UserImage {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 圖片信息
  url         String   // Vercel Blob URL
  blobPath    String   // Blob 存儲路徑
  fileName    String   // 原始文件名
  fileSize    Int      // 文件大小（bytes）
  mimeType    String   // MIME 類型
  width       Int?     // 圖片寬度
  height      Int?     // 圖片高度

  // 元數據
  source      String   @default("upload") // upload | unsplash
  sourceId    String?  // Unsplash 圖片 ID（如果來自 Unsplash）
  alt         String?  // 替代文字（可訪問性）
  tags        String[] // 標籤

  // 使用統計
  usageCount  Int      @default(0) // 使用次數
  lastUsedAt  DateTime? // 最後使用時間

  // 時間戳
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 關聯
  activities  ActivityImage[]

  @@index([userId])
  @@index([source])
  @@index([createdAt])
}

// 活動圖片關聯表
model ActivityImage {
  id          String   @id @default(cuid())
  activityId  String
  activity    Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  imageId     String
  image       UserImage @relation(fields: [imageId], references: [id], onDelete: Cascade)

  // 圖片在活動中的位置
  position    Int      // 圖片順序
  context     String?  // 圖片上下文（例如：問題文字）

  createdAt   DateTime @default(now())

  @@unique([activityId, imageId, position])
  @@index([activityId])
  @@index([imageId])
}

// 圖片標籤表
model ImageTag {
  id        String   @id @default(cuid())
  name      String   @unique
  userId    String?  // null 表示系統標籤
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
}

// 擴展 User 模型
model User {
  // ... 現有欄位
  images    UserImage[]
  imageTags ImageTag[]
}

// 擴展 Activity 模型
model Activity {
  // ... 現有欄位
  images    ActivityImage[]
}
```

---

## 🗓️ 實施時間表（6-8 週）

### Phase 1：基礎設施準備（1 週）

**目標**：準備數據庫、存儲和 API 基礎

#### 任務清單

- [ ] **1.1 數據庫 Schema 更新**
  - 創建 UserImage、ActivityImage、ImageTag 模型
  - 運行 Prisma 遷移
  - 驗證數據庫結構

- [ ] **1.2 Vercel Blob 配置**
  - 確認 Vercel Blob 配置
  - 創建存儲目錄結構
  - 設置成本警報

- [ ] **1.3 Unsplash API 整合**
  - 註冊 Unsplash 開發者賬號
  - 獲取 API 密鑰
  - 配置環境變量

- [ ] **1.4 基礎 API 路由**
  - 創建 `/api/images/upload`
  - 創建 `/api/images/list`
  - 創建 `/api/unsplash/search`

**預估時間**：1 週
**負責人**：後端開發
**風險**：低

---

### Phase 2：圖片上傳功能（1-2 週）

**目標**：實現完整的圖片上傳和管理功能

#### 任務清單

- [ ] **2.1 圖片上傳 API**
  - 實現文件驗證（類型、大小、尺寸）
  - 實現圖片壓縮和優化
  - 上傳到 Vercel Blob
  - 保存元數據到數據庫

- [ ] **2.2 圖片列表 API**
  - 實現分頁查詢
  - 實現標籤篩選
  - 實現搜索功能

- [ ] **2.3 圖片刪除 API**
  - 實現權限檢查
  - 刪除 Vercel Blob 文件
  - 刪除數據庫記錄

- [ ] **2.4 測試**
  - 單元測試（API 路由）
  - 集成測試（上傳流程）

**預估時間**：1-2 週
**負責人**：後端開發
**風險**：低

#### 實現範例：圖片上傳 API

```typescript


---

## 📝 詳細代碼實現

### 1. ImagePicker 組件（完整實現）

```typescript
// components/images/ImagePicker.tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, Upload, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImagePickerProps {
  onSelect: (image: { url: string; alt?: string; source: 'upload' | 'unsplash' }) => void;
  onClose: () => void;
}

type Tab = 'search' | 'upload' | 'gallery';
type SizeFilter = 'all' | 'small' | 'medium' | 'large';

export function ImagePicker({ onSelect, onClose }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Unsplash 搜索
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        page: '1',
        perPage: '20',
      });

      if (sizeFilter !== 'all') {
        const orientationMap = {
          small: 'portrait',
          medium: 'squarish',
          large: 'landscape',
        };
        params.append('orientation', orientationMap[sizeFilter]);
      }

      const response = await fetch(`/api/unsplash/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sizeFilter]);

  // 文件上傳
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onSelect({
          url: data.image.url,
          alt: data.image.fileName,
          source: 'upload',
        });
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  }, [onSelect, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  // 加載用戶圖片庫
  const loadUserImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images/list');
      const data = await response.json();

      if (data.success) {
        setUserImages(data.images);
      }
    } catch (error) {
      console.error('Load images error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 選擇 Unsplash 圖片
  const handleSelectUnsplash = async (photo: any) => {
    try {
      // 觸發 Unsplash 下載統計
      await fetch('/api/unsplash/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadUrl: photo.downloadUrl }),
      });

      onSelect({
        url: photo.url,
        alt: photo.alt,
        source: 'unsplash',
      });
      onClose();
    } catch (error) {
      console.error('Select error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">選擇圖片</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'search'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Search className="inline w-4 h-4 mr-2" />
            搜索圖片
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Upload className="inline w-4 h-4 mr-2" />
            上傳圖片
          </button>
          <button
            onClick={() => {
              setActiveTab('gallery');
              loadUserImages();
            }}
            className={`px-6 py-3 font-medium ${
              activeTab === 'gallery'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <ImageIcon className="inline w-4 h-4 mr-2" />
            我的圖片庫
          </button>
        </div>

        {/* Content */}
        <div className="p-4 h-96 overflow-y-auto">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索圖片..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  搜索
                </button>
              </div>

              {/* Size Filter */}
              <div className="flex gap-2 mb-4">
                {(['all', 'small', 'medium', 'large'] as SizeFilter[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSizeFilter(size)}
                    className={`px-4 py-2 rounded-lg ${
                      sizeFilter === size
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size === 'all' ? '全部' : size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>

              {/* Search Results */}
              <div className="grid grid-cols-3 gap-4">
                {searchResults.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handleSelectUnsplash(photo)}
                    className="cursor-pointer group relative aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? '放開以上傳' : '拖放圖片到這裡'}
              </p>
              <p className="text-sm text-gray-500">
                或點擊選擇文件（最大 10MB）
              </p>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-3 gap-4">
              {userImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => {
                    onSelect({
                      url: image.url,
                      alt: image.alt || image.fileName,
                      source: 'upload',
                    });
                    onClose();
                  }}
                  className="cursor-pointer group relative aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={image.url}
                    alt={image.alt || image.fileName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2. ContentItemWithImage 組件（完整實現）

```typescript
// components/images/ContentItemWithImage.tsx
'use client';

import { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { ImagePicker } from './ImagePicker';

interface ContentItemWithImageProps {
  value: {
    text: string;
    image?: {
      url: string;
      alt?: string;
      source: 'upload' | 'unsplash';
    };
  };
  onChange: (value: { text: string; image?: any }) => void;
  placeholder?: string;
}

export function ContentItemWithImage({
  value,
  onChange,
  placeholder = '輸入文字...',
}: ContentItemWithImageProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleTextChange = (text: string) => {
    onChange({ ...value, text });
  };

  const handleImageSelect = (image: any) => {
    onChange({ ...value, image });
  };

  const handleImageRemove = () => {
    onChange({ ...value, image: undefined });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Text Input */}
      <input
        type="text"
        value={value.text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Image Section */}
      {value.image ? (
        <div className="relative group">
          <img
            src={value.image.url}
            alt={value.image.alt || ''}
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleImageRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowImagePicker(true)}
          className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">點擊添加圖片</p>
        </button>
      )}

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}
```

### 3. 圖片列表 API（完整實現）

```typescript
// app/api/images/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const source = searchParams.get('source'); // upload | unsplash
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');

    // 構建查詢條件
    const where: any = {
      userId: session.user.id,
    };

    if (source) {
      where.source = source;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 查詢圖片
    const [images, total] = await Promise.all([
      prisma.userImage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          url: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          width: true,
          height: true,
          source: true,
          alt: true,
          tags: true,
          usageCount: true,
          createdAt: true,
        },
      }),
      prisma.userImage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      images,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('List images error:', error);
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    );
  }
}
```

### 4. Unsplash 下載 API（完整實現）

```typescript
// app/api/unsplash/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { downloadUrl } = await request.json();

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Download URL required' },
        { status: 400 }
      );
    }

    // 觸發 Unsplash 下載統計（必須調用以符合 API 使用條款）
    await fetch(downloadUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsplash download error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger download' },
      { status: 500 }
    );
  }
}
```

// app/api/images/upload/route.ts
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 獲取上傳的文件
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const tags = formData.get('tags') as string; // JSON 字符串

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 驗證文件類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 驗證文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // 讀取文件
    const buffer = Buffer.from(await file.arrayBuffer());

    // 使用 sharp 獲取圖片尺寸和優化
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // 壓縮圖片（如果大於 2000px，縮小到 2000px）
    let optimizedBuffer = buffer;
    if (metadata.width && metadata.width > 2000) {
      optimizedBuffer = await image
        .resize(2000, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // 上傳到 Vercel Blob
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`;
    const blobPath = `user-uploads/${session.user.id}/${fileName}`;

    const blob = await put(blobPath, optimizedBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    // 保存到數據庫
    const userImage = await prisma.userImage.create({
      data: {
        userId: session.user.id,
        url: blob.url,
        blobPath: blobPath,
        fileName: file.name,
        fileSize: optimizedBuffer.length,
        mimeType: file.type,
        width: metadata.width,
        height: metadata.height,
        source: 'upload',
        tags: tags ? JSON.parse(tags) : [],
      },
    });

    return NextResponse.json({
      success: true,
      image: userImage,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
```

---

### Phase 3：Unsplash 整合（1 週）

**目標**：實現 Unsplash 圖片搜索和下載功能

#### 任務清單

- [ ] **3.1 Unsplash 搜索 API**
  - 實現關鍵字搜索
  - 實現尺寸篩選
  - 實現分頁

- [ ] **3.2 Unsplash 下載 API**
  - 實現圖片下載（觸發 Unsplash 統計）
  - 保存到 Vercel Blob
  - 保存元數據到數據庫

- [ ] **3.3 測試**
  - 測試搜索功能
  - 測試下載功能
  - 測試免費額度監控

**預估時間**：1 週
**負責人**：後端開發
**風險**：低

#### 實現範例：Unsplash 搜索 API

```typescript
// app/api/unsplash/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const orientation = searchParams.get('orientation'); // landscape | portrait | squarish

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // 搜索圖片
    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation: orientation as any,
    });

    if (result.errors) {
      return NextResponse.json(
        { error: result.errors[0] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results: result.response.results.map((photo) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        width: photo.width,
        height: photo.height,
        alt: photo.alt_description,
        author: {
          name: photo.user.name,
          username: photo.user.username,
          link: photo.user.links.html,
        },
        downloadUrl: photo.links.download_location,
      })),
      total: result.response.total,
      totalPages: result.response.total_pages,
    });
  } catch (error) {
    console.error('Unsplash search error:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
```

---

### Phase 4：前端組件開發（2-3 週）

**目標**：實現 ImagePicker 和 ContentItemWithImage 組件

#### 任務清單

- [ ] **4.1 ImagePicker 組件**
  - 實現搜索界面
  - 實現尺寸篩選
  - 實現上傳功能
  - 實現個人圖片庫

- [ ] **4.2 ContentItemWithImage 組件**
  - 實現圖片 + 文字輸入
  - 實現圖片預覽
  - 實現圖片編輯（裁剪、旋轉）
  - 實現自動保存

- [ ] **4.3 ImageGallery 組件**
  - 實現圖片列表
  - 實現標籤管理
  - 實現搜索和篩選

- [ ] **4.4 響應式設計**
  - 桌面版本
  - 平板版本
  - 手機版本

**預估時間**：2-3 週
**負責人**：前端開發
**風險**：中

---

### Phase 5：高級功能（1-2 週）

**目標**：實現圖片編輯、批量上傳等高級功能

#### 任務清單

- [ ] **5.1 圖片編輯**
  - 裁剪功能
  - 旋轉功能
  - 濾鏡效果

- [ ] **5.2 批量上傳**
  - 多文件選擇
  - 上傳進度顯示
  - 錯誤處理

- [ ] **5.3 拖放上傳**
  - 拖放區域
  - 拖放預覽
  - 拖放驗證

- [ ] **5.4 自動保存和版本控制**
  - 自動保存機制
  - 版本歷史
  - 恢復功能

**預估時間**：1-2 週
**負責人**：全棧開發
**風險**：中

---

### Phase 6：測試和優化（1 週）

**目標**：全面測試和性能優化

#### 任務清單

- [ ] **6.1 單元測試**
  - API 路由測試
  - 組件測試
  - 工具函數測試

- [ ] **6.2 E2E 測試**
  - 圖片上傳流程
  - 圖片搜索流程
  - 圖片編輯流程

- [ ] **6.3 性能優化**
  - 圖片懶加載
  - CDN 緩存優化
  - 代碼分割

- [ ] **6.4 可訪問性測試**
  - 鍵盤導航測試
  - 屏幕閱讀器測試
  - 顏色對比度測試

**預估時間**：1 週
**負責人**：QA + 開發團隊
**風險**：低

---

## 💰 成本分析

### 基礎成本（Vercel Blob + Neon）

```
Neon PostgreSQL Launch: $19/月
Vercel Pro 計劃: $20/月（包含 5GB + 100GB）
Vercel Blob 基礎: $5.745/月
─────────────────────────────
基礎總計: $44.745/月
```

### 圖片功能增量成本（10,000 用戶場景）

**假設**：
- 每用戶平均上傳 20 張圖片
- 每張圖片平均 300KB（壓縮後）
- 每張圖片每月被訪問 15 次

**存儲成本**：
```
總存儲：10,000 × 20 × 0.3MB = 60GB
免費額度：5GB（Pro 計劃）
付費部分：55GB × $0.023 = $1.265/月
```

**帶寬成本**：
```
總帶寬：10,000 × 20 × 15 × 0.3MB = 900GB
免費額度：100GB（Pro 計劃）
付費部分：800GB × $0.05 = $40/月
```

**操作成本**：
```
讀取操作：10,000 × 20 × 15 = 3M 次
成本：3M × $0.40 / 1M = $1.20/月
```

**Unsplash API**：
```
免費額度：50,000 次/月
預估使用：~10,000 次/月
成本：$0/月（在免費額度內）
```

**圖片功能總增量成本**：
```
存儲：$1.265/月
帶寬：$40/月
操作：$1.20/月
Unsplash：$0/月
─────────────────────
增量總計：$42.465/月
```

**總成本**：
```
基礎成本：$44.745/月
圖片功能：$42.465/月
─────────────────────
總計：$87.21/月
```

### 成本優化建議

1. **圖片壓縮**
   - 使用 sharp 壓縮圖片
   - 目標：減少 30-50% 文件大小
   - 預估節省：$12-20/月

2. **CDN 緩存優化**
   - 設置長期緩存（1 年）
   - 減少重複請求
   - 預估節省：$10-15/月

3. **懶加載**
   - 只加載可見圖片
   - 減少不必要的帶寬
   - 預估節省：$5-10/月

**優化後預估成本**：
```
總成本：$87.21/月
優化節省：$27-45/月
─────────────────────
優化後：$42-60/月
```

---

## 🔧 技術實施細節

### 環境變量配置

```bash
# .env.local

# Neon Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Unsplash API
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"
UNSPLASH_SECRET_KEY="your_unsplash_secret_key"

# Supabase (Realtime)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### 文件結構

```
app/
├── api/
│   ├── images/
│   │   ├── upload/
│   │   │   └── route.ts          # 圖片上傳
│   │   ├── list/
│   │   │   └── route.ts          # 圖片列表
│   │   ├── [id]/
│   │   │   ├── route.ts          # 圖片詳情
│   │   │   └── delete/
│   │   │       └── route.ts      # 圖片刪除
│   │   └── tags/
│   │       └── route.ts          # 標籤管理
│   └── unsplash/
│       ├── search/
│       │   └── route.ts          # Unsplash 搜索
│       └── download/
│           └── route.ts          # Unsplash 下載

components/
├── images/
│   ├── ImagePicker.tsx           # 圖片選擇器
│   ├── ContentItemWithImage.tsx  # 圖片 + 文字輸入
│   ├── ImageGallery.tsx          # 圖片庫
│   ├── ImageEditor.tsx           # 圖片編輯器
│   ├── ImageUploader.tsx         # 圖片上傳器
│   └── ImagePreview.tsx          # 圖片預覽

lib/
├── images/
│   ├── upload.ts                 # 上傳工具
│   ├── optimize.ts               # 圖片優化
│   ├── validate.ts               # 圖片驗證
│   └── unsplash.ts               # Unsplash 客戶端

prisma/
└── schema.prisma                 # 數據模型
```

---

## ⚠️ 風險管理

### 主要風險

| 風險 | 影響 | 概率 | 緩解措施 |
|------|------|------|----------|
| 成本超支 | 高 | 中 | 成本監控 + 圖片壓縮 + CDN 優化 |
| 性能問題 | 中 | 中 | 懶加載 + 預加載 + CDN 緩存 |
| Unsplash 額度超限 | 中 | 低 | 監控使用量 + 備用方案 |
| 存儲空間不足 | 中 | 低 | 定期清理 + 用戶配額 |
| 安全漏洞 | 高 | 低 | 完整驗證 + XSS 防護 + CORS |

### 成本控制策略

1. **設置用戶配額**
   - 每用戶最多 100 張圖片
   - 單張圖片最大 10MB
   - 總存儲配額 30MB/用戶

2. **自動清理機制**
   - 刪除 90 天未使用的圖片
   - 刪除未關聯活動的圖片
   - 用戶確認後刪除

3. **成本警報**
   - 設置 Vercel 成本警報（$100/月）
   - 監控 Unsplash API 使用量
   - 每週成本報告

---

## ✅ 驗收標準

### 功能驗收

- [ ] 圖片上傳功能正常（本地上傳）
- [ ] 圖片搜索功能正常（Unsplash）
- [ ] 圖片選擇器正常工作
- [ ] 圖片 + 文字輸入正常
- [ ] 圖片編輯功能正常
- [ ] 個人圖片庫正常
- [ ] 標籤管理功能正常
- [ ] 自動保存功能正常

### 性能驗收

- [ ] 圖片上傳時間 < 3s（5MB 圖片）
- [ ] 圖片加載時間 < 500ms
- [ ] 搜索響應時間 < 1s
- [ ] CDN 緩存命中率 > 80%
- [ ] 首屏加載時間 < 2s

### 安全驗收

- [ ] XSS 防護測試通過
- [ ] 文件類型驗證通過
- [ ] 文件大小限制通過
- [ ] 用戶權限檢查通過
- [ ] CORS 配置正確

### 可訪問性驗收

- [ ] 鍵盤導航測試通過
- [ ] 屏幕閱讀器測試通過
- [ ] 顏色對比度測試通過（WCAG AA）
- [ ] 焦點指示器清晰可見

### 成本驗收

- [ ] 月成本 < $100
- [ ] 成本警報設置完成
- [ ] 使用量監控正常
- [ ] Unsplash API 在免費額度內

---

## 📚 參考資源

### 官方文檔
- [Vercel Blob 文檔](https://vercel.com/docs/storage/vercel-blob)
- [Neon 文檔](https://neon.tech/docs)
- [Unsplash API 文檔](https://unsplash.com/documentation)
- [Prisma 文檔](https://www.prisma.io/docs)

### 相關分析文檔
- [Wordwall 圖片功能深度分析](./wordwall-analysis-deep-dive.md)
- [EduCreate 圖片存儲現狀分析](./educreate-image-storage-analysis.md)
- [Vercel Blob + Neon 實施計畫](./vercel-blob-neon-implementation-plan.md)

### 工具和庫
- [sharp](https://sharp.pixelplumbing.com/) - 圖片處理
- [react-dropzone](https://react-dropzone.js.org/) - 拖放上傳
- [react-image-crop](https://www.npmjs.com/package/react-image-crop) - 圖片裁剪
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS 防護

---

**準備好開始了嗎？**

1. 閱讀完整實施計畫
2. 確認團隊資源（6-8 週）
3. 確認預算（$42-100/月）
4. 開始 Phase 1！

**預估完成時間：6-8 週** 🎉

