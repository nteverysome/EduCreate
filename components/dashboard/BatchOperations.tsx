import React from 'react';
import { TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BatchOperationsProps {
  selectedItems: string[];
  onPublish: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

/**
 * 批量操作組件
 * 用於Dashboard頁面中對多個活動進行批量操作
 */
const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedItems,
  onPublish,
  onDelete,
  onCancel
}) => {
  if (selectedItems.length === 0) return null;
  
  return (
    <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between mb-4 animate-fadeIn">
      <div className="text-sm text-gray-700">
        已選擇 <span className="font-medium">{selectedItems.length}</span> 個項目
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onPublish}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
        >
          <CheckIcon className="h-4 w-4 mr-1" />
          批量發布
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          批量刪除
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 flex items-center"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          取消選擇
        </button>
      </div>
    </div>
  );
};

export default BatchOperations;