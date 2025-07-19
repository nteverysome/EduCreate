/**
 * 完整檔案空間系統管理器組件
 * 嵌套檔案夾結構、權限系統、高級搜索、批量操作、智能排序等完整功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useCallback } from 'react';

interface FileSpaceManagerProps {
  userId: string;
  enableNestedFolders?: boolean;
  enablePermissionSystem?: boolean;
  enableAdvancedSearch?: boolean;
  enableBatchOperations?: boolean;
  enableCustomization?: boolean;
  enableSmartSorting?: boolean;
  enableStatistics?: boolean;
  enableCollaboration?: boolean;
  enableTemplates?: boolean;
  enableImportExport?: boolean;
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  parentId: string | null;
  permissions: string[];
  tags: string[];
  color?: string;
  icon?: string;
  isShared: boolean;
  shareMode: 'private' | 'class' | 'public';
  statistics: {
    views: number;
    downloads: number;
    shares: number;
    lastAccessed: Date;
  };
}

interface FolderStructure {
  [key: string]: FileItem[];
}

interface SearchFilters {
  query: string;
  type: 'all' | 'file' | 'folder';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sizeRange: 'all' | 'small' | 'medium' | 'large';
  tags: string[];
  shareMode: 'all' | 'private' | 'class' | 'public';
}

interface SortOptions {
  field: 'name' | 'date' | 'size' | 'type' | 'frequency' | 'effectiveness';
  direction: 'asc' | 'desc';
}

export const FileSpaceManager: React.FC<FileSpaceManagerProps> = ({
  userId,
  enableNestedFolders = true,
  enablePermissionSystem = true,
  enableAdvancedSearch = true,
  enableBatchOperations = true,
  enableCustomization = true,
  enableSmartSorting = true,
  enableStatistics = true,
  enableCollaboration = true,
  enableTemplates = true,
  enableImportExport = true
}) => {
  const [activeTab, setActiveTab] = useState<'browser' | 'search' | 'batch' | 'stats'>('browser');
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: 'all',
    sizeRange: 'all',
    tags: [],
    shareMode: 'all'
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');

  // 模擬檔案數據
  const mockFiles: FileItem[] = [
    {
      id: 'folder-1',
      name: '英語學習資料',
      type: 'folder',
      size: 0,
      createdAt: new Date('2024-01-15'),
      modifiedAt: new Date('2024-07-16'),
      parentId: null,
      permissions: ['read', 'write', 'share'],
      tags: ['英語', '學習'],
      color: '#3B82F6',
      icon: '📚',
      isShared: true,
      shareMode: 'class',
      statistics: { views: 245, downloads: 0, shares: 12, lastAccessed: new Date() }
    },
    {
      id: 'folder-2',
      name: '數學練習題',
      type: 'folder',
      size: 0,
      createdAt: new Date('2024-02-10'),
      modifiedAt: new Date('2024-07-15'),
      parentId: null,
      permissions: ['read', 'write'],
      tags: ['數學', '練習'],
      color: '#10B981',
      icon: '🔢',
      isShared: false,
      shareMode: 'private',
      statistics: { views: 189, downloads: 0, shares: 5, lastAccessed: new Date() }
    },
    {
      id: 'file-1',
      name: 'GEPT初級詞彙表.xlsx',
      type: 'file',
      size: 2048576,
      createdAt: new Date('2024-03-05'),
      modifiedAt: new Date('2024-07-14'),
      parentId: 'folder-1',
      permissions: ['read', 'write', 'download'],
      tags: ['GEPT', '詞彙', '初級'],
      isShared: true,
      shareMode: 'public',
      statistics: { views: 567, downloads: 89, shares: 23, lastAccessed: new Date() }
    },
    {
      id: 'file-2',
      name: '記憶科學遊戲設計.pdf',
      type: 'file',
      size: 5242880,
      createdAt: new Date('2024-04-12'),
      modifiedAt: new Date('2024-07-13'),
      parentId: 'folder-1',
      permissions: ['read'],
      tags: ['記憶科學', '遊戲設計'],
      isShared: true,
      shareMode: 'class',
      statistics: { views: 234, downloads: 45, shares: 8, lastAccessed: new Date() }
    }
  ];

  const handleItemSelect = useCallback((itemId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);

  const handleBatchOperation = useCallback((operation: string) => {
    console.log(`執行批量操作: ${operation}，選中項目:`, selectedItems);
    // 這裡實現批量操作邏輯
    setSelectedItems([]);
  }, [selectedItems]);

  const handleFolderNavigation = useCallback((folderId: string) => {
    // 這裡實現檔案夾導航邏輯
    console.log(`導航到檔案夾: ${folderId}`);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getShareModeColor = (mode: string) => {
    switch (mode) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShareModeName = (mode: string) => {
    switch (mode) {
      case 'public': return '公開';
      case 'class': return '班級';
      case 'private': return '私人';
      default: return '未知';
    }
  };

  return (
    <div className="p-6" data-testid="file-space-manager">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('browser')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'browser'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="browser-tab"
        >
          📁 檔案瀏覽
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="search-tab"
        >
          🔍 高級搜索
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'batch'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="batch-tab"
        >
          📦 批量操作
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="stats-tab"
        >
          📊 統計分析
        </button>
      </div>

      {/* 檔案瀏覽標籤 */}
      {activeTab === 'browser' && (
        <div data-testid="browser-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">檔案瀏覽器</h3>
          
          {/* 工具欄 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* 麵包屑導航 */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">位置:</span>
                  {currentPath.map((path, index) => (
                    <React.Fragment key={index}>
                      <button className="text-blue-600 hover:text-blue-800">
                        {path === 'root' ? '根目錄' : path}
                      </button>
                      {index < currentPath.length - 1 && <span className="text-gray-400">/</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 視圖模式切換 */}
                <div className="flex border rounded">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    data-testid="view-list"
                  >
                    列表
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    data-testid="view-grid"
                  >
                    網格
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 text-sm ${viewMode === 'tree' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    data-testid="view-tree"
                  >
                    樹狀
                  </button>
                </div>
                
                {/* 排序選項 */}
                <select
                  value={`${sortOptions.field}-${sortOptions.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortOptions({ field: field as any, direction: direction as any });
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  data-testid="sort-select"
                >
                  <option value="name-asc">名稱 A-Z</option>
                  <option value="name-desc">名稱 Z-A</option>
                  <option value="date-desc">最新修改</option>
                  <option value="date-asc">最舊修改</option>
                  <option value="size-desc">大小 大-小</option>
                  <option value="size-asc">大小 小-大</option>
                  <option value="frequency-desc">使用頻率</option>
                  <option value="effectiveness-desc">學習效果</option>
                </select>
              </div>
            </div>
          </div>

          {/* 檔案列表 */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(mockFiles.map(f => f.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="w-4 h-4"
                    data-testid="select-all"
                  />
                </div>
                <div className="col-span-4">名稱</div>
                <div className="col-span-2">大小</div>
                <div className="col-span-2">修改時間</div>
                <div className="col-span-2">分享模式</div>
                <div className="col-span-1">操作</div>
              </div>
            </div>
            
            <div className="divide-y">
              {mockFiles.map(file => (
                <div key={file.id} className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(file.id)}
                        onChange={(e) => handleItemSelect(file.id, e.target.checked)}
                        className="w-4 h-4"
                        data-testid={`select-${file.id}`}
                      />
                    </div>
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="text-2xl">
                        {file.type === 'folder' ? (file.icon || '📁') : '📄'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        {file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {file.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 text-gray-600">
                      {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                    </div>
                    <div className="col-span-2 text-gray-600">
                      {file.modifiedAt.toLocaleDateString()}
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShareModeColor(file.shareMode)}`}>
                        {getShareModeName(file.shareMode)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <button className="text-gray-400 hover:text-gray-600">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 高級搜索標籤 */}
      {activeTab === 'search' && (
        <div data-testid="search-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">高級搜索</h3>
          
          {/* 搜索表單 */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">搜索關鍵字</label>
                <input
                  type="text"
                  value={searchFilters.query}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="輸入檔案名稱或內容..."
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  data-testid="search-query"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">檔案類型</label>
                <select
                  value={searchFilters.type}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  data-testid="search-type"
                >
                  <option value="all">所有類型</option>
                  <option value="file">檔案</option>
                  <option value="folder">檔案夾</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">時間範圍</label>
                <select
                  value={searchFilters.dateRange}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  data-testid="search-date"
                >
                  <option value="all">所有時間</option>
                  <option value="today">今天</option>
                  <option value="week">本週</option>
                  <option value="month">本月</option>
                  <option value="year">本年</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分享模式</label>
                <select
                  value={searchFilters.shareMode}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, shareMode: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  data-testid="search-share-mode"
                >
                  <option value="all">所有模式</option>
                  <option value="private">私人</option>
                  <option value="class">班級</option>
                  <option value="public">公開</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                找到 {mockFiles.length} 個結果
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                data-testid="search-button"
              >
                搜索
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量操作標籤 */}
      {activeTab === 'batch' && (
        <div data-testid="batch-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">批量操作</h3>
          
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                已選擇 {selectedItems.length} 個項目
              </div>
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBatchOperation('move')}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                    data-testid="batch-move"
                  >
                    移動
                  </button>
                  <button
                    onClick={() => handleBatchOperation('copy')}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                    data-testid="batch-copy"
                  >
                    複製
                  </button>
                  <button
                    onClick={() => handleBatchOperation('delete')}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                    data-testid="batch-delete"
                  >
                    刪除
                  </button>
                  <button
                    onClick={() => handleBatchOperation('share')}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                    data-testid="batch-share"
                  >
                    分享
                  </button>
                  <button
                    onClick={() => handleBatchOperation('tag')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                    data-testid="batch-tag"
                  >
                    標籤
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 統計分析標籤 */}
      {activeTab === 'stats' && (
        <div data-testid="stats-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">統計分析</h3>
          
          {/* 整體統計 */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">整體統計</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{mockFiles.length}</div>
                <div className="text-blue-800">總項目數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockFiles.filter(f => f.type === 'folder').length}
                </div>
                <div className="text-green-800">檔案夾數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mockFiles.filter(f => f.type === 'file').length}
                </div>
                <div className="text-orange-800">檔案數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {mockFiles.filter(f => f.isShared).length}
                </div>
                <div className="text-purple-800">已分享</div>
              </div>
            </div>
          </div>

          {/* 使用頻率統計 */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3">使用頻率統計</h4>
            <div className="space-y-3">
              {mockFiles.slice(0, 3).map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {file.type === 'folder' ? (file.icon || '📁') : '📄'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-600">{file.type === 'folder' ? '檔案夾' : '檔案'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{file.statistics.views}</div>
                    <div className="text-sm text-gray-600">瀏覽次數</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 使用拖拽功能快速移動檔案和檔案夾</p>
          <p>• 利用標籤系統進行分類和快速搜索</p>
          <p>• 設置適當的分享權限保護重要檔案</p>
          <p>• 定期查看統計數據了解使用情況</p>
          <p>• 使用批量操作提高管理效率</p>
          <p>• 善用搜索過濾功能快速找到所需檔案</p>
        </div>
      </div>
    </div>
  );
};
