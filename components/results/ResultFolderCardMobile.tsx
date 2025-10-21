'use client';

import React, { useState } from 'react';
import { Folder, MoreVertical, ExternalLink, Edit2, Trash2, Palette, Move } from 'lucide-react';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface ResultFolderCardMobileProps {
  folder: ResultFolder;
  onClick: (folder: ResultFolder) => void;
  onMenuClick?: (folder: ResultFolder, event: React.MouseEvent) => void;
  onResultDrop?: (resultId: string, folderId: string) => void;
  onFolderDrop?: (draggedFolderId: string, targetFolderId: string) => void;
  draggable?: boolean;
}

export const ResultFolderCardMobile: React.FC<ResultFolderCardMobileProps> = ({
  folder,
  onClick,
  onMenuClick,
  onResultDrop,
  onFolderDrop,
  draggable = true
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCardClick = () => {
    onClick(folder);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // 資料夾拖移源事件處理
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('folder/id', folder.id);
    console.log('🔵 開始拖移資料夾:', folder.name);
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
    console.log('🔵 結束拖移資料夾');
  };

  // 資料夾拖移目標事件處理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 檢查是否為資料夾或結果
    const isFolderDrag = e.dataTransfer.types.includes('folder/id');
    const isResultDrag = e.dataTransfer.types.includes('result/id');
    
    if (isFolderDrag || isResultDrag) {
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

    // 檢查是資料夾還是結果
    const draggedFolderId = e.dataTransfer.getData('folder/id');
    const draggedResultId = e.dataTransfer.getData('result/id');

    if (draggedFolderId) {
      // 資料夾拖放到資料夾
      if (draggedFolderId !== folder.id && onFolderDrop) {
        console.log('📁 資料夾拖放到資料夾:', draggedFolderId, '→', folder.id);
        onFolderDrop(draggedFolderId, folder.id);
      }
    } else if (draggedResultId) {
      // 結果拖放到資料夾
      if (onResultDrop) {
        console.log('📊 結果拖放到資料夾:', draggedResultId, '→', folder.id);
        onResultDrop(draggedResultId, folder.id);
      }
    }
  };

  return (
    <>
      <div
        className={`
          result-folder-card-mobile relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer
          flex items-center gap-3 p-3
          ${isDragOver ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200'}
        `}
        onClick={handleCardClick}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 資料夾圖標 */}
        <div className="flex-shrink-0">
          <Folder
            className="w-12 h-12"
            style={{ color: folder.color || '#3B82F6' }}
            fill={folder.color || '#3B82F6'}
            fillOpacity={0.2}
          />
        </div>

        {/* 資料夾信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={folder.name}>
            {folder.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {folder.resultCount} 個結果
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
                window.open(`/my-results?folder=${folder.id}`, '_blank');
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
                if (onMenuClick) {
                  onMenuClick(folder, e);
                }
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
                // 觸發顏色選擇
                if (onMenuClick) {
                  onMenuClick(folder, e);
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              更改顏色
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // 觸發移動
                if (onMenuClick) {
                  onMenuClick(folder, e);
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Move className="w-4 h-4" />
              移動到資料夾
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // 觸發刪除
                if (onMenuClick) {
                  onMenuClick(folder, e);
                }
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

