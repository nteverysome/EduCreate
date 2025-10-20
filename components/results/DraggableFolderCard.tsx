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

interface DraggableFolderCardProps {
  folder: ResultFolder;
  onClick: (folder: ResultFolder) => void;
  onMenuClick?: (folder: ResultFolder, event: React.MouseEvent) => void;
}

/**
 * 可拖放的資料夾卡片組件
 * 支援：
 * 1. 拖放資料夾到其他資料夾（嵌套）
 * 2. 接收結果拖放
 * 3. 點擊進入資料夾
 */
const DraggableFolderCardComponent: React.FC<DraggableFolderCardProps> = ({
  folder,
  onClick,
  onMenuClick
}) => {
  const { isDragging, dragItem, onDrop, startDrag } = useDragDrop();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragReady, setIsDragReady] = useState(false);

  // 當拖放結束時，重置 isDropTarget 狀態
  useEffect(() => {
    if (!isDragging) {
      setIsDropTarget(false);
      setDragStartPos(null);
      setIsDragReady(false);
    }
  }, [isDragging]);

  // 處理菜單點擊
  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onMenuClick) {
      onMenuClick(folder, event);
    }
  };

  // 處理卡片點擊
  const handleCardClick = (event: React.MouseEvent) => {
    // 如果正在拖拽，不處理點擊事件
    if (isDragging) {
      console.log(`🚫 [${folder.name}] 拖拽狀態中，忽略點擊事件`);
      event.preventDefault();
      return;
    }

    console.log(`🖱️ [${folder.name}] 處理點擊事件`);
    onClick(folder);
  };

  // 記錄滑鼠按下位置
  const handleMouseDown = (event: React.MouseEvent) => {
    // 如果點擊的是菜單按鈕，不啟動拖放
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    event.preventDefault();
    setDragStartPos({ x: event.clientX, y: event.clientY });
    setIsDragReady(true);
    console.log(`📍 [${folder.name}] 記錄滑鼠按下位置: (${event.clientX}, ${event.clientY})`);
  };

  // 滑鼠移動時檢查是否開始拖放
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragReady || !dragStartPos) return;

    const deltaX = Math.abs(event.clientX - dragStartPos.x);
    const deltaY = Math.abs(event.clientY - dragStartPos.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 只有移動超過 5 像素才開始拖放
    if (distance > 5) {
      console.log(`🚀 [${folder.name}] 開始拖放資料夾 (移動距離: ${distance.toFixed(2)}px)`);
      setIsDragReady(false);

      startDrag({
        id: folder.id,
        type: 'folder',
        data: folder
      }, event);
    }
  };

  // 滑鼠進入（可能是放置目標）
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

  // 滑鼠離開
  const handleMouseLeave = () => {
    setIsDropTarget(false);
  };

  // 滑鼠釋放（執行放置）
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

  // 將十六進制顏色轉換為 RGB 並調整透明度
  const getBackgroundColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  const folderColor = folder.color || '#3B82F6'; // 默認藍色

  // 檢查當前資料夾是否正在被拖放
  const isBeingDragged = isDragging && dragItem?.id === folder.id;

  // 檢查是否可以接收拖放
  const canAcceptDrop = isDragging && (
    (dragItem?.type === 'result') ||
    (dragItem?.type === 'folder' && dragItem?.id !== folder.id)
  );

  return (
    <div
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      className={`
        relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-move group
        ${isDropTarget ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}
        ${isBeingDragged ? 'opacity-50 scale-95' : ''}
      `}
      style={{
        backgroundColor: isDropTarget ? '#EBF8FF' : getBackgroundColor(folderColor),
        userSelect: 'none'
      }}
    >
      {/* 資料夾內容 */}
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

        {/* 更多選項按鈕 */}
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

      {/* 正在拖放指示器 */}
      {isBeingDragged && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 rounded-lg">
          <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
            <span className="mr-2">📁</span>
            拖放中...
          </div>
        </div>
      )}
    </div>
  );
};

// 使用 React.memo 優化性能，避免不必要的重新渲染
export const DraggableFolderCard = memo(DraggableFolderCardComponent, (prevProps, nextProps) => {
  // 只有當這些屬性改變時才重新渲染
  return (
    prevProps.folder.id === nextProps.folder.id &&
    prevProps.folder.name === nextProps.folder.name &&
    prevProps.folder.resultCount === nextProps.folder.resultCount &&
    prevProps.folder.color === nextProps.folder.color
  );
});

DraggableFolderCard.displayName = 'DraggableFolderCard';

export default DraggableFolderCard;

