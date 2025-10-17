# 詞彙載入工具函數使用文檔

## 概述

`lib/vocabulary/loadVocabularyData.ts` 提供了一套完整的詞彙數據載入工具函數，用於統一處理活動中的詞彙數據。

## 為什麼需要這個工具？

EduCreate 專案中的詞彙數據可能存儲在三個不同的地方：

1. **`vocabularyItems`** - 新架構（關聯表）
2. **`elements`** - 中間架構（JSON 字段）
3. **`content.vocabularyItems`** - 舊架構（嵌套在 content 中）

這個工具函數庫提供了統一的方式來處理這三種數據源，避免代碼重複和不一致。

---

## 快速開始

### 安裝

工具函數已經包含在專案中，無需額外安裝。

### 基本使用

```typescript
import { loadVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

// 從活動數據中載入詞彙
const { vocabularyItems, source, count } = loadVocabularyData(activity);

if (count > 0) {
  console.log(`找到 ${count} 個詞彙`);
  // 使用 vocabularyItems...
} else {
  console.log('沒有找到詞彙數據');
}
```

---

## API 參考

### 核心函數

#### `loadVocabularyData(activity)`

從活動數據中載入詞彙數據。

**參數**：
- `activity` (any) - 活動數據對象

**返回值**：
```typescript
{
  vocabularyItems: VocabularyItem[];  // 詞彙數據數組
  source: VocabularyDataSource;       // 數據來源
  count: number;                      // 詞彙數量
}
```

**數據來源類型**：
- `'vocabularyItems'` - 從關聯表載入（新架構）
- `'elements'` - 從 elements 字段載入（中間架構）
- `'content'` - 從 content.vocabularyItems 載入（舊架構）
- `'none'` - 沒有找到數據

**示例**：
```typescript
const { vocabularyItems, source, count } = loadVocabularyData(activity);

console.log(`從 ${source} 載入了 ${count} 個詞彙`);
```

---

#### `normalizeVocabularyItem(item, index)`

標準化詞彙項目格式，處理舊字段名到新字段名的轉換。

**參數**：
- `item` (any) - 原始詞彙項目
- `index` (number) - 項目索引（用於生成 ID）

**返回值**：
```typescript
{
  id: string;              // 項目 ID（自動生成）
  english: string;         // 英文單字
  chinese: string;         // 中文翻譯
  phonetic?: string;       // 音標
  imageUrl?: string;       // 圖片 URL
  audioUrl?: string;       // 音頻 URL
  partOfSpeech?: string;   // 詞性
  difficultyLevel?: string;// 難度等級
  exampleSentence?: string;// 例句
  notes?: string;          // 備註
}
```

**處理的轉換**：
- `word` → `english`
- `translation` → `chinese`
- 自動生成 `id`（如果不存在）

**示例**：
```typescript
const standardizedItems = vocabularyItems.map((item, index) => 
  normalizeVocabularyItem(item, index)
);
```

---

#### `loadAndNormalizeVocabularyData(activity)`

便捷函數，結合載入和標準化。

**參數**：
- `activity` (any) - 活動數據對象

**返回值**：
```typescript
{
  vocabularyItems: VocabularyItem[];  // 標準化後的詞彙數據
  source: VocabularyDataSource;       // 數據來源
  count: number;                      // 詞彙數量
}
```

**示例**：
```typescript
const { vocabularyItems, source, count } = loadAndNormalizeVocabularyData(activity);

// vocabularyItems 已經是標準化格式，可以直接使用
setVocabularyItems(vocabularyItems);
```

---

### 工具函數

#### `hasVocabularyData(activity)`

檢查活動是否有詞彙數據。

**參數**：
- `activity` (any) - 活動數據對象

**返回值**：
- `boolean` - 如果有詞彙數據返回 `true`，否則返回 `false`

**示例**：
```typescript
if (hasVocabularyData(activity)) {
  console.log('這個活動有詞彙數據');
} else {
  console.log('這個活動沒有詞彙數據');
}
```

---

#### `getSourceDisplayName(source)`

獲取數據來源的友好名稱。

