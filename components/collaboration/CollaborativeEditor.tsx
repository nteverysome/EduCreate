/**
 * 協作編輯器組件
 * 提供實時多用戶協作編輯功能
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RealtimeCollaboration,
  CollaborationSession,
  Participant,
  Comment,
  EditOperation,
  CursorPosition
} from '../../lib/collaboration/RealtimeCollaboration';

interface CollaborativeEditorProps {
  activityId: string;
  userId: string;
  username: string;
  initialContent?: any;
  onContentChange?: (content: any) => void;
  onSessionChange?: (session: CollaborationSession | null) => void;
}

export default function CollaborativeEditor({
  activityId,
  userId,
  username,
  initialContent,
  onContentChange,
  onSessionChange
}: CollaborativeEditorProps) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 初始化協作會話
  useEffect(() => {
    initializeCollaboration();
    return () => {
      cleanup();
    };
  }, [activityId, userId]);

  const initializeCollaboration = async () => {
    try {
      // 嘗試加入現有會話或創建新會話
      let collaborationSession: CollaborationSession;
      
      // 這裡應該先檢查是否有現有的會話
      const existingSessionId = localStorage.getItem(`session_${activityId}`);
      
      if (existingSessionId) {
        const joinResult = await RealtimeCollaboration.joinSession(existingSessionId, userId, username);
        if (joinResult.success && joinResult.session) {
          collaborationSession = joinResult.session;
        } else {
          // 加入失敗，創建新會話
          collaborationSession = await RealtimeCollaboration.createSession(activityId, userId);
          localStorage.setItem(`session_${activityId}`, collaborationSession.id);
        }
      } else {
        // 創建新會話
        collaborationSession = await RealtimeCollaboration.createSession(activityId, userId);
        localStorage.setItem(`session_${activityId}`, collaborationSession.id);
      }

      setSession(collaborationSession);
      setParticipants(collaborationSession.participants);
      onSessionChange?.(collaborationSession);

      // 載入評論
      const sessionComments = RealtimeCollaboration.getComments(collaborationSession.id);
      setComments(sessionComments);

      // 建立 WebSocket 連接
      setupWebSocketConnection(collaborationSession.id);
      
      setIsConnected(true);
    } catch (error) {
      console.error('初始化協作失敗:', error);
    }
  };

  const setupWebSocketConnection = (sessionId: string) => {
    // 實際實現中需要連接到 WebSocket 服務器
    // 這裡使用模擬的 WebSocket 連接
    const ws = new WebSocket(`ws://localhost:8080/collaboration/${sessionId}`);
    
    ws.onopen = () => {
      console.log('WebSocket 連接已建立');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const collaborationEvent = JSON.parse(event.data);
      handleCollaborationEvent(collaborationEvent);
    };

    ws.onclose = () => {
      console.log('WebSocket 連接已關閉');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 錯誤:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const handleCollaborationEvent = (event: any) => {
    switch (event.type) {
      case 'edit':
        handleEditEvent(event.data);
        break;
      case 'comment':
        handleCommentEvent(event.data);
        break;
      case 'cursor':
        handleCursorEvent(event.userId, event.data);
        break;
      case 'join':
        handleUserJoin(event.userId, event.data);
        break;
      case 'leave':
        handleUserLeave(event.userId);
        break;
    }
  };

  const handleEditEvent = (operation: EditOperation) => {
    if (operation.userId === userId) return; // 忽略自己的操作

    // 應用其他用戶的編輯操作
    applyEditOperation(operation);
  };

  const handleCommentEvent = (comment: Comment) => {
    setComments(prev => {
      const existing = prev.find(c => c.id === comment.id);
      if (existing) {
        return prev.map(c => c.id === comment.id ? comment : c);
      } else {
        return [...prev, comment];
      }
    });
  };

  const handleCursorEvent = (participantUserId: string, cursor: CursorPosition) => {
    if (participantUserId === userId) return;

    // 更新其他用戶的游標位置
    setParticipants(prev => 
      prev.map(p => 
        p.userId === participantUserId 
          ? { ...p, cursor, lastSeenAt: new Date() }
          : p
      )
    );
  };

  const handleUserJoin = (participantUserId: string, data: any) => {
    if (session) {
      const updatedSession = RealtimeCollaboration.getSession(session.id);
      if (updatedSession) {
        setParticipants(updatedSession.participants);
      }
    }
  };

  const handleUserLeave = (participantUserId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.userId === participantUserId 
          ? { ...p, status: 'offline' as const }
          : p
      )
    );
  };

  const applyEditOperation = (operation: EditOperation) => {
    // 根據操作類型應用編輯
    const element = document.getElementById(operation.elementId);
    if (!element) return;

    switch (operation.type) {
      case 'insert':
        // 插入內容
        if (operation.position !== undefined) {
          const textNode = element.firstChild as Text;
          if (textNode) {
            const newText = textNode.textContent || '';
            const before = newText.substring(0, operation.position);
            const after = newText.substring(operation.position);
            textNode.textContent = before + operation.content + after;
          }
        }
        break;
      case 'delete':
        // 刪除內容
        if (operation.position !== undefined && operation.oldContent) {
          const textNode = element.firstChild as Text;
          if (textNode) {
            const newText = textNode.textContent || '';
            const before = newText.substring(0, operation.position);
            const after = newText.substring(operation.position + operation.oldContent.length);
            textNode.textContent = before + after;
          }
        }
        break;
      case 'update':
        // 更新內容
        element.textContent = operation.content;
        break;
    }

    // 觸發內容變更回調
    onContentChange?.(getCurrentContent());
  };

  const getCurrentContent = () => {
    if (!editorRef.current) return null;
    
    // 提取當前編輯器內容
    const elements = editorRef.current.querySelectorAll('[data-element-id]');
    const content: any = {};
    
    elements.forEach(element => {
      const elementId = element.getAttribute('data-element-id');
      if (elementId) {
        content[elementId] = element.textContent || '';
      }
    });
    
    return content;
  };

  const handleContentEdit = useCallback(async (elementId: string, newContent: string, oldContent: string) => {
    if (!session) return;

    const operation: Omit<EditOperation, 'id' | 'timestamp'> = {
      type: 'update',
      elementId,
      content: newContent,
      oldContent,
      userId
    };

    try {
      await RealtimeCollaboration.applyOperation(session.id, operation);
      onContentChange?.(getCurrentContent());
    } catch (error) {
      console.error('應用編輯操作失敗:', error);
    }
  }, [session, userId]);

  const handleAddComment = async () => {
    if (!session || !selectedElement || !newComment.trim()) return;

    try {
      await RealtimeCollaboration.addComment(
        session.id,
        selectedElement,
        userId,
        username,
        newComment.trim()
      );
      setNewComment('');
      setSelectedElement(null);
    } catch (error) {
      console.error('添加評論失敗:', error);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!session) return;

    const cursor: CursorPosition = {
      x: e.clientX,
      y: e.clientY,
      timestamp: new Date()
    };

    RealtimeCollaboration.updateCursor(session.id, userId, cursor);
  }, [session, userId]);

  const cleanup = async () => {
    if (session) {
      await RealtimeCollaboration.leaveSession(session.id, userId);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const getParticipantColor = (participantUserId: string): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = participants.findIndex(p => p.userId === participantUserId);
    return colors[index % colors.length];
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">正在初始化協作會話...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 主編輯區域 */}
      <div className="flex-1 flex flex-col">
        {/* 工具欄 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? '已連接' : '連接中...'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              會話 ID: {session.id.slice(-8)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              👥 參與者 ({participants.filter(p => p.status === 'online').length})
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              💬 評論 ({comments.length})
            </button>
          </div>
        </div>

        {/* 編輯器 */}
        <div 
          ref={editorRef}
          className="flex-1 p-6 overflow-auto relative"
          onMouseMove={handleMouseMove}
        >
          {/* 其他用戶的游標 */}
          {participants
            .filter(p => p.userId !== userId && p.status === 'online' && p.cursor)
            .map(participant => (
              <div
                key={participant.userId}
                className="absolute pointer-events-none z-10"
                style={{
                  left: participant.cursor!.x,
                  top: participant.cursor!.y,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className={`w-2 h-2 rounded-full ${getParticipantColor(participant.userId)}`}></div>
                <div className="text-xs text-white bg-gray-800 px-2 py-1 rounded mt-1 whitespace-nowrap">
                  {participant.username}
                </div>
              </div>
            ))}

          {/* 可編輯內容區域 */}
          <div className="space-y-4">
            <div
              data-element-id="title"
              contentEditable
              className="text-2xl font-bold border-2 border-transparent hover:border-gray-300 focus:border-blue-500 p-2 rounded outline-none"
              onBlur={(e) => {
                const newContent = e.target.textContent || '';
                const oldContent = initialContent?.title || '';
                if (newContent !== oldContent) {
                  handleContentEdit('title', newContent, oldContent);
                }
              }}
              onClick={() => setSelectedElement('title')}
            >
              {initialContent?.title || '點擊編輯標題'}
            </div>

            <div
              data-element-id="description"
              contentEditable
              className="text-gray-600 border-2 border-transparent hover:border-gray-300 focus:border-blue-500 p-2 rounded outline-none min-h-[100px]"
              onBlur={(e) => {
                const newContent = e.target.textContent || '';
                const oldContent = initialContent?.description || '';
                if (newContent !== oldContent) {
                  handleContentEdit('description', newContent, oldContent);
                }
              }}
              onClick={() => setSelectedElement('description')}
            >
              {initialContent?.description || '點擊編輯描述'}
            </div>
          </div>

          {/* 評論標記 */}
          {comments.map(comment => (
            <div
              key={comment.id}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full cursor-pointer"
              style={{
                left: comment.position?.x || 0,
                top: comment.position?.y || 0
              }}
              title={`${comment.username}: ${comment.content}`}
            />
          ))}
        </div>

        {/* 評論輸入 */}
        {selectedElement && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="添加評論..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                發送
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 側邊欄 */}
      <div className="w-80 border-l border-gray-200 bg-gray-50">
        {/* 參與者面板 */}
        {showParticipants && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">參與者</h3>
            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.userId} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    participant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    getParticipantColor(participant.userId)
                  }`}>
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.username}
                      {participant.userId === userId && ' (您)'}
                    </div>
                    <div className="text-xs text-gray-500">{participant.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 評論面板 */}
        {showComments && (
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">評論</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  {comment.replies.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="mt-2">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">{reply.username}</span>
                            <span className="ml-2">{reply.createdAt.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  暫無評論
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
