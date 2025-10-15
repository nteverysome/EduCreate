'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import WordwallStyleResultCard from './WordwallStyleResultCard';
import WordwallStyleFolderCard from './WordwallStyleFolderCard';
import DraggableResultCard from './DraggableResultCard';
import DroppableFolderCard from './DroppableFolderCard';
import { DragDropProvider } from './DragDropContext';
import DragToRootArea from './DragToRootArea';
import NewFolderModal from './NewFolderModal';
import FolderContextMenu from './FolderContextMenu';
import DeleteConfirmModal from './DeleteConfirmModal';
import { RecycleBinModal } from './RecycleBinModal';
import RenameFolderModal from './RenameFolderModal';


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
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<ResultFolder | null>(null);
  // const [activeId, setActiveId] = useState<string | null>(null);

  // 强制刷新机制
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  const forceRefresh = useCallback(() => {
    console.log('🔄 执行强制刷新...');
    setForceRefreshCounter(prev => prev + 1);
  }, []);

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
      // 調用真實 API - 根据 currentFolderId 获取对应的结果
      const folderId = currentFolderId || 'null';
      console.log('🔍 loadResults 调用:', { currentFolderId, folderId });
      const response = await fetch(`/api/results?folderId=${folderId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API 响应成功:', { count: data.length, data });
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

      // 載入真實資料夾數據
      try {
        const foldersResponse = await fetch('/api/folders');
        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json();
          const formattedFolders: ResultFolder[] = foldersData.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
            resultCount: folder.activityCount || 0,
            createdAt: folder.createdAt,
            color: folder.color
          }));
          setFolders(formattedFolders);
        } else {
          console.log('無法載入資料夾，使用空列表');
          setFolders([]);
        }
      } catch (error) {
        console.error('載入資料夾失敗:', error);
        setFolders([]);
      }
    } catch (error) {
      console.error('載入數據失敗:', error);
      setError('載入數據失敗，請稍後重試');
      setResults([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入資料夾數據
  const loadFolders = useCallback(async (forceRefresh = false) => {
    try {
      console.log('🔄 loadFolders 开始加载...', { forceRefresh, timestamp: Date.now() });

      // 添加时间戳参数强制刷新，避免缓存问题
      const timestamp = Date.now();
      const url = forceRefresh ? `/api/folders?t=${timestamp}` : '/api/folders';

      const foldersResponse = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json();
        console.log('📁 资料夹数据:', foldersData);
        const formattedFolders: ResultFolder[] = foldersData.map((folder: any) => ({
          id: folder.id,
          name: folder.name,
          resultCount: folder.resultCount || 0,
          createdAt: folder.createdAt,
          color: folder.color
        }));
        setFolders(formattedFolders);
        console.log('✅ 资料夹状态已更新:', formattedFolders);
      } else {
        console.log('無法載入資料夾，使用空列表');
        setFolders([]);
      }
    } catch (error) {
      console.error('載入資料夾失敗:', error);
      setFolders([]);
    }
  }, []); // 移除 currentFolderId 依赖，因为这个函数不应该依赖当前资料夹

  // 初始載入和资料夹变化时重新加载
  useEffect(() => {
    // 直接在 useEffect 中调用 API，确保使用最新的 currentFolderId
    const loadResultsForFolder = async () => {
      setLoading(true);
      setError(null);

      try {
        const folderId = currentFolderId || 'null';
        const response = await fetch(`/api/results?folderId=${folderId}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          console.error('載入結果失敗:', response.status);
          setResults([]);
        }
      } catch (error) {
        console.error('載入結果錯誤:', error);
        setResults([]);
        setError('載入結果時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    loadResultsForFolder();
    loadFolders();
  }, [currentFolderId]);

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

  // 過濾資料夾
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
          description: null,
          icon: 'folder'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '創建資料夾失敗');
      }

      const createdFolder = await response.json();
      const newFolder: ResultFolder = {
        id: createdFolder.id,
        name: createdFolder.name,
        resultCount: createdFolder.activityCount || 0,
        createdAt: createdFolder.createdAt,
        color: createdFolder.color
      };

      setFolders(prev => [...prev, newFolder]);
      console.log('創建資料夾成功:', newFolder);
    } catch (error) {
      console.error('創建資料夾失敗:', error);
      throw error;
    }
  };

  // 處理回收桶點擊
  const handleRecycleBinClick = () => {
    setShowRecycleBin(true);
  };

  // 處理重命名資料夾
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
        throw new Error('重命名失敗');
      }

      // 重新載入資料夾
      await loadFolders();
    } catch (error) {
      console.error('重命名資料夾失敗:', error);
      throw error;
    }
  };

  // 處理資料夾重命名點擊
  const handleFolderRename = (folder: ResultFolder) => {
    setRenamingFolder(folder);
    setShowRenameFolderModal(true);
  };

  // 處理移動結果到資料夾
  const handleMoveResult = async (resultId: string, folderId: string | null) => {
    console.log('🚀 handleMoveResult 开始:', {
      resultId,
      folderId,
      currentFolderId,
      timestamp: Date.now()
    });

    // 实现乐观更新：立即更新UI状态
    const originalResults = [...results];
    const originalFolders = [...folders];

    try {
      // 乐观更新：立即从当前视图中移除结果
      if (currentFolderId) {
        console.log('🔄 乐观更新：从当前资料夹视图移除结果');
        setResults(prevResults => prevResults.filter(result => result.id !== resultId));
      }

      // 乐观更新：立即更新资料夹计数
      console.log('🔄 乐观更新：更新资料夹计数', {
        currentFolderId,
        targetFolderId: folderId,
        operation: currentFolderId ? '从资料夹减少' : '无',
        targetOperation: folderId ? '向资料夹增加' : '向根目录移动'
      });

      setFolders(prevFolders => {
        const updatedFolders = prevFolders.map(folder => {
          if (folder.id === currentFolderId) {
            // 从当前资料夹减少计数
            const newCount = Math.max(0, folder.resultCount - 1);
            console.log(`📊 资料夹 ${folder.name} 计数: ${folder.resultCount} -> ${newCount}`);
            return { ...folder, resultCount: newCount };
          } else if (folder.id === folderId) {
            // 向目标资料夹增加计数
            const newCount = folder.resultCount + 1;
            console.log(`📊 资料夹 ${folder.name} 计数: ${folder.resultCount} -> ${newCount}`);
            return { ...folder, resultCount: newCount };
          }
          return folder;
        });

        console.log('✅ 乐观更新资料夹计数完成');
        return updatedFolders;
      });

      console.log('✅ 乐观更新完成，开始API调用...');

      const response = await fetch(`/api/results/${resultId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId }),
      });

      if (!response.ok) {
        throw new Error(`移動結果失敗: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ API 调用成功:', responseData);

      // 特殊处理：如果是拖拽到根目录，立即导航回根目录
      if (folderId === null && currentFolderId) {
        console.log('🏠 检测到拖拽到根目录，立即导航回根目录...');

        // 立即导航回根目录
        setCurrentFolderId(null);

        // 强制刷新状态并导航
        setTimeout(async () => {
          console.log('🔄 根目录导航后刷新状态...');
          await Promise.all([loadResults(), loadFolders(true)]);
          forceRefresh();
        }, 50);

        console.log('✅ 結果已成功移動到根目錄並導航回根目錄');
        return; // 提前返回，不执行后续的同步逻辑
      }

      // 🔥 关键修复：不立即覆盖乐观更新，而是延迟同步
      console.log('🔄 API成功，延迟进行服务器数据同步以避免覆盖乐观更新...');

      // 🚨 重要：不立即调用 loadFolders，因为会覆盖乐观更新
      // 只立即同步 results，因为当前视图的结果已经被乐观更新移除了
      await loadResults();

      console.log('✅ 结果数据同步完成，延迟同步资料夹数据...');

      // 延迟同步资料夹数据，给数据库事务足够的时间提交
      setTimeout(() => {
        console.log('🔄 执行延迟资料夹数据同步（避免事务时机问题）...');
        loadFolders(true); // 强制刷新
        forceRefresh();
      }, 500); // 增加延迟时间，确保数据库事务完全提交

      // 第二次保障同步
      setTimeout(() => {
        console.log('🔄 执行第二次资料夹数据同步（最终保障）...');
        loadFolders(true); // 强制刷新
        forceRefresh();
      }, 1000); // 更长的延迟确保数据一致性

      console.log(`✅ 結果已成功移動到${folderId ? '資料夾' : '根目錄'}`);

    } catch (error) {
      console.error('❌ 移動結果失敗，回滚乐观更新:', error);

      // 回滚乐观更新
      setResults(originalResults);
      setFolders(originalFolders);

      // 即使失败也要强制刷新，确保状态一致
      forceRefresh();

      throw error;
    }
  };



  // 處理資料夾選擇（點擊進入資料夾）
  const handleFolderSelect = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  // 處理點擊返回根目錄
  const handleBackToRoot = () => {
    setCurrentFolderId(null);
  };



  // 處理拖拽結果回根目錄
  const handleMoveToRoot = async (resultId: string) => {
    try {
      const response = await fetch(`/api/results/${resultId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId: null })
      });

      if (!response.ok) {
        throw new Error('移動結果失敗');
      }

      // 重新載入結果
      await loadResults();
      console.log('結果已移動到根目錄');
    } catch (error) {
      console.error('移動結果失敗:', error);
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
    <DragDropProvider onMoveResult={handleMoveResult}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 頁面標題和操作按鈕 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* 面包屑导航 */}
            <div className="breadcrumb">
              <button
                onClick={() => handleFolderSelect(null)}
                className={`text-3xl font-bold ${currentFolderId ? 'text-blue-600 hover:text-blue-800' : 'text-gray-900'}`}
              >
                我的結果
              </button>
              {currentFolderId && (
                <>
                  <span className="mx-2 text-2xl text-gray-400">/</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {folders.find(f => f.id === currentFolderId)?.name || '未知資料夾'}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FolderIcon className="w-4 h-4 mr-2" />
              新資料夾
            </button>
            
            <button
              onClick={handleRecycleBinClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
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

      {/* 拖拽到根目录区域 */}
      <DragToRootArea currentFolderId={currentFolderId} onBackToRoot={handleBackToRoot} />

      {/* 內容區域 - 簡化的列表佈局 */}
      <div className="space-y-2">
        {/* 資料夾 - 只在根目录显示 */}
        {!currentFolderId && filteredFolders.map(folder => (
          <DroppableFolderCard
            key={folder.id}
            folder={folder}
            onClick={handleFolderClick}
            onMenuClick={handleFolderMenuClick}
          />
        ))}

        {/* 結果項目 */}
        {filteredAndSortedResults.map(result => (
          <DraggableResultCard
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
          onRename={() => {
            handleFolderRename(contextMenu.folder);
            setContextMenu(null);
          }}
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

      {/* 重命名資料夾模態框 */}
      <RenameFolderModal
        isOpen={showRenameFolderModal}
        folder={renamingFolder}
        onClose={() => {
          setShowRenameFolderModal(false);
          setRenamingFolder(null);
        }}
        onRename={handleRenameFolder}
      />

      {/* 回收桶模態框 */}
      <RecycleBinModal
        isOpen={showRecycleBin}
        onClose={() => setShowRecycleBin(false)}
        onItemRestored={() => {
          // 当项目被恢复时，重新加载数据
          loadResults();
          loadFolders();
        }}
      />
      </div>
    </DragDropProvider>
  );
};

export default WordwallStyleMyResults;
