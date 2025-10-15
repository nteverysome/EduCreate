'use client';

import React, { useEffect, useRef } from 'react';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  ShareIcon,
  LinkIcon,
  FolderIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  folderId?: string;
  assignmentId: string;
  activityId: string;
}

interface ResultFolder {
  id: string;
  name: string;
  color?: string;
}

interface ResultContextMenuProps {
  result: AssignmentResult;
  x: number;
  y: number;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onView: () => void;
  onSetDeadline: () => void;
  onDuplicate?: () => void;
  onShareLink: () => void;
  onMove?: (folderId: string | null) => void; // 新增：移動到資料夾
  folders?: ResultFolder[]; // 新增：可用的資料夾列表
}

export const ResultContextMenu: React.FC<ResultContextMenuProps> = ({
  result,
  x,
  y,
  onClose,
  onRename,
  onDelete,
  onView,
  onSetDeadline,
  onDuplicate,
  onShareLink,
  onMove,
  folders = []
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMoveSubmenu, setShowMoveSubmenu] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);

  // 生成學生分享連結
  const getStudentShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/play/${result.activityId}/${result.assignmentId}`;
  };

  // 複製學生分享連結
  const copyStudentShareLink = async () => {
    const shareLink = getStudentShareLink();
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
      // 降級方案
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // 处理点击外部关闭菜单
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

  // 计算菜单位置，确保不超出屏幕边界
  const getMenuPosition = () => {
    const menuWidth = 200;
    const menuHeight = 160;
    const padding = 10;

    let adjustedX = x;
    let adjustedY = y;

    // 检查右边界
    if (x + menuWidth > window.innerWidth - padding) {
      adjustedX = x - menuWidth;
    }

    // 检查下边界
    if (y + menuHeight > window.innerHeight - padding) {
      adjustedY = y - menuHeight;
    }

    // 确保不超出左边界和上边界
    adjustedX = Math.max(padding, adjustedX);
    adjustedY = Math.max(padding, adjustedY);

    return { x: adjustedX, y: adjustedY };
  };

  const position = getMenuPosition();

  const menuItems = [
    {
      icon: EyeIcon,
      label: '查看詳情',
      onClick: onView,
      className: 'text-gray-700 hover:bg-gray-50'
    },
    {
      icon: ShareIcon,
      label: '可共用結果連結',
      onClick: onShareLink,
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      icon: LinkIcon,
      label: copySuccess ? '✓ 已複製！' : '學生分享連結',
      onClick: copyStudentShareLink,
      className: copySuccess ? 'text-green-600 hover:bg-green-50' : 'text-purple-600 hover:bg-purple-50'
    },
    {
      icon: PencilIcon,
      label: '重新命名',
      onClick: onRename,
      className: 'text-gray-700 hover:bg-gray-50'
    },
    ...(onMove ? [{
      icon: FolderIcon,
      label: '移動到',
      onClick: () => setShowMoveSubmenu(!showMoveSubmenu),
      className: 'text-gray-700 hover:bg-gray-50',
      hasSubmenu: true
    }] : []),
    {
      icon: CalendarIcon,
      label: '設置截止日期',
      onClick: onSetDeadline,
      className: 'text-gray-700 hover:bg-gray-50'
    },
    ...(onDuplicate ? [{
      icon: DocumentDuplicateIcon,
      label: '複製結果',
      onClick: onDuplicate,
      className: 'text-gray-700 hover:bg-gray-50'
    }] : []),
    {
      icon: TrashIcon,
      label: '刪除結果',
      onClick: onDelete,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[180px]"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {/* 菜单标题 */}
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 truncate">
          {result.title}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {result.activityName}
        </p>
      </div>

      {/* 菜单项 */}
      {menuItems.map((item, index) => (
        <div key={index} className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.onClick();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${item.className}`}
          >
            <div className="flex items-center">
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </div>
            {(item as any).hasSubmenu && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* 移動到資料夾子菜單 */}
          {(item as any).hasSubmenu && showMoveSubmenu && (
            <div className="absolute left-full top-0 ml-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
              {/* 移動到根目錄 */}
              {result.folderId && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMove?.(null);
                    onClose();
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FolderIcon className="w-4 h-4 mr-3 text-gray-400" />
                  <span>根目錄</span>
                </button>
              )}

              {/* 資料夾列表 */}
              {folders.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  沒有可用的資料夾
                </div>
              ) : (
                folders
                  .filter(folder => folder.id !== result.folderId) // 過濾掉當前所在的資料夾
                  .map((folder) => (
                    <button
                      key={folder.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMove?.(folder.id);
                        onClose();
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FolderIcon
                        className="w-4 h-4 mr-3"
                        style={{ color: folder.color || '#3B82F6' }}
                      />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))
              )}
            </div>
          )}
        </div>
      ))}

      {/* 结果状态指示 */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">狀態</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            result.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : result.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {result.status === 'active' ? '進行中' : 
             result.status === 'completed' ? '已完成' : '已過期'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">參與人數</span>
          <span className="text-xs text-gray-700">{result.participantCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultContextMenu;
