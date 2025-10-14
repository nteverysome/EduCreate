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

  // 調整菜單位置以避免超出視窗
  const adjustPosition = () => {
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // 如果菜單超出右邊界，向左調整
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    // 如果菜單超出下邊界，向上調整
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const position = adjustPosition();

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* 菜單內容 */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* 重命名選項 */}
        <button
          onClick={() => {
            if (onRename) {
              onRename();
            }
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <PencilIcon className="w-4 h-4 mr-3" />
          重新命名
        </button>

        {/* 分隔線 */}
        <div className="border-t border-gray-100 my-1" />

        {/* 刪除選項 */}
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <TrashIcon className="w-4 h-4 mr-3" />
          刪除資料夾
        </button>
      </div>
    </>
  );
};

export default FolderContextMenu;
