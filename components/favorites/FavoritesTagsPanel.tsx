/**
 * 收藏和標籤系統面板組件
 * 展示自定義標籤、智能分類、收藏管理功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';

interface FavoritesTagsPanelProps {
  userId: string;
  showFavorites?: boolean;
  showTags?: boolean;
  enableSmartClassification?: boolean;
  enableBatchOperations?: boolean;
}

interface FavoriteItem {
  id: string;
  activityId: string;
  activityName: string;
  activityType: 'quiz' | 'flashcard' | 'matching' | 'fill-blank' | 'sequence';
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  tags: string[];
  addedAt: Date;
  category: string;
}

interface TagItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  usageCount: number;
  category: 'user-created' | 'auto-generated' | 'gept-level';
  createdAt: Date;
  description?: string;
}

interface SmartClassification {
  category: string;
  confidence: number;
  suggestedTags: string[];
  geptLevel: string;
  difficulty: number;
}

export const FavoritesTagsPanel: React.FC<FavoritesTagsPanelProps> = ({
  userId,
  showFavorites = true,
  showTags = true,
  enableSmartClassification = true,
  enableBatchOperations = false
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'tags' | 'smart'>('favorites');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [smartClassifications, setSmartClassifications] = useState<SmartClassification[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadFavoritesAndTags();
  }, [userId]);

  const loadFavoritesAndTags = async () => {
    setIsLoading(true);
    
    // 模擬數據載入
    setTimeout(() => {
      // 收藏數據
      setFavorites([
        {
          id: '1',
          activityId: 'act-1',
          activityName: '英語單字配對遊戲',
          activityType: 'matching',
          geptLevel: 'elementary',
          tags: ['英語', '單字', '初級'],
          addedAt: new Date('2025-07-15'),
          category: '語言學習'
        },
        {
          id: '2',
          activityId: 'act-2',
          activityName: '數學填空練習',
          activityType: 'fill-blank',
          geptLevel: 'intermediate',
          tags: ['數學', '計算', '中級'],
          addedAt: new Date('2025-07-14'),
          category: '數學'
        },
        {
          id: '3',
          activityId: 'act-3',
          activityName: '科學選擇題測驗',
          activityType: 'quiz',
          geptLevel: 'high-intermediate',
          tags: ['科學', '測驗', '高級'],
          addedAt: new Date('2025-07-13'),
          category: '科學'
        }
      ]);

      // 標籤數據
      setTags([
        {
          id: 'tag-1',
          name: '英語',
          color: '#3B82F6',
          icon: '🇬🇧',
          usageCount: 15,
          category: 'user-created',
          createdAt: new Date('2025-07-10'),
          description: '英語相關學習內容'
        },
        {
          id: 'tag-2',
          name: '數學',
          color: '#10B981',
          icon: '🔢',
          usageCount: 12,
          category: 'user-created',
          createdAt: new Date('2025-07-09'),
          description: '數學計算和邏輯'
        },
        {
          id: 'tag-3',
          name: '初級',
          color: '#F59E0B',
          icon: '🟡',
          usageCount: 8,
          category: 'gept-level',
          createdAt: new Date('2025-07-08'),
          description: 'GEPT 初級等級內容'
        },
        {
          id: 'tag-4',
          name: '記憶訓練',
          color: '#8B5CF6',
          icon: '🧠',
          usageCount: 6,
          category: 'auto-generated',
          createdAt: new Date('2025-07-07'),
          description: 'AI 自動生成的記憶訓練標籤'
        }
      ]);

      // 智能分類數據
      setSmartClassifications([
        {
          category: '語言學習',
          confidence: 0.92,
          suggestedTags: ['英語', '詞彙', '語法'],
          geptLevel: 'elementary',
          difficulty: 6.2
        },
        {
          category: '數學邏輯',
          confidence: 0.88,
          suggestedTags: ['數學', '邏輯', '計算'],
          geptLevel: 'intermediate',
          difficulty: 7.5
        },
        {
          category: '科學探索',
          confidence: 0.85,
          suggestedTags: ['科學', '實驗', '理論'],
          geptLevel: 'high-intermediate',
          difficulty: 8.1
        }
      ]);

      setIsLoading(false);
    }, 1500);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: TagItem = {
        id: `tag-${Date.now()}`,
        name: newTagName.trim(),
        color: '#6B7280',
        icon: '🏷️',
        usageCount: 0,
        category: 'user-created',
        createdAt: new Date(),
        description: `用戶創建的標籤：${newTagName.trim()}`
      };
      setTags([...tags, newTag]);
      setNewTagName('');
    }
  };

  const handleRemoveFavorite = (favoriteId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== favoriteId));
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '❓';
      case 'flashcard': return '📚';
      case 'matching': return '🔗';
      case 'fill-blank': return '✏️';
      case 'sequence': return '🔢';
      default: return '📝';
    }
  };

  const getGeptLevelColor = (level: string) => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagCategoryIcon = (category: string) => {
    switch (category) {
      case 'user-created': return '👤';
      case 'auto-generated': return '🤖';
      case 'gept-level': return '📊';
      default: return '🏷️';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入收藏和標籤數據中...</p>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="favorites-tags-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {showFavorites && (
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="favorites-tab"
          >
            ⭐ 我的收藏
          </button>
        )}
        {showTags && (
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tags'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="tags-tab"
          >
            🏷️ 標籤管理
          </button>
        )}
        {enableSmartClassification && (
          <button
            onClick={() => setActiveTab('smart')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'smart'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="smart-classification-tab"
          >
            🤖 智能分類
          </button>
        )}
      </div>

      {/* 我的收藏 */}
      {activeTab === 'favorites' && (
        <div data-testid="favorites-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">我的收藏 ({favorites.length})</h3>
            <div className="text-sm text-gray-500">
              按添加時間排序
            </div>
          </div>
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityTypeIcon(favorite.activityType)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{favorite.activityName}</h4>
                      <p className="text-sm text-gray-600">{favorite.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(favorite.geptLevel)}`}>
                      {favorite.geptLevel}
                    </span>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      data-testid={`remove-favorite-${favorite.id}`}
                    >
                      移除
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorite.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  收藏於：{favorite.addedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 標籤管理 */}
      {activeTab === 'tags' && (
        <div data-testid="tags-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">標籤管理 ({tags.length})</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="輸入新標籤名稱"
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                data-testid="new-tag-input"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                data-testid="add-tag-button"
              >
                添加
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tags.map((tag) => (
              <div key={tag.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tag.icon}</span>
                    <span className="font-medium text-gray-900">{tag.name}</span>
                    <span className="text-lg">{getTagCategoryIcon(tag.category)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    data-testid={`delete-tag-${tag.id}`}
                  >
                    刪除
                  </button>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {tag.description}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>使用次數: {tag.usageCount}</span>
                  <span>創建於: {tag.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="mt-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 智能分類 */}
      {activeTab === 'smart' && (
        <div data-testid="smart-classification-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">智能分類建議</h3>
          <div className="space-y-4">
            {smartClassifications.map((classification, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{classification.category}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      信心度: {(classification.confidence * 100).toFixed(1)}%
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(classification.geptLevel)}`}>
                      {classification.geptLevel}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-gray-600">建議標籤：</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {classification.suggestedTags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  難度等級: {classification.difficulty.toFixed(1)}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 收藏功能：點擊活動旁的星號圖標即可收藏，方便日後快速訪問</p>
          <p>• 標籤管理：創建個人化標籤來組織內容，支持顏色和圖標自定義</p>
          <p>• 智能分類：AI 會根據內容自動建議合適的分類和標籤</p>
          <p>• 記憶科學：標籤和收藏有助於建立知識關聯，提升學習效果</p>
        </div>
      </div>
    </div>
  );
};
