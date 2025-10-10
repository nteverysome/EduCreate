/**
 * 高級搜索演示頁面
 * 展示15個組織工具的高級搜索功能
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import Layout from '../../components/Layout';
import AdvancedSearchInterface from '../../components/search/AdvancedSearchInterface';
import SearchResultsDisplay from '../../components/search/SearchResultsDisplay';
import { SearchOptions, SearchResponse } from '../../lib/search/AdvancedSearchManager';

interface AdvancedSearchDemoProps {
  userId: string;
}

export default function AdvancedSearchDemo({ userId }: AdvancedSearchDemoProps) {
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 執行搜索
  const handleSearch = async (options: SearchOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      // 構建查詢參數
      const params = new URLSearchParams();
      
      if (options.query) params.append('query', options.query);
      if (options.searchType) params.append('searchType', options.searchType);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.includeHighlights) params.append('includeHighlights', options.includeHighlights.toString());
      if (options.includeFacets) params.append('includeFacets', options.includeFacets.toString());
      if (options.includeStats) params.append('includeStats', options.includeStats.toString());

      // 添加過濾器參數
      if (options.filters) {
        const { filters } = options;
        
        if (filters.activityType?.length) params.append('activityType', filters.activityType.join(','));
        if (filters.geptLevel?.length) params.append('geptLevel', filters.geptLevel.join(','));
        if (filters.difficulty?.length) params.append('difficulty', filters.difficulty.join(','));
        if (filters.tags?.length) params.append('tags', filters.tags.join(','));
        if (filters.categories?.length) params.append('categories', filters.categories.join(','));
        
        if (filters.published !== undefined) params.append('published', filters.published.toString());
        if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
        if (filters.shared !== undefined) params.append('shared', filters.shared.toString());
        
        if (filters.createdBy?.length) params.append('createdBy', filters.createdBy.join(','));
        
        if (filters.dateCreatedFrom) params.append('dateCreatedFrom', filters.dateCreatedFrom.toISOString());
        if (filters.dateCreatedTo) params.append('dateCreatedTo', filters.dateCreatedTo.toISOString());
        if (filters.dateUpdatedFrom) params.append('dateUpdatedFrom', filters.dateUpdatedFrom.toISOString());
        if (filters.dateUpdatedTo) params.append('dateUpdatedTo', filters.dateUpdatedTo.toISOString());
        
        if (filters.hasImages !== undefined) params.append('hasImages', filters.hasImages.toString());
        if (filters.hasAudio !== undefined) params.append('hasAudio', filters.hasAudio.toString());
        if (filters.hasVideo !== undefined) params.append('hasVideo', filters.hasVideo.toString());
        if (filters.hasInteractivity !== undefined) params.append('hasInteractivity', filters.hasInteractivity.toString());
        
        if (filters.minCompletionRate !== undefined) params.append('minCompletionRate', filters.minCompletionRate.toString());
        if (filters.maxCompletionRate !== undefined) params.append('maxCompletionRate', filters.maxCompletionRate.toString());
        if (filters.minAverageScore !== undefined) params.append('minAverageScore', filters.minAverageScore.toString());
        if (filters.maxAverageScore !== undefined) params.append('maxAverageScore', filters.maxAverageScore.toString());
      }

      // 發送搜索請求
      const response = await fetch(`/api/search/enhanced?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '搜索失敗');
      }

      const data = await response.json();
      setSearchResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索時發生未知錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置搜索
  const handleReset = () => {
    setSearchResponse(null);
    setError(null);
  };

  // 處理分頁
  const handlePageChange = (page: number) => {
    if (searchResponse) {
      // 重新執行搜索，但更新頁碼
      // 這裡需要保存當前的搜索選項
      console.log('切換到頁面:', page);
    }
  };

  // 處理結果點擊
  const handleResultClick = (result: any) => {
    console.log('點擊結果:', result);
    // 這裡可以導航到活動詳情頁面
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            高級搜索演示
          </h1>
          <p className="text-gray-600">
            展示15個組織工具的高級搜索：全文搜索、模糊匹配、語義搜索、多條件過濾器
          </p>
        </div>

        {/* 搜索界面 */}
        <div className="mb-8">
          <AdvancedSearchInterface
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">搜索錯誤</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* 載入狀態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-600">搜索中...</span>
          </div>
        )}

        {/* 搜索結果 */}
        {searchResponse && !isLoading && (
          <SearchResultsDisplay
            searchResponse={searchResponse}
            onResultClick={handleResultClick}
            onPageChange={handlePageChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {/* 功能說明 */}
        {!searchResponse && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">搜索類型</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">🔍</span>
                  全文搜索 - 搜索標題和描述
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎯</span>
                  模糊匹配 - 容錯搜索
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🧠</span>
                  語義搜索 - 理解搜索意圖
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📝</span>
                  精確匹配 - 完全匹配
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔧</span>
                  通配符搜索 - 使用 * 通配符
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⚡</span>
                  正則表達式 - 高級模式匹配
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">過濾器</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start">
                  <span className="mr-2">📚</span>
                  活動類型 - 15種遊戲類型
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎓</span>
                  GEPT等級 - 初級/中級/中高級
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⭐</span>
                  難度級別 - 簡單/中等/困難
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🏷️</span>
                  標籤和分類 - 多標籤過濾
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📅</span>
                  日期範圍 - 創建/更新時間
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎨</span>
                  內容類型 - 圖片/音頻/視頻
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">排序選項</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">🎯</span>
                  相關性 - 智能相關性排序
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📅</span>
                  日期 - 創建/更新時間
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔤</span>
                  標題 - 字母順序
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔥</span>
                  熱門度 - 瀏覽次數
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⭐</span>
                  評分 - 用戶評分
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  使用次數 - 使用頻率
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: session.user.id,
    },
  };
};
