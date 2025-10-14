'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import WordwallStyleResultCard from './WordwallStyleResultCard';
import WordwallStyleFolderCard from './WordwallStyleFolderCard';
import NewFolderModal from './NewFolderModal';
import FolderContextMenu from './FolderContextMenu';
import DeleteConfirmModal from './DeleteConfirmModal';

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  folderId?: string;
  assignmentId: string;
  activityId: string;
}

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface WordwallStyleMyResultsProps {
  userId: string;
}

export const WordwallStyleMyResults: React.FC<WordwallStyleMyResultsProps> = ({
  userId
}) => {
  // 狀態管理
  const [results, setResults] = useState<AssignmentResult[]>([]);
  const [folders, setFolders] = useState<ResultFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'deadline' | 'name'>('created');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // 菜单和删除相关状态
  const [contextMenu, setContextMenu] = useState<{
    folder: ResultFolder;
    x: number;
    y: number;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<ResultFolder | null>(null);

  // 載入結果數據
  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 調用真實 API
      const response = await fetch('/api/results');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error('載入結果失敗:', response.status);
        // 如果 API 失敗，使用模擬數據作為後備
        const mockResults: AssignmentResult[] = [
          {
            id: '1',
            title: '"國小南一三年級英文第2課"的結果3',
            activityName: '國小南一三年級英文第2課',
            participantCount: 0,
            createdAt: '2025-10-13T00:52:00Z',
            status: 'active',
            assignmentId: 'assignment2',
            activityId: 'activity2'
          },
          {
            id: '2',
            title: '"國小南一三年級英文第2課"的結果2',
            activityName: '國小南一三年級英文第2課',
            participantCount: 0,
            createdAt: '2025-10-13T00:51:00Z',
            status: 'active',
            assignmentId: 'assignment3',
            activityId: 'activity3'
          },
          {
            id: '3',
            title: '"複製無標題43"的結果1',
            activityName: '複製無標題43',
            participantCount: 1,
            createdAt: '2025-10-13T00:10:00Z',
            status: 'active',
            assignmentId: 'assignment1',
            activityId: 'activity1'
          }
        ];
        setResults(mockResults);
      }

      // 模擬資料夾數據（暫時）
      const mockFolders: ResultFolder[] = [
        {
          id: 'folder1',
          name: '三年級上學期英文',
          resultCount: 0,
          createdAt: '2025-10-12T00:00:00Z'
        }
      ];
      setFolders(mockFolders);
    } catch (error) {
      console.error('載入數據失敗:', error);
      setError('載入數據失敗，請稍後重試');
      setResults([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // 格式化時間顯示
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${date.getDate()} ${date.toLocaleDateString('zh-TW', { month: 'short' })} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return date.toLocaleDateString('zh-TW', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 過濾和排序結果
  const filteredAndSortedResults = results
    .filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.activityName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // 處理結果項目點擊
  const handleResultClick = (result: AssignmentResult) => {
    // 導航到結果詳情頁面
    window.location.href = `/my-results/${result.id}`;
  };

  // 處理資料夾點擊
  const handleFolderClick = (folder: ResultFolder) => {
    // 導航到資料夾頁面
    setCurrentFolderId(folder.id);
  };

  // 處理創建新資料夾
  const handleCreateFolder = async (name: string, color: string) => {
    try {
      // TODO: 調用 API 創建資料夾
      const newFolder: ResultFolder = {
        id: `folder_${Date.now()}`,
        name,
        resultCount: 0,
        createdAt: new Date().toISOString(),
        color
      };

      setFolders(prev => [...prev, newFolder]);
      console.log('創建資料夾成功:', newFolder);
    } catch (error) {
      console.error('創建資料夾失敗:', error);
      throw error;
    }
  };

  // 處理資料夾菜單點擊
  const handleFolderMenuClick = (folder: ResultFolder, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      folder,
      x: event.clientX,
      y: event.clientY
    });
  };

  // 關閉菜單
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // 處理刪除資料夾
  const handleDeleteFolder = async (folder: ResultFolder) => {
    setFolderToDelete(folder);
    setShowDeleteModal(true);
    setContextMenu(null);
  };

  // 確認刪除資料夾
  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;

    try {
      const response = await fetch(`/api/folders?id=${folderToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刪除資料夾失敗');
      }

      // 從列表中移除已刪除的資料夾
      setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));

      // 重新載入結果以更新顯示
      await loadResults();

      console.log('資料夾刪除成功:', folderToDelete.name);
    } catch (error) {
      console.error('刪除資料夾失敗:', error);
      setError(error instanceof Error ? error.message : '刪除資料夾失敗');
    } finally {
      setShowDeleteModal(false);
      setFolderToDelete(null);
    }
  };

  // 取消刪除
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFolderToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={loadResults}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 頁面標題和操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">我的結果</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FolderIcon className="w-4 h-4 mr-2" />
              新資料夾
            </button>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <TrashIcon className="w-4 h-4 mr-2" />
              回收箱
            </button>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜尋我的結果..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 排序選項 */}
      <div className="mb-6">
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-500">訂購者：</span>
          <button
            onClick={() => setSortBy('created')}
            className={`flex items-center space-x-1 ${
              sortBy === 'created' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <span>創建</span>
            <span className="text-xs">▼</span>
          </button>
          <button
            onClick={() => setSortBy('deadline')}
            className={`flex items-center space-x-1 ${
              sortBy === 'deadline' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <span>最後期限</span>
            <span className="text-xs">▼</span>
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`flex items-center space-x-1 ${
              sortBy === 'name' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <span>名字</span>
            <span className="text-xs">▼</span>
          </button>
        </div>
      </div>

      {/* 內容區域 - 簡化的列表佈局 */}
      <div className="space-y-2">
        {/* 資料夾 */}
        {folders.map(folder => (
          <WordwallStyleFolderCard
            key={folder.id}
            folder={folder}
            onClick={handleFolderClick}
            onMenuClick={handleFolderMenuClick}
          />
        ))}

        {/* 結果項目 */}
        {filteredAndSortedResults.map(result => (
          <WordwallStyleResultCard
            key={result.id}
            result={result}
            onClick={handleResultClick}
            onMenuClick={(result, event) => {
              // TODO: 實現結果菜單功能
              console.log('結果菜單點擊:', result);
            }}
          />
        ))}

        {/* 空狀態 */}
        {filteredAndSortedResults.length === 0 && folders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">尚無結果</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? '沒有找到符合搜尋條件的結果' : '開始創建課業分配來收集學生結果'}
            </p>
            {!searchQuery && (
              <a
                href="/my-activities"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                前往我的活動
              </a>
            )}
          </div>
        )}
      </div>

      {/* 新資料夾模態對話框 */}
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* 資料夾右鍵菜單 */}
      {contextMenu && (
        <FolderContextMenu
          folder={contextMenu.folder}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onDelete={() => handleDeleteFolder(contextMenu.folder)}
        />
      )}

      {/* 刪除確認對話框 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="刪除資料夾"
        message={`確定要刪除資料夾「${folderToDelete?.name}」嗎？此操作無法復原。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default WordwallStyleMyResults;
