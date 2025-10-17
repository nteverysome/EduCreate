'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PencilIcon,
  PrinterIcon,
  CodeBracketIcon,
  UserGroupIcon,
  PencilSquareIcon,
  TagIcon,
  UserIcon,
  FolderIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface EnhancedActivityInfoBoxProps {
  activityId: string;
  activityTitle: string;
  templateType?: string; // 遊戲類型（例如：shimozurdo-game）
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  category?: string;
  geptLevel?: string;
  description?: string;
  createdAt?: string;
  onPrint?: () => void;
  onEmbed?: () => void;
  onRename?: () => void;
}

const EnhancedActivityInfoBox: React.FC<EnhancedActivityInfoBoxProps> = ({
  activityId,
  activityTitle,
  templateType,
  author,
  tags = [],
  category,
  geptLevel,
  description,
  createdAt,
  onPrint,
  onEmbed,
  onRename,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
      {/* 頂部信息欄 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          {/* 左側：活動信息 */}
          <div className="flex-1 min-w-0">
            {/* 活動標題 */}
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {activityTitle}
              </h2>
              <button
                onClick={onRename}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="重新命名"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 元數據行 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {/* 作者 */}
              {author && (
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span>by {author.name}</span>
                </div>
              )}

              {/* 分類 */}
              {category && (
                <div className="flex items-center gap-1">
                  <FolderIcon className="w-4 h-4" />
                  <span>{category}</span>
                </div>
              )}

              {/* GEPT 等級 */}
              {geptLevel && (
                <div className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {geptLevel}
                  </span>
                </div>
              )}

              {/* 創建時間 */}
              {createdAt && (
                <span className="text-gray-500">
                  {new Date(createdAt).toLocaleDateString('zh-TW')}
                </span>
              )}
            </div>

            {/* 標籤 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <TagIcon className="w-4 h-4 text-gray-400" />
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 描述（可展開） */}
            {description && (
              <div className="mt-2">
                <p className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`}>
                  {description}
                </p>
                {description.length > 100 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    {isExpanded ? '收起' : '展開'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 右側：操作按鈕（桌面版） */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* 編輯內容 */}
            <Link
              href={`/create/${activityId}`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="編輯內容"
            >
              <PencilIcon className="w-4 h-4" />
              <span>編輯內容</span>
            </Link>

            {/* 列印 */}
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="列印"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>列印</span>
            </button>

            {/* 嵌入 */}
            <button
              onClick={onEmbed}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="嵌入"
            >
              <CodeBracketIcon className="w-4 h-4" />
              <span>嵌入</span>
            </button>

            {/* 課業分配 */}
            <Link
              href="/my-activities"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              title="課業分配"
            >
              <UserGroupIcon className="w-4 h-4" />
              <span>課業分配</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 手機版操作按鈕 */}
      <div className="md:hidden px-4 py-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {/* 編輯內容 */}
          <Link
            href={`/create/${activityId}`}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            <span>編輯內容</span>
          </Link>

          {/* 列印 */}
          <button
            onClick={onPrint}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>列印</span>
          </button>

          {/* 嵌入 */}
          <button
            onClick={onEmbed}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <CodeBracketIcon className="w-5 h-5" />
            <span>嵌入</span>
          </button>

          {/* 課業分配 */}
          <Link
            href="/my-activities"
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserGroupIcon className="w-5 h-5" />
            <span>課業分配</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnhancedActivityInfoBox;

