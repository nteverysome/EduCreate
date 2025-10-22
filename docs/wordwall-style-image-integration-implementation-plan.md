# Wordwall 風格圖片功能整合實施計畫

**日期**: 2025-10-22  
**目標**: 將 Wordwall 風格的圖片功能整合到 /create/shimozurdo-game 頁面  
**預估時間**: 7 小時  
**方案**: 方案 A - Wordwall 風格 + EduCreate 功能

---

## 📊 項目概述

### 目標

將 EduCreate 的強大圖片功能（選擇、編輯、文字疊加、版本管理）以 Wordwall 的簡潔 UI 風格整合到遊戲創建頁面。

### 核心特點

1. **簡潔的 UI** - 只顯示小圖標按鈕（🖼️）
2. **強大的功能** - 保留所有 EduCreate 圖片功能
3. **無縫整合** - 直接在詞彙輸入列表中使用
4. **自動文字疊加** - 自動將英文和中文疊加到圖片上

---

## 🎯 任務清單總覽

### 階段 1: 基礎組件開發（2 小時）

- [x] Task 1.1: 創建 ImageIconButton 組件（30 分鐘）
- [x] Task 1.2: 創建 CompactImagePreview 組件（30 分鐘）
- [x] Task 1.3: 創建 VocabularyItemWithImage 組件（1 小時）

### 階段 2: 數據結構更新（1 小時）

- [x] Task 2.1: 更新 VocabularyItem 接口（15 分鐘）
- [x] Task 2.2: 更新 updateItem 函數（15 分鐘）
- [x] Task 2.3: 更新 saveActivity 邏輯（30 分鐘）

### 階段 3: 圖片功能整合（2 小時）

- [x] Task 3.1: 整合 ImagePicker 模態框（30 分鐘）
- [x] Task 3.2: 整合 ImageEditor 模態框（30 分鐘）
- [x] Task 3.3: 實現圖片生成（文字疊加）（1 小時）

### 階段 4: 頁面整合（1 小時）

- [x] Task 4.1: 替換現有輸入框為新組件（30 分鐘）
- [x] Task 4.2: 測試完整流程（30 分鐘）

### 階段 5: 測試和優化（1 小時）

- [x] Task 5.1: 瀏覽器測試（30 分鐘）
- [x] Task 5.2: 修復 bug 和優化（30 分鐘）

---

## 📁 文件結構

### 新建文件

```
components/
└── vocabulary-item-with-image/
    ├── index.tsx                    # 主組件
    ├── ImageIconButton.tsx          # 圖標按鈕
    └── CompactImagePreview.tsx      # 緊湊預覽
```

### 修改文件

```
lib/vocabulary/loadVocabularyData.ts  # 更新接口
app/create/[templateId]/page.tsx      # 整合組件
```

---

## 🔧 詳細實施步驟

### 階段 1: 基礎組件開發

#### Task 1.1: ImageIconButton 組件

**文件**: `components/vocabulary-item-with-image/ImageIconButton.tsx`

```tsx
'use client';

import React from 'react';

interface ImageIconButtonProps {
  onClick: () => void;
  hasImage?: boolean;
}

export default function ImageIconButton({ onClick, hasImage }: ImageIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 flex items-center justify-center 
        border rounded-md transition-colors
        ${hasImage 
          ? 'border-blue-500 bg-blue-50 text-blue-600' 
          : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        }
      `}
      title={hasImage ? "編輯圖片" : "添加圖片"}
    >
      <span className="text-xl">🖼️</span>
    </button>
  );
}
```

**驗收標準**:
- ✅ 按鈕顯示圖標
- ✅ Hover 效果正常
- ✅ 有圖片時顯示藍色邊框
- ✅ Tooltip 顯示正確

---

#### Task 1.2: CompactImagePreview 組件

**文件**: `components/vocabulary-item-with-image/CompactImagePreview.tsx`

```tsx
'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface CompactImagePreviewProps {
  imageUrl: string;
  onEdit: () => void;
  onRemove: () => void;
}

export default function CompactImagePreview({ 
  imageUrl, 
  onEdit, 
  onRemove 
}: CompactImagePreviewProps) {
  return (
    <div className="mt-2 relative w-full h-32 border border-gray-200 rounded overflow-hidden group">
      <img 
        src={imageUrl} 
        alt="preview" 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
        >
          <Edit2 size={14} />
          <span>編輯</span>
        </button>
        <button
          onClick={onRemove}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center space-x-1"
        >
          <Trash2 size={14} />
          <span>刪除</span>
        </button>
      </div>
    </div>
  );
}
```

**驗收標準**:
- ✅ 圖片正確顯示
- ✅ Hover 時顯示編輯/刪除按鈕
- ✅ 按鈕點擊觸發正確回調
- ✅ 響應式設計正常

---

#### Task 1.3: VocabularyItemWithImage 組件

**文件**: `components/vocabulary-item-with-image/index.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import ImageIconButton from './ImageIconButton';
import CompactImagePreview from './CompactImagePreview';
import ImagePicker, { UserImage } from '../image-picker';
import ImageEditor from '../image-editor';
import { overlayTextOnImage } from '@/lib/image-text-overlay';

