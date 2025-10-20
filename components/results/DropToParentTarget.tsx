'use client';

import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface DropToParentTargetProps {
  onResultDropToParent: (resultId: string) => void;
  onFolderDropToParent?: (folderId: string) => void;
  onClickToParent: () => void;
}

export const DropToParentTarget: React.FC<DropToParentTargetProps> = ({
  onResultDropToParent,
  onFolderDropToParent,
  onClickToParent
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // 檢查是結果還是資料夾
    const resultId = e.dataTransfer.getData('text/plain');
    const folderId = e.dataTransfer.getData('folder/id');

    if (folderId && onFolderDropToParent) {
      // 資料夾拖移回上一層
      console.log('📁 資料夾拖移回上一層:', folderId);
      onFolderDropToParent(folderId);
    } else if (resultId && onResultDropToParent) {
      // 結果拖移回上一層
      console.log('📄 結果拖移回上一層:', resultId);
      onResultDropToParent(resultId);
    }
  };

  return (
    <div
      className={`
        mb-6 p-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
        ${isDragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClickToParent}
    >
      <div className="flex items-center justify-center gap-3 text-gray-600">
        <ArrowUp className="w-5 h-5" />
        <span className="text-sm font-medium">
          拖拽結果或資料夾到此處以移回上一層
        </span>
      </div>
    </div>
  );
};

export default DropToParentTarget;

