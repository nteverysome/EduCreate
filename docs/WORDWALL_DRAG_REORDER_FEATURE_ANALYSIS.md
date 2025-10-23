# Wordwall 拖移排序功能深度分析

## 📋 概述

分析 Wordwall Match Up 模板中的**拖移排序按鈕**功能,用於重新排列項目順序。

**分析日期**: 2025-10-23  
**分析頁面**: https://wordwall.net/create/entercontent?templateId=3&folderId=0  
**分析工具**: Playwright Browser Automation

---

## 🎯 核心發現

### 拖移按鈕 (Drag Button)

#### 位置與外觀
- **位置**: 每個項目的**右側**
- **圖標**: `fa-sort` (Font Awesome 排序圖標)
- **樣式**: 上下箭頭 (⇅)
- **尺寸**: 32px × 44px
- **游標**: `cursor: move`

#### HTML 結構
```html
<div class="item-dragger js-item-dragger">
  <span class="fa fa-sort"></span>
</div>
```

#### CSS 樣式
```css
.item-dragger {
  width: 32px;
  height: 44px;
  cursor: move;
  background-color: transparent;
}
```

---

## 🎨 UI 布局結構

### 完整項目結構

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. [🖼️ Add Image] [🔊 Add Sound] [輸入關鍵字...]              │
│    [🖼️ Add Image] [輸入匹配物件...]                            │
│                                                          [⇅] [🗑️] │ ← 拖移和刪除按鈕
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. [🖼️ Add Image] [🔊 Add Sound] [輸入關鍵字...]              │
│    [🖼️ Add Image] [輸入匹配物件...]                            │
│                                                          [⇅] [🗑️] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. [🖼️ Add Image] [🔊 Add Sound] [輸入關鍵字...]              │
│    [🖼️ Add Image] [輸入匹配物件...]                            │
│                                                          [⇅] [🗑️] │
└─────────────────────────────────────────────────────────────────┘
```

### 按鈕位置說明

#### 右側按鈕組
1. **拖移按鈕** (⇅)
   - 位置: 最右側,刪除按鈕左邊
   - 功能: 拖動重新排序
   - 圖標: `fa-sort` (上下箭頭)

2. **刪除按鈕** (🗑️)
   - 位置: 最右側
   - 功能: 刪除項目
   - 圖標: `fa-trash` (垃圾桶)

---

## 🔧 技術實現細節

### 1. DOM 結構

#### 項目容器
```html
<div class="item js-item no-select">
  <!-- 錯誤信息 -->
  <div class="error-message js-error-message"></div>
  
  <!-- 項目編號 -->
  <div class="item-index js-item-index no-select" style="display: block;">
    1.
  </div>
  
  <!-- 項目內容 (雙列) -->
  <div class="js-editor-child-items editor-child-items double-item">
    <!-- 關鍵字輸入框 (左側) -->
    <div class="item js-item double-inner no-select float-left">
      <div class="item-media-holder js-item-image-holder empty no-select">
        <span class="item-image-placeholder js-item-image-placeholder item-media-icon fa fa-image" title="Add Image"></span>
      </div>
      <div class="item-media-holder js-item-sound-holder empty no-select">
        <span class="js-item-sound-placeholder item-media-icon fa fa-volume-up" title="Add Sound"></span>
      </div>
      <!-- 輸入框 -->
    </div>
    
    <!-- 匹配物件輸入框 (右側) -->
    <div class="item js-item double-inner no-select float-left">
      <div class="item-media-holder js-item-image-holder empty no-select">
        <span class="item-image-placeholder js-item-image-placeholder item-media-icon fa fa-image" title="Add Image"></span>
      </div>
      <!-- 輸入框 -->
    </div>
  </div>
  
  <!-- 拖移按鈕 -->
  <div class="item-dragger js-item-dragger">
    <span class="fa fa-sort"></span>
  </div>
  
  <!-- 刪除按鈕 -->
  <div class="item-remove js-item-remove no-select">
    <span class="fa fa-trash"></span>
  </div>
</div>
```

---

### 2. 拖移功能實現

#### 使用的技術
- **HTML5 Drag and Drop API**
- **jQuery UI Sortable** (推測)
- **自定義拖移邏輯**

#### 拖移流程

##### 2.1 開始拖移
1. 用戶按住拖移按鈕 (⇅)
2. 項目變為可拖動狀態
3. 游標變為 `move`
4. 項目可能會有視覺反饋 (半透明、陰影等)

##### 2.2 拖移中
1. 用戶上下移動鼠標
2. 項目跟隨鼠標移動
3. 其他項目自動調整位置 (讓出空間)
4. 顯示插入位置指示器

##### 2.3 放下
1. 用戶釋放鼠標
2. 項目插入到新位置
3. 所有項目編號自動更新 (1, 2, 3...)
4. 保存新的順序到服務器

---

### 3. 實現代碼示例

#### React + TypeScript 實現

```typescript
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  imageUrl?: string;
  audioUrl?: string;
}

