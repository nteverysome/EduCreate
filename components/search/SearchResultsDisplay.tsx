/**
 * 搜索結果顯示組件
 * 展示搜索結果、分面信息和統計數據
 */
import React, { useState } from 'react';
import { SearchResult, SearchResponse } from '../../lib/search/AdvancedSearchManager';
interface SearchResultsDisplayProps {
  searchResponse: SearchResponse;
  onResultClick?: (result: SearchResult) => void;
  onPageChange?: (page: number) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}
export default function SearchResultsDisplay({
  searchResponse,
  onResultClick,
  onPageChange,
  viewMode = 'grid',
  onViewModeChange
}: SearchResultsDisplayProps) {
  const [selectedFacets, setSelectedFacets] = useState<{ [key: string]: string[] }>({});
  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // 格式化數字
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  // 渲染搜索統計
  const renderSearchStats = () => {
    if (!searchResponse.stats) return null;
    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-sm text-blue-600">找到結果</span>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(searchResponse.stats.totalResults)}
              </div>
            </div>
            <div>
              <span className="text-sm text-blue-600">搜索時間</span>
              <div className="text-lg font-semibold text-blue-900">
                {searchResponse.stats.searchTime}ms
              </div>
            </div>
          </div>
          {/* 視圖模式切換 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        {/* 搜索建議 */}
        {searchResponse.stats.suggestions && searchResponse.stats.suggestions.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-blue-600">您可能想搜索: </span>
            {searchResponse.stats.suggestions.map((suggestion, index) => (
              <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                {suggestion}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };
  // 渲染分面過濾器
  const renderFacets = () => {
    if (!searchResponse.facets) return null;
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">過濾器</h3>
        {Object.entries(searchResponse.facets).map(([facetKey, facetValues]) => (
          <div key={facetKey} className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {facetKey === 'activityTypes' ? '活動類型' :
               facetKey === 'geptLevels' ? 'GEPT等級' :
               facetKey === 'difficulties' ? '難度級別' :
               facetKey === 'tags' ? '標籤' :
               facetKey === 'categories' ? '分類' : facetKey}
            </h4>
            <div className="space-y-1">
              {Object.entries(facetValues).map(([value, count]) => (
                <label key={value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFacets[facetKey]?.includes(value) || false}
                    onChange={(e) => {
                      const current = selectedFacets[facetKey] || [];
                      const updated = e.target.checked
                        ? [...current, value]
                        : current.filter(v => v !== value);
                      setSelectedFacets(prev => ({
                        ...prev,
                        [facetKey]: updated
                      }));
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">
                    {value} ({count})
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  // 渲染單個搜索結果
  const renderSearchResult = (result: SearchResult) => {
    const isGridView = viewMode === 'grid';
    return (
      <div
        key={result.id}
        className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
          isGridView ? 'p-4' : 'p-6'
        }`}
        onClick={() => onResultClick?.(result)}
      >
        {/* 縮圖和基本信息 */}
        <div className={`flex ${isGridView ? 'flex-col' : 'flex-row'} gap-4`}>
          {result.thumbnail && (
            <div className={`flex-shrink-0 ${isGridView ? 'w-full h-32' : 'w-24 h-24'}`}>
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {/* 標題和類型 */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {result.title}
              </h3>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {result.type}
              </span>
            </div>
            {/* 描述 */}
            <p className={`text-gray-600 mb-3 ${isGridView ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
              {result.description}
            </p>
            {/* 標籤 */}
            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {result.tags.slice(0, isGridView ? 3 : 5).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {result.tags.length > (isGridView ? 3 : 5) && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{result.tags.length - (isGridView ? 3 : 5)}
                  </span>
                )}
              </div>
            )}
            {/* 元數據 */}
            <div className={`flex items-center justify-between text-sm text-gray-500 ${
              isGridView ? 'flex-col items-start space-y-1' : 'flex-row'
            }`}>
              <div className="flex items-center space-x-4">
                <span>作者: {result.createdBy.name}</span>
                <span>{formatDate(result.createdAt)}</span>
                {result.geptLevel && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {result.geptLevel}
                  </span>
                )}
              </div>
              {/* 統計信息 */}
              {result.stats && (
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {formatNumber(result.stats.views)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {formatNumber(result.stats.likes)}
                  </span>
                  {result.stats.averageScore > 0 && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {result.stats.averageScore.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
            {/* 高亮顯示 */}
            {result.highlights && result.highlights.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 rounded">
                <div className="text-xs text-yellow-800 mb-1">匹配內容:</div>
                {result.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="text-sm text-yellow-900"
                    dangerouslySetInnerHTML={{ __html: highlight }}
                  />
                ))}
              </div>
            )}
            {/* 相關性分數 */}
            {result.relevanceScore && result.relevanceScore > 0 && (
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">相關性:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(result.relevanceScore * 10, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {result.relevanceScore.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  // 渲染分頁
  const renderPagination = () => {
    const { pagination } = searchResponse;
    if (pagination.totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange?.(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一頁
        </button>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`px-3 py-2 text-sm border rounded ${
              page === pagination.page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange?.(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一頁
        </button>
      </div>
    );
  };
  return (
    <div>
      {/* 搜索統計 */}
      {renderSearchStats()}
      <div className="flex gap-6">
        {/* 分面過濾器 */}
        {searchResponse.facets && (
          <div className="w-64 flex-shrink-0">
            {renderFacets()}
          </div>
        )}
        {/* 搜索結果 */}
        <div className="flex-1">
          {searchResponse.results.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.881-6.172-2.328C5.828 12.672 5.828 12.328 6 12c0-2.486 1.006-4.734 2.64-6.36M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到結果</h3>
              <p className="mt-1 text-sm text-gray-500">請嘗試調整搜索條件</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {searchResponse.results.map(renderSearchResult)}
              </div>
              {/* 分頁 */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
