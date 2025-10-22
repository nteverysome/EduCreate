# Phase 4: 前端組件開發 - 實施計劃

## 📋 概述

Phase 4 將創建三個主要的前端組件，用於圖片選擇、上傳和管理。

---

## 🎯 組件架構

### 1. ImagePicker 組件

**位置**: `components/ImagePicker.tsx`

**功能**:
- 三個標籤頁：搜索（Unsplash）、上傳、我的圖片庫
- 圖片預覽和選擇
- 尺寸篩選
- 標籤管理

**Props**:
```typescript
interface ImagePickerProps {
  onSelect: (image: UserImage) => void;
  onClose: () => void;
  multiple?: boolean;
  maxSelection?: number;
}
```

**狀態管理**:
```typescript
const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'library'>('search');
const [selectedImages, setSelectedImages] = useState<UserImage[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState<ImageFilters>({});
```

**API 調用**:
- `GET /api/unsplash/search` - 搜索 Unsplash 圖片
- `POST /api/images/upload` - 上傳圖片
- `GET /api/images/list` - 獲取用戶圖片庫
- `POST /api/unsplash/download` - 保存 Unsplash 圖片

---

### 2. ContentItemWithImage 組件

**位置**: `components/ContentItemWithImage.tsx`

**功能**:
- 圖片 + 文字輸入
- 圖片預覽
- 圖片編輯（裁剪、旋轉）
- 自動保存

**Props**:
```typescript
interface ContentItemWithImageProps {
  value: ContentItem;
  onChange: (value: ContentItem) => void;
  onRemove?: () => void;
}

interface ContentItem {
  id: string;
  imageId?: string;
  imageUrl?: string;
  text: string;
  position: number;
}
```

**狀態管理**:
```typescript
const [showImagePicker, setShowImagePicker] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [localValue, setLocalValue] = useState(value);
```

---

### 3. ImageGallery 組件

**位置**: `components/ImageGallery.tsx`

**功能**:
- 圖片網格顯示
- 標籤篩選
- 搜索功能
- 批量操作（刪除、標籤管理）

**Props**:
```typescript
interface ImageGalleryProps {
  onSelect?: (image: UserImage) => void;
  selectable?: boolean;
  multiple?: boolean;
}
```

**狀態管理**:
```typescript
const [images, setImages] = useState<UserImage[]>([]);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [filters, setFilters] = useState<ImageFilters>({});
const [page, setPage] = useState(1);
```

**API 調用**:
- `GET /api/images/list` - 獲取圖片列表
- `GET /api/images/stats` - 獲取統計信息
- `POST /api/images/batch-delete` - 批量刪除
- `PATCH /api/images/update` - 更新圖片信息

---

## 📁 文件結構

```
components/
├── ImagePicker/
│   ├── index.tsx                 # 主組件
│   ├── SearchTab.tsx             # Unsplash 搜索標籤
│   ├── UploadTab.tsx             # 上傳標籤
│   ├── LibraryTab.tsx            # 圖片庫標籤
│   ├── ImageGrid.tsx             # 圖片網格
│   ├── ImageCard.tsx             # 圖片卡片
│   └── FilterPanel.tsx           # 篩選面板
│
├── ContentItemWithImage/
│   ├── index.tsx                 # 主組件
│   ├── ImagePreview.tsx          # 圖片預覽
│   ├── ImageEditor.tsx           # 圖片編輯器
│   └── TextInput.tsx             # 文字輸入
│
├── ImageGallery/
│   ├── index.tsx                 # 主組件
│   ├── GalleryGrid.tsx           # 圖片網格
│   ├── GalleryCard.tsx           # 圖片卡片
│   ├── FilterBar.tsx             # 篩選欄
│   ├── SearchBar.tsx             # 搜索欄
│   └── BatchActions.tsx          # 批量操作
│
└── shared/
    ├── ImageUploader.tsx         # 圖片上傳器
    ├── ImageCropper.tsx          # 圖片裁剪器
    ├── TagInput.tsx              # 標籤輸入
    └── LoadingSpinner.tsx        # 加載動畫
```

---

## 🎨 UI/UX 設計

### ImagePicker 設計

**佈局**:
```
┌─────────────────────────────────────────┐
│  ImagePicker                      [X]   │
├─────────────────────────────────────────┤
│  [搜索] [上傳] [我的圖片庫]             │
├─────────────────────────────────────────┤
│  搜索欄: [___________] [篩選 ▼]        │
├─────────────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │              │
│  └───┘ └───┘ └───┘ └───┘              │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │
│  │ 5 │ │ 6 │ │ 7 │ │ 8 │              │
│  └───┘ └───┘ └───┘ └───┘              │
├─────────────────────────────────────────┤
│  已選擇: 2 張圖片    [取消] [確認]     │
└─────────────────────────────────────────┘
```

