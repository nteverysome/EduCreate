'use client';

/**
 * 社區資料夾卡片組件（手機版 - 列表式佈局）
 * 用於小網格視圖的緊湊顯示
 */

import React from 'react';
import { Folder } from 'lucide-react';

interface FolderData {
  id: string;
  name: string;
  color: string | null;
  activityCount: number;
}

interface CommunityFolderCardMobileProps {
  folder: FolderData;
  onClick: (folderId: string) => void;
}

export const CommunityFolderCardMobile: React.FC<CommunityFolderCardMobileProps> = ({
  folder,
  onClick
}) => {
  return (
    <div
      onClick={() => onClick(folder.id)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-2 border border-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {/* 資料夾圖標 */}
        <div 
          className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: folder.color || '#3B82F6' }}
        >
          <Folder className="w-6 h-6 text-white" />
        </div>

        {/* 資料夾信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={folder.name}>
            {folder.name}
          </h3>
          <p className="text-xs text-gray-500">
            {folder.activityCount} {folder.activityCount === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      </div>
    </div>
  );
};

