'use client';

import React, { useState } from 'react';
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

interface ResultSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'created' | 'deadline' | 'name';
  onSortChange: (sortBy: 'created' | 'deadline' | 'name') => void;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
  viewMode?: 'grid' | 'small-grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'small-grid' | 'list') => void;
}

export const ResultSearchAndFilter: React.FC<ResultSearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder = 'desc',
  onSortOrderChange,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'name', label: '名稱', icon: Type },
    { value: 'created', label: '創建時間', icon: Calendar },
    { value: 'deadline', label: '最後期限', icon: Calendar }
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
              placeholder="搜尋我的結果..."
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

          {/* 視圖模式切換 - 優化版 */}
          {onViewModeChange && (
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
          )}
        </div>
      </div>

      {/* 展開的篩選選項 - 優化版 */}
      {showFilters && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-100 rounded-xl p-6 mb-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 排序方式 - 優化版 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                排序方式
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as 'created' | 'deadline' | 'name')}
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
            {onSortOrderChange && (
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
            )}
          </div>
        </div>
      )}

      {/* 搜索結果摘要 */}
      {searchQuery && (
        <div className="text-sm text-gray-600 mb-2">
          搜索 "{searchQuery}" 的結果
        </div>
      )}
    </div>
  );
};

export default ResultSearchAndFilter;

