'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => Promise<void>;
}

const FOLDER_COLORS = [
  { name: '藍色', value: '#3B82F6', bgClass: 'bg-blue-500' },
  { name: '綠色', value: '#10B981', bgClass: 'bg-green-500' },
  { name: '黃色', value: '#F59E0B', bgClass: 'bg-yellow-500' },
  { name: '紫色', value: '#8B5CF6', bgClass: 'bg-purple-500' },
  { name: '粉色', value: '#EC4899', bgClass: 'bg-pink-500' },
  { name: '紅色', value: '#EF4444', bgClass: 'bg-red-500' },
  { name: '靛色', value: '#6366F1', bgClass: 'bg-indigo-500' },
  { name: '青色', value: '#06B6D4', bgClass: 'bg-cyan-500' },
  { name: '橙色', value: '#F97316', bgClass: 'bg-orange-500' },
  { name: '灰色', value: '#6B7280', bgClass: 'bg-gray-500' }
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder
}) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('請輸入資料夾名稱');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await onCreateFolder(folderName.trim(), selectedColor);
      
      // 重置表單
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0].value);
      onClose();
    } catch (error: any) {
      setError(error.message || '創建資料夾失敗');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0].value);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 標題和關閉按鈕 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">新資料夾</h1>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 資料夾名稱 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">資料夾名稱</h2>
            <input
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError('');
              }}
              placeholder="輸入資料夾名稱"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* 資料夾顏色 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">資料夾顏色</h2>
            <div className="grid grid-cols-5 gap-3">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  disabled={isCreating}
                  className={`
                    w-12 h-12 rounded-lg ${color.bgClass} 
                    border-2 transition-all duration-200
                    ${selectedColor === color.value 
                      ? 'border-gray-800 scale-110 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 創建按鈕 */}
          <button
            type="submit"
            disabled={isCreating || !folderName.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? '創建中...' : '創建'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
