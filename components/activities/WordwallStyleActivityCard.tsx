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
  Info,
  Check,
  X,
  Folder,
  FileEdit,
  BookOpen,
  QrCode
} from 'lucide-react';
import { loadVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';
import GameThumbnailPreview from './GameThumbnailPreview';

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
  thumbnail?: string; // ✅ 改為可選，因為截圖可能尚未生成
  screenshotStatus?: string; // pending, generating, completed, failed
  screenshotError?: string; // 截圖生成錯誤信息
  screenshotRetryCount?: number; // 重試次數
  wordCount?: number;
  geptLevel?: string;
  tags?: string[];
  content?: any; // ✅ 添加 content 字段，包含 gameTemplateId 等信息
  vocabularyItems?: Array<{
    id: string;
    english: string;
    chinese: string;
  }>;
  isPublicShared?: boolean; // 社區分享狀態
  shareToken?: string; // 分享 token
  communityPlays?: number; // 社區遊玩次數
  communityTags?: string[]; // 社區標籤
  communityCategory?: string; // 社區分類
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
  onRename?: (activity: Activity, newTitle: string) => void;
  onMove?: (activity: Activity) => void;
  onEditContent?: (activity: Activity) => void;
  onAssignment?: (activity: Activity) => void;
  onCommunityShare?: (activity: Activity) => void;
  onQRCode?: (activity: Activity) => void;
  selectionMode?: boolean;
  // 拖拽相關
  onDragStart?: (activity: Activity) => void;
  onDragEnd?: () => void;
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
  onRename,
  onMove,
  onEditContent,
  onAssignment,
  onCommunityShare,
  onQRCode,
  selectionMode = false,
  onDragStart,
  onDragEnd
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [vocabularyData, setVocabularyData] = useState<Array<{english: string, chinese: string}> | null>(null);
  const [loadingVocabulary, setLoadingVocabulary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(activity.title);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [retryingScreenshot, setRetryingScreenshot] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // 動態更新菜單位置
  React.useEffect(() => {
    if (showMenu && menuRef.current) {
      const menuElement = menuRef.current;
      const rect = menuElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = menuPosition.x;
      let newY = menuPosition.y;
      let needsUpdate = false;

      // 檢查右側邊界
      if (rect.right > viewportWidth - 8) {
        newX = Math.max(8, viewportWidth - rect.width - 8);
        needsUpdate = true;
      }

      // 檢查左側邊界
      if (rect.left < 8) {
        newX = 8;
        needsUpdate = true;
      }

      // 檢查底部邊界
      if (rect.bottom > viewportHeight - 8) {
        newY = Math.max(8, viewportHeight - rect.height - 8);
        needsUpdate = true;
      }

      // 檢查頂部邊界
      if (rect.top < 8) {
        newY = 8;
        needsUpdate = true;
      }

      if (needsUpdate) {
        setMenuPosition({ x: newX, y: newY });
      }
    }
  }, [showMenu, menuPosition.x, menuPosition.y]);



  // 載入詞彙數據（使用統一的工具函數）
  const loadVocabularyDataFromAPI = async () => {
    if (vocabularyData || loadingVocabulary) return; // 避免重複載入

    setLoadingVocabulary(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}`);
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`);
      }

      const activityData = await response.json();

      // 使用統一的詞彙載入工具函數
      const { vocabularyItems, source, count } = loadVocabularyData(activityData);

      console.log('📝 載入詞彙數據:', {
        activityId: activity.id,
        vocabularyCount: count,
        source: getSourceDisplayName(source)
      });

      setVocabularyData(vocabularyItems);
    } catch (error) {
      console.error('載入詞彙數據失敗:', error);
      setVocabularyData([]);
    } finally {
      setLoadingVocabulary(false);
    }
  };

  // 動態計算菜單位置
  const calculateMenuPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 預估菜單尺寸
    const menuWidth = 200; // 預估寬度
    const menuHeight = 300; // 預估高度

    let x = rect.right - menuWidth; // 默認右對齊
    let y = rect.bottom + 4; // 默認在按鈕下方

    // 如果右側空間不足，改為左對齊
    if (x < 8) {
      x = 8;
    }

    // 如果右側超出視窗，調整到左側
    if (rect.right + menuWidth > viewportWidth - 8) {
      x = Math.max(8, viewportWidth - menuWidth - 8);
    }

    // 如果下方空間不足，顯示在按鈕上方
    if (y + menuHeight > viewportHeight - 8) {
      y = Math.max(8, rect.top - menuHeight - 4);
    }

    return { x, y };
  };

  // 處理菜單開關
  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!showMenu) {
      const position = calculateMenuPosition(e.currentTarget);
      setMenuPosition(position);
    }

    setShowMenu(!showMenu);
  };

  // 處理重新命名
  const handleRename = () => {
    setIsRenaming(true);
    setShowMenu(false);
  };

  const handleSaveRename = () => {
    if (newTitle.trim() && newTitle.trim() !== activity.title) {
      onRename?.(activity, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setNewTitle(activity.title);
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  // 處理重試截圖
  const handleRetryScreenshot = async () => {
    if (retryingScreenshot) return;

    setRetryingScreenshot(true);
    try {
      const response = await fetch('/api/retry-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: activity.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 成功：刷新頁面或更新狀態
        window.location.reload();
      } else {
        // 失敗：顯示錯誤信息
        alert(result.message || result.error || '重試失敗');
      }
    } catch (error) {
      console.error('重試截圖失敗:', error);
      alert('重試失敗，請稍後再試');
    } finally {
      setRetryingScreenshot(false);
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

  // 遊戲類型映射（包含圖標和中文名稱）
  const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
    // 優先使用 activity.content.gameTemplateId 獲取具體的遊戲名稱
    const gameTemplateId = (activity as any).content?.gameTemplateId;

    const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
      // 基礎遊戲類型
      'quiz': { icon: '❓', name: '測驗' },
      'matching': { icon: '🔗', name: '配對遊戲' },
      'flashcards': { icon: '📚', name: '單字卡片' },
      'flashcard': { icon: '📚', name: '單字卡片' },
      'vocabulary': { icon: '📝', name: '詞彙遊戲' },

      // 具體遊戲模板 ID
      'shimozurdo-game': { icon: '☁️', name: 'Shimozurdo 雲朵遊戲' },
      'airplane-vite': { icon: '✈️', name: '飛機遊戲 (Vite版)' },
      'matching-pairs': { icon: '🔗', name: '配對記憶' },
      'flash-cards': { icon: '📚', name: '閃卡記憶' },
      'whack-mole': { icon: '🔨', name: '打地鼠' },
      'spin-wheel': { icon: '🎡', name: '轉盤選擇' },
      'memory-cards': { icon: '🧠', name: '記憶卡片' },
      'complete-sentence': { icon: '📝', name: '完成句子' },
      'spell-word': { icon: '✍️', name: '拼寫單詞' },
      'labelled-diagram': { icon: '🏷️', name: '標籤圖表' },
      'watch-memorize': { icon: '👁️', name: '觀察記憶' },
      'rank-order': { icon: '📈', name: '排序遊戲' },
      'math-generator': { icon: '🔢', name: '數學生成器' },
      'word-magnets': { icon: '🧲', name: '單詞磁鐵' },
      'group-sort': { icon: '📊', name: '分類遊戲' },
      'image-quiz': { icon: '🖼️', name: '圖片問答' },
      'maze-chase': { icon: '🏃', name: '迷宮追逐' },
      'crossword-puzzle': { icon: '📋', name: '填字遊戲' },
      'flying-fruit': { icon: '🍎', name: '飛行水果' },
      'flip-tiles': { icon: '🔲', name: '翻轉方塊' },
      'type-answer': { icon: '⌨️', name: '輸入答案' },
      'anagram': { icon: '🔤', name: '字母重組' },

      // Wordwall 風格遊戲
      'hangman': { icon: '🎯', name: '猜字遊戲' },
      'true-false': { icon: '✅', name: '是非題' },
      'wordsearch': { icon: '🔍', name: '找字遊戲' },
      'match-up': { icon: '🎯', name: '配對' },
      'airplane': { icon: '✈️', name: '飛機遊戲' },
      'balloon-pop': { icon: '🎈', name: '氣球遊戲' },
      'open-box': { icon: '📦', name: '開箱遊戲' },
      'gameshow-quiz': { icon: '🎬', name: '競賽測驗' },
      'random-wheel': { icon: '🎰', name: '隨機轉盤' },
      'random-cards': { icon: '🃏', name: '隨機卡片' },
      'speaking-cards': { icon: '🗣️', name: '語音卡片' },

      // 中文名稱映射
      '飛機遊戲': { icon: '✈️', name: '飛機遊戲' },
      '匹配遊戲': { icon: '🔗', name: '配對遊戲' },
      '測驗': { icon: '❓', name: '測驗' },
      '問答遊戲': { icon: '🎯', name: '問答遊戲' },
      '開箱遊戲': { icon: '📦', name: '開箱遊戲' },
      '迷宮追逐': { icon: '🏃', name: '迷宮追逐' },
      '詞彙遊戲': { icon: '📝', name: '詞彙遊戲' },
      '單字卡片': { icon: '📚', name: '單字卡片' },
      '猜字遊戲': { icon: '🎯', name: '猜字遊戲' },
      '圖片問答': { icon: '🖼️', name: '圖片問答' },
      '是非題': { icon: '✅', name: '是非題' },
      '打地鼠': { icon: '🔨', name: '打地鼠' },
      '轉盤': { icon: '🎡', name: '轉盤' },
      '記憶卡片': { icon: '🧠', name: '記憶卡片' },
    };

    // 優先使用 gameTemplateId，如果沒有則使用 gameType
    const lookupKey = gameTemplateId || gameType;
    return gameTypeMap[lookupKey] || { icon: '🎮', name: lookupKey || '遊戲' };
  };

  const getGameTypeIcon = (gameType: string) => {
    return getGameTypeInfo(gameType).icon;
  };

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(activity);
    }
    // 移除播放功能，只有 Play 按鈕才能觸發播放
  };

  // 拖拽事件處理
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', activity.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(activity);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };



  return (
    <div
      className={`
        activity-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
        ${selectionMode ? 'hover:ring-2 hover:ring-blue-300' : 'hover:border-gray-300'}
        ${isDragging ? 'opacity-50 transform rotate-2' : ''}
      `}
      onClick={handleCardClick}
      draggable={!selectionMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
            // 根據截圖狀態顯示不同的佔位符
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                {activity.screenshotStatus === 'generating' ? (
                  <>
                    <div className="text-6xl mb-2 animate-pulse">📸</div>
                    <div className="text-sm text-gray-500">正在生成截圖...</div>
                  </>
                ) : activity.screenshotStatus === 'failed' ? (
                  <>
                    <div className="text-6xl mb-2">❌</div>
                    <div className="text-sm text-red-500">截圖生成失敗</div>
                    {activity.screenshotError && (
                      <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                        {activity.screenshotError}
                      </div>
                    )}
                    {activity.screenshotRetryCount !== undefined && activity.screenshotRetryCount < 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetryScreenshot();
                        }}
                        className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        重試 ({activity.screenshotRetryCount}/3)
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-2">🎮</div>
                    <div className="text-sm text-gray-500">等待生成截圖...</div>
                  </>
                )}
              </div>
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

        {/* 公開/私人/社區開放標識 */}
        <div className="absolute top-2 right-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${activity.isPublicShared
              ? 'bg-blue-100 text-blue-700'
              : activity.isPublic
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }
          `}>
            {activity.isPublicShared ? (
              <>
                <Users className="w-3 h-3" />
                社區開放
              </>
            ) : activity.isPublic ? (
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
      </div>

      {/* 卡片內容 */}
      <div className="p-4">
        {/* 遊戲類型標籤 - 移到卡片內容區域 */}
        <div className="mb-3">
          <div className="inline-flex bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 items-center gap-2">
            <span className="text-lg leading-none">{getGameTypeInfo(activity.gameType).icon}</span>
            <span className="text-sm font-semibold">{getGameTypeInfo(activity.gameType).name}</span>
          </div>
        </div>

        {/* 標題 */}
        {isRenaming ? (
          <div className="mb-2 min-h-[2.5rem] flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveRename}
              className="flex-1 font-semibold text-gray-900 text-sm border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSaveRename}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="保存"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={handleCancelRename}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="取消"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {activity.title}
          </h3>
        )}

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
                loadVocabularyDataFromAPI();
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

        {/* 社區標籤 - 只在公開發布時顯示 */}
        {activity.isPublicShared && (activity.communityTags || activity.communityCategory) && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {/* 分類標籤 */}
              {activity.communityCategory && (
                <span className="px-2.5 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                  {activity.communityCategory}
                </span>
              )}

              {/* 社區標籤 */}
              {activity.communityTags && activity.communityTags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

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
                  onClick={handleMenuToggle}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  title="更多選項"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>


              </div>
            </div>
          )}
        </div>
      </div>

      {/* 響應式下拉菜單 */}
      {showMenu && (
        <>
          {/* 背景遮罩 - 手機版更明顯 */}
          <div
            className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent"
            onClick={() => setShowMenu(false)}
          />

          <div
            ref={menuRef}
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] sm:min-w-[180px] max-w-[90vw] sm:max-w-[280px] max-h-[80vh] overflow-y-auto"
            style={{
              left: menuPosition.x,
              top: menuPosition.y
            }}
          >
            {/* 菜單標題 - 響應式 */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {activity.gameType}
              </p>
            </div>

            {/* 菜單項目 - 響應式 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Edit2 className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">重新命名</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Copy className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">複製</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Share2 className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">分享</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommunityShare?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Globe className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">社區分享</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onQRCode?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <QrCode className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">QR Code</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssignment?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <BookOpen className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">課業分配</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditContent?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FileEdit className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">編輯內容</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Folder className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">移動到資料夾</span>
            </button>

            <hr className="my-1 border-gray-100" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(activity);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-2 text-xs sm:text-sm hover:bg-red-50 transition-colors text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">刪除</span>
            </button>
          </div>
        </>
      )}

      {/* 詞彙詳情模態框 */}
      {showVocabularyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                詞彙列表 - {activity.title}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVocabularyModal(false);
                }}
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
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVocabularyModal(false);
                }}
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
