/**
 * 社區功能工具函數
 * 
 * 提供社區功能所需的各種工具函數，包括：
 * - Token 生成
 * - 數據驗證
 * - 數據格式化
 * - 熱門度計算
 */

import { customAlphabet } from 'nanoid';

// ==================== Token 生成 ====================

/**
 * 生成唯一的分享 Token
 * 使用 nanoid 生成 16 位字符的 URL 安全字符串
 * 
 * @returns {string} 16 位的分享 Token
 * 
 * @example
 * const token = generateShareToken();
 * // 返回: "VlONrLyZqwl94yMA"
 */
export function generateShareToken(): string {
  // 使用 URL 安全的字符集（不包含容易混淆的字符）
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 16);
  return nanoid();
}

// ==================== 數據驗證 ====================

/**
 * 社區數據驗證結果接口
 */
export interface CommunityDataValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 社區活動數據接口
 */
export interface CommunityActivityData {
  category?: string;
  tags?: string[];
  description?: string;
  thumbnailUrl?: string;
}

/**
 * 驗證社區活動數據
 * 
 * @param {CommunityActivityData} data - 要驗證的社區活動數據
 * @returns {CommunityDataValidationResult} 驗證結果
 * 
 * @example
 * const result = validateCommunityData({
 *   category: 'English',
 *   tags: ['vocabulary', 'beginner'],
 *   description: 'Learn basic English vocabulary'
 * });
 * 
 * if (!result.valid) {
 *   console.error('驗證失敗:', result.errors);
 * }
 */
