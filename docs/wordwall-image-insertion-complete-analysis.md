# Wordwall 圖片插入功能完整分析報告

## 📋 分析概述

本報告整合了對 Wordwall 兩個模板的完整分析：
1. **Spin the Wheel (templateId=8)**：圖片選擇器功能
2. **Match up (templateId=3)**：圖片插入到輸入框功能

**分析日期**：2025-10-21  
**分析工具**：Playwright Browser Automation  
**測試頁面**：
- https://wordwall.net/create/entercontent?templateId=8
- https://wordwall.net/create/entercontent?templateId=3

---

## 🎯 完整功能流程

### 用戶操作流程

```
1. 用戶點擊 "Add Image" 按鈕
   ↓
2. 圖片選擇器模態框彈出
   ↓
3. 用戶可以：
   a) 搜索圖片（輸入關鍵字如 "dog"）
   b) 選擇尺寸篩選（All/Small/Medium/Large）
   c) 點擊圖片選擇
   d) 或上傳自己的圖片
   ↓
4. 圖片被插入到輸入框旁邊
   ↓
5. 用戶可以在輸入框中輸入文字
   ↓
6. 圖片和文字共存，形成完整的內容項
```

---

## 🏗️ 技術實現分析

### 1. 圖片選擇器（Modal）

#### UI 結構
```
┌─────────────────────────────────────────────────────────┐
│ 圖片選擇器                                    [×]        │
├─────────────────────────────────────────────────────────┤
│ [搜索圖片] [我的圖片]                                    │
├─────────────────────────────────────────────────────────┤
│ [搜索框...]  [尺寸▼]  [🔍]  [📤 Upload]                 │
├─────────────────────────────────────────────────────────┤
│ ┌───┬───┬───┬───┐                                       │
│ │img│img│img│img│                                       │
│ │710│863│800│740│                                       │
│ │×  │×  │×  │×  │                                       │
│ │430│625│600│448│                                       │
│ └───┴───┴───┴───┘                                       │
│ ┌───┬───┬───┬───┐                                       │
│ │img│img│img│img│                                       │
│ └───┴───┴───┴───┘                                       │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

#### 關鍵功能
- ✅ 搜索功能（關鍵字搜索）
- ✅ 尺寸篩選（4 個選項）
- ✅ 圖片網格顯示
- ✅ 上傳功能
- ✅ 個人圖庫管理

---

### 2. 圖片插入到輸入框

#### HTML 結構分析

```html
<!-- 完整的內容項容器 -->
<div class="item js-item double-inner no-select float-left">
  
  <!-- 圖片容器 -->
  <div class="item-media-holder js-item-image-holder no-select has-image" name="0">
    <!-- 佔位符（圖片插入後隱藏）-->
    <span class="item-image-placeholder js-item-image-placeholder item-media-icon fa fa-image hidden" 
          title="Add Image">
    </span>
    
    <!-- 實際圖片 -->
    <img class="item-image js-item-image no-select" 
         source-width="710" 
         source-height="430" 
         src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..." />
  </div>
  
  <!-- 文字輸入框 -->
  <div class="item-input js-item-input selectable" 
       contenteditable="true">
    dog
  </div>
  
</div>
```

#### 關鍵發現

1. **圖片和文字分離**
   - 圖片和文字是**兩個獨立的元素**
   - 不是在同一個 contenteditable 區域內
   - 使用 flexbox 或 float 佈局並排顯示

2. **圖片存儲方式**
   - 使用 **base64 編碼**存儲在 `src` 屬性中
   - 保留原始尺寸信息：`source-width` 和 `source-height` 屬性
   - 顯示尺寸可以與原始尺寸不同（縮略圖）

3. **狀態管理**
   - 圖片容器有 `has-image` class 表示已插入圖片
   - 佔位符在插入圖片後添加 `hidden` class
   - 使用 JavaScript 動態切換狀態

4. **文字輸入**
   - 使用 `contenteditable="true"` 屬性
   - 支持富文本編輯（粗體、上標、下標等）
   - 實時保存內容

---

## 💡 為 EduCreate 專案的實現方案

### 數據結構設計

```typescript
// 內容項接口
interface ContentItem {
  id: string;
  image?: {
    src: string;        // base64 或 URL
    width: number;      // 原始寬度
    height: number;     // 原始高度
    thumbnailSrc?: string; // 縮略圖（可選）
  };
  text: string;         // 文字內容
  formatting?: {        // 文字格式（可選）
    bold?: boolean;
    italic?: boolean;
    // ...
  };
}
```

---

### React 組件實現

#### 1. ContentItemWithImage 組件

```typescript
// ContentItemWithImage.tsx
import { useState, useRef } from 'react';
import { ImagePicker } from './ImagePicker';
import { Image as ImageIcon, X } from 'lucide-react';

