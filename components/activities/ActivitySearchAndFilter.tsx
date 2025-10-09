'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
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
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectionMode: boolean;
  onSelectionModeChange: (enabled: boolean) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
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
  onClearSelection
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
    <div className="search-and-filter bg-white border-b border-gray-200 p-4">
      {/* 主要搜索欄 */}
      <div className="flex items-center gap-4 mb-4">
        {/* 搜索輸入框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜尋我的活動..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 篩選按鈕 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors
            ${showFilters 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          篩選
        </button>

        {/* 視圖模式切換 */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`
              p-2 transition-colors
              ${viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }
            `}
            title="網格視圖"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`
              p-2 transition-colors border-l border-gray-300
              ${viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }
            `}
            title="列表視圖"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* 選擇模式切換 */}
        <button
          onClick={() => onSelectionModeChange(!selectionMode)}
          className={`
            flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors
            ${selectionMode 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          選擇
        </button>
      </div>

      {/* 選擇模式工具欄 */}
      {selectionMode && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-700">
              已選擇 {selectedCount} / {totalCount} 個活動
            </span>
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
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              複製
            </button>
            <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
              移動
            </button>
            <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
              刪除
            </button>
          </div>
        </div>
      )}

      {/* 展開的篩選選項 */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 活動類型篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動類型
              </label>
              <select
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序方式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序方式
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序順序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序順序
              </label>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => onSortOrderChange('asc')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors
                    ${sortOrder === 'asc' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <SortAsc className="w-4 h-4" />
                  升序
                </button>
                <button
                  onClick={() => onSortOrderChange('desc')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors border-l border-gray-300
                    ${sortOrder === 'desc' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
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
