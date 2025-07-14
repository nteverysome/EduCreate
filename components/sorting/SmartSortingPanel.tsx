/**
 * 智能排序面板組件
 * 提供多維度智能排序的用戶界面
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  SortCriteria, 
  SortDirection, 
  SortConfig, 
  SortingPreset,
  SmartSortingOptions,
  smartSortingManager 
} from '@/lib/sorting/SmartSortingManager';

interface SmartSortingPanelProps {
  onSortChange: (config: SortConfig, options?: SmartSortingOptions) => void;
  currentSort?: SortConfig;
  className?: string;
  showAdvanced?: boolean;
  contextualHints?: {
    sessionContext?: 'study' | 'review' | 'create' | 'browse';
    userGoals?: string[];
  };
}

const SORT_CRITERIA_LABELS: Record<SortCriteria, string> = {
  [SortCriteria.NAME]: '名稱',
  [SortCriteria.CREATED_DATE]: '創建日期',
  [SortCriteria.UPDATED_DATE]: '修改日期',
  [SortCriteria.LAST_ACCESSED]: '最後訪問',
  [SortCriteria.SIZE]: '大小',
  [SortCriteria.TYPE]: '類型',
  [SortCriteria.ACCESS_COUNT]: '使用次數',
  [SortCriteria.RECENT_ACCESS]: '最近使用',
  [SortCriteria.SESSION_TIME]: '使用時長',
  [SortCriteria.LEARNING_SCORE]: '學習分數',
  [SortCriteria.COMPLETION_RATE]: '完成率',
  [SortCriteria.RETENTION_RATE]: '記憶保持率',
  [SortCriteria.DIFFICULTY]: '難度等級',
  [SortCriteria.SHARE_COUNT]: '分享次數',
  [SortCriteria.COLLABORATORS]: '協作者數量',
  [SortCriteria.GEPT_LEVEL]: 'GEPT等級',
  [SortCriteria.SMART_RELEVANCE]: 'AI智能推薦'
};

const SORT_DIRECTION_LABELS: Record<SortDirection, string> = {
  [SortDirection.ASC]: '升序',
  [SortDirection.DESC]: '降序'
};

export default function SmartSortingPanel({
  onSortChange,
  currentSort,
  className = '',
  showAdvanced = false,
  contextualHints
}: SmartSortingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'advanced'>('presets');
  const [sortingPresets, setSortingPresets] = useState<SortingPreset[]>([]);
  const [suggestions, setSuggestions] = useState<SortingPreset[]>([]);
  const [customSort, setCustomSort] = useState<SortConfig>({
    primary: { criteria: SortCriteria.NAME, direction: SortDirection.ASC }
  });
  const [showCreatePreset, setShowCreatePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  // 載入排序預設
  useEffect(() => {
    const presets = smartSortingManager.getSortingPresets();
    setSortingPresets(presets);

    // 獲取智能建議
    const smartSuggestions = smartSortingManager.getSmartSortingSuggestions([], {
      contextualFactors: {
        sessionContext: contextualHints?.sessionContext,
        userLearningGoals: contextualHints?.userGoals
      }
    });
    setSuggestions(smartSuggestions);
  }, [contextualHints]);

  // 應用排序預設
  const handlePresetSelect = useCallback((preset: SortingPreset) => {
    const config = smartSortingManager.useSortingPreset(preset.id);
    if (config) {
      onSortChange(config);
      setIsOpen(false);
    }
  }, [onSortChange]);

  // 應用自定義排序
  const handleCustomSort = useCallback(() => {
    onSortChange(customSort);
    setIsOpen(false);
  }, [customSort, onSortChange]);

  // 創建新預設
  const handleCreatePreset = useCallback(() => {
    if (newPresetName.trim()) {
      const preset = smartSortingManager.createCustomPreset(
        newPresetName.trim(),
        newPresetDescription.trim(),
        customSort
      );
      
      setSortingPresets(prev => [...prev, preset]);
      setShowCreatePreset(false);
      setNewPresetName('');
      setNewPresetDescription('');
      
      // 應用新創建的預設
      handlePresetSelect(preset);
    }
  }, [newPresetName, newPresetDescription, customSort, handlePresetSelect]);

  // 更新自定義排序配置
  const updateCustomSort = useCallback((
    level: 'primary' | 'secondary' | 'tertiary',
    field: 'criteria' | 'direction',
    value: SortCriteria | SortDirection
  ) => {
    setCustomSort(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value
      }
    }));
  }, []);

  // 移除排序級別
  const removeCustomSortLevel = useCallback((level: 'secondary' | 'tertiary') => {
    setCustomSort(prev => {
      const newSort = { ...prev };
      delete newSort[level];
      return newSort;
    });
  }, []);

  // 添加排序級別
  const addCustomSortLevel = useCallback((level: 'secondary' | 'tertiary') => {
    setCustomSort(prev => ({
      ...prev,
      [level]: { criteria: SortCriteria.NAME, direction: SortDirection.ASC }
    }));
  }, []);

  // 獲取當前排序的顯示文本
  const getCurrentSortText = useCallback(() => {
    if (!currentSort) return '選擇排序方式';
    
    const preset = sortingPresets.find(p => 
      JSON.stringify(p.config) === JSON.stringify(currentSort)
    );
    
    if (preset) {
      return preset.name;
    }
    
    const primaryText = `${SORT_CRITERIA_LABELS[currentSort.primary.criteria]} ${SORT_DIRECTION_LABELS[currentSort.primary.direction]}`;
    return currentSort.secondary ? `${primaryText} + 多級排序` : primaryText;
  }, [currentSort, sortingPresets]);

  return (
    <div className={`relative ${className}`}>
      {/* 排序按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        data-testid="smart-sorting-trigger"
        aria-label="打開智能排序面板"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {getCurrentSortText()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 排序面板 */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          data-testid="smart-sorting-panel"
        >
          {/* 標籤頭 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'presets'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="presets-tab"
            >
              快速排序
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="custom-tab"
            >
              自定義排序
            </button>
            {showAdvanced && (
              <button
                onClick={() => setActiveTab('advanced')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'advanced'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                data-testid="advanced-tab"
              >
                高級選項
              </button>
            )}
          </div>

          {/* 內容區域 */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* 預設排序標籤 */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                {/* 智能建議 */}
                {suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      智能推薦
                    </h4>
                    <div className="space-y-2">
                      {suggestions.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          data-testid={`suggestion-${preset.id}`}
                        >
                          <div className="font-medium text-blue-800">{preset.name}</div>
                          <div className="text-sm text-blue-600">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 所有預設 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">所有排序方式</h4>
                  <div className="space-y-2">
                    {sortingPresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`preset-${preset.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{preset.name}</div>
                            <div className="text-sm text-gray-600">{preset.description}</div>
                          </div>
                          {preset.usageCount > 0 && (
                            <div className="text-xs text-gray-400">
                              使用 {preset.usageCount} 次
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 自定義排序標籤 */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-800">自定義排序規則</h4>
                
                {/* 主要排序 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">主要排序</label>
                  <div className="flex gap-2">
                    <select
                      value={customSort.primary.criteria}
                      onChange={(e) => updateCustomSort('primary', 'criteria', e.target.value as SortCriteria)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="primary-criteria-select"
                    >
                      {Object.entries(SORT_CRITERIA_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <select
                      value={customSort.primary.direction}
                      onChange={(e) => updateCustomSort('primary', 'direction', e.target.value as SortDirection)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="primary-direction-select"
                    >
                      {Object.entries(SORT_DIRECTION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 次要排序 */}
                {customSort.secondary ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">次要排序</label>
                      <button
                        onClick={() => removeCustomSortLevel('secondary')}
                        className="text-red-600 hover:text-red-800 text-sm"
                        data-testid="remove-secondary-sort"
                      >
                        移除
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={customSort.secondary.criteria}
                        onChange={(e) => updateCustomSort('secondary', 'criteria', e.target.value as SortCriteria)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="secondary-criteria-select"
                      >
                        {Object.entries(SORT_CRITERIA_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <select
                        value={customSort.secondary.direction}
                        onChange={(e) => updateCustomSort('secondary', 'direction', e.target.value as SortDirection)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="secondary-direction-select"
                      >
                        {Object.entries(SORT_DIRECTION_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addCustomSortLevel('secondary')}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                    data-testid="add-secondary-sort"
                  >
                    + 添加次要排序
                  </button>
                )}

                {/* 第三級排序 */}
                {customSort.secondary && (
                  customSort.tertiary ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">第三級排序</label>
                        <button
                          onClick={() => removeCustomSortLevel('tertiary')}
                          className="text-red-600 hover:text-red-800 text-sm"
                          data-testid="remove-tertiary-sort"
                        >
                          移除
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={customSort.tertiary.criteria}
                          onChange={(e) => updateCustomSort('tertiary', 'criteria', e.target.value as SortCriteria)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="tertiary-criteria-select"
                        >
                          {Object.entries(SORT_CRITERIA_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <select
                          value={customSort.tertiary.direction}
                          onChange={(e) => updateCustomSort('tertiary', 'direction', e.target.value as SortDirection)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          data-testid="tertiary-direction-select"
                        >
                          {Object.entries(SORT_DIRECTION_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => addCustomSortLevel('tertiary')}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                      data-testid="add-tertiary-sort"
                    >
                      + 添加第三級排序
                    </button>
                  )
                )}

                {/* 操作按鈕 */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCustomSort}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    data-testid="apply-custom-sort"
                  >
                    應用排序
                  </button>
                  <button
                    onClick={() => setShowCreatePreset(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    data-testid="save-as-preset"
                  >
                    保存為預設
                  </button>
                </div>

                {/* 創建預設對話框 */}
                {showCreatePreset && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">創建排序預設</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">預設名稱</label>
                          <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="輸入預設名稱"
                            data-testid="preset-name-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">描述（可選）</label>
                          <textarea
                            value={newPresetDescription}
                            onChange={(e) => setNewPresetDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="描述這個排序預設的用途"
                            data-testid="preset-description-input"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={handleCreatePreset}
                          disabled={!newPresetName.trim()}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          data-testid="create-preset-confirm"
                        >
                          創建預設
                        </button>
                        <button
                          onClick={() => setShowCreatePreset(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          data-testid="create-preset-cancel"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 高級選項標籤 */}
            {activeTab === 'advanced' && showAdvanced && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-800">高級排序選項</h4>
                <div className="text-sm text-gray-600">
                  高級選項功能正在開發中...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 點擊外部關閉 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          data-testid="sorting-panel-overlay"
        />
      )}
    </div>
  );
}