**響應式設計**:
- 桌面: 4 列網格
- 平板: 3 列網格
- 手機: 2 列網格

---

### ContentItemWithImage 設計

**佈局**:
```
┌─────────────────────────────────────────┐
│  ┌─────────────┐                        │
│  │             │  [選擇圖片]            │
│  │   圖片預覽   │  [編輯] [刪除]         │
│  │             │                        │
│  └─────────────┘                        │
│                                         │
│  文字內容:                              │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │  [輸入文字...]                  │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

### ImageGallery 設計

**佈局**:
```
┌─────────────────────────────────────────┐
│  我的圖片庫                             │
├─────────────────────────────────────────┤
│  [搜索...] [標籤 ▼] [來源 ▼] [排序 ▼] │
│  [批量操作 ▼]                           │
├─────────────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│  │☑1 │ │☑2 │ │ 3 │ │ 4 │ │ 5 │        │
│  └───┘ └───┘ └───┘ └───┘ └───┘        │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│  │ 6 │ │ 7 │ │ 8 │ │ 9 │ │10 │        │
│  └───┘ └───┘ └───┘ └───┘ └───┘        │
├─────────────────────────────────────────┤
│  已選擇: 2 張  [刪除] [添加標籤]       │
│  第 1 頁 / 共 10 頁  [<] [>]           │
└─────────────────────────────────────────┘
```

---

## 🔧 技術實現

### 使用的技術棧

- **React**: 組件開發
- **TypeScript**: 類型安全
- **Tailwind CSS**: 樣式
- **React Hook Form**: 表單管理
- **React Query**: 數據獲取和緩存
- **Zustand**: 狀態管理（可選）
- **react-dropzone**: 拖放上傳
- **react-image-crop**: 圖片裁剪

### 關鍵功能實現

#### 1. 圖片上傳

```typescript
const handleUpload = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  formData.append('tags', JSON.stringify(tags));

  const response = await fetch('/api/images/batch-upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  // 處理結果
};
```

#### 2. Unsplash 搜索

```typescript
const searchUnsplash = async (query: string, filters: ImageFilters) => {
  const params = new URLSearchParams({
    query,
    page: String(page),
    perPage: '20',
    ...filters,
  });

  const response = await fetch(`/api/unsplash/search?${params}`);
  const data = await response.json();
  return data.photos;
};
```

#### 3. 圖片選擇

```typescript
const handleImageSelect = (image: UserImage) => {
  if (multiple) {
    setSelectedImages(prev => 
      prev.includes(image)
        ? prev.filter(img => img.id !== image.id)
        : [...prev, image]
    );
  } else {
    onSelect(image);
    onClose();
  }
};
```

#### 4. 批量刪除

```typescript
const handleBatchDelete = async (imageIds: string[]) => {
  const response = await fetch('/api/images/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageIds }),
  });

  const result = await response.json();
  // 刷新圖片列表
  refetch();
};
```

---

## 📊 實施順序

### Week 1: ImagePicker 組件
- Day 1-2: 基礎結構和標籤頁
- Day 3-4: Unsplash 搜索標籤
- Day 5: 上傳標籤
- Day 6-7: 圖片庫標籤和整合

### Week 2: ContentItemWithImage 組件
- Day 1-2: 基礎結構和圖片預覽
- Day 3-4: 圖片編輯器（裁剪、旋轉）
- Day 5: 文字輸入和自動保存
- Day 6-7: 整合和測試

### Week 3: ImageGallery 組件和響應式設計
- Day 1-2: ImageGallery 基礎結構
- Day 3-4: 篩選和搜索功能
- Day 5: 批量操作
- Day 6-7: 響應式設計和優化

---

## 🧪 測試計劃

### 單元測試
- [ ] ImagePicker 組件測試
- [ ] ContentItemWithImage 組件測試
- [ ] ImageGallery 組件測試
- [ ] 工具函數測試

### 集成測試
- [ ] 圖片上傳流程測試
- [ ] Unsplash 搜索和下載測試
- [ ] 批量操作測試

### E2E 測試
- [ ] 完整的圖片選擇流程
- [ ] 完整的圖片管理流程
- [ ] 響應式設計測試

---

## 📖 下一步

完成 Phase 4 後，將進入：
- **Phase 5**: 高級功能（圖片編輯、拖放上傳等）
- **Phase 6**: 測試和優化（性能優化、可訪問性測試等）

