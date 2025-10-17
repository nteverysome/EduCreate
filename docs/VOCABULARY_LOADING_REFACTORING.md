# 詞彙載入邏輯重構文檔

## 重構目標

將重複的詞彙載入邏輯抽象為共用工具函數，避免代碼重複和不一致。

## 問題背景

在修復詞彙載入 bug 的過程中，我們發現了兩個地方有幾乎相同的代碼：

1. **編輯頁面**（`app/create/[templateId]/page.tsx`）
2. **活動卡片**（`components/activities/WordwallStyleActivityCard.tsx`）

兩個地方都有 20-40 行的重複代碼來處理三層詞彙數據源的檢查。

### 代碼重複的問題

1. **維護困難**：需要修改多個地方
2. **容易出錯**：容易遺漏某個地方
3. **代碼冗長**：相同邏輯重複多次

## 解決方案

### 創建共用工具函數

創建 `lib/vocabulary/loadVocabularyData.ts` 文件，提供統一的詞彙載入邏輯。

### 核心函數

#### 1. `loadVocabularyData(activity)`

從活動數據中載入詞彙數據，支持三層數據源：

```typescript
const { vocabularyItems, source, count } = loadVocabularyData(activity);
```

**返回值**：
- `vocabularyItems`: 詞彙數據數組
- `source`: 數據來源（'vocabularyItems' | 'elements' | 'content' | 'none'）
- `count`: 詞彙數量

**檢查順序**：
1. `vocabularyItems`（關聯表）- 最新架構
2. `elements`（JSON 字段）- 中間架構
3. `content.vocabularyItems`（嵌套）- 舊架構

#### 2. `normalizeVocabularyItem(item, index)`

標準化詞彙項目格式，處理舊字段名到新字段名的轉換：

```typescript
const standardizedItem = normalizeVocabularyItem(item, index);
```

**處理的轉換**：
- `word` → `english`
- `translation` → `chinese`
- 自動生成 `id`（如果不存在）

#### 3. `loadAndNormalizeVocabularyData(activity)`

便捷函數，結合載入和標準化：

```typescript
const { vocabularyItems, source, count } = loadAndNormalizeVocabularyData(activity);
// vocabularyItems 已經是標準化格式
```

#### 4. 其他工具函數

- `hasVocabularyData(activity)`: 檢查是否有詞彙數據
- `getSourceDisplayName(source)`: 獲取數據來源的友好名稱

## 重構前後對比

### 編輯頁面（app/create/[templateId]/page.tsx）

#### 重構前（37 行代碼）

```typescript
let vocabularyData: Array<{
  english?: string;
  word?: string;
  chinese?: string;
  translation?: string;
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
}> = [];

if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems) && activity.vocabularyItems.length > 0) {
  vocabularyData = activity.vocabularyItems;
  console.log('📝 從關聯表載入詞彙數據:', vocabularyData.length, '個詞彙');
} else if ((activity as any).elements && Array.isArray((activity as any).elements) && (activity as any).elements.length > 0) {
  vocabularyData = (activity as any).elements;
  console.log('📝 從 elements 字段載入詞彙數據:', vocabularyData.length, '個詞彙');
} else if (activity.content && activity.content.vocabularyItems && Array.isArray(activity.content.vocabularyItems) && activity.content.vocabularyItems.length > 0) {
  vocabularyData = activity.content.vocabularyItems;
  console.log('📝 從 content 載入詞彙數據:', vocabularyData.length, '個詞彙');
}

if (vocabularyData.length > 0) {
  const loadedVocabulary = vocabularyData.map((item, index: number) => ({
    id: (index + 1).toString(),
    english: item.english || item.word || '',
    chinese: item.chinese || item.translation || '',
    phonetic: item.phonetic || '',
    imageUrl: item.imageUrl || '',
    audioUrl: item.audioUrl || ''
  }));
  setVocabularyItems(loadedVocabulary);
  console.log('✅ 詞彙數據載入成功:', loadedVocabulary);
} else {
  console.log('⚠️ 未找到詞彙數據');
}
```

#### 重構後（10 行代碼）

```typescript
// 使用統一的詞彙載入工具函數
const { vocabularyItems: loadedVocabulary, source, count } = loadAndNormalizeVocabularyData(activity);

if (count > 0) {
  setVocabularyItems(loadedVocabulary);
  console.log(`✅ 從 ${getSourceDisplayName(source)} 載入詞彙數據:`, count, '個詞彙');
  console.log('✅ 詞彙數據載入成功:', loadedVocabulary);
} else {
  console.log('⚠️ 未找到詞彙數據');
}
```

**改進**：
- ✅ 代碼行數減少 73%（37 行 → 10 行）
- ✅ 邏輯更清晰
- ✅ 類型安全（使用統一的 VocabularyItem 接口）

---

### 活動卡片（components/activities/WordwallStyleActivityCard.tsx）

#### 重構前（45 行代碼）

