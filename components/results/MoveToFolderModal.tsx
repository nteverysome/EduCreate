'use client';

import React from 'react';
import {
  XMarkIcon,
  FolderIcon,
  HomeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface ResultFolder {
  id: string;
  name: string;
  color?: string;
  type: 'ACTIVITIES' | 'RESULTS';
  createdAt: string;
  updatedAt: string;
}

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  folderId?: string | null;
}

interface MoveToFolderModalProps {
  result: AssignmentResult;
  folders: ResultFolder[];
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  result,
  folders,
  isOpen,
  onClose,
  onMove
}) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(result.folderId || null);

  const handleMove = () => {
    onMove(selectedFolderId);
    onClose();
  };

  if (!isOpen) return null;

  // 過濾掉當前所在的資料夾
  const availableFolders = folders.filter(folder => folder.id !== result.folderId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600" />
              移動到資料夾
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">選擇要移動到的目標位置</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* 結果信息 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-purple-100">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <span className="text-xl sm:text-2xl">🎮</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {result.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  活動：{result.activityName}
                </p>
              </div>
            </div>
          </div>

          {/* 目標位置選擇 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              選擇目標位置
            </label>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* 根目錄選項 */}
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  selectedFolderId === null
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <HomeIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">根目錄</p>
                    <p className="text-xs text-gray-500">移動到主目錄</p>
                  </div>
                </div>
                {selectedFolderId === null && (
                  <CheckIcon className="w-5 h-5 text-purple-600" />
                )}
              </button>

              {/* 資料夾選項 */}
              {availableFolders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">沒有其他可用的資料夾</p>
                </div>
              ) : (
                availableFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      selectedFolderId === folder.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <FolderIcon
                        className="w-5 h-5 mr-3"
                        style={{ color: folder.color || '#3B82F6' }}
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {folder.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {folder.type === 'ACTIVITIES' ? '活動資料夾' : '結果資料夾'}
                        </p>
                      </div>
                    </div>
                    {selectedFolderId === folder.id && (
                      <CheckIcon className="w-5 h-5 text-purple-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            取消
          </button>
          <button
            onClick={handleMove}
            disabled={selectedFolderId === result.folderId}
            className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
              selectedFolderId === result.folderId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {selectedFolderId === result.folderId ? '已在此位置' : '移動'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
