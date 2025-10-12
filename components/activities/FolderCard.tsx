'use client';

import React, { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

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

interface FolderCardProps {
  folder: FolderData;
  onClick: (folderId: string) => void;
  onEdit?: (folder: FolderData) => void;
  onDelete?: (folderId: string) => void;
  // 拖拽相關
  onDrop?: (activityId: string, folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  onEdit,
  onDelete,
  onDrop
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

  // 拖拽目標事件處理
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

    const activityId = e.dataTransfer.getData('text/plain');
    if (activityId && onDrop) {
      onDrop(activityId, folder.id);
    }
  };

  // 將十六進制顏色轉換為 RGB 並調整透明度
  const getBackgroundColor = (color: string) => {
    // 移除 # 符號
    const hex = color.replace('#', '');
    
    // 轉換為 RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 返回帶透明度的 RGB 顏色
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  const getIconColor = (color: string) => {
    return color;
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group
        ${isDragOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}
      `}
      onClick={handleCardClick}
      style={{ backgroundColor: isDragOver ? '#EBF8FF' : getBackgroundColor(folder.color) }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 資料夾內容 */}
      <div className="p-4">
        {/* 資料夾圖標和標題 */}
        <div className="flex flex-col items-center text-center mb-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: folder.color }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {folder.name}
          </h3>
          
          <p className="text-xs text-gray-500">
            {folder.activityCount} 個活動
          </p>
        </div>

        {/* 更多選項按鈕 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-full hover:bg-white/80 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {/* 下拉菜單 */}
            {showMenu && (
              <>
                {/* 背景遮罩 */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                
                {/* 菜單內容 */}
                <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[120px]">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      <Edit2 className="w-3 h-3" />
                      重新命名
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      刪除
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 資料夾描述（如果有的話） */}
      {folder.description && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-600 line-clamp-2">
            {folder.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default FolderCard;
