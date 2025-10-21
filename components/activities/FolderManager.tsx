'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Folder, MoreVertical, Edit2, Trash2, Move } from 'lucide-react';
import FolderCard from './FolderCard';
import FolderCardCompact from './FolderCardCompact';
import CreateFolderModal from './CreateFolderModal';
import RenameFolderModal from './RenameFolderModal';
import EditFolderColorModal from './EditFolderColorModal';
import MoveFolderModal from './MoveFolderModal';
import { folderApi, FolderData as ApiFolderData } from '../../lib/api/folderApiManager';

interface FolderData {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  depth?: number;
  path?: string;
}

interface FolderManagerProps {
  currentFolderId?: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate?: (name: string, color: string) => Promise<void>;
  onFolderUpdate?: (id: string, name: string, color?: string) => Promise<void>;
  onFolderDelete?: (id: string) => Promise<void>;
  // 拖拽相關
  onActivityDropToFolder?: (activityId: string, folderId: string) => Promise<void>;
  onFolderDropToFolder?: (draggedFolderId: string, targetFolderId: string) => Promise<void>;
  // 視圖模式
  viewMode?: 'grid' | 'small-grid' | 'list';
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  currentFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  onActivityDropToFolder,
  onFolderDropToFolder,
  viewMode = 'grid'
}) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderData | null>(null); // 當前資料夾信息
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<FolderData | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorEditingFolder, setColorEditingFolder] = useState<FolderData | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movingFolder, setMovingFolder] = useState<FolderData | null>(null);

  // 載入資料夾數據
  useEffect(() => {
    loadFolders();
    loadCurrentFolder(); // 載入當前資料夾信息
  }, [currentFolderId]); // 當 currentFolderId 改變時重新載入

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError('');

      // 🚀 載入當前資料夾的子資料夾
      const response = await fetch(
        `/api/folders?type=activities&parentId=${currentFolderId || ''}`
      );

      if (!response.ok) {
        throw new Error('載入資料夾失敗');
      }

      const foldersData = await response.json();
      setFolders(foldersData);
    } catch (error: any) {
      console.error('載入資料夾失敗:', error);
      setError(error.message || '載入資料夾失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入當前資料夾信息（用於麵包屑導航）
  const loadCurrentFolder = async () => {
    if (!currentFolderId) {
      setCurrentFolder(null);
      return;
    }

    try {
      const response = await fetch(`/api/folders/${currentFolderId}`);
      if (response.ok) {
        const folderData = await response.json();
        setCurrentFolder(folderData);
        console.log('📂 載入當前資料夾信息:', folderData.name);
      }
    } catch (error) {
      console.error('載入當前資料夾信息失敗:', error);
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
          type: 'activities',
          parentId: currentFolderId || null // 在當前資料夾下創建子資料夾
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '創建資料夾失敗');
      }

      const newFolder = await response.json();
      setFolders(prev => [newFolder, ...prev]);

      // 🔧 修復：移除重複的 onFolderCreate 調用
      // 資料夾已經在上面創建成功，不需要再次調用父組件的回調
      // 這會導致重複創建資料夾的問題
    } catch (error: any) {
      throw error; // 讓模態框處理錯誤顯示
    }
  };

  const handleUpdateFolder = async (folder: FolderData) => {
    setRenamingFolder(folder);
    setShowRenameModal(true);
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '重新命名失敗');
      }

      // 重新載入資料夾列表
      await loadFolders();

      // 關閉模態框
      setShowRenameModal(false);
      setRenamingFolder(null);
    } catch (error: any) {
      throw error; // 讓模態框處理錯誤顯示
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刪除資料夾失敗');
      }

      // 🚀 調用父組件的回調來處理數據重新載入
      // 不再直接修改本地狀態,讓父組件重新載入數據確保一致性
      if (onFolderDelete) {
        await onFolderDelete(id);
      }
    } catch (error: any) {
      alert(error.message || '刪除資料夾失敗');
    }
  };

  const handleChangeColor = (folder: FolderData) => {
    setColorEditingFolder(folder);
    setShowColorModal(true);
  };

  const handleUpdateColor = async (folderId: string, color: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '變更顏色失敗');
      }

      // 重新載入資料夾列表
      await loadFolders();

      // 關閉模態框
      setShowColorModal(false);
      setColorEditingFolder(null);
    } catch (error: any) {
      throw error; // 讓模態框處理錯誤顯示
    }
  };

  const handleMoveFolder = (folder: FolderData) => {
    setMovingFolder(folder);
    setShowMoveModal(true);
  };

  const handleMoveFolderSubmit = async (folderId: string, targetParentId: string | null) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetParentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '移動資料夾失敗');
      }

      // 重新載入資料夾列表
      await loadFolders();

      // 關閉模態框
      setShowMoveModal(false);
      setMovingFolder(null);
    } catch (error: any) {
      throw error; // 讓模態框處理錯誤顯示
    }
  };

  if (loading) {
    return (
      <div className="folder-manager mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">載入資料夾中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="folder-manager mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">載入失敗: {error}</div>
          <button
            onClick={loadFolders}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="folder-manager mb-4">
      {/* 資料夾網格 - 參考 Wordwall 佈局，減少底部間距更靠近活動卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
        {/* 創建新資料夾按鈕 */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="folder-card bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
          <span className="text-sm text-gray-600 group-hover:text-blue-600">新增資料夾</span>
        </button>

        {/* 現有資料夾 */}
        {folders.map((folder) => {
          // 根據 viewMode 選擇使用哪個資料夾卡片組件
          const FolderCardComponent = viewMode === 'small-grid'
            ? FolderCardCompact
            : FolderCard;

          return (
            <FolderCardComponent
              key={folder.id}
              folder={folder}
              onClick={onFolderSelect}
              onEdit={handleUpdateFolder}
              onDelete={handleDeleteFolder}
              onChangeColor={handleChangeColor}
              onMove={handleMoveFolder}
              onDrop={onActivityDropToFolder}
              onFolderDrop={onFolderDropToFolder}
              draggable={true}
            />
          );
        })}
      </div>

      {/* 創建資料夾模態框 */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* 重新命名資料夾模態框 */}
      <RenameFolderModal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setRenamingFolder(null);
        }}
        onRenameFolder={handleRenameFolder}
        folder={renamingFolder}
      />

      {/* 變更顏色模態框 */}
      <EditFolderColorModal
        isOpen={showColorModal}
        onClose={() => {
          setShowColorModal(false);
          setColorEditingFolder(null);
        }}
        onUpdateColor={handleUpdateColor}
        folder={colorEditingFolder}
      />

      {/* 移動資料夾模態框 */}
      <MoveFolderModal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false);
          setMovingFolder(null);
        }}
        onMoveFolder={handleMoveFolderSubmit}
        folder={movingFolder}
        currentFolderId={currentFolderId || null}
      />
    </div>
  );
};

export default FolderManager;
