/**
 * 活動管理界面 - 模仿 wordwall.net 的 My Activities 頁面
 * 提供搜索、排序、文件夾管理和活動操作功能
 */

import React, { useState, useEffect } from 'react';
import { UniversalContent } from '../../lib/content/UniversalContentManager';
import { useAutoSave } from '../../lib/content/AutoSaveManager';

interface ActivityFolder {
  id: string;
  name: string;
  activityCount: number;
  createdAt: Date;
}

interface ActivityManagerProps {
  userId: string;
  onActivitySelect?: (activity: UniversalContent) => void;
  onCreateNew?: () => void;
}

type SortOption = 'name' | 'modified' | 'lastPlayed';
type ViewMode = 'grid' | 'list';

const ActivityManager = ({ userId, onActivitySelect, onCreateNew }: ActivityManagerProps) => {
  const [activities, setActivities] = useState<UniversalContent[]>([]);
  const [folders, setFolders] = useState<ActivityFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('modified');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  // 加載活動和文件夾
  useEffect(() => {
    loadActivities();
    loadFolders();
  }, [userId, searchTerm, sortBy]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        page: '1',
        limit: '50'
      });

      const response = await fetch(`/api/universal-content?${params}`);
      if (!response.ok) {
        throw new Error('加載活動失敗');
      }

      const data = await response.json();
      setActivities(data.contents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加載活動失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/universal-content/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (err) {
      console.error('加載文件夾失敗:', err);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
  };

  const handleActivityClick = (activity: UniversalContent) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  const handleActivitySelect = (activityId: string, selected: boolean) => {
    const newSelected = new Set(selectedActivities);
    if (selected) {
      newSelected.add(activityId);
    } else {
      newSelected.delete(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedActivities.size === 0) return;

    const confirmed = window.confirm(`確定要刪除 ${selectedActivities.size} 個活動嗎？`);
    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedActivities).map(id =>
          fetch(`/api/universal-content/${id}`, { method: 'DELETE' })
        )
      );
      
      setSelectedActivities(new Set());
      loadActivities();
    } catch (err) {
      setError('刪除活動失敗');
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加載中...</span>
      </div>
    );
  }

  return (
    <div className="activity-manager">
      {/* 頭部控制欄 */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">我的活動</h1>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="mr-2">+</span>
            創建新活動
          </button>
        </div>

        {/* 搜索和控制 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search my activities..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 批量操作 */}
            {selectedActivities.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  已選擇 {selectedActivities.size} 個活動
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  刪除選中
                </button>
              </div>
            )}
          </div>

          {/* 視圖控制 */}
          <div className="flex items-center space-x-4">
            {/* 排序選項 */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Order by:</span>
              <button
                onClick={() => handleSort('name')}
                className={`px-2 py-1 rounded ${sortBy === 'name' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Name ↕
              </button>
              <button
                onClick={() => handleSort('modified')}
                className={`px-2 py-1 rounded ${sortBy === 'modified' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Modified ↕
              </button>
              <button
                onClick={() => handleSort('lastPlayed')}
                className={`px-2 py-1 rounded ${sortBy === 'lastPlayed' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Last played ↕
              </button>
            </div>

            {/* 視圖模式 */}
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'}`}
                title="網格視圖"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'}`}
                title="列表視圖"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">關閉</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 內容區域 */}
      <div className="p-6">
        {/* 文件夾 */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">文件夾</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map(folder => (
                <FolderCard key={folder.id} folder={folder} />
              ))}
            </div>
          </div>
        )}

        {/* 活動列表 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            活動 ({filteredActivities.length})
          </h2>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '沒有找到匹配的活動' : '還沒有創建任何活動'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '嘗試使用不同的搜索詞' : '開始創建您的第一個教育活動'}
            </p>
            {!searchTerm && (
              <button
                onClick={onCreateNew}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                創建新活動
              </button>
            )}
          </div>
        ) : (
          <div className={`activities-container ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}`}>
            {filteredActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                viewMode={viewMode}
                isSelected={selectedActivities.has(activity.id)}
                onSelect={(selected) => handleActivitySelect(activity.id, selected)}
                onClick={() => handleActivityClick(activity)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 文件夾卡片組件
function FolderCard({ folder }: { folder: ActivityFolder }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 cursor-pointer transition-colors">
      <div className="flex items-center">
        <div className="text-yellow-600 text-2xl mr-3">📁</div>
        <div>
          <h3 className="font-medium text-gray-900">{folder.name}</h3>
          <p className="text-sm text-gray-600">{folder.activityCount} 個活動</p>
        </div>
      </div>
    </div>
  );
}

// 活動卡片組件
interface ActivityCardProps {
  activity: UniversalContent;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
}

const ActivityCard = ({ activity, viewMode, isSelected, onSelect, onClick }: ActivityCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mr-3"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 cursor-pointer" onClick={onClick}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.items.length} 個項目</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">修改於</p>
                <p className="text-sm text-gray-900">{formatDate(activity.updatedAt)}</p>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <button className="text-gray-400 hover:text-gray-600">
              ⋯
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          ⋯
        </button>
      </div>
      
      <div className="mb-3">
        <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
        <p className="text-sm text-gray-600">{activity.items.length} 個項目</p>
        {activity.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>修改於 {formatDate(activity.updatedAt)}</span>
        <span className="bg-gray-100 px-2 py-1 rounded">Private</span>
      </div>
    </div>
  );
}
export default ActivityManager;
