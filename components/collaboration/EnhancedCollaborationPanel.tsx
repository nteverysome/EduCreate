/**
 * EnhancedCollaborationPanel - 增強的協作狀態面板
 * 提供詳細的協作狀態、性能監控、衝突管理等功能
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CollaborationUser, ContentChange, ConflictResolution } from '../../lib/collaboration/CollaborationManager';

export interface CollaborationMetrics {
  activeUsers: number;
  totalChanges: number;
  conflictsResolved: number;
  averageLatency: number;
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'offline';
  lastSync: number;
  bandwidth: {
    sent: number;
    received: number;
  };
}

export interface EnhancedCollaborationPanelProps {
  users: CollaborationUser[];
  changes: ContentChange[];
  conflicts: ConflictResolution[];
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  metrics?: CollaborationMetrics;
  onUserAction?: (action: string, userId: string) => void;
  onConflictResolve?: (conflictId: string, resolution: string) => void;
  onSyncForce?: () => void;
  className?: string;
  'data-testid'?: string;
}

const EnhancedCollaborationPanel = ({
  users,
  changes,
  conflicts,
  connectionStatus,
  metrics,
  onUserAction,
  onConflictResolve,
  onSyncForce,
  className = '',
  'data-testid': testId = 'enhanced-collaboration-panel'
}: EnhancedCollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'conflicts' | 'metrics'>('users');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // 觸發數據刷新
      // 在實際應用中，這裡會調用 API 或 WebSocket 更新
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 獲取連接狀態顏色
  const getConnectionStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'reconnecting': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 獲取同步狀態圖標
  const getSyncStatusIcon = (status: string): string => {
    switch (status) {
      case 'synced': return '✅';
      case 'syncing': return '🔄';
      case 'conflict': return '⚠️';
      case 'offline': return '❌';
      default: return '❓';
    }
  };

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
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 切換詳情顯示
  const toggleDetails = useCallback((key: string) => {
    setShowDetails(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 處理用戶操作
  const handleUserAction = useCallback((action: string, userId: string) => {
    onUserAction?.(action, userId);
  }, [onUserAction]);

  // 處理衝突解決
  const handleConflictResolve = useCallback((conflictId: string, resolution: string) => {
    onConflictResolve?.(conflictId, resolution);
  }, [onConflictResolve]);

  return (
    <div className={`enhanced-collaboration-panel bg-white rounded-lg shadow-sm border ${className}`} data-testid={testId}>
      {/* 標題和狀態 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">協作狀態</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectionStatusColor(connectionStatus)}`}>
              {connectionStatus === 'connected' ? '已連接' : 
               connectionStatus === 'disconnected' ? '已斷開' : '重新連接中'}
            </span>
            {metrics && (
              <span className="text-xs text-gray-500">
                {getSyncStatusIcon(metrics.syncStatus)} {metrics.syncStatus}
              </span>
            )}
          </div>
        </div>

        {/* 快速統計 */}
        <div className="mt-3 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{users.length}</div>
            <div className="text-xs text-gray-500">在線用戶</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{changes.length}</div>
            <div className="text-xs text-gray-500">總變更</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">{conflicts.length}</div>
            <div className="text-xs text-gray-500">衝突</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {metrics ? `${metrics.averageLatency}ms` : '--'}
            </div>
            <div className="text-xs text-gray-500">延遲</div>
          </div>
        </div>
      </div>

      {/* 標籤頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {[
            { key: 'users', label: '用戶', icon: '👥' },
            { key: 'activity', label: '活動', icon: '📝' },
            { key: 'conflicts', label: '衝突', icon: '⚠️' },
            { key: 'metrics', label: '指標', icon: '📊' }
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
        {/* 用戶標籤 */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.length > 0 ? (
              users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  data-testid={`user-${user.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-500">
                      {formatTime(user.lastActivity)}
                    </span>
                    <button
                      onClick={() => toggleDetails(`user-${user.id}`)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showDetails[`user-${user.id}`] ? '▼' : '▶'}
                    </button>
                  </div>
                  
                  {showDetails[`user-${user.id}`] && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>狀態: {user.isOnline ? '在線' : '離線'}</div>
                        <div>最後活動: {formatTime(user.lastActivity)}</div>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleUserAction('message', user.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          發送消息
                        </button>
                        <button
                          onClick={() => handleUserAction('follow', user.id)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                        >
                          跟隨編輯
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>沒有其他用戶在線</p>
              </div>
            )}
          </div>
        )}

        {/* 活動標籤 */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {changes.length > 0 ? (
              changes.slice(0, 20).map(change => (
                <div
                  key={change.id}
                  className="p-3 border border-gray-200 rounded-lg"
                  data-testid={`change-${change.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {change.type === 'insert' ? '插入' : 
                         change.type === 'delete' ? '刪除' : '修改'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        位置: {change.position}, 長度: {change.length}
                      </div>
                      {change.content && (
                        <div className="text-sm text-gray-800 mt-2 p-2 bg-gray-50 rounded font-mono">
                          {change.content.length > 50 
                            ? `${change.content.substring(0, 50)}...` 
                            : change.content
                          }
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {formatTime(change.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>還沒有編輯活動</p>
              </div>
            )}
          </div>
        )}

        {/* 衝突標籤 */}
        {activeTab === 'conflicts' && (
          <div className="space-y-3">
            {conflicts.length > 0 ? (
              conflicts.map(conflict => (
                <div
                  key={conflict.conflictId}
                  className="p-3 border border-red-200 rounded-lg bg-red-50"
                  data-testid={`conflict-${conflict.conflictId}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-red-900">
                        衝突 #{conflict.conflictId.slice(-6)}
                      </div>
                      <div className="text-sm text-red-700 mt-1">
                        涉及 {conflict.changes.length} 個變更
                      </div>
                      <div className="text-sm text-red-600 mt-2">
                        解決方式: {conflict.resolution}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleConflictResolve(conflict.conflictId, 'accept-local')}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                      >
                        接受本地
                      </button>
                      <button
                        onClick={() => handleConflictResolve(conflict.conflictId, 'accept-remote')}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                      >
                        接受遠程
                      </button>
                      <button
                        onClick={() => handleConflictResolve(conflict.conflictId, 'merge')}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                      >
                        合併
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>沒有衝突需要解決</p>
              </div>
            )}
          </div>
        )}

        {/* 指標標籤 */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            {metrics ? (
              <>
                {/* 性能指標 */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">性能指標</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">平均延遲:</span>
                      <span className="ml-2 font-medium">{metrics.averageLatency}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">同步狀態:</span>
                      <span className="ml-2 font-medium">{metrics.syncStatus}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">最後同步:</span>
                      <span className="ml-2 font-medium">{formatTime(metrics.lastSync)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">活躍用戶:</span>
                      <span className="ml-2 font-medium">{metrics.activeUsers}</span>
                    </div>
                  </div>
                </div>

                {/* 流量統計 */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">流量統計</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">已發送:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.bandwidth.sent)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">已接收:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.bandwidth.received)}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-2">
                  <button
                    onClick={onSyncForce}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    data-testid="force-sync-btn"
                  >
                    強制同步
                  </button>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm ${
                      autoRefresh 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    data-testid="auto-refresh-btn"
                  >
                    {autoRefresh ? '停止自動刷新' : '開啟自動刷新'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>指標數據載入中...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCollaborationPanel;
