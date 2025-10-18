'use client';

/**
 * 社區活動卡片組件
 *
 * 顯示社區活動的卡片，包括：
 * - 活動標題和描述
 * - 作者信息
 * - 統計數據（瀏覽、喜歡、收藏、遊戲次數）
 * - 分類和標籤
 * - 遊戲類型
 * - 互動按鈕（喜歡、收藏）
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { FormattedCommunityActivity } from '@/lib/community/utils';
import { Eye, Heart, Bookmark, Play, User } from 'lucide-react';

interface CommunityActivityCardProps {
  activity: FormattedCommunityActivity;
  onLikeChange?: (activityId: string, isLiked: boolean, newCount: number) => void;
  onBookmarkChange?: (activityId: string, isBookmarked: boolean, newCount: number) => void;
}

export default function CommunityActivityCard({
  activity,
  onLikeChange,
  onBookmarkChange,
}: CommunityActivityCardProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(activity.stats.likes);
  const [bookmarkCount, setBookmarkCount] = useState(activity.stats.bookmarks);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // 遊戲類型映射（包含圖標和中文名稱）
  const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
    // 優先使用 activity.content.gameTemplateId 獲取具體的遊戲名稱
    const gameTemplateId = activity.content?.gameTemplateId;

    const gameTypeMap: { [key: string]: { icon: string; name: string } } = {
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

      // 通用類型備用
      'vocabulary': { icon: '📝', name: '詞彙遊戲' },
      'quiz': { icon: '❓', name: '問答遊戲' },
      'matching': { icon: '🔗', name: '配對遊戲' },
    };

    // 優先使用 gameTemplateId，如果沒有則使用 gameType
    const lookupKey = gameTemplateId || gameType;
    return gameTypeMap[lookupKey] || { icon: '🎮', name: lookupKey || '遊戲' };
  };

  // 處理喜歡
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      alert('請先登入');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    // 樂觀更新
    setIsLiked(newIsLiked);
    setLikeCount(newCount);

    try {
      const response = await fetch(`/api/community/activities/${activity.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('操作失敗');
      }

      const data = await response.json();
      setLikeCount(data.likeCount);
      onLikeChange?.(activity.id, data.isLiked, data.likeCount);
    } catch (error) {
      // 回滾
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount);
      console.error('喜歡操作失敗:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // 處理收藏
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      alert('請先登入');
      return;
    }

    if (isBookmarking) return;

    setIsBookmarking(true);
    const newIsBookmarked = !isBookmarked;
    const newCount = newIsBookmarked ? bookmarkCount + 1 : bookmarkCount - 1;

    // 樂觀更新
    setIsBookmarked(newIsBookmarked);
    setBookmarkCount(newCount);

    try {
      const response = await fetch(`/api/community/activities/${activity.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('操作失敗');
      }

      const data = await response.json();
      setBookmarkCount(data.bookmarkCount);
      onBookmarkChange?.(activity.id, data.isBookmarked, data.bookmarkCount);
    } catch (error) {
      // 回滾
      setIsBookmarked(!newIsBookmarked);
      setBookmarkCount(bookmarkCount);
      console.error('收藏操作失敗:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link href={`/community/activity/${activity.shareToken}`} className="block">
        {/* 縮圖 */}
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
          {activity.thumbnailUrl ? (
            <Image
              src={activity.thumbnailUrl}
              alt={activity.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-50">🎮</div>
            </div>
          )}
        </div>

        {/* 內容 */}
        <div className="p-4">
          {/* 遊戲類型標籤 - 移到卡片內容區域 */}
          <div className="mb-3">
            <div className="inline-flex bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 px-2.5 py-1 rounded-full shadow-sm border border-gray-200 items-center gap-1.5">
              <span className="text-sm leading-none">{getGameTypeInfo(activity.gameType).icon}</span>
              <span className="text-xs font-normal">{getGameTypeInfo(activity.gameType).name}</span>
            </div>
          </div>

          {/* 標題 */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {activity.title}
          </h3>

          {/* 描述 */}
          {activity.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* 分類和標籤 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {activity.category && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                {activity.category}
              </span>
            )}
            {activity.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {activity.tags.length > 2 && (
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                +{activity.tags.length - 2}
              </span>
            )}
          </div>

          {/* 作者信息 */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            {activity.author.image ? (
              <Image
                src={activity.author.image}
                alt={activity.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={14} className="text-gray-500" />
              </div>
            )}
            <span className="text-sm text-gray-600">{activity.author.name}</span>
          </div>

          {/* 統計數據和互動按鈕 */}
          <div className="flex items-center justify-between">
            {/* 統計數據 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye size={16} className="text-gray-400" />
                <span className="text-xs text-gray-600">{formatNumber(activity.stats.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Play size={16} className="text-green-400" />
                <span className="text-xs text-gray-600">{formatNumber(activity.stats.plays)}</span>
              </div>
            </div>

            {/* 互動按鈕 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                  isLiked
                    ? 'bg-red-50 text-red-600'
                    : 'hover:bg-gray-100 text-gray-600'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isLiked ? '取消喜歡' : '喜歡'}
              >
                <Heart
                  size={16}
                  className={isLiked ? 'fill-current' : ''}
                />
                <span className="text-xs">{formatNumber(likeCount)}</span>
              </button>

              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                  isBookmarked
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'hover:bg-gray-100 text-gray-600'
                } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isBookmarked ? '取消收藏' : '收藏'}
              >
                <Bookmark
                  size={16}
                  className={isBookmarked ? 'fill-current' : ''}
                />
                <span className="text-xs">{formatNumber(bookmarkCount)}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/**
 * 格式化數字顯示
 * 1000+ -> 1K
 * 1000000+ -> 1M
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

