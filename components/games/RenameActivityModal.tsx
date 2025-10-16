'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RenameActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  currentTitle: string;
  onSuccess?: (newTitle: string) => void;
}

const RenameActivityModal: React.FC<RenameActivityModalProps> = ({
  isOpen,
  onClose,
  activityId,
  currentTitle,
  onSuccess,
}) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
      setError(null);
    }
  }, [isOpen, currentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTitle.trim()) {
      setError('活動名稱不能為空');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('重新命名失敗');
      }

      onSuccess?.(newTitle.trim());
      onClose();
    } catch (error) {
      console.error('重新命名錯誤:', error);
      setError('重新命名失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* 標題欄 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">重新命名活動</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 內容 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="activity-title" className="block text-sm font-medium text-gray-700 mb-2">
              活動名稱
            </label>
            <input
              id="activity-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入活動名稱"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !newTitle.trim()}
            >
              {isLoading ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameActivityModal;

