# Wordwall 複製按鈕功能分析

## 📋 分析日期
2025-10-23

## 🎯 分析目標
分析 Wordwall 的複製按鈕功能,為 EduCreate 實現相同功能提供參考。

---

## 🔍 發現的功能

### 1. **複製按鈕位置**

#### 按鈕順序 (從左到右)
```
[項目編號] [詞彙內容] [刪除按鈕] [複製按鈕] [拖移按鈕]
    1.      [內容區域]     [🗑️]      [📋]      [⇅]
```

#### 實際順序
1. **項目編號** (order: 1)
2. **詞彙內容** (order: 2)
3. **刪除按鈕** (order: 3) - `fa-trash`
4. **複製按鈕** (order: 4) - `glyphicon-duplicate`
5. **拖移按鈕** (order: 5) - `fa-sort`

---

### 2. **複製按鈕樣式**

#### HTML 結構
```html
<div class="item-duplicate js-item-duplicate no-select">
  <span class="glyphicon glyphicon-duplicate"></span>
</div>
```

#### CSS 樣式
```css
.item-duplicate {
  width: 32px;
  height: 44px;
  cursor: pointer;
  position: static;
}
```

#### 圖標
- **圖標庫**: Bootstrap Glyphicons
- **圖標名稱**: `glyphicon-duplicate`
- **視覺效果**: 📋 (兩個重疊的方框)

---

### 3. **複製按鈕功能**

#### 功能描述
點擊複製按鈕後:
1. 複製當前項目的所有內容
2. 在當前項目下方插入新項目
3. 新項目包含相同的:
   - 英文文本
   - 中文文本
   - 圖片 (如果有)
   - 語音 (如果有)
   - 格式化 (粗體、上標、下標等)

#### 插入位置
- **位置**: 當前項目的下方
- **編號**: 自動更新所有項目編號

#### 範例
```
複製前:
1. apple - 蘋果
2. banana - 香蕉
3. cat - 貓

點擊複製 "banana" 後:
1. apple - 蘋果
2. banana - 香蕉
3. banana - 香蕉 (新複製的)
4. cat - 貓
```

---

## 🎨 UI 設計細節

### 按鈕尺寸
- **寬度**: 32px
- **高度**: 44px
- **與其他按鈕一致**: 刪除按鈕和拖移按鈕也是 32px × 44px

