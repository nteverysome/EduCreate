/**
 * 高級搜索界面組件
 * 提供15個組織工具的高級搜索功能
 */

import React, { useState, useEffect } from 'react';
import { SearchType, SortOption, SearchFilters, SearchOptions } from '../../lib/search/AdvancedSearchManager';

interface AdvancedSearchInterfaceProps {
  onSearch: (options: SearchOptions) => void;
  onReset: () => void;
  isLoading?: boolean;
  initialOptions?: SearchOptions;
}

export const AdvancedSearchInterface = ({
  onSearch,
  onReset,
  isLoading = false,
  initialOptions
}: AdvancedSearchInterfaceProps) => {
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: '',
    searchType: SearchType.FULL_TEXT,
    filters: {},
    sortBy: SortOption.RELEVANCE,
    sortOrder: 'desc',
    page: 1,
    limit: 20,
    includeHighlights: true,
    includeFacets: true,
    includeStats: true,
    ...initialOptions
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 更新搜索選項
  const updateSearchOptions = (updates: Partial<SearchOptions>) => {
    setSearchOptions(prev => ({
      ...prev,
      ...updates,
      filters: {
        ...prev.filters,
        ...updates.filters
      }
    }));
  };

  // 更新過濾器
  const updateFilters = (updates: Partial<SearchFilters>) => {
    updateSearchOptions({
      filters: {
        ...searchOptions.filters,
        ...updates
      }
    });
  };

  // 執行搜索
  const handleSearch = () => {
    onSearch(searchOptions);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchOptions({
      query: '',
      searchType: SearchType.FULL_TEXT,
      filters: {},
      sortBy: SortOption.RELEVANCE,
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      includeHighlights: true,
      includeFacets: true,
      includeStats: true
    });
    onReset();
  };

  // 搜索類型選項
  const searchTypeOptions = [
    { value: SearchType.FULL_TEXT, label: '全文搜索' },
    { value: SearchType.FUZZY_MATCH, label: '模糊匹配' },
    { value: SearchType.SEMANTIC, label: '語義搜索' },
    { value: SearchType.EXACT_MATCH, label: '精確匹配' },
    { value: SearchType.WILDCARD, label: '通配符搜索' },
    { value: SearchType.REGEX, label: '正則表達式' }
  ];

  // 排序選項
  const sortOptions = [
    { value: SortOption.RELEVANCE, label: '相關性' },
    { value: SortOption.DATE_CREATED, label: '創建日期' },
    { value: SortOption.DATE_UPDATED, label: '更新日期' },
    { value: SortOption.TITLE_ASC, label: '標題 A-Z' },
    { value: SortOption.TITLE_DESC, label: '標題 Z-A' },
    { value: SortOption.POPULARITY, label: '熱門度' },
    { value: SortOption.RATING, label: '評分' },
    { value: SortOption.USAGE_COUNT, label: '使用次數' }
  ];

  // 活動類型選項
  const activityTypeOptions = [
    'matching', 'flashcards', 'quiz', 'wordsearch', 'crossword',
    'fill-in-blanks', 'sequence', 'categorize', 'memory',
    'pronunciation', 'listening', 'reading', 'writing', 'speaking'
  ];

  // GEPT等級選項
  const geptLevelOptions = ['初級', '中級', '中高級'];

  // 難度級別選項
  const difficultyOptions = ['簡單', '中等', '困難'];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* 基本搜索 */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {/* 搜索輸入框 */}
          <div className="flex-1">
            <input
              type="text"
              value={searchOptions.query || ''}
              onChange={(e) => updateSearchOptions({ query: e.target.value })}
              placeholder="輸入搜索關鍵詞..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* 搜索類型選擇 */}
          <div className="w-48">
            <select
              value={searchOptions.searchType}
              onChange={(e) => updateSearchOptions({ searchType: e.target.value as SearchType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {searchTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 搜索按鈕 */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </div>

        {/* 快速過濾器 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
          >
            高級過濾器 {showAdvancedFilters ? '▲' : '▼'}
          </button>
          
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-full hover:bg-red-50"
          >
            重置
          </button>
        </div>
      </div>

      {/* 高級過濾器 */}
      {showAdvancedFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 活動類型過濾 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動類型
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activityTypeOptions.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchOptions.filters?.activityType?.includes(type) || false}
                      onChange={(e) => {
                        const currentTypes = searchOptions.filters?.activityType || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        updateFilters({ activityType: newTypes });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* GEPT等級過濾 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GEPT等級
              </label>
              <div className="space-y-2">
                {geptLevelOptions.map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchOptions.filters?.geptLevel?.includes(level) || false}
                      onChange={(e) => {
                        const currentLevels = searchOptions.filters?.geptLevel || [];
                        const newLevels = e.target.checked
                          ? [...currentLevels, level]
                          : currentLevels.filter(l => l !== level);
                        updateFilters({ geptLevel: newLevels });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 難度級別過濾 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                難度級別
              </label>
              <div className="space-y-2">
                {difficultyOptions.map(difficulty => (
                  <label key={difficulty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchOptions.filters?.difficulty?.includes(difficulty) || false}
                      onChange={(e) => {
                        const currentDifficulties = searchOptions.filters?.difficulty || [];
                        const newDifficulties = e.target.checked
                          ? [...currentDifficulties, difficulty]
                          : currentDifficulties.filter(d => d !== difficulty);
                        updateFilters({ difficulty: newDifficulties });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{difficulty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 狀態過濾器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                狀態
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.filters?.published === true}
                    onChange={(e) => updateFilters({ published: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">已發布</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.filters?.featured === true}
                    onChange={(e) => updateFilters({ featured: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">精選</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.filters?.shared === true}
                    onChange={(e) => updateFilters({ shared: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">已分享</span>
                </label>
              </div>
            </div>

            {/* 內容類型過濾器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                內容類型
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.filters?.hasImages === true}
                    onChange={(e) => updateFilters({ hasImages: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">包含圖片</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.filters?.hasAudio === true}
                    onChange={(e) => updateFilters({ hasAudio: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">包含音頻</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchOptions.filters?.hasVideo === true}
                    onChange={(e) => updateFilters({ hasVideo: e.target.checked ? true : undefined })}
                    className="mr-2"
                  />
                  <span className="text-sm">包含視頻</span>
                </label>
              </div>
            </div>

            {/* 日期範圍過濾器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                創建日期範圍
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={searchOptions.filters?.dateCreatedFrom?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateFilters({ 
                    dateCreatedFrom: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                  placeholder="開始日期"
                />
                <input
                  type="date"
                  value={searchOptions.filters?.dateCreatedTo?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateFilters({ 
                    dateCreatedTo: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                  placeholder="結束日期"
                />
              </div>
            </div>
          </div>

          {/* 排序選項 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">排序方式:</label>
              <select
                value={searchOptions.sortBy}
                onChange={(e) => updateSearchOptions({ sortBy: e.target.value as SortOption })}
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={searchOptions.sortOrder}
                onChange={(e) => updateSearchOptions({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>

          {/* 搜索選項 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchOptions.includeHighlights}
                  onChange={(e) => updateSearchOptions({ includeHighlights: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">包含高亮</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchOptions.includeFacets}
                  onChange={(e) => updateSearchOptions({ includeFacets: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">包含分面</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchOptions.includeStats}
                  onChange={(e) => updateSearchOptions({ includeStats: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">包含統計</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchInterface;
