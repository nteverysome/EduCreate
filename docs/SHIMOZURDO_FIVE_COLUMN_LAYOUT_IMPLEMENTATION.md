# Shimozurdo Game 五列布局實施文檔

## 📋 文檔信息

- **版本**：1.0
- **創建日期**：2025-10-23
- **最後更新**：2025-10-23
- **維護者**：EduCreate Team
- **相關遊戲**：Shimozurdo Game (shimozurdo-game)

---

## 🎯 實施概述

本文檔記錄了 Shimozurdo Game 五列布局系統的完整實施過程，包括獨立圖片功能、動態布局調整、以及所有相關的 bug 修復。

---

## 📝 用戶需求

### 初始需求（2025-10-23）

用戶報告了三個問題：
1. **刪除按鈕不見了**：活動創建頁面的刪除按鈕被壓縮，無法顯示
2. **交換列功能失效**：點擊交換列按鈕後，圖片也跟著交換了
3. **中文框需要圖片功能**：中文輸入框也需要一個添加圖片的功能

### 後續需求

1. **獨立圖片功能**：中文框的圖片與英文框的圖片要各自獨立
2. **動態布局調整**：
   - 如果沒有英文圖，不要顯示英文圖片
   - 如果只有英文圖沒有英文單字，只顯示英文圖
   - 如果只有中文圖沒有中文單字，只顯示中文圖
   - 如果沒有任何圖片，只顯示單字
3. **圖片不混淆**：英文有圖片而中文沒有圖片時，中文圖片位置不應該顯示英文圖片

---

## 🔥 實施階段

### 階段 1：修復基礎問題（已完成 ✅）

#### 1.1 修復刪除按鈕布局

**問題**：刪除按鈕被壓縮，無法顯示

**文件**：`app/create/[templateId]/page.tsx`

**修復方案**：
```tsx
{/* 刪除按鈕 */}
{items.length > minItems && (
  <button
    onClick={() => removeItem(index)}
    className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
    title="刪除此項目"
  >
    <Trash2 className="w-5 h-5" />
  </button>
)}
```

**關鍵改進**：
- ✅ 添加 `flex-shrink-0`，確保按鈕不被壓縮
- ✅ 移除 `mt-2`，改為與輸入框對齊
- ✅ 確保按鈕始終可見

**Commit**：初始修復（已包含在後續提交中）

---

#### 1.2 修復交換列功能

**問題**：交換列時，圖片也跟著交換了

**文件**：`app/create/[templateId]/page.tsx`

**修復方案**：
```tsx
const swapColumns = () => {
  setItems(items.map(item => ({
    ...item,
    english: item.chinese,
    chinese: item.english,
    // 🆕 圖片保持不變（不交換）
    // imageUrl 和 imageId 保持原樣
  })));
};
```

**關鍵改進**：
- ✅ 添加註釋說明圖片行為
- ✅ 確保 `imageUrl` 和 `imageId` 保持不變
- ✅ 只交換英文和中文文字

**Commit**：初始修復（已包含在後續提交中）

---

#### 1.3 添加中文框圖片功能

**問題**：中文框沒有圖片功能

**文件**：`app/create/[templateId]/page.tsx`

**修復方案**：
```tsx
{/* 中文輸入框（也整合圖片功能） */}
<div className="flex-1">
  <InputWithImage
    value={item.chinese}
    onChange={(value) => onChange({ ...item, chinese: value })}
    placeholder="輸入中文翻譯..."
    imageUrl={item.imageUrl}
    imageId={item.imageId}
    onImageChange={(imageUrl, imageId) => {
      onChange({ ...item, imageUrl, imageId });
    }}
  />
</div>
```

**關鍵改進**：
- ✅ 中文框使用 `InputWithImage` 組件
- ✅ 與英文框共享相同的圖片
- ✅ 功能一致性

**Commit**：初始修復（已包含在後續提交中）

---

### 階段 2：實施獨立圖片功能（已完成 ✅）

#### 2.1 添加中文圖片欄位

**需求**：中文框的圖片與英文框的圖片要各自獨立

**文件**：
- `prisma/schema.prisma`
- `app/api/activities/route.ts`
- `app/api/activities/[id]/route.ts`
- `app/create/[templateId]/page.tsx`
- `components/vocabulary-item-with-image/index.tsx`
- `lib/vocabulary/loadVocabularyData.ts`

**資料庫模型更新**：
```prisma
model VocabularyItem {
  id                String   @id @default(cuid())
  english           String
  chinese           String
  imageUrl          String?  // 英文圖片 URL
  imageId           String?  // 英文圖片 ID
  chineseImageUrl   String?  // 🆕 中文圖片 URL
  chineseImageId    String?  // 🆕 中文圖片 ID
  // ... 其他欄位
}
```

