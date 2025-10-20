'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => void;
}

const FOLDER_COLORS = [
  { name: '藍色', value: '#3B82F6', bgClass: 'bg-blue-500' },
  { name: '綠色', value: '#10B981', bgClass: 'bg-green-500' },
  { name: '紅色', value: '#EF4444', bgClass: 'bg-red-500' },
  { name: '黃色', value: '#F59E0B', bgClass: 'bg-yellow-500' },
  { name: '紫色', value: '#8B5CF6', bgClass: 'bg-purple-500' },
  { name: '粉色', value: '#EC4899', bgClass: 'bg-pink-500' },
  { name: '橙色', value: '#F97316', bgClass: 'bg-orange-500' },
  { name: '青色', value: '#06B6D4', bgClass: 'bg-cyan-500' },
];

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder
}) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(''); // 清除之前的錯誤信息

    try {
      await onCreateFolder(folderName.trim(), selectedColor);

      // 重置表單
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0].value);
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('創建資料夾失敗:', error);
      // 顯示錯誤提示
      const errorMsg = error instanceof Error ? error.message : '創建資料夾失敗，請稍後再試';
      setErrorMessage(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0].value);
      setErrorMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* 模態對話框 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* 標題欄 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">新資料夾</h1>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* 表單內容 */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* 錯誤提示 */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* 資料夾名稱 */}
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-3">資料夾名稱</h2>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="輸入資料夾名稱"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isCreating}
                autoFocus
                maxLength={50}
              />
            </div>
            
            {/* 資料夾顏色 */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-700 mb-3">資料夾顏色</h2>
              <div className="grid grid-cols-4 gap-3">
                {FOLDER_COLORS.map((color) => (
                  <label
                    key={color.value}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="folderColor"
                      value={color.value}
                      checked={selectedColor === color.value}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="sr-only"
                      disabled={isCreating}
                    />
                    <div
                      className={`w-8 h-8 rounded-full ${color.bgClass} border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!folderName.trim() || isCreating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    創建中...
                  </div>
                ) : (
                  '創建'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;
