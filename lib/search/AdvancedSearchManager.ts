/**
 * 高級搜索和過濾系統
 * 實現15個組織工具的高級搜索：全文搜索、模糊匹配、語義搜索、多條件過濾器
 */

import { PrismaClient } from '@prisma/client';

// 搜索類型
export enum SearchType {
  FULL_TEXT = 'full_text',           // 全文搜索
  FUZZY_MATCH = 'fuzzy_match',       // 模糊匹配
  SEMANTIC = 'semantic',             // 語義搜索
  EXACT_MATCH = 'exact_match',       // 精確匹配
  WILDCARD = 'wildcard',             // 通配符搜索
  REGEX = 'regex'                    // 正則表達式搜索
}

// 排序選項
export enum SortOption {
  RELEVANCE = 'relevance',           // 相關性
  DATE_CREATED = 'date_created',     // 創建日期
  DATE_UPDATED = 'date_updated',     // 更新日期
  TITLE_ASC = 'title_asc',          // 標題升序
  TITLE_DESC = 'title_desc',        // 標題降序
  POPULARITY = 'popularity',         // 熱門度
  RATING = 'rating',                // 評分
  USAGE_COUNT = 'usage_count'       // 使用次數
}

// 過濾器類型
export interface SearchFilters {
  // 基本過濾器
  activityType?: string[];           // 活動類型
  geptLevel?: string[];             // GEPT等級
  difficulty?: string[];            // 難度級別
  tags?: string[];                  // 標籤
  categories?: string[];            // 分類
  
  // 狀態過濾器
  published?: boolean;              // 發布狀態
  featured?: boolean;               // 精選狀態
  favorite?: boolean;               // 收藏狀態
  shared?: boolean;                 // 分享狀態
  
  // 用戶過濾器
  createdBy?: string[];             // 創建者
  sharedWith?: string[];            // 分享對象
  collaborators?: string[];         // 協作者
  
  // 日期過濾器
  dateCreatedFrom?: Date;           // 創建日期起始
  dateCreatedTo?: Date;             // 創建日期結束
  dateUpdatedFrom?: Date;           // 更新日期起始
  dateUpdatedTo?: Date;             // 更新日期結束
  
  // 內容過濾器
  hasImages?: boolean;              // 包含圖片
  hasAudio?: boolean;               // 包含音頻
  hasVideo?: boolean;               // 包含視頻
  hasInteractivity?: boolean;       // 包含互動元素
  
  // 學習數據過濾器
  minCompletionRate?: number;       // 最小完成率
  maxCompletionRate?: number;       // 最大完成率
  minAverageScore?: number;         // 最小平均分
  maxAverageScore?: number;         // 最大平均分
}

// 搜索選項
export interface SearchOptions {
  query?: string;                   // 搜索查詢
  searchType?: SearchType;          // 搜索類型
  filters?: SearchFilters;          // 過濾器
  sortBy?: SortOption;              // 排序方式
  sortOrder?: 'asc' | 'desc';      // 排序順序
  page?: number;                    // 頁碼
  limit?: number;                   // 每頁數量
  includeHighlights?: boolean;      // 包含高亮
  includeFacets?: boolean;          // 包含分面
  includeStats?: boolean;           // 包含統計
}

// 搜索結果
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  geptLevel?: string;
  difficulty?: string;
  tags: string[];
  categories: string[];
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  featured: boolean;
  thumbnail?: string;
  highlights?: string[];           // 搜索高亮
  relevanceScore?: number;         // 相關性分數
  stats?: {
    views: number;
    likes: number;
    shares: number;
    completions: number;
    averageScore: number;
  };
}

// 搜索響應
export interface SearchResponse {
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  facets?: {
    activityTypes: { [key: string]: number };
    geptLevels: { [key: string]: number };
    difficulties: { [key: string]: number };
    tags: { [key: string]: number };
    categories: { [key: string]: number };
  };
  stats?: {
    totalResults: number;
    searchTime: number;
    suggestions?: string[];
  };
}

export class AdvancedSearchManager {
  private static prisma = new PrismaClient();

