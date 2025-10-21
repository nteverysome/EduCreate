'use client';

import React, { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2, Palette, Move, ExternalLink } from 'lucide-react';

interface FolderData {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FolderCardCompactProps {
  folder: FolderData;
  onClick: (folderId: string) => void;
  onEdit?: (folder: FolderData) => void;
  onDelete?: (folderId: string) => void;
  onChangeColor?: (folder: FolderData) => void;
  onMove?: (folder: FolderData) => void;
  onDrop?: (activityId: string, folderId: string) => void;
  onFolderDrop?: (draggedFolderId: string, targetFolderId: string) => void;
  draggable?: boolean;
}

export const FolderCardCompact: React.FC<FolderCardCompactProps> = ({
  folder,
  onClick,
  onEdit,
  onDelete,
  onChangeColor,
  onMove,
  onDrop,
  onFolderDrop,
  draggable = true
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleCardClick = () => {
    onClick(folder.id);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (!showMenu) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 250;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = rect.left;
      let y = rect.bottom + 4;

      if (rect.right + menuWidth > viewportWidth - 8) {
        x = Math.max(8, viewportWidth - menuWidth - 8);
      }

      if (y + menuHeight > viewportHeight - 8) {
        y = Math.max(8, rect.top - menuHeight - 4);
      }

      setMenuPosition({ x, y });
    }

    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(folder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (confirm(`確定要刪除資料夾「${folder.name}」嗎？資料夾內的活動將移至根目錄。`)) {
      onDelete?.(folder.id);
    }
  };

  const handleChangeColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onChangeColor?.(folder);
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMove?.(folder);
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const url = `/my-activities?folderId=${folder.id}`;
    window.open(url, '_blank');
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('folder/id', folder.id);
    console.log('🔵 開始拖移資料夾:', folder.name);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🔵 結束拖移資料夾:', folder.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const activityId = e.dataTransfer.types.includes('text/plain');
    const folderId = e.dataTransfer.types.includes('folder/id');
    
    if (activityId || folderId) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const activityId = e.dataTransfer.getData('text/plain');
    const draggedFolderId = e.dataTransfer.getData('folder/id');

    if (activityId && onDrop) {
      console.log('📥 活動拖移到資料夾:', activityId, '->', folder.id);
      onDrop(activityId, folder.id);
    } else if (draggedFolderId && onFolderDrop) {
      if (draggedFolderId !== folder.id) {
        console.log('📥 資料夾拖移到資料夾:', draggedFolderId, '->', folder.id);
        onFolderDrop(draggedFolderId, folder.id);
      }
    }
  };

  const getBackgroundColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': '#DBEAFE',
      'green': '#D1FAE5',
      'yellow': '#FEF3C7',
      'red': '#FEE2E2',
      'purple': '#E9D5FF',
      'pink': '#FCE7F3',
      'indigo': '#E0E7FF',
      'gray': '#F3F4F6',
    };
    return colorMap[color] || '#F3F4F6';
  };

  return (
    <>
      <div
        className={`
          folder-card-compact relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer
          ${isDragOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}
          ${draggable ? 'cursor-move' : ''}
        `}
        onClick={handleCardClick}
        style={{ backgroundColor: isDragOver ? '#EBF8FF' : 'white' }}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 內容區域 - 緊湊佈局 */}
        <div className="p-3">
          {/* 資料夾圖標和名稱 */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: folder.color }}
            >
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-xs truncate" title={folder.name}>
                {folder.name}
              </h3>
              <p className="text-xs text-gray-500">
                {folder.activityCount} 個活動
              </p>
            </div>
          </div>

          {/* 功能按鈕 - 橫向排列 */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(folder.id);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
              title="開啟"
            >
              <Folder className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(folder);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
              title="重新命名"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            <button
              onClick={handleMenuClick}
              className="flex items-center justify-center px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              title="更多"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 更多選項菜單 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            <button
              onClick={handleOpenInNewTab}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              在新分頁開啟
            </button>

            {onEdit && (
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                重新命名
              </button>
            )}

            {onChangeColor && (
              <button
                onClick={handleChangeColor}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                變更顏色
              </button>
            )}

            {onMove && (
              <button
                onClick={handleMove}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Move className="w-4 h-4" />
                移動
              </button>
            )}

            <div className="border-t border-gray-200 my-1" />

            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                刪除
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default FolderCardCompact;

