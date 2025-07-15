/**
 * 實時協作編輯系統頁面
 * 展示完整的多用戶協作編輯、版本歷史和變更追蹤功能
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  CollaborationManager, 
  CollaborationUser, 
  ContentChange, 
  ContentVersion, 
  ConflictResolution 
} from '../../../lib/collaboration/CollaborationManager';

export default function RealtimeCollaborationPage() {
  const [collaborationManager] = useState(() => new CollaborationManager());
  const [content, setContent] = useState('歡迎使用 EduCreate 實時協作編輯系統！\n\n這是一個支持多用戶同時編輯的協作平台。您可以：\n\n1. 與其他用戶實時協作編輯\n2. 查看版本歷史和變更追蹤\n3. 解決編輯衝突\n4. 創建版本快照\n5. 回滾到任意版本\n\n開始編輯以體驗協作功能...');
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [changes, setChanges] = useState<ContentChange[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [isJoined, setIsJoined] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showUserList, setShowUserList] = useState(true);
  const [showChangeHistory, setShowChangeHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastChangeRef = useRef<number>(0);

  // 模擬當前用戶
  const currentUser: CollaborationUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: '演示用戶',
    email: 'demo@educreat.com',
    color: '#3B82F6',
    lastActivity: Date.now(),
    isOnline: true
  };

  // 初始化協作會話
  useEffect(() => {
    const initializeCollaboration = async () => {
      try {
        await collaborationManager.joinSession('demo-document', currentUser);
        setIsJoined(true);
        
        // 模擬其他用戶加入
        setTimeout(() => {
          const otherUsers: CollaborationUser[] = [
            {
              id: 'user_alice',
              name: 'Alice',
              email: 'alice@example.com',
              color: '#EF4444',
              lastActivity: Date.now(),
              isOnline: true,
              cursor: { position: 50 }
            },
            {
              id: 'user_bob',
              name: 'Bob',
              email: 'bob@example.com',
              color: '#10B981',
              lastActivity: Date.now() - 60000,
              isOnline: false
            }
          ];
          
          // 手動添加模擬用戶到會話
          const session = collaborationManager.getCurrentSession();
          if (session) {
            otherUsers.forEach(user => {
              session.users.set(user.id, user);
            });
            setUsers(Array.from(session.users.values()));
          }
        }, 2000);
      } catch (error) {
        console.error('加入協作會話失敗:', error);
      }
    };

    initializeCollaboration();

    return () => {
      collaborationManager.leaveSession();
      collaborationManager.destroy();
    };
  }, [collaborationManager]);

  // 設置事件監聽器
  useEffect(() => {
    const handleUsersUpdate = (updatedUsers: CollaborationUser[]) => {
      setUsers(updatedUsers);
    };

    const handleContentChange = (change: ContentChange) => {
      setChanges(prev => [...prev, change]);
      
      // 如果不是當前用戶的變更，更新內容
      if (change.userId !== currentUser.id) {
        const session = collaborationManager.getCurrentSession();
        if (session) {
          setContent(session.currentVersion.content);
        }
      }
    };

    const handleVersionCreate = (version: ContentVersion) => {
      setVersions(prev => [...prev, version]);
    };

    const handleConflictResolution = (conflict: ConflictResolution) => {
      setConflicts(prev => [...prev, conflict]);
    };

    const handleConnectionStatus = (status: 'connected' | 'disconnected' | 'reconnecting') => {
      setConnectionStatus(status);
    };

    collaborationManager.addUserListener(handleUsersUpdate);
    collaborationManager.addChangeListener(handleContentChange);
    collaborationManager.addVersionListener(handleVersionCreate);
    collaborationManager.addConflictListener(handleConflictResolution);
    collaborationManager.addConnectionListener(handleConnectionStatus);

    return () => {
      collaborationManager.removeUserListener(handleUsersUpdate);
      collaborationManager.removeChangeListener(handleContentChange);
      collaborationManager.removeVersionListener(handleVersionCreate);
      collaborationManager.removeConflictListener(handleConflictResolution);
      collaborationManager.removeConnectionListener(handleConnectionStatus);
    };
  }, [collaborationManager, currentUser.id]);

  // 處理內容變更
  const handleContentInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const oldContent = content;
    
    setContent(newContent);

    // 防抖處理，避免過於頻繁的變更
    const now = Date.now();
    if (now - lastChangeRef.current < 300) return;
    lastChangeRef.current = now;

    // 計算變更
    const change = calculateChange(oldContent, newContent);
    if (change) {
      collaborationManager.applyChange({
        userId: currentUser.id,
        type: change.type,
        position: change.position,
        length: change.length,
        content: change.content,
        oldContent: change.oldContent
      });
    }
  }, [content, currentUser.id, collaborationManager]);

  // 處理光標移動
  const handleCursorMove = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const position = textarea.selectionStart;
    const selection = textarea.selectionStart !== textarea.selectionEnd ? {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    } : undefined;

    collaborationManager.updateCursor(position, selection);
  }, [collaborationManager]);

  // 創建版本快照
  const handleCreateVersion = useCallback(async () => {
    try {
      const version = await collaborationManager.createVersion(content, '手動創建的版本');
      console.log('版本創建成功:', version);
    } catch (error) {
      console.error('創建版本失敗:', error);
    }
  }, [collaborationManager, content]);

  // 回滾到指定版本
  const handleRollbackToVersion = useCallback(async (versionId: string) => {
    try {
      const version = await collaborationManager.rollbackToVersion(versionId);
      setContent(version.content);
      console.log('回滾成功:', version);
    } catch (error) {
      console.error('回滾失敗:', error);
    }
  }, [collaborationManager]);

  // 計算內容變更
  const calculateChange = (oldContent: string, newContent: string): {
    type: 'insert' | 'delete' | 'replace';
    position: number;
    length?: number;
    content?: string;
    oldContent?: string;
  } | null => {
    if (oldContent === newContent) return null;

    // 簡化的變更檢測算法
    if (newContent.length > oldContent.length) {
      // 插入操作
      const position = findInsertPosition(oldContent, newContent);
      return {
        type: 'insert',
        position,
        content: newContent.slice(position, position + (newContent.length - oldContent.length))
      };
    } else if (newContent.length < oldContent.length) {
      // 刪除操作
      const position = findDeletePosition(oldContent, newContent);
      return {
        type: 'delete',
        position,
        length: oldContent.length - newContent.length
      };
    } else {
      // 替換操作
      const position = findReplacePosition(oldContent, newContent);
      return {
        type: 'replace',
        position,
        length: 1,
        content: newContent.charAt(position),
        oldContent: oldContent.charAt(position)
      };
    }
  };

  // 查找插入位置
  const findInsertPosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return oldContent.length;
  };

  // 查找刪除位置
  const findDeletePosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return newContent.length;
  };

  // 查找替換位置
  const findReplacePosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < oldContent.length; i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return 0;
  };

  // 獲取連接狀態圖標
  const getConnectionStatusIcon = (): string => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'reconnecting': return '🟡';
      default: return '⚪';
    }
  };

  // 格式化時間
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加入協作會話...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="home-link"
              >
                ← 返回主頁
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="dashboard-link"
              >
                功能儀表板
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            實時協作編輯系統
          </h1>
          <p className="text-gray-600 text-lg">
            多用戶同時編輯、版本歷史、變更追蹤和衝突解決，實時協作延遲 &lt;100ms
          </p>
        </div>

        {/* 協作編輯器 */}
        <div className="bg-white rounded-lg shadow-sm" data-testid="collaborative-editor">
          {/* 工具列 */}
          <div className="toolbar border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {/* 左側：連接狀態和用戶列表 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getConnectionStatusIcon()}</span>
                  <span className="text-sm text-gray-600 capitalize" data-testid="connection-status">
                    {connectionStatus}
                  </span>
                </div>
                
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  data-testid="toggle-user-list-btn"
                >
                  <span>👥</span>
                  <span>{users.length} 用戶</span>
                </button>
              </div>

              {/* 右側：版本控制 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCreateVersion}
                  className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                  data-testid="create-version-btn"
                >
                  📸 創建版本
                </button>
                
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded-md transition-colors"
                  data-testid="toggle-version-history-btn"
                >
                  📚 版本歷史 ({versions.length})
                </button>

                <button
                  onClick={() => setShowChangeHistory(!showChangeHistory)}
                  className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                  data-testid="toggle-change-history-btn"
                >
                  📝 變更歷史 ({changes.length})
                </button>
              </div>
            </div>

            {/* 用戶列表 */}
            {showUserList && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg" data-testid="user-list">
                <h4 className="text-sm font-medium text-gray-700 mb-2">協作用戶</h4>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 px-2 py-1 bg-white rounded-md border"
                      data-testid={`user-${user.id}`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span className="text-sm">{user.name}</span>
                      <span className={`text-xs ${user.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.isOnline ? '在線' : '離線'}
                      </span>
                      {user.cursor && (
                        <span className="text-xs text-gray-500">
                          @{user.cursor.position}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 主編輯區域 */}
          <div className="editor-content flex">
            {/* 編輯器 */}
            <div className="flex-1 p-4">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentInput}
                onSelect={handleCursorMove}
                onKeyUp={handleCursorMove}
                onClick={handleCursorMove}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="開始協作編輯..."
                data-testid="editor-textarea"
              />
              
              {/* 編輯器統計 */}
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span data-testid="content-stats">
                  字符數: {content.length} | 行數: {content.split('\n').length}
                </span>
                <span data-testid="change-stats">
                  變更: {changes.length} | 衝突: {conflicts.length}
                </span>
              </div>
            </div>

            {/* 側邊欄 */}
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              {/* 版本歷史 */}
              {showVersionHistory && (
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">版本歷史</h4>
                  
                  {versions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500" data-testid="no-versions">
                      <div className="text-4xl mb-2">📚</div>
                      <p>還沒有版本快照</p>
                    </div>
                  ) : (
                    <div className="space-y-3" data-testid="version-list">
                      {versions.slice().reverse().map((version, index) => (
                        <div
                          key={version.id}
                          className="p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                          data-testid={`version-${version.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              版本 #{versions.length - index}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(version.timestamp)}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">
                            作者: {users.find(u => u.id === version.userId)?.name || version.userId}
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-3">
                            {version.changes.length} 個變更
                          </div>
                          
                          <button
                            onClick={() => handleRollbackToVersion(version.id)}
                            className="w-full px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                            data-testid={`rollback-btn-${version.id}`}
                          >
                            回滾到此版本
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 變更歷史 */}
              {showChangeHistory && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-4">變更歷史</h4>
                  
                  {changes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500" data-testid="no-changes">
                      <div className="text-4xl mb-2">📝</div>
                      <p>還沒有變更記錄</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="change-list">
                      {changes.slice().reverse().slice(0, 20).map((change) => (
                        <div
                          key={change.id}
                          className="p-2 bg-white rounded border text-xs"
                          data-testid={`change-${change.id}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {users.find(u => u.id === change.userId)?.name || change.userId}
                            </span>
                            <span className="text-gray-500">
                              {formatTime(change.timestamp)}
                            </span>
                          </div>
                          
                          <div className="text-gray-600">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              change.type === 'insert' ? 'bg-green-100 text-green-800' :
                              change.type === 'delete' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {change.type}
                            </span>
                            <span className="ml-2">@{change.position}</span>
                            {change.content && (
                              <span className="ml-2 text-gray-500">
                                "{change.content.substring(0, 20)}{change.content.length > 20 ? '...' : ''}"
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 衝突通知 */}
          {conflicts.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-yellow-50" data-testid="conflict-notifications">
              <h4 className="font-medium text-yellow-900 mb-2">衝突解決</h4>
              <div className="space-y-2">
                {conflicts.slice(-3).map((conflict) => (
                  <div
                    key={conflict.conflictId}
                    className="text-sm text-yellow-800 p-2 bg-yellow-100 rounded"
                    data-testid={`conflict-${conflict.conflictId}`}
                  >
                    <span className="font-medium">衝突已解決:</span> {conflict.changes.length} 個變更已合併
                    <span className="text-xs text-yellow-600 ml-2">
                      {formatTime(conflict.resolvedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 性能指標 */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span data-testid="performance-metrics">
                平均延遲: {collaborationManager.formatLatency(collaborationManager.getPerformanceMetrics().averageLatency)}
              </span>
              <span data-testid="message-stats">
                發送: {collaborationManager.getPerformanceMetrics().messagesSent} | 
                接收: {collaborationManager.getPerformanceMetrics().messagesReceived}
              </span>
            </div>
          </div>
        </div>

        {/* 功能特色說明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">實時協作功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">👥</div>
              <div>
                <h3 className="font-medium text-gray-900">多用戶協作</h3>
                <p className="text-sm text-gray-600">支持多個用戶同時編輯，實時同步變更</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">📚</div>
              <div>
                <h3 className="font-medium text-gray-900">版本歷史</h3>
                <p className="text-sm text-gray-600">完整的版本控制和回滾功能</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-xl">🔄</div>
              <div>
                <h3 className="font-medium text-gray-900">變更追蹤</h3>
                <p className="text-sm text-gray-600">詳細記錄每個編輯操作</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-orange-600 text-xl">⚡</div>
              <div>
                <h3 className="font-medium text-gray-900">低延遲</h3>
                <p className="text-sm text-gray-600">實時協作延遲 &lt;100ms</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-xl">🔧</div>
              <div>
                <h3 className="font-medium text-gray-900">衝突解決</h3>
                <p className="text-sm text-gray-600">智能處理編輯衝突</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-indigo-600 text-xl">📊</div>
              <div>
                <h3 className="font-medium text-gray-900">性能監控</h3>
                <p className="text-sm text-gray-600">實時性能指標和統計</p>
              </div>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">使用說明</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>在編輯器中輸入內容，系統會自動追蹤您的變更</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>點擊「創建版本」按鈕可以創建版本快照</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>在版本歷史中可以查看所有版本並回滾到任意版本</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>變更歷史顯示所有編輯操作的詳細記錄</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>系統會自動處理多用戶編輯時的衝突</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
