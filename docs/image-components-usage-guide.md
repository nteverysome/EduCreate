# 圖片組件使用指南

## 📚 概述

本指南介紹如何在 EduCreate 項目中使用新的圖片管理組件。

---

## 🎯 可用組件

### 1. ImagePicker - 圖片選擇器
### 2. ContentItemWithImage - 內容項目編輯器
### 3. ImageGallery - 圖片庫管理器

---

## 📦 組件詳細說明

### 1. ImagePicker 組件

**位置**: `components/image-picker/index.tsx`

**用途**: 選擇圖片（Unsplash 搜索或上傳）

**功能**:
- 三個標籤頁：搜索、上傳、圖片庫
- 單選或多選模式
- 尺寸和顏色篩選
- 拖放上傳支持

**使用示例**:

```typescript
import { useState } from 'react';
import ImagePicker, { UserImage } from '@/components/image-picker';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<UserImage[]>([]);

  const handleImageSelect = (images: UserImage[]) => {
    setSelectedImages(images);
    console.log('Selected images:', images);
  };

  return (
    <div>
      <button onClick={() => setShowPicker(true)}>
        選擇圖片
      </button>

      {showPicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowPicker(false)}
          multiple={true}
          maxSelection={5}
        />
      )}

      {/* 顯示選中的圖片 */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {selectedImages.map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt={image.alt || image.fileName}
            className="w-full h-48 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}
```

**Props**:

```typescript
interface ImagePickerProps {
  onSelect: (images: UserImage[]) => void;  // 選擇回調
  onClose: () => void;                       // 關閉回調
  multiple?: boolean;                        // 是否多選（默認 false）
  maxSelection?: number;                     // 最大選擇數量（默認 10）
}
```

**UserImage 類型**:

```typescript
interface UserImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  alt?: string;
  tags: string[];
  source: 'upload' | 'unsplash';
  sourceId?: string;
  usageCount: number;
  createdAt: string;
  photographer?: {
    name: string;
    username: string;
    profileUrl: string;
  };
}
```

---

### 2. ContentItemWithImage 組件

**位置**: `components/content-item-with-image/index.tsx`

**用途**: 編輯包含圖片和文字的內容項目

**功能**:
- 圖片選擇和預覽
- 文字輸入
- 自動保存
- 字數統計

**使用示例**:

```typescript
import { useState } from 'react';
import ContentItemWithImage, { ContentItem } from '@/components/content-item-with-image';

function ActivityEditor() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      text: '',
      position: 0,
    },
  ]);

  const handleItemChange = (index: number, value: ContentItem) => {
    const newItems = [...contentItems];
    newItems[index] = value;
    setContentItems(newItems);
  };

  const handleItemRemove = (index: number) => {
    const newItems = contentItems.filter((_, i) => i !== index);
    setContentItems(newItems);
  };

  const handleAddItem = () => {
    setContentItems([
      ...contentItems,
      {
        id: Date.now().toString(),
        text: '',
        position: contentItems.length,
      },
    ]);
  };

  return (
    <div>
      <h2>活動內容編輯器</h2>

      {contentItems.map((item, index) => (
        <ContentItemWithImage
          key={item.id}
          value={item}
          onChange={(value) => handleItemChange(index, value)}
          onRemove={() => handleItemRemove(index)}
          autoSave={true}
          autoSaveDelay={1000}
        />
      ))}

      <button onClick={handleAddItem}>
        添加內容項目
      </button>
    </div>
  );
}
```

**Props**:

```typescript
interface ContentItemWithImageProps {
  value: ContentItem;                        // 內容項目數據
  onChange: (value: ContentItem) => void;    // 變更回調
  onRemove?: () => void;                     // 刪除回調
  autoSave?: boolean;                        // 是否自動保存（默認 true）
  autoSaveDelay?: number;                    // 自動保存延遲（默認 1000ms）
}
```

**ContentItem 類型**:

```typescript
interface ContentItem {
  id: string;
  imageId?: string;
  imageUrl?: string;
  text: string;
  position: number;
}
```

---

### 3. ImageGallery 組件

**位置**: `components/image-gallery/index.tsx`

**用途**: 管理和瀏覽所有圖片

