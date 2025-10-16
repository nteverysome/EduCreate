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
import { useDragDrop } from './DragDropContext';

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

interface DraggableResultCardProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
  onCopyLink?: (result: AssignmentResult, event: React.MouseEvent) => void;
  onShowQRCode?: (result: AssignmentResult, event: React.MouseEvent) => void;
  onDelete?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

export const DraggableResultCard: React.FC<DraggableResultCardProps> = ({
  result,
  onClick,
  onMenuClick,
  onCopyLink,
  onShowQRCode,
  onDelete
}) => {
  const { startDrag, isDragging, dragItem } = useDragDrop();
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

  const handleMouseDown = (event: React.MouseEvent) => {
    // 如果点击的是菜单按钮，不启动拖移
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    event.preventDefault();
    startDrag({
      id: result.id,
      type: 'result',
      data: result
    }, event);
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

  // 检查当前项目是否正在被拖移
  const isBeingDragged = isDragging && dragItem?.id === result.id;

  return (
    <div
      className={`block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all ${
        isBeingDragged ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* 主要內容區域 - 可拖動 */}
      <a
        href={`/my-results/${result.id}`}
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        className="block p-3 sm:p-4 cursor-move select-none"
        style={{ userSelect: 'none' }}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {/* 結果圖標 */}
            <div className="flex-shrink-0">
              <span className="text-xl sm:text-2xl">📊</span>
            </div>

            {/* 結果信息 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                {result.title}
              </h2>

              {/* 參與者數量和時間信息 - 響應式佈局 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{result.participantCount}</span>
                </div>

                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="truncate">
                    {formatDateTime(result.createdAt)}
                    <span className="hidden sm:inline">
                      {result.deadline ? ` – ${result.deadline === 'no-deadline' ? '無截止日期' : formatDateTime(result.deadline)}` : ' – 無截止日期'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>

      {/* 快速操作按鈕區域 */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-center justify-end gap-1 sm:gap-2 border-t border-gray-100 pt-2 sm:pt-3">
        {/* 複製連結按鈕 */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="複製連結"
        >
          {showCopySuccess ? (
            <>
              <span className="text-green-600 text-sm sm:text-base">✓</span>
              <span className="hidden sm:inline text-green-600">已複製</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">複製連結</span>
            </>
          )}
        </button>

        {/* QR Code 按鈕 */}
        <button
          onClick={handleShowQRCode}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="顯示 QR 代碼"
        >
          <QrCodeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">QR 代碼</span>
        </button>

        {/* 刪除按鈕 */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
          title="刪除"
        >
          <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">刪除</span>
        </button>

        {/* 更多選項按鈕 */}
        <button
          onClick={handleMenuClick}
          className="flex-shrink-0 p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="更多選項"
        >
          <EllipsisVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default DraggableResultCard;
