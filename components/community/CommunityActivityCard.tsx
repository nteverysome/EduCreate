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
 */

import Link from 'next/link';
import Image from 'next/image';
import { FormattedCommunityActivity } from '@/lib/community/utils';
import { Eye, Heart, Bookmark, Play, User } from 'lucide-react';

interface CommunityActivityCardProps {
  activity: FormattedCommunityActivity;
}

export default function CommunityActivityCard({ activity }: CommunityActivityCardProps) {
  return (
    <Link href={`/community/activity/${activity.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
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
          
          {/* 遊戲類型標籤 */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
              {activity.gameType}
            </span>
          </div>
        </div>

        {/* 內容 */}
        <div className="p-4">
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

          {/* 統計數據 */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Eye size={16} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-600">{formatNumber(activity.stats.views)}</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart size={16} className="text-red-400 mb-1" />
              <span className="text-xs text-gray-600">{formatNumber(activity.stats.likes)}</span>
            </div>
            <div className="flex flex-col items-center">
              <Bookmark size={16} className="text-yellow-400 mb-1" />
              <span className="text-xs text-gray-600">{formatNumber(activity.stats.bookmarks)}</span>
            </div>
            <div className="flex flex-col items-center">
              <Play size={16} className="text-green-400 mb-1" />
              <span className="text-xs text-gray-600">{formatNumber(activity.stats.plays)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
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