```typescript
const loadVocabularyData = async () => {
  if (vocabularyData || loadingVocabulary) return;

  setLoadingVocabulary(true);
  try {
    const response = await fetch(`/api/activities/${activity.id}`);
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }

    const activityData = await response.json();

    let vocabularyItems = [];
    let dataSource = 'unknown';

    if (activityData?.vocabularyItems && Array.isArray(activityData.vocabularyItems) && activityData.vocabularyItems.length > 0) {
      vocabularyItems = activityData.vocabularyItems;
      dataSource = 'vocabularyItems關聯表';
    } else if (activityData?.elements && Array.isArray(activityData.elements) && activityData.elements.length > 0) {
      vocabularyItems = activityData.elements;
      dataSource = 'elements字段';
    } else if (activityData?.content?.vocabularyItems && Array.isArray(activityData.content.vocabularyItems) && activityData.content.vocabularyItems.length > 0) {
      vocabularyItems = activityData.content.vocabularyItems;
      dataSource = 'content.vocabularyItems';
    }

    console.log('📝 載入詞彙數據:', {
      activityId: activity.id,
      vocabularyCount: vocabularyItems.length,
      source: dataSource
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

#### 重構後（30 行代碼）

```typescript
const loadVocabularyDataFromAPI = async () => {
  if (vocabularyData || loadingVocabulary) return;

  setLoadingVocabulary(true);
  try {
    const response = await fetch(`/api/activities/${activity.id}`);
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }

    const activityData = await response.json();

    // 使用統一的詞彙載入工具函數
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

**改進**：
- ✅ 代碼行數減少 33%（45 行 → 30 行）
- ✅ 邏輯更清晰
- ✅ 數據來源顯示更友好

## 使用示例

### 基本使用

```typescript
import { loadVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';

const { vocabularyItems, source, count } = loadVocabularyData(activity);

if (count > 0) {
  console.log(`從 ${getSourceDisplayName(source)} 載入了 ${count} 個詞彙`);
  // 使用 vocabularyItems...
} else {
  console.log('沒有找到詞彙數據');
}
```

### 載入並標準化

```typescript
import { loadAndNormalizeVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

const { vocabularyItems, source, count } = loadAndNormalizeVocabularyData(activity);

// vocabularyItems 已經是標準化格式，可以直接使用
setVocabularyItems(vocabularyItems);
```

### 快速檢查

```typescript
import { hasVocabularyData } from '@/lib/vocabulary/loadVocabularyData';

if (hasVocabularyData(activity)) {
  console.log('這個活動有詞彙數據');
} else {
  console.log('這個活動沒有詞彙數據');
}
```

## 好處總結

### 1. 代碼簡潔

- 編輯頁面：37 行 → 10 行（減少 73%）
- 活動卡片：45 行 → 30 行（減少 33%）

### 2. 維護容易

- 只需要維護一個地方（`lib/vocabulary/loadVocabularyData.ts`）
- 所有使用的地方自動保持一致

### 3. 類型安全

- 統一的 `VocabularyItem` 接口
- TypeScript 類型檢查

### 4. 容易測試

- 可以單獨測試工具函數
- 不需要測試每個使用的地方

### 5. 容易擴展

如果未來需要添加第四個數據源，只需要修改一個地方：

```typescript
// lib/vocabulary/loadVocabularyData.ts
export function loadVocabularyData(activity: any): LoadVocabularyDataResult {
  // 檢查 vocabularyItems
  if (...) { return ...; }
  
  // 檢查 elements
  if (...) { return ...; }
  
  // 檢查 content.vocabularyItems
  if (...) { return ...; }
  
  // 檢查新的數據源（只需要在這裡添加）
  if (activity?.newDataSource && ...) {
    return {
      vocabularyItems: activity.newDataSource,
      source: 'newDataSource',
      count: activity.newDataSource.length
    };
  }
  
  return { vocabularyItems: [], source: 'none', count: 0 };
}
```

所有使用這個函數的地方自動獲得新功能！

## 部署信息

- **提交 ID**：e9315dd
- **提交信息**：refactor: 抽象詞彙載入邏輯為共用工具函數
- **修改文件**：
  - `lib/vocabulary/loadVocabularyData.ts`（新建，249 行）
  - `app/create/[templateId]/page.tsx`（簡化）
  - `components/activities/WordwallStyleActivityCard.tsx`（簡化）
- **推送時間**：2025-10-18 02:05 GMT+8
- **Vercel 部署**：等待中（1-2 分鐘）

## 相關文檔

- [詞彙載入 Bug 分析報告](./VOCABULARY_LOADING_BUG_ANALYSIS.md)
- [API 文檔](./API_DOCUMENTATION.md)

## 未來改進建議

1. **添加單元測試**：為 `loadVocabularyData.ts` 添加完整的單元測試
2. **添加 JSDoc 文檔**：已完成 ✅
3. **考慮使用 Zod 進行數據驗證**：確保數據格式正確
4. **添加性能監控**：記錄詞彙載入的性能指標

