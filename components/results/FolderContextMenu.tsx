'use client';

import React, { useEffect, useRef } from 'react';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface FolderContextMenuProps {
  folder: ResultFolder;
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onRename?: () => void;
}

export const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  folder,
  x,
  y,
  onClose,
  onDelete,
  onRename
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = React.useState({ x, y });

  // 點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 動態調整菜單位置以避免超出視窗
  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10;

    let adjustedX = x;
    let adjustedY = y;

    // 如果菜單超出右邊界，向左調整
    if (x + menuRect.width > viewportWidth - padding) {
      adjustedX = Math.max(padding, viewportWidth - menuRect.width - padding);
    }

    // 如果菜單超出下邊界，向上調整
    if (y + menuRect.height > viewportHeight - padding) {
      adjustedY = Math.max(padding, viewportHeight - menuRect.height - padding);
    }

    // 確保不超出左邊界和上邊界
    adjustedX = Math.max(padding, adjustedX);
    adjustedY = Math.max(padding, adjustedY);

    setMenuPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  const position = menuPosition;

  return (
    <>
      {/* 背景遮罩 - 手機版更明顯 */}
      <div className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent" onClick={onClose} />

      {/* 菜單內容 - 響應式 */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px] sm:min-w-[160px] max-w-[80vw]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* 重命名選項 - 響應式 */}
        <button
          onClick={() => {
            if (onRename) {
              onRename();
            }
            onClose();
          }}
          className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <PencilIcon className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="truncate">重新命名</span>
        </button>

        {/* 分隔線 */}
        <div className="border-t border-gray-100 my-1" />

        {/* 刪除選項 - 響應式 */}
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <TrashIcon className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="truncate">刪除資料夾</span>
        </button>
      </div>
    </>
  );
};

export default FolderContextMenu;
