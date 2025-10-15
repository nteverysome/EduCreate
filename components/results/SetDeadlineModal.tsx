'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  folderId?: string;
}

interface SetDeadlineModalProps {
  isOpen: boolean;
  result: AssignmentResult | null;
  onClose: () => void;
  onDeadlineSet: (assignmentId: string, deadline: string | null) => Promise<void>;
}

const SetDeadlineModal: React.FC<SetDeadlineModalProps> = ({
  isOpen,
  result,
  onClose,
  onDeadlineSet
}) => {
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('23:59');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 当模态框打开时，初始化表单数据
  useEffect(() => {
    if (isOpen && result) {
      if (result.deadline) {
        const deadlineDate = new Date(result.deadline);
        // 格式化为 YYYY-MM-DD
        const dateStr = deadlineDate.toISOString().split('T')[0];
        // 格式化为 HH:MM
        const timeStr = deadlineDate.toTimeString().slice(0, 5);
        setDeadline(dateStr);
        setTime(timeStr);
      } else {
        // 默认设置为明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        setDeadline(dateStr);
        setTime('23:59');
      }
      setError('');
    }
  }, [isOpen, result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!result) return;

    setIsLoading(true);
    setError('');

    try {
      let deadlineDateTime: string | null = null;
      
      if (deadline) {
        // 组合日期和时间
        deadlineDateTime = `${deadline}T${time}:00.000Z`;
        
        // 验证日期是否有效
        const deadlineDate = new Date(deadlineDateTime);
        if (isNaN(deadlineDate.getTime())) {
          throw new Error('无效的日期时间格式');
        }
        
        // 检查是否是过去的时间
        const now = new Date();
        if (deadlineDate <= now) {
          setError('截止日期必须是未来的时间');
          return;
        }
      }

      await onDeadlineSet(result.assignmentId, deadlineDateTime);
      onClose();
    } catch (error) {
      console.error('设置截止日期失败:', error);
      setError(error instanceof Error ? error.message : '设置截止日期失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDeadline = async () => {
    if (!result) return;

    setIsLoading(true);
    setError('');

    try {
      await onDeadlineSet(result.assignmentId, null);
      onClose();
    } catch (error) {
      console.error('清除截止日期失败:', error);
      setError(error instanceof Error ? error.message : '清除截止日期失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">設置截止日期</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 结果信息 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📊</div>
            <div>
              <p className="text-sm text-gray-600">活動：{result.activityName}</p>
              <p className="text-sm text-gray-600">參與人數：{result.participantCount}</p>
            </div>
          </div>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* 日期输入 */}
            <div>
              <label htmlFor="deadline-date" className="block text-sm font-medium text-gray-700 mb-2">
                截止日期
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="deadline-date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 时间输入 */}
            <div>
              <label htmlFor="deadline-time" className="block text-sm font-medium text-gray-700 mb-2">
                截止時間
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  id="deadline-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 当前截止日期显示 */}
            {result.deadline && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  當前截止日期：{new Date(result.deadline).toLocaleString('zh-TW')}
                </p>
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* 按钮组 */}
          <div className="flex justify-between mt-6">
            <div>
              {result.deadline && (
                <button
                  type="button"
                  onClick={handleClearDeadline}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  清除截止日期
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading || !deadline}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '設置中...' : '設置截止日期'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetDeadlineModal;
