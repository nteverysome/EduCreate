/**
 * 檔案管理器頁面
 * 提供完整的檔案空間管理功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  parentId?: string;
  isShared: boolean;
  owner: string;
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>(['根目錄']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');

  // 模擬檔案數據
  useEffect(() => {
    const mockFiles: FileItem[] = [
      {
        id: 'folder_1',
        name: '英語學習資料',
        type: 'folder',
        size: 0,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isShared: true,
        owner: 'user1'
      },
      {
        id: 'folder_2',
        name: '遊戲模板',
        type: 'folder',
        size: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isShared: false,
        owner: 'user1'
      },
      {
        id: 'file_1',
        name: '基礎單字配對.json',
        type: 'file',
        size: 2048,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isShared: true,
        owner: 'user1'
      },
      {
        id: 'file_2',
        name: '數學練習活動.json',
        type: 'file',
        size: 1536,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isShared: false,
        owner: 'user1'
      },
      {
        id: 'file_3',
        name: '學習進度報告.pdf',
        type: 'file',
        size: 5120,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isShared: true,
        owner: 'user1'
      }
    ];
    
    setFiles(mockFiles);
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-TW') + ' ' + date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 獲取文件圖標
  const getFileIcon = (item: FileItem): string => {
    if (item.type === 'folder') {
      return item.isShared ? '📁' : '📂';
    }
    
    const extension = item.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'json': return '📄';
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📗';
      case 'ppt':
      case 'pptx': return '📙';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬';
      case 'mp3':
      case 'wav': return '🎵';
      default: return '📄';
    }
  };

  // 切換選擇
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // 全選/取消全選
  const toggleSelectAll = () => {
    if (selectedItems.length === files.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(files.map(file => file.id));
    }
  };

  // 排序文件
  const sortedFiles = [...files].sort((a, b) => {
    // 文件夾優先
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return b.modifiedAt.getTime() - a.modifiedAt.getTime();
      case 'size':
        return b.size - a.size;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      {/* 頁面內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="file-manager-title">
            檔案管理器
          </h1>
          <p className="text-gray-600" data-testid="file-manager-description">
            管理您的學習資料和遊戲模板
          </p>
        </div>

        {/* 工具欄 */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* 路徑導航 */}
              <div className="flex items-center space-x-2" data-testid="breadcrumb">
                {currentPath.map((path, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-400">/</span>}
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      {path}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* 工具按鈕 */}
              <div className="flex items-center space-x-4">
                {/* 排序選擇 */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="sort-select"
                >
                  <option value="name">按名稱排序</option>
                  <option value="date">按日期排序</option>
                  <option value="size">按大小排序</option>
                </select>

                {/* 視圖模式 */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    data-testid="list-view-button"
                  >
                    列表
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm border-l border-gray-300 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    data-testid="grid-view-button"
                  >
                    網格
                  </button>
                </div>

                {/* 新建按鈕 */}
                <button
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  data-testid="create-folder-button"
                >
                  新建檔案夾
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 檔案列表 */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* 列表標題 */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === files.length && files.length > 0}
                onChange={toggleSelectAll}
                className="mr-4"
                data-testid="select-all-checkbox"
              />
              <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-6">名稱</div>
                <div className="col-span-2">大小</div>
                <div className="col-span-2">修改時間</div>
                <div className="col-span-1">分享</div>
                <div className="col-span-1">操作</div>
              </div>
            </div>
          </div>

          {/* 檔案項目 */}
          <div className="divide-y divide-gray-200">
            {sortedFiles.map((item) => (
              <div
                key={item.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                }`}
                data-testid={`file-item-${item.id}`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="mr-4"
                    data-testid={`checkbox-${item.id}`}
                  />
                  
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* 名稱 */}
                    <div className="col-span-6 flex items-center">
                      <span className="text-2xl mr-3">{getFileIcon(item)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.type === 'folder' && (
                          <div className="text-sm text-gray-500">檔案夾</div>
                        )}
                      </div>
                    </div>

                    {/* 大小 */}
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatFileSize(item.size)}
                    </div>

                    {/* 修改時間 */}
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatDate(item.modifiedAt)}
                    </div>

                    {/* 分享狀態 */}
                    <div className="col-span-1">
                      {item.isShared ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          已分享
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          私人
                        </span>
                      )}
                    </div>

                    {/* 操作 */}
                    <div className="col-span-1">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        data-testid={`menu-${item.id}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 空狀態 */}
          {files.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">檔案夾為空</h3>
              <p className="text-gray-600">開始上傳檔案或創建檔案夾</p>
            </div>
          )}
        </div>

        {/* 檔案統計 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">檔案統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{files.filter(f => f.type === 'folder').length}</div>
              <div className="text-sm text-gray-600">檔案夾</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{files.filter(f => f.type === 'file').length}</div>
              <div className="text-sm text-gray-600">檔案</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{files.filter(f => f.isShared).length}</div>
              <div className="text-sm text-gray-600">已分享</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
              </div>
              <div className="text-sm text-gray-600">總大小</div>
            </div>
          </div>
        </div>

        {/* 返回導航 */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            data-testid="back-to-dashboard"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            返回功能儀表板
          </Link>
        </div>
      </div>
    </div>
  );
}
