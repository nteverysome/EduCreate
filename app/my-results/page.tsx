'use client';

import React, { useState, useEffect } from 'react';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import { 
  FolderIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  folderId?: string;
}

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
}

export default function MyResultsPage() {
  const [results, setResults] = useState<AssignmentResult[]>([]);
  const [folders, setFolders] = useState<ResultFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'deadline' | 'name'>('created');
  const [loading, setLoading] = useState(true);

  // 模擬數據載入
  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬結果數據
      const mockResults: AssignmentResult[] = [
        {
          id: '1',
          title: '"國小南一三年級英文第2課"的結果3',
          activityName: '國小南一三年級英文第2課',
          participantCount: 0,
          createdAt: '2025-10-13T00:52:00Z',
          status: 'active'
        },
        {
          id: '2', 
          title: '"國小南一三年級英文第2課"的結果2',
          activityName: '國小南一三年級英文第2課',
          participantCount: 0,
          createdAt: '2025-10-13T00:51:00Z',
          status: 'active'
        },
        {
          id: '3',
          title: '"複製無標題43"的結果1',
          activityName: '複製無標題43',
          participantCount: 1,
          createdAt: '2025-10-13T00:10:00Z',
          status: 'active'
        }
      ];

      const mockFolders: ResultFolder[] = [
        {
          id: 'folder1',
          name: '三年級上學期英文',
          resultCount: 0,
          createdAt: '2025-10-12T00:00:00Z'
        }
      ];

      setResults(mockResults);
      setFolders(mockFolders);
      setLoading(false);
    };

    loadResults();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">載入中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題和操作按鈕 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">我的結果</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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

        {/* 內容區域 */}
        <div className="space-y-4">
          {/* 資料夾 */}
          {folders.map(folder => (
            <div
              key={folder.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="w-8 h-8 text-blue-500 mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{folder.name}</h3>
                    <p className="text-sm text-gray-500">{folder.resultCount}結果</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}

          {/* 結果項目 */}
          {filteredAndSortedResults.map(result => (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{result.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span>{result.participantCount}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{formatDateTime(result.createdAt)} – 無截止日期</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}

          {/* 空狀態 */}
          {filteredAndSortedResults.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">尚無結果</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? '沒有找到符合搜尋條件的結果' : '開始創建課業分配來收集學生結果'}
              </p>
              {!searchQuery && (
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  創建第一個活動
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
