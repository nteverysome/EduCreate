'use client';

import React, { memo } from 'react';
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

interface WordwallStyleResultCardProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

const WordwallStyleResultCardComponent: React.FC<WordwallStyleResultCardProps> = ({
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
    <div
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-move hover:border-gray-300 select-none ${
        isBeingDragged ? 'opacity-50 scale-95' : ''
      }`}
      style={{ userSelect: 'none' }}
    >
      {/* 卡片頭部 - 縮略圖區域（使用 aspect-video 保持一致比例） */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center overflow-hidden">
          {result.thumbnailUrl ? (
            <Image
              src={result.thumbnailUrl}
              alt={result.activityName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
          )}
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="p-4">
        {/* 標題 */}
        <h2 className="text-base font-medium text-gray-900 mb-2 truncate" title={result.title}>
          {result.title}
        </h2>

        {/* 統計信息 */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <UserIcon className="w-3 h-3" />
            <span>{result.participantCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            <span className="truncate">{formatDateTime(result.createdAt)}</span>
          </div>
        </div>

        {/* 底部操作區 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* 狀態標籤 */}
            <span className={`text-xs px-2 py-1 rounded ${
              result.status === 'active' ? 'bg-green-100 text-green-700' :
              result.status === 'expired' ? 'bg-gray-100 text-gray-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {result.status === 'active' ? '進行中' :
               result.status === 'expired' ? '已過期' :
               '已完成'}
            </span>
          </div>

          {/* 菜單按鈕 */}
          <button
            onClick={handleMenuClick}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="更多選項"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 使用 React.memo 優化性能
export const WordwallStyleResultCard = memo(WordwallStyleResultCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.result.id === nextProps.result.id &&
    prevProps.result.title === nextProps.result.title &&
    prevProps.result.participantCount === nextProps.result.participantCount &&
    prevProps.result.deadline === nextProps.result.deadline &&
    prevProps.result.status === nextProps.result.status
  );
});

WordwallStyleResultCard.displayName = 'WordwallStyleResultCard';

export default WordwallStyleResultCard;
