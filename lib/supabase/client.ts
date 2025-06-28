/**
 * Supabase 客戶端配置 - 與 Neon 數據庫集成
 * 提供實時功能支持
 */

import { createClient } from '@supabase/supabase-js'
import { RealtimeClient } from '@supabase/realtime-js'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// 創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 創建專用的 Realtime 客戶端
export const realtimeClient = new RealtimeClient(
  `${supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/realtime/v1`,
  {
    params: {
      apikey: supabaseAnonKey,
      eventsPerSecond: 10,
    },
  }
)

// 實時協作管理器
export class RealtimeCollaborationManager {
  private channels: Map<string, any> = new Map()
  private presenceStates: Map<string, any> = new Map()

  // 加入協作會話
  async joinSession(sessionId: string, userId: string, userData: any = {}) {
    const channelName = `collaboration_${sessionId}`
    
    // 如果已經在會話中，先離開
    if (this.channels.has(channelName)) {
      await this.leaveSession(sessionId)
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // 監聽 presence 變化
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        this.presenceStates.set(sessionId, newState)
        this.onPresenceSync?.(sessionId, newState)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.onUserJoin?.(sessionId, key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.onUserLeave?.(sessionId, key, leftPresences)
      })

    // 監聽廣播消息
    channel.on('broadcast', { event: 'edit-operation' }, (payload) => {
      this.onEditOperation?.(sessionId, payload)
    })

    channel.on('broadcast', { event: 'cursor-update' }, (payload) => {
      this.onCursorUpdate?.(sessionId, payload)
    })

    channel.on('broadcast', { event: 'comment-added' }, (payload) => {
      this.onCommentAdded?.(sessionId, payload)
    })

    // 訂閱頻道
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // 加入 presence
        await channel.track({
          userId,
          username: userData.username || userId,
          avatar: userData.avatar,
          joinedAt: new Date().toISOString(),
          ...userData,
        })
      }
    })

    this.channels.set(channelName, channel)
    return channel
  }

  // 離開協作會話
  async leaveSession(sessionId: string) {
    const channelName = `collaboration_${sessionId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.untrack()
      await supabase.removeChannel(channel)
      this.channels.delete(channelName)
      this.presenceStates.delete(sessionId)
    }
  }

  // 發送編輯操作
  async sendEditOperation(sessionId: string, operation: any) {
    const channelName = `collaboration_${sessionId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'edit-operation',
        payload: {
          operation,
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  // 發送游標更新
  async sendCursorUpdate(sessionId: string, cursor: any) {
    const channelName = `collaboration_${sessionId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'cursor-update',
        payload: {
          cursor,
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  // 發送評論
  async sendComment(sessionId: string, comment: any) {
    const channelName = `collaboration_${sessionId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'comment-added',
        payload: {
          comment,
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  // 獲取會話參與者
  getSessionParticipants(sessionId: string) {
    const presenceState = this.presenceStates.get(sessionId) || {}
    return Object.keys(presenceState).map(key => presenceState[key][0])
  }

  // 事件回調函數（可以被外部設置）
  onPresenceSync?: (sessionId: string, presenceState: any) => void
  onUserJoin?: (sessionId: string, userId: string, userData: any) => void
  onUserLeave?: (sessionId: string, userId: string, userData: any) => void
  onEditOperation?: (sessionId: string, payload: any) => void
  onCursorUpdate?: (sessionId: string, payload: any) => void
  onCommentAdded?: (sessionId: string, payload: any) => void

  // 清理所有連接
  async cleanup() {
    for (const [channelName, channel] of this.channels) {
      await channel.untrack()
      await supabase.removeChannel(channel)
    }
    this.channels.clear()
    this.presenceStates.clear()
  }
}

// 創建全局實例
export const collaborationManager = new RealtimeCollaborationManager()

// 數據庫實時監聽管理器
export class DatabaseRealtimeManager {
  private subscriptions: Map<string, any> = new Map()

  // 監聽活動變更
  subscribeToActivity(activityId: string, callback: (payload: any) => void) {
    const subscriptionKey = `activity_${activityId}`
    
    const channel = supabase
      .channel(subscriptionKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Activity',
          filter: `id=eq.${activityId}`,
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(subscriptionKey, channel)
    return channel
  }

  // 監聽用戶進度變更
  subscribeToUserProgress(userId: string, callback: (payload: any) => void) {
    const subscriptionKey = `progress_${userId}`
    
    const channel = supabase
      .channel(subscriptionKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Session',
          filter: `userId=eq.${userId}`,
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(subscriptionKey, channel)
    return channel
  }

  // 監聽評論變更
  subscribeToComments(activityId: string, callback: (payload: any) => void) {
    const subscriptionKey = `comments_${activityId}`
    
    const channel = supabase
      .channel(subscriptionKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Comment',
          filter: `activityId=eq.${activityId}`,
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(subscriptionKey, channel)
    return channel
  }

  // 取消訂閱
  unsubscribe(subscriptionKey: string) {
    const channel = this.subscriptions.get(subscriptionKey)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(subscriptionKey)
    }
  }

  // 清理所有訂閱
  cleanup() {
    for (const [key, channel] of this.subscriptions) {
      supabase.removeChannel(channel)
    }
    this.subscriptions.clear()
  }
}

// 創建全局實例
export const databaseManager = new DatabaseRealtimeManager()

// 連接狀態管理
export const connectionStatus = {
  isConnected: false,
  lastConnected: null as Date | null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
}

// 監聽連接狀態
supabase.realtime.onOpen(() => {
  connectionStatus.isConnected = true
  connectionStatus.lastConnected = new Date()
  connectionStatus.reconnectAttempts = 0
  console.log('Supabase Realtime 連接已建立')
})

supabase.realtime.onClose(() => {
  connectionStatus.isConnected = false
  console.log('Supabase Realtime 連接已關閉')
})

supabase.realtime.onError((error) => {
  console.error('Supabase Realtime 錯誤:', error)
  connectionStatus.reconnectAttempts++
})

// 導出類型定義
export type {
  RealtimeCollaborationManager,
  DatabaseRealtimeManager,
}

// 清理函數（在應用關閉時調用）
export const cleanup = async () => {
  await collaborationManager.cleanup()
  databaseManager.cleanup()
}
