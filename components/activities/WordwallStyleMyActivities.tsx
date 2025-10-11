'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import FolderManager from './FolderManager';
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

  // 載入活動數據
  useEffect(() => {
    loadActivities();
  }, [currentFolderId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // 載入詞彙活動（異步）
      const vocabularyActivities = await loadVocabularyActivities();

      // 載入系統活動（模擬數據）
      const systemActivities = generateSystemActivities();

      // 合併活動
      const allActivities = [...vocabularyActivities, ...systemActivities];

      // 根據當前資料夾篩選
      const filteredActivities = currentFolderId
        ? allActivities.filter(activity => activity.folderId === currentFolderId)
        : allActivities.filter(activity => !activity.folderId);

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
          description: activity.description || `包含 ${activity.totalWords || 0} 個詞彙的學習活動`,
          type: 'vocabulary' as const,
          gameType: '詞彙遊戲',
          isPublic: activity.isPublic || false,
          playCount: activity.playCount || Math.floor(Math.random() * 50),
          lastModified: new Date(activity.updatedAt),
          createdAt: new Date(activity.createdAt),
          thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dbeafe"/><text x="50" y="55" font-size="30" text-anchor="middle">📝</text></svg>',
          wordCount: activity.totalWords || 0,
          geptLevel: activity.geptLevel || 'ELEMENTARY',
          tags: activity.tags || ['vocabulary', 'cloud', activity.geptLevel?.toLowerCase() || 'elementary'],
          folderId: undefined,
          userId: userId
        }));
      }

      return [];
    } catch (error) {
      console.error(`載入用戶 ${userId} 的活動失敗:`, error);
      return [];
    }
  };

  // 生成系統活動（模擬 Wordwall 的樣式）
  const generateSystemActivities = (): Activity[] => {
    const gameTypes = ['飛機遊戲', '匹配遊戲', '測驗', '問答遊戲', '開箱遊戲', '迷宮追逐'];
    const topics = ['英文單字', '數學練習', '科學知識', '歷史問答', '地理測驗'];
    
    return Array.from({ length: 12 }, (_, index) => ({
      id: `system_${index + 1}`,
      title: `${topics[index % topics.length]} - ${gameTypes[index % gameTypes.length]}`,
      description: `系統預設的學習活動`,
      type: 'system' as const,
      gameType: gameTypes[index % gameTypes.length],
      isPublic: Math.random() > 0.5,
      playCount: Math.floor(Math.random() * 200),
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      thumbnail: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" font-size="20" text-anchor="middle">${gameTypes[index % gameTypes.length].charAt(0)}</text></svg>`,
      wordCount: Math.floor(Math.random() * 20) + 5,
      geptLevel: ['elementary', 'intermediate', 'high-intermediate'][Math.floor(Math.random() * 3)],
      tags: ['system', gameTypes[index % gameTypes.length].toLowerCase()],
      folderId: currentFolderId
    }));
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

  const handleFolderCreate = (name: string, parentId?: string) => {
    console.log('創建資料夾:', name, parentId);
    // 這裡可以添加創建資料夾的邏輯
  };

  const handleFolderUpdate = (id: string, name: string) => {
    console.log('更新資料夾:', id, name);
    // 這裡可以添加更新資料夾的邏輯
  };

  const handleFolderDelete = (id: string) => {
    console.log('刪除資料夾:', id);
    // 這裡可以添加刪除資料夾的邏輯
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

      // 從 API 獲取詞彙數據
      const response = await fetch(`/api/vocabulary/sets/${activity.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const vocabularySet = result.data;

        // 將詞彙數據存儲到 localStorage 供遊戲使用
        const gameVocabulary = vocabularySet.items.map((item: any) => ({
          english: item.english,
          chinese: item.chinese,
          level: vocabularySet.geptLevel.toLowerCase()
        }));

        localStorage.setItem('gameVocabulary', JSON.stringify(gameVocabulary));
        localStorage.setItem('gameTitle', vocabularySet.title);

        console.log(`🎯 遊戲詞彙已設置: ${gameVocabulary.length} 個詞彙`);

        // 跳轉到遊戲頁面
        window.open('/games/shimozurdo-game', '_blank');
      } else {
        console.error('❌ 無法載入詞彙數據');
        alert('無法載入詞彙數據，請稍後再試');
      }
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

  const handleActivityEdit = (activity: Activity) => {
    if (activity.type === 'vocabulary') {
      window.open('/create', '_blank');
    } else {
      console.log('編輯活動:', activity.title);
    }
  };

  const handleActivityCopy = (activity: Activity) => {
    console.log('複製活動:', activity.title);
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
      {/* 頁面標題 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">我的活動</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus className="w-4 h-4" />
              創建活動
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <FolderPlus className="w-4 h-4" />
              新增資料夾
            </button>
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
              selectionMode={selectionMode}
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
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                創建第一個活動
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordwallStyleMyActivities;
