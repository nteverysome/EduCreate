'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  assignmentId: string;
  activityId: string;
}

interface ShareResultModalProps {
  result: AssignmentResult;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareResultModal: React.FC<ShareResultModalProps> = ({
  result,
  isOpen,
  onClose
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // 获取当前分享状态
  useEffect(() => {
    const fetchShareStatus = async () => {
      if (isOpen && result) {
        try {
          const response = await fetch(`/api/results/${result.id}/share`);
          if (response.ok) {
            const data = await response.json();
            setIsPublic(data.isPublic);

            // 🔧 修正分享 URL：使用當前域名而不是 API 返回的域名
            if (data.shareUrl) {
              // 從 API 返回的 URL 中提取路徑部分
              const urlObj = new URL(data.shareUrl);
              const path = urlObj.pathname; // 例如：/shared/results/hNX79DFe9nuoh1Pv

              // 使用當前瀏覽器的域名構建正確的 URL
              const correctedUrl = `${window.location.origin}${path}`;
              setShareUrl(correctedUrl);

              console.log('🔧 URL 修正:', {
                原始URL: data.shareUrl,
                修正後URL: correctedUrl
              });
            } else {
              setShareUrl('');
            }
          } else if (response.status === 401) {
            // 会话过期，只在控制台记录，不打断用户操作
            console.warn('⚠️ 會話可能已過期，請稍後重新登錄');
            // 设置默认状态，让用户可以看到界面
            setIsPublic(false);
            setShareUrl('');
          } else {
            console.error('获取分享状态失败:', response.status);
          }
        } catch (error) {
          console.error('获取分享状态失败:', error);
        }
      }
    };

    fetchShareStatus();
  }, [isOpen, result]);

  // 复制链接到剪贴板
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案：选择文本
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 切换公开状态
  const handleTogglePublic = async () => {
    setLoading(true);
    // 先清除本地状态，强制刷新
    setShareUrl('');

    try {
      const response = await fetch(`/api/results/${result.id}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 分享状态更新成功:', data);
        setIsPublic(data.isPublic);

        // 🔧 修正分享 URL：使用當前域名而不是 API 返回的域名
        if (data.shareUrl) {
          // 從 API 返回的 URL 中提取路徑部分
          const urlObj = new URL(data.shareUrl);
          const path = urlObj.pathname; // 例如：/shared/results/hNX79DFe9nuoh1Pv

          // 使用當前瀏覽器的域名構建正確的 URL
          const correctedUrl = `${window.location.origin}${path}`;
          setShareUrl(correctedUrl);

          console.log('🔧 URL 修正:', {
            原始URL: data.shareUrl,
            修正後URL: correctedUrl
          });
        } else {
          setShareUrl('');
        }
      } else if (response.status === 401) {
        // 会话过期，提供友好提示但不强制跳转
        console.warn('⚠️ 會話已過期，請重新登錄');
        alert('您的登錄已過期，請重新登錄後再試。\n\n點擊確定後將跳轉到登錄頁面。');
        window.location.href = '/login';
      } else {
        const errorText = await response.text();
        console.error('❌ 更新分享状态失败:', errorText);
        alert('更新分享狀態失敗，請稍後再試');
      }
    } catch (error) {
      console.error('❌ 更新分享状态失败:', error);
      alert('網絡錯誤，請檢查您的網絡連接');
    } finally {
      setLoading(false);
    }
  };

  // 预览链接
  const handlePreviewLink = () => {
    window.open(shareUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">分享結果</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 结果信息 */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-1">{result.title}</h3>
            <p className="text-sm text-gray-500">{result.activityName}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>{result.participantCount} 位參與者</span>
              <span className="mx-2">•</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                result.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : result.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {result.status === 'active' ? '進行中' : 
                 result.status === 'completed' ? '已完成' : '已過期'}
              </span>
            </div>
          </div>

          {/* 公开设置 */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {isPublic ? (
                  <GlobeAltIcon className="w-5 h-5 text-green-600 mr-3" />
                ) : (
                  <LockClosedIcon className="w-5 h-5 text-gray-600 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isPublic ? '公開分享' : '私人結果'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isPublic ? '任何人都可以通過連結查看' : '只有您可以查看此結果'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTogglePublic}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-blue-600' : 'bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 分享链接 */}
          {isPublic && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分享連結
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <LinkIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                  />
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">連結已複製到剪貼板</p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            {isPublic && (
              <button
                onClick={handlePreviewLink}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                預覽
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareResultModal;
