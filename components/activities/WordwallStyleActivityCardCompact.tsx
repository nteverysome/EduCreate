'use client';

import React, { useState } from 'react';
import {
  Play,
  Edit2,
  MoreVertical,
  Copy,
  Trash2,
  Share2,
  Folder,
  FileEdit,
  BookOpen,
  QrCode,
  Globe,
  Lock,
  Users
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: 'vocabulary' | 'system';
  gameType: string;
  isPublic: boolean;
  playCount: number;
  lastModified: Date;
  createdAt: Date;
  thumbnail?: string;
  screenshotStatus?: string;
  screenshotError?: string;
  screenshotRetryCount?: number;
  wordCount?: number;
  geptLevel?: string;
  tags?: string[];
  content?: any;
  vocabularyItems?: Array<{
    id: string;
    english: string;
    chinese: string;
  }>;
  isPublicShared?: boolean;
  shareToken?: string;
  communityPlays?: number;
  communityTags?: string[];
  communityCategory?: string;
}

interface WordwallStyleActivityCardCompactProps {
  activity: Activity;
  isSelected?: boolean;
  onSelect?: (activity: Activity) => void;
  onPlay?: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onCopy?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
  onShare?: (activity: Activity) => void;
  onRename?: (activity: Activity, newTitle: string) => void;
  onMove?: (activity: Activity) => void;
  onEditContent?: (activity: Activity) => void;
  onAssignment?: (activity: Activity) => void;
  onCommunityShare?: (activity: Activity) => void;
  onQRCode?: (activity: Activity) => void;
  selectionMode?: boolean;
  onDragStart?: (activity: Activity) => void;
  onDragEnd?: () => void;
}

export const WordwallStyleActivityCardCompact: React.FC<WordwallStyleActivityCardCompactProps> = ({
  activity,
  isSelected = false,
  onSelect,
  onPlay,
  onEdit,
  onCopy,
  onDelete,
  onShare,
  onRename,
  onMove,
  onEditContent,
  onAssignment,
  onCommunityShare,
  onQRCode,
  selectionMode = false,
  onDragStart,
  onDragEnd
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(activity);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', activity.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(activity);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (!showMenu) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 300;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = rect.left;
      let y = rect.bottom + 4;

      if (rect.right + menuWidth > viewportWidth - 8) {
        x = Math.max(8, viewportWidth - menuWidth - 8);
      }

      if (y + menuHeight > viewportHeight - 8) {
        y = Math.max(8, rect.top - menuHeight - 4);
      }

      setMenuPosition({ x, y });
    }

    setShowMenu(!showMenu);
  };

  return (
    <>
      <div
        className={`
          activity-card-compact bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer
          ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
          ${selectionMode ? 'hover:ring-2 hover:ring-blue-300' : 'hover:border-gray-300'}
          ${isDragging ? 'opacity-50 transform rotate-2' : ''}
        `}
        onClick={handleCardClick}
        style={{
          width: '239px',
          height: '258px'
        }}
        draggable={!selectionMode}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 縮略圖 - 固定尺寸 237px × 178px */}
        <div className="relative" style={{ width: '237px', height: '178px' }}>
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center overflow-hidden">
            {activity.thumbnail ? (
              <img
                src={activity.thumbnail}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  {activity.screenshotStatus === 'generating' ? (
                    <>
                      <div className="text-4xl mb-1 animate-pulse">📸</div>
                      <div className="text-xs text-gray-500">生成中...</div>
                    </>
                  ) : activity.screenshotStatus === 'failed' ? (
                    <div className="text-4xl">❌</div>
                  ) : (
                    <div className="text-4xl">🎮</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 選擇模式的勾選框 */}
          {selectionMode && (
            <div className="absolute top-1 left-1">
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center
                ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}
              `}>
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* 公開/私人標識 - 簡化版 */}
          <div className="absolute top-1 right-1">
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center
              ${activity.isPublicShared
                ? 'bg-blue-500 text-white'
                : activity.isPublic
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-400 text-white'
              }
            `}>
              {activity.isPublicShared ? (
                <Users className="w-3 h-3" />
              ) : activity.isPublic ? (
                <Globe className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </div>
          </div>
        </div>

        {/* 標題和信息 */}
        <div className="px-2 py-2">
          {/* 標題 - 單行 */}
          <h3 className="font-medium text-gray-900 text-sm truncate mb-1" title={activity.title}>
            {activity.title}
          </h3>

          {/* 遊戲類型 */}
          <p className="text-xs text-gray-500 truncate mb-2">
            {activity.gameType}
          </p>

          {/* 狀態信息 - 橫向排列 */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              {activity.isPublicShared ? (
                <>
                  <Users className="w-3 h-3" />
                  <span>社區</span>
                </>
              ) : activity.isPublic ? (
                <>
                  <Globe className="w-3 h-3" />
                  <span>公開</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>私人</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              <span>{activity.playCount || 0}</span>
            </div>
          </div>
        </div>

        {/* 更多按鈕 - 右下角 */}
        <button
          onClick={handleMenuToggle}
          className="absolute bottom-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors"
          title="更多"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* 更多選項菜單 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy?.(activity);
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
              <Folder className="w-4 h-4" />
              移動到資料夾
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditContent?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FileEdit className="w-4 h-4" />
              編輯內容
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssignment?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              指派作業
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onQRCode?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              生成 QR Code
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommunityShare?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              社區分享
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(activity);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
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

