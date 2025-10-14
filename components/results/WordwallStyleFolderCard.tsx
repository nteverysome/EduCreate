'use client';

import React from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface WordwallStyleFolderCardProps {
  folder: ResultFolder;
  onClick: (folder: ResultFolder) => void;
  onMenuClick?: (folder: ResultFolder, event: React.MouseEvent) => void;
}

export const WordwallStyleFolderCard: React.FC<WordwallStyleFolderCardProps> = ({
  folder,
  onClick,
  onMenuClick
}) => {
  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onMenuClick) {
      onMenuClick(folder, event);
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onClick(folder);
  };

  // 获取资料夹颜色，默认为蓝色
  const getFolderIconStyle = () => {
    const color = folder.color || '#3B82F6'; // 默认蓝色
    return { color };
  };

  return (
    <a
      href={`/my-results/folder/${folder.id}`}
      onClick={handleCardClick}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* 資料夾圖標 */}
          <FolderIcon
            className="w-8 h-8 mr-4"
            style={getFolderIconStyle()}
          />
          
          {/* 資料夾信息 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">{folder.name}</h2>
            <p className="text-sm text-gray-500">{folder.resultCount}結果</p>
          </div>
        </div>
        
        {/* 菜單按鈕 */}
        <button
          onClick={handleMenuClick}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="更多選項"
        >
          <span className="text-gray-400 text-lg">⋮</span>
        </button>
      </div>
    </a>
  );
};

export default WordwallStyleFolderCard;
