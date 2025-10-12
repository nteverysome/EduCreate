'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, FolderPlus, ArrowUp, Trash2 } from 'lucide-react';
import FolderManager from './FolderManager';
import CreateFolderModal from './CreateFolderModal';
import TrashModal from './TrashModal';
import WordwallStyleActivityCard from './WordwallStyleActivityCard';
import ActivitySearchAndFilter from './ActivitySearchAndFilter';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: 'vocabulary' | 'system';
  gameType: string;
  isPublic: boolean;
  playCount: number;
  lastModified: Date;
  createdAt: Date;
  thumbnail: string;
  wordCount?: number;
  geptLevel?: string;
  tags?: string[];
  folderId?: string;
}

interface WordwallStyleMyActivitiesProps {
  userId: string;
}

// 拖拽回根級別的目標組件
interface DropToRootTargetProps {
  onDropToRoot: (activityId: string) => void;
  onClickToRoot: () => void;  // 添加點擊回到根級別的處理函數
}

const DropToRootTarget: React.FC<DropToRootTargetProps> = ({ onDropToRoot, onClickToRoot }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const activityId = e.dataTransfer.getData('text/plain');
    if (activityId && onDropToRoot) {
      onDropToRoot(activityId);
    }
  };

  return (
    <div
      className={`
        mb-6 p-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
        ${isDragOver
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClickToRoot}
    >
      <div className="flex items-center justify-center space-x-3">
        <ArrowUp className="w-5 h-5" />
        <span className="font-medium">
          {isDragOver ? '放開以移回上一層' : '拖拽活動到此處以移回上一層'}
        </span>
      </div>
    </div>
  );
};

export const WordwallStyleMyActivities: React.FC<WordwallStyleMyActivitiesProps> = ({
  userId
}) => {
  // 狀態管理
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);

  // 載入活動數據
  useEffect(() => {
    loadActivities();
  }, [currentFolderId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // 載入詞彙活動（異步）
      const vocabularyActivities = await loadVocabularyActivities();

      // 根據當前資料夾篩選
      const filteredActivities = currentFolderId
        ? vocabularyActivities.filter(activity => activity.folderId === currentFolderId)
        : vocabularyActivities.filter(activity => !activity.folderId);

      setActivities(filteredActivities);
    } catch (error) {
      console.error('載入活動失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 載入詞彙活動（從雲端 API，根據用戶 ID）
  const loadVocabularyActivities = async (): Promise<Activity[]> => {
    try {
      console.log(`🚀 為用戶 ${userId} 從 Activity API 載入活動...`);

      const response = await fetch('/api/activities');
      const result = await response.json();

      if (result.success && result.data) {
        console.log(`✅ 成功載入 ${result.data.length} 個活動`);

        return result.data.map((activity: any) => ({
          id: activity.id,
          title: activity.title || '無標題活動',
          description: activity.description || `包含 ${activity.vocabularyInfo?.totalWords || 0} 個詞彙的學習活動`,
          type: 'vocabulary' as const,
          gameType: '詞彙遊戲',
          isPublic: activity.isPublic || false,
          playCount: activity.playCount || Math.floor(Math.random() * 50),
          lastModified: new Date(activity.updatedAt),
          createdAt: new Date(activity.createdAt),
          thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dbeafe"/><text x="50" y="55" font-size="30" text-anchor="middle">📝</text></svg>',
          wordCount: activity.vocabularyInfo?.totalWords || 0,
          geptLevel: activity.vocabularyInfo?.geptLevel || 'ELEMENTARY',
          tags: activity.tags || ['vocabulary', 'cloud', activity.vocabularyInfo?.geptLevel?.toLowerCase() || 'elementary'],
          folderId: activity.folderId || null, // ✅ 修復：使用實際的 folderId
          userId: userId
        }));
      }

      return [];
    } catch (error) {
      console.error(`載入用戶 ${userId} 的活動失敗:`, error);
      return [];
    }
  };



  // 篩選和排序活動
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities;

    // 搜索篩選
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 類型篩選
    if (filterType !== 'all') {
      if (filterType === 'public') {
        filtered = filtered.filter(activity => activity.isPublic);
      } else if (filterType === 'private') {
        filtered = filtered.filter(activity => !activity.isPublic);
      } else {
        filtered = filtered.filter(activity => activity.type === filterType);
      }
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'modified':
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'playCount':
          comparison = a.playCount - b.playCount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [activities, searchQuery, filterType, sortBy, sortOrder]);

  // 事件處理函數
  const handleFolderSelect = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedActivities([]);
    setSelectionMode(false);
  };

  const handleFolderCreate = async (name: string, color: string) => {
    try {
      console.log('🚀 創建資料夾:', name, color);

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          color: color,
          description: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '創建資料夾失敗');
      }

      const newFolder = await response.json();
      console.log('✅ 資料夾創建成功:', newFolder);

      // 重新載入活動列表以顯示新資料夾
      await loadActivities();

    } catch (error: any) {
      console.error('❌ 創建資料夾失敗:', error);
      alert(`創建資料夾失敗: ${error.message}`);
    }
  };

  // 回收桶相關處理函數
  const handleActivityRestore = (activityId: string) => {
    console.log('✅ 活動已恢復:', activityId);
    // 重新載入活動列表
    loadActivities();
  };

  const handleActivityPermanentDelete = (activityId: string) => {
    console.log('🗑️ 活動已永久刪除:', activityId);
    // 不需要重新載入，因為活動已經不在主列表中
  };

  const handleEmptyTrash = () => {
    console.log('🗑️ 回收桶已清空');
    // 不需要重新載入，因為活動已經不在主列表中
  };

  const handleFolderUpdate = async (id: string, name: string, color?: string) => {
    console.log('更新資料夾:', id, name, color);
    // 資料夾更新邏輯已在 FolderManager 中處理
  };

  const handleFolderDelete = async (id: string) => {
    console.log('刪除資料夾:', id);
    // 資料夾刪除邏輯已在 FolderManager 中處理
    // 如果當前在被刪除的資料夾中，返回根目錄
    if (currentFolderId === id) {
      setCurrentFolderId(null);
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    if (selectionMode) {
      setSelectedActivities(prev => 
        prev.includes(activity.id) 
          ? prev.filter(id => id !== activity.id)
          : [...prev, activity.id]
      );
    }
  };

  // 開始詞彙遊戲
  const startVocabularyGame = async (activity: Activity) => {
    try {
      console.log('🎮 開始詞彙遊戲:', activity.title);
      console.log('🎯 活動 ID:', activity.id);

      // 🎯 獲取用戶選擇的遊戲類型
      const gameTemplateId = activity.content?.gameTemplateId || 'shimozurdo-game';
      console.log('🎮 遊戲類型:', gameTemplateId);

      // 🌐 跳轉到遊戲切換器頁面，預設選擇用戶的遊戲類型
      // 用戶可以在切換器中切換到其他遊戲，但優先顯示選擇的遊戲
      const switcherUrl = `/games/switcher?game=${gameTemplateId}&activityId=${activity.id}`;
      console.log('🚀 啟動遊戲切換器 URL:', switcherUrl);

      // 跳轉到遊戲切換器頁面，傳遞遊戲類型和活動 ID
      window.open(switcherUrl, '_blank');

    } catch (error) {
      console.error('❌ 啟動遊戲失敗:', error);
      alert('啟動遊戲失敗，請稍後再試');
    }
  };

  const handleActivityPlay = (activity: Activity) => {
    if (activity.type === 'vocabulary') {
      startVocabularyGame(activity);
    } else {
      // 處理系統活動播放
      console.log('播放活動:', activity.title);
    }
  };

  // 拖拽功能
  const handleActivityDragStart = (activity: Activity) => {
    console.log('🎯 開始拖拽活動:', activity.title);
  };

  const handleActivityDragEnd = () => {
    console.log('🎯 拖拽結束');
  };

  const handleActivityDropToFolder = async (activityId: string, folderId: string) => {
    try {
      console.log('📁 將活動移動到資料夾:', { activityId, folderId });

      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: folderId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '移動活動失敗');
      }

      console.log('✅ 活動移動成功');

      // 重新載入活動列表
      await loadActivities();

    } catch (error: any) {
      console.error('❌ 移動活動失敗:', error);
      alert(`移動活動失敗: ${error.message}`);
    }
  };

  // 處理從資料夾拖拽回根級別
  const handleActivityDropToRoot = async (activityId: string) => {
    try {
      console.log('🏠 將活動移動回根級別:', { activityId });

      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: null // 設為 null 表示移回根級別
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '移動活動失敗');
      }

      console.log('✅ 活動移回根級別成功');

      // 重新載入活動列表
      await loadActivities();

    } catch (error: any) {
      console.error('❌ 移動活動失敗:', error);
      alert(`移動活動失敗: ${error.message}`);
    }
  };

  // 處理點擊導航回根級別
  const handleClickToRoot = () => {
    console.log('🏠 點擊導航回根級別');
    setCurrentFolderId(null);
    setSelectedActivities([]);
    setSelectionMode(false);
  };

  const handleActivityEdit = (activity: Activity) => {
    console.log('🔧 編輯活動:', activity.title, '類型:', activity.type, 'ID:', activity.id);
    if (activity.type === 'vocabulary') {
      // 跳轉到創建頁面並傳遞活動 ID 進行編輯
      const editUrl = `/create?edit=${activity.id}`;
      console.log('🚀 跳轉到編輯頁面:', editUrl);
      window.open(editUrl, '_blank');
    } else {
      console.log('❌ 不支援的活動類型:', activity.type);
    }
  };

  const handleActivityCopy = async (activity: Activity) => {
    try {
      console.log('🔄 開始複製活動:', activity.title);

      const response = await fetch(`/api/activities/${activity.id}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '複製活動失敗');
      }

      const result = await response.json();
      console.log('✅ 活動複製成功:', result);

      // 顯示成功提示
      alert(`活動「${activity.title}」已成功複製為「${result.title}」`);

      // 重新載入活動列表以顯示複製的活動
      await loadActivities();

    } catch (error: any) {
      console.error('❌ 複製活動失敗:', error);
      alert(`複製活動失敗: ${error.message}`);
    }
  };

  const handleActivityDelete = async (activity: Activity) => {
    if (confirm(`確定要刪除「${activity.title}」嗎？`)) {
      try {
        console.log('🗑️ 開始刪除活動:', activity.title, 'ID:', activity.id);

        // 調用 API 刪除活動
        const response = await fetch(`/api/activities/${activity.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 活動刪除成功:', result);

          // 從狀態中移除
          setActivities(prev => prev.filter(a => a.id !== activity.id));

          // 重新載入活動列表以確保數據同步
          await loadActivities();

          console.log('✅ 活動刪除並重新載入完成:', activity.title);
        } else {
          const errorData = await response.json();
          console.error('❌ 刪除活動失敗:', errorData.error);
          alert(`刪除失敗：${errorData.error}`);
        }
      } catch (error) {
        console.error('❌ 刪除活動時出錯:', error);
        alert('刪除活動時發生錯誤，請稍後再試');
      }
    }
  };

  const handleActivityShare = (activity: Activity) => {
    console.log('分享活動:', activity.title);
  };

  const handleActivityRename = async (activity: Activity, newTitle: string) => {
    try {
      console.log('🏷️ 開始重新命名活動:', activity.title, '→', newTitle);

      // 調用 API 更新活動標題
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`重新命名失敗: ${response.status}`);
      }

      // 更新本地狀態
      setActivities(prevActivities =>
        prevActivities.map(a =>
          a.id === activity.id
            ? { ...a, title: newTitle }
            : a
        )
      );

      console.log('✅ 活動重新命名成功');
    } catch (error) {
      console.error('❌ 重新命名活動失敗:', error);
      alert('重新命名活動時發生錯誤，請稍後再試');
    }
  };

  const handleSelectAll = () => {
    setSelectedActivities(filteredAndSortedActivities.map(a => a.id));
  };

  const handleClearSelection = () => {
    setSelectedActivities([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="wordwall-style-activities min-h-screen bg-gray-50">
      {/* 頁面標題 - 優化版 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* 桌面版布局 */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">我的活動</h1>
                <p className="text-sm text-gray-600 mt-1">管理您的學習活動和資料夾</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open('/create', '_blank')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">創建活動</span>
              </button>
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="font-medium">新增資料夾</span>
              </button>
              <button
                onClick={() => setShowTrashModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                title="回收桶"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">回收桶</span>
              </button>
            </div>
          </div>

          {/* 手機版布局 */}
          <div className="md:hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">我的活動</h1>
                <p className="text-sm text-gray-600">管理您的學習活動</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => window.open('/create', '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">創建活動</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="font-medium text-sm">新增資料夾</span>
                </button>
                <button
                  onClick={() => setShowTrashModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 shadow-sm"
                  title="回收桶"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium text-sm">回收桶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 資料夾管理 */}
        <FolderManager
          currentFolderId={currentFolderId}
          onFolderSelect={handleFolderSelect}
          onFolderCreate={handleFolderCreate}
          onFolderUpdate={handleFolderUpdate}
          onFolderDelete={handleFolderDelete}
          onActivityDropToFolder={handleActivityDropToFolder}
        />

        {/* 搜索和篩選 */}
        <ActivitySearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
          selectedCount={selectedActivities.length}
          totalCount={filteredAndSortedActivities.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
        />

        {/* 在資料夾視圖中顯示拖拽回根級別的目標區域 */}
        {currentFolderId && (
          <DropToRootTarget
            onDropToRoot={handleActivityDropToRoot}
            onClickToRoot={handleClickToRoot}
          />
        )}

        {/* 活動網格/列表 */}
        <div className={`
          ${viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
            : 'space-y-4'
          }
        `}>
          {filteredAndSortedActivities.map((activity) => (
            <WordwallStyleActivityCard
              key={activity.id}
              activity={activity}
              isSelected={selectedActivities.includes(activity.id)}
              onSelect={handleActivitySelect}
              onPlay={handleActivityPlay}
              onEdit={handleActivityEdit}
              onCopy={handleActivityCopy}
              onDelete={handleActivityDelete}
              onShare={handleActivityShare}
              onRename={handleActivityRename}
              selectionMode={selectionMode}
              onDragStart={handleActivityDragStart}
              onDragEnd={handleActivityDragEnd}
            />
          ))}
        </div>

        {/* 空狀態 */}
        {filteredAndSortedActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '找不到匹配的活動' : '還沒有活動'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? '嘗試調整搜索條件或篩選設置' 
                : '開始創建您的第一個學習活動吧！'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => window.open('/create', '_blank')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                創建第一個活動
              </button>
            )}
          </div>
        )}
      </div>

      {/* 創建資料夾模態框 */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleFolderCreate}
      />

      {/* 回收桶模態框 */}
      <TrashModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        onActivityRestore={handleActivityRestore}
        onActivityPermanentDelete={handleActivityPermanentDelete}
        onEmptyTrash={handleEmptyTrash}
      />
    </div>
  );
};

export default WordwallStyleMyActivities;
