'use client';

import React, { useState } from 'react';
import { MoreVertical, ExternalLink, Edit2, Trash2, Move, Share2, Calendar, QrCode } from 'lucide-react';
import Image from 'next/image';

interface ResultCardMobileProps {
  result: {
    id: string;
    title: string;
    thumbnailUrl?: string | null;  // 修改為 thumbnailUrl
    status: string;
    participantCount: number;  // 修改為 participantCount（與 AssignmentResult 一致）
    createdAt: Date | string;
  };
  onClick: (result: any) => void;
  onMenuClick?: (result: any, action: string) => void;
}

export const ResultCardMobile: React.FC<ResultCardMobileProps> = ({
  result,
  onClick,
  onMenuClick
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = () => {
    onClick(result);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('resultId', result.id);
    e.dataTransfer.setData('type', 'result');
  };

  return (
    <>
      <div
        className="result-card-mobile relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 p-3"
        onClick={handleCardClick}
        draggable={true}
        onDragStart={handleDragStart}
      >
        {/* 縮略圖 */}
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
          {result.thumbnailUrl ? (
            <Image
              src={result.thumbnailUrl}
              alt={result.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
              <span className="text-white text-2xl">📊</span>
            </div>
          )}
        </div>

        {/* 結果信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={result.title}>
            {result.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {result.participantCount} 個提交
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
                window.open(`/result/${result.id}`, '_blank');
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
                onMenuClick?.(result, 'rename');
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
                onMenuClick?.(result, 'move');
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
                onMenuClick?.(result, 'share');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(result, 'qrcode');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              顯示 QR Code
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(result, 'deadline');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              設定截止日期
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(result, 'delete');
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