**API 更新**：
```typescript
// POST /api/activities
vocabularyItems: {
  create: vocabularyItems.map(item => ({
    english: item.english,
    chinese: item.chinese,
    imageUrl: item.imageUrl,
    imageId: item.imageId,
    chineseImageUrl: item.chineseImageUrl,      // 🆕
    chineseImageId: item.chineseImageId,        // 🆕
    // ... 其他欄位
  }))
}
```

**前端組件更新**：
```tsx
<VocabularyItemWithImage
  item={item}
  onChange={(updatedItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  }}
  onRemove={() => removeItem(index)}
  canRemove={items.length > minItems}
/>
```

**Commit**：`f315791` - "fix: Preserve imageUrl and chineseImageUrl fields in GEPTManager for five-column layout image display"

---

### 階段 3：實施動態布局調整（已完成 ✅）

#### 3.1 動態布局邏輯

**需求**：根據圖片和文字是否存在動態調整布局

**文件**：`public/games/shimozurdo-game/scenes/title.js`

**實施方案**：
```javascript
updateUIPositions() {
    // 🎯 檢查圖片和文字是否存在
    const hasEnglishImage = this.englishImage && this.englishImage.visible;
    const hasChineseImage = this.chineseImage && this.chineseImage.visible;
    const hasEnglishText = this.currentTargetWord?.english && this.currentTargetWord.english.trim() !== '';
    const hasChineseText = this.currentTargetWord?.chinese && this.currentTargetWord.chinese.trim() !== '';

    // 🎯 動態計算列數
    let totalColumns = 1;  // 基礎：分數
    if (hasEnglishImage) totalColumns++;
    if (hasEnglishText) totalColumns++;
    if (hasChineseImage) totalColumns++;
    if (hasChineseText) totalColumns++;

    // 🎯 動態分配列位置
    let currentColumn = 0;

    // 第一列：分數（總是存在）
    const col1X = startX + spacing * currentColumn;
    this.scoreText.setPosition(col1X, worldTopY);
    currentColumn++;

    // 第二列：英文圖片（如果存在）
    if (hasEnglishImage) {
        const col2X = startX + spacing * currentColumn;
        this.englishImage.setPosition(col2X, worldTopY);
        currentColumn++;
    }

    // 第三列：英文文字（如果存在）
    if (hasEnglishText && this.englishText) {
        const col3X = startX + spacing * currentColumn;
        this.englishText.setPosition(col3X, worldTopY);
        this.englishText.setVisible(true);
        currentColumn++;
    } else if (this.englishText) {
        this.englishText.setVisible(false);
    }

    // 第四列：中文圖片（如果存在）
    if (hasChineseImage) {
        const col4X = startX + spacing * currentColumn;
        this.chineseImage.setPosition(col4X, worldTopY);
        currentColumn++;
    }

    // 第五列：中文文字（如果存在）
    if (hasChineseText && this.chineseText) {
        const col5X = startX + spacing * currentColumn;
        this.chineseText.setPosition(col5X, worldTopY);
        this.chineseText.setVisible(true);
    } else if (this.chineseText) {
        this.chineseText.setVisible(false);
    }
}
```

**Commit**：`a16d69e` - "feat: Flexible display logic - Show/hide text and images based on content availability"

---

#### 3.2 修復圖片混淆問題

**問題**：英文有圖片而中文沒有圖片時，中文圖片位置會顯示英文圖片

**文件**：`public/games/shimozurdo-game/scenes/title.js`

**根本原因**：
```javascript
// ❌ 錯誤：如果沒有 chineseImageUrl，就使用 imageUrl（英文圖片）
const chineseImageUrl = this.currentTargetWord?.chineseImageUrl || this.currentTargetWord?.imageUrl;
```

**修復方案**：
```javascript
// ✅ 正確：只使用 chineseImageUrl，不使用 imageUrl（英文圖片）
const chineseImageUrl = this.currentTargetWord?.chineseImageUrl;
```

**Commit**：`f291a68` - "fix: Only use chineseImageUrl for Chinese image, do not fallback to imageUrl"

---

## 📊 布局效果