export interface VocabularyItemData {
  id: string;
  english: string;
  chinese: string;
  imageId?: string;
  imageUrl?: string;
}

interface VocabularyItemWithImageProps {
  item: VocabularyItemData;
  index: number;
  onChange: (item: VocabularyItemData) => void;
  onRemove: () => void;
  minItems: number;
  totalItems: number;
}

export default function VocabularyItemWithImage({
  item,
  index,
  onChange,
  onRemove,
  minItems,
  totalItems,
}: VocabularyItemWithImageProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 處理圖片選擇
  const handleImageSelect = async (images: UserImage[]) => {
    if (images.length > 0) {
      const selectedImage = images[0];
      onChange({
        ...item,
        imageId: selectedImage.id,
        imageUrl: selectedImage.url,
      });
      setShowImagePicker(false);
      
      // 自動生成帶文字的圖片
      if (item.english || item.chinese) {
        await generateImageWithText(selectedImage.url);
      }
    }
  };

  // 生成帶文字的圖片
  const generateImageWithText = async (baseImageUrl: string) => {
    if (!item.english && !item.chinese) return;
    
    setIsGenerating(true);
    try {
      const generatedImageUrl = await overlayTextOnImage(baseImageUrl, {
        text: `${item.english}\n${item.chinese}`,
        position: { x: 50, y: 50 },
        fontSize: 'medium',
        color: 'white',
        backgroundColor: true,
      });
      
      onChange({
        ...item,
        imageUrl: generatedImageUrl,
      });
    } catch (error) {
      console.error('生成圖片失敗:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
      {/* 序號 */}
      <div className="w-8 text-center text-sm text-gray-500 font-medium pt-2">
        {index + 1}.
      </div>

      {/* 圖標按鈕 */}
      <div className="pt-2">
        <ImageIconButton 
          onClick={() => setShowImagePicker(true)}
          hasImage={!!item.imageUrl}
        />
      </div>

      {/* 輸入區域 */}
      <div className="flex-1 space-y-2">
        {/* 英文輸入框 */}
        <input
          type="text"
          value={item.english}
          onChange={(e) => onChange({ ...item, english: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="輸入英文單字..."
        />
        
        {/* 圖片預覽 */}
        {item.imageUrl && (
          <CompactImagePreview
            imageUrl={item.imageUrl}
            onEdit={() => setShowImageEditor(true)}
            onRemove={() => onChange({ ...item, imageId: undefined, imageUrl: undefined })}
          />
        )}
        
        {isGenerating && (
          <div className="text-sm text-blue-600">正在生成圖片...</div>
        )}
      </div>

      {/* 中文輸入框 */}
      <div className="flex-1 pt-2">
        <input
          type="text"
          value={item.chinese}
          onChange={(e) => onChange({ ...item, chinese: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="輸入中文翻譯..."
        />
      </div>

      {/* 刪除按鈕 */}
      {totalItems > minItems && (
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors mt-2"
          title="刪除此項目"
        >
          🗑️
        </button>
      )}

      {/* 模態框 */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={false}
        />
      )}

      {showImageEditor && item.imageUrl && (
        <ImageEditor
          imageUrl={item.imageUrl}
          onSave={(editedUrl) => {
            onChange({ ...item, imageUrl: editedUrl });
            setShowImageEditor(false);
          }}
          onClose={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
}
```

**驗收標準**:
- ✅ 所有子組件正確渲染
- ✅ 圖片選擇流程正常
- ✅ 圖片編輯流程正常
- ✅ 文字疊加自動生成
- ✅ 狀態管理正確

---

## 📊 進度追蹤

| 階段 | 任務數 | 預估時間 | 狀態 |
|------|--------|----------|------|
| 階段 1 | 3 | 2 小時 | ⏳ 待開始 |
| 階段 2 | 3 | 1 小時 | ⏳ 待開始 |
| 階段 3 | 3 | 2 小時 | ⏳ 待開始 |
| 階段 4 | 2 | 1 小時 | ⏳ 待開始 |
| 階段 5 | 2 | 1 小時 | ⏳ 待開始 |
| **總計** | **13** | **7 小時** | **0% 完成** |

---

**文檔版本**: v1.0  
**創建時間**: 2025-10-22  
**下一步**: 開始階段 1 - 基礎組件開發

