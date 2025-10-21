'use client';

/**
 * 社區活動卡片組件（手機版 - 列表式佈局）
 * 用於小網格視圖的緊湊顯示
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, Bookmark, Play } from 'lucide-react';
import { FormattedCommunityActivity } from '@/lib/community/utils';

interface CommunityActivityCardMobileProps {
  activity: FormattedCommunityActivity;
}

export const CommunityActivityCardMobile: React.FC<CommunityActivityCardMobileProps> = ({
  activity
}) => {
  // 遊戲類型映射
  const getGameTypeInfo = (gameType: string): { icon: string; name: string } => {
    const gameTemplateId = activity.content?.gameTemplateId;

    if (gameTemplateId) {
      const gameTemplateMap: Record<string, { icon: string; name: string }> = {
        'shimozurdo-game': { icon: '☁️', name: 'Shimozurdo 雲朵遊戲' },
        'vocabulary-game': { icon: '📝', name: '詞彙遊戲' },
        'quiz-game': { icon: '❓', name: '測驗遊戲' },
        'matching-game': { icon: '🎯', name: '配對遊戲' },
        'memory-game': { icon: '🧠', name: '記憶遊戲' },
        'spelling-game': { icon: '✍️', name: '拼字遊戲' },
        'listening-game': { icon: '👂', name: '聽力遊戲' },
        'speaking-game': { icon: '🗣️', name: '口說遊戲' },
        'reading-game': { icon: '📖', name: '閱讀遊戲' },
        'writing-game': { icon: '✏️', name: '寫作遊戲' },
      };

      return gameTemplateMap[gameTemplateId] || { icon: '🎮', name: gameType };
    }

    return { icon: '🎮', name: gameType };
  };

  const gameInfo = getGameTypeInfo(activity.gameType);

  return (
    <Link
      href={`/community/activity/${activity.shareToken}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-2 border border-gray-100"
    >
      <div className="flex items-center gap-3">
        {/* 縮略圖 */}
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
          {activity.thumbnailUrl ? (
            <Image
              src={activity.thumbnailUrl}
              alt={activity.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <span className="text-white text-2xl">{gameInfo.icon}</span>
            </div>
          )}
        </div>

        {/* 活動信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={activity.title}>
            {activity.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {gameInfo.name}
          </p>
          
          {/* 統計數據 */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{activity.stats.views}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Play className="w-3 h-3" />
              <span>{activity.stats.plays}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Heart className="w-3 h-3" />
              <span>{activity.stats.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