**參數**：
- `source` (VocabularyDataSource) - 數據來源類型

**返回值**：
- `string` - 友好的中文名稱

**映射關係**：
- `'vocabularyItems'` → `'關聯表'`
- `'elements'` → `'Elements 字段'`
- `'content'` → `'Content 字段'`
- `'none'` → `'無數據'`

**示例**：
```typescript
const { source } = loadVocabularyData(activity);
console.log(`詞彙來源：${getSourceDisplayName(source)}`);
// 輸出：詞彙來源：關聯表
```

---

## 使用場景

### 場景 1：在編輯頁面載入詞彙

```typescript
import { loadAndNormalizeVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';

// 載入活動數據
const response = await fetch(`/api/activities/${activityId}`);
const activity = await response.json();

// 載入並標準化詞彙數據
const { vocabularyItems, source, count } = loadAndNormalizeVocabularyData(activity);

if (count > 0) {
  setVocabularyItems(vocabularyItems);
  console.log(`✅ 從 ${getSourceDisplayName(source)} 載入詞彙數據:`, count, '個詞彙');
} else {
  console.log('⚠️ 未找到詞彙數據');
}
```

---

### 場景 2：在活動卡片顯示詞彙列表

```typescript
import { loadVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';

const loadVocabularyDataFromAPI = async () => {
  setLoadingVocabulary(true);
  try {
    const response = await fetch(`/api/activities/${activity.id}`);
    const activityData = await response.json();

    // 使用工具函數載入詞彙
    const { vocabularyItems, source, count } = loadVocabularyData(activityData);

    console.log('📝 載入詞彙數據:', {
      activityId: activity.id,
      vocabularyCount: count,
      source: getSourceDisplayName(source)
    });

    setVocabularyData(vocabularyItems);
  } catch (error) {
    console.error('載入詞彙數據失敗:', error);
    setVocabularyData([]);
  } finally {
    setLoadingVocabulary(false);
  }
};
```

---

### 場景 3：檢查活動是否有詞彙

```typescript
import { hasVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

// 在渲染前檢查
if (hasVocabularyData(activity)) {
  return <VocabularyList activity={activity} />;
} else {
  return <EmptyState message="此活動沒有詞彙數據" />;
}
```

---

### 場景 4：手動標準化詞彙數據

```typescript
import { normalizeVocabularyItem } from '@/lib/vocabulary/loadVocabularyData';

// 如果你已經有原始詞彙數據，可以手動標準化
const rawVocabulary = [
  { word: 'hello', translation: '你好' },
  { word: 'world', translation: '世界' }
];

const standardizedVocabulary = rawVocabulary.map((item, index) => 
  normalizeVocabularyItem(item, index)
);

// 結果：
// [
//   { id: '1', english: 'hello', chinese: '你好', ... },
//   { id: '2', english: 'world', chinese: '世界', ... }
// ]
```

---

## 類型定義

### VocabularyItem

```typescript
interface VocabularyItem {
  id: string;              // 項目 ID（必填）
  english: string;         // 英文單字（必填）
  chinese: string;         // 中文翻譯（必填）
  phonetic?: string;       // 音標（選填）
  imageUrl?: string;       // 圖片 URL（選填）
  audioUrl?: string;       // 音頻 URL（選填）
  partOfSpeech?: string;   // 詞性（選填）
  difficultyLevel?: string;// 難度等級（選填）
  exampleSentence?: string;// 例句（選填）
  notes?: string;          // 備註（選填）
  word?: string;           // 兼容舊字段名（選填）
  translation?: string;    // 兼容舊字段名（選填）
}
```

### VocabularyDataSource

```typescript
type VocabularyDataSource = 
  | 'vocabularyItems'  // 新架構：關聯表
  | 'elements'         // 中間架構：JSON 字段
  | 'content'          // 舊架構：嵌套在 content 中
  | 'none';            // 沒有找到數據
```

### LoadVocabularyDataResult

```typescript
interface LoadVocabularyDataResult {
  vocabularyItems: VocabularyItem[];  // 詞彙數據數組
  source: VocabularyDataSource;       // 數據來源
  count: number;                      // 詞彙數量
}
```

