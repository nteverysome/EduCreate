/**
 * 詞彙數據載入工具函數
 * 
 * 這個工具函數提供了統一的詞彙數據載入邏輯，支持三層數據源：
 * 1. vocabularyItems - 新架構（關聯表）
 * 2. elements - 中間架構（JSON 字段）
 * 3. content.vocabularyItems - 舊架構（嵌套在 content 中）
 * 
 * 使用這個工具函數的好處：
 * - 避免代碼重複
 * - 保持所有地方的邏輯一致
 * - 容易維護和擴展
 * - 容易測試
 */

/**
 * 詞彙項目接口
 */
export interface VocabularyItem {
  id: string;  // ID 總是存在（如果原始數據沒有，會自動生成）
  english: string;
  chinese: string;
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
  partOfSpeech?: string;
  difficultyLevel?: string;
  exampleSentence?: string;
  notes?: string;
  word?: string;        // 兼容舊字段名
  translation?: string; // 兼容舊字段名
}

/**
 * 詞彙數據來源類型
 */
export type VocabularyDataSource = 
  | 'vocabularyItems'  // 新架構：關聯表
  | 'elements'         // 中間架構：JSON 字段
  | 'content'          // 舊架構：嵌套在 content 中
  | 'none';            // 沒有找到數據

/**
 * 載入詞彙數據的返回類型
 */
export interface LoadVocabularyDataResult {
  vocabularyItems: VocabularyItem[];
  source: VocabularyDataSource;
  count: number;
}

/**
 * 從活動數據中載入詞彙數據
 * 
 * 這個函數會按照優先級檢查三個可能的數據源：
 * 1. vocabularyItems（關聯表）- 最新的架構
 * 2. elements（JSON 字段）- 中間架構
 * 3. content.vocabularyItems（嵌套）- 舊架構
 * 
 * 只有當數組存在且長度大於 0 時才會使用該數據源。
 * 
 * @param activity - 活動數據對象（可以是任何包含詞彙數據的對象）
 * @returns 包含詞彙數據、數據來源和數量的對象
 * 
 * @example
 * ```typescript
 * const { vocabularyItems, source, count } = loadVocabularyData(activity);
 * 
 * if (count > 0) {
 *   console.log(`從 ${source} 載入了 ${count} 個詞彙`);
 *   // 使用 vocabularyItems...
 * } else {
 *   console.log('沒有找到詞彙數據');
 * }
 * ```
 */
export function loadVocabularyData(activity: any): LoadVocabularyDataResult {
  // 檢查 vocabularyItems（新架構：關聯表）
  if (
    activity?.vocabularyItems && 
    Array.isArray(activity.vocabularyItems) && 
    activity.vocabularyItems.length > 0
  ) {
    return {
      vocabularyItems: activity.vocabularyItems,
      source: 'vocabularyItems',
      count: activity.vocabularyItems.length
    };
  }
  
  // 檢查 elements（中間架構：JSON 字段）
  if (
    activity?.elements && 
    Array.isArray(activity.elements) && 
    activity.elements.length > 0
  ) {
    return {
      vocabularyItems: activity.elements,
      source: 'elements',
      count: activity.elements.length
    };
  }
  
  // 檢查 content.vocabularyItems（舊架構：嵌套在 content 中）
  if (
    activity?.content?.vocabularyItems && 
    Array.isArray(activity.content.vocabularyItems) && 
    activity.content.vocabularyItems.length > 0
  ) {
    return {
      vocabularyItems: activity.content.vocabularyItems,
      source: 'content',
      count: activity.content.vocabularyItems.length
    };
  }
  
  // 沒有找到任何詞彙數據
  return {
    vocabularyItems: [],
    source: 'none',
    count: 0
  };
}

/**
 * 標準化詞彙項目格式
 * 
 * 將不同來源的詞彙項目轉換為統一的格式。
 * 這個函數處理舊字段名（word, translation）到新字段名（english, chinese）的轉換。
 * 
 * @param item - 原始詞彙項目
 * @param index - 項目索引（用於生成 ID）
 * @returns 標準化後的詞彙項目
 * 
 * @example
 * ```typescript
 * const standardizedItems = vocabularyItems.map((item, index) => 
 *   normalizeVocabularyItem(item, index)
 * );
 * ```
 */
export function normalizeVocabularyItem(item: any, index: number): VocabularyItem {
  return {
    id: item.id || (index + 1).toString(),
    english: item.english || item.word || '',
    chinese: item.chinese || item.translation || '',
    phonetic: item.phonetic || '',
    imageUrl: item.imageUrl || '',
    audioUrl: item.audioUrl || '',
    partOfSpeech: item.partOfSpeech || '',
    difficultyLevel: item.difficultyLevel || '',
    exampleSentence: item.exampleSentence || '',
    notes: item.notes || ''
  };
}

/**
 * 載入並標準化詞彙數據
 * 
 * 這是一個便捷函數，結合了 loadVocabularyData 和 normalizeVocabularyItem。
 * 它會載入詞彙數據並自動標準化格式。
 * 
 * @param activity - 活動數據對象
 * @returns 包含標準化詞彙數據、數據來源和數量的對象
 * 
 * @example
 * ```typescript
 * const { vocabularyItems, source, count } = loadAndNormalizeVocabularyData(activity);
 * 
 * // vocabularyItems 已經是標準化格式，可以直接使用
 * setVocabularyItems(vocabularyItems);
 * ```
 */
export function loadAndNormalizeVocabularyData(activity: any): LoadVocabularyDataResult {
  const result = loadVocabularyData(activity);
  
  if (result.count > 0) {
    return {
      ...result,
      vocabularyItems: result.vocabularyItems.map((item, index) => 
        normalizeVocabularyItem(item, index)
      )
    };
  }
  
  return result;
}

/**
 * 檢查活動是否有詞彙數據
 * 
 * 這是一個便捷函數，用於快速檢查活動是否包含詞彙數據。
 * 
 * @param activity - 活動數據對象
 * @returns 如果有詞彙數據返回 true，否則返回 false
 * 
 * @example
 * ```typescript
 * if (hasVocabularyData(activity)) {
 *   console.log('這個活動有詞彙數據');
 * } else {
 *   console.log('這個活動沒有詞彙數據');
 * }
 * ```
 */
export function hasVocabularyData(activity: any): boolean {
  const { count } = loadVocabularyData(activity);
  return count > 0;
}

/**
 * 獲取詞彙數據來源的友好名稱
 * 
 * @param source - 數據來源類型
 * @returns 友好的中文名稱
 * 
 * @example
 * ```typescript
 * const { source } = loadVocabularyData(activity);
 * console.log(`詞彙來源：${getSourceDisplayName(source)}`);
 * // 輸出：詞彙來源：關聯表
 * ```
 */
export function getSourceDisplayName(source: VocabularyDataSource): string {
  const displayNames: Record<VocabularyDataSource, string> = {
    vocabularyItems: '關聯表',
    elements: 'Elements 字段',
    content: 'Content 字段',
    none: '無數據'
  };
  
  return displayNames[source];
}

