'use client';

/**
 * 公開頁面橫幅組件
 * 
 * 顯示在 My Activities 頁面頂部
 * 提供查看和複製公開頁面連結的功能
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Copy, Check, ExternalLink, Eye } from 'lucide-react';

interface PublicProfileBannerProps {
  userId: string;
  userEmail: string;
}

export default function PublicProfileBanner({ userId, userEmail }: PublicProfileBannerProps) {
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const publicProfileUrl = `${window.location.origin}/community/author/${userId}`;

  // 載入已發布活動數量
  useEffect(() => {
    loadPublishedCount();
  }, [userId]);

  const loadPublishedCount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/authors/${userId}/activities?limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        setPublishedCount(data.stats.totalActivities || 0);
      }
    } catch (error) {
      console.error('載入已發布活動數量失敗:', error);
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
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 mb-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* 左側：信息 */}
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={24} />
            <h3 className="text-xl font-bold">我的公開頁面</h3>
          </div>
          <p className="text-blue-100 mb-3">
            分享您的公開頁面，讓其他教育者發現您的精彩活動
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>
                {loading ? (
                  <span className="animate-pulse">載入中...</span>
                ) : (
                  <span className="font-semibold">{publishedCount} 個已發布活動</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 右側：操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 查看公開頁面按鈕 */}
          <Link
            href={`/community/author/${userId}`}
            target="_blank"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
          >
            <ExternalLink size={20} />
            查看我的公開頁面
          </Link>

          {/* 複製連結按鈕 */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-md"
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
      </div>

      {/* 公開頁面 URL 顯示 */}
      <div className="mt-4 p-3 bg-blue-700 bg-opacity-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-100">公開頁面連結：</span>
          <code className="flex-grow text-sm font-mono text-white truncate">
            {publicProfileUrl}
          </code>
        </div>
      </div>
    </div>
  );
}

