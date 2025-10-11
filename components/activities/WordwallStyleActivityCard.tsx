'use client';

import React, { useState } from 'react';
import {
  Play,
  Edit2,
  Copy,
  Trash2,
  Share2,
  MoreVertical,
  Eye,
  Clock,
  Users,
  Globe,
  Lock,
  Info
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: 'vocabulary' | 'system';
  gameType: string; // '飛機遊戲', '匹配遊戲' 等
  isPublic: boolean;
  playCount: number;
  lastModified: Date;
  createdAt: Date;
  thumbnail: string;
  wordCount?: number;
  geptLevel?: string;
  tags?: string[];
  vocabularyItems?: Array<{
    id: string;
    english: string;
    chinese: string;
  }>;
}

interface WordwallStyleActivityCardProps {
  activity: Activity;
  isSelected?: boolean;
  onSelect?: (activity: Activity) => void;
  onPlay?: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onCopy?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
  onShare?: (activity: Activity) => void;
  selectionMode?: boolean;
}

export const WordwallStyleActivityCard: React.FC<WordwallStyleActivityCardProps> = ({
  activity,
  isSelected = false,
  onSelect,
  onPlay,
  onEdit,
  onCopy,
  onDelete,
  onShare,
  selectionMode = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [vocabularyData, setVocabularyData] = useState<Array<{english: string, chinese: string}> | null>(null);
  const [loadingVocabulary, setLoadingVocabulary] = useState(false);

  // 載入詞彙數據
  const loadVocabularyData = async () => {
    if (vocabularyData || loadingVocabulary) return; // 避免重複載入

    setLoadingVocabulary(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}`);
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`);
      }

      const activityData = await response.json();
      if (activityData?.content?.vocabularyItems) {
        setVocabularyData(activityData.content.vocabularyItems);
      } else {
        setVocabularyData([]);
      }
    } catch (error) {
      console.error('載入詞彙數據失敗:', error);
      setVocabularyData([]);
    } finally {
      setLoadingVocabulary(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays} 天前`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} 週前`;
    return date.toLocaleDateString('zh-TW');
  };

  const getGameTypeIcon = (gameType: string) => {
    // 根據遊戲類型返回對應的 emoji 或圖標
    const gameIcons: { [key: string]: string } = {
      '飛機遊戲': '✈️',
      '匹配遊戲': '🔗',
      '測驗': '❓',
      '問答遊戲': '🎯',
      '開箱遊戲': '📦',
      '迷宮追逐': '🏃',
      'vocabulary': '📝',
      'flashcard': '📚',
      'matching': '🔗'
    };
    return gameIcons[gameType] || '🎮';
  };

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(activity);
    } else if (onPlay) {
      onPlay(activity);
    }
  };

  return (
    <div 
      className={`
        activity-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
        ${selectionMode ? 'hover:ring-2 hover:ring-blue-300' : 'hover:border-gray-300'}
      `}
      onClick={handleCardClick}
    >
      {/* 卡片頭部 - 縮略圖區域 */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center overflow-hidden">
          {activity.thumbnail ? (
            <img 
              src={activity.thumbnail} 
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">
              {getGameTypeIcon(activity.gameType)}
            </div>
          )}
        </div>

        {/* 選擇模式的勾選框 */}
        {selectionMode && (
          <div className="absolute top-2 left-2">
            <div className={`
              w-5 h-5 rounded border-2 flex items-center justify-center
              ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}
            `}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* 公開/私人標識 */}
        <div className="absolute top-2 right-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${activity.isPublic 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {activity.isPublic ? (
              <>
                <Globe className="w-3 h-3" />
                公開
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                私人
              </>
            )}
          </div>
        </div>

        {/* 遊戲類型標籤 */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {activity.gameType}
          </div>
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="p-4">
        {/* 標題 */}
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {activity.title}
        </h3>

        {/* 統計信息 */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{activity.playCount}</span>
          </div>
          
          {activity.wordCount && (
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-1 py-0.5 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                loadVocabularyData();
                setShowVocabularyModal(true);
              }}
              title="點擊查看詞彙列表"
            >
              <span>📝</span>
              <span>{activity.wordCount} 詞</span>
              <Info className="w-3 h-3 ml-0.5" />
            </div>
          )}

          {activity.geptLevel && (
            <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
              {activity.geptLevel.toUpperCase()}
            </div>
          )}
        </div>

        {/* 最後修改時間 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDate(activity.lastModified)}</span>
          </div>

          {/* 操作按鈕 */}
          {!selectionMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.(activity);
                }}
                className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                title="播放"
              >
                <Play className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(activity);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                title="編輯"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  title="更多選項"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 下拉菜單 */}
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-[10] min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy?.(activity);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      <Copy className="w-3 h-3" />
                      複製
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare?.(activity);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      <Share2 className="w-3 h-3" />
                      分享
                    </button>
                    
                    <hr className="my-1" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(activity);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      刪除
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 點擊外部關閉菜單 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* 詞彙詳情模態框 */}
      {showVocabularyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                詞彙列表 - {activity.title}
              </h3>
              <button
                onClick={() => setShowVocabularyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {loadingVocabulary ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">載入中...</p>
              </div>
            ) : vocabularyData && vocabularyData.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  共 {vocabularyData.length} 個詞彙：
                </p>
                {vocabularyData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.english}</div>
                      <div className="text-sm text-gray-600">{item.chinese}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-2">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">此活動沒有詞彙數據</p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  // 獲取遊戲類型，從 activity.content.gameTemplateId 或使用默認值
                  const gameTemplateId = (activity as any).content?.gameTemplateId || 'shimozurdo-game';
                  const editUrl = `/create/${gameTemplateId}?edit=${activity.id}`;
                  console.log('🔧 從詞彙預覽跳轉到編輯頁面:', editUrl);
                  window.open(editUrl, '_blank');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span>✏️</span>
                編輯詞彙
              </button>
              <button
                onClick={() => setShowVocabularyModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordwallStyleActivityCard;