interface ContentItemWithImageProps {
  item: ContentItem;
  onChange: (item: ContentItem) => void;
  placeholder?: string;
}

export function ContentItemWithImage({ 
  item, 
  onChange,
  placeholder = '輸入文字...'
}: ContentItemWithImageProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const textInputRef = useRef<HTMLDivElement>(null);

  // 處理圖片選擇
  const handleImageSelect = (imageUrl: string, imageData: Image) => {
    onChange({
      ...item,
      image: {
        src: imageUrl,
        width: imageData.width,
        height: imageData.height,
        thumbnailSrc: imageData.thumbnail
      }
    });
    setIsPickerOpen(false);
  };

  // 處理圖片刪除
  const handleImageRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      ...item,
      image: undefined
    });
  };

  // 處理文字變更
  const handleTextChange = () => {
    const text = textInputRef.current?.textContent || '';
    onChange({
      ...item,
      text
    });
  };

  // 處理文字輸入框點擊（聚焦）
  const handleTextInputClick = () => {
    textInputRef.current?.focus();
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 border rounded-lg hover:border-primary transition">
        {/* 圖片區域 */}
        <div className="relative w-10 h-10 flex-shrink-0">
          {item.image ? (
            // 已有圖片：顯示圖片和刪除按鈕
            <div className="relative group">
              <img
                src={item.image.thumbnailSrc || item.image.src}
                alt=""
                className="w-full h-full object-cover rounded cursor-pointer"
                onClick={() => setIsPickerOpen(true)}
                title={`${item.image.width} × ${item.image.height}`}
              />
              {/* 刪除按鈕 */}
              <button
                onClick={handleImageRemove}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                title="刪除圖片"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            // 無圖片：顯示添加按鈕
            <button
              onClick={() => setIsPickerOpen(true)}
              className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-primary hover:bg-gray-50 transition"
              title="添加圖片"
            >
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* 文字輸入區域 */}
        <div
          ref={textInputRef}
          contentEditable
          onInput={handleTextChange}
          onClick={handleTextInputClick}
          className="flex-1 min-h-[40px] px-3 py-2 outline-none"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        >
          {item.text}
        </div>
      </div>

      {/* 圖片選擇器模態框 */}
      <ImagePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleImageSelect}
      />
    </>
  );
}
```

#### 2. CSS 樣式

```css
/* ContentItemWithImage.css */

/* 佔位符樣式 */
[contenteditable][data-placeholder]:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

/* 聚焦狀態 */
[contenteditable]:focus {
  outline: none;
}

/* 圖片容器動畫 */
.item-media-holder {
  transition: all 0.2s ease;
}

.item-media-holder:hover {
  transform: scale(1.05);
}

