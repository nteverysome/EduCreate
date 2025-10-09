'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Folder, MoreVertical, Edit2, Trash2, Move } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  activityCount: number;
  createdAt: Date;
  parentId?: string;
  color?: string;
}

interface FolderManagerProps {
  currentFolderId?: string;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate: (name: string, parentId?: string) => void;
  onFolderUpdate: (id: string, name: string) => void;
  onFolderDelete: (id: string) => void;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  currentFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // 載入資料夾數據
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = () => {
    try {
      const savedFolders = localStorage.getItem('vocabulary_folders');
      if (savedFolders) {
        const parsedFolders = JSON.parse(savedFolders);
        setFolders(parsedFolders.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        })));
      }
    } catch (error) {
      console.error('載入資料夾失敗:', error);
    }
  };

  const saveFolders = (updatedFolders: Folder[]) => {
    try {
      localStorage.setItem('vocabulary_folders', JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
    } catch (error) {
      console.error('保存資料夾失敗:', error);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      activityCount: 0,
      createdAt: new Date(),
      parentId: currentFolderId || undefined,
      color: getRandomColor()
    };

    const updatedFolders = [...folders, newFolder];
    saveFolders(updatedFolders);
    onFolderCreate(newFolder.name, newFolder.parentId);
    
    setNewFolderName('');
    setIsCreating(false);
  };

  const handleUpdateFolder = (id: string) => {
    if (!editName.trim()) return;

    const updatedFolders = folders.map(folder =>
      folder.id === id ? { ...folder, name: editName.trim() } : folder
    );
    
    saveFolders(updatedFolders);
    onFolderUpdate(id, editName.trim());
    
    setEditingFolder(null);
    setEditName('');
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('確定要刪除這個資料夾嗎？資料夾內的活動將移至根目錄。')) {
      const updatedFolders = folders.filter(folder => folder.id !== id);
      saveFolders(updatedFolders);
      onFolderDelete(id);
    }
  };

  const getRandomColor = () => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const currentLevelFolders = folders.filter(folder => folder.parentId === currentFolderId);

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
        {/* 創建新資料夾 */}
        {isCreating ? (
          <div className="folder-card bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="資料夾名稱"
              className="w-full text-center border-none outline-none text-sm mb-2"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setIsCreating(false);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateFolder}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                確定
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewFolderName('');
                }}
                className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="folder-card bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
            <span className="text-sm text-gray-600 group-hover:text-blue-600">新增資料夾</span>
          </button>
        )}

        {/* 現有資料夾 */}
        {currentLevelFolders.map((folder) => (
          <div
            key={folder.id}
            className={`folder-card ${folder.color || 'bg-blue-100'} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow relative group`}
          >
            {editingFolder === folder.id ? (
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-center bg-transparent border-none outline-none text-sm font-medium mb-2"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder(folder.id)}
                  onBlur={() => handleUpdateFolder(folder.id)}
                />
              </div>
            ) : (
              <>
                <div
                  onClick={() => onFolderSelect(folder.id)}
                  className="flex flex-col items-center"
                >
                  <Folder className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="text-sm font-medium text-gray-800 text-center line-clamp-2 mb-1">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {folder.activityCount} 個活動
                  </p>
                </div>

                {/* 資料夾選項菜單 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // 這裡可以添加下拉菜單邏輯
                      }}
                      className="p-1 rounded-full hover:bg-white/50"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {/* 簡化的操作按鈕 */}
                    <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border py-1 z-[10] hidden group-hover:block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(folder.id);
                          setEditName(folder.name);
                        }}
                        className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 w-full text-left"
                      >
                        <Edit2 className="w-3 h-3" />
                        重新命名
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderManager;
