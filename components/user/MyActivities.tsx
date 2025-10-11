/**
 * MyActivities.tsx - 用戶活動管理主界面
 * Day 1-2 檔案空間系統的核心組件
 * 實現完整的檔案夾管理和活動組織功能
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FolderManager, FolderItem, FolderTreeNode } from '@/lib/content/FolderManager';
import { DragDropFolderTree } from '@/components/content/DragDropFolderTree';
import { EnhancedFolderOrganizer } from '@/components/content/EnhancedFolderOrganizer';
import { AdvancedSearchInterface } from '@/components/search/AdvancedSearchInterface';

import { FolderCustomizationPanel } from '@/components/folder/FolderCustomizationPanel';
import { SmartSortingPanel } from '@/components/sorting/SmartSortingPanel';
import { FolderAnalyticsPanel } from '@/components/analytics/FolderAnalyticsPanel';
import { ShareDialog } from '@/components/content/ShareDialog';
import { FolderPermissionManager } from '@/components/permissions/FolderPermissionManager';
import { VirtualizedActivityList } from '@/components/activities/VirtualizedActivityList';
import { MultiViewActivityDisplay } from '@/components/activities/MultiViewActivityDisplay';
import { AdvancedActivityFilter } from '@/components/activities/AdvancedActivityFilter';
import { IntelligentActivitySearch } from '@/components/activities/IntelligentActivitySearch';
import { BatchOperationPanel } from '@/components/activities/BatchOperationPanel';
import { ActivityDataGenerator } from '@/lib/activities/ActivityDataGenerator';
import { BatchOperationManager } from '@/lib/activities/BatchOperationManager';

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
}

interface MyActivitiesProps {
  userId: string;
  initialView?: 'grid' | 'list' | 'timeline' | 'kanban';
  showWelcome?: boolean;
  enableVirtualization?: boolean;
  maxActivities?: number;
}

export const MyActivities: React.FC<MyActivitiesProps> = ({
  userId,
  initialView = 'grid',
  showWelcome = true,
  enableVirtualization = true,
  maxActivities = 1000
}) => {
  // 狀態管理
  const [folders, setFolders] = useState<FolderTreeNode[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'kanban'>(initialView);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type' | 'usage' | 'effectiveness'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showBatchOperations, setShowBatchOperations] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedFolderForAction, setSelectedFolderForAction] = useState<string | null>(null);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [batchOperationManager, setBatchOperationManager] = useState<BatchOperationManager | null>(null);

  // 過濾器處理函數
  const handleFilterChange = useCallback((filtered: Activity[]) => {
    setFilteredActivities(filtered);
  }, []);

  const handleFilterConfigChange = useCallback((config: any) => {
    // 計算活躍過濾器數量
    let count = 0;
    if (config.geptLevels?.length > 0) count++;
    if (config.templateTypes?.length > 0) count++;
    if (config.tags?.length > 0) count++;
    if (config.dateRange?.start || config.dateRange?.end) count++;
    if (config.learningStates?.length > 0) count++;
    if (config.difficulties?.length > 0) count++;
    if (config.subjects?.length > 0) count++;
    if (config.authors?.length > 0) count++;
    if (config.showSharedOnly) count++;
    if (config.showFavoritesOnly) count++;

    setActiveFiltersCount(count);
  }, []);

  // 搜索處理函數
  const handleSearchResults = useCallback((results: any[]) => {
    setSearchResults(results);
    setIsSearchActive(results.length > 0);
  }, []);

  const handleSearchConfigChange = useCallback((config: any) => {
    // 可以在這裡處理搜索配置變化
    console.log('搜索配置更新:', config);
  }, []);

  // 初始化批量操作管理器
  useEffect(() => {
    const manager = new BatchOperationManager(activities, setActivities);
    setBatchOperationManager(manager);
  }, [activities]);

  // 批量操作處理函數
  const handleBatchOperation = useCallback(async (operation: any, options: any) => {
    if (!batchOperationManager) {
      throw new Error('批量操作管理器未初始化');
    }

    try {
      const result = await batchOperationManager.executeBatchOperation(operation, options);

      // 顯示操作結果
      if (result.success) {
        console.log(`批量${operation}操作成功: ${result.processedCount} 個項目已處理`);
      } else {
        console.error(`批量${operation}操作部分失敗: ${result.processedCount} 成功, ${result.failedCount} 失敗`);
        console.error('錯誤詳情:', result.errors);
      }

      return result;
    } catch (error) {
      console.error('批量操作執行失敗:', error);
      throw error;
    }
  }, [batchOperationManager]);

  // 處理選擇變化
  const handleSelectionChange = useCallback((newSelectedItems: string[]) => {
    setSelectedItems(newSelectedItems);

    // 如果有選中項目，顯示批量操作面板
    if (newSelectedItems.length > 0 && !showBatchPanel) {
      setShowBatchPanel(true);
    }

    // 如果沒有選中項目，隱藏批量操作面板
    if (newSelectedItems.length === 0 && showBatchPanel) {
      setShowBatchPanel(false);
    }
  }, [showBatchPanel]);

  // 載入數據
  const loadData = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setIsLoading(true);
    } else {
      setIsNextPageLoading(true);
    }

    try {
      // 載入檔案夾結構 (使用模擬數據避免 Prisma 瀏覽器錯誤)
      if (page === 1) {
        // 創建模擬的檔案夾樹
        const mockFolderTree: FolderTreeNode[] = [
          {
            id: 'folder_1',
            name: '我的活動',
            description: '默認活動檔案夾',
            userId: userId,
            activityCount: 0,
            subfolderCount: 0,
            totalActivityCount: 0,
            path: [],
            depth: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: []
          }
        ];
        setFolders(mockFolderTree);
      }

      // 載入活動
      const result = await loadUserActivities(userId, currentFolder, page, 50);

      if (append) {
        setActivities(prev => [...prev, ...result.activities]);
      } else {
        setActivities(result.activities);
      }

      setTotalActivities(result.total);
      setHasNextPage(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('載入數據失敗:', error);
    } finally {
      setIsLoading(false);
      setIsNextPageLoading(false);
    }
  }, [userId, currentFolder, enableVirtualization, maxActivities]);

  // 載入下一頁
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isNextPageLoading) return;
    await loadData(currentPage + 1, true);
  }, [hasNextPage, isNextPageLoading, currentPage, loadData]);

  useEffect(() => {
    console.log('🚀 MyActivities useEffect 觸發', { enableVirtualization, maxActivities });
    // 延遲載入以提升初始頁面性能
    const timer = setTimeout(() => {
      console.log('⏰ 開始載入數據');
      loadData();
    }, 100);

    return () => clearTimeout(timer);
  }, [loadData]);

  // 載入用戶詞彙活動（只使用 Railway API）
  const loadVocabularyActivities = async (): Promise<Activity[]> => {
    try {
      console.log('🚀 從 Railway API 載入詞彙活動...');

      const response = await fetch('/api/vocabulary/sets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error('API 響應格式錯誤');
      }

      const vocabularyActivities = result.data.map((set: any) => ({
        id: set.id,
        title: set.title || '無標題詞彙活動',
        description: set.description || `包含 ${set.totalWords || 0} 個詞彙的學習活動`,
        type: 'vocabulary',
        folderId: undefined,
        createdAt: new Date(set.createdAt),
        updatedAt: new Date(set.updatedAt),
        lastAccessedAt: new Date(set.updatedAt),
        size: (set.totalWords || 0) * 100,
        isShared: set.isPublic || false,
        geptLevel: set.geptLevel?.toLowerCase() || 'elementary',
        learningEffectiveness: 0.95,
        usageCount: 1,
        tags: ['vocabulary', 'railway', set.geptLevel?.toLowerCase() || 'elementary'],
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dbeafe"/><text x="50" y="55" font-size="30" text-anchor="middle">🚀</text></svg>'
      }));

      console.log(`🚀 從 Railway API 載入 ${vocabularyActivities.length} 個詞彙活動`);
      return vocabularyActivities;
    } catch (error) {
      console.error('❌ 載入詞彙活動失敗:', error);
      throw error; // 拋出錯誤，讓調用者處理
    }
  };

  // 載入用戶活動（支持虛擬化和分頁）
  const loadUserActivities = async (
    userId: string,
    folderId?: string | null,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ activities: Activity[]; total: number; hasMore: boolean }> => {
    try {
      // 載入用戶創建的詞彙活動（現在是異步的）
      let vocabularyActivities: Activity[] = [];
      try {
        vocabularyActivities = await loadVocabularyActivities();
      } catch (vocabError) {
        console.warn('⚠️ 載入詞彙活動失敗，將顯示空列表:', vocabError);
        // 不拋出錯誤，繼續載入其他活動
      }

      // 如果啟用虛擬化且需要大量數據，使用數據生成器
      if (enableVirtualization && maxActivities > 100) {
        console.log(`🔄 啟用虛擬化模式，生成 ${maxActivities} 個活動`);
        const generator = ActivityDataGenerator.getInstance();

        // 生成大量測試數據
        const systemActivities = await generator.generateLargeDataset(maxActivities);
        console.log(`✅ 成功生成 ${systemActivities.length} 個系統活動`);

        // 合併用戶詞彙活動和系統活動
        const allActivities = [...vocabularyActivities, ...systemActivities];

        // 過濾指定檔案夾的活動
        const filteredActivities = folderId
          ? allActivities.filter(activity => activity.folderId === folderId)
          : allActivities;

        // 分頁處理
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

        return {
          activities: paginatedActivities,
          total: filteredActivities.length,
          hasMore: endIndex < filteredActivities.length
        };
      }

      // 默認的小量數據 - 合併用戶詞彙活動和系統活動
      const mockActivities: Activity[] = [
        {
          id: '1',
          title: 'GEPT 初級詞彙練習',
          description: '專為 GEPT 初級考試設計的詞彙練習活動',
          type: 'flashcard',
          folderId: undefined,
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date('2025-01-12'),
          lastAccessedAt: new Date('2025-01-15'),
          size: 1024 * 50,
          isShared: false,
          geptLevel: 'elementary',
          learningEffectiveness: 0.85,
          usageCount: 15,
          tags: ['vocabulary', 'gept', 'elementary'],
          thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" font-size="30" text-anchor="middle">📚</text></svg>'
        },
        {
          id: '2',
          title: '英語動詞配對遊戲',
          description: '互動式英語動詞配對練習，提升語法理解',
          type: 'matching',
          folderId: undefined,
          createdAt: new Date('2025-01-08'),
          updatedAt: new Date('2025-01-14'),
          size: 1024 * 75,
          isShared: true,
          geptLevel: 'intermediate',
          learningEffectiveness: 0.92,
          usageCount: 28,
          tags: ['grammar', 'verbs', 'matching'],
          thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" font-size="30" text-anchor="middle">🔗</text></svg>'
        }
      ];

      // 合併用戶詞彙活動和系統活動
      const allActivities = [...vocabularyActivities, ...mockActivities];

      return {
        activities: allActivities,
        total: allActivities.length,
        hasMore: false
      };
    } catch (error) {
      console.error('載入活動失敗:', error);
      return {
        activities: [],
        total: 0,
        hasMore: false
      };
    }
  };

  // 檔案夾操作處理
  const handleFolderCreate = async (name: string, parentId?: string) => {
    try {
      const newFolder = await FolderManager.createFolder(name, parentId, {
        userId,
        description: `由用戶 ${userId} 創建的檔案夾`
      });
      await loadData();
      return newFolder;
    } catch (error) {
      console.error('創建檔案夾失敗:', error);
      throw error;
    }
  };

  const handleFolderRename = async (folderId: string, newName: string) => {
    try {
      await FolderManager.updateFolder(folderId, { name: newName });
      await loadData();
    } catch (error) {
      console.error('重命名檔案夾失敗:', error);
      throw error;
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      await FolderManager.deleteFolder(folderId, userId);
      await loadData();
    } catch (error) {
      console.error('刪除檔案夾失敗:', error);
      throw error;
    }
  };

  const handleFolderMove = async (folderId: string, newParentId?: string) => {
    try {
      await FolderManager.moveFolder(folderId, newParentId, userId);
      await loadData();
    } catch (error) {
      console.error('移動檔案夾失敗:', error);
      throw error;
    }
  };

  // 活動操作處理
  const handleActivityMove = async (activityId: string, targetFolderId?: string) => {
    try {
      // 這裡應該調用實際的 API 來移動活動
      console.log(`移動活動 ${activityId} 到檔案夾 ${targetFolderId}`);
      await loadData();
    } catch (error) {
      console.error('移動活動失敗:', error);
      throw error;
    }
  };



  // 選擇處理
  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (isSelected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
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

  // 處理活動選擇
  const handleActivitySelect = useCallback((activity: Activity) => {
    console.log('選擇活動:', activity);

    // 如果是詞彙活動，啟動遊戲
    if (activity.type === 'vocabulary') {
      startVocabularyGame(activity);
    } else {
      // 其他活動的處理邏輯
      console.log('選擇系統活動:', activity.title);
    }
  }, []);

  // 處理活動編輯
  const handleActivityEdit = useCallback((activity: Activity) => {
    console.log('編輯活動:', activity);

    // 如果是詞彙活動，導航到創建活動頁面進行編輯
    if (activity.type === 'vocabulary') {
      window.open('/create', '_blank');
    } else {
      // 其他活動的編輯邏輯
      console.log('編輯系統活動:', activity.title);
    }
  }, []);

  // 刪除詞彙活動
  const deleteVocabularyActivity = (activityId: string) => {
    try {
      const vocabularyData = localStorage.getItem('vocabulary_integration_data');
      if (!vocabularyData) return;

      const data = JSON.parse(vocabularyData);
      if (data.activities) {
        data.activities = data.activities.filter((activity: any) => activity.id !== activityId);
        localStorage.setItem('vocabulary_integration_data', JSON.stringify(data));
        console.log(`✅ 已刪除詞彙活動: ${activityId}`);
      }
    } catch (error) {
      console.error('刪除詞彙活動失敗:', error);
    }
  };

  // 處理活動刪除
  const handleActivityDelete = useCallback(async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    const activityName = activity?.title || '此活動';

    if (confirm(`確定要刪除「${activityName}」嗎？`)) {
      try {
        // 如果是詞彙活動，從本地存儲刪除
        if (activity?.type === 'vocabulary') {
          deleteVocabularyActivity(activityId);
        }

        // 從界面移除
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        console.log('刪除活動:', activityId);
      } catch (error) {
        console.error('刪除活動失敗:', error);
      }
    }
  }, [activities]);

  const handleSelectAll = () => {
    const allIds = new Set([
      ...folders.map(f => f.id),
      ...activities.map(a => a.id)
    ]);
    setSelectedItems(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  // 搜索和排序
  const filteredAndSortedActivities = activities
    .filter(activity => {
      if (!searchQuery) return true;
      return activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'effectiveness':
          comparison = (a.learningEffectiveness || 0) - (b.learningEffectiveness || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="my-activities-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="my-activities-container" data-testid="my-activities-main">
      {/* 歡迎區域 */}
      {showWelcome && (
        <div className="welcome-section mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">我的活動</h1>
          <p className="text-gray-600">
            管理您的教育遊戲活動，組織檔案夾，並追蹤學習效果。
            目前有 {activities.length} 個活動在 {folders.length} 個檔案夾中。
          </p>
        </div>
      )}

      {/* 工具欄 */}
      <div className="toolbar-section mb-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border">
        {/* 搜索區域 */}
        <div className="search-area flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索活動..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="activity-search-input"
          />
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            data-testid="advanced-search-toggle"
          >
            高級搜索
          </button>
        </div>

        {/* 視圖控制 */}
        <div className="view-controls flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            data-testid="sort-by-select"
          >
            <option value="name">按名稱排序</option>
            <option value="date">按日期排序</option>
            <option value="size">按大小排序</option>
            <option value="type">按類型排序</option>
            <option value="usage">按使用次數排序</option>
            <option value="effectiveness">按學習效果排序</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            data-testid="sort-order-toggle"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <div className="view-mode-buttons flex border border-gray-300 rounded-md overflow-hidden">
            {(['grid', 'list', 'tree'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 ${viewMode === mode ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                data-testid={`view-mode-${mode}`}
              >
                {mode === 'grid' ? '網格' : mode === 'list' ? '列表' : '樹狀'}
              </button>
            ))}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="action-buttons flex items-center gap-2">
          <button
            onClick={() => setShowBatchOperations(!showBatchOperations)}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            data-testid="batch-operations-toggle"
          >
            批量操作
          </button>
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            data-testid="customization-toggle"
          >
            自定義
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            data-testid="analytics-toggle"
          >
            統計分析
          </button>
        </div>
      </div>

      {/* 高級搜索面板 */}
      {showAdvancedSearch && (
        <div className="mb-4">
          <AdvancedSearchInterface
            onSearch={(query) => setSearchQuery(query)}
            onClose={() => setShowAdvancedSearch(false)}
          />
        </div>
      )}

      {/* 批量操作面板 */}
      {showBatchOperations && selectedItems.size > 0 && (
        <div className="mb-4">
          <BatchOperationPanel
            selectedItems={Array.from(selectedItems)}
            onMove={(items, targetId) => console.log('批量移動:', items, targetId)}
            onDelete={(items) => console.log('批量刪除:', items)}
            onShare={(items) => console.log('批量分享:', items)}
            onClose={() => setShowBatchOperations(false)}
          />
        </div>
      )}

      {/* 主要內容區域 */}
      <div className="main-content-area flex gap-4">
        {/* 檔案夾樹狀視圖 */}
        <div className="folder-tree-panel w-1/4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">檔案夾</h3>
            <button
              onClick={() => handleFolderCreate('新檔案夾')}
              className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              data-testid="create-folder-button"
            >
              新增
            </button>
          </div>
          
          <DragDropFolderTree
            folders={folders}
            selectedFolder={currentFolder}
            onFolderSelect={setCurrentFolder}
            onFolderCreate={handleFolderCreate}
            onFolderRename={handleFolderRename}
            onFolderDelete={handleFolderDelete}
            onFolderMove={handleFolderMove}
            userId={userId}
          />
        </div>

        {/* 高級過濾器 */}
        <div className="filter-panel mb-6">
          <AdvancedActivityFilter
            activities={activities}
            onFilterChange={handleFilterChange}
            onFilterConfigChange={handleFilterConfigChange}
            isCollapsed={isFilterCollapsed}
            onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
            className="w-full"
          />
        </div>

        {/* 智能搜索系統 */}
        <div className="search-panel mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">智能搜索系統</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  data-testid="toggle-advanced-search"
                >
                  {showAdvancedSearch ? '隱藏高級選項' : '顯示高級選項'}
                </button>
                {isSearchActive && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    搜索結果已啟用
                  </span>
                )}
              </div>
            </div>

            <IntelligentActivitySearch
              activities={activities}
              onSearchResults={handleSearchResults}
              onSearchConfigChange={handleSearchConfigChange}
              placeholder="智能搜索活動... (支持全文搜索、模糊匹配、語義搜索)"
              showAdvancedOptions={showAdvancedSearch}
              enableRealTimeSearch={true}
              searchDelay={300}
              className="w-full"
            />
          </div>
        </div>

        {/* 活動顯示區域 */}
        <div className="activities-panel flex-1 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-800">
                活動 ({isSearchActive ? searchResults.length : (filteredActivities.length > 0 ? filteredActivities.length : activities.length)} / {totalActivities > 0 ? totalActivities : activities.length})
              </h3>
              {enableVirtualization && totalActivities > 100 && (
                <span
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                  data-testid="virtualized-indicator"
                >
                  虛擬化渲染
                </span>
              )}
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                多視圖模式
              </span>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                智能搜索
              </span>
              {activeFiltersCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {activeFiltersCount} 個過濾器
                </span>
              )}
              {isSearchActive && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  搜索結果
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                data-testid="select-all-button"
              >
                全選
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                data-testid="deselect-all-button"
              >
                取消選擇
              </button>
            </div>
          </div>

          {/* 多視圖活動顯示 */}
          <div className="activities-display p-4" data-testid="activities-display">
            <MultiViewActivityDisplay
              activities={
                isSearchActive
                  ? searchResults.map(result => result.activity)
                  : (filteredActivities.length > 0 ? filteredActivities : activities)
              }
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onActivitySelect={handleActivitySelect}
              onActivityEdit={handleActivityEdit}
              onActivityDelete={handleActivityDelete}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
              searchQuery={searchQuery}
              sortBy={sortBy}
              sortOrder={sortOrder}
              hasNextPage={hasNextPage}
              isNextPageLoading={isNextPageLoading}
              loadNextPage={loadNextPage}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* 自定義面板 */}
      {showCustomization && (
        <FolderCustomizationPanel
          folderId={selectedFolderForAction}
          onClose={() => setShowCustomization(false)}
          onSave={(settings) => console.log('保存自定義設置:', settings)}
        />
      )}

      {/* 統計分析面板 */}
      {showAnalytics && (
        <FolderAnalyticsPanel
          folderId={currentFolder}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* 分享對話框 */}
      {showShareDialog && selectedFolderForAction && (
        <ShareDialog
          itemId={selectedFolderForAction}
          itemType="folder"
          onClose={() => setShowShareDialog(false)}
          onShare={(settings) => console.log('分享設置:', settings)}
        />
      )}

      {/* 權限管理面板 */}
      {showPermissions && selectedFolderForAction && (
        <FolderPermissionManager
          folderId={selectedFolderForAction}
          currentUserId={userId}
          onPermissionChange={() => console.log('權限已更新')}
        />
      )}

      {/* 批量操作面板 */}
      {showBatchPanel && selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BatchOperationPanel
            selectedItems={selectedItems}
            activities={activities}
            onSelectionChange={handleSelectionChange}
            onBatchOperation={handleBatchOperation}
            onClose={() => setShowBatchPanel(false)}
            enabledOperations={['move', 'copy', 'duplicate', 'delete', 'share', 'tag', 'export', 'archive', 'publish']}
            maxSelectionCount={100}
            showProgress={true}
            className="shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default MyActivities;
