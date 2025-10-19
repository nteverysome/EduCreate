'use client';

import React, { useState, useEffect } from 'react';
import { X, Palette } from 'lucide-react';

interface EditFolderColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateColor: (folderId: string, color: string) => Promise<void>;
  folder: {
    id: string;
    name: string;
    color: string;
  } | null;
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

export const EditFolderColorModal: React.FC<EditFolderColorModalProps> = ({
  isOpen,
  onClose,
  onUpdateColor,
  folder
}) => {
  const [selectedColor, setSelectedColor] = useState(folder?.color || FOLDER_COLORS[0].value);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  // 當 folder 改變時更新選中的顏色
  useEffect(() => {
    if (folder) {
      setSelectedColor(folder.color);
    }
  }, [folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folder) return;

    setIsUpdating(true);
    setError('');

    try {
      await onUpdateColor(folder.id, selectedColor);
      onClose();
    } catch (error: any) {
      setError(error.message || '變更顏色失敗');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setError('');
      onClose();
    }
  };

  if (!isOpen || !folder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 標題和關閉按鈕 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">變更資料夾顏色</h1>
          </div>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 資料夾名稱顯示 */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">資料夾名稱</p>
          <p className="text-base font-medium text-gray-900">{folder.name}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 資料夾顏色選擇 */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">選擇新顏色</h2>
            <div className="grid grid-cols-5 gap-3">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  disabled={isUpdating}
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

          {/* 錯誤訊息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 按鈕組 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUpdating || selectedColor === folder.color}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? '更新中...' : '確認變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFolderColorModal;

