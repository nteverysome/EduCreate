'use client';

import React from 'react';
import { X, Folder, Home, CheckCircle } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  activityCount: number;
}

interface BatchMoveModalProps {
  isOpen: boolean;
  selectedActivityIds: string[];
  selectedActivityTitles: string[];
  folders: Folder[];
  currentFolderId: string | null;
  onMove: (activityIds: string[], targetFolderId: string | null) => Promise<void>;
  onClose: () => void;
}

export const BatchMoveModal: React.FC<BatchMoveModalProps> = ({
  isOpen,
  selectedActivityIds,
  selectedActivityTitles,
  folders,
  currentFolderId,
  onMove,
  onClose
}) => {
  const [isMoving, setIsMoving] = React.useState(false);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  if (!isOpen || selectedActivityIds.length === 0) return null;

  const handleMoveToFolder = async () => {
    if (isMoving) return;
    
    try {
      setIsMoving(true);
      await onMove(selectedActivityIds, selectedFolderId);
      onClose();
    } catch (error) {
      console.error('批量移動失敗:', error);
      // 錯誤處理已在父組件中處理
    } finally {
      setIsMoving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isMoving) {
      onClose();
    }
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 標題欄 - 響應式 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              批量移動活動
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              選擇目標資料夾移動 {selectedActivityIds.length} 個活動
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isMoving}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 選中的活動列表 - 響應式 */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 max-h-32 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-2">選中的活動：</h3>
          <div className="space-y-1">
            {selectedActivityTitles.slice(0, 3).map((title, index) => (
              <div key={index} className="text-xs sm:text-sm text-gray-600 truncate">
                • {title}
              </div>
            ))}
            {selectedActivityTitles.length > 3 && (
              <div className="text-xs sm:text-sm text-gray-500">
                ... 還有 {selectedActivityTitles.length - 3} 個活動
              </div>
            )}
          </div>
        </div>

        {/* 資料夾選擇區域 - 響應式 */}
        <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-4">選擇目標位置：</h3>
          
          {/* 根目錄選項 */}
          <button
            onClick={() => handleFolderSelect(null)}
            disabled={isMoving}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all mb-3 ${
              selectedFolderId === null
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            <div className="flex items-center min-w-0">
              <Home className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  根目錄
                </div>
                <div className="text-xs text-gray-500">
                  移動到主目錄
                </div>
              </div>
            </div>
            {selectedFolderId === null && (
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
          </button>

          {/* 資料夾列表 */}
          <div className="space-y-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderSelect(folder.id)}
                disabled={isMoving || folder.id === currentFolderId}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  selectedFolderId === folder.id
                    ? 'border-blue-500 bg-blue-50'
                    : folder.id === currentFolderId
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center min-w-0">
                  <Folder className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {folder.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {folder.activityCount} 個活動
                      {folder.id === currentFolderId && ' (當前位置)'}
                    </div>
                  </div>
                </div>
                {selectedFolderId === folder.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {folders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">尚未建立任何資料夾</p>
            </div>
          )}
        </div>

        {/* 操作按鈕 - 響應式 */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isMoving}
            className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleMoveToFolder}
            disabled={isMoving}
            className="flex-1 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-400"
          >
            {isMoving ? '移動中...' : `移動 ${selectedActivityIds.length} 個活動`}
          </button>
        </div>
      </div>
    </div>
  );
};
