/**
 * MultiViewActivityDisplay.tsx - 多視圖模式活動顯示組件
 * 實現網格、列表、時間軸、看板四種視圖模式，支持用戶自定義佈局和視圖切換
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { VirtualizedActivityList } from './VirtualizedActivityList';

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
}

// 視圖模式類型
type ViewMode = 'grid' | 'list' | 'timeline' | 'kanban';

// 看板列定義
interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  filter: (activity: Activity) => boolean;
}

// 組件屬性
interface MultiViewActivityDisplayProps {
  activities: Activity[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onActivitySelect: (activity: Activity) => void;
  onActivityEdit: (activity: Activity) => void;
  onActivityDelete: (activityId: string) => void;
  selectedItems: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  loadNextPage?: () => Promise<void>;
  className?: string;
}

// 看板列配置
const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'draft',
    title: '草稿',
    color: 'bg-gray-100 border-gray-300',
    filter: (activity) => activity.status === 'draft' || !activity.status
  },
  {
    id: 'published',
    title: '已發布',
    color: 'bg-green-100 border-green-300',
    filter: (activity) => activity.status === 'published'
  },
  {
    id: 'high-priority',
    title: '高優先級',
    color: 'bg-red-100 border-red-300',
    filter: (activity) => activity.priority === 'high'
  },
  {
    id: 'archived',
    title: '已歸檔',
    color: 'bg-blue-100 border-blue-300',
    filter: (activity) => activity.status === 'archived'
  }
];

export const MultiViewActivityDisplay: React.FC<MultiViewActivityDisplayProps> = ({
  activities,
  viewMode,
  onViewModeChange,
  onActivitySelect,
  onActivityEdit,
  onActivityDelete,
  selectedItems,
  onSelectionChange,
  searchQuery = '',
  sortBy = 'updatedAt',
  sortOrder = 'desc',
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage,
  className = ''
}) => {
  const [customLayout, setCustomLayout] = useState({
    gridColumns: 3,
    listItemHeight: 80,
    timelineGroupBy: 'month' as 'day' | 'week' | 'month',
    kanbanColumns: KANBAN_COLUMNS
  });

  // 視圖模式按鈕配置
  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: '⊞', label: '網格視圖', description: '卡片式展示' },
    { mode: 'list' as ViewMode, icon: '☰', label: '列表視圖', description: '詳細信息展示' },
    { mode: 'timeline' as ViewMode, icon: '📅', label: '時間軸視圖', description: '按時間排序' },
    { mode: 'kanban' as ViewMode, icon: '📋', label: '看板視圖', description: '分類展示' }
  ];

  // 處理視圖模式切換
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    onViewModeChange(mode);
  }, [onViewModeChange]);

  // 格式化組標題 - 移到前面避免初始化錯誤
  const formatGroupTitle = useCallback((key: string, groupBy: string): string => {
    switch (groupBy) {
      case 'day':
        return new Date(key).toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'week':
        const weekStart = new Date(key);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`;
      case 'month':
      default:
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: 'long'
        });
    }
  }, []);

  // 時間軸數據分組
  const timelineGroups = useMemo(() => {
    const groups = new Map<string, Activity[]>();
    
    activities.forEach(activity => {
      const date = new Date(activity.updatedAt);
      let groupKey: string;
      
      switch (customLayout.timelineGroupBy) {
        case 'day':
          groupKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
        default:
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(activity);
    });
    
    // 按時間排序組
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, activities]) => ({
        key,
        title: formatGroupTitle(key, customLayout.timelineGroupBy),
        activities: activities.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      }));
  }, [activities, customLayout.timelineGroupBy, formatGroupTitle]);

  // 看板數據分組
  const kanbanGroups = useMemo(() => {
    return customLayout.kanbanColumns.map(column => ({
      ...column,
      activities: activities.filter(column.filter)
    }));
  }, [activities, customLayout.kanbanColumns]);



  // 渲染視圖模式切換器
  const renderViewModeToggle = () => (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {viewModeButtons.map((button) => (
        <button
          key={button.mode}
          onClick={() => handleViewModeChange(button.mode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === button.mode
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={`${button.label} - ${button.description}`}
          data-testid={`view-mode-${button.mode}`}
        >
          <span className="text-lg">{button.icon}</span>
          <span className="hidden sm:inline">{button.label}</span>
        </button>
      ))}
    </div>
  );

  // 渲染自定義佈局控制
  const renderLayoutControls = () => {
    if (viewMode === 'grid') {
      return (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">列數:</label>
          <select
            value={customLayout.gridColumns}
            onChange={(e) => setCustomLayout(prev => ({
              ...prev,
              gridColumns: parseInt(e.target.value)
            }))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value={2}>2列</option>
            <option value={3}>3列</option>
            <option value={4}>4列</option>
            <option value={5}>5列</option>
          </select>
        </div>
      );
    }

    if (viewMode === 'timeline') {
      return (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">分組:</label>
          <select
            value={customLayout.timelineGroupBy}
            onChange={(e) => setCustomLayout(prev => ({
              ...prev,
              timelineGroupBy: e.target.value as 'day' | 'week' | 'month'
            }))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="day">按日</option>
            <option value="week">按週</option>
            <option value="month">按月</option>
          </select>
        </div>
      );
    }

    return null;
  };

  // 渲染時間軸視圖
  const renderTimelineView = () => (
    <div className="timeline-view space-y-6" data-testid="timeline-view">
      {timelineGroups.map((group) => (
        <div key={group.key} className="timeline-group">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
              <p className="text-sm text-gray-500">{group.activities.length} 個活動</p>
            </div>
          </div>
          <div className="ml-8 space-y-3">
            {group.activities.map((activity) => (
              <div
                key={activity.id}
                className={`timeline-item p-4 border-l-4 border-blue-200 bg-white rounded-r-lg shadow-sm cursor-pointer transition-all ${
                  selectedItems.has(activity.id) ? 'border-l-blue-500 bg-blue-50' : 'hover:border-l-blue-300 hover:shadow-md'
                }`}
                onClick={() => onActivitySelect(activity)}
                data-testid={`timeline-item-${activity.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{activity.type}</span>
                      <span>使用 {activity.usageCount} 次</span>
                      <span>{new Date(activity.updatedAt).toLocaleTimeString('zh-TW')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivityEdit(activity);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="編輯"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivityDelete(activity.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="刪除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染看板視圖
  const renderKanbanView = () => (
    <div className="kanban-view grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kanban-view">
      {kanbanGroups.map((column) => (
        <div
          key={column.id}
          className={`kanban-column border-2 border-dashed rounded-lg p-4 ${column.color}`}
          data-testid={`kanban-column-${column.id}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
              {column.activities.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {column.activities.map((activity) => (
              <div
                key={activity.id}
                className={`kanban-card p-3 bg-white rounded-lg shadow-sm border cursor-pointer transition-all ${
                  selectedItems.has(activity.id) ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => onActivitySelect(activity)}
                data-testid={`kanban-card-${activity.id}`}
              >
                <h4 className="font-medium text-gray-900 text-sm mb-2">{activity.title}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{activity.type}</span>
                  <span>{activity.usageCount}次</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {activity.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {activity.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{activity.tags.length - 2}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`multi-view-activity-display ${className}`} data-testid="multi-view-activity-display">
      {/* 視圖控制器 */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          {renderViewModeToggle()}
          {renderLayoutControls()}
        </div>
        <div className="text-sm text-gray-500">
          {activities.length} 個活動
        </div>
      </div>

      {/* 視圖內容 */}
      <div className="view-content">
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'kanban' && renderKanbanView()}
        {(viewMode === 'grid' || viewMode === 'list') && (
          <VirtualizedActivityList
            activities={activities}
            viewMode={viewMode}
            onActivitySelect={onActivitySelect}
            onActivityEdit={onActivityEdit}
            onActivityDelete={onActivityDelete}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            hasNextPage={hasNextPage}
            isNextPageLoading={isNextPageLoading}
            loadNextPage={loadNextPage}
            className="h-96"
          />
        )}
      </div>
    </div>
  );
};
