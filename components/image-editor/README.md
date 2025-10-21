# ImageEditor 組件

## 概述

ImageEditor 是一個功能完整的圖片編輯組件，支持裁剪、旋轉和濾鏡效果。

---

## 功能特性

### 裁剪功能
- ✅ 自由裁剪（無固定比例）
- ✅ 拖動調整裁剪區域
- ✅ 縮放圖片
- ✅ 實時預覽

### 旋轉功能
- ✅ 順時針旋轉 90°
- ✅ 逆時針旋轉 90°
- ✅ 重置旋轉角度
- ✅ 任意角度旋轉（通過 Cropper）

### 濾鏡效果
- ✅ 灰階（Grayscale）
- ✅ 棕褐色（Sepia）
- ✅ 反轉（Invert）
- ✅ 增加亮度（Brightness）
- ✅ 增加對比度（Contrast）

---

## 使用方法

### 基本使用

```typescript
import { useState } from 'react';
import ImageEditor from '@/components/image-editor';

function MyComponent() {
  const [showEditor, setShowEditor] = useState(false);
  const [imageUrl, setImageUrl] = useState('https://example.com/image.jpg');

  const handleSave = async (blob: Blob, url: string) => {
    // 1. 上傳編輯後的圖片到 Vercel Blob
    const formData = new FormData();
    formData.append('file', blob, 'edited-image.jpg');

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    // 2. 更新圖片 URL
    setImageUrl(data.url);
    
    // 3. 關閉編輯器
    setShowEditor(false);
  };

  return (
    <div>
      <img src={imageUrl} alt="Image" />
      <button onClick={() => setShowEditor(true)}>
        編輯圖片
      </button>

      {showEditor && (
        <ImageEditor
          imageUrl={imageUrl}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
```

---

## Props

```typescript
interface ImageEditorProps {
  imageUrl: string;                                      // 圖片 URL
  onSave: (blob: Blob, url: string) => void;            // 保存回調
  onCancel: () => void;                                  // 取消回調
}
```

### imageUrl
- **類型**: `string`
- **必需**: 是
- **說明**: 要編輯的圖片 URL

### onSave
- **類型**: `(blob: Blob, url: string) => void`
- **必需**: 是
- **說明**: 保存回調函數
- **參數**:
  - `blob`: 編輯後的圖片 Blob 對象
  - `url`: 編輯後的圖片臨時 URL（用於預覽）

### onCancel
- **類型**: `() => void`
- **必需**: 是
- **說明**: 取消編輯回調函數

---

## 完整示例

### 與 ImagePicker 整合

```typescript
import { useState } from 'react';
import ImagePicker, { UserImage } from '@/components/image-picker';
import ImageEditor from '@/components/image-editor';

function ActivityEditor() {
  const [showPicker, setShowPicker] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UserImage | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState('');

  const handleImageSelect = (images: UserImage[]) => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
      setShowPicker(false);
    }
  };

  const handleEditImage = () => {
    if (selectedImage) {
      setEditingImageUrl(selectedImage.url);
      setShowEditor(true);
    }
  };

  const handleSaveEdit = async (blob: Blob, url: string) => {
    // 上傳編輯後的圖片
    const formData = new FormData();
    formData.append('file', blob, 'edited-image.jpg');

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    // 更新選中的圖片
    setSelectedImage({
      ...selectedImage!,
      url: data.url,
    });

    setShowEditor(false);
  };

  return (
    <div>
      {/* 圖片顯示 */}
      {selectedImage && (
        <div className="relative">
          <img
            src={selectedImage.url}
            alt={selectedImage.alt || selectedImage.fileName}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleEditImage}
              className="px-3 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              編輯
            </button>
            <button
              onClick={() => setSelectedImage(null)}
              className="px-3 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              移除
            </button>
          </div>
        </div>
      )}

      {/* 選擇圖片按鈕 */}
      {!selectedImage && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          選擇圖片
        </button>
      )}

      {/* ImagePicker */}
      {showPicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowPicker(false)}
          multiple={false}
        />
      )}

      {/* ImageEditor */}
      {showEditor && (
        <ImageEditor
          imageUrl={editingImageUrl}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
```

---

## 技術實現

### 使用的庫
- **react-easy-crop**: 圖片裁剪
- **Canvas API**: 圖片處理和濾鏡

### 圖片處理流程

1. **裁剪**:
   - 使用 react-easy-crop 獲取裁剪區域
   - 使用 Canvas API 繪製裁剪後的圖片

2. **旋轉**:
   - 使用 Canvas 的 rotate 方法
   - 計算旋轉後的畫布大小

3. **濾鏡**:
   - 使用 Canvas 的 getImageData 獲取像素數據
   - 對每個像素應用濾鏡算法
   - 使用 putImageData 更新畫布

4. **保存**:
   - 使用 canvas.toBlob 轉換為 Blob
   - 創建臨時 URL 用於預覽
   - 調用 onSave 回調

---

## 濾鏡算法

### 灰階（Grayscale）
```typescript
const avg = (r + g + b) / 3;
r = g = b = avg;
```

### 棕褐色（Sepia）
```typescript
r = r * 0.393 + g * 0.769 + b * 0.189;
g = r * 0.349 + g * 0.686 + b * 0.168;
b = r * 0.272 + g * 0.534 + b * 0.131;
```

### 反轉（Invert）
```typescript
r = 255 - r;
g = 255 - g;
b = 255 - b;
```

### 增加亮度（Brightness）
```typescript
r = Math.min(255, r + 50);
g = Math.min(255, g + 50);
b = Math.min(255, b + 50);
```

### 增加對比度（Contrast）
```typescript
const factor = 1.5;
r = factor * (r - 128) + 128;
g = factor * (g - 128) + 128;
b = factor * (b - 128) + 128;
```

---

## 性能優化

### 已實現的優化
- ✅ 使用 Canvas API（高性能）
- ✅ 只在保存時處理圖片
- ✅ 使用 JPEG 格式（質量 95%）
- ✅ 實時預覽（react-easy-crop）

### 未來優化
- ⏳ 使用 Web Worker 處理大圖片
- ⏳ 添加處理進度指示器
- ⏳ 支持更多圖片格式

---

## 瀏覽器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 常見問題

### Q1: 如何支持固定比例裁剪？

A: 修改 Cropper 的 aspect prop：

```typescript
<Cropper
  aspect={16 / 9}  // 16:9 比例
  // 或
  aspect={1}       // 1:1 正方形
/>
```

### Q2: 如何添加更多濾鏡？

A: 在 getCroppedImg 函數中添加新的 case：

```typescript
case 'blur':
  // 模糊濾鏡實現
  break;
```

### Q3: 如何限制圖片大小？

A: 在 toBlob 之前檢查畫布大小：

```typescript
if (canvas.width > 4096 || canvas.height > 4096) {
  // 縮小圖片
}
```

---

## 相關文檔

- **Phase 5 實施計劃**: `docs/phase5-implementation-plan.md`
- **ImagePicker 組件**: `components/image-picker/README.md`
- **API 文檔**: `docs/phase2-api-summary.md`

---

**版本**: 1.0  
**最後更新**: 2025-10-21  
**維護者**: EduCreate Team