---

## 最佳實踐

### 1. 優先使用 `loadAndNormalizeVocabularyData`

如果你需要標準化的詞彙數據，直接使用 `loadAndNormalizeVocabularyData`：

```typescript
// ✅ 推薦
const { vocabularyItems } = loadAndNormalizeVocabularyData(activity);

// ❌ 不推薦（多餘的步驟）
const { vocabularyItems: rawItems } = loadVocabularyData(activity);
const normalizedItems = rawItems.map((item, index) => normalizeVocabularyItem(item, index));
```

### 2. 使用 `getSourceDisplayName` 顯示友好名稱

```typescript
// ✅ 推薦
const { source } = loadVocabularyData(activity);
console.log(`詞彙來源：${getSourceDisplayName(source)}`);
// 輸出：詞彙來源：關聯表

// ❌ 不推薦（不友好）
console.log(`詞彙來源：${source}`);
// 輸出：詞彙來源：vocabularyItems
```

### 3. 檢查 `count` 而不是 `vocabularyItems.length`

```typescript
// ✅ 推薦
const { count } = loadVocabularyData(activity);
if (count > 0) {
  // ...
}

// ❌ 不推薦（多餘的檢查）
const { vocabularyItems } = loadVocabularyData(activity);
if (vocabularyItems && vocabularyItems.length > 0) {
  // ...
}
```

### 4. 使用 `hasVocabularyData` 進行快速檢查

```typescript
// ✅ 推薦（簡潔）
if (hasVocabularyData(activity)) {
  // ...
}

// ❌ 不推薦（冗長）
const { count } = loadVocabularyData(activity);
if (count > 0) {
  // ...
}
```

---

## 常見問題

### Q1: 為什麼有三個不同的數據源？

**A**: 這是由於專案的演進過程：
- **舊架構**：詞彙數據嵌套在 `content.vocabularyItems` 中
- **中間架構**：詞彙數據存儲在 `elements` JSON 字段中
- **新架構**：詞彙數據存儲在關聯表 `vocabularyItems` 中

為了向後兼容，我們需要支持所有三種格式。

### Q2: 工具函數會修改原始數據嗎？

**A**: 不會。所有函數都返回新的數據對象，不會修改原始數據。

### Q3: 如果活動沒有詞彙數據會怎樣？

**A**: 函數會返回空數組和 `'none'` 來源：

```typescript
const { vocabularyItems, source, count } = loadVocabularyData(activity);
// vocabularyItems = []
// source = 'none'
// count = 0
```

### Q4: 可以在服務器端使用這些函數嗎？

**A**: 可以！這些函數是純函數，可以在客戶端和服務器端使用。

### Q5: 如何處理錯誤？

**A**: 工具函數本身不會拋出錯誤。如果數據格式不正確，會返回空數組。你需要在調用 API 的地方處理錯誤：

```typescript
try {
  const response = await fetch(`/api/activities/${activityId}`);
  if (!response.ok) {
    throw new Error('API 請求失敗');
  }
  const activity = await response.json();
  const { vocabularyItems, count } = loadVocabularyData(activity);
  // ...
} catch (error) {
  console.error('載入失敗:', error);
  // 處理錯誤...
}
```

---

## 相關文檔

- [詞彙載入 Bug 分析報告](./VOCABULARY_LOADING_BUG_ANALYSIS.md)
- [詞彙載入邏輯重構文檔](./VOCABULARY_LOADING_REFACTORING.md)
- [API 文檔](./API_DOCUMENTATION.md)

---

## 更新日誌

### v1.0.0 (2025-10-18)

- ✅ 初始版本
- ✅ 支持三層數據源
- ✅ 提供標準化功能
- ✅ 完整的 TypeScript 類型定義
- ✅ 完整的 JSDoc 文檔

---

## 貢獻

如果你發現 bug 或有改進建議，請：

1. 在 GitHub 上創建 Issue
2. 提交 Pull Request
3. 聯繫開發團隊

---

## 授權

MIT License

