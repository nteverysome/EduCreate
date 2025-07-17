/**
 * ActivityLibrary.tsx - 活動庫管理界面
 * Day 1-2 檔案空間系統的活動管理組件
 * 提供活動的瀏覽、搜索、分類和管理功能
 */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FolderManager, FolderItem } from '@/lib/content/FolderManager';
interface Activity {
  id: string;
  title: string;
  description?: string;
  type: 'quiz' | 'matching' | 'flashcard' | 'fill-blank' | 'sequence' | 'word-search' | 'crossword' | 'memory' | 'drag-drop' | 'true-false';
  folderId?: string;
  userId: string;
  isPublic: boolean;
  isTemplate: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  subject: string;
  tags: string[];
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  usageCount: number;
  rating: number;
  ratingCount: number;
  learningEffectiveness?: number;
  completionRate?: number;
  averageTime?: number; // 平均完成時間（秒）
  isShared: boolean;
  shareSettings?: {
    isPublic: boolean;
    allowCopy: boolean;
    allowEdit: boolean;
    shareCode?: string;
  };
}
interface ActivityLibraryProps {
  userId: string;
  folderId?: string;
  showTemplates?: boolean;
  showPublicActivities?: boolean;
  onActivitySelect?: (activity: Activity) => void;
  onActivityEdit?: (activity: Activity) => void;
  onActivityDelete?: (activityId: string) => void;
  onActivityMove?: (activityId: string, targetFolderId: string) => void;
  onActivityCopy?: (activity: Activity) => void;
}
export const ActivityLibrary: React.FC<ActivityLibraryProps> = ({
  userId,
  folderId,
  showTemplates = false,
  showPublicActivities = false,
  onActivitySelect,
  onActivityEdit,
  onActivityDelete,
  onActivityMove,
  onActivityCopy
}) => {
  // 狀態管理
  const [activities, setActivities] = useState<Activity[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedGeptLevel, setSelectedGeptLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'usage' | 'rating' | 'effectiveness'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  // 載入數據
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 載入活動
      const userActivities = await loadActivities(userId, folderId, showTemplates, showPublicActivities);
      setActivities(userActivities);
      // 載入檔案夾列表（用於移動操作）
      const userFolders = await FolderManager.getUserFolders(userId);
      setFolders(userFolders);
    } catch (error) {
      console.error('載入活動庫數據失敗:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, folderId, showTemplates, showPublicActivities]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  // 模擬載入活動數據
  const loadActivities = async (
    userId: string, 
    folderId?: string, 
    includeTemplates = false, 
    includePublic = false
  ): Promise<Activity[]> => {
    // 這裡應該調用實際的 API
    const mockActivities: Activity[] = [
      {
        id: '1',
        title: 'GEPT 初級詞彙閃卡',
        description: '包含 GEPT 初級考試常見詞彙的互動式閃卡遊戲',
        type: 'flashcard',
        folderId: folderId,
        userId: userId,
        isPublic: false,
        isTemplate: false,
        difficulty: 'beginner',
        geptLevel: 'elementary',
        subject: '英語',
        tags: ['vocabulary', 'gept', 'elementary', 'flashcard'],
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-12'),
        lastAccessedAt: new Date('2025-01-15'),
        size: 1024 * 50,
        usageCount: 25,
        rating: 4.5,
        ratingCount: 12,
        learningEffectiveness: 0.85,
        completionRate: 0.78,
        averageTime: 180,
        isShared: false
      },
      {
        id: '2',
        title: '英語動詞時態配對',
        description: '練習英語動詞時態的配對遊戲',
        type: 'matching',
        folderId: folderId,
        userId: userId,
        isPublic: true,
        isTemplate: false,
        difficulty: 'intermediate',
        geptLevel: 'intermediate',
        subject: '英語',
        tags: ['grammar', 'verbs', 'tenses', 'matching'],
        createdAt: new Date('2025-01-08'),
        updatedAt: new Date('2025-01-14'),
        size: 1024 * 75,
        usageCount: 42,
        rating: 4.8,
        ratingCount: 18,
        learningEffectiveness: 0.92,
        completionRate: 0.85,
        averageTime: 240,
        isShared: true,
        shareSettings: {
          isPublic: true,
          allowCopy: true,
          allowEdit: false,
          shareCode: 'VERB123'
        }
      },
      {
        id: '3',
        title: '數學基礎運算練習',
        description: '小學數學基礎運算的問答遊戲',
        type: 'quiz',
        folderId: folderId,
        userId: userId,
        isPublic: false,
        isTemplate: true,
        difficulty: 'beginner',
        subject: '數學',
        tags: ['math', 'arithmetic', 'elementary', 'quiz'],
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-10'),
        size: 1024 * 32,
        usageCount: 15,
        rating: 4.2,
        ratingCount: 8,
        learningEffectiveness: 0.76,
        completionRate: 0.82,
        averageTime: 300,
        isShared: false
      }
    ];
    return mockActivities.filter(activity => {
      if (folderId && activity.folderId !== folderId) return false;
      if (!includeTemplates && activity.isTemplate) return false;
      if (!includePublic && activity.isPublic && activity.userId !== userId) return false;
      return true;
    });
  };
  // 過濾和排序活動
  const filteredAndSortedActivities = activities
    .filter(activity => {
      // 搜索過濾
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = activity.title.toLowerCase().includes(query);
        const matchesDescription = activity.description?.toLowerCase().includes(query);
        const matchesTags = activity.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDescription && !matchesTags) return false;
      }
      // 類型過濾
      if (selectedType !== 'all' && activity.type !== selectedType) return false;
      // 難度過濾
      if (selectedDifficulty !== 'all' && activity.difficulty !== selectedDifficulty) return false;
      // GEPT 等級過濾
      if (selectedGeptLevel !== 'all' && activity.geptLevel !== selectedGeptLevel) return false;
      // 科目過濾
      if (selectedSubject !== 'all' && activity.subject !== selectedSubject) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'effectiveness':
          comparison = (a.learningEffectiveness || 0) - (b.learningEffectiveness || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  // 獲取唯一的科目列表
  const uniqueSubjects = Array.from(new Set(activities.map(a => a.subject)));
  // 處理活動選擇
  const handleActivitySelect = (activityId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedActivities);
    if (isSelected) {
      newSelection.add(activityId);
    } else {
      newSelection.delete(activityId);
    }
    setSelectedActivities(newSelection);
  };
  // 處理活動操作
  const handleActivityAction = (action: string, activity: Activity) => {
    switch (action) {
      case 'select':
        onActivitySelect?.(activity);
        break;
      case 'edit':
        onActivityEdit?.(activity);
        break;
      case 'delete':
        if (confirm(`確定要刪除活動「${activity.title}」嗎？`)) {
          onActivityDelete?.(activity.id);
        }
        break;
      case 'copy':
        onActivityCopy?.(activity);
        break;
    }
  };
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };
  // 格式化時間
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="activity-library-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入活動庫...</span>
      </div>
    );
  }
  return (
    <div className="activity-library-container" data-testid="activity-library-main">
      {/* 標題和統計 */}
      <div className="header-section mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">活動庫</h2>
            <p className="text-gray-600 mt-1">
              共 {filteredAndSortedActivities.length} 個活動
              {selectedActivities.size > 0 && ` (已選擇 ${selectedActivities.size} 個)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              data-testid="toggle-filters-button"
            >
              {showFilters ? '隱藏篩選' : '顯示篩選'}
            </button>
            <div className="view-mode-buttons flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                data-testid="view-mode-grid"
              >
                網格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                data-testid="view-mode-list"
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 搜索和篩選區域 */}
      <div className="search-filter-section mb-6 p-4 bg-white rounded-lg shadow-sm border">
        {/* 搜索欄 */}
        <div className="search-bar mb-4">
          <input
            type="text"
            placeholder="搜索活動標題、描述或標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="activity-search-input"
          />
        </div>
        {/* 篩選器 */}
        {showFilters && (
          <div className="filters-panel grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                data-testid="type-filter"
              >
                <option value="all">全部類型</option>
                <option value="quiz">問答</option>
                <option value="matching">配對</option>
                <option value="flashcard">閃卡</option>
                <option value="fill-blank">填空</option>
                <option value="sequence">排序</option>
                <option value="word-search">找字</option>
                <option value="crossword">填字</option>
                <option value="memory">記憶</option>
                <option value="drag-drop">拖拽</option>
                <option value="true-false">是非</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">難度</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                data-testid="difficulty-filter"
              >
                <option value="all">全部難度</option>
                <option value="beginner">初級</option>
                <option value="intermediate">中級</option>
                <option value="advanced">高級</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GEPT 等級</label>
              <select
                value={selectedGeptLevel}
                onChange={(e) => setSelectedGeptLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                data-testid="gept-level-filter"
              >
                <option value="all">全部等級</option>
                <option value="elementary">初級</option>
                <option value="intermediate">中級</option>
                <option value="high-intermediate">中高級</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                data-testid="subject-filter"
              >
                <option value="all">全部科目</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                data-testid="sort-by-select"
              >
                <option value="title">標題</option>
                <option value="date">更新日期</option>
                <option value="usage">使用次數</option>
                <option value="rating">評分</option>
                <option value="effectiveness">學習效果</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">順序</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                data-testid="sort-order-select"
              >
                <option value="asc">升序</option>
                <option value="desc">降序</option>
              </select>
            </div>
          </div>
        )}
      </div>
      {/* 活動顯示區域 */}
      <div className="activities-display-section">
        {filteredAndSortedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500" data-testid="no-activities-message">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">沒有找到活動</h3>
            <p>嘗試調整搜索條件或篩選器</p>
          </div>
        ) : (
          <div className={`activities-grid ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`activity-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                  selectedActivities.has(activity.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } ${viewMode === 'list' ? 'flex items-center p-4' : 'p-4'}`}
                data-testid={`activity-card-${activity.id}`}
              >
                {/* 活動縮圖 */}
                <div className={`activity-thumbnail ${viewMode === 'list' ? 'w-16 h-16 mr-4' : 'w-full h-32 mb-3'} bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">
                    {activity.type === 'quiz' && '❓'}
                    {activity.type === 'matching' && '🔗'}
                    {activity.type === 'flashcard' && '📇'}
                    {activity.type === 'fill-blank' && '✏️'}
                    {activity.type === 'sequence' && '🔢'}
                    {activity.type === 'word-search' && '🔍'}
                    {activity.type === 'crossword' && '📝'}
                    {activity.type === 'memory' && '🧠'}
                    {activity.type === 'drag-drop' && '🎯'}
                    {activity.type === 'true-false' && '✅'}
                  </span>
                </div>
                {/* 活動信息 */}
                <div className={`activity-info ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                      {activity.title}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedActivities.has(activity.id)}
                      onChange={(e) => handleActivitySelect(activity.id, e.target.checked)}
                      className="ml-2 text-blue-600"
                      data-testid={`activity-checkbox-${activity.id}`}
                    />
                  </div>
                  {activity.description && viewMode === 'grid' && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  {/* 活動統計 */}
                  <div className="activity-stats text-xs text-gray-500 space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span>類型: {activity.type}</span>
                      <span>大小: {formatFileSize(activity.size)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>使用: {activity.usageCount}次</span>
                      <span>評分: ⭐ {activity.rating.toFixed(1)}</span>
                    </div>
                    {activity.learningEffectiveness && (
                      <div className="flex items-center justify-between">
                        <span>效果: {Math.round(activity.learningEffectiveness * 100)}%</span>
                        {activity.averageTime && (
                          <span>時間: {formatTime(activity.averageTime)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* 標籤 */}
                  <div className="activity-tags flex flex-wrap gap-1 mb-3">
                    {activity.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {activity.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{activity.tags.length - 3}</span>
                    )}
                  </div>
                  {/* 操作按鈕 */}
                  <div className="activity-actions flex items-center gap-2">
                    <button
                      onClick={() => handleActivityAction('select', activity)}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      data-testid={`activity-select-${activity.id}`}
                    >
                      選擇
                    </button>
                    <button
                      onClick={() => handleActivityAction('edit', activity)}
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      data-testid={`activity-edit-${activity.id}`}
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleActivityAction('copy', activity)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      data-testid={`activity-copy-${activity.id}`}
                    >
                      複製
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ActivityLibrary;
