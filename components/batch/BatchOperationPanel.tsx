/**
 * 批量操作面板組件
 * 提供批量選擇、操作和進度監控功能
 */

import React, { useState, useEffect } from 'react';
import { BatchOperation, BatchOperationType } from '../../lib/batch/BatchOperationManager';

interface BatchOperationPanelProps {
  items: any[];
  selectedItems: Set<string>;
  onSelectionChange: (selectedItems: Set<string>) => void;
  onBatchOperation: (operation: BatchOperationType, items: string[]) => Promise<void>;
  isProcessing?: boolean;
  progress?: number;
  className?: string;
  'data-testid'?: string;
}

const BatchOperationPanel = ({
  items,
  selectedItems,
  onSelectionChange,
  onBatchOperation,
  isProcessing = false,
  progress = 0,
  className = '',
  'data-testid': testId = 'batch-operation-panel'
}: BatchOperationPanelProps) => {
  const [operationType, setOperationType] = useState<BatchOperationType>('copy');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 全選/取消全選
  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(item => item.id)));
    }
  };

  // 執行批量操作
  const handleBatchOperation = async () => {
    if (selectedItems.size === 0) return;
    
    setShowConfirmDialog(false);
    await onBatchOperation(operationType, Array.from(selectedItems));
  };

  // 操作類型選項
  const operationOptions = [
    { value: 'copy', label: '複製', icon: '📋' },
    { value: 'move', label: '移動', icon: '📁' },
    { value: 'delete', label: '刪除', icon: '🗑️' },
    { value: 'export', label: '匯出', icon: '📤' },
    { value: 'share', label: '分享', icon: '🔗' }
  ] as const;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`} data-testid={testId}>
      {/* 選擇控制 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
            data-testid="select-all-button"
          >
            <input
              type="checkbox"
              checked={selectedItems.size === items.length && items.length > 0}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span>
              {selectedItems.size === items.length && items.length > 0 ? '取消全選' : '全選'}
            </span>
          </button>
          
          <span className="text-sm text-gray-600">
            已選擇 {selectedItems.size} / {items.length} 項
          </span>
        </div>

        {selectedItems.size > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value as BatchOperationType)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              data-testid="operation-type-select"
            >
              {operationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              data-testid="execute-batch-operation"
            >
              {isProcessing ? '處理中...' : '執行'}
            </button>
          </div>
        )}
      </div>

      {/* 進度條 */}
      {isProcessing && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>處理進度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 項目列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map(item => (
          <div
            key={item.id}
            className={`flex items-center space-x-3 p-2 rounded border ${
              selectedItems.has(item.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedItems.has(item.id)}
              onChange={(e) => {
                const newSelection = new Set(selectedItems);
                if (e.target.checked) {
                  newSelection.add(item.id);
                } else {
                  newSelection.delete(item.id);
                }
                onSelectionChange(newSelection);
              }}
              className="rounded"
            />
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.title || item.name}</div>
              <div className="text-xs text-gray-500">
                {item.type} • {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              {item.size || ''}
            </div>
          </div>
        ))}
      </div>

      {/* 確認對話框 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              確認批量操作
            </h3>
            <p className="text-gray-600 mb-6">
              您確定要對 {selectedItems.size} 個項目執行「
              {operationOptions.find(op => op.value === operationType)?.label}」操作嗎？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleBatchOperation}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                確認執行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperationPanel;