### 情況 1：有英文圖 + 有英文文字 + 有中文圖 + 有中文文字（五列）

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  分數: 0   [🖼️]   ┌─────┐   [🖼️]   狗                      │
│  單字: 0   英文圖  │ dog │   中文圖  中文                   │
│                    └─────┘                                  │
│                   黃色按鈕                                   │
└─────────────────────────────────────────────────────────────┘
```

### 情況 2：有英文圖 + 沒有英文文字 + 有中文圖 + 有中文文字（四列）

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  分數: 0   [🖼️]   [🖼️]   狗                                │
│  單字: 0   英文圖  中文圖  中文                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 情況 3：有英文圖 + 有英文文字 + 沒有中文圖 + 沒有中文文字（三列）

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  分數: 0   [🖼️]   ┌─────┐                                  │
│  單字: 0   英文圖  │ dog │                                  │
│                    └─────┘                                  │
│                   黃色按鈕                                   │
└─────────────────────────────────────────────────────────────┘
```

### 情況 4：沒有英文圖 + 有英文文字 + 沒有中文圖 + 有中文文字（三列）

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  分數: 0   ┌─────┐   狗                                     │
│  單字: 0   │ dog │   中文                                   │
│            └─────┘                                          │
│           黃色按鈕                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Git 提交記錄

### 提交 1：保留圖片欄位
- **Commit**: `f315791`
- **Message**: "fix: Preserve imageUrl and chineseImageUrl fields in GEPTManager for five-column layout image display"
- **修改文件**: `public/games/shimozurdo-game/managers/GEPTManager.js`
- **修改內容**: 在三個詞彙載入路徑中保留 `imageUrl` 和 `chineseImageUrl` 欄位

### 提交 2：動態布局調整
- **Commit**: `143380a`
- **Message**: "feat: Dynamic layout adjustment - Hide Chinese image column when no image exists"
- **修改文件**: `public/games/shimozurdo-game/scenes/title.js`
- **修改內容**: 根據圖片是否存在動態調整布局

### 提交 3：靈活顯示邏輯
- **Commit**: `a16d69e`
- **Message**: "feat: Flexible display logic - Show/hide text and images based on content availability"
- **修改文件**: `public/games/shimozurdo-game/scenes/title.js`
- **修改內容**: 根據圖片和文字是否存在動態調整布局

### 提交 4：修復圖片混淆
- **Commit**: `f291a68`
- **Message**: "fix: Only use chineseImageUrl for Chinese image, do not fallback to imageUrl"
- **修改文件**: `public/games/shimozurdo-game/scenes/title.js`
- **修改內容**: 只使用 `chineseImageUrl`，不使用 `imageUrl` 作為 fallback

---

## 📁 修改的文件

### 前端組件
1. `app/create/[templateId]/page.tsx` - 活動創建頁面
2. `components/vocabulary-item-with-image/index.tsx` - 詞彙項目組件
3. `components/input-with-image/index.tsx` - 輸入框組件

### 遊戲邏輯
1. `public/games/shimozurdo-game/scenes/title.js` - 遊戲主場景
2. `public/games/shimozurdo-game/managers/GEPTManager.js` - 詞彙管理器

### API 和資料庫
1. `prisma/schema.prisma` - 資料庫模型
2. `app/api/activities/route.ts` - 活動 API
3. `app/api/activities/[id]/route.ts` - 活動詳情 API
4. `lib/vocabulary/loadVocabularyData.ts` - 詞彙載入工具

---

## 🎉 實施總結

### 成就

- ✅ **修復刪除按鈕布局問題**
- ✅ **確保交換列功能正常工作**
- ✅ **中文框添加圖片功能**
- ✅ **實施獨立圖片功能**
- ✅ **實施動態布局調整**
- ✅ **修復圖片混淆問題**
- ✅ **完整的文檔和測試步驟**

### 影響

- 🎯 用戶體驗大幅提升
- 📱 功能更完整
- 🚀 布局更靈活
- 💡 英文和中文框功能一致
- 🔥 支持所有使用場景

---

## 📝 測試步驟

### 測試環境
- **URL**: https://edu-create.vercel.app/games/shimozurdo-game
- **測試活動**: `activityId=cmh29gjhe0001lb0448h2qt0j&customVocabulary=true`

### 測試清單

1. **測試有圖 + 有文字**
   - ✅ 確認顯示：分數 | 英文圖 | 英文 | 中文圖 | 中文

2. **測試只有圖片**
   - ✅ 確認只顯示：分數 | 英文圖 | 中文圖
   - ✅ 確認文字不顯示

3. **測試只有文字**
   - ✅ 確認只顯示：分數 | 英文 | 中文
   - ✅ 確認圖片不顯示

4. **測試混合配置**
   - ✅ 確認只顯示存在的內容
   - ✅ 確認布局居中對齊

---

## 📚 相關文檔

- [HANDOVER_DOCUMENT.md](./HANDOVER_DOCUMENT.md) - 專案交接文檔
- [TECHNICAL_HANDOVER.md](./TECHNICAL_HANDOVER.md) - 技術交接文檔
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速參考卡片
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API 文檔

---

**文檔完成！** 🎉

