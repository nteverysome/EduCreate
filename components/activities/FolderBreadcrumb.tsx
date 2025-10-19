'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface FolderBreadcrumbItem {
  id: string | null;
  name: string;
}

interface FolderBreadcrumbProps {
  path: FolderBreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

/**
 * 資料夾麵包屑導航組件
 * 顯示當前資料夾路徑並支援點擊導航
 */
export const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
  path,
  onNavigate
}) => {
  if (path.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center space-x-2 text-sm">
      {/* 首頁圖標 */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
        aria-label="返回根目錄"
      >
        <Home className="w-4 h-4" />
        <span>我的活動</span>
      </button>

      {/* 路徑分隔符和資料夾 */}
      {path.map((item, index) => (
        <React.Fragment key={item.id || 'root'}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === path.length - 1 ? (
            // 當前資料夾（不可點擊）
            <span className="text-gray-900 font-medium">
              {item.name}
            </span>
          ) : (
            // 父資料夾（可點擊）
            <button
              onClick={() => onNavigate(item.id)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.name}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FolderBreadcrumb;