// 可排序項目組件
function SortableItem({ item, index }: { item: VocabularyItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="vocabulary-item">
      {/* 項目編號 */}
      <div className="item-index">{index + 1}.</div>
      
      {/* 項目內容 */}
      <div className="item-content">
        {/* 關鍵字輸入框 */}
        <InputWithImage
          value={item.english}
          onChange={(value) => {/* ... */}}
          placeholder="輸入關鍵字..."
        />
        
        {/* 匹配物件輸入框 */}
        <InputWithImage
          value={item.chinese}
          onChange={(value) => {/* ... */}}
          placeholder="輸入匹配物件..."
        />
      </div>
      
      {/* 拖移按鈕 */}
      <button
        className="drag-button"
        {...attributes}
        {...listeners}
      >
        <span className="fa fa-sort"></span>
      </button>
      
      {/* 刪除按鈕 */}
      <button
        className="remove-button"
        onClick={() => {/* ... */}}
      >
        <span className="fa fa-trash"></span>
      </button>
    </div>
  );
}

// 主組件
export default function VocabularyList() {
  const [items, setItems] = useState<VocabularyItem[]>([
    { id: '1', english: '', chinese: '' },
    { id: '2', english: '', chinese: '' },
    { id: '3', english: '', chinese: '' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, index) => (
          <SortableItem key={item.id} item={item} index={index} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

## 📊 功能對比

### Wordwall vs EduCreate

| 功能 | Wordwall | EduCreate 當前 | 需要實現 |
|------|----------|----------------|----------|
| **拖移排序** | ✅ 有 | ❌ 無 | ⏳ 待實現 |
| **刪除項目** | ✅ 有 | ✅ 有 | ✅ 已實現 |
| **添加項目** | ✅ 有 | ✅ 有 | ✅ 已實現 |
| **項目編號** | ✅ 自動 | ✅ 自動 | ✅ 已實現 |

---

## 🎯 實施建議

### Phase 1: 選擇拖移庫 ⭐ **優先**

#### 推薦方案: @dnd-kit/core
- **優點**:
  - ✅ 現代化、輕量級
  - ✅ TypeScript 支持
  - ✅ 無障礙性好
  - ✅ 性能優秀
  - ✅ 觸控設備支持

- **安裝**:
  ```bash
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```

#### 替代方案: react-beautiful-dnd
- **優點**:
  - ✅ 成熟穩定
  - ✅ 動畫流暢
  - ✅ 文檔完善

- **缺點**:
  - ❌ 較重
  - ❌ 不再積極維護

---

### Phase 2: 創建拖移按鈕組件

#### 2.1 創建 `DragHandle` 組件
```typescript
// components/drag-handle/index.tsx
export default function DragHandle({ listeners, attributes }: any) {
  return (
    <button
      className="drag-handle"
      {...listeners}
      {...attributes}
    >
      <span className="fa fa-sort"></span>
    </button>
  );
}
```

#### 2.2 樣式
```css
.drag-handle {
  width: 32px;
  height: 44px;
  cursor: move;
  background: transparent;
  border: none;
  color: #666;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #333;
}

.drag-handle:active {
  cursor: grabbing;
}
```

---

### Phase 3: 整合到 VocabularyItemWithImage

#### 3.1 修改組件結構
- 將每個 `VocabularyItemWithImage` 包裝在可排序容器中
- 添加拖移按鈕到右側
- 實現拖移邏輯

#### 3.2 更新狀態管理
- 使用 `arrayMove` 重新排序項目
- 自動更新項目編號
- 保存新順序

---

### Phase 4: 測試與優化

#### 4.1 功能測試
- ✅ 拖移上下移動
- ✅ 項目編號自動更新
- ✅ 觸控設備支持
- ✅ 鍵盤無障礙操作

#### 4.2 性能優化
- 使用 `React.memo` 避免不必要的重渲染
- 優化拖移動畫性能
- 減少 DOM 操作

---

## 📝 總結

### 核心發現
1. ✅ **拖移按鈕**: 使用 `fa-sort` 圖標 (⇅)
2. ✅ **位置**: 項目右側,刪除按鈕左邊
3. ✅ **尺寸**: 32px × 44px
4. ✅ **游標**: `cursor: move`

### 技術實現
- ✅ 使用 HTML5 Drag and Drop API
- ✅ 推薦使用 @dnd-kit/core 庫
- ✅ 支持觸控設備和鍵盤操作
- ✅ 自動更新項目編號

### 下一步行動
1. ⏳ 安裝 @dnd-kit/core 庫
2. ⏳ 創建 DragHandle 組件
3. ⏳ 整合到 VocabularyItemWithImage
4. ⏳ 測試拖移功能

---

**分析完成!** 🎉

**截圖**: `wordwall-match-up-drag-buttons.png`

