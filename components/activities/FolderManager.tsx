'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Folder, MoreVertical, Edit2, Trash2, Move } from 'lucide-react';
import FolderCard from './FolderCard';
import CreateFolderModal from './CreateFolderModal';

interface FolderData {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FolderManagerProps {
  currentFolderId?: string;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate?: (name: string, color: string) => Promise<void>;
  onFolderUpdate?: (id: string, name: string, color?: string) => Promise<void>;
  onFolderDelete?: (id: string) => Promise<void>;
  // 拖拽相關
  onActivityDropToFolder?: (activityId: string, folderId: string) => Promise<void>;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  currentFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  onActivityDropToFolder
}) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderData | null>(null);

  // 載入資料夾數據
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/folders');
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

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '創建資料夾失敗');
      }

      const newFolder = await response.json();
      setFolders(prev => [newFolder, ...prev]);

      // 調用父組件的回調
      if (onFolderCreate) {
        await onFolderCreate(name, color);
      }
    } catch (error: any) {
      throw error; // 讓模態框處理錯誤顯示
    }
  };

  const handleUpdateFolder = async (folder: FolderData) => {
    // 這裡可以實現編輯功能，暫時先設置編輯狀態
    setEditingFolder(folder);
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

      setFolders(prev => prev.filter(folder => folder.id !== id));

      // 調用父組件的回調
      if (onFolderDelete) {
        await onFolderDelete(id);
      }
    } catch (error: any) {
      alert(error.message || '刪除資料夾失敗');
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
    <div className="folder-manager mb-6">
      {/* 麵包屑導航 */}
      <div className="breadcrumb mb-4">
        <button
          onClick={() => onFolderSelect(null)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          我的活動
        </button>
        {currentFolderId && (
          <>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">
              {folders.find(f => f.id === currentFolderId)?.name || '未知資料夾'}
            </span>
          </>
        )}
      </div>

      {/* 資料夾網格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {/* 創建新資料夾按鈕 */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="folder-card bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
          <span className="text-sm text-gray-600 group-hover:text-blue-600">新增資料夾</span>
        </button>

        {/* 現有資料夾 */}
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onClick={onFolderSelect}
            onEdit={handleUpdateFolder}
            onDelete={handleDeleteFolder}
            onDrop={onActivityDropToFolder}
          />
        ))}
      </div>

      {/* 創建資料夾模態框 */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default FolderManager;
