'use client';

import React from 'react';
import Image from 'next/image';
import {
  UserIcon,
  ClockIcon,
  EllipsisVerticalIcon
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
  thumbnailUrl?: string | null;
}

interface DraggableResultCardNativeProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

export const DraggableResultCardNative: React.FC<DraggableResultCardNativeProps> = ({
  result,
  onClick,
  onMenuClick
}) => {
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

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '進行中';
      case 'completed':
        return '已完成';
      case 'expired':
        return '已過期';
      default:
        return status;
    }
  };

  const handleCardClick = () => {
    onClick(result);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick(result, e);
    }
  };

  // 結果拖移源事件處理
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', result.id); // 使用 text/plain 標識結果
    console.log('🔵 開始拖移結果:', result.title);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🔵 結束拖移結果:', result.title);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* 卡片內容 */}
      <div className="p-4">
        {/* 縮略圖或圖標 */}
        <div className="mb-3">
          {result.thumbnailUrl ? (
            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={result.thumbnailUrl}
                alt={result.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
          )}
        </div>

        {/* 標題 */}
        <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {result.title}
        </h2>

        {/* 統計信息 */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <UserIcon className="w-3 h-3" />
            <span>{result.participantCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            <span>{formatDateTime(result.createdAt)}</span>
          </div>
        </div>

        {/* 狀態和菜單 */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
            {getStatusText(result.status)}
          </span>
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableResultCardNative;

