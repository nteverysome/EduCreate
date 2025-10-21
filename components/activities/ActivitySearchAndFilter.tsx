'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  Grid2X2,
  List,
  CheckSquare,
  Square,
  X,
  Calendar,
  Eye,
  Type
} from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  viewMode: 'grid' | 'small-grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'small-grid' | 'list') => void;
  selectionMode: boolean;
  onSelectionModeChange: (enabled: boolean) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  // 批量操作回調函數
  onBatchCopy?: () => void;
  onBatchMove?: () => void;
  onBatchDelete?: () => void;
}

export const ActivitySearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterType,
  onFilterTypeChange,
  viewMode,
  onViewModeChange,
  selectionMode,
  onSelectionModeChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchCopy,
  onBatchMove,
  onBatchDelete
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'name', label: '名稱', icon: Type },
    { value: 'modified', label: '修改時間', icon: Calendar },
    { value: 'created', label: '創建時間', icon: Calendar },
    { value: 'playCount', label: '播放次數', icon: Eye }
  ];

  const filterOptions = [
    { value: 'all', label: '全部活動' },
    { value: 'vocabulary', label: '詞彙活動' },
    { value: 'system', label: '系統活動' },
    { value: 'public', label: '公開活動' },
    { value: 'private', label: '私人活動' }
  ];

  return (
    <div className="search-and-filter bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
      {/* 主要搜索欄 - 優化版 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-4">
        {/* 搜索輸入框 - 優化版 */}
        <div className="flex-1 lg:max-w-lg relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜尋我的活動..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 控制按鈕組 - 優化版 */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* 篩選按鈕 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 font-medium
              ${showFilters
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            <span>篩選</span>
          </button>

          {/* 視圖模式切換 - 優化版（3個選項）*/}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`
                p-2.5 rounded-lg transition-all duration-200
                ${viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
              title="網格視圖"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('small-grid')}
              className={`
                p-2.5 rounded-lg transition-all duration-200
                ${viewMode === 'small-grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
              title="小網格視圖"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`
                p-2.5 rounded-lg transition-all duration-200
                ${viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
              title="列表視圖"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 選擇模式按鈕 - 優化版 */}
          <button
            onClick={() => onSelectionModeChange(!selectionMode)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 font-medium
              ${selectionMode
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }
            `}
          >
            {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            <span>選擇</span>
          </button>
        </div>
      </div>

      {/* 選擇模式工具欄 - 響應式設計 */}
      {selectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
          {/* 桌面版：水平佈局 */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4">
              <span className="text-sm lg:text-base text-blue-700 font-medium">
                已選擇 {selectedCount} / {totalCount} 個活動
              </span>
              <button
                onClick={onSelectAll}
                className="text-sm lg:text-base text-blue-600 hover:text-blue-800 underline transition-colors"
              >
                全選
              </button>
              <button
                onClick={onClearSelection}
                className="text-sm lg:text-base text-blue-600 hover:text-blue-800 underline transition-colors"
              >
                清除選擇
              </button>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={onBatchCopy}
                disabled={selectedCount === 0}
                className="px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-500 text-white rounded text-sm lg:text-base hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                複製 ({selectedCount})
              </button>
              <button
                onClick={onBatchMove}
                disabled={selectedCount === 0}
                className="px-3 py-1.5 lg:px-4 lg:py-2 bg-green-500 text-white rounded text-sm lg:text-base hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                移動 ({selectedCount})
              </button>
              <button
                onClick={onBatchDelete}
                disabled={selectedCount === 0}
                className="px-3 py-1.5 lg:px-4 lg:py-2 bg-red-500 text-white rounded text-sm lg:text-base hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                刪除 ({selectedCount})
              </button>
            </div>
          </div>

          {/* 手機版：垂直佈局 */}
          <div className="sm:hidden space-y-3">
            {/* 選擇狀態和控制 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">
                已選擇 {selectedCount} / {totalCount} 個活動
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  全選
                </button>
                <button
                  onClick={onClearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  清除選擇
                </button>
              </div>
            </div>

            {/* 批量操作按鈕 */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onBatchCopy}
                disabled={selectedCount === 0}
                className="px-2 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                複製 ({selectedCount})
              </button>
              <button
                onClick={onBatchMove}
                disabled={selectedCount === 0}
                className="px-2 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                移動 ({selectedCount})
              </button>
              <button
                onClick={onBatchDelete}
                disabled={selectedCount === 0}
                className="px-2 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                刪除 ({selectedCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 展開的篩選選項 - 優化版 */}
      {showFilters && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-100 rounded-xl p-6 mb-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 活動類型篩選 - 優化版 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                活動類型
              </label>
              <select
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序方式 - 優化版 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                排序方式
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序順序 - 優化版 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                排序順序
              </label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => onSortOrderChange('asc')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 rounded-lg font-medium
                    ${sortOrder === 'asc'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <SortAsc className="w-4 h-4" />
                  升序
                </button>
                <button
                  onClick={() => onSortOrderChange('desc')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 rounded-lg font-medium
                    ${sortOrder === 'desc'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <SortDesc className="w-4 h-4" />
                  降序
                </button>
              </div>
            </div>
          </div>

          {/* 快速篩選標籤 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              快速篩選
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '最近修改', filter: 'recent' },
                { label: '最多播放', filter: 'popular' },
                { label: '我的最愛', filter: 'favorite' },
                { label: '已分享', filter: 'shared' }
              ].map(tag => (
                <button
                  key={tag.filter}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 搜索結果摘要 */}
      {searchQuery && (
        <div className="text-sm text-gray-600 mb-2">
          搜索 "{searchQuery}" 的結果：找到 {totalCount} 個活動
        </div>
      )}
    </div>
  );
};

export default ActivitySearchAndFilter;
