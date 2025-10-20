'use client';

import React, { useState, memo, useEffect } from 'react';
import { Folder, MoreVertical } from 'lucide-react';
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

const DroppableFolderCardComponent: React.FC<DroppableFolderCardProps> = ({
  folder,
  onClick,
  onMenuClick
}) => {
  const { isDragging, dragItem, onDrop } = useDragDrop();
  const [isDropTarget, setIsDropTarget] = useState(false);

  // 當拖放結束時，重置 isDropTarget 狀態
  useEffect(() => {
    if (!isDragging) {
      setIsDropTarget(false);
    }
  }, [isDragging]);

  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onMenuClick) {
      onMenuClick(folder, event);
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    // 如果正在拖拽，不处理点击事件
    if (isDragging) {
      console.log(`🚫 [${folder.name}] 拖拽状态中，忽略点击事件`);
      event.preventDefault();
      return;
    }

    console.log(`🖱️ [${folder.name}] 处理点击事件`);
    onClick(folder);
  };

  const handleMouseEnter = () => {
    console.log(`🎯 [${folder.name}] handleMouseEnter:`, {
      isDragging,
      dragItemType: dragItem?.type,
      dragItemId: dragItem?.id,
      canAcceptResult: isDragging && dragItem?.type === 'result',
      canAcceptFolder: isDragging && dragItem?.type === 'folder' && dragItem?.id !== folder.id
    });

    // 可以接收結果或其他資料夾（但不能是自己）
    if (isDragging) {
      if (dragItem?.type === 'result') {
        setIsDropTarget(true);
        console.log(`✅ [${folder.name}] 可以接收結果`);
      } else if (dragItem?.type === 'folder' && dragItem?.id !== folder.id) {
        setIsDropTarget(true);
        console.log(`✅ [${folder.name}] 可以接收資料夾`);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsDropTarget(false);
  };

  const handleMouseUp = async () => {
    console.log(`🎯 [${folder.name}] handleMouseUp:`, {
      isDropTarget,
      isDragging,
      dragItemType: dragItem?.type,
      dragItemId: dragItem?.id
    });

    if (isDropTarget && isDragging) {
      console.log(`🚀 [${folder.name}] 執行拖放操作: ${dragItem?.id} → ${folder.id}`);
      await onDrop(folder.id, 'folder');
      setIsDropTarget(false);
      console.log(`✅ [${folder.name}] 拖放操作完成`);
    }
  };

  // 將十六進制顏色轉換為 RGB 並調整透明度（參考我的活動頁面）
  const getBackgroundColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  const folderColor = folder.color || '#3B82F6'; // 默认蓝色

  // 檢查是否可以接收拖放
  const canAcceptDrop = isDragging && (
    (dragItem?.type === 'result') ||
    (dragItem?.type === 'folder' && dragItem?.id !== folder.id)
  );

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      className={`
        relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group
        ${isDropTarget ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}
      `}
      style={{ backgroundColor: isDropTarget ? '#EBF8FF' : getBackgroundColor(folderColor) }}
    >
      {/* 資料夾內容（參考我的活動頁面的垂直居中佈局） */}
      <div className="p-4">
        {/* 資料夾圖標和標題 */}
        <div className="flex flex-col items-center text-center mb-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: folderColor }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {folder.name}
          </h3>

          <p className="text-xs text-gray-500">
            {folder.resultCount} 個結果
          </p>
        </div>

        {/* 更多選項按鈕（參考我的活動頁面的右上角位置） */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full hover:bg-white/80 transition-colors"
            aria-label="更多選項"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 拖放提示 */}
      {isDropTarget && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 rounded-lg">
          <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <span className="mr-2">
              {dragItem?.type === 'folder' ? '📁' : '📊'}
            </span>
            放入此資料夾
          </div>
        </div>
      )}
    </div>
  );
};

// 使用 React.memo 優化性能
export const DroppableFolderCard = memo(DroppableFolderCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.folder.id === nextProps.folder.id &&
    prevProps.folder.name === nextProps.folder.name &&
    prevProps.folder.resultCount === nextProps.folder.resultCount &&
    prevProps.folder.color === nextProps.folder.color
  );
});

DroppableFolderCard.displayName = 'DroppableFolderCard';

export default DroppableFolderCard;
