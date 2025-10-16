'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PencilIcon,
  PrinterIcon,
  CodeBracketIcon,
  UserGroupIcon,
  GlobeAltIcon,
  QrCodeIcon,
  PencilSquareIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface ActivityToolbarProps {
  activityId: string;
  activityTitle: string;
  onRename?: () => void;
  onPrint?: () => void;
  onEmbed?: () => void;
  onAssign?: () => void;
  onPublishToCommunity?: () => void;
  onShowQRCode?: () => void;
  onShare?: () => void;
}

const ActivityToolbar: React.FC<ActivityToolbarProps> = ({
  activityId,
  activityTitle,
  onRename,
  onPrint,
  onEmbed,
  onAssign,
  onPublishToCommunity,
  onShowQRCode,
  onShare,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 桌面版工具欄 */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* 左側：活動名稱 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {activityTitle}
            </h2>
          </div>

          {/* 右側：操作按鈕 */}
          <div className="flex items-center gap-2 flex-shrink-0">
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

            {/* 設定分配 */}
            <button
              onClick={onAssign}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="設定分配"
            >
              <UserGroupIcon className="w-4 h-4" />
              <span>設定分配</span>
            </button>

            {/* 開放社區 */}
            <button
              onClick={onPublishToCommunity}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="開放社區"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>開放社區</span>
            </button>

            {/* QR CODE */}
            <button
              onClick={onShowQRCode}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="QR CODE"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>QR CODE</span>
            </button>

            {/* 重新命名 */}
            <button
              onClick={onRename}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="重新命名"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>重新命名</span>
            </button>

            {/* 分享按鈕 */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                title="分享"
              >
                <ShareIcon className="w-4 h-4" />
                <span>分享</span>
              </button>

              {/* 分享下拉選單 */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onShare?.();
                        setShowShareMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      複製連結
                    </button>
                    <button
                      onClick={() => {
                        onShowQRCode?.();
                        setShowShareMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      顯示 QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 手機版工具欄 */}
        <div className="md:hidden py-3">
          {/* 活動名稱 */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 truncate flex-1">
              {activityTitle}
            </h2>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              <ShareIcon className="w-4 h-4" />
              <span>分享</span>
            </button>
          </div>

          {/* 操作按鈕網格 */}
          <div className="grid grid-cols-4 gap-2">
            {/* 編輯內容 */}
            <Link
              href={`/create/${activityId}`}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              <span>編輯</span>
            </Link>

            {/* 列印 */}
            <button
              onClick={onPrint}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <PrinterIcon className="w-5 h-5" />
              <span>列印</span>
            </button>

            {/* 嵌入 */}
            <button
              onClick={onEmbed}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <CodeBracketIcon className="w-5 h-5" />
              <span>嵌入</span>
            </button>

            {/* 設定分配 */}
            <button
              onClick={onAssign}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>分配</span>
            </button>

            {/* 開放社區 */}
            <button
              onClick={onPublishToCommunity}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <GlobeAltIcon className="w-5 h-5" />
              <span>社區</span>
            </button>

            {/* QR CODE */}
            <button
              onClick={onShowQRCode}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <QrCodeIcon className="w-5 h-5" />
              <span>QR</span>
            </button>

            {/* 重新命名 */}
            <button
              onClick={onRename}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span>命名</span>
            </button>
          </div>

          {/* 分享下拉選單（手機版） */}
          {showShareMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={() => setShowShareMenu(false)}>
              <div className="bg-white rounded-t-lg w-full p-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">分享選項</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onShare?.();
                      setShowShareMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    複製連結
                  </button>
                  <button
                    onClick={() => {
                      onShowQRCode?.();
                      setShowShareMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    顯示 QR Code
                  </button>
                </div>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="mt-4 w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityToolbar;

