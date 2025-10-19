'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FolderData {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface RenameFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  folder: FolderData | null;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  onClose,
  onRenameFolder,
  folder
}) => {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && folder) {
      setFolderName(folder.name);
      setError('');
    }
  }, [isOpen, folder]);

  if (!isOpen || !folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('請輸入資料夾名稱');
      return;
    }

    if (folderName.trim() === folder.name) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onRenameFolder(folder.id, folderName.trim());
      onClose();
    } catch (error: any) {
      setError(error.message || '重新命名失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 標題 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">重新命名資料夾</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
              資料夾名稱
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入資料夾名稱"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isSubmitting || !folderName.trim()}
            >
              {isSubmitting ? '重新命名中...' : '確認'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameFolderModal;

