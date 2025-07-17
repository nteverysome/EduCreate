/**
 * BatchOperationPanel.tsx - 批量操作面板組件
 * 實現選擇、移動、複製、刪除、分享、標籤、導出的批量操作功能，支持多選和快捷鍵
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// 活動數據接口
interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  isShared: boolean;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  learningEffectiveness?: number;
  usageCount: number;
  tags: string[];
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  templateType?: string;
  learningState?: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  subject?: string;
  author?: string;
}

// 批量操作類型
type BatchOperationType = 
  | 'move' 
  | 'copy' 
  | 'delete' 
  | 'share' 
  | 'tag' 
  | 'export' 
  | 'archive' 
  | 'publish' 
  | 'duplicate';

// 批量操作結果
interface BatchOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
  details: {
    operation: BatchOperationType;
    selectedIds: string[];
    timestamp: Date;
    duration: number;
  };
}

// 組件屬性
interface BatchOperationPanelProps {
  selectedItems: string[];
  activities: Activity[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBatchOperation: (operation: BatchOperationType, options?: any) => Promise<BatchOperationResult>;
  onClose?: () => void;
  className?: string;
  enabledOperations?: BatchOperationType[];
  maxSelectionCount?: number;
  showProgress?: boolean;
}

// 預設啟用的操作
const DEFAULT_ENABLED_OPERATIONS: BatchOperationType[] = [
  'move', 'copy', 'delete', 'share', 'tag', 'export', 'archive', 'publish', 'duplicate'
];

export const BatchOperationPanel: React.FC<BatchOperationPanelProps> = ({
  selectedItems,
  activities,
  onSelectionChange,
  onBatchOperation,
  onClose,
  className = '',
  enabledOperations = DEFAULT_ENABLED_OPERATIONS,
  maxSelectionCount = 100,
  showProgress = true
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BatchOperationType | null>(null);
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<{
    type: BatchOperationType;
    options?: any;
  } | null>(null);
  const [operationHistory, setOperationHistory] = useState<BatchOperationResult[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // 選中的活動詳情
  const selectedActivities = useMemo(() => {
    return activities.filter(activity => selectedItems.includes(activity.id));
  }, [activities, selectedItems]);

  // 批量操作統計
  const operationStats = useMemo(() => {
    const stats = {
      totalSize: 0,
      geptLevels: new Set<string>(),
      types: new Set<string>(),
      subjects: new Set<string>(),
      sharedCount: 0,
      draftCount: 0,
      publishedCount: 0
    };

    selectedActivities.forEach(activity => {
      stats.totalSize += activity.size;
      if (activity.geptLevel) stats.geptLevels.add(activity.geptLevel);
      stats.types.add(activity.type);
      if (activity.subject) stats.subjects.add(activity.subject);
      if (activity.isShared) stats.sharedCount++;
      if (activity.status === 'draft') stats.draftCount++;
      if (activity.status === 'published') stats.publishedCount++;
    });

    return stats;
  }, [selectedActivities]);

  // 全選/取消全選
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === activities.length) {
      onSelectionChange([]);
    } else {
      const allIds = activities.slice(0, maxSelectionCount).map(activity => activity.id);
      onSelectionChange(allIds);
    }
  }, [selectedItems.length, activities.length, activities, maxSelectionCount, onSelectionChange]);

  // 反選
  const handleInvertSelection = useCallback(() => {
    const allIds = activities.map(activity => activity.id);
    const invertedIds = allIds.filter(id => !selectedItems.includes(id));
    onSelectionChange(invertedIds.slice(0, maxSelectionCount));
  }, [activities, selectedItems, maxSelectionCount, onSelectionChange]);

  // 按條件選擇
  const handleSelectByCondition = useCallback((condition: string) => {
    let filteredIds: string[] = [];

    switch (condition) {
      case 'shared':
        filteredIds = activities.filter(a => a.isShared).map(a => a.id);
        break;
      case 'draft':
        filteredIds = activities.filter(a => a.status === 'draft').map(a => a.id);
        break;
      case 'published':
        filteredIds = activities.filter(a => a.status === 'published').map(a => a.id);
        break;
      case 'recent':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filteredIds = activities.filter(a => a.updatedAt > oneWeekAgo).map(a => a.id);
        break;
      case 'unused':
        filteredIds = activities.filter(a => a.usageCount === 0).map(a => a.id);
        break;
      default:
        break;
    }

    onSelectionChange(filteredIds.slice(0, maxSelectionCount));
  }, [activities, maxSelectionCount, onSelectionChange]);

  // 執行批量操作
  const executeBatchOperation = useCallback(async (
    operation: BatchOperationType, 
    options?: any
  ) => {
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    setCurrentOperation(operation);
    setProgress(0);

    try {
      const result = await onBatchOperation(operation, {
        selectedIds: selectedItems,
        ...options,
        onProgress: (progress: number) => {
          setProgress(progress);
        }
      });

      // 記錄操作歷史
      setOperationHistory(prev => [result, ...prev.slice(0, 9)]);

      // 如果操作成功，清除選擇
      if (result.success && result.failedCount === 0) {
        onSelectionChange([]);
      }

      return result;
    } catch (error) {
      console.error('批量操作失敗:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
      setProgress(0);
    }
  }, [selectedItems, onBatchOperation, onSelectionChange]);

  // 處理操作點擊
  const handleOperationClick = useCallback((operation: BatchOperationType, options?: any) => {
    // 危險操作需要確認
    if (['delete', 'archive'].includes(operation)) {
      setPendingOperation({ type: operation, options });
      setShowConfirmDialog(true);
    } else {
      executeBatchOperation(operation, options);
    }
  }, [executeBatchOperation]);

  // 確認操作
  const handleConfirmOperation = useCallback(async () => {
    if (pendingOperation) {
      await executeBatchOperation(pendingOperation.type, pendingOperation.options);
      setPendingOperation(null);
      setShowConfirmDialog(false);
    }
  }, [pendingOperation, executeBatchOperation]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItems.length === 0) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'c':
            e.preventDefault();
            handleOperationClick('copy');
            break;
          case 'x':
            e.preventDefault();
            handleOperationClick('move');
            break;
          case 'd':
            e.preventDefault();
            handleOperationClick('duplicate');
            break;
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            handleOperationClick('delete');
            break;
          case 'e':
            e.preventDefault();
            handleOperationClick('export');
            break;
          case 's':
            e.preventDefault();
            handleOperationClick('share');
            break;
        }
      }

      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems.length, handleSelectAll, handleOperationClick, onClose]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className={`batch-operation-panel ${className}`} data-testid="batch-operation-panel">
      {/* 主操作面板 */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="px-6 py-4">
          {/* 選擇信息和統計 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-900">
                已選擇 {selectedItems.length} 個活動
              </div>
              <div className="text-xs text-gray-500">
                總大小: {formatFileSize(operationStats.totalSize)}
              </div>
              {operationStats.geptLevels.size > 0 && (
                <div className="text-xs text-gray-500">
                  GEPT 等級: {Array.from(operationStats.geptLevels).join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-sm text-blue-600 hover:text-blue-800"
                data-testid="toggle-advanced-options"
              >
                {showAdvancedOptions ? '隱藏高級選項' : '顯示高級選項'}
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="close-batch-panel"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 高級選擇選項 */}
          {showAdvancedOptions && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">選擇選項</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  data-testid="select-all-button"
                >
                  {selectedItems.length === activities.length ? '取消全選' : '全選'}
                </button>
                
                <button
                  onClick={handleInvertSelection}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  data-testid="invert-selection-button"
                >
                  反選
                </button>
                
                <button
                  onClick={() => handleSelectByCondition('shared')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  選擇已分享
                </button>
                
                <button
                  onClick={() => handleSelectByCondition('draft')}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  選擇草稿
                </button>
                
                <button
                  onClick={() => handleSelectByCondition('recent')}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                >
                  選擇最近修改
                </button>
                
                <button
                  onClick={() => handleSelectByCondition('unused')}
                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  選擇未使用
                </button>
              </div>
            </div>
          )}

          {/* 批量操作按鈕 */}
          <div className="flex flex-wrap gap-2">
            {/* 移動操作 */}
            {enabledOperations.includes('move') && (
              <button
                onClick={() => handleOperationClick('move')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-move-button"
              >
                📁 移動
              </button>
            )}

            {/* 複製操作 */}
            {enabledOperations.includes('copy') && (
              <button
                onClick={() => handleOperationClick('copy')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-copy-button"
              >
                📋 複製
              </button>
            )}

            {/* 複製操作 */}
            {enabledOperations.includes('duplicate') && (
              <button
                onClick={() => handleOperationClick('duplicate')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-duplicate-button"
              >
                🔄 複製
              </button>
            )}

            {/* 分享操作 */}
            {enabledOperations.includes('share') && (
              <button
                onClick={() => handleOperationClick('share')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-share-button"
              >
                🔗 分享
              </button>
            )}

            {/* 標籤操作 */}
            {enabledOperations.includes('tag') && (
              <button
                onClick={() => handleOperationClick('tag')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-tag-button"
              >
                🏷️ 標籤
              </button>
            )}

            {/* 導出操作 */}
            {enabledOperations.includes('export') && (
              <button
                onClick={() => handleOperationClick('export')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-export-button"
              >
                📤 導出
              </button>
            )}

            {/* 發布操作 */}
            {enabledOperations.includes('publish') && operationStats.draftCount > 0 && (
              <button
                onClick={() => handleOperationClick('publish')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-publish-button"
              >
                🚀 發布
              </button>
            )}

            {/* 歸檔操作 */}
            {enabledOperations.includes('archive') && (
              <button
                onClick={() => handleOperationClick('archive')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-archive-button"
              >
                📦 歸檔
              </button>
            )}

            {/* 刪除操作 */}
            {enabledOperations.includes('delete') && (
              <button
                onClick={() => handleOperationClick('delete')}
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="batch-delete-button"
              >
                🗑️ 刪除
              </button>
            )}
          </div>

          {/* 進度指示器 */}
          {isProcessing && showProgress && (
            <div className="mt-4" data-testid="batch-progress">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>正在執行 {currentOperation} 操作...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 快捷鍵提示 */}
          <div className="mt-3 text-xs text-gray-500">
            快捷鍵: Ctrl+A (全選) | Ctrl+C (複製) | Ctrl+X (移動) | Ctrl+D (複製) | Delete (刪除) | Ctrl+E (導出) | Ctrl+S (分享) | Esc (關閉)
          </div>
        </div>
      </div>

      {/* 確認對話框 */}
      {showConfirmDialog && pendingOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="confirm-dialog">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              確認{pendingOperation.type === 'delete' ? '刪除' : '歸檔'}操作
            </h3>
            <p className="text-gray-600 mb-4">
              您確定要{pendingOperation.type === 'delete' ? '刪除' : '歸檔'} {selectedItems.length} 個活動嗎？
              {pendingOperation.type === 'delete' && '此操作無法撤銷。'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingOperation(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                data-testid="cancel-confirm-button"
              >
                取消
              </button>
              <button
                onClick={handleConfirmOperation}
                className={`px-4 py-2 text-white rounded-lg ${
                  pendingOperation.type === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                data-testid="confirm-operation-button"
              >
                確認{pendingOperation.type === 'delete' ? '刪除' : '歸檔'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 操作歷史 */}
      {operationHistory.length > 0 && showAdvancedOptions && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">最近操作</div>
          <div className="space-y-1">
            {operationHistory.slice(0, 3).map((result, index) => (
              <div key={index} className="text-xs text-gray-600">
                {result.details.operation}: {result.processedCount} 成功
                {result.failedCount > 0 && `, ${result.failedCount} 失敗`}
                ({result.details.duration}ms)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
