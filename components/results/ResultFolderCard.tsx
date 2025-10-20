'use client';

import React, { useState } from 'react';
import { Folder, MoreVertical } from 'lucide-react';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface ResultFolderCardProps {
  folder: ResultFolder;
  onClick: (folder: ResultFolder) => void;
  onMenuClick?: (folder: ResultFolder, event: React.MouseEvent) => void;
  // 拖拽相關
  onResultDrop?: (resultId: string, folderId: string) => void;
  onFolderDrop?: (draggedFolderId: string, targetFolderId: string) => void;
  draggable?: boolean;
}

export const ResultFolderCard: React.FC<ResultFolderCardProps> = ({
  folder,
  onClick,
  onMenuClick,
  onResultDrop,
  onFolderDrop,
  draggable = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCardClick = () => {
    onClick(folder);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick(folder, e);
    }
  };

  // 資料夾拖移源事件處理
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('folder/id', folder.id); // 使用特殊的 MIME 類型標識資料夾
    console.log('🔵 開始拖移資料夾:', folder.name);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🔵 結束拖移資料夾:', folder.name);
  };

  // 資料夾拖移目標事件處理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (!isDragOver) {
      setIsDragOver(true);
      console.log('🎯 拖移進入資料夾:', folder.name);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setIsDragOver(false);
    console.log('🎯 拖移離開資料夾:', folder.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 檢查是結果還是資料夾
    const resultId = e.dataTransfer.getData('text/plain');
    const folderId = e.dataTransfer.getData('folder/id');

    if (folderId) {
      // 資料夾拖移到資料夾
      if (folderId !== folder.id && onFolderDrop) {
        console.log('📁 資料夾拖移到資料夾:', folderId, '->', folder.id);
        onFolderDrop(folderId, folder.id);
      }
    } else if (resultId && onResultDrop) {
      // 結果拖移到資料夾
      console.log('📄 結果拖移到資料夾:', resultId, '->', folder.id);
      onResultDrop(resultId, folder.id);
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

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group
        ${isDragOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}
        ${draggable ? 'cursor-move' : ''}
      `}
      onClick={handleCardClick}
      style={{ backgroundColor: isDragOver ? '#EBF8FF' : getBackgroundColor(folderColor) }}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultFolderCard;

