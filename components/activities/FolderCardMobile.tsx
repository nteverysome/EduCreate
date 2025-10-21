'use client';

import React, { useState } from 'react';
import { Folder, MoreVertical, ExternalLink, Edit2, Trash2, Palette, Move } from 'lucide-react';

interface FolderCardMobileProps {
  folder: {
    id: string;
    name: string;
    color: string;
    activityCount: number;
    description?: string;
  };
  onClick: (folderId: string) => void;
  onEdit?: (folder: any) => void;
  onDelete?: (folderId: string) => void;
  onChangeColor?: (folderId: string, color: string) => void;
  onMove?: (folderId: string) => void;
  onDrop?: (folderId: string) => void;
  onFolderDrop?: (sourceFolderId: string, targetFolderId: string) => void;
  draggable?: boolean;
}

export const FolderCardMobile: React.FC<FolderCardMobileProps> = ({
  folder,
  onClick,
  onEdit,
  onDelete,
  onChangeColor,
  onMove,
  onDrop,
  onFolderDrop,
  draggable = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCardClick = () => {
    onClick(folder.id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('folderId', folder.id);
    e.dataTransfer.setData('type', 'folder');
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const draggedType = e.dataTransfer.types.includes('application/x-folder') ? 'folder' : 'activity';
    if (draggedType === 'folder') {
      const draggedFolderId = e.dataTransfer.getData('folderId');
      if (draggedFolderId !== folder.id) {
        setIsDragOver(true);
      }
    } else {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const draggedType = e.dataTransfer.getData('type');
    
    if (draggedType === 'folder') {
      const sourceFolderId = e.dataTransfer.getData('folderId');
      if (sourceFolderId !== folder.id && onFolderDrop) {
        onFolderDrop(sourceFolderId, folder.id);
      }
    } else if (draggedType === 'activity') {
      if (onDrop) {
        onDrop(folder.id);
      }
    }
  };

  return (
    <>
      <div
        className={`
          folder-card-mobile relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer
          flex items-center gap-3 p-3
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
        {/* 資料夾圖標 */}
        <div 
          className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: folder.color }}
        >
          <Folder className="w-6 h-6 text-white" />
        </div>

        {/* 資料夾信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={folder.name}>
            {folder.name}
          </h3>
          <p className="text-xs text-gray-500">
            {folder.activityCount} 個活動
          </p>
        </div>

        {/* 更多按鈕 */}
        <button
          onClick={handleMenuClick}
          className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          title="更多"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 更多選項菜單 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48 right-4 top-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/my-activities?folder=${folder.id}`, '_blank');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              在新分頁開啟
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(folder);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              重新命名
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeColor?.(folder.id, folder.color);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              變更顏色
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove?.(folder.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Move className="w-4 h-4" />
              移動
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(folder.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              刪除
            </button>
          </div>
        </>
      )}
    </>
  );
};

