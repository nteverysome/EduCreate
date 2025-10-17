'use client';

/**
 * 公開頁面區塊組件
 * 
 * 顯示在 Account Personal Details 頁面
 * 提供查看和複製公開頁面連結的功能
 * 顯示已發布活動統計
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Copy, Check, ExternalLink, Eye, Heart, Bookmark, Play, Users } from 'lucide-react';

interface PublicProfileSectionProps {
  userId: string;
}

interface AuthorStats {
  totalActivities: number;
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  totalPlays: number;
  followersCount: number;
  followingCount: number;
}

export default function PublicProfileSection({ userId }: PublicProfileSectionProps) {
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const publicProfileUrl = `${window.location.origin}/community/author/${userId}`;

  // 載入統計數據
  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/authors/${userId}/activities?limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('載入統計數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('複製連結失敗:', error);
      alert('複製失敗，請手動複製連結');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">我的公開頁面</h2>
      </div>

      <p className="text-gray-600 mb-4">
        您的公開頁面展示了您發布到社區的所有活動。分享這個連結，讓其他教育者發現您的精彩內容！
      </p>

      {/* 統計數據 */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalActivities}</div>
            <div className="text-sm text-gray-600 mt-1">活動</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.followersCount}</div>
            <div className="text-sm text-gray-600 mt-1">粉絲</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.followingCount}</div>
            <div className="text-sm text-gray-600 mt-1">關注</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">瀏覽</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.totalLikes.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">喜歡</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalBookmarks.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">收藏</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalPlays.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">遊戲</div>
          </div>
        </div>
      ) : null}

      {/* 公開頁面 URL */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">公開頁面連結：</span>
        </div>
        <code className="block text-sm font-mono text-gray-800 bg-white p-3 rounded border border-gray-200 break-all">
          {publicProfileUrl}
        </code>
      </div>

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/community/author/${userId}`}
          target="_blank"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <ExternalLink size={20} />
          查看我的公開頁面
        </Link>

        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-md hover:shadow-lg"
        >
          {copied ? (
            <>
              <Check size={20} />
              已複製！
            </>
          ) : (
            <>
              <Copy size={20} />
              複製連結
            </>
          )}
        </button>
      </div>

      {/* 提示信息 */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>在「我的活動」頁面中，您可以選擇將活動發布到社區。發布後的活動會自動顯示在您的公開頁面上。
        </p>
      </div>
    </div>
  );
}

