'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface RecycleBinItem {
  id: string;
  name: string;
  type: 'folder' | 'activity';
  deletedAt: string;
  itemCount?: number;
  color?: string;
  icon?: string;
  activityType?: string;
  templateType?: string;
}

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemRestored?: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  onItemRestored
}) => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 加载回收桶内容
  const loadRecycleBinItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recycle-bin');
      if (!response.ok) {
        throw new Error('加载回收桶内容失败');
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('加载回收桶失败:', error);
      setError(error instanceof Error ? error.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 恢复项目
  const handleRestore = async (item: RecycleBinItem) => {
    try {
      const response = await fetch('/api/recycle-bin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          type: item.type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '恢复失败');
      }

      // 重新加载回收桶内容
      await loadRecycleBinItems();
      
      // 通知父组件刷新
      if (onItemRestored) {
        onItemRestored();
      }

      console.log(`${item.type === 'folder' ? '资料夹' : '活动'}"${item.name}"已恢复`);
    } catch (error) {
      console.error('恢复失败:', error);
      setError(error instanceof Error ? error.message : '恢复失败');
    }
  };

  // 永久删除项目
  const handlePermanentDelete = async (item: RecycleBinItem) => {
    if (!confirm(`确定要永久删除${item.type === 'folder' ? '资料夹' : '活动'}"${item.name}"吗？此操作无法撤销！`)) {
      return;
    }

    try {
      const response = await fetch('/api/recycle-bin/permanent-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          type: item.type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除失败');
      }

      // 重新加载回收桶内容
      await loadRecycleBinItems();

      console.log(`${item.type === 'folder' ? '资料夹' : '活动'}"${item.name}"已永久删除`);
    } catch (error) {
      console.error('永久删除失败:', error);
      setError(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 清空回收桶
  const handleClearRecycleBin = async () => {
    try {
      const response = await fetch('/api/recycle-bin', {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '清空失败');
      }

      // 重新加载回收桶内容
      await loadRecycleBinItems();
      setShowClearConfirm(false);

      console.log('回收桶已清空');
    } catch (error) {
      console.error('清空回收桶失败:', error);
      setError(error instanceof Error ? error.message : '清空失败');
    }
  };

  // 格式化删除时间
  const formatDeletedTime = (deletedAt: string) => {
    const date = new Date(deletedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 当模态框打开时加载数据
  useEffect(() => {
    if (isOpen) {
      loadRecycleBinItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* 模态框内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <TrashIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">回收桶</h2>
              {items.length > 0 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {items.length} 个项目
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  清空回收桶
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">加载中...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadRecycleBinItems}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  重试
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <TrashIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">回收桶为空</h3>
                <p className="text-gray-500">删除的资料夹和活动会出现在这里</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {item.type === 'folder' ? (
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: item.color || '#3B82F6' }}
                          >
                            <span className="text-white text-sm font-medium">📁</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📊</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{item.type === 'folder' ? '资料夹' : '活动'}</span>
                          {item.type === 'folder' && item.itemCount !== undefined && (
                            <>
                              <span>•</span>
                              <span>{item.itemCount} 个项目</span>
                            </>
                          )}
                          <span>•</span>
                          <span>删除于 {formatDeletedTime(item.deletedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRestore(item)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                        title="恢复"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="永久删除"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 清空确认对话框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">清空回收桶</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  确定要清空回收桶吗？这将永久删除所有项目，此操作无法撤销！
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClearRecycleBin}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