export function validateCommunityData(data: CommunityActivityData): CommunityDataValidationResult {
  const errors: string[] = [];

  // 驗證分類
  if (data.category) {
    if (typeof data.category !== 'string') {
      errors.push('分類必須是字符串');
    } else if (data.category.trim().length === 0) {
      errors.push('分類不能為空');
    } else if (data.category.length > 50) {
      errors.push('分類長度不能超過 50 個字符');
    }
  }

  // 驗證標籤
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push('標籤必須是數組');
    } else {
      if (data.tags.length === 0) {
        errors.push('至少需要一個標籤');
      } else if (data.tags.length > 10) {
        errors.push('標籤數量不能超過 10 個');
      }

      data.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`標籤 ${index + 1} 必須是字符串`);
        } else if (tag.trim().length === 0) {
          errors.push(`標籤 ${index + 1} 不能為空`);
        } else if (tag.length > 30) {
          errors.push(`標籤 ${index + 1} 長度不能超過 30 個字符`);
        }
      });
    }
  }

  // 驗證描述
  if (data.description) {
    if (typeof data.description !== 'string') {
      errors.push('描述必須是字符串');
    } else if (data.description.length > 500) {
      errors.push('描述長度不能超過 500 個字符');
    }
  }

  // 驗證縮圖 URL
  if (data.thumbnailUrl) {
    if (typeof data.thumbnailUrl !== 'string') {
      errors.push('縮圖 URL 必須是字符串');
    } else {
      try {
        new URL(data.thumbnailUrl);
      } catch {
        errors.push('縮圖 URL 格式不正確');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== 數據格式化 ====================

/**
 * 格式化後的社區活動接口
 */
export interface FormattedCommunityActivity {
  id: string;
  shareToken: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  tags: string[];
  gameType: string;
  content?: any; // ✅ 添加 content 字段，包含 gameTemplateId 等信息
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  stats: {
    views: number;
    likes: number;
    bookmarks: number;
    plays: number;
    comments: number;
  };
  shareUrl: string;
  publishedAt: string;
}

/**
 * 格式化活動數據為社區展示格式
 * 
 * @param {any} activity - Prisma 查詢返回的活動數據
 * @param {string} baseUrl - 基礎 URL（用於生成分享連結）
 * @returns {FormattedCommunityActivity} 格式化後的活動數據
 * 
 * @example
 * const formatted = formatActivityForCommunity(activity, 'https://edu-create.vercel.app');
 * console.log(formatted.shareUrl); // https://edu-create.vercel.app/share/abc123/token
 */
export function formatActivityForCommunity(
  activity: any,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
): FormattedCommunityActivity {
  return {
    id: activity.id,
    shareToken: activity.shareToken,
    title: activity.title,
    description: activity.communityDescription || activity.description || null,
    // 優先使用自動生成的截圖（thumbnailUrl），如果沒有則使用手動設置的社區縮圖
    thumbnailUrl: activity.thumbnailUrl || activity.communityThumbnail || null,
    category: activity.communityCategory || null,
    tags: activity.communityTags || [],
    gameType: activity.templateType || activity.type || 'Unknown',
    content: activity.content, // ✅ 傳遞 content 字段，包含 gameTemplateId
    author: {
      id: activity.user?.id || activity.userId,
      name: activity.user?.name || 'Anonymous',
      image: activity.user?.image || null,
    },
    stats: {
      views: activity.communityViews || 0,
      likes: activity.communityLikes || 0,
      bookmarks: activity.communityBookmarks || 0,
      plays: activity.communityPlays || 0,
      comments: activity.communityComments || 0,
    },
    shareUrl: `${baseUrl}/share/${activity.id}/${activity.shareToken}`,
    publishedAt: activity.publishedToCommunityAt?.toISOString() || activity.createdAt?.toISOString() || new Date().toISOString(),
  };
}

// ==================== 熱門度計算 ====================

/**
 * 計算活動的熱門度分數
 * 
 * 熱門度算法考慮以下因素：
 * - 瀏覽數（權重：1）
 * - 喜歡數（權重：5）
 * - 收藏數（權重：10）
 * - 遊戲次數（權重：3）
 * - 評論數（權重：7）
 * - 時間衰減（越新的活動分數越高）
 * 
 * @param {object} stats - 活動統計數據
 * @param {Date} publishedAt - 發布時間
 * @returns {number} 熱門度分數
 * 
 * @example
 * const score = calculateTrendingScore(
 *   { views: 100, likes: 20, bookmarks: 5, plays: 50, comments: 10 },
 *   new Date('2024-01-01')
 * );
 * console.log(score); // 返回熱門度分數
 */
export function calculateTrendingScore(
  stats: {
    views: number;
    likes: number;
    bookmarks: number;
    plays: number;
    comments: number;
  },
  publishedAt: Date
): number {
  // 基礎分數計算
  const baseScore =
    stats.views * 1 +
    stats.likes * 5 +
    stats.bookmarks * 10 +
    stats.plays * 3 +
    stats.comments * 7;

  // 時間衰減因子
  // 每過一天，分數衰減 5%
  const now = new Date();
  const daysSincePublished = Math.max(0, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
  const decayFactor = Math.pow(0.95, daysSincePublished);

  // 最終分數 = 基礎分數 * 時間衰減因子
  return Math.round(baseScore * decayFactor);
}

// ==================== 分類和標籤管理 ====================

/**
 * 預定義的活動分類
 */
export const ACTIVITY_CATEGORIES = [
  '英文',
  '數學',
  '科學',
  '歷史',
  '地理',
  '藝術',
  '音樂',
  '體育',
  '電腦科學',
  '其他',
] as const;

/**
 * 預定義的常用標籤 - 按照圖片分類
 */

// 年級標籤（藍色背景）
export const GRADE_TAGS = [
  '1年級',
  '2年級',
  '3年級',
  '4年級',
  '5年級',
  '6年級',
  '7年級',
  '8年級',
  '9年級',
  '10年級',
  '11年級',
  '12年級',
] as const;

// 教育階段標籤（藍色背景）
export const EDUCATION_LEVEL_TAGS = [
  '初等教育',
  '中等教育',
  '初中',
  '高中',
  '技術職業等',
  '高等教育',
  '特殊教育',
] as const;

// 科目標籤（白色背景帶邊框）
export const SUBJECT_TAGS = [
  'English',
  '入文學科',
  '經濟',
  '公民',
  '化學',
  '歷史',
  '數學',
  '翻譯',
  '國語',
  '日語',
  '物理',
  '生理',
  '社會研究',
  '科學',
  '自然',
  '地理',
  '藝術',
  '體育',
  '國際',
  '英文',
] as const;

// 所有標籤（用於驗證）
export const COMMON_TAGS = [
  ...GRADE_TAGS,
  ...EDUCATION_LEVEL_TAGS,
  ...SUBJECT_TAGS,
] as const;

/**
 * 驗證分類是否有效
 * 
 * @param {string} category - 要驗證的分類
 * @returns {boolean} 是否為有效分類
 */
export function isValidCategory(category: string): boolean {
  return ACTIVITY_CATEGORIES.includes(category as any);
}

/**
 * 清理和標準化標籤
 * 
 * @param {string[]} tags - 原始標籤數組
 * @returns {string[]} 清理後的標籤數組
 * 
 * @example
 * const cleaned = sanitizeTags(['  Vocabulary  ', 'GRAMMAR', 'vocabulary']);
 * // 返回: ['vocabulary', 'grammar']
 */
export function sanitizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 30)
    )
  ).slice(0, 10); // 最多保留 10 個標籤
}

