'use client';

import React from 'react';
import { X, Folder, Home } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  activityCount: number;
}

interface MoveActivityModalProps {
  isOpen: boolean;
  activityId: string | null;
  activityTitle: string;
  folders: Folder[];
  currentFolderId: string | null;
  onMove: (activityId: string, targetFolderId: string | null) => Promise<void>;
  onClose: () => void;
}

export const MoveActivityModal: React.FC<MoveActivityModalProps> = ({
  isOpen,
  activityId,
  activityTitle,
  folders,
  currentFolderId,
  onMove,
  onClose
}) => {
  const [isMoving, setIsMoving] = React.useState(false);

  if (!isOpen || !activityId) return null;

  const handleMoveToFolder = async (targetFolderId: string | null) => {
    if (isMoving) return;
    
    try {
      setIsMoving(true);
      await onMove(activityId, targetFolderId);
      onClose();
    } catch (error) {
      console.error('移動失敗:', error);
      // 錯誤處理已在父組件中處理
    } finally {
      setIsMoving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* 模態對話框標題 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">移動活動</h2>
            <p className="text-sm text-gray-600 mt-1">
              選擇 "{activityTitle}" 的目標資料夾
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isMoving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 資料夾列表 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-4">選擇目標資料夾</h3>
          
          <div className="space-y-2">
            {/* 根級別選項 */}
            {currentFolderId && (
              <button
                onClick={() => handleMoveToFolder(null)}
                disabled={isMoving}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 
                  hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
                  ${isMoving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex-shrink-0">
                  <Home className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">根級別</div>
                  <div className="text-sm text-gray-500">移動到主要活動列表</div>
                </div>
              </button>
            )}

            {/* 資料夾列表 */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleMoveToFolder(folder.id)}
                disabled={isMoving || folder.id === currentFolderId}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                  ${folder.id === currentFolderId 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                    : isMoving 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  <Folder className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{folder.name}</div>
                  <div className="text-sm text-gray-500">
                    {folder.activityCount} 個活動
                  </div>
                </div>
                {folder.id === currentFolderId && (
                  <div className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                    目前位置
                  </div>
                )}
              </button>
            ))}

            {folders.length === 0 && !currentFolderId && (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>尚未建立任何資料夾</p>
                <p className="text-sm mt-1">請先建立資料夾來組織您的活動</p>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作區域 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isMoving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          {isMoving && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">移動中...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