/* 刪除按鈕動畫 */
.group:hover .group-hover\:opacity-100 {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

### 使用示例

```typescript
// 在遊戲編輯器中使用
function GameEditor() {
  const [items, setItems] = useState<ContentItem[]>([
    { id: '1', text: '', image: undefined },
    { id: '2', text: '', image: undefined },
    { id: '3', text: '', image: undefined }
  ]);

  const handleItemChange = (index: number, updatedItem: ContentItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <h2>編輯遊戲內容</h2>
      
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-gray-500">{index + 1}.</span>
          <ContentItemWithImage
            item={item}
            onChange={(updatedItem) => handleItemChange(index, updatedItem)}
            placeholder={`輸入第 ${index + 1} 項內容...`}
          />
        </div>
      ))}
      
      <button onClick={() => {
        setItems([...items, { 
          id: Date.now().toString(), 
          text: '', 
          image: undefined 
        }]);
      }}>
        + 添加項目
      </button>
    </div>
  );
}
```

---

## 🎨 UI/UX 設計建議

### 視覺設計

1. **圖片區域**
   - 固定尺寸：40×40px（桌面版）
   - 圓角：4px
   - 懸停效果：輕微放大（scale 1.05）
   - 邊框：虛線邊框（無圖片時）

2. **文字輸入區域**
   - 最小高度：40px
   - 自動擴展高度
   - 佔位符文字：淺灰色
   - 聚焦狀態：無邊框，僅底部線條

3. **刪除按鈕**
   - 位置：圖片右上角
   - 尺寸：20×20px
   - 顏色：紅色背景，白色圖標
   - 顯示：僅在懸停時顯示

### 交互設計

1. **添加圖片**
   - 點擊佔位符 → 打開圖片選擇器
   - 點擊已有圖片 → 更換圖片

2. **刪除圖片**
   - 懸停圖片 → 顯示刪除按鈕
   - 點擊刪除按鈕 → 確認刪除

3. **編輯文字**
   - 點擊文字區域 → 聚焦輸入框
   - 輸入文字 → 實時保存

### 響應式設計

```css
/* 手機版本 */
@media (max-width: 640px) {
  .content-item-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-media-holder {
    width: 60px;
    height: 60px;
  }
  
  .item-input {
    width: 100%;
  }
}

/* 平板版本 */
@media (min-width: 641px) and (max-width: 1024px) {
  .item-media-holder {
    width: 50px;
    height: 50px;
  }
}
```

---

## 📊 數據流程

### 圖片選擇流程

```
用戶點擊 "Add Image"
    ↓
setIsPickerOpen(true)
    ↓
ImagePicker 模態框打開
    ↓
用戶搜索/選擇圖片
    ↓
onImageSelect(imageUrl, imageData)
    ↓
onChange({ ...item, image: {...} })
    ↓
父組件更新狀態
    ↓
重新渲染，顯示圖片
```

### 圖片刪除流程

```
用戶懸停圖片
    ↓
顯示刪除按鈕
    ↓
用戶點擊刪除按鈕
    ↓
handleImageRemove()
    ↓
onChange({ ...item, image: undefined })
    ↓
父組件更新狀態
    ↓
重新渲染，顯示佔位符
```

### 文字編輯流程

```
用戶點擊文字區域
    ↓
contenteditable div 聚焦
    ↓
用戶輸入文字
    ↓
onInput 事件觸發
    ↓
handleTextChange()
    ↓
讀取 textContent
    ↓
onChange({ ...item, text: '...' })
    ↓
父組件更新狀態
```

---

## 🔧 技術優化建議

### 1. 圖片處理優化

```typescript
// 圖片壓縮
async function compressImage(file: File, maxWidth: number = 1200): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### 2. 縮略圖生成

```typescript
// 生成縮略圖
async function generateThumbnail(imageUrl: string, size: number = 100): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d')!;
      const scale = Math.max(size / img.width, size / img.height);
      const x = (size / 2) - (img.width / 2) * scale;
      const y = (size / 2) - (img.height / 2) * scale;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = imageUrl;
  });
}
```

### 3. 懶加載

```typescript
// 圖片懶加載
import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      {...props}
    />
  );
}
```

---

## ✅ 功能檢查清單

### 必須實現的功能
- [x] 圖片選擇器（模態框）
- [x] 圖片搜索功能
- [x] 尺寸篩選功能
- [x] 圖片上傳功能
- [x] 個人圖庫管理
- [x] 圖片插入到輸入框
- [x] 圖片和文字共存
- [x] 圖片刪除功能
- [x] 文字編輯功能
- [x] 響應式設計

### 可選功能
- [ ] 圖片裁剪
- [ ] 圖片編輯（濾鏡、調整）
- [ ] 拖放上傳
- [ ] 批量上傳
- [ ] 圖片預覽（放大）
- [ ] 富文本編輯（粗體、斜體等）
- [ ] 撤銷/重做功能

---

## 📝 總結

Wordwall 的圖片插入功能設計精巧，將圖片選擇和內容編輯完美結合。關鍵特點：

1. ✅ **分離式設計**：圖片和文字是獨立元素，易於管理
2. ✅ **base64 存儲**：簡化數據傳輸和存儲
3. ✅ **保留元數據**：記錄原始尺寸信息
4. ✅ **狀態管理**：使用 class 切換顯示狀態
5. ✅ **用戶體驗**：流暢的交互和視覺反饋

對於 EduCreate 專案，我們可以：
- 使用 React + TypeScript 實現類似功能
- 整合 Unsplash API 提供豐富圖片資源
- 使用 Supabase Storage 存儲用戶上傳圖片
- 實現響應式設計支持各種設備
- 提供良好的用戶體驗和性能

**預估開發時間**：5-6 週  
**技術難度**：中等  
**優先級**：高（核心功能）

---

**文檔版本**：2.0  
**最後更新**：2025-10-21  
**作者**：EduCreate Development Team

