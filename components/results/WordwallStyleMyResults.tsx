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
import RenameResultModal from './RenameResultModal';
import ResultContextMenu from './ResultContextMenu';
import SetDeadlineModal from './SetDeadlineModal';
import ShareResultModal from './ShareResultModal';
import StudentShareLinkModal from './StudentShareLinkModal';
import QRCodeModal from './QRCodeModal';
import MoveToFolderModal from './MoveToFolderModal';
import MoveFolderModal from './MoveFolderModal';
import EditFolderColorModal from './EditFolderColorModal';
import { folderApi, FolderData } from '../../lib/api/folderApiManager';


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
  const [currentFolder, setCurrentFolder] = useState<ResultFolder | null>(null); // 🆕 當前資料夾信息
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'deadline' | 'name'>('created');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<ResultFolder | null>(null);
  // const [activeId, setActiveId] = useState<string | null>(null);



  // 菜单和删除相关状态
  const [contextMenu, setContextMenu] = useState<{
    folder: ResultFolder;
    x: number;
    y: number;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<ResultFolder | null>(null);

  // 结果菜单和重命名相关状态
  const [resultContextMenu, setResultContextMenu] = useState<{
    result: AssignmentResult;
    x: number;
    y: number;
  } | null>(null);
  const [showRenameResultModal, setShowRenameResultModal] = useState(false);
  const [resultToRename, setResultToRename] = useState<AssignmentResult | null>(null);

  // 设置截止日期相关状态
  const [showSetDeadlineModal, setShowSetDeadlineModal] = useState(false);
  const [resultToSetDeadline, setResultToSetDeadline] = useState<AssignmentResult | null>(null);

  // 分享结果相关状态
  const [showShareResultModal, setShowShareResultModal] = useState(false);
  const [resultToShare, setResultToShare] = useState<AssignmentResult | null>(null);

  // 學生分享連結相關狀態
  const [showStudentShareLinkModal, setShowStudentShareLinkModal] = useState(false);
  const [resultToStudentShare, setResultToStudentShare] = useState<AssignmentResult | null>(null);

  // QR Code 相關狀態
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [resultToShowQRCode, setResultToShowQRCode] = useState<AssignmentResult | null>(null);

  // 移動到資料夾相關狀態
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [resultToMove, setResultToMove] = useState<AssignmentResult | null>(null);

  // 移動資料夾相關狀態
  const [showMoveFolderModal, setShowMoveFolderModal] = useState(false);
  const [folderToMove, setFolderToMove] = useState<ResultFolder | null>(null);

  // 變更資料夾顏色相關狀態
  const [showEditFolderColorModal, setShowEditFolderColorModal] = useState(false);
  const [folderToEditColor, setFolderToEditColor] = useState<ResultFolder | null>(null);





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

      // 🚀 移除資料夾載入邏輯，使用專門的 loadFolders() 函數
      // 這樣確保資料夾載入時使用正確的 type=results 參數
    } catch (error) {
      console.error('載入數據失敗:', error);
      setError('載入數據失敗，請稍後重試');
      setResults([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 載入資料夾數據 - 使用统一的 API 管理器
  const loadFolders = useCallback(async () => {
    try {
      console.log('🔍 [DEBUG] loadFolders 被调用 - 使用统一 API 管理器');
      console.log('🔍 [DEBUG] 调用堆栈:', new Error().stack);

      // 🚀 使用统一的 API 管理器，确保类型安全
      const foldersData = await folderApi.getFolders('results');
      console.log('🔍 [DEBUG] 统一 API 管理器响应数据:', foldersData);

      setFolders(foldersData.map((folder: FolderData) => ({
        id: folder.id,
        name: folder.name,
        resultCount: folder.resultCount || 0,
        createdAt: folder.createdAt,
        color: folder.color
      })));
    } catch (error) {
      console.error('❌ 載入資料夾失敗:', error);
      setFolders([]);
    }
  }, []);

  // 🆕 載入當前資料夾信息（用於麵包屑導航）
  const loadCurrentFolder = useCallback(async () => {
    if (!currentFolderId) {
      setCurrentFolder(null);
      return;
    }

    try {
      const response = await fetch(`/api/folders/${currentFolderId}`);
      if (response.ok) {
        const folderData = await response.json();
        setCurrentFolder({
          id: folderData.id,
          name: folderData.name,
          resultCount: folderData.resultCount || 0,
          createdAt: folderData.createdAt,
          color: folderData.color
        });
        console.log('📂 載入當前資料夾信息:', folderData.name);
      }
    } catch (error) {
      console.error('載入當前資料夾信息失敗:', error);
    }
  }, [currentFolderId]);

  // 🆕 從 URL 參數初始化 currentFolderId
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderIdFromUrl = urlParams.get('folderId');
    if (folderIdFromUrl) {
      console.log('📂 從 URL 參數設置資料夾 ID:', folderIdFromUrl);
      setCurrentFolderId(folderIdFromUrl);
    }
  }, []);

  // 🔍 全局 fetch 拦截器（仅用于调试）
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      if (typeof url === 'string' && url.includes('/api/folders')) {
        console.log('🔍 [FETCH INTERCEPTOR] API 调用被拦截:', url);
        console.log('🔍 [FETCH INTERCEPTOR] 方法:', options?.method || 'GET');
        console.log('🔍 [FETCH INTERCEPTOR] 调用堆栈:', new Error().stack);
      }
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // 初始化时加载资料夹数据（只执行一次）
  useEffect(() => {
    console.log('🚀 初始化加载资料夹数据...');
    loadFolders();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 🆕 當 currentFolderId 改變時載入當前資料夾信息
  useEffect(() => {
    loadCurrentFolder();
  }, [currentFolderId, loadCurrentFolder]);

  // 资料夹变化时重新加载结果数据
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
    // 🔥 关键修复：不在这里调用 loadFolders()，避免覆盖乐观更新
    // loadFolders(); // ❌ 移除这个调用，它会覆盖乐观更新
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

  // 處理創建新資料夾 - 使用统一的 API 管理器
  const handleCreateFolder = async (name: string, color: string) => {
    try {
      // 🚀 使用统一的 API 管理器
      const createdFolder = await folderApi.createFolder('results', {
        name,
        color,
        description: '',
        icon: 'folder'
      });

      const newFolder: ResultFolder = {
        id: createdFolder.id,
        name: createdFolder.name,
        resultCount: createdFolder.resultCount || 0,
        createdAt: createdFolder.createdAt,
        color: createdFolder.color
      };

      setFolders(prev => [...prev, newFolder]);
      console.log('✅ 創建資料夾成功:', newFolder);
    } catch (error) {
      console.error('❌ 創建資料夾失敗:', error);
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

  // 處理移動資料夾
  const handleMoveFolder = async (folderId: string, targetParentId: string | null) => {
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

      // 重新載入資料夾
      await loadFolders();
      await loadCurrentFolder();
    } catch (error) {
      console.error('移動資料夾失敗:', error);
      throw error;
    }
  };

  // 處理資料夾移動點擊
  const handleFolderMove = (folder: ResultFolder) => {
    setFolderToMove(folder);
    setShowMoveFolderModal(true);
  };

  // 處理變更資料夾顏色
  const handleUpdateFolderColor = async (folderId: string, color: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color }),
      });

      if (!response.ok) {
        throw new Error('變更顏色失敗');
      }

      // 重新載入資料夾
      await loadFolders();
      await loadCurrentFolder();
    } catch (error) {
      console.error('變更資料夾顏色失敗:', error);
      throw error;
    }
  };

  // 處理資料夾顏色變更點擊
  const handleFolderChangeColor = (folder: ResultFolder) => {
    setFolderToEditColor(folder);
    setShowEditFolderColorModal(true);
  };

  // 處理結果重命名
  const handleRenameResult = async (resultId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/results/${resultId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('重命名失敗');
      }

      // 重新載入結果數據
      await loadResults();
    } catch (error) {
      console.error('重命名結果失敗:', error);
      throw error;
    }
  };

  // 處理結果重命名點擊
  const handleResultRename = (result: AssignmentResult) => {
    setResultToRename(result);
    setShowRenameResultModal(true);
  };

  // 處理結果菜單點擊
  const handleResultMenuClick = (result: AssignmentResult, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setResultContextMenu({
      result,
      x: event.clientX,
      y: event.clientY
    });
  };

  // 關閉結果菜單
  const handleCloseResultContextMenu = () => {
    setResultContextMenu(null);
  };

  // 處理查看結果詳情
  const handleViewResult = (result: AssignmentResult) => {
    window.open(`/my-results/${result.id}`, '_blank');
  };

  // 處理刪除結果
  const handleDeleteResult = async (result: AssignmentResult) => {
    const confirmed = window.confirm(`確定要刪除結果「${result.title}」嗎？\n\n此操作無法復原。`);

    if (!confirmed) return;

    try {
      console.log('🗑️ 刪除結果:', result);

      const response = await fetch(`/api/results/${result.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刪除結果失敗');
      }

      // 刪除成功，重新加載結果列表
      await loadResults();

      console.log('✅ 結果刪除成功');

      // 可以添加成功提示
      // toast.success('結果已成功刪除');

    } catch (error) {
      console.error('❌ 刪除結果失敗:', error);
      alert(`刪除失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  // 處理設置截止日期
  const handleSetDeadline = async (assignmentId: string, deadline: string | null) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/deadline`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deadline }),
      });

      if (!response.ok) {
        throw new Error('設置截止日期失敗');
      }

      // 重新載入結果數據以更新狀態
      await loadResults();
    } catch (error) {
      console.error('設置截止日期失敗:', error);
      throw error;
    }
  };

  // 處理結果設置截止日期點擊
  const handleResultSetDeadline = (result: AssignmentResult) => {
    setResultToSetDeadline(result);
    setShowSetDeadlineModal(true);
  };

  // 處理分享結果點擊
  const handleShareResult = (result: AssignmentResult) => {
    setResultToShare(result);
    setShowShareResultModal(true);
  };

  // 處理學生分享連結點擊
  const handleStudentShareLink = (result: AssignmentResult) => {
    setResultToStudentShare(result);
    setShowStudentShareLinkModal(true);
  };

  // 處理 QR Code 點擊
  const handleQRCode = (result: AssignmentResult) => {
    setResultToShowQRCode(result);
    setShowQRCodeModal(true);
  };

  // 處理移動結果到資料夾 - 支持模態框
  const handleMoveResult = async (resultId: string, folderId: string | null) => {
    // 如果是特殊標識，打開移動模態框
    if (folderId === 'OPEN_MODAL') {
      const result = results.find(r => r.id === resultId);
      if (result) {
        setResultToMove(result);
        setShowMoveToFolderModal(true);
      }
      return;
    }

    // 執行實際的移動操作
    try {
      console.log('📁 將結果移動到資料夾:', { resultId, folderId });

      const response = await fetch(`/api/results/${resultId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '移動結果失敗');
      }

      console.log('✅ 結果移動成功');

      // 🚀 簡單方案：重新載入所有數據（與 /my-activities 一致）
      await loadResults();
      await loadFolders();

    } catch (error: any) {
      console.error('❌ 移動結果失敗:', error);
      alert(`移動結果失敗: ${error.message}`);
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

  // 確認刪除資料夾 - 使用统一的 API 管理器
  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;

    try {
      console.log('🔍 [DEBUG] 开始删除资料夹:', folderToDelete.name);

      // 🚀 使用统一的 API 管理器
      await folderApi.deleteFolder(folderToDelete.id);

      console.log('🔍 [DEBUG] 统一 API 管理器删除成功，开始重新加载数据');

      // 🚀 重新載入所有數據以確保狀態同步
      console.log('🔍 [DEBUG] 调用 loadResults()');
      await loadResults();

      console.log('🔍 [DEBUG] 调用 loadFolders()');
      await loadFolders();

      console.log('✅ [DEBUG] 資料夾刪除成功:', folderToDelete.name);
    } catch (error) {
      console.error('❌ [DEBUG] 刪除資料夾失敗:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* 頁面標題和操作按鈕 */}
      <div className="mb-6 sm:mb-8">
        {/* 標題和按鈕 - 響應式佈局 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* 面包屑导航 */}
          <div className="breadcrumb">
            <button
              onClick={() => handleFolderSelect(null)}
              className={`text-2xl sm:text-3xl font-bold ${currentFolderId ? 'text-blue-600 hover:text-blue-800' : 'text-gray-900'}`}
            >
              我的結果
            </button>
            {currentFolderId && (
              <>
                <span className="mx-2 text-xl sm:text-2xl text-gray-400">/</span>
                <span className="text-xl sm:text-3xl font-bold text-gray-900">
                  {currentFolder?.name || '載入中...'}
                </span>
              </>
            )}
          </div>

          {/* 操作按鈕區域 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button
              onClick={handleRecycleBinClick}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <TrashIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">回收箱</span>
            </button>

            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜尋..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 排序選項 - 響應式 */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
          <span className="text-gray-500 text-xs sm:text-sm">訂購者：</span>
          <button
            onClick={() => setSortBy('created')}
            className={`flex items-center space-x-1 text-xs sm:text-sm ${
              sortBy === 'created' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <span>創建</span>
            <span className="text-xs">▼</span>
          </button>
          <button
            onClick={() => setSortBy('deadline')}
            className={`flex items-center space-x-1 text-xs sm:text-sm ${
              sortBy === 'deadline' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <span>最後期限</span>
            <span className="text-xs">▼</span>
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`flex items-center space-x-1 text-xs sm:text-sm ${
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

      {/* 資料夾區域 - 獨立的橫向滾動（參考我的活動頁面） */}
      {!currentFolderId && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          {/* 新增資料夾按鈕 */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="folder-card bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <FolderIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
            <span className="text-sm text-gray-600 group-hover:text-blue-600">新增資料夾</span>
          </button>

          {/* 現有資料夾 */}
          {filteredFolders.map(folder => (
            <DroppableFolderCard
              key={folder.id}
              folder={folder}
              onClick={handleFolderClick}
              onMenuClick={handleFolderMenuClick}
            />
          ))}
        </div>
      )}

      {/* 結果網格 - 5列（參考我的活動頁面） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* 結果項目 */}
        {filteredAndSortedResults.map(result => (
          <WordwallStyleResultCard
            key={result.id}
            result={result}
            onClick={handleResultClick}
            onMenuClick={handleResultMenuClick}
          />
        ))}

        {/* 空狀態 */}
        {filteredAndSortedResults.length === 0 && folders.length === 0 && (
          <div className="col-span-full text-center py-12">
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
          onMove={() => {
            handleFolderMove(contextMenu.folder);
            setContextMenu(null);
          }}
          onChangeColor={() => {
            handleFolderChangeColor(contextMenu.folder);
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

      {/* 結果右鍵菜單 */}
      {resultContextMenu && (
        <ResultContextMenu
          result={resultContextMenu.result}
          x={resultContextMenu.x}
          y={resultContextMenu.y}
          onClose={handleCloseResultContextMenu}
          onRename={() => {
            handleResultRename(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onSetDeadline={() => {
            handleResultSetDeadline(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onShareLink={() => {
            handleShareResult(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onStudentShareLink={() => {
            handleStudentShareLink(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onQRCode={() => {
            handleQRCode(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onDelete={() => {
            handleDeleteResult(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onView={() => {
            handleViewResult(resultContextMenu.result);
            setResultContextMenu(null);
          }}
          onMove={(folderId) => {
            handleMoveResult(resultContextMenu.result.id, folderId);
            setResultContextMenu(null);
          }}
          folders={folders}
        />
      )}

      {/* 重命名結果模態框 */}
      <RenameResultModal
        isOpen={showRenameResultModal}
        result={resultToRename}
        onClose={() => {
          setShowRenameResultModal(false);
          setResultToRename(null);
        }}
        onRename={handleRenameResult}
      />

      {/* 設置截止日期模態框 */}
      <SetDeadlineModal
        isOpen={showSetDeadlineModal}
        result={resultToSetDeadline}
        onClose={() => {
          setShowSetDeadlineModal(false);
          setResultToSetDeadline(null);
        }}
        onDeadlineSet={handleSetDeadline}
      />

      {/* 分享結果模態框 */}
      {resultToShare && (
        <ShareResultModal
          result={resultToShare}
          isOpen={showShareResultModal}
          onClose={() => {
            setShowShareResultModal(false);
            setResultToShare(null);
          }}
        />
      )}

      {/* 學生分享連結模態框 */}
      {resultToStudentShare && (
        <StudentShareLinkModal
          result={resultToStudentShare}
          isOpen={showStudentShareLinkModal}
          onClose={() => {
            setShowStudentShareLinkModal(false);
            setResultToStudentShare(null);
          }}
        />
      )}

      {/* QR Code 模態框 */}
      {resultToShowQRCode && (
        <QRCodeModal
          result={resultToShowQRCode}
          isOpen={showQRCodeModal}
          onClose={() => {
            setShowQRCodeModal(false);
            setResultToShowQRCode(null);
          }}
        />
      )}

      {/* 移動到資料夾模態框 */}
      {resultToMove && (
        <MoveToFolderModal
          result={resultToMove}
          folders={folders}
          isOpen={showMoveToFolderModal}
          onClose={() => {
            setShowMoveToFolderModal(false);
            setResultToMove(null);
          }}
          onMove={(folderId) => {
            handleMoveResult(resultToMove.id, folderId);
            setShowMoveToFolderModal(false);
            setResultToMove(null);
          }}
        />
      )}

      {/* 移動資料夾模態框 */}
      <MoveFolderModal
        isOpen={showMoveFolderModal}
        folder={folderToMove}
        currentFolderId={currentFolderId}
        onClose={() => {
          setShowMoveFolderModal(false);
          setFolderToMove(null);
        }}
        onMoveFolder={handleMoveFolder}
      />

      {/* 變更資料夾顏色模態框 */}
      <EditFolderColorModal
        isOpen={showEditFolderColorModal}
        folder={folderToEditColor}
        onClose={() => {
          setShowEditFolderColorModal(false);
          setFolderToEditColor(null);
        }}
        onUpdateColor={handleUpdateFolderColor}
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
