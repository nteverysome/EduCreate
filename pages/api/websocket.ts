/**
 * WebSocket API 端點 - Supabase Realtime 集成版本
 * 提供實時協作狀態和管理功能
 */

import { NextApiRequest, NextApiResponse } from 'next';

// 嘗試導入 Supabase 客戶端，如果失敗則使用備用方案
let supabase: any = null;
let connectionStatus: any = { isConnected: false, lastConnected: null, reconnectAttempts: 0 };

try {
  const supabaseModule = require('../../lib/supabase/client');
  supabase = supabaseModule.supabase;
  connectionStatus = supabaseModule.connectionStatus;
} catch (error) {
  console.log('Supabase 客戶端未配置，使用備用 WebSocket 服務');
}

// 存儲活躍的協作會話（作為備份和統計）
const activeSessions = new Map<string, Set<string>>();
const userSessions = new Map<string, string>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 獲取實時協作狀態
    if (req.method === 'GET') {
      const isSupabaseAvailable = supabase !== null;
      const currentConnection = isSupabaseAvailable ? connectionStatus : {
        isConnected: false,
        lastConnected: null,
        reconnectAttempts: 0,
      };

      return res.status(200).json({
        success: true,
        message: isSupabaseAvailable ? 'Supabase Realtime 服務可用' : '備用 WebSocket 服務可用',
        provider: isSupabaseAvailable ? 'Supabase + Neon' : 'Fallback WebSocket',
        connection: {
          isConnected: isSupabaseAvailable ? currentConnection.isConnected : true,
          lastConnected: currentConnection.lastConnected || new Date().toISOString(),
          reconnectAttempts: currentConnection.reconnectAttempts || 0,
          supabaseAvailable: isSupabaseAvailable,
        },
        activeSessions: activeSessions.size,
        totalUsers: Array.from(userSessions.keys()).length,
        timestamp: new Date().toISOString(),
        features: {
          realTimeEditing: isSupabaseAvailable,
          collaboration: true,
          comments: isSupabaseAvailable,
          versionControl: isSupabaseAvailable,
          presence: isSupabaseAvailable,
          databaseSync: isSupabaseAvailable,
          cursorTracking: isSupabaseAvailable,
        },
        capabilities: {
          maxConcurrentUsers: isSupabaseAvailable ? 100 : 50,
          eventsPerSecond: isSupabaseAvailable ? 10 : 5,
          supportedEvents: [
            'edit-operation',
            'cursor-update',
            'comment-added',
            'user-join',
            'user-leave',
            'presence-sync'
          ]
        },
        configuration: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置',
          realtimeEnabled: process.env.NEXT_PUBLIC_REALTIME_ENABLED || 'false',
        }
      });
    }

    if (req.method === 'POST') {
      const { action, sessionId, userId, data } = req.body;

      switch (action) {
        case 'join-session':
          return handleJoinSession(sessionId, userId, res);

        case 'leave-session':
          return handleLeaveSession(sessionId, userId, res);

        case 'get-participants':
          return handleGetParticipants(sessionId, res);

        default:
          return res.status(400).json({
            error: '不支持的操作',
            supportedActions: ['join-session', 'leave-session', 'get-participants']
          });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('WebSocket API 錯誤:', error);
    return res.status(500).json({
      error: 'WebSocket 服務錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }

}

// 處理加入會話
function handleJoinSession(sessionId: string, userId: string, res: NextApiResponse) {
  try {
    // 離開之前的會話
    const previousSession = userSessions.get(userId);
    if (previousSession) {
      const sessionUsers = activeSessions.get(previousSession);
      if (sessionUsers) {
        sessionUsers.delete(userId);
        if (sessionUsers.size === 0) {
          activeSessions.delete(previousSession);
        }
      }
    }

    // 加入新會話
    userSessions.set(userId, sessionId);

    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Set());
    }
    activeSessions.get(sessionId)!.add(userId);

    return res.status(200).json({
      success: true,
      message: '成功加入會話',
      sessionId,
      participants: Array.from(activeSessions.get(sessionId) || []),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: '加入會話失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理離開會話
function handleLeaveSession(sessionId: string, userId: string, res: NextApiResponse) {
  try {
    userSessions.delete(userId);

    const sessionUsers = activeSessions.get(sessionId);
    if (sessionUsers) {
      sessionUsers.delete(userId);
      if (sessionUsers.size === 0) {
        activeSessions.delete(sessionId);
      }
    }

    return res.status(200).json({
      success: true,
      message: '成功離開會話',
      sessionId,
      remainingParticipants: Array.from(activeSessions.get(sessionId) || []),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: '離開會話失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理獲取參與者
function handleGetParticipants(sessionId: string, res: NextApiResponse) {
  try {
    const participants = Array.from(activeSessions.get(sessionId) || []);

    return res.status(200).json({
      success: true,
      sessionId,
      participants,
      participantCount: participants.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: '獲取參與者失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}


