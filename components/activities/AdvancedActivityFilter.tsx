/**
 * AdvancedActivityFilter.tsx - 高級活動過濾器組件
 * 實現GEPT等級、模板類型、標籤、日期範圍、學習狀態的多維度過濾功能
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';

// 活動數據接口
interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  isShared: boolean;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  learningEffectiveness?: number;
  usageCount: number;
  tags: string[];
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  templateType?: string;
  learningState?: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  subject?: string;
  author?: string;
}

// 過濾器配置接口
interface FilterConfig {
  geptLevels: string[];
  templateTypes: string[];
  tags: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  learningStates: string[];
  difficulties: number[];
  subjects: string[];
  authors: string[];
  sizeRange: {
    min: number;
    max: number;
  };
  usageRange: {
    min: number;
    max: number;
  };
  effectivenessRange: {
    min: number;
    max: number;
  };
  showSharedOnly: boolean;
  showFavoritesOnly: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// 組件屬性
interface AdvancedActivityFilterProps {
  activities: Activity[];
  onFilterChange: (filteredActivities: Activity[]) => void;
  onFilterConfigChange?: (config: FilterConfig) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// 預設過濾器配置
const DEFAULT_FILTER_CONFIG: FilterConfig = {
  geptLevels: [],
  templateTypes: [],
  tags: [],
  dateRange: { start: null, end: null },
  learningStates: [],
  difficulties: [],
  subjects: [],
  authors: [],
  sizeRange: { min: 0, max: Infinity },
  usageRange: { min: 0, max: Infinity },
  effectivenessRange: { min: 0, max: 100 },
  showSharedOnly: false,
  showFavoritesOnly: false,
  sortBy: 'updatedAt',
  sortOrder: 'desc'
};

// GEPT 等級選項
const GEPT_LEVELS = [
  { value: 'elementary', label: '初級 (Elementary)', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: '中級 (Intermediate)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high-intermediate', label: '中高級 (High-Intermediate)', color: 'bg-red-100 text-red-800' }
];

// 模板類型選項
const TEMPLATE_TYPES = [
  { value: 'match', label: '配對遊戲', icon: '🎯' },
  { value: 'quiz', label: '測驗', icon: '❓' },
  { value: 'flashcard', label: '閃卡', icon: '📚' },
  { value: 'fill-blank', label: '填空', icon: '✏️' },
  { value: 'sequence', label: '排序', icon: '🔢' },
  { value: 'word-search', label: '找字遊戲', icon: '🔍' },
  { value: 'crossword', label: '填字遊戲', icon: '📝' },
  { value: 'memory', label: '記憶遊戲', icon: '🧠' }
];

// 學習狀態選項
const LEARNING_STATES = [
  { value: 'not-started', label: '未開始', color: 'bg-gray-100 text-gray-800', icon: '⚪' },
  { value: 'in-progress', label: '進行中', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800', icon: '🟢' },
  { value: 'mastered', label: '已精通', color: 'bg-purple-100 text-purple-800', icon: '🟣' }
];

export const AdvancedActivityFilter: React.FC<AdvancedActivityFilterProps> = ({
  activities,
  onFilterChange,
  onFilterConfigChange,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(DEFAULT_FILTER_CONFIG);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // 從活動數據中提取可用選項
  const availableOptions = useMemo(() => {
    const tags = new Set<string>();
    const subjects = new Set<string>();
    const authors = new Set<string>();
    const templateTypes = new Set<string>();

    activities.forEach(activity => {
      activity.tags.forEach(tag => tags.add(tag));
      if (activity.subject) subjects.add(activity.subject);
      if (activity.author) authors.add(activity.author);
      if (activity.templateType) templateTypes.add(activity.templateType);
    });

    return {
      tags: Array.from(tags).sort(),
      subjects: Array.from(subjects).sort(),
      authors: Array.from(authors).sort(),
      templateTypes: Array.from(templateTypes).sort()
    };
  }, [activities]);

  // 應用過濾器
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // GEPT 等級過濾
    if (filterConfig.geptLevels.length > 0) {
      filtered = filtered.filter(activity => 
        activity.geptLevel && filterConfig.geptLevels.includes(activity.geptLevel)
      );
    }

    // 模板類型過濾
    if (filterConfig.templateTypes.length > 0) {
      filtered = filtered.filter(activity => 
        activity.type && filterConfig.templateTypes.includes(activity.type)
      );
    }

    // 標籤過濾
    if (filterConfig.tags.length > 0) {
      filtered = filtered.filter(activity => 
        activity.tags.some(tag => filterConfig.tags.includes(tag))
      );
    }

    // 日期範圍過濾
    if (filterConfig.dateRange.start || filterConfig.dateRange.end) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.updatedAt);
        const start = filterConfig.dateRange.start;
        const end = filterConfig.dateRange.end;
        
        if (start && activityDate < start) return false;
        if (end && activityDate > end) return false;
        return true;
      });
    }

    // 學習狀態過濾
    if (filterConfig.learningStates.length > 0) {
      filtered = filtered.filter(activity => 
        activity.learningState && filterConfig.learningStates.includes(activity.learningState)
      );
    }

    // 難度過濾
    if (filterConfig.difficulties.length > 0) {
      filtered = filtered.filter(activity => 
        activity.difficulty && filterConfig.difficulties.includes(activity.difficulty)
      );
    }

    // 主題過濾
    if (filterConfig.subjects.length > 0) {
      filtered = filtered.filter(activity => 
        activity.subject && filterConfig.subjects.includes(activity.subject)
      );
    }

    // 作者過濾
    if (filterConfig.authors.length > 0) {
      filtered = filtered.filter(activity => 
        activity.author && filterConfig.authors.includes(activity.author)
      );
    }

    // 大小範圍過濾
    if (filterConfig.sizeRange.min > 0 || filterConfig.sizeRange.max < Infinity) {
      filtered = filtered.filter(activity => 
        activity.size >= filterConfig.sizeRange.min && 
        activity.size <= filterConfig.sizeRange.max
      );
    }

    // 使用次數範圍過濾
    if (filterConfig.usageRange.min > 0 || filterConfig.usageRange.max < Infinity) {
      filtered = filtered.filter(activity => 
        activity.usageCount >= filterConfig.usageRange.min && 
        activity.usageCount <= filterConfig.usageRange.max
      );
    }

    // 學習效果範圍過濾
    if (filterConfig.effectivenessRange.min > 0 || filterConfig.effectivenessRange.max < 100) {
      filtered = filtered.filter(activity => 
        activity.learningEffectiveness && 
        activity.learningEffectiveness * 100 >= filterConfig.effectivenessRange.min && 
        activity.learningEffectiveness * 100 <= filterConfig.effectivenessRange.max
      );
    }

    // 分享狀態過濾
    if (filterConfig.showSharedOnly) {
      filtered = filtered.filter(activity => activity.isShared);
    }

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[filterConfig.sortBy as keyof Activity];
      const bValue = b[filterConfig.sortBy as keyof Activity];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return filterConfig.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [activities, filterConfig]);

  // 更新過濾器配置
  const updateFilterConfig = useCallback((updates: Partial<FilterConfig>) => {
    const newConfig = { ...filterConfig, ...updates };
    setFilterConfig(newConfig);
    
    // 計算活躍過濾器數量
    let count = 0;
    if (newConfig.geptLevels.length > 0) count++;
    if (newConfig.templateTypes.length > 0) count++;
    if (newConfig.tags.length > 0) count++;
    if (newConfig.dateRange.start || newConfig.dateRange.end) count++;
    if (newConfig.learningStates.length > 0) count++;
    if (newConfig.difficulties.length > 0) count++;
    if (newConfig.subjects.length > 0) count++;
    if (newConfig.authors.length > 0) count++;
    if (newConfig.showSharedOnly) count++;
    if (newConfig.showFavoritesOnly) count++;
    
    setActiveFiltersCount(count);
    onFilterConfigChange?.(newConfig);
  }, [filterConfig, onFilterConfigChange]);

  // 應用過濾結果
  React.useEffect(() => {
    onFilterChange(filteredActivities);
  }, [filteredActivities, onFilterChange]);

  // 清除所有過濾器
  const clearAllFilters = useCallback(() => {
    setFilterConfig(DEFAULT_FILTER_CONFIG);
    setActiveFiltersCount(0);
  }, []);

  // 渲染多選框組
  const renderCheckboxGroup = (
    title: string,
    options: Array<{ value: string; label: string; color?: string; icon?: string }>,
    selectedValues: string[],
    onChange: (values: string[]) => void,
    testId: string
  ) => (
    <div className="filter-group mb-4" data-testid={testId}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedValues, option.value]);
                } else {
                  onChange(selectedValues.filter(v => v !== option.value));
                }
              }}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm px-2 py-1 rounded ${option.color || 'text-gray-700'}`}>
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  if (isCollapsed) {
    return (
      <div className={`advanced-filter-collapsed ${className}`} data-testid="advanced-filter-collapsed">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          data-testid="expand-filter-button"
        >
          <span className="text-lg">🔍</span>
          <span className="text-sm font-medium">高級過濾器</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <span className="text-gray-400">▼</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`advanced-activity-filter bg-white border border-gray-200 rounded-lg p-4 ${className}`} data-testid="advanced-activity-filter">
      {/* 過濾器標題和控制 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">高級過濾器</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount} 個過濾器
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
            data-testid="clear-all-filters"
          >
            清除全部
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-gray-400 hover:text-gray-600"
              data-testid="collapse-filter-button"
            >
              ▲
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* GEPT 等級過濾 */}
        {renderCheckboxGroup(
          'GEPT 等級',
          GEPT_LEVELS,
          filterConfig.geptLevels,
          (values) => updateFilterConfig({ geptLevels: values }),
          'gept-level-filter'
        )}

        {/* 模板類型過濾 */}
        {renderCheckboxGroup(
          '模板類型',
          TEMPLATE_TYPES,
          filterConfig.templateTypes,
          (values) => updateFilterConfig({ templateTypes: values }),
          'template-type-filter'
        )}

        {/* 學習狀態過濾 */}
        {renderCheckboxGroup(
          '學習狀態',
          LEARNING_STATES,
          filterConfig.learningStates,
          (values) => updateFilterConfig({ learningStates: values }),
          'learning-state-filter'
        )}

        {/* 標籤過濾 */}
        {availableOptions.tags.length > 0 && renderCheckboxGroup(
          '標籤',
          availableOptions.tags.map(tag => ({ value: tag, label: tag })),
          filterConfig.tags,
          (values) => updateFilterConfig({ tags: values }),
          'tags-filter'
        )}

        {/* 主題過濾 */}
        {availableOptions.subjects.length > 0 && renderCheckboxGroup(
          '主題',
          availableOptions.subjects.map(subject => ({ value: subject, label: subject })),
          filterConfig.subjects,
          (values) => updateFilterConfig({ subjects: values }),
          'subjects-filter'
        )}

        {/* 作者過濾 */}
        {availableOptions.authors.length > 0 && renderCheckboxGroup(
          '作者',
          availableOptions.authors.map(author => ({ value: author, label: author })),
          filterConfig.authors,
          (values) => updateFilterConfig({ authors: values }),
          'authors-filter'
        )}
      </div>

      {/* 日期範圍過濾 */}
      <div className="filter-group mt-6 pt-4 border-t border-gray-200" data-testid="date-range-filter">
        <h4 className="text-sm font-medium text-gray-700 mb-2">日期範圍</h4>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">開始日期</label>
            <input
              type="date"
              value={filterConfig.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateFilterConfig({
                dateRange: {
                  ...filterConfig.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null
                }
              })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">結束日期</label>
            <input
              type="date"
              value={filterConfig.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateFilterConfig({
                dateRange: {
                  ...filterConfig.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null
                }
              })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* 其他選項 */}
      <div className="filter-group mt-4 pt-4 border-t border-gray-200" data-testid="other-options-filter">
        <h4 className="text-sm font-medium text-gray-700 mb-2">其他選項</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filterConfig.showSharedOnly}
              onChange={(e) => updateFilterConfig({ showSharedOnly: e.target.checked })}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">只顯示已分享的活動</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filterConfig.showFavoritesOnly}
              onChange={(e) => updateFilterConfig({ showFavoritesOnly: e.target.checked })}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">只顯示收藏的活動</span>
          </label>
        </div>
      </div>

      {/* 排序選項 */}
      <div className="filter-group mt-4 pt-4 border-t border-gray-200" data-testid="sort-options-filter">
        <h4 className="text-sm font-medium text-gray-700 mb-2">排序</h4>
        <div className="flex items-center gap-4">
          <select
            value={filterConfig.sortBy}
            onChange={(e) => updateFilterConfig({ sortBy: e.target.value })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="updatedAt">更新時間</option>
            <option value="createdAt">創建時間</option>
            <option value="title">標題</option>
            <option value="usageCount">使用次數</option>
            <option value="learningEffectiveness">學習效果</option>
            <option value="size">文件大小</option>
          </select>
          <select
            value={filterConfig.sortOrder}
            onChange={(e) => updateFilterConfig({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>

      {/* 過濾結果統計 */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600" data-testid="filter-results-stats">
        顯示 {filteredActivities.length} / {activities.length} 個活動
        {activeFiltersCount > 0 && (
          <span className="ml-2">({activeFiltersCount} 個過濾器已啟用)</span>
        )}
      </div>
    </div>
  );
};
