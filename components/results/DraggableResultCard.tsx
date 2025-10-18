'use client';

import React from 'react';
import Image from 'next/image';
import {
  UserIcon,
  ClockIcon,
  EllipsisVerticalIcon
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
  thumbnailUrl?: string | null;  // 添加截圖 URL 欄位
}

interface DraggableResultCardProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

export const DraggableResultCard: React.FC<DraggableResultCardProps> = ({
  result,
  onClick,
  onMenuClick
}) => {
  const { startDrag, isDragging, dragItem } = useDragDrop();

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

  // 检查当前项目是否正在被拖移
  const isBeingDragged = isDragging && dragItem?.id === result.id;

  return (
    <a
      href={`/my-results/${result.id}`}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      className={`block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-move select-none ${
        isBeingDragged ? 'opacity-50 scale-95' : ''
      }`}
      style={{ userSelect: 'none' }}
    >
      {/* 活動截圖 */}
      {result.thumbnailUrl && (
        <div className="relative h-24 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100">
          <Image
            src={result.thumbnailUrl}
            alt={result.activityName}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {/* 結果圖標（只在沒有截圖時顯示） */}
            {!result.thumbnailUrl && (
              <div className="flex-shrink-0">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
            )}

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

          {/* 更多選項按鈕 */}
          <button
            onClick={handleMenuClick}
            className="flex-shrink-0 p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="更多選項"
          >
            <EllipsisVerticalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </a>
  );
};

export default DraggableResultCard;
