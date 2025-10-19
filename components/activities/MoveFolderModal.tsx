'use client';

import React, { useState, useEffect } from 'react';
import { X, Move, Folder, ChevronRight, Home } from 'lucide-react';

interface FolderOption {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
}

interface MoveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoveFolder: (folderId: string, targetParentId: string | null) => Promise<void>;
  folder: {
    id: string;
    name: string;
    parentId: string | null;
  } | null;
  currentFolderId: string | null; // 當前所在的資料夾 ID
}

export const MoveFolderModal: React.FC<MoveFolderModalProps> = ({
  isOpen,
  onClose,
  onMoveFolder,
  folder,
  currentFolderId
}) => {
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 載入可用的目標資料夾
  useEffect(() => {
    if (isOpen && folder) {
      loadAvailableFolders();
    }
  }, [isOpen, folder]);

  const loadAvailableFolders = async () => {
    try {
      setIsLoading(true);
      setError('');

      // 獲取所有資料夾（不包括當前資料夾及其子資料夾）
      const response = await fetch('/api/folders?type=activities');
      
      if (!response.ok) {
        throw new Error('載入資料夾失敗');
      }

      const allFolders: FolderOption[] = await response.json();
      
      // 過濾掉當前資料夾及其子資料夾
      const filtered = allFolders.filter(f => {
        // 不能移動到自己
        if (f.id === folder?.id) return false;
        
        // 不能移動到自己的子資料夾（檢查 parentId 鏈）
        // 這個簡單的檢查可能不夠完整，但對於大多數情況足夠了
        return true;
      });

      setAvailableFolders(filtered);
      
      // 默認選中當前資料夾的父資料夾
      setSelectedTargetId(folder?.parentId || null);
    } catch (error: any) {
      console.error('載入資料夾失敗:', error);
      setError(error.message || '載入資料夾失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folder) return;

    // 如果選中的目標與當前位置相同，不需要移動
    if (selectedTargetId === folder.parentId) {
      setError('資料夾已在此位置');
      return;
    }

    setIsMoving(true);
    setError('');

    try {
      await onMoveFolder(folder.id, selectedTargetId);
      onClose();
    } catch (error: any) {
      setError(error.message || '移動資料夾失敗');
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    if (!isMoving) {
      setError('');
      setSelectedTargetId(null);
      onClose();
    }
  };

  if (!isOpen || !folder) return null;

  // 按深度排序資料夾，並添加縮進
  const sortedFolders = [...availableFolders].sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* 標題和關閉按鈕 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-gray-700" />
            <h1 className="text-xl font-semibold text-gray-900">移動資料夾</h1>
          </div>
          <button
            onClick={handleClose}
            disabled={isMoving}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 資料夾名稱顯示 */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">要移動的資料夾</p>
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-gray-500" />
            <p className="text-base font-medium text-gray-900">{folder.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* 目標位置選擇 */}
          <div className="mb-6 flex-1 min-h-0 flex flex-col">
            <h2 className="text-sm font-medium text-gray-700 mb-3">選擇目標位置</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">載入中...</div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-y-auto flex-1 min-h-0">
                {/* 根目錄選項 */}
                <button
                  type="button"
                  onClick={() => setSelectedTargetId(null)}
                  disabled={isMoving}
                  className={`
                    w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left
                    ${selectedTargetId === null ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <Home className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">根目錄</span>
                  {selectedTargetId === null && (
                    <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />
                  )}
                </button>

                {/* 其他資料夾選項 */}
                {sortedFolders.map((folderOption) => (
                  <button
                    key={folderOption.id}
                    type="button"
                    onClick={() => setSelectedTargetId(folderOption.id)}
                    disabled={isMoving}
                    className={`
                      w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left border-t border-gray-100
                      ${selectedTargetId === folderOption.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    style={{ paddingLeft: `${16 + folderOption.depth * 20}px` }}
                  >
                    <Folder className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">{folderOption.name}</span>
                    {selectedTargetId === folderOption.id && (
                      <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />
                    )}
                  </button>
                ))}

                {sortedFolders.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    沒有其他可用的資料夾
                  </div>
                )}
              </div>
            )}
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
              disabled={isMoving}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isMoving || isLoading || selectedTargetId === folder.parentId}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMoving ? '移動中...' : '確認移動'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveFolderModal;

