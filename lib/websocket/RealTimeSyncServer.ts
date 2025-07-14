import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface SyncMessage {
  type: 'sync' | 'conflict' | 'user-join' | 'user-leave' | 'edit' | 'heartbeat';
  userId: string;
  documentId?: string;
  data?: any;
  timestamp: Date;
}

interface ConnectedUser {
  id: string;
  ws: WebSocket;
  documentId?: string;
  lastActivity: Date;
  isActive: boolean;
}

interface DocumentSession {
  id: string;
  users: Set<string>;
  lastActivity: Date;
  version: number;
  lockHolder?: string;
  lockExpiry?: Date;
}

export class RealTimeSyncServer extends EventEmitter {
  private wss: WebSocketServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private documentSessions: Map<string, DocumentSession> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  constructor(port: number = 8080) {
    super();
    
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
    this.startHeartbeat();
    this.startCleanup();
    
    console.log(`🚀 實時同步服務器啟動，監聽端口: ${port}`);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleNewConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket 服務器錯誤:', error);
    });
  }

  private handleNewConnection(ws: WebSocket, request: any): void {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId');
    const documentId = url.searchParams.get('documentId');

    if (!userId) {
      console.warn('⚠️ 無效的連接，缺少 userId');
      ws.close(1008, 'Missing userId');
      return;
    }

    const user: ConnectedUser = {
      id: userId,
      ws,
      documentId,
      lastActivity: new Date(),
      isActive: true
    };

    this.connectedUsers.set(userId, user);

    // 如果指定了文檔 ID，加入文檔會話
    if (documentId) {
      this.joinDocumentSession(userId, documentId);
    }

    // 設置消息處理
    ws.on('message', (data: Buffer) => {
      this.handleMessage(userId, data);
    });

    // 設置連接關閉處理
    ws.on('close', () => {
      this.handleDisconnection(userId);
    });

    // 設置錯誤處理
    ws.on('error', (error: Error) => {
      console.error(`用戶 ${userId} 連接錯誤:`, error);
      this.handleDisconnection(userId);
    });

    console.log(`✅ 用戶 ${userId} 已連接${documentId ? ` (文檔: ${documentId})` : ''}`);
    
    // 發送歡迎消息
    this.sendToUser(userId, {
      type: 'user-join',
      userId: 'server',
      data: { message: '歡迎連接到實時同步服務器' },
      timestamp: new Date()
    });

    // 通知其他用戶
    if (documentId) {
      this.broadcastToDocument(documentId, {
        type: 'user-join',
        userId,
        documentId,
        data: { message: `用戶 ${userId} 加入了文檔` },
        timestamp: new Date()
      }, userId);
    }
  }

  private handleMessage(userId: string, data: Buffer): void {
    try {
      const message: SyncMessage = JSON.parse(data.toString());
      const user = this.connectedUsers.get(userId);
      
      if (!user) {
        console.warn(`⚠️ 收到來自未知用戶 ${userId} 的消息`);
        return;
      }

      // 更新用戶活動時間
      user.lastActivity = new Date();

      switch (message.type) {
        case 'sync':
          this.handleSyncMessage(userId, message);
          break;
        
        case 'edit':
          this.handleEditMessage(userId, message);
          break;
        
        case 'heartbeat':
          this.handleHeartbeat(userId, message);
          break;
        
        default:
          console.warn(`⚠️ 未知的消息類型: ${message.type}`);
      }

    } catch (error) {
      console.error(`處理用戶 ${userId} 消息時發生錯誤:`, error);
    }
  }

  private handleSyncMessage(userId: string, message: SyncMessage): void {
    const { documentId, data } = message;
    
    if (!documentId) {
      console.warn('⚠️ 同步消息缺少 documentId');
      return;
    }

    // 檢查文檔鎖定狀態
    const session = this.documentSessions.get(documentId);
    if (session && session.lockHolder && session.lockHolder !== userId) {
      if (session.lockExpiry && session.lockExpiry > new Date()) {
        // 文檔被其他用戶鎖定
        this.sendToUser(userId, {
          type: 'conflict',
          userId: 'server',
          documentId,
          data: { 
            message: `文檔被用戶 ${session.lockHolder} 鎖定`,
            lockHolder: session.lockHolder,
            lockExpiry: session.lockExpiry
          },
          timestamp: new Date()
        });
        return;
      } else {
        // 鎖定已過期，清除鎖定
        session.lockHolder = undefined;
        session.lockExpiry = undefined;
      }
    }

    // 廣播同步消息給文檔中的其他用戶
    this.broadcastToDocument(documentId, {
      type: 'sync',
      userId,
      documentId,
      data,
      timestamp: new Date()
    }, userId);

    // 更新文檔會話
    if (session) {
      session.lastActivity = new Date();
      session.version = (session.version || 0) + 1;
    }

    console.log(`📤 用戶 ${userId} 同步文檔 ${documentId}`);
  }

  private handleEditMessage(userId: string, message: SyncMessage): void {
    const { documentId, data } = message;
    
    if (!documentId) {
      console.warn('⚠️ 編輯消息缺少 documentId');
      return;
    }

    // 獲取或創建文檔鎖定
    const session = this.getOrCreateDocumentSession(documentId);
    
    // 設置編輯鎖定 (5分鐘)
    session.lockHolder = userId;
    session.lockExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // 廣播編輯消息
    this.broadcastToDocument(documentId, {
      type: 'edit',
      userId,
      documentId,
      data: {
        ...data,
        lockHolder: userId,
        lockExpiry: session.lockExpiry
      },
      timestamp: new Date()
    }, userId);

    console.log(`✏️ 用戶 ${userId} 開始編輯文檔 ${documentId}`);
  }

  private handleHeartbeat(userId: string, message: SyncMessage): void {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.lastActivity = new Date();
      user.isActive = true;
      
      // 回應心跳
      this.sendToUser(userId, {
        type: 'heartbeat',
        userId: 'server',
        data: { timestamp: new Date() },
        timestamp: new Date()
      });
    }
  }

  private handleDisconnection(userId: string): void {
    const user = this.connectedUsers.get(userId);
    
    if (user && user.documentId) {
      // 離開文檔會話
      this.leaveDocumentSession(userId, user.documentId);
      
      // 通知其他用戶
      this.broadcastToDocument(user.documentId, {
        type: 'user-leave',
        userId,
        documentId: user.documentId,
        data: { message: `用戶 ${userId} 離開了文檔` },
        timestamp: new Date()
      });
    }

    this.connectedUsers.delete(userId);
    console.log(`❌ 用戶 ${userId} 已斷開連接`);
  }

  private joinDocumentSession(userId: string, documentId: string): void {
    const session = this.getOrCreateDocumentSession(documentId);
    session.users.add(userId);
    session.lastActivity = new Date();
    
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.documentId = documentId;
    }
  }

  private leaveDocumentSession(userId: string, documentId: string): void {
    const session = this.documentSessions.get(documentId);
    if (session) {
      session.users.delete(userId);
      
      // 如果用戶持有鎖定，釋放鎖定
      if (session.lockHolder === userId) {
        session.lockHolder = undefined;
        session.lockExpiry = undefined;
      }
      
      // 如果沒有用戶了，刪除會話
      if (session.users.size === 0) {
        this.documentSessions.delete(documentId);
      }
    }
  }

  private getOrCreateDocumentSession(documentId: string): DocumentSession {
    let session = this.documentSessions.get(documentId);
    
    if (!session) {
      session = {
        id: documentId,
        users: new Set(),
        lastActivity: new Date(),
        version: 0
      };
      this.documentSessions.set(documentId, session);
    }
    
    return session;
  }

  private sendToUser(userId: string, message: SyncMessage): void {
    const user = this.connectedUsers.get(userId);
    
    if (user && user.ws.readyState === WebSocket.OPEN) {
      try {
        user.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`發送消息給用戶 ${userId} 失敗:`, error);
      }
    }
  }

  private broadcastToDocument(documentId: string, message: SyncMessage, excludeUserId?: string): void {
    const session = this.documentSessions.get(documentId);
    
    if (session) {
      session.users.forEach(userId => {
        if (userId !== excludeUserId) {
          this.sendToUser(userId, message);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.connectedUsers.forEach((user, userId) => {
        if (user.ws.readyState === WebSocket.OPEN) {
          // 檢查用戶是否長時間無活動
          const inactiveTime = Date.now() - user.lastActivity.getTime();
          
          if (inactiveTime > 60000) { // 1分鐘無活動
            user.isActive = false;
          }
          
          if (inactiveTime > 300000) { // 5分鐘無活動，斷開連接
            console.log(`⏰ 用戶 ${userId} 長時間無活動，斷開連接`);
            user.ws.close(1000, 'Inactive timeout');
          }
        } else {
          // 連接已關閉，清理用戶
          this.handleDisconnection(userId);
        }
      });
    }, 30000); // 每30秒檢查一次
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      // 清理過期的文檔會話
      this.documentSessions.forEach((session, documentId) => {
        const inactiveTime = Date.now() - session.lastActivity.getTime();
        
        if (inactiveTime > 3600000) { // 1小時無活動
          console.log(`🧹 清理過期的文檔會話: ${documentId}`);
          this.documentSessions.delete(documentId);
        }
      });
    }, 600000); // 每10分鐘清理一次
  }

  public getStatus(): any {
    return {
      connectedUsers: this.connectedUsers.size,
      activeSessions: this.documentSessions.size,
      serverTime: new Date(),
      uptime: process.uptime()
    };
  }

  public shutdown(): void {
    console.log('🔄 正在關閉實時同步服務器...');
    
    // 通知所有用戶服務器即將關閉
    this.connectedUsers.forEach((user, userId) => {
      this.sendToUser(userId, {
        type: 'user-leave',
        userId: 'server',
        data: { message: '服務器即將關閉' },
        timestamp: new Date()
      });
      user.ws.close(1000, 'Server shutdown');
    });

    // 清理定時器
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // 關閉 WebSocket 服務器
    this.wss.close();
    
    console.log('✅ 實時同步服務器已關閉');
  }
}
