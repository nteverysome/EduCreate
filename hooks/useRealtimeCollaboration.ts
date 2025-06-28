/**
 * 實時協作 React Hook
 * 使用 Supabase Realtime 提供協作功能
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { collaborationManager, databaseManager } from '../lib/supabase/client'

export interface CollaborationUser {
  userId: string
  username: string
  avatar?: string
  joinedAt: string
  cursor?: {
    x: number
    y: number
    elementId?: string
  }
  selection?: {
    start: number
    end: number
    elementId?: string
  }
}

export interface EditOperation {
  type: 'insert' | 'delete' | 'update' | 'move'
  elementId: string
  position?: number
  content?: any
  oldContent?: any
  userId: string
  timestamp: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  username: string
  position: {
    x: number
    y: number
    elementId?: string
  }
  timestamp: string
  replies?: Comment[]
}

export interface UseRealtimeCollaborationOptions {
  sessionId: string
  userId: string
  username: string
  avatar?: string
  autoJoin?: boolean
  enableCursor?: boolean
  enableComments?: boolean
}

export function useRealtimeCollaboration({
  sessionId,
  userId,
  username,
  avatar,
  autoJoin = true,
  enableCursor = true,
  enableComments = true,
}: UseRealtimeCollaborationOptions) {
  // 狀態管理
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<CollaborationUser[]>([])
  const [editOperations, setEditOperations] = useState<EditOperation[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const isJoinedRef = useRef(false)
  const lastCursorUpdate = useRef<number>(0)

  // 加入協作會話
  const joinSession = useCallback(async () => {
    if (isJoinedRef.current || isJoining) return

    setIsJoining(true)
    setError(null)

    try {
      await collaborationManager.joinSession(sessionId, userId, {
        username,
        avatar,
      })

      isJoinedRef.current = true
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入會話失敗')
      console.error('加入協作會話失敗:', err)
    } finally {
      setIsJoining(false)
    }
  }, [sessionId, userId, username, avatar, isJoining])

  // 離開協作會話
  const leaveSession = useCallback(async () => {
    if (!isJoinedRef.current) return

    try {
      await collaborationManager.leaveSession(sessionId)
      isJoinedRef.current = false
      setIsConnected(false)
      setParticipants([])
    } catch (err) {
      console.error('離開協作會話失敗:', err)
    }
  }, [sessionId])

  // 發送編輯操作
  const sendEditOperation = useCallback(async (operation: Omit<EditOperation, 'userId' | 'timestamp'>) => {
    if (!isConnected) return

    const fullOperation: EditOperation = {
      ...operation,
      userId,
      timestamp: new Date().toISOString(),
    }

    try {
      await collaborationManager.sendEditOperation(sessionId, fullOperation)
      
      // 本地立即更新
      setEditOperations(prev => [...prev, fullOperation])
    } catch (err) {
      console.error('發送編輯操作失敗:', err)
    }
  }, [isConnected, sessionId, userId])

  // 更新游標位置
  const updateCursor = useCallback(async (cursor: { x: number; y: number; elementId?: string }) => {
    if (!isConnected || !enableCursor) return

    // 限制游標更新頻率
    const now = Date.now()
    if (now - lastCursorUpdate.current < 100) return // 最多每100ms更新一次
    lastCursorUpdate.current = now

    try {
      await collaborationManager.sendCursorUpdate(sessionId, {
        userId,
        cursor,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('更新游標失敗:', err)
    }
  }, [isConnected, enableCursor, sessionId, userId])

  // 添加評論
  const addComment = useCallback(async (comment: Omit<Comment, 'id' | 'userId' | 'username' | 'timestamp'>) => {
    if (!isConnected || !enableComments) return

    const fullComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      timestamp: new Date().toISOString(),
    }

    try {
      await collaborationManager.sendComment(sessionId, fullComment)
      
      // 本地立即更新
      setComments(prev => [...prev, fullComment])
    } catch (err) {
      console.error('添加評論失敗:', err)
    }
  }, [isConnected, enableComments, sessionId, userId, username])

  // 設置事件監聽器
  useEffect(() => {
    // Presence 同步
    collaborationManager.onPresenceSync = (sid, presenceState) => {
      if (sid === sessionId) {
        const users = Object.keys(presenceState).map(key => presenceState[key][0])
        setParticipants(users)
      }
    }

    // 用戶加入
    collaborationManager.onUserJoin = (sid, userKey, userData) => {
      if (sid === sessionId) {
        console.log('用戶加入:', userKey, userData)
      }
    }

    // 用戶離開
    collaborationManager.onUserLeave = (sid, userKey, userData) => {
      if (sid === sessionId) {
        console.log('用戶離開:', userKey, userData)
      }
    }

    // 編輯操作
    collaborationManager.onEditOperation = (sid, payload) => {
      if (sid === sessionId) {
        setEditOperations(prev => [...prev, payload.operation])
      }
    }

    // 游標更新
    collaborationManager.onCursorUpdate = (sid, payload) => {
      if (sid === sessionId && enableCursor) {
        setParticipants(prev => 
          prev.map(p => 
            p.userId === payload.cursor.userId 
              ? { ...p, cursor: payload.cursor.cursor }
              : p
          )
        )
      }
    }

    // 評論添加
    collaborationManager.onCommentAdded = (sid, payload) => {
      if (sid === sessionId && enableComments) {
        setComments(prev => [...prev, payload.comment])
      }
    }

    return () => {
      // 清理事件監聽器
      collaborationManager.onPresenceSync = undefined
      collaborationManager.onUserJoin = undefined
      collaborationManager.onUserLeave = undefined
      collaborationManager.onEditOperation = undefined
      collaborationManager.onCursorUpdate = undefined
      collaborationManager.onCommentAdded = undefined
    }
  }, [sessionId, enableCursor, enableComments])

  // 自動加入會話
  useEffect(() => {
    if (autoJoin && !isJoinedRef.current && !isJoining) {
      joinSession()
    }

    return () => {
      if (isJoinedRef.current) {
        leaveSession()
      }
    }
  }, [autoJoin, joinSession, leaveSession, isJoining])

  // 獲取其他用戶的游標
  const getOtherCursors = useCallback(() => {
    return participants
      .filter(p => p.userId !== userId && p.cursor)
      .map(p => ({
        userId: p.userId,
        username: p.username,
        cursor: p.cursor!,
      }))
  }, [participants, userId])

  // 獲取會話統計
  const getSessionStats = useCallback(() => {
    return {
      participantCount: participants.length,
      editOperationCount: editOperations.length,
      commentCount: comments.length,
      isActive: isConnected && participants.length > 1,
    }
  }, [participants, editOperations, comments, isConnected])

  return {
    // 狀態
    isConnected,
    isJoining,
    error,
    participants,
    editOperations,
    comments,

    // 操作
    joinSession,
    leaveSession,
    sendEditOperation,
    updateCursor,
    addComment,

    // 輔助函數
    getOtherCursors,
    getSessionStats,

    // 便利屬性
    isActive: isConnected && participants.length > 1,
    otherParticipants: participants.filter(p => p.userId !== userId),
  }
}

// 數據庫實時監聽 Hook
export function useRealtimeDatabase(options: {
  activityId?: string
  userId?: string
  enableActivityUpdates?: boolean
  enableProgressUpdates?: boolean
  enableCommentUpdates?: boolean
}) {
  const {
    activityId,
    userId,
    enableActivityUpdates = true,
    enableProgressUpdates = true,
    enableCommentUpdates = true,
  } = options

  const [activityUpdates, setActivityUpdates] = useState<any[]>([])
  const [progressUpdates, setProgressUpdates] = useState<any[]>([])
  const [commentUpdates, setCommentUpdates] = useState<any[]>([])

  useEffect(() => {
    const subscriptions: any[] = []

    // 監聽活動更新
    if (activityId && enableActivityUpdates) {
      const sub = databaseManager.subscribeToActivity(activityId, (payload) => {
        setActivityUpdates(prev => [...prev, payload])
      })
      subscriptions.push(() => databaseManager.unsubscribe(`activity_${activityId}`))
    }

    // 監聽用戶進度更新
    if (userId && enableProgressUpdates) {
      const sub = databaseManager.subscribeToUserProgress(userId, (payload) => {
        setProgressUpdates(prev => [...prev, payload])
      })
      subscriptions.push(() => databaseManager.unsubscribe(`progress_${userId}`))
    }

    // 監聽評論更新
    if (activityId && enableCommentUpdates) {
      const sub = databaseManager.subscribeToComments(activityId, (payload) => {
        setCommentUpdates(prev => [...prev, payload])
      })
      subscriptions.push(() => databaseManager.unsubscribe(`comments_${activityId}`))
    }

    return () => {
      subscriptions.forEach(cleanup => cleanup())
    }
  }, [activityId, userId, enableActivityUpdates, enableProgressUpdates, enableCommentUpdates])

  return {
    activityUpdates,
    progressUpdates,
    commentUpdates,
  }
}