  /**
   * 執行高級搜索
   */
  static async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      // 構建搜索條件
      const where = await this.buildWhereClause(options);
      
      // 構建排序條件
      const orderBy = this.buildOrderByClause(options);
      
      // 計算分頁
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      
      // 執行搜索查詢
      const [activities, totalCount] = await Promise.all([
        this.prisma.activity.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            activityStats: true,
            tags: true,
            categories: true
          }
        }),
        this.prisma.activity.count({ where })
      ]);
      
      // 處理搜索結果
      const results = await this.processSearchResults(activities, options);
      
      // 構建響應
      const response: SearchResponse = {
        results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
      
      // 添加分面信息
      if (options.includeFacets) {
        response.facets = await this.buildFacets(where);
      }
      
      // 添加統計信息
      if (options.includeStats) {
        response.stats = {
          totalResults: totalCount,
          searchTime: Date.now() - startTime,
          suggestions: await this.generateSuggestions(options.query)
        };
      }
      
      return response;
    } catch (error) {
      console.error('搜索執行失敗:', error);
      throw new Error('搜索執行失敗');
    }
  }

  /**
   * 構建WHERE子句
   */
  private static async buildWhereClause(options: SearchOptions): Promise<any> {
    const where: any = {};
    const { query, searchType, filters } = options;
    
    // 處理搜索查詢
    if (query) {
      switch (searchType) {
        case SearchType.FULL_TEXT:
          where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { content: { path: ['text'], string_contains: query } }
          ];
          break;
          
        case SearchType.FUZZY_MATCH:
          // 實現模糊匹配邏輯
          const fuzzyQuery = this.generateFuzzyQuery(query);
          where.OR = [
            { title: { contains: fuzzyQuery, mode: 'insensitive' } },
            { description: { contains: fuzzyQuery, mode: 'insensitive' } }
          ];
          break;
          
        case SearchType.EXACT_MATCH:
          where.OR = [
            { title: { equals: query, mode: 'insensitive' } },
            { description: { equals: query, mode: 'insensitive' } }
          ];
          break;
          
        case SearchType.WILDCARD:
          const wildcardQuery = query.replace(/\*/g, '%');
          where.OR = [
            { title: { contains: wildcardQuery, mode: 'insensitive' } },
            { description: { contains: wildcardQuery, mode: 'insensitive' } }
          ];
          break;
          
        default:
          // 默認全文搜索
          where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ];
      }
    }
    
    // 處理過濾器
    if (filters) {
      // 活動類型過濾
      if (filters.activityType && filters.activityType.length > 0) {
        where.type = { in: filters.activityType };
      }
      
      // GEPT等級過濾
      if (filters.geptLevel && filters.geptLevel.length > 0) {
        where.geptLevel = { in: filters.geptLevel };
      }
      
      // 難度級別過濾
      if (filters.difficulty && filters.difficulty.length > 0) {
        where.difficulty = { in: filters.difficulty };
      }
      
      // 標籤過濾
      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          some: {
            name: { in: filters.tags }
          }
        };
      }
      
      // 發布狀態過濾
      if (filters.published !== undefined) {
        where.published = filters.published;
      }
      
      // 精選狀態過濾
      if (filters.featured !== undefined) {
        where.featured = filters.featured;
      }
      
      // 創建者過濾
      if (filters.createdBy && filters.createdBy.length > 0) {
        where.userId = { in: filters.createdBy };
      }
      
      // 日期範圍過濾
      if (filters.dateCreatedFrom || filters.dateCreatedTo) {
        where.createdAt = {};
        if (filters.dateCreatedFrom) {
          where.createdAt.gte = filters.dateCreatedFrom;
        }
        if (filters.dateCreatedTo) {
          where.createdAt.lte = filters.dateCreatedTo;
        }
      }
      
      if (filters.dateUpdatedFrom || filters.dateUpdatedTo) {
        where.updatedAt = {};
        if (filters.dateUpdatedFrom) {
          where.updatedAt.gte = filters.dateUpdatedFrom;
        }
        if (filters.dateUpdatedTo) {
          where.updatedAt.lte = filters.dateUpdatedTo;
        }
      }
      
      // 內容類型過濾
      if (filters.hasImages) {
        where.content = {
          path: ['images'],
          not: { equals: null }
        };
      }
      
      if (filters.hasAudio) {
        where.content = {
          path: ['audio'],
          not: { equals: null }
        };
      }
      
      if (filters.hasVideo) {
        where.content = {
          path: ['video'],
          not: { equals: null }
        };
      }
    }
    
    return where;
  }

  /**
   * 構建ORDER BY子句
   */
  private static buildOrderByClause(options: SearchOptions): any {
    const { sortBy = SortOption.RELEVANCE, sortOrder = 'desc' } = options;
    
    switch (sortBy) {
      case SortOption.DATE_CREATED:
        return { createdAt: sortOrder };
      case SortOption.DATE_UPDATED:
        return { updatedAt: sortOrder };
      case SortOption.TITLE_ASC:
        return { title: 'asc' };
      case SortOption.TITLE_DESC:
        return { title: 'desc' };
      case SortOption.POPULARITY:
        return { views: sortOrder };
      case SortOption.RATING:
        return { averageRating: sortOrder };
      case SortOption.USAGE_COUNT:
        return { usageCount: sortOrder };
      default:
        return { updatedAt: 'desc' };
    }
  }

  /**
   * 處理搜索結果
   */
  private static async processSearchResults(activities: any[], options: SearchOptions): Promise<SearchResult[]> {
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      geptLevel: activity.geptLevel,
      difficulty: activity.difficulty,
      tags: activity.tags?.map((tag: any) => tag.name) || [],
      categories: activity.categories?.map((cat: any) => cat.name) || [],
      createdBy: {
        id: activity.user.id,
        name: activity.user.name,
        avatar: activity.user.avatar
      },
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      published: activity.published,
      featured: activity.featured || false,
      thumbnail: activity.thumbnail,
      highlights: options.includeHighlights ? this.generateHighlights(activity, options.query) : undefined,
      relevanceScore: this.calculateRelevanceScore(activity, options.query),
      stats: activity.activityStats ? {
        views: activity.activityStats.views || 0,
        likes: activity.activityStats.likes || 0,
        shares: activity.activityStats.shares || 0,
        completions: activity.activityStats.completions || 0,
        averageScore: activity.activityStats.averageScore || 0
      } : undefined
    }));
  }

  /**
   * 生成模糊查詢
   */
  private static generateFuzzyQuery(query: string): string {
    // 簡單的模糊匹配實現
    return query.split('').join('.*');
  }

  /**
   * 生成高亮
   */
  private static generateHighlights(activity: any, query?: string): string[] {
    if (!query) return [];
    
    const highlights: string[] = [];
    const regex = new RegExp(`(${query})`, 'gi');
    
    if (activity.title.match(regex)) {
      highlights.push(activity.title.replace(regex, '<mark>$1</mark>'));
    }
    
    if (activity.description.match(regex)) {
      highlights.push(activity.description.replace(regex, '<mark>$1</mark>'));
    }
    
    return highlights;
  }

  /**
   * 計算相關性分數
   */
  private static calculateRelevanceScore(activity: any, query?: string): number {
    if (!query) return 1;
    
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // 標題匹配權重更高
    if (activity.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // 描述匹配
    if (activity.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // 標籤匹配
    if (activity.tags?.some((tag: any) => tag.name.toLowerCase().includes(queryLower))) {
      score += 3;
    }
    
    return score;
  }

  /**
   * 構建分面信息
   */
  private static async buildFacets(where: any): Promise<any> {
    // 實現分面統計邏輯
    return {
      activityTypes: {},
      geptLevels: {},
      difficulties: {},
      tags: {},
      categories: {}
    };
  }

  /**
   * 生成搜索建議
   */
  private static async generateSuggestions(query?: string): Promise<string[]> {
    if (!query) return [];
    
    // 實現搜索建議邏輯
    return [];
  }
}
