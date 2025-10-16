'use client';

/**
 * 社區活動詳情頁
 * 
 * 顯示單個社區活動的詳細信息：
 * - 活動信息（標題、描述、作者）
 * - 統計數據（瀏覽、喜歡、收藏、遊戲次數）
 * - 遊戲入口按鈕
 * - 分類和標籤
 * - 發布時間
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FormattedCommunityActivity } from '@/lib/community/utils';
import { Eye, Heart, Bookmark, Play, User, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function CommunityActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.shareToken as string;

  const [activity, setActivity] = useState<FormattedCommunityActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInteraction, setUserInteraction] = useState({
    isLiked: false,
    isBookmarked: false,
  });
  const [isOwner, setIsOwner] = useState(false);

  // 載入活動詳情
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/community/activities/${shareToken}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('活動不存在或未發布到社區');
          }
          throw new Error('載入活動失敗');
        }

        const data = await response.json();
        
        setActivity(data.activity);
        setUserInteraction(data.activity.userInteraction || { isLiked: false, isBookmarked: false });
        setIsOwner(data.activity.isOwner || false);
      } catch (err) {
        console.error('載入活動失敗:', err);
        setError(err instanceof Error ? err.message : '載入活動失敗');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      loadActivity();
    }
  }, [shareToken]);

  // 載入狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // 錯誤狀態
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || '活動不存在'}
          </h2>
          <p className="text-gray-600 mb-6">
            這個活動可能已被刪除或未發布到社區
          </p>
          <button
            onClick={() => router.push('/community')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回社區
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 左側：活動信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 主要信息卡片 */}
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/* 縮圖 */}
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100">
                  {activity.thumbnailUrl ? (
                    <Image
                      src={activity.thumbnailUrl}
                      alt={activity.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl opacity-50">🎮</div>
                    </div>
                  )}
                  
                  {/* 遊戲類型標籤 */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                      {activity.gameType}
                    </span>
                  </div>
                </div>

                {/* 內容 */}
                <div className="p-6">
                  {/* 標題 */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {activity.title}
                  </h1>

                  {/* 分類和標籤 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {activity.category && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {activity.category}
                      </span>
                    )}
                    {activity.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 描述 */}
                  {activity.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">活動描述</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {activity.description}
                      </p>
                    </div>
                  )}

                  {/* 統計數據 */}
                  <div className="grid grid-cols-4 gap-4 py-6 border-t border-b border-gray-200">
                    <div className="text-center">
                      <Eye size={24} className="text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(activity.stats.views)}</div>
                      <div className="text-sm text-gray-600">瀏覽</div>
                    </div>
                    <div className="text-center">
                      <Heart size={24} className="text-red-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(activity.stats.likes)}</div>
                      <div className="text-sm text-gray-600">喜歡</div>
                    </div>
                    <div className="text-center">
                      <Bookmark size={24} className="text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(activity.stats.bookmarks)}</div>
                      <div className="text-sm text-gray-600">收藏</div>
                    </div>
                    <div className="text-center">
                      <Play size={24} className="text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(activity.stats.plays)}</div>
                      <div className="text-sm text-gray-600">遊戲</div>
                    </div>
                  </div>

                  {/* 發布時間 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-6">
                    <Calendar size={16} />
                    <span>發布於 {new Date(activity.publishedAt).toLocaleDateString('zh-TW')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：作者信息和操作 */}
            <div className="space-y-6">
              {/* 作者信息 */}
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">作者</h3>
                <div className="flex items-center gap-3 mb-4">
                  {activity.author.image ? (
                    <Image
                      src={activity.author.image}
                      alt={activity.author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={24} className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{activity.author.name}</div>
                    {activity.author.email && (
                      <div className="text-sm text-gray-600">{activity.author.email}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 遊戲入口 */}
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">開始遊戲</h3>
                <Link
                  href={activity.shareUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
                >
                  <Play size={20} />
                  <span>開始遊戲</span>
                  <ExternalLink size={16} />
                </Link>
                <p className="text-xs text-gray-500 text-center mt-2">
                  點擊開始遊戲體驗
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 格式化數字顯示
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