**功能**:
- 圖片列表（網格/列表視圖）
- 搜索和篩選
- 批量選擇和刪除
- 統計信息顯示

**使用示例**:

```typescript
import { useState } from 'react';
import ImageGallery from '@/components/image-gallery';
import { UserImage } from '@/components/image-picker';

function ImageManagementPage() {
  const [selectedImage, setSelectedImage] = useState<UserImage | null>(null);

  const handleImageSelect = (image: UserImage) => {
    setSelectedImage(image);
    console.log('Selected image:', image);
  };

  return (
    <div className="h-screen">
      <ImageGallery
        onSelect={handleImageSelect}
        selectable={true}
        multiple={false}
      />

      {selectedImage && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h3>已選擇圖片</h3>
          <img
            src={selectedImage.url}
            alt={selectedImage.alt || selectedImage.fileName}
            className="w-48 h-48 object-cover rounded mt-2"
          />
        </div>
      )}
    </div>
  );
}
```

**Props**:

```typescript
interface ImageGalleryProps {
  onSelect?: (image: UserImage) => void;     // 選擇回調
  selectable?: boolean;                      // 是否可選擇（默認 false）
  multiple?: boolean;                        // 是否多選（默認 false）
}
```

---

## 🔧 整合到現有系統

### 整合到活動編輯器

**步驟 1**: 導入組件

```typescript
import ContentItemWithImage, { ContentItem } from '@/components/content-item-with-image';
```

**步驟 2**: 添加狀態管理

```typescript
const [contentItems, setContentItems] = useState<ContentItem[]>([]);
```

**步驟 3**: 渲染組件

```typescript
{contentItems.map((item, index) => (
  <ContentItemWithImage
    key={item.id}
    value={item}
    onChange={(value) => handleItemChange(index, value)}
    onRemove={() => handleItemRemove(index)}
  />
))}
```

---

### 整合到圖片管理頁面

**創建新頁面**: `app/images/page.tsx`

```typescript
import ImageGallery from '@/components/image-gallery';

export default function ImagesPage() {
  return (
    <div className="h-screen">
      <ImageGallery />
    </div>
  );
}
```

---

## 📝 最佳實踐

### 1. 錯誤處理

```typescript
const handleImageSelect = async (images: UserImage[]) => {
  try {
    // 處理圖片選擇
    setSelectedImages(images);
  } catch (error) {
    console.error('Error selecting images:', error);
    alert('選擇圖片失敗，請重試');
  }
};
```

### 2. 加載狀態

```typescript
const [loading, setLoading] = useState(false);

const handleSave = async () => {
  setLoading(true);
  try {
    // 保存邏輯
  } finally {
    setLoading(false);
  }
};
```

### 3. 數據驗證

```typescript
const validateContentItem = (item: ContentItem): boolean => {
  if (!item.text && !item.imageUrl) {
    alert('請至少添加圖片或文字');
    return false;
  }
  return true;
};
```

---

## 🎨 自定義樣式

### 使用 Tailwind CSS 自定義

```typescript
<ImagePicker
  onSelect={handleImageSelect}
  onClose={() => setShowPicker(false)}
  className="custom-image-picker"  // 添加自定義類名
/>
```

### 覆蓋默認樣式

```css
/* globals.css */
.custom-image-picker {
  /* 自定義樣式 */
}
```

---

## 🔍 常見問題

### Q1: 如何限制圖片大小？

A: 圖片上傳 API 已經限制為 10MB，如需修改請編輯 `app/api/images/upload/route.ts`

### Q2: 如何添加更多篩選選項？

A: 編輯 `components/image-picker/SearchTab.tsx` 添加更多篩選參數

### Q3: 如何自定義自動保存延遲？

A: 使用 `autoSaveDelay` prop：

```typescript
<ContentItemWithImage
  autoSaveDelay={2000}  // 2 秒延遲
/>
```

---

## 📖 相關文檔

- **API 文檔**: `docs/phase2-api-summary.md`
- **Phase 4 完成報告**: `docs/phase4-complete-report.md`
- **總體進度**: `docs/overall-progress-report.md`

---

## 🚀 下一步

1. 將組件整合到活動編輯器
2. 創建圖片管理頁面
3. 添加單元測試
4. 優化性能
5. 添加更多功能（圖片編輯、版本控制等）

