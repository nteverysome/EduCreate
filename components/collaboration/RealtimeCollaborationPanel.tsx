/**
 * 實時協作面板組件
 * 使用 Supabase Realtime 提供協作功能
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeCollaboration, useRealtimeDatabase } from '../../hooks/useRealtimeCollaboration';

interface RealtimeCollaborationPanelProps {
  activityId: string;
  userId: string;
  username: string;
  avatar?: string;
  onEditOperation?: (operation: any) => void;
  onCommentAdded?: (comment: any) => void;
}

export default function RealtimeCollaborationPanel({
  activityId,
  userId,
  username,
  avatar,
  onEditOperation,
  onCommentAdded
}: RealtimeCollaborationPanelProps) {
  const [showParticipants, setShowParticipants] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });

  // 使用實時協作 Hook
  const {
    isConnected,
    isJoining,
    error,
    participants,
    editOperations,
    comments,
    sendEditOperation,
    updateCursor,
    addComment,
    getOtherCursors,
    getSessionStats,
    isActive,
    otherParticipants
  } = useRealtimeCollaboration({
    sessionId: `activity_${activityId}`,
    userId,
    username,
    avatar,
    autoJoin: true,
    enableCursor: true,
    enableComments: true
  });

  // 使用數據庫實時監聽
  const {
    activityUpdates,
    progressUpdates,
    commentUpdates
  } = useRealtimeDatabase({
    activityId,
    userId,
    enableActivityUpdates: true,
    enableProgressUpdates: true,
    enableCommentUpdates: true
  });

  // 處理編輯操作
  useEffect(() => {
    if (editOperations.length > 0) {
      const latestOperation = editOperations[editOperations.length - 1];
      onEditOperation?.(latestOperation);
    }
  }, [editOperations, onEditOperation]);

  // 處理評論添加
  useEffect(() => {
    if (comments.length > 0) {
      const latestComment = comments[comments.length - 1];
      onCommentAdded?.(latestComment);
    }
  }, [comments, onCommentAdded]);

  // 處理鼠標移動（游標追蹤）
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isConnected) {
      updateCursor({
        x: e.clientX,
        y: e.clientY,
        elementId: (e.target as HTMLElement).id || undefined
      });
    }
  };

  // 添加評論
  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment({
        content: newComment,
        position: commentPosition,
        replies: []
      });
      setNewComment('');
      setShowComments(false);
    }
  };

  // 獲取會話統計
  const stats = getSessionStats();

  return (
    <div className="realtime-collaboration-panel bg-white border-l border-gray-200 w-80 h-full flex flex-col">
      {/* 頭部狀態 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">實時協作</h3>
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} title={isConnected ? '已連接' : '未連接'}></div>
        </div>
        
        {isJoining && (
          <div className="text-sm text-blue-600">正在連接...</div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {isConnected && (
          <div className="text-sm text-gray-600">
            {stats.participantCount} 人在線 • {stats.editOperationCount} 次編輯
          </div>
        )}
      </div>

      {/* 標籤切換 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setShowParticipants(true)}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            showParticipants
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          參與者 ({participants.length})
        </button>
        <button
          onClick={() => setShowParticipants(false)}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            !showParticipants
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          評論 ({comments.length})
        </button>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto">
        {showParticipants ? (
          /* 參與者列表 */
          <div className="p-4">
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.userId} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.username} className="w-8 h-8 rounded-full" />
                    ) : (
                      participant.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.username}
                      {participant.userId === userId && (
                        <span className="ml-1 text-xs text-gray-500">(您)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(participant.joinedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    participant.cursor ? 'bg-green-400' : 'bg-gray-300'
                  }`} title={participant.cursor ? '活躍中' : '非活躍'}></div>
                </div>
              ))}
            </div>

            {participants.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-sm">暫無其他參與者</div>
              </div>
            )}
          </div>
        ) : (
          /* 評論列表 */
          <div className="p-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{comment.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <div className="text-sm">暫無評論</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      {!showParticipants && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="添加評論..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddComment();
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              發送
            </button>
          </div>
        </div>
      )}

      {/* 游標顯示 */}
      {isConnected && (
        <div className="absolute inset-0 pointer-events-none">
          {getOtherCursors().map((cursor) => (
            <div
              key={cursor.userId}
              className="absolute z-50 pointer-events-none"
              style={{
                left: cursor.cursor.x,
                top: cursor.cursor.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                {cursor.username}
              </div>
              <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto"></div>
            </div>
          ))}
        </div>
      )}

      {/* 鼠標移動監聽 */}
      <div
        className="absolute inset-0 pointer-events-none"
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}

// 簡化的協作狀態組件
export function CollaborationStatus({ 
  isConnected, 
  participantCount, 
  className = '' 
}: {
  isConnected: boolean;
  participantCount: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="text-sm text-gray-600">
        {isConnected ? `${participantCount} 人在線` : '離線'}
      </span>
    </div>
  );
}

// 快速協作按鈕
export function QuickCollaborationButton({
  onClick,
  isActive,
  className = ''
}: {
  onClick: () => void;
  isActive: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      <span className="text-lg">👥</span>
      <span>協作</span>
      {isActive && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
    </button>
  );
}
