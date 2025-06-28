import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '../lib/store/useAppStore';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { api } from '../lib/utils/apiUtils';
import { perf } from '../lib/utils/performanceMonitor';
import { SimpleErrorBoundary } from './ErrorBoundary';

interface Activity {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityListProps {
  userId?: string;
  searchQuery?: string;
  pageSize?: number;
}

/**
 * 優化的活動列表組件
 * 展示如何使用優化的 hooks 和狀態管理
 */
export function OptimizedActivityList({ 
  userId, 
  searchQuery = '', 
  pageSize = 10 
}: ActivityListProps) {
  const { data: session } = useSession();
  const { activities, setActivities } = useAppStore();
  const { executeWithErrorHandling, error, isLoading } = useErrorHandler();
  const { updateOptimistically } = useOptimisticUpdate(activities);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // 防抖搜索
  const debouncedSearchQuery = useMemo(() => {
    const timer = setTimeout(() => localSearchQuery, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  // 獲取活動列表
  const fetchActivities = useCallback(async (
    pageNum: number = 1,
    search: string = '',
    append: boolean = false
  ) => {
    const targetUserId = userId || session?.user?.id;
    if (!targetUserId) return;

    const response = await perf.measureAsync(
      'fetch_activities',
      () => api.get('/api/activities/optimized', {
        timeout: 5000,
        retries: 2,
      }),
      { 
        page: pageNum.toString(),
        search,
        user_id: targetUserId 
      }
    );

    if (response.success) {
      const newActivities = response.data.activities;
      
      if (append) {
        setActivities([...activities, ...newActivities]);
      } else {
        setActivities(newActivities);
      }
      
      setHasMore(newActivities.length === pageSize);
      return newActivities;
    } else {
      throw new Error(response.error || '獲取活動失敗');
    }
  }, [userId, session?.user?.id, activities, setActivities, pageSize]);

  // 初始加載
  useEffect(() => {
    executeWithErrorHandling(
      () => fetchActivities(1, searchQuery),
      () => setPage(1)
    );
  }, [searchQuery, executeWithErrorHandling, fetchActivities]);

  // 搜索處理
  useEffect(() => {
    if (localSearchQuery !== searchQuery) {
      executeWithErrorHandling(
        () => fetchActivities(1, localSearchQuery),
        () => setPage(1)
      );
    }
  }, [debouncedSearchQuery, localSearchQuery, searchQuery, executeWithErrorHandling, fetchActivities]);

  // 加載更多
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      executeWithErrorHandling(
        () => fetchActivities(nextPage, localSearchQuery, true),
        () => setPage(nextPage)
      );
    }
  }, [isLoading, hasMore, page, executeWithErrorHandling, fetchActivities, localSearchQuery]);

  // 刪除活動（樂觀更新）
  const deleteActivity = useCallback(async (activityId: string) => {
    const optimisticActivities = activities.filter(a => a.id !== activityId);
    
    await updateOptimistically(
      optimisticActivities,
      async () => {
        const response = await api.delete(`/api/activities/${activityId}`);
        if (!response.success) {
          throw new Error(response.error || '刪除失敗');
        }
        return optimisticActivities;
      },
      {
        onSuccess: () => {
          perf.count('activity_deleted');
        },
        onError: (error) => {
          perf.error(error as Error, 'delete_activity');
        },
      }
    );
  }, [activities, updateOptimistically]);

  // 渲染活動項目
  const renderActivityItem = useCallback((activity: Activity) => (
    <div
      key={activity.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activity.title}
          </h3>
          {activity.description && (
            <p className="text-gray-600 text-sm mb-3">
              {activity.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full ${
              activity.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {activity.status}
            </span>
            <span>
              創建於 {new Date(activity.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => window.open(`/preview/${activity.id}`, '_blank')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            預覽
          </button>
          <button
            onClick={() => deleteActivity(activity.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  ), [deleteActivity]);

  // 渲染加載狀態
  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <SimpleErrorBoundary message="活動列表加載失敗">
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索活動..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* 活動列表 */}
        <div className="space-y-4">
          {activities.map(renderActivityItem)}
        </div>

        {/* 空狀態 */}
        {activities.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📝</div>
            <p className="text-gray-500">
              {localSearchQuery ? '沒有找到匹配的活動' : '還沒有創建任何活動'}
            </p>
          </div>
        )}

        {/* 加載更多按鈕 */}
        {hasMore && activities.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '加載中...' : '加載更多'}
            </button>
          </div>
        )}
      </div>
    </SimpleErrorBoundary>
  );
}

export default OptimizedActivityList;