### 按鈕顏色
- **默認**: 灰色 (#999 或類似)
- **Hover**: 深灰色或藍色
- **Active**: 更深的顏色

### 按鈕間距
- **按鈕之間**: 無間距或極小間距 (1-2px)
- **與內容區域**: 有一定間距

---

## 🔧 技術實現建議

### 1. **創建 DuplicateButton 組件**

#### 文件: `components/duplicate-button/index.tsx`

```typescript
interface DuplicateButtonProps {
  onClick: () => void;
}

export default function DuplicateButton({ onClick }: DuplicateButtonProps) {
  return (
    <button
      className="w-8 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      onClick={onClick}
      type="button"
      title="複製項目"
    >
      {/* Bootstrap Glyphicons duplicate icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        className="w-4 h-4"
        fill="currentColor"
      >
        <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z"/>
      </svg>
    </button>
  );
}
```

---

### 2. **修改 SortableVocabularyItem 組件**

#### 添加複製按鈕到按鈕組

```typescript
// components/vocabulary-item-with-image/SortableVocabularyItem.tsx

import DuplicateButton from '@/components/duplicate-button';

export default function SortableVocabularyItem({
  item,
  index,
  onChange,
  onRemove,
  onDuplicate, // 新增
  minItems,
  totalItems,
}: SortableVocabularyItemProps) {
  // ... existing code ...

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 relative">
      {/* 項目編號 */}
      <div className="flex-shrink-0 w-8 pt-2 text-gray-600 font-medium">
        {index + 1}.
      </div>

      {/* 詞彙項目 */}
      <div className="flex-1">
        <VocabularyItemWithImage
          item={item}
          index={index}
          onChange={onChange}
          onRemove={onRemove}
          minItems={minItems}
          totalItems={totalItems}
        />
      </div>

      {/* 右側按鈕組 */}
      <div className="flex-shrink-0 flex items-center gap-0 pt-2">
        {/* 刪除按鈕 */}
        <button
          onClick={onRemove}
          disabled={totalItems <= minItems}
          className="w-8 h-11 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="刪除項目"
          type="button"
        >
          {/* Trash icon */}
          <svg>...</svg>
        </button>

        {/* 複製按鈕 */}
        <DuplicateButton onClick={onDuplicate} />

        {/* 拖移按鈕 */}
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
}
```

---

### 3. **修改創建頁面**

#### 添加複製功能到 `page.tsx`

```typescript
// app/create/[templateId]/page.tsx

// 複製項目
const duplicateItem = (id: string) => {
  setVocabularyItems((items) => {
    // 找到要複製的項目
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return items;

    // 複製項目
    const itemToDuplicate = items[index];
    const newItem = {
      ...itemToDuplicate,
      id: uuidv4(), // 生成新的 ID
    };

    // 在當前項目下方插入新項目
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);

    return newItems;
  });
};

// 在渲染中傳遞 onDuplicate
<SortableVocabularyItem
  key={item.id}
  item={item}
  index={index}
  onChange={(updatedItem) => updateItemFull(item.id, updatedItem)}
  onRemove={() => removeItem(item.id)}
  onDuplicate={() => duplicateItem(item.id)} // 新增
  minItems={gameConfig.minItems}
  totalItems={vocabularyItems.length}
/>
```

---

## 📊 按鈕順序對比

### Wordwall 順序
```
[項目編號] [內容] [刪除] [複製] [拖移]
```

### EduCreate 當前順序
```
[項目編號] [內容] [拖移] [刪除]
```

### EduCreate 建議順序 (與 Wordwall 一致)
```
[項目編號] [內容] [刪除] [複製] [拖移]
```

---

## 🎯 實現步驟

### Phase 1: 創建複製按鈕組件 ✅
1. 創建 `components/duplicate-button/index.tsx`
2. 使用 Bootstrap Glyphicons duplicate 圖標
3. 添加 hover 效果和 title

### Phase 2: 整合到 SortableVocabularyItem ⏳
1. 添加 `onDuplicate` prop
2. 調整按鈕順序: [刪除] [複製] [拖移]
3. 確保按鈕間距為 0 或極小

### Phase 3: 實現複製邏輯 ⏳
1. 在 `page.tsx` 添加 `duplicateItem` 函數
2. 複製項目的所有屬性 (english, chinese, image, sound, formatting)
3. 在當前項目下方插入新項目
4. 自動更新項目編號

### Phase 4: 測試 ⏳
1. 測試複製功能
2. 測試複製後的項目是否包含所有內容
3. 測試項目編號是否正確更新
4. 測試與拖移功能的兼容性

---

## 🔍 關鍵發現

### 1. **按鈕順序很重要**
Wordwall 的按鈕順序是經過設計的:
- **刪除** 在最左邊 (最常用)
- **複製** 在中間 (次常用)
- **拖移** 在最右邊 (較少用)

### 2. **複製按鈕圖標**
使用 Bootstrap Glyphicons 的 `glyphicon-duplicate` 圖標:
- 視覺上清晰表示"複製"操作
- 與其他圖標風格一致

### 3. **複製插入位置**
複製的項目插入在當前項目的**下方**:
- 符合用戶直覺
- 方便連續複製和編輯

---

## 📝 總結

Wordwall 的複製按鈕功能:
- ✅ **位置**: 在刪除按鈕和拖移按鈕之間
- ✅ **圖標**: Bootstrap Glyphicons duplicate (📋)
- ✅ **尺寸**: 32px × 44px
- ✅ **功能**: 複製項目並插入到下方
- ✅ **內容**: 複製所有屬性 (文本、圖片、語音、格式)

---

## 🚀 下一步

1. 創建 `DuplicateButton` 組件
2. 修改 `SortableVocabularyItem` 添加複製按鈕
3. 調整按鈕順序: [刪除] [複製] [拖移]
4. 實現 `duplicateItem` 函數
5. 測試複製功能

---

**分析完成!** 🎉

