/**
 * EnhancedVersionManager - 增強的版本管理組件
 * 提供版本歷史、比較、回滾、分支管理等高級功能
 */
import React, { useState, useCallback, useEffect } from 'react';

export interface VersionInfo {
  id: string;
  version: string;
  content: any;
  timestamp: number;
  userId: string;
  userName: string;
  changes: ChangeInfo[];
  checksum: string;
  parentVersion?: string;
  branchName?: string;
  tags: string[];
  description?: string;
  size: number;
}

export interface ChangeInfo {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'rename';
  path: string;
  oldValue?: any;
  newValue?: any;
  timestamp: number;
  userId: string;
}

export interface VersionComparison {
  sourceVersion: VersionInfo;
  targetVersion: VersionInfo;
  differences: VersionDifference[];
  summary: {
    totalChanges: number;
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface VersionDifference {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface EnhancedVersionManagerProps {
  versions: VersionInfo[];
  currentVersion?: string;
  onVersionRestore?: (versionId: string) => void;
  onVersionCompare?: (sourceId: string, targetId: string) => void;
  onVersionCreate?: (description: string, tags: string[]) => void;
  onVersionDelete?: (versionId: string) => void;
  readOnly?: boolean;
  className?: string;
  'data-testid'?: string;
}

const EnhancedVersionManager = ({
  versions,
  currentVersion,
  onVersionRestore,
  onVersionCompare,
  onVersionCreate,
  onVersionDelete,
  readOnly = false,
  className = '',
  'data-testid': testId = 'enhanced-version-manager'
}: EnhancedVersionManagerProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'compare' | 'branches'>('history');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newVersionTags, setNewVersionTags] = useState<string[]>([]);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  // 獲取所有分支
  const branches = Array.from(new Set(versions.map(v => v.branchName || 'main')));
  
  // 獲取所有用戶
  const users = Array.from(new Set(versions.map(v => v.userName)));

  // 過濾版本
  const filteredVersions = versions.filter(version => {
    const branchMatch = filterBranch === 'all' || version.branchName === filterBranch;
    const userMatch = filterUser === 'all' || version.userName === filterUser;
    return branchMatch && userMatch;
  });

  // 格式化時間
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
    return new Date(timestamp).toLocaleDateString();
  };

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 獲取變更類型圖標
  const getChangeTypeIcon = (type: string): string => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'move': return '📁';
      case 'rename': return '🏷️';
      default: return '📝';
    }
  };

  // 獲取變更類型顏色
  const getChangeTypeColor = (type: string): string => {
    switch (type) {
      case 'create': return 'text-green-600 bg-green-100';
      case 'update': return 'text-blue-600 bg-blue-100';
      case 'delete': return 'text-red-600 bg-red-100';
      case 'move': return 'text-purple-600 bg-purple-100';
      case 'rename': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 處理版本選擇
  const handleVersionSelect = useCallback((versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId]; // 保持最多選擇2個版本
      }
    });
  }, []);

  // 切換版本詳情展開
  const toggleVersionExpanded = useCallback((versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  }, []);

  // 處理版本比較
  const handleCompare = useCallback(() => {
    if (selectedVersions.length === 2) {
      onVersionCompare?.(selectedVersions[0], selectedVersions[1]);
    }
  }, [selectedVersions, onVersionCompare]);

  // 處理版本恢復
  const handleRestore = useCallback((versionId: string) => {
    if (confirm('確定要恢復到此版本嗎？當前未保存的更改將會丟失。')) {
      onVersionRestore?.(versionId);
    }
  }, [onVersionRestore]);

  // 處理創建新版本
  const handleCreateVersion = useCallback(() => {
    if (newVersionDescription.trim()) {
      onVersionCreate?.(newVersionDescription.trim(), newVersionTags);
      setNewVersionDescription('');
      setNewVersionTags([]);
      setShowCreateModal(false);
    }
  }, [newVersionDescription, newVersionTags, onVersionCreate]);

  // 添加標籤
  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !newVersionTags.includes(tag.trim())) {
      setNewVersionTags(prev => [...prev, tag.trim()]);
    }
  }, [newVersionTags]);

  // 移除標籤
  const removeTag = useCallback((tag: string) => {
    setNewVersionTags(prev => prev.filter(t => t !== tag));
  }, []);

  return (
    <div className={`enhanced-version-manager bg-white rounded-lg shadow-sm border ${className}`} data-testid={testId}>
      {/* 標題和操作 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">版本管理</h3>
          <div className="flex space-x-2">
            {!readOnly && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                data-testid="create-version-btn"
              >
                📸 創建版本
              </button>
            )}
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                data-testid="compare-versions-btn"
              >
                🔍 比較版本
              </button>
            )}
          </div>
        </div>

        {/* 過濾器 */}
        <div className="mt-4 flex space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">分支</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              data-testid="branch-filter"
            >
              <option value="all">所有分支</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">用戶</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              data-testid="user-filter"
            >
              <option value="all">所有用戶</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 標籤頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {[
            { key: 'history', label: '版本歷史', icon: '📚' },
            { key: 'compare', label: '版本比較', icon: '🔍' },
            { key: 'branches', label: '分支管理', icon: '🌿' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid={`tab-${tab.key}`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 標籤頁內容 */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* 版本歷史標籤 */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {filteredVersions.length > 0 ? (
              filteredVersions.map(version => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-3 ${
                    selectedVersions.includes(version.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${version.id === currentVersion ? 'ring-2 ring-green-500' : ''}`}
                  data-testid={`version-${version.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => handleVersionSelect(version.id)}
                        className="rounded"
                        disabled={selectedVersions.length >= 2 && !selectedVersions.includes(version.id)}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{version.version}</span>
                          {version.id === currentVersion && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">當前</span>
                          )}
                          {version.branchName && version.branchName !== 'main' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {version.branchName}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {version.userName} • {formatTime(version.timestamp)} • {formatSize(version.size)}
                        </div>
                        {version.description && (
                          <div className="text-sm text-gray-800 mt-1">{version.description}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleVersionExpanded(version.id)}
                        className="text-gray-400 hover:text-gray-600"
                        data-testid={`expand-${version.id}`}
                      >
                        {expandedVersions.has(version.id) ? '▼' : '▶'}
                      </button>
                      {!readOnly && version.id !== currentVersion && (
                        <button
                          onClick={() => handleRestore(version.id)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          data-testid={`restore-${version.id}`}
                        >
                          恢復
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 展開的詳情 */}
                  {expandedVersions.has(version.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {/* 標籤 */}
                      {version.tags.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 mr-2">標籤:</span>
                          {version.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mr-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 變更列表 */}
                      <div>
                        <span className="text-sm text-gray-600 mb-2 block">變更 ({version.changes.length}):</span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {version.changes.slice(0, 10).map(change => (
                            <div
                              key={change.id}
                              className="flex items-center space-x-2 text-xs"
                            >
                              <span className={`px-1 py-0.5 rounded ${getChangeTypeColor(change.type)}`}>
                                {getChangeTypeIcon(change.type)}
                              </span>
                              <span className="font-mono text-gray-600">{change.path}</span>
                            </div>
                          ))}
                          {version.changes.length > 10 && (
                            <div className="text-xs text-gray-500">
                              還有 {version.changes.length - 10} 個變更...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📚</div>
                <p>沒有找到版本記錄</p>
              </div>
            )}
          </div>
        )}

        {/* 版本比較標籤 */}
        {activeTab === 'compare' && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>選擇兩個版本進行比較</p>
            <p className="text-sm mt-1">
              已選擇 {selectedVersions.length}/2 個版本
            </p>
          </div>
        )}

        {/* 分支管理標籤 */}
        {activeTab === 'branches' && (
          <div className="space-y-3">
            {branches.map(branch => {
              const branchVersions = versions.filter(v => (v.branchName || 'main') === branch);
              const latestVersion = branchVersions[0];
              
              return (
                <div
                  key={branch}
                  className="border border-gray-200 rounded-lg p-3"
                  data-testid={`branch-${branch}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{branch}</div>
                      <div className="text-sm text-gray-600">
                        {branchVersions.length} 個版本 • 最新: {latestVersion?.version}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {latestVersion && formatTime(latestVersion.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 創建版本模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">創建新版本</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本描述</label>
                <textarea
                  value={newVersionDescription}
                  onChange={(e) => setNewVersionDescription(e.target.value)}
                  placeholder="描述此版本的變更..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  data-testid="version-description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {newVersionTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="輸入標籤並按 Enter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  data-testid="version-tags"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateVersion}
                disabled={!newVersionDescription.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                data-testid="confirm-create-version"
              >
                創建版本
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVersionManager;

// 版本比較組件
export const VersionComparisonView = ({
  comparison,
  onClose
}: {
  comparison: VersionComparison;
  onClose: () => void;
}) => {
  const [activeSection, setActiveSection] = useState<'summary' | 'details'>('summary');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
        {/* 標題 */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">版本比較</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 版本信息 */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">源版本</h4>
              <p className="text-sm text-gray-600">
                {comparison.sourceVersion.version} • {comparison.sourceVersion.userName}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">目標版本</h4>
              <p className="text-sm text-gray-600">
                {comparison.targetVersion.version} • {comparison.targetVersion.userName}
              </p>
            </div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveSection('summary')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeSection === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              摘要
            </button>
            <button
              onClick={() => setActiveSection('details')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeSection === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              詳細差異
            </button>
          </nav>
        </div>

        {/* 內容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{comparison.summary.totalChanges}</div>
                  <div className="text-sm text-blue-800">總變更</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{comparison.summary.additions}</div>
                  <div className="text-sm text-green-800">新增</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{comparison.summary.deletions}</div>
                  <div className="text-sm text-red-800">刪除</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{comparison.summary.modifications}</div>
                  <div className="text-sm text-yellow-800">修改</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'details' && (
            <div className="space-y-3">
              {comparison.differences.map((diff, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    diff.type === 'added' ? 'border-green-500 bg-green-50' :
                    diff.type === 'removed' ? 'border-red-500 bg-red-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{diff.path}</div>
                      <div className="text-sm text-gray-600">{diff.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      diff.type === 'added' ? 'bg-green-100 text-green-800' :
                      diff.type === 'removed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {diff.type === 'added' ? '新增' :
                       diff.type === 'removed' ? '刪除' : '修改'}
                    </span>
                  </div>

                  {(diff.oldValue !== undefined || diff.newValue !== undefined) && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      {diff.oldValue !== undefined && (
                        <div>
                          <div className="text-gray-600 mb-1">舊值:</div>
                          <div className="p-2 bg-red-100 rounded font-mono text-red-800">
                            {JSON.stringify(diff.oldValue, null, 2)}
                          </div>
                        </div>
                      )}
                      {diff.newValue !== undefined && (
                        <div>
                          <div className="text-gray-600 mb-1">新值:</div>
                          <div className="p-2 bg-green-100 rounded font-mono text-green-800">
                            {JSON.stringify(diff.newValue, null, 2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
