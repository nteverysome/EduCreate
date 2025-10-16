'use client';

import React, { useState } from 'react';
import { X, Copy, Globe, QrCode, MessageCircle, Users, Mail, Check } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  gameType: string;
  isPublicShared?: boolean;
  shareToken?: string;
  communityPlays?: number;
}

interface CommunityShareModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (activity: Activity) => void;
}

export default function CommunityShareModal({ 
  activity, 
  isOpen, 
  onClose, 
  onUpdate 
}: CommunityShareModalProps) {
  const [isSharing, setIsSharing] = useState(activity.isPublicShared || false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = activity.shareToken
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}/share/${activity.id}/${activity.shareToken}`
    : '';

  const handleToggleSharing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/community-share`, {
        method: isSharing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsSharing(!isSharing);
        
        // 更新活動數據
        const updatedActivity = {
          ...activity,
          isPublicShared: !isSharing,
          shareToken: !isSharing ? data.shareToken : null,
        };
        
        onUpdate?.(updatedActivity);
      } else {
        console.error('Failed to toggle community sharing');
      }
    } catch (error) {
      console.error('Error toggling community sharing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToLine = () => {
    if (!shareUrl) return;
    const text = `來玩這個有趣的單字遊戲：${activity.title}`;
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToTeams = () => {
    if (!shareUrl) return;
    const text = `來玩這個有趣的單字遊戲：${activity.title}`;
    const url = `https://teams.microsoft.com/share?href=${encodeURIComponent(shareUrl)}&msgText=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToEmail = () => {
    if (!shareUrl) return;
    const subject = `邀請你玩單字遊戲：${activity.title}`;
    const body = `我想邀請你玩這個有趣的單字遊戲！\n\n遊戲名稱：${activity.title}\n遊戲類型：${activity.gameType}\n\n點擊連結立即開始：${shareUrl}\n\n無需註冊，直接就能玩！`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">🌐 社區分享</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* 功能說明 */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">✨ 社區分享功能</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 🌍 任何人都可以玩這個遊戲</li>
              <li>• 🚀 無需註冊或登入</li>
              <li>• 🎯 結果不會保存，純粹娛樂</li>
              <li>• 📱 支援所有設備</li>
            </ul>
          </div>

          {/* 開關控制 */}
          <div className="flex items-center justify-between mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isSharing ? 'bg-green-100' : 'bg-gray-100'}`}>
                {isSharing ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <Globe className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {isSharing ? '✅ 已開放社區分享' : '🔒 未開放社區分享'}
                </div>
                <div className="text-sm text-gray-500">
                  {isSharing ? '任何人都能玩這個遊戲' : '點擊開關以開放分享'}
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleSharing}
              disabled={isLoading}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isSharing ? 'bg-green-600' : 'bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                isSharing ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {isSharing && shareUrl && (
            <>
              {/* 分享連結 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  遊戲連結
                </label>
                <div className="flex gap-2">
                  <input 
                    value={shareUrl}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">
                      {copied ? '已複製' : '複製'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 統計 */}
              {(activity.communityPlays || 0) > 0 && (
                <div className="mb-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {activity.communityPlays}
                  </div>
                  <div className="text-sm text-gray-600">社區遊戲次數</div>
                </div>
              )}

              {/* 分享方式 */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">分享到</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={shareToLine}
                    className="flex items-center justify-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span>Line 分享</span>
                  </button>
                  
                  <button 
                    onClick={shareToTeams}
                    className="flex items-center justify-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Microsoft Teams</span>
                  </button>
                  
                  <button 
                    onClick={shareToEmail}
                    className="flex items-center justify-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span>電子郵件</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {!isSharing && (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>開啟社區分享後，任何人都能玩這個遊戲</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
