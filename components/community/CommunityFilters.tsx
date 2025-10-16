'use client';

/**
 * 社區篩選組件
 * 
 * 提供社區活動的篩選功能：
 * - 分類篩選
 * - 標籤篩選
 * - 排序方式
 * - 搜尋
 */

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ACTIVITY_CATEGORIES, GRADE_TAGS, EDUCATION_LEVEL_TAGS, SUBJECT_TAGS } from '@/lib/community/utils';

interface CommunityFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  category?: string;
  tags: string[];
  search: string;
  sortBy: 'trending' | 'latest' | 'popular' | 'views';
  featured: boolean;
}

export default function CommunityFilters({ onFilterChange, initialFilters }: CommunityFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      tags: [],
      search: '',
      sortBy: 'trending',
      featured: false,
    }
  );

  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      tags: [],
      search: '',
      sortBy: 'trending',
      featured: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const hasActiveFilters = filters.category || filters.tags.length > 0 || filters.featured;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* 搜尋和排序 */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* 搜尋框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜尋活動..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 排序 */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="trending">🔥 熱門</option>
          <option value="latest">🆕 最新</option>
          <option value="popular">❤️ 最受歡迎</option>
          <option value="views">👁️ 最多瀏覽</option>
        </select>

        {/* 篩選按鈕 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={20} />
          <span>篩選</span>
          {hasActiveFilters && (
            <span className="bg-white text-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {(filters.category ? 1 : 0) + filters.tags.length + (filters.featured ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* 展開的篩選選項 */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* 精選 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => updateFilters({ featured: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">⭐ 只顯示精選活動</span>
            </label>
          </div>

          {/* 分類 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">分類</h4>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    updateFilters({
                      category: filters.category === category ? undefined : category,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.category === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 年級標籤 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">年級</h4>
            <div className="flex flex-wrap gap-2">
              {GRADE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 教育階段標籤 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">教育階段</h4>
            <div className="flex flex-wrap gap-2">
              {EDUCATION_LEVEL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 科目標籤 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">科目</h4>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 清除篩選 */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} />
                <span>清除所有篩選</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

