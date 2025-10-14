'use client';

import React, { useState } from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';
import { useDragDrop } from './DragDropContext';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface DroppableFolderCardProps {
  folder: ResultFolder;
  onClick: (folder: ResultFolder) => void;
  onMenuClick?: (folder: ResultFolder, event: React.MouseEvent) => void;
}

export const DroppableFolderCard: React.FC<DroppableFolderCardProps> = ({
  folder,
  onClick,
  onMenuClick
}) => {
  const { isDragging, dragItem, onDrop } = useDragDrop();
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onMenuClick) {
      onMenuClick(folder, event);
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    console.log('🔍 DroppableFolderCard handleCardClick 被调用:', { folder, event });
    event.preventDefault();
    console.log('✅ 调用 onClick 回调:', folder);
    onClick(folder);
  };

  const handleMouseEnter = () => {
    if (isDragging && dragItem?.type === 'result') {
      setIsDropTarget(true);
    }
  };

  const handleMouseLeave = () => {
    setIsDropTarget(false);
  };

  const handleMouseUp = async () => {
    if (isDropTarget && isDragging && dragItem?.type === 'result') {
      await onDrop(folder.id, 'folder');
      setIsDropTarget(false);
    }
  };

  // 获取资料夹颜色，默认为蓝色
  const getFolderIconStyle = () => {
    const color = folder.color || '#3B82F6'; // 默认蓝色
    return { color };
  };

  // 检查是否可以接收拖移
  const canAcceptDrop = isDragging && dragItem?.type === 'result';

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      className={`block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${
        isDropTarget
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
          : canAcceptDrop
            ? 'border-gray-300 hover:border-blue-300'
            : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* 資料夾圖標 */}
          <div className="flex-shrink-0">
            <FolderIcon 
              className="w-8 h-8" 
              style={getFolderIconStyle()}
            />
          </div>
          
          {/* 資料夾信息 */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-medium text-gray-900 truncate">
              {folder.name}
            </h2>
            <p className="text-sm text-gray-500">
              {folder.resultCount}結果
            </p>
          </div>
        </div>

        {/* 更多選項按鈕 */}
        <button
          onClick={handleMenuClick}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="更多選項"
        >
          ⋮
        </button>
      </div>

      {/* 拖移提示 */}
      {isDropTarget && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span className="mr-1">📁</span>
            放入此資料夾
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableFolderCard;
