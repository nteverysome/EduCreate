/**
 * OG Image URL 生成工具
 * 用於生成活動預覽圖的 URL
 */

interface VocabularyItem {
  english: string;
  chinese: string;
}

interface GenerateOGImageUrlOptions {
  activityId: string;
  title: string;
  gameType: string;
  vocabulary?: VocabularyItem[];
}

/**
 * 生成 OG Image URL
 * 
 * @param options - 活動信息
 * @returns OG Image URL
 * 
 * @example
 * ```typescript
 * const url = generateOGImageUrl({
 *   activityId: 'abc123',
 *   title: '我的詞彙遊戲',
 *   gameType: 'airplane',
 *   vocabulary: [
 *     { english: 'hello', chinese: '你好' },
 *     { english: 'world', chinese: '世界' }
 *   ]
 * });
 * // 返回: /api/og/activity/abc123?title=...&gameType=...&vocabulary=...
 * ```
 */
export function generateOGImageUrl(options: GenerateOGImageUrlOptions): string {
  const { activityId, title, gameType, vocabulary = [] } = options;

  // 構建查詢參數
  const params = new URLSearchParams();
  params.set('title', title);
  params.set('gameType', gameType);

  // 只傳遞前 3 個詞彙（減少 URL 長度）
  if (vocabulary.length > 0) {
    const limitedVocabulary = vocabulary.slice(0, 3);
    params.set('vocabulary', JSON.stringify(limitedVocabulary));
  }

  return `/api/og/activity/${activityId}?${params.toString()}`;
}

/**
 * 生成完整的 OG Image URL（包含域名）
 * 用於 Open Graph meta 標籤
 * 
 * @param options - 活動信息
 * @param baseUrl - 基礎 URL（默認從環境變數獲取）
 * @returns 完整的 OG Image URL
 * 
 * @example
 * ```typescript
 * const url = generateFullOGImageUrl({
 *   activityId: 'abc123',
 *   title: '我的詞彙遊戲',
 *   gameType: 'airplane'
 * });
 * // 返回: https://edu-create.vercel.app/api/og/activity/abc123?...
 * ```
 */
export function generateFullOGImageUrl(
  options: GenerateOGImageUrlOptions,
  baseUrl?: string
): string {
  const relativeUrl = generateOGImageUrl(options);
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
  return `${base}${relativeUrl}`;
}

/**
 * 從活動對象生成 OG Image URL
 * 
 * @param activity - 活動對象
 * @returns OG Image URL
 * 
 * @example
 * ```typescript
 * const url = generateOGImageUrlFromActivity(activity);
 * ```
 */
export function generateOGImageUrlFromActivity(activity: any): string {
  // 從不同來源載入詞彙數據
  let vocabulary: VocabularyItem[] = [];

  // 優先使用 vocabularyItems（關聯表）
  if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems)) {
    vocabulary = activity.vocabularyItems.map((item: any) => ({
      english: item.english || '',
      chinese: item.chinese || ''
    }));
  }
  // 其次使用 elements（JSON 字段）
  else if (activity.elements) {
    try {
      const elements = typeof activity.elements === 'string' 
        ? JSON.parse(activity.elements) 
        : activity.elements;
      
      if (Array.isArray(elements)) {
        vocabulary = elements.map((item: any) => ({
          english: item.english || item.word || '',
          chinese: item.chinese || item.translation || ''
        }));
      }
    } catch (e) {
      console.error('Failed to parse elements:', e);
    }
  }
  // 最後使用 content.vocabularyItems（舊架構）
  else if (activity.content?.vocabularyItems) {
    try {
      const items = activity.content.vocabularyItems;
      if (Array.isArray(items)) {
        vocabulary = items.map((item: any) => ({
          english: item.english || item.word || '',
          chinese: item.chinese || item.translation || ''
        }));
      }
    } catch (e) {
      console.error('Failed to parse content.vocabularyItems:', e);
    }
  }

  // 提取遊戲類型，優先使用 gameTemplateId
  let gameType = 'vocabulary'; // 默認值

  // 優先級 1: content.gameTemplateId（最準確）
  if (activity.content?.gameTemplateId) {
    gameType = activity.content.gameTemplateId;
  }
  // 優先級 2: gameTemplateId（直接字段）
  else if (activity.gameTemplateId) {
    gameType = activity.gameTemplateId;
  }
  // 優先級 3: tags 中的遊戲類型（從 tags 數組中查找）
  else if (activity.tags && Array.isArray(activity.tags)) {
    // 查找包含 '-game' 的 tag
    const gameTag = activity.tags.find((tag: string) => tag.includes('-game'));
    if (gameTag) {
      gameType = gameTag;
    }
  }
  // 優先級 4: type 或 gameType（最不準確）
  else if (activity.type || activity.gameType) {
    gameType = activity.type || activity.gameType;
  }

  return generateOGImageUrl({
    activityId: activity.id,
    title: activity.title || '未命名活動',
    gameType,
    vocabulary
  });
}

