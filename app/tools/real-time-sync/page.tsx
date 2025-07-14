'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  WifiIcon,
  SignalIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface SyncStatus {
  status: 'connected' | 'syncing' | 'conflict' | 'offline' | 'error';
  lastSync: Date | null;
  pendingChanges: number;
  activeUsers: number;
  conflicts: ConflictItem[];
}

interface ConflictItem {
  id: string;
  type: 'content' | 'version' | 'permission';
  description: string;
  localVersion: any;
  serverVersion: any;
  timestamp: Date;
  resolved: boolean;
}

interface ActiveUser {
  id: string;
  name: string;
  avatar: string;
  lastActivity: Date;
  currentDocument: string;
  isEditing: boolean;
}

interface SyncEvent {
  id: string;
  type: 'sync' | 'conflict' | 'user-join' | 'user-leave' | 'edit';
  message: string;
  timestamp: Date;
  userId?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

const mockActiveUsers: ActiveUser[] = [
  {
    id: 'user1',
    name: '張老師',
    avatar: '👩‍🏫',
    lastActivity: new Date(),
    currentDocument: '英語詞彙練習',
    isEditing: true
  },
  {
    id: 'user2',
    name: '李同學',
    avatar: '👨‍🎓',
    lastActivity: new Date(Date.now() - 30000),
    currentDocument: '數學練習題',
    isEditing: false
  },
  {
    id: 'user3',
    name: '王助教',
    avatar: '👨‍💼',
    lastActivity: new Date(Date.now() - 60000),
    currentDocument: '科學實驗',
    isEditing: true
  }
];

export default function RealTimeSyncPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'connected',
    lastSync: new Date(),
    pendingChanges: 0,
    activeUsers: 3,
    conflicts: []
  });
  
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>(mockActiveUsers);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(2000);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 模擬 WebSocket 連接
  useEffect(() => {
    // 模擬 WebSocket 連接
    const simulateWebSocket = () => {
      // 模擬連接事件
      addSyncEvent({
        type: 'sync',
        message: '已連接到實時同步服務器',
        severity: 'success'
      });

      // 模擬定期同步事件
      if (isAutoSync) {
        syncIntervalRef.current = setInterval(() => {
          simulateSync();
        }, syncInterval);
      }
    };

    simulateWebSocket();

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isAutoSync, syncInterval]);

  // 添加同步事件
  const addSyncEvent = (event: Omit<SyncEvent, 'id' | 'timestamp'>) => {
    const newEvent: SyncEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      ...event
    };
    
    setSyncEvents(prev => [newEvent, ...prev.slice(0, 49)]); // 保持最新 50 個事件
  };

  // 模擬同步過程
  const simulateSync = () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
    
    setTimeout(() => {
      const hasConflict = Math.random() < 0.1; // 10% 機率產生衝突
      
      if (hasConflict) {
        const conflict: ConflictItem = {
          id: `conflict-${Date.now()}`,
          type: 'content',
          description: '檢測到內容衝突：多個用戶同時編輯同一文檔',
          localVersion: { content: '本地版本內容', timestamp: new Date() },
          serverVersion: { content: '服務器版本內容', timestamp: new Date(Date.now() - 5000) },
          timestamp: new Date(),
          resolved: false
        };
        
        setSyncStatus(prev => ({
          ...prev,
          status: 'conflict',
          conflicts: [...prev.conflicts, conflict]
        }));
        
        addSyncEvent({
          type: 'conflict',
          message: `檢測到衝突：${conflict.description}`,
          severity: 'warning'
        });
      } else {
        setSyncStatus(prev => ({
          ...prev,
          status: 'connected',
          lastSync: new Date(),
          pendingChanges: Math.max(0, prev.pendingChanges - Math.floor(Math.random() * 3))
        }));
        
        addSyncEvent({
          type: 'sync',
          message: '同步完成',
          severity: 'success'
        });
      }
    }, 1000 + Math.random() * 2000);
  };

  // 手動同步
  const handleManualSync = () => {
    addSyncEvent({
      type: 'sync',
      message: '手動同步開始',
      severity: 'info'
    });
    simulateSync();
  };

  // 解決衝突
  const handleResolveConflict = (conflict: ConflictItem, resolution: 'local' | 'server' | 'merge') => {
    setSyncStatus(prev => ({
      ...prev,
      conflicts: prev.conflicts.map(c => 
        c.id === conflict.id ? { ...c, resolved: true } : c
      ),
      status: prev.conflicts.length === 1 ? 'connected' : prev.status
    }));
    
    addSyncEvent({
      type: 'conflict',
      message: `衝突已解決：使用${resolution === 'local' ? '本地' : resolution === 'server' ? '服務器' : '合併'}版本`,
      severity: 'success'
    });
    
    setShowConflictModal(false);
    setSelectedConflict(null);
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'syncing': return 'text-blue-600 bg-blue-100';
      case 'conflict': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 獲取狀態圖標
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="h-5 w-5" />;
      case 'syncing': return <ArrowPathIcon className="h-5 w-5 animate-spin" />;
      case 'conflict': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'offline': return <WifiIcon className="h-5 w-5" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <SignalIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="sync-title">
            實時同步和衝突解決
          </h1>
          <p className="mt-2 text-gray-600">
            支援多用戶同時操作的實時同步系統，智能衝突檢測和解決機制
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 同步狀態面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 當前狀態 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">同步狀態</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(syncStatus.status)}`}>
                    {getStatusIcon(syncStatus.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900" data-testid="sync-status">
                      {syncStatus.status === 'connected' && '已連接'}
                      {syncStatus.status === 'syncing' && '同步中'}
                      {syncStatus.status === 'conflict' && '檢測到衝突'}
                      {syncStatus.status === 'offline' && '離線'}
                      {syncStatus.status === 'error' && '錯誤'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {syncStatus.lastSync && `最後同步: ${syncStatus.lastSync.toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleManualSync}
                  disabled={syncStatus.status === 'syncing'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  data-testid="manual-sync-button"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  手動同步
                </button>
              </div>

              {/* 統計信息 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{syncStatus.pendingChanges}</div>
                  <div className="text-sm text-gray-500">待同步變更</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{syncStatus.activeUsers}</div>
                  <div className="text-sm text-gray-500">活躍用戶</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{syncStatus.conflicts.filter(c => !c.resolved).length}</div>
                  <div className="text-sm text-gray-500">未解決衝突</div>
                </div>
              </div>
            </div>

            {/* 衝突列表 */}
            {syncStatus.conflicts.filter(c => !c.resolved).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">待解決衝突</h2>
                
                <div className="space-y-4">
                  {syncStatus.conflicts.filter(c => !c.resolved).map(conflict => (
                    <div key={conflict.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                              {conflict.type === 'content' && '內容衝突'}
                              {conflict.type === 'version' && '版本衝突'}
                              {conflict.type === 'permission' && '權限衝突'}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-700 mb-3">{conflict.description}</p>
                          <p className="text-xs text-yellow-600">
                            發生時間: {conflict.timestamp.toLocaleString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedConflict(conflict);
                            setShowConflictModal(true);
                          }}
                          className="ml-4 inline-flex items-center px-3 py-1 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                          data-testid={`resolve-conflict-${conflict.id}`}
                        >
                          解決衝突
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 同步設置 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">同步設置</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAutoSync}
                      onChange={(e) => setIsAutoSync(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      data-testid="auto-sync-checkbox"
                    />
                    <span className="ml-2 text-sm text-gray-700">啟用自動同步</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    同步間隔 (毫秒)
                  </label>
                  <select
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="sync-interval-select"
                  >
                    <option value={1000}>1 秒</option>
                    <option value={2000}>2 秒</option>
                    <option value={5000}>5 秒</option>
                    <option value={10000}>10 秒</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 活躍用戶 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                活躍用戶
              </h2>
              
              <div className="space-y-3">
                {activeUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.currentDocument}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {user.isEditing && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                      <span className="text-xs text-gray-400">
                        {Math.floor((Date.now() - user.lastActivity.getTime()) / 1000)}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 同步事件日誌 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                同步事件
              </h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {syncEvents.slice(0, 10).map(event => (
                  <div key={event.id} className="text-xs">
                    <div className="flex items-start space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full mt-1 ${
                        event.severity === 'success' ? 'bg-green-400' :
                        event.severity === 'warning' ? 'bg-yellow-400' :
                        event.severity === 'error' ? 'bg-red-400' : 'bg-blue-400'
                      }`}></span>
                      <div className="flex-1">
                        <p className="text-gray-900">{event.message}</p>
                        <p className="text-gray-500">{event.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 衝突解決模態框 */}
        {showConflictModal && selectedConflict && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  解決衝突: {selectedConflict.description}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">本地版本</h4>
                    <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(selectedConflict.localVersion, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">服務器版本</h4>
                    <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(selectedConflict.serverVersion, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleResolveConflict(selectedConflict, 'local')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    data-testid="resolve-local"
                  >
                    使用本地版本
                  </button>
                  <button
                    onClick={() => handleResolveConflict(selectedConflict, 'server')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    data-testid="resolve-server"
                  >
                    使用服務器版本
                  </button>
                  <button
                    onClick={() => handleResolveConflict(selectedConflict, 'merge')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    data-testid="resolve-merge"
                  >
                    智能合併
                  </button>
                  <button
                    onClick={() => {
                      setShowConflictModal(false);
                      setSelectedConflict(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    data-testid="cancel-resolve"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
