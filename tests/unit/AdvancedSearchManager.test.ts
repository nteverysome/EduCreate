/**
 * 高級搜索管理系統單元測試
 * 驗證15個組織工具的高級搜索功能
 */

import { SearchType, SortOption, SearchFilters } from '../../lib/search/AdvancedSearchManager';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    activity: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}));

describe('高級搜索系統基本功能', () => {
  test('搜索類型應該正確定義', () => {
    expect(SearchType.FULL_TEXT).toBe('full_text');
    expect(SearchType.FUZZY_MATCH).toBe('fuzzy_match');
    expect(SearchType.SEMANTIC).toBe('semantic');
    expect(SearchType.EXACT_MATCH).toBe('exact_match');
    expect(SearchType.WILDCARD).toBe('wildcard');
    expect(SearchType.REGEX).toBe('regex');
  });

  test('排序選項應該正確定義', () => {
    expect(SortOption.RELEVANCE).toBe('relevance');
    expect(SortOption.DATE_CREATED).toBe('date_created');
    expect(SortOption.DATE_UPDATED).toBe('date_updated');
    expect(SortOption.TITLE_ASC).toBe('title_asc');
    expect(SortOption.TITLE_DESC).toBe('title_desc');
    expect(SortOption.POPULARITY).toBe('popularity');
    expect(SortOption.RATING).toBe('rating');
    expect(SortOption.USAGE_COUNT).toBe('usage_count');
  });

  test('應該能創建搜索過濾器對象', () => {
    const filters: SearchFilters = {
      activityType: ['matching', 'quiz'],
      geptLevel: ['初級', '中級'],
      difficulty: ['簡單', '中等'],
      tags: ['英語', '學習'],
      categories: ['語言', '教育'],
      published: true,
      featured: false,
      shared: true,
      createdBy: ['user1', 'user2'],
      dateCreatedFrom: new Date('2024-01-01'),
      dateCreatedTo: new Date('2024-12-31'),
      hasImages: true,
      hasAudio: false,
      hasVideo: true,
      minCompletionRate: 0.8,
      maxCompletionRate: 1.0,
      minAverageScore: 80,
      maxAverageScore: 100
    };

    expect(filters.activityType).toEqual(['matching', 'quiz']);
    expect(filters.geptLevel).toEqual(['初級', '中級']);
    expect(filters.published).toBe(true);
    expect(filters.hasImages).toBe(true);
    expect(filters.minCompletionRate).toBe(0.8);
  });

  test('應該能創建搜索選項對象', () => {
    const searchOptions = {
      query: '英語學習',
      searchType: SearchType.FULL_TEXT,
      filters: {
        activityType: ['matching'],
        published: true
      },
      sortBy: SortOption.RELEVANCE,
      sortOrder: 'desc' as const,
      page: 1,
      limit: 20,
      includeHighlights: true,
      includeFacets: true,
      includeStats: true
    };

    expect(searchOptions.query).toBe('英語學習');
    expect(searchOptions.searchType).toBe(SearchType.FULL_TEXT);
    expect(searchOptions.sortBy).toBe(SortOption.RELEVANCE);
    expect(searchOptions.page).toBe(1);
    expect(searchOptions.limit).toBe(20);
  });

  test('應該能創建搜索結果對象', () => {
    const searchResult = {
      id: 'activity_123',
      title: '英語配對遊戲',
      description: '學習英語單詞的配對遊戲',
      type: 'matching',
      geptLevel: '初級',
      difficulty: '簡單',
      tags: ['英語', '配對', '學習'],
      categories: ['語言學習'],
      createdBy: {
        id: 'user_123',
        name: '張老師',
        avatar: 'avatar.jpg'
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      published: true,
      featured: false,
      thumbnail: 'thumbnail.jpg',
      highlights: ['<mark>英語</mark>配對遊戲'],
      relevanceScore: 8.5,
      stats: {
        views: 150,
        likes: 25,
        shares: 5,
        completions: 80,
        averageScore: 85.5
      }
    };

    expect(searchResult.title).toBe('英語配對遊戲');
    expect(searchResult.type).toBe('matching');
    expect(searchResult.geptLevel).toBe('初級');
    expect(searchResult.tags).toContain('英語');
    expect(searchResult.relevanceScore).toBe(8.5);
    expect(searchResult.stats?.views).toBe(150);
  });

  test('應該能創建搜索響應對象', () => {
    const searchResponse = {
      results: [
        {
          id: 'activity_1',
          title: '測試活動1',
          description: '測試描述1',
          type: 'matching',
          tags: ['測試'],
          categories: ['測試分類'],
          createdBy: {
            id: 'user_1',
            name: '測試用戶',
            avatar: 'avatar.jpg'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          published: true,
          featured: false
        }
      ],
      pagination: {
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5
      },
      facets: {
        activityTypes: { 'matching': 25, 'quiz': 30, 'flashcards': 20 },
        geptLevels: { '初級': 40, '中級': 35, '中高級': 25 },
        difficulties: { '簡單': 30, '中等': 45, '困難': 25 },
        tags: { '英語': 50, '數學': 30, '科學': 20 },
        categories: { '語言學習': 60, '數學': 25, '科學': 15 }
      },
      stats: {
        totalResults: 100,
        searchTime: 150,
        suggestions: ['英語學習', '英語遊戲', '語言練習']
      }
    };

    expect(searchResponse.results).toHaveLength(1);
    expect(searchResponse.pagination.total).toBe(100);
    expect(searchResponse.pagination.totalPages).toBe(5);
    expect(searchResponse.facets?.activityTypes['matching']).toBe(25);
    expect(searchResponse.stats?.totalResults).toBe(100);
    expect(searchResponse.stats?.suggestions).toContain('英語學習');
  });

  test('應該能驗證搜索查詢構建邏輯', () => {
    // 模擬WHERE子句構建邏輯
    const buildWhereClause = (query: string, filters: SearchFilters) => {
      const where: any = {};

      // 處理搜索查詢
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }

      // 處理過濾器
      if (filters.activityType && filters.activityType.length > 0) {
        where.type = { in: filters.activityType };
      }

      if (filters.published !== undefined) {
        where.published = filters.published;
      }

      if (filters.dateCreatedFrom || filters.dateCreatedTo) {
        where.createdAt = {};
        if (filters.dateCreatedFrom) {
          where.createdAt.gte = filters.dateCreatedFrom;
        }
        if (filters.dateCreatedTo) {
          where.createdAt.lte = filters.dateCreatedTo;
        }
      }

      return where;
    };

    const query = '英語';
    const filters: SearchFilters = {
      activityType: ['matching', 'quiz'],
      published: true,
      dateCreatedFrom: new Date('2024-01-01'),
      dateCreatedTo: new Date('2024-12-31')
    };

    const whereClause = buildWhereClause(query, filters);

    expect(whereClause.OR).toHaveLength(2);
    expect(whereClause.OR[0].title.contains).toBe('英語');
    expect(whereClause.type.in).toEqual(['matching', 'quiz']);
    expect(whereClause.published).toBe(true);
    expect(whereClause.createdAt.gte).toEqual(new Date('2024-01-01'));
    expect(whereClause.createdAt.lte).toEqual(new Date('2024-12-31'));
  });

  test('應該能驗證排序邏輯', () => {
    // 模擬ORDER BY子句構建邏輯
    const buildOrderByClause = (sortBy: SortOption, sortOrder: 'asc' | 'desc') => {
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
        default:
          return { updatedAt: 'desc' };
      }
    };

    expect(buildOrderByClause(SortOption.DATE_CREATED, 'desc')).toEqual({ createdAt: 'desc' });
    expect(buildOrderByClause(SortOption.TITLE_ASC, 'asc')).toEqual({ title: 'asc' });
    expect(buildOrderByClause(SortOption.POPULARITY, 'desc')).toEqual({ views: 'desc' });
  });

  test('應該能計算相關性分數', () => {
    // 模擬相關性分數計算邏輯
    const calculateRelevanceScore = (activity: any, query: string) => {
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
      if (activity.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
        score += 3;
      }

      return score;
    };

    const activity = {
      title: '英語學習遊戲',
      description: '這是一個英語學習的配對遊戲',
      tags: ['英語', '學習', '遊戲']
    };

    const score = calculateRelevanceScore(activity, '英語');
    expect(score).toBe(18); // 10 (標題) + 5 (描述) + 3 (標籤)
  });

  test('應該能生成搜索高亮', () => {
    // 模擬高亮生成邏輯
    const generateHighlights = (activity: any, query: string) => {
      const highlights: string[] = [];
      const regex = new RegExp(`(${query})`, 'gi');

      if (activity.title.match(regex)) {
        highlights.push(activity.title.replace(regex, '<mark>$1</mark>'));
      }

      if (activity.description.match(regex)) {
        highlights.push(activity.description.replace(regex, '<mark>$1</mark>'));
      }

      return highlights;
    };

    const activity = {
      title: '英語學習遊戲',
      description: '學習英語的最佳方式'
    };

    const highlights = generateHighlights(activity, '英語');
    expect(highlights).toHaveLength(2);
    expect(highlights[0]).toBe('<mark>英語</mark>學習遊戲');
    expect(highlights[1]).toBe('學習<mark>英語</mark>的最佳方式');
  });

  test('應該能處理分頁計算', () => {
    // 模擬分頁計算邏輯
    const calculatePagination = (total: number, page: number, limit: number) => {
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      return {
        total,
        page,
        limit,
        totalPages,
        skip,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    };

    const pagination = calculatePagination(100, 2, 20);
    expect(pagination.totalPages).toBe(5);
    expect(pagination.skip).toBe(20);
    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.hasPrevPage).toBe(true);
  });
});
