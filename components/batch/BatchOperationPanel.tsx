/**
 * 批量操作面板組件
 * 提供批量操作的用戶界面：多選、操作選擇、進度顯示等
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BatchOperation, BatchOperationType, BatchOperationStatus } from '../../lib/batch/BatchOperationManager';

interface BatchOperationPanelProps {
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onOperationStart: (type: BatchOperationType, options: any) => void;
  onOperationCancel: (operationId: string) => void;
  operations: BatchOperation[];
  isVisible: boolean;
  onClose: () => void;
}

export default function BatchOperationPanel({
  selectedItems,
  onSelectionChange,
  onOperationStart,
  onOperationCancel,
  operations,
  isVisible,
  onClose
}: BatchOperationPanelProps) {
  const [activeTab, setActiveTab] = useState<'operations' | 'progress'>('operations');
  const [operationOptions, setOperationOptions] = useState({
    targetFolderId: '',
    shareType: 'private',
    tags: '',
    conflictResolution: 'skip',
    preserveMetadata: true,
    createBackup: true,
    notifyUsers: false
  });

  // 獲取正在進行的操作
  const activeOperations = operations.filter(op => 
    op.status === BatchOperationStatus.RUNNING || 
    op.status === BatchOperationStatus.PENDING
  );

  // 處理操作執行
  const handleExecuteOperation = useCallback((type: BatchOperationType) => {
    if (selectedItems.length === 0) {
      alert('請先選擇要操作的項目');
      return;
    }

    const options = {
      ...operationOptions,
      priority: 'normal' as const
    };

    onOperationStart(type, options);
    setActiveTab('progress');
  }, [selectedItems, operationOptions, onOperationStart]);

  // 格式化操作類型顯示名稱
  const getOperationDisplayName = (type: BatchOperationType): string => {
    const names = {
      [BatchOperationType.MOVE]: '移動',
      [BatchOperationType.COPY]: '複製',
      [BatchOperationType.DELETE]: '刪除',
      [BatchOperationType.SHARE]: '分享',
      [BatchOperationType.TAG]: '標籤',
      [BatchOperationType.EXPORT]: '導出',
      [BatchOperationType.IMPORT]: '導入',
      [BatchOperationType.ARCHIVE]: '歸檔',
      [BatchOperationType.RESTORE]: '恢復',
      [BatchOperationType.DUPLICATE]: '複製'
    };
    return names[type] || type;
  };

  // 格式化操作狀態
  const getStatusDisplayName = (status: BatchOperationStatus): string => {
    const names = {
      [BatchOperationStatus.PENDING]: '等待中',
      [BatchOperationStatus.RUNNING]: '執行中',
      [BatchOperationStatus.COMPLETED]: '已完成',
      [BatchOperationStatus.FAILED]: '失敗',
      [BatchOperationStatus.CANCELLED]: '已取消',
      [BatchOperationStatus.PAUSED]: '已暫停'
    };
    return names[status] || status;
  };

  // 獲取狀態顏色
  const getStatusColor = (status: BatchOperationStatus): string => {
    const colors = {
      [BatchOperationStatus.PENDING]: 'text-yellow-600',
      [BatchOperationStatus.RUNNING]: 'text-blue-600',
      [BatchOperationStatus.COMPLETED]: 'text-green-600',
      [BatchOperationStatus.FAILED]: 'text-red-600',
      [BatchOperationStatus.CANCELLED]: 'text-gray-600',
      [BatchOperationStatus.PAUSED]: 'text-orange-600'
    };
    return colors[status] || 'text-gray-600';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="batch-operation-panel">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            批量操作 {selectedItems.length > 0 && `(已選擇 ${selectedItems.length} 個項目)`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="close-batch-panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 標籤頁 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'operations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="operations-tab"
          >
            操作選擇
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'progress'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="progress-tab"
          >
            進度監控 {activeOperations.length > 0 && `(${activeOperations.length})`}
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'operations' && (
            <div className="space-y-6" data-testid="operations-content">
              {/* 選擇項目摘要 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">已選擇的項目</h3>
                <p className="text-sm text-gray-600">
                  {selectedItems.length === 0 
                    ? '尚未選擇任何項目' 
                    : `已選擇 ${selectedItems.length} 個項目`
                  }
                </p>
                {selectedItems.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedItems.slice(0, 5).map((itemId, index) => (
                      <span key={itemId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        項目 {index + 1}
                      </span>
                    ))}
                    {selectedItems.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{selectedItems.length - 5} 更多
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 操作按鈕 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleExecuteOperation(BatchOperationType.MOVE)}
                  disabled={selectedItems.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="move-operation-button"
                >
                  <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <span className="font-medium">移動</span>
                  <span className="text-xs text-gray-500">移動到其他資料夾</span>
                </button>

                <button
                  onClick={() => handleExecuteOperation(BatchOperationType.COPY)}
                  disabled={selectedItems.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="copy-operation-button"
                >
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">複製</span>
                  <span className="text-xs text-gray-500">複製到其他位置</span>
                </button>

                <button
                  onClick={() => handleExecuteOperation(BatchOperationType.DELETE)}
                  disabled={selectedItems.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="delete-operation-button"
                >
                  <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="font-medium">刪除</span>
                  <span className="text-xs text-gray-500">永久刪除項目</span>
                </button>

                <button
                  onClick={() => handleExecuteOperation(BatchOperationType.SHARE)}
                  disabled={selectedItems.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="share-operation-button"
                >
                  <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="font-medium">分享</span>
                  <span className="text-xs text-gray-500">批量分享項目</span>
                </button>

                <button
                  onClick={() => handleExecuteOperation(BatchOperationType.TAG)}
                  disabled={selectedItems.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="tag-operation-button"
                >
                  <svg className="w-8 h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-medium">標籤</span>
                  <span className="text-xs text-gray-500">批量標籤管理</span>
                </button>

                <button
                  onClick={() => handleExecuteOperation(BatchOperationType.EXPORT)}
                  disabled={selectedItems.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="export-operation-button"
                >
                  <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">導出</span>
                  <span className="text-xs text-gray-500">批量導出檔案</span>
                </button>
              </div>

              {/* 操作選項 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">操作選項</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      衝突處理方式
                    </label>
                    <select
                      value={operationOptions.conflictResolution}
                      onChange={(e) => setOperationOptions(prev => ({ ...prev, conflictResolution: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="conflict-resolution-select"
                    >
                      <option value="skip">跳過</option>
                      <option value="overwrite">覆蓋</option>
                      <option value="rename">重命名</option>
                      <option value="merge">合併</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分享類型
                    </label>
                    <select
                      value={operationOptions.shareType}
                      onChange={(e) => setOperationOptions(prev => ({ ...prev, shareType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="share-type-select"
                    >
                      <option value="private">私人</option>
                      <option value="public">公開</option>
                      <option value="class">班級</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={operationOptions.preserveMetadata}
                      onChange={(e) => setOperationOptions(prev => ({ ...prev, preserveMetadata: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      data-testid="preserve-metadata-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700">保留元數據</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={operationOptions.createBackup}
                      onChange={(e) => setOperationOptions(prev => ({ ...prev, createBackup: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      data-testid="create-backup-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700">創建備份</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={operationOptions.notifyUsers}
                      onChange={(e) => setOperationOptions(prev => ({ ...prev, notifyUsers: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      data-testid="notify-users-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700">通知相關用戶</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4" data-testid="progress-content">
              <h3 className="font-medium text-gray-900">操作進度</h3>
              
              {operations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>尚無批量操作記錄</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {operations.map((operation) => (
                    <div key={operation.id} className="border border-gray-200 rounded-lg p-4" data-testid={`operation-${operation.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{getOperationDisplayName(operation.type)}</span>
                          <span className={`text-sm ${getStatusColor(operation.status)}`}>
                            {getStatusDisplayName(operation.status)}
                          </span>
                        </div>
                        
                        {operation.status === BatchOperationStatus.RUNNING && (
                          <button
                            onClick={() => onOperationCancel(operation.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            data-testid={`cancel-operation-${operation.id}`}
                          >
                            取消
                          </button>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>進度: {operation.processedItems}/{operation.totalItems}</span>
                          <span>{operation.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${operation.progress}%` }}
                            data-testid={`progress-bar-${operation.id}`}
                          ></div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <div>開始時間: {operation.startTime.toLocaleString()}</div>
                        {operation.endTime && (
                          <div>結束時間: {operation.endTime.toLocaleString()}</div>
                        )}
                        {operation.failedItems > 0 && (
                          <div className="text-red-600">失敗項目: {operation.failedItems}</div>
                        )}
                        {operation.error && (
                          <div className="text-red-600">錯誤: {operation.error}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
