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
  DocumentDuplicateIcon,
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
  isOwner?: boolean; // 是否是活動所有者
  onPrint?: () => void;
  onEmbed?: () => void;
  onRename?: () => void;
  onAssignment?: () => void; // 課業分配回調
  onCopy?: () => void; // 複製活動回調
  isCopying?: boolean; // 是否正在複製
  onEditTags?: () => void; // 編輯標籤回調
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
  isOwner = true,
  onPrint,
  onEmbed,
  onRename,
  onAssignment,
  onCopy,
  isCopying = false,
  onEditTags,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 調試日誌
  console.log('🔍 EnhancedActivityInfoBox props:', {
    isOwner,
    onEditTags: !!onEditTags,
    tagsLength: tags.length,
    tags,
  });

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
                  <Link
                    href={`/profile/${author.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    by {author.name}
                  </Link>
                </div>
              )}

              {/* 分類 */}
              {category && (
                <div className="flex items-center gap-1">
                  <FolderIcon className="w-4 h-4" />
                  <span className="px-2.5 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                    {category}
                  </span>
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
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {/* 編輯標籤按鈕 - 只有所有者可以編輯 */}
                {isOwner && onEditTags && (
                  <button
                    onClick={onEditTags}
                    className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    title="編輯標籤"
                  >
                    編輯
                  </button>
                )}
              </div>
            )}

            {/* 如果沒有標籤但是所有者，顯示添加標籤按鈕 */}
            {tags.length === 0 && isOwner && onEditTags && (
              <div className="mt-2">
                <button
                  onClick={onEditTags}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-300 rounded-md transition-colors"
                >
                  <TagIcon className="w-3 h-3" />
                  添加標籤
                </button>
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
            {/* 如果不是所有者，顯示複製和編輯按鈕 */}
            {!isOwner && (
              <>
                {/* 複製按鈕 */}
                {onCopy && (
                  <button
                    onClick={onCopy}
                    disabled={isCopying}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="複製活動"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>{isCopying ? '複製中...' : '複製'}</span>
                  </button>
                )}

                {/* 編輯按鈕 */}
                <Link
                  href={`/create/${templateType || 'shimozurdo-game'}?edit=${activityId}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="編輯內容"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>編輯</span>
                </Link>
              </>
            )}

            {/* 如果是所有者，顯示編輯內容按鈕 */}
            {isOwner && (
              <Link
                href={`/create/${templateType || 'shimozurdo-game'}?edit=${activityId}`}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="編輯內容"
              >
                <PencilIcon className="w-4 h-4" />
                <span>編輯內容</span>
              </Link>
            )}

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

            {/* 課業分配 - 只有所有者可以分配 */}
            {isOwner && (
              <button
                onClick={onAssignment}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                title="課業分配"
              >
                <UserGroupIcon className="w-4 h-4" />
                <span>課業分配</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 手機版操作按鈕 */}
      <div className="md:hidden px-4 py-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {/* 如果不是所有者，顯示複製和編輯按鈕 */}
          {!isOwner && (
            <>
              {/* 複製按鈕 */}
              {onCopy && (
                <button
                  onClick={onCopy}
                  disabled={isCopying}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentDuplicateIcon className="w-5 h-5" />
                  <span>{isCopying ? '複製中...' : '複製'}</span>
                </button>
              )}

              {/* 編輯按鈕 */}
              <Link
                href={`/create/${templateType || 'shimozurdo-game'}?edit=${activityId}`}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                <span>編輯</span>
              </Link>
            </>
          )}

          {/* 如果是所有者，顯示編輯內容按鈕 */}
          {isOwner && (
            <Link
              href={`/create/${templateType || 'shimozurdo-game'}?edit=${activityId}`}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              <span>編輯內容</span>
            </Link>
          )}

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

          {/* 課業分配 - 只有所有者可以分配 */}
          {isOwner && (
            <button
              onClick={onAssignment}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>課業分配</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedActivityInfoBox;

