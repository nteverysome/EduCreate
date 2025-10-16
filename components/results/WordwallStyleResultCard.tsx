'use client';

import React from 'react';
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
}

interface WordwallStyleResultCardProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

export const WordwallStyleResultCard: React.FC<WordwallStyleResultCardProps> = ({
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

  return (
    <a
      href={`/my-results/${result.id}`}
      onClick={handleCardClick}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
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
        
        {/* 菜單按鈕 */}
        <button
          onClick={handleMenuClick}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="更多選項"
        >
          <span className="text-gray-400 text-lg">⋮</span>
        </button>
      </div>
    </a>
  );
};

export default WordwallStyleResultCard;
