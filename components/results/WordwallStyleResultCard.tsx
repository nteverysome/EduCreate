'use client';

import React, { useState } from 'react';
import {
  UserIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  QrCodeIcon,
  TrashIcon
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

interface WordwallStyleResultCardProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
  onCopyLink?: (result: AssignmentResult, event: React.MouseEvent) => void;
  onShowQRCode?: (result: AssignmentResult, event: React.MouseEvent) => void;
  onDelete?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

export const WordwallStyleResultCard: React.FC<WordwallStyleResultCardProps> = ({
  result,
  onClick,
  onMenuClick,
  onCopyLink,
  onShowQRCode,
  onDelete
}) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  // 格式化時間顯示
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${date.getDate()} ${date.toLocaleDateString('zh-TW', { month: 'short' })} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return date.toLocaleDateString('zh-TW', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onMenuClick) {
      onMenuClick(result, event);
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onClick(result);
  };

  const handleCopyLink = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (onCopyLink) {
      onCopyLink(result, event);
    } else {
      // 默認行為：複製學生分享連結
      const studentLink = `${window.location.origin}/play/${result.activityId}/${result.assignmentId}`;
      try {
        await navigator.clipboard.writeText(studentLink);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (error) {
        console.error('複製失敗:', error);
      }
    }
  };

  const handleShowQRCode = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onShowQRCode) {
      onShowQRCode(result, event);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDelete) {
      onDelete(result, event);
    }
  };

  return (
    <div className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* 主要內容區域 - 可點擊 */}
      <a
        href={`/my-results/${result.id}`}
        onClick={handleCardClick}
        className="block p-4"
      >
        <div className="flex items-center">
          {/* 結果圖標 */}
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <span className="text-blue-600 font-semibold">📊</span>
          </div>

          {/* 結果信息 */}
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900 mb-1">{result.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {/* 參與人數 */}
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>{result.participantCount}</span>
              </div>

              {/* 時間和截止日期 */}
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>
                  {formatDateTime(result.createdAt)} – {result.deadline ? '有截止日期' : '無截止日期'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>

      {/* 快速操作按鈕區域 */}
      <div className="px-4 pb-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        {/* 複製連結按鈕 */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="複製連結"
        >
          {showCopySuccess ? (
            <>
              <span className="text-green-600">✓</span>
              <span className="text-green-600">已複製</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>複製連結</span>
            </>
          )}
        </button>

        {/* QR Code 按鈕 */}
        <button
          onClick={handleShowQRCode}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="顯示 QR 代碼"
        >
          <QrCodeIcon className="w-4 h-4" />
          <span>QR 代碼</span>
        </button>

        {/* 刪除按鈕 */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
          title="刪除"
        >
          <TrashIcon className="w-4 h-4" />
          <span>刪除</span>
        </button>

        {/* 更多選項按鈕 */}
        <button
          onClick={handleMenuClick}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="更多選項"
        >
          <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default WordwallStyleResultCard;
