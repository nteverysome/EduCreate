'use client';

import React, { useState } from 'react';
import { MoreVertical, ExternalLink, Edit2, Trash2, Copy, Move, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface ActivityCardMobileProps {
  activity: {
    id: string;
    title: string;
    thumbnail?: string;
    gameType: string;
    isPublic: boolean;
    createdAt: Date | string;
    lastModified: Date | string;
    lastPlayed?: Date | string;
  };
  onClick: (activity: any) => void;
  onEdit?: (activity: any) => void;
  onDelete?: (activity: any) => void;
  onDuplicate?: (activity: any) => void;
  onMove?: (activity: any) => void;
  onToggleVisibility?: (activityId: string) => void;
  draggable?: boolean;
}

export const ActivityCardMobile: React.FC<ActivityCardMobileProps> = ({
  activity,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onToggleVisibility,
  draggable = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = () => {
    onClick(activity);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('activityId', activity.id);
    e.dataTransfer.setData('type', 'activity');
  };

  return (
    <>
      <div
        className="activity-card-mobile relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 p-3"
        onClick={handleCardClick}
        draggable={draggable}
        onDragStart={handleDragStart}
      >
        {/* 縮略圖 */}
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
          {activity.thumbnail ? (
            <Image
              src={activity.thumbnail}
              alt={activity.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <span className="text-white text-xs font-medium">
                {activity.gameType}
              </span>
            </div>
          )}
        </div>

        {/* 活動信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate" title={activity.title}>
            {activity.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {activity.gameType}
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
                window.open(`/activity/${activity.id}`, '_blank');
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
                onEdit?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              編輯
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              複製
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove?.(activity);
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
                onToggleVisibility?.(activity.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              {activity.isPublic ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  設為私人
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  設為公開
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(activity);
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

