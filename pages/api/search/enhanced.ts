/**
 * 增強搜索API
 * 實現15個組織工具的高級搜索：全文搜索、模糊匹配、語義搜索、多條件過濾器
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../middleware/withTestAuth';
import { AdvancedSearchManager, SearchType, SortOption, SearchOptions } from '../../../lib/search/AdvancedSearchManager';

async function enhancedSearchHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息（可能來自會話或測試令牌）
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  // 檢查用戶認證狀態
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以使用高級搜索功能',
      code: 'UNAUTHORIZED'
    });
  }
  
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    const { 
      query,                    // 搜索關鍵詞
      searchType = 'full_text', // 搜索類型
      activityType,            // 活動類型（逗號分隔）
      geptLevel,               // GEPT等級（逗號分隔）
      difficulty,              // 難度級別（逗號分隔）
      tags,                    // 標籤（逗號分隔）
      categories,              // 分類（逗號分隔）
      published,               // 發布狀態
      featured,                // 精選狀態
      shared,                  // 分享狀態
      createdBy,               // 創建者ID（逗號分隔）
      dateCreatedFrom,         // 創建日期範圍（開始）
      dateCreatedTo,           // 創建日期範圍（結束）
      dateUpdatedFrom,         // 更新日期範圍（開始）
      dateUpdatedTo,           // 更新日期範圍（結束）
      hasImages,               // 包含圖片
      hasAudio,                // 包含音頻
      hasVideo,                // 包含視頻
      hasInteractivity,        // 包含互動元素
      minCompletionRate,       // 最小完成率
      maxCompletionRate,       // 最大完成率
      minAverageScore,         // 最小平均分
      maxAverageScore,         // 最大平均分
      sortBy = 'relevance',    // 排序字段
      sortOrder = 'desc',      // 排序方向
      page = 1,                // 頁碼
      limit = 20,              // 每頁數量
      includeHighlights = 'true',  // 包含高亮
      includeFacets = 'true',      // 包含分面
      includeStats = 'true'        // 是否包含統計數據
    } = req.query;
    
    // 構建搜索選項
    const searchOptions: SearchOptions = {
      query: query as string,
      searchType: searchType as SearchType,
      filters: {
        // 基本過濾器
        activityType: activityType ? (activityType as string).split(',').map(t => t.trim()) : undefined,
        geptLevel: geptLevel ? (geptLevel as string).split(',').map(l => l.trim()) : undefined,
        difficulty: difficulty ? (difficulty as string).split(',').map(d => d.trim()) : undefined,
        tags: tags ? (tags as string).split(',').map(t => t.trim()) : undefined,
        categories: categories ? (categories as string).split(',').map(c => c.trim()) : undefined,
        
        // 狀態過濾器
        published: published !== undefined ? published === 'true' : undefined,
        featured: featured !== undefined ? featured === 'true' : undefined,
        shared: shared !== undefined ? shared === 'true' : undefined,
        
        // 用戶過濾器
        createdBy: createdBy ? (createdBy as string).split(',').map(u => u.trim()) : undefined,
        
        // 日期過濾器
        dateCreatedFrom: dateCreatedFrom ? new Date(dateCreatedFrom as string) : undefined,
        dateCreatedTo: dateCreatedTo ? new Date(dateCreatedTo as string) : undefined,
        dateUpdatedFrom: dateUpdatedFrom ? new Date(dateUpdatedFrom as string) : undefined,
        dateUpdatedTo: dateUpdatedTo ? new Date(dateUpdatedTo as string) : undefined,
        
        // 內容過濾器
        hasImages: hasImages !== undefined ? hasImages === 'true' : undefined,
        hasAudio: hasAudio !== undefined ? hasAudio === 'true' : undefined,
        hasVideo: hasVideo !== undefined ? hasVideo === 'true' : undefined,
        hasInteractivity: hasInteractivity !== undefined ? hasInteractivity === 'true' : undefined,
        
        // 學習數據過濾器
        minCompletionRate: minCompletionRate ? Number(minCompletionRate) : undefined,
        maxCompletionRate: maxCompletionRate ? Number(maxCompletionRate) : undefined,
        minAverageScore: minAverageScore ? Number(minAverageScore) : undefined,
        maxAverageScore: maxAverageScore ? Number(maxAverageScore) : undefined
      },
      sortBy: sortBy as SortOption,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: Number(page),
      limit: Number(limit),
      includeHighlights: includeHighlights === 'true',
      includeFacets: includeFacets === 'true',
      includeStats: includeStats === 'true'
    };
    
    // 執行高級搜索
    const searchResponse = await AdvancedSearchManager.search(searchOptions);
    
    // 添加額外的響應信息
    const enhancedResponse = {
      ...searchResponse,
      meta: {
        searchType: searchType,
        appliedFilters: Object.keys(searchOptions.filters || {}).filter(
          key => searchOptions.filters?.[key as keyof typeof searchOptions.filters] !== undefined
        ),
        userId: session?.user?.id || user?.id,
        timestamp: new Date().toISOString()
      }
    };
    
    return res.status(200).json(enhancedResponse);
  } catch (error) {
    console.error('增強搜索錯誤:', error);
    return res.status(500).json({ 
      error: '搜索失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'ENHANCED_SEARCH_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(enhancedSearchHandler);
