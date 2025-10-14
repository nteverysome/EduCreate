'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface RenameFolderModalProps {
  isOpen: boolean;
  folder: ResultFolder | null;
  onClose: () => void;
  onRename: (folderId: string, newName: string) => Promise<void>;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  folder,
  onClose,
  onRename
}) => {
  const [folderName, setFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当模态框打开时，设置初始名称
  useEffect(() => {
    if (isOpen && folder) {
      setFolderName(folder.name);
      setError(null);
    }
  }, [isOpen, folder]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folder || !folderName.trim()) return;

    const trimmedName = folderName.trim();
    
    // 检查名称是否有变化
    if (trimmedName === folder.name) {
      onClose();
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      await onRename(folder.id, trimmedName);
      onClose();
    } catch (error) {
      console.error('重命名资料夹失败:', error);
      setError('重命名失败，请重试');
    } finally {
      setIsRenaming(false);
    }
  };

  // 处理关闭
  const handleClose = () => {
    if (!isRenaming) {
      setFolderName('');
      setError(null);
      onClose();
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isRenaming) {
      handleClose();
    }
  };

  if (!isOpen || !folder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* 模态框内容 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* 标题栏 */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-medium text-gray-900">
                重新命名資料夾
              </h1>
              <button
                onClick={handleClose}
                disabled={isRenaming}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 表单内容 */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                  資料夾名稱
                </label>
                <input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="輸入新的資料夾名稱"
                  disabled={isRenaming}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  autoFocus
                  maxLength={50}
                />
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 按钮组 */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isRenaming}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !folderName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRenaming ? '重命名中...' : '重命名'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameFolderModal;
