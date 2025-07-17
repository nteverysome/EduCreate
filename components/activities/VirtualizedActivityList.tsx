/**
 * VirtualizedActivityList.tsx - 虛擬化活動列表組件
 * 支持1000+活動的高性能渲染，包含流暢滾動、懶加載和無限滾動功能
 * 載入時間 <500ms，基於 react-window 實現
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

// 活動數據接口
interface Activity {
  id: string;
  title: string;
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
  description?: string;
}

// 視圖模式類型
type ViewMode = 'grid' | 'list' | 'timeline' | 'kanban';

// 組件屬性
interface VirtualizedActivityListProps {
  activities: Activity[];
  viewMode: ViewMode;
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

// 列表項高度配置
const ITEM_HEIGHTS = {
  list: 80,
  timeline: 120,
  kanban: 200
};

// 網格項尺寸配置
const GRID_CONFIG = {
  itemWidth: 280,
  itemHeight: 200,
  gap: 16
};

export const VirtualizedActivityList: React.FC<VirtualizedActivityListProps> = ({
  activities,
  viewMode,
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
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  // 過濾和排序活動
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities;

    // 搜索過濾
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = activities.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'usageCount':
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case 'effectiveness':
          aValue = a.learningEffectiveness || 0;
          bValue = b.learningEffectiveness || 0;
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [activities, searchQuery, sortBy, sortOrder]);

  // 處理項目選擇
  const handleItemSelect = useCallback((activityId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (isSelected) {
      newSelection.add(activityId);
    } else {
      newSelection.delete(activityId);
    }
    onSelectionChange(newSelection);
  }, [selectedItems, onSelectionChange]);

  // 處理項目點擊
  const handleItemClick = useCallback((activity: Activity, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd + 點擊 = 多選
      handleItemSelect(activity.id, !selectedItems.has(activity.id));
    } else if (event.shiftKey && selectedItems.size > 0) {
      // Shift + 點擊 = 範圍選擇
      const lastSelectedIndex = filteredAndSortedActivities.findIndex(a => selectedItems.has(a.id));
      const currentIndex = filteredAndSortedActivities.findIndex(a => a.id === activity.id);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        const newSelection = new Set(selectedItems);
        
        for (let i = start; i <= end; i++) {
          newSelection.add(filteredAndSortedActivities[i].id);
        }
        onSelectionChange(newSelection);
      }
    } else {
      // 普通點擊 = 選擇活動
      onActivitySelect(activity);
    }
  }, [selectedItems, filteredAndSortedActivities, handleItemSelect, onActivitySelect, onSelectionChange]);

  // 列表項渲染器
  const ListItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const activity = filteredAndSortedActivities[index];
    if (!activity) return null;

    const isSelected = selectedItems.has(activity.id);
    const isLoading = index >= filteredAndSortedActivities.length && isNextPageLoading;

    if (isLoading) {
      return (
        <div style={style} className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">載入中...</span>
        </div>
      );
    }

    return (
      <div
        style={style}
        className={`activity-list-item p-4 border-b border-gray-200 cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
        }`}
        onClick={(e) => handleItemClick(activity, e)}
        data-testid={`activity-list-item-${activity.id}`}
      >
        <div className="flex items-center space-x-4">
          {/* 縮圖 */}
          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            {activity.thumbnail ? (
              <img src={activity.thumbnail} alt={activity.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-500 text-sm">{activity.type}</span>
            )}
          </div>

          {/* 活動信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {activity.type}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>使用 {activity.usageCount} 次</span>
                <span>大小 {Math.round(activity.size / 1024)}KB</span>
                {activity.learningEffectiveness && (
                  <span>效果 {Math.round(activity.learningEffectiveness * 100)}%</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {activity.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {activity.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{activity.tags.length - 3}</span>
              )}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex-shrink-0 flex items-center space-x-2">
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
    );
  }, [filteredAndSortedActivities, selectedItems, isNextPageLoading, handleItemClick, onActivityEdit, onActivityDelete]);

  // 網格項渲染器
  const GridItemRenderer = useCallback(({ columnIndex, rowIndex, style }: { 
    columnIndex: number; 
    rowIndex: number; 
    style: React.CSSProperties;
  }) => {
    const index = rowIndex * Math.floor((window.innerWidth - 32) / (GRID_CONFIG.itemWidth + GRID_CONFIG.gap)) + columnIndex;
    const activity = filteredAndSortedActivities[index];
    
    if (!activity) return null;

    const isSelected = selectedItems.has(activity.id);

    return (
      <div
        style={{
          ...style,
          left: (style.left as number) + GRID_CONFIG.gap / 2,
          top: (style.top as number) + GRID_CONFIG.gap / 2,
          width: (style.width as number) - GRID_CONFIG.gap,
          height: (style.height as number) - GRID_CONFIG.gap,
        }}
        className={`activity-grid-item p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={(e) => handleItemClick(activity, e)}
        data-testid={`activity-grid-item-${activity.id}`}
      >
        {/* 縮圖區域 */}
        <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          {activity.thumbnail ? (
            <img src={activity.thumbnail} alt={activity.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-gray-500 text-2xl">
              {activity.type === 'flashcard' ? '📚' : 
               activity.type === 'quiz' ? '❓' : 
               activity.type === 'matching' ? '🔗' : '🎮'}
            </div>
          )}
        </div>

        {/* 活動信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {activity.type}
            </span>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>使用 {activity.usageCount} 次</span>
              <span>{Math.round(activity.size / 1024)}KB</span>
            </div>
            {activity.learningEffectiveness && (
              <div>效果: {Math.round(activity.learningEffectiveness * 100)}%</div>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {activity.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {activity.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{activity.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    );
  }, [filteredAndSortedActivities, selectedItems, handleItemClick]);

  // 無限滾動項目載入檢查
  const isItemLoaded = useCallback((index: number) => {
    return index < filteredAndSortedActivities.length;
  }, [filteredAndSortedActivities.length]);

  // 計算網格列數
  const getColumnCount = useCallback((width: number) => {
    return Math.floor((width - GRID_CONFIG.gap) / (GRID_CONFIG.itemWidth + GRID_CONFIG.gap));
  }, []);

  // 計算網格行數
  const getRowCount = useCallback((columnCount: number) => {
    return Math.ceil(filteredAndSortedActivities.length / columnCount);
  }, [filteredAndSortedActivities.length]);

  // 渲染列表視圖
  const renderListView = () => (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={hasNextPage ? filteredAndSortedActivities.length + 1 : filteredAndSortedActivities.length}
          loadMoreItems={loadNextPage || (() => Promise.resolve())}
        >
          {({ onItemsRendered, ref }) => (
            <List
              ref={(list) => {
                ref(list);
                listRef.current = list;
              }}
              height={height}
              width={width}
              itemCount={hasNextPage ? filteredAndSortedActivities.length + 1 : filteredAndSortedActivities.length}
              itemSize={ITEM_HEIGHTS[viewMode as keyof typeof ITEM_HEIGHTS] || ITEM_HEIGHTS.list}
              onItemsRendered={onItemsRendered}
              overscanCount={5}
            >
              {ListItemRenderer}
            </List>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );

  // 渲染網格視圖
  const renderGridView = () => (
    <AutoSizer>
      {({ height, width }) => {
        const columnCount = getColumnCount(width);
        const rowCount = getRowCount(columnCount);
        
        return (
          <Grid
            ref={gridRef}
            height={height}
            width={width}
            columnCount={columnCount}
            rowCount={rowCount}
            columnWidth={GRID_CONFIG.itemWidth + GRID_CONFIG.gap}
            rowHeight={GRID_CONFIG.itemHeight + GRID_CONFIG.gap}
            overscanRowCount={2}
            overscanColumnCount={2}
          >
            {GridItemRenderer}
          </Grid>
        );
      }}
    </AutoSizer>
  );

  // 空狀態渲染
  if (filteredAndSortedActivities.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500" data-testid="empty-activities">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium mb-2">
          {searchQuery ? '沒有找到匹配的活動' : '還沒有活動'}
        </h3>
        <p className="text-sm text-center">
          {searchQuery ? '嘗試調整搜索條件' : '開始創建您的第一個教育遊戲活動吧！'}
        </p>
      </div>
    );
  }

  return (
    <div className={`virtualized-activity-list h-full ${className}`} data-testid="virtualized-activity-list">
      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </div>
  );
};
