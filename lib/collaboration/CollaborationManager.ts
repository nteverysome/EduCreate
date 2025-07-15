/**
 * CollaborationManager - 實時協作編輯系統
 * 實現多用戶同時編輯、版本歷史、變更追蹤和衝突解決功能
 */

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // 用戶標識顏色
  cursor?: {
    position: number;
    selection?: { start: number; end: number };
  };
  lastActivity: number;
  isOnline: boolean;
}

export interface ContentChange {
  id: string;
  userId: string;
  timestamp: number;
  type: 'insert' | 'delete' | 'format' | 'replace';
  position: number;
  length?: number;
  content?: string;
  oldContent?: string;
  metadata?: {
    formatting?: Record<string, any>;
    source?: 'user' | 'ai' | 'system';
  };
}

export interface ContentVersion {
  id: string;
  content: string;
  timestamp: number;
  userId: string;
  changes: ContentChange[];
  checksum: string;
  parentVersion?: string;
}

export interface CollaborationSession {
  id: string;
  documentId: string;
  users: Map<string, CollaborationUser>;
  currentVersion: ContentVersion;
  versions: ContentVersion[];
  changes: ContentChange[];
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
}

export interface ConflictResolution {
  conflictId: string;
  changes: ContentChange[];
  resolution: 'merge' | 'override' | 'manual';
  resolvedBy: string;
  resolvedAt: number;
  finalContent: string;
}

export interface CollaborationEvent {
  type: 'user-join' | 'user-leave' | 'content-change' | 'cursor-move' | 'version-create' | 'conflict-detected';
  userId: string;
  timestamp: number;
  data: any;
}

export class CollaborationManager {
  private sessions: Map<string, CollaborationSession> = new Map();
  private websocket: WebSocket | null = null;
  private currentUser: CollaborationUser | null = null;
  private currentSession: CollaborationSession | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // 事件監聽器
  private userListeners: Set<(users: CollaborationUser[]) => void> = new Set();
  private changeListeners: Set<(change: ContentChange) => void> = new Set();
  private versionListeners: Set<(version: ContentVersion) => void> = new Set();
  private conflictListeners: Set<(conflict: ConflictResolution) => void> = new Set();
  private connectionListeners: Set<(status: 'connected' | 'disconnected' | 'reconnecting') => void> = new Set();

  // 性能監控
  private performanceMetrics = {
    averageLatency: 0,
    messagesSent: 0,
    messagesReceived: 0,
    conflictsResolved: 0,
    lastLatencyCheck: Date.now()
  };

  constructor() {
    this.initializeWebSocket();
    this.startHeartbeat();
  }

  /**
   * 初始化WebSocket連接
   */
  private initializeWebSocket(): void {
    try {
      // 在實際應用中，這裡會連接到真實的WebSocket服務器
      // 現在我們模擬WebSocket行為
      this.simulateWebSocketConnection();
    } catch (error) {
      console.error('WebSocket初始化失敗:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * 模擬WebSocket連接（用於演示）
   */
  private simulateWebSocketConnection(): void {
    // 模擬連接成功
    setTimeout(() => {
      this.notifyConnectionListeners('connected');
      this.reconnectAttempts = 0;
    }, 1000);

    // 模擬接收消息
    this.simulateIncomingMessages();
  }

  /**
   * 模擬接收消息
   */
  private simulateIncomingMessages(): void {
    // 模擬其他用戶的活動
    setInterval(() => {
      if (this.currentSession && this.currentSession.users.size > 1) {
        this.simulateUserActivity();
      }
    }, 5000);
  }

  /**
   * 模擬用戶活動
   */
  private simulateUserActivity(): void {
    if (!this.currentSession) return;

    const otherUsers = Array.from(this.currentSession.users.values())
      .filter(user => user.id !== this.currentUser?.id);

    if (otherUsers.length > 0) {
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      
      // 模擬光標移動
      randomUser.cursor = {
        position: Math.floor(Math.random() * 1000),
        selection: Math.random() > 0.7 ? {
          start: Math.floor(Math.random() * 1000),
          end: Math.floor(Math.random() * 1000) + 50
        } : undefined
      };
      randomUser.lastActivity = Date.now();

      this.notifyUserListeners();
    }
  }

  /**
   * 加入協作會話
   */
  async joinSession(documentId: string, user: CollaborationUser): Promise<CollaborationSession> {
    this.currentUser = user;

    let session = this.sessions.get(documentId);
    if (!session) {
      session = {
        id: this.generateId(),
        documentId,
        users: new Map(),
        currentVersion: {
          id: this.generateId(),
          content: '',
          timestamp: Date.now(),
          userId: user.id,
          changes: [],
          checksum: this.calculateChecksum('')
        },
        versions: [],
        changes: [],
        isActive: true,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      this.sessions.set(documentId, session);
    }

    // 添加用戶到會話
    user.isOnline = true;
    user.lastActivity = Date.now();
    session.users.set(user.id, user);
    session.lastActivity = Date.now();

    this.currentSession = session;

    // 通知其他用戶
    this.broadcastEvent({
      type: 'user-join',
      userId: user.id,
      timestamp: Date.now(),
      data: user
    });

    this.notifyUserListeners();
    return session;
  }

  /**
   * 離開協作會話
   */
  async leaveSession(): Promise<void> {
    if (!this.currentSession || !this.currentUser) return;

    // 從會話中移除用戶
    this.currentSession.users.delete(this.currentUser.id);

    // 通知其他用戶
    this.broadcastEvent({
      type: 'user-leave',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: this.currentUser
    });

    this.notifyUserListeners();

    // 如果沒有用戶了，標記會話為非活躍
    if (this.currentSession.users.size === 0) {
      this.currentSession.isActive = false;
    }

    this.currentSession = null;
    this.currentUser = null;
  }

  /**
   * 應用內容變更
   */
  async applyChange(change: Omit<ContentChange, 'id' | 'timestamp'>): Promise<ContentChange> {
    if (!this.currentSession || !this.currentUser) {
      throw new Error('沒有活躍的協作會話');
    }

    const fullChange: ContentChange = {
      ...change,
      id: this.generateId(),
      timestamp: Date.now()
    };

    // 檢測衝突
    const conflicts = this.detectConflicts(fullChange);
    if (conflicts.length > 0) {
      await this.resolveConflicts(conflicts, fullChange);
    }

    // 應用變更
    this.currentSession.changes.push(fullChange);
    this.currentSession.lastActivity = Date.now();

    // 更新當前版本
    const newContent = this.applyChangeToContent(
      this.currentSession.currentVersion.content,
      fullChange
    );

    const newVersion: ContentVersion = {
      id: this.generateId(),
      content: newContent,
      timestamp: Date.now(),
      userId: this.currentUser.id,
      changes: [fullChange],
      checksum: this.calculateChecksum(newContent),
      parentVersion: this.currentSession.currentVersion.id
    };

    this.currentSession.currentVersion = newVersion;
    this.currentSession.versions.push(newVersion);

    // 廣播變更
    this.broadcastEvent({
      type: 'content-change',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: fullChange
    });

    this.notifyChangeListeners(fullChange);
    this.notifyVersionListeners(newVersion);

    return fullChange;
  }

  /**
   * 更新用戶光標位置
   */
  updateCursor(position: number, selection?: { start: number; end: number }): void {
    if (!this.currentUser || !this.currentSession) return;

    this.currentUser.cursor = { position, selection };
    this.currentUser.lastActivity = Date.now();

    // 更新會話中的用戶信息
    this.currentSession.users.set(this.currentUser.id, this.currentUser);

    // 廣播光標移動
    this.broadcastEvent({
      type: 'cursor-move',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: { position, selection }
    });

    this.notifyUserListeners();
  }

  /**
   * 創建版本快照
   */
  async createVersion(content: string, description?: string): Promise<ContentVersion> {
    if (!this.currentSession || !this.currentUser) {
      throw new Error('沒有活躍的協作會話');
    }

    const version: ContentVersion = {
      id: this.generateId(),
      content,
      timestamp: Date.now(),
      userId: this.currentUser.id,
      changes: [...this.currentSession.changes],
      checksum: this.calculateChecksum(content),
      parentVersion: this.currentSession.currentVersion.id
    };

    this.currentSession.versions.push(version);
    this.currentSession.currentVersion = version;
    this.currentSession.changes = []; // 清空變更歷史

    // 廣播版本創建
    this.broadcastEvent({
      type: 'version-create',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: { version, description }
    });

    this.notifyVersionListeners(version);
    return version;
  }

  /**
   * 回滾到指定版本
   */
  async rollbackToVersion(versionId: string): Promise<ContentVersion> {
    if (!this.currentSession) {
      throw new Error('沒有活躍的協作會話');
    }

    const targetVersion = this.currentSession.versions.find(v => v.id === versionId);
    if (!targetVersion) {
      throw new Error('版本不存在');
    }

    // 創建回滾變更
    const rollbackChange: ContentChange = {
      id: this.generateId(),
      userId: this.currentUser?.id || 'system',
      timestamp: Date.now(),
      type: 'replace',
      position: 0,
      length: this.currentSession.currentVersion.content.length,
      content: targetVersion.content,
      oldContent: this.currentSession.currentVersion.content,
      metadata: { source: 'system' }
    };

    // 創建新版本
    const newVersion: ContentVersion = {
      id: this.generateId(),
      content: targetVersion.content,
      timestamp: Date.now(),
      userId: this.currentUser?.id || 'system',
      changes: [rollbackChange],
      checksum: targetVersion.checksum,
      parentVersion: this.currentSession.currentVersion.id
    };

    this.currentSession.currentVersion = newVersion;
    this.currentSession.versions.push(newVersion);
    this.currentSession.changes = [];

    this.notifyChangeListeners(rollbackChange);
    this.notifyVersionListeners(newVersion);

    return newVersion;
  }

  /**
   * 檢測衝突
   */
  private detectConflicts(change: ContentChange): ContentChange[] {
    if (!this.currentSession) return [];

    const recentChanges = this.currentSession.changes.filter(
      c => c.timestamp > Date.now() - 5000 && // 5秒內的變更
           c.userId !== change.userId && // 不是同一用戶
           this.isPositionOverlap(c, change) // 位置重疊
    );

    return recentChanges;
  }

  /**
   * 檢查位置重疊
   */
  private isPositionOverlap(change1: ContentChange, change2: ContentChange): boolean {
    const end1 = change1.position + (change1.length || 0);
    const end2 = change2.position + (change2.length || 0);
    
    return !(end1 <= change2.position || end2 <= change1.position);
  }

  /**
   * 解決衝突
   */
  private async resolveConflicts(conflicts: ContentChange[], newChange: ContentChange): Promise<ConflictResolution> {
    const resolution: ConflictResolution = {
      conflictId: this.generateId(),
      changes: [...conflicts, newChange],
      resolution: 'merge', // 默認合併策略
      resolvedBy: this.currentUser?.id || 'system',
      resolvedAt: Date.now(),
      finalContent: ''
    };

    // 簡單的合併策略：按時間順序應用變更
    let content = this.currentSession?.currentVersion.content || '';
    const sortedChanges = [...conflicts, newChange].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const change of sortedChanges) {
      content = this.applyChangeToContent(content, change);
    }

    resolution.finalContent = content;

    // 廣播衝突解決
    this.broadcastEvent({
      type: 'conflict-detected',
      userId: this.currentUser?.id || 'system',
      timestamp: Date.now(),
      data: resolution
    });

    this.notifyConflictListeners(resolution);
    this.performanceMetrics.conflictsResolved++;

    return resolution;
  }

  /**
   * 應用變更到內容
   */
  private applyChangeToContent(content: string, change: ContentChange): string {
    switch (change.type) {
      case 'insert':
        return content.slice(0, change.position) + 
               (change.content || '') + 
               content.slice(change.position);
      
      case 'delete':
        return content.slice(0, change.position) + 
               content.slice(change.position + (change.length || 0));
      
      case 'replace':
        return content.slice(0, change.position) + 
               (change.content || '') + 
               content.slice(change.position + (change.length || 0));
      
      default:
        return content;
    }
  }

  /**
   * 廣播事件
   */
  private broadcastEvent(event: CollaborationEvent): void {
    // 在實際應用中，這裡會通過WebSocket發送事件
    // 現在我們模擬廣播行為
    this.performanceMetrics.messagesSent++;
    
    // 模擬網絡延遲
    setTimeout(() => {
      this.handleIncomingEvent(event);
    }, Math.random() * 50 + 10); // 10-60ms延遲
  }

  /**
   * 處理接收到的事件
   */
  private handleIncomingEvent(event: CollaborationEvent): void {
    this.performanceMetrics.messagesReceived++;
    
    // 計算延遲
    const latency = Date.now() - event.timestamp;
    this.updateLatencyMetrics(latency);

    // 處理不同類型的事件
    switch (event.type) {
      case 'user-join':
      case 'user-leave':
      case 'cursor-move':
        this.notifyUserListeners();
        break;
      
      case 'content-change':
        // 在實際應用中，這裡會處理遠程變更
        break;
      
      case 'version-create':
        // 處理版本創建事件
        break;
    }
  }

  /**
   * 更新延遲指標
   */
  private updateLatencyMetrics(latency: number): void {
    const alpha = 0.1; // 平滑因子
    this.performanceMetrics.averageLatency = 
      this.performanceMetrics.averageLatency * (1 - alpha) + latency * alpha;
  }

  /**
   * 開始心跳檢測
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.currentSession) {
        // 檢查用戶活躍狀態
        this.checkUserActivity();
        
        // 發送心跳
        this.sendHeartbeat();
      }
    }, 30000); // 30秒心跳
  }

  /**
   * 檢查用戶活躍狀態
   */
  private checkUserActivity(): void {
    if (!this.currentSession) return;

    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5分鐘

    this.currentSession.users.forEach(user => {
      if (now - user.lastActivity > inactiveThreshold) {
        user.isOnline = false;
      }
    });

    this.notifyUserListeners();
  }

  /**
   * 發送心跳
   */
  private sendHeartbeat(): void {
    if (this.currentUser) {
      this.currentUser.lastActivity = Date.now();
      this.currentUser.isOnline = true;
    }
  }

  /**
   * 計劃重連
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyConnectionListeners('disconnected');
      return;
    }

    this.notifyConnectionListeners('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 指數退避
    setTimeout(() => {
      this.initializeWebSocket();
    }, delay);
  }

  /**
   * 計算校驗和
   */
  private calculateChecksum(content: string): string {
    // 簡單的校驗和計算
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為32位整數
    }
    return hash.toString(16);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 監聽器管理方法
  addUserListener(listener: (users: CollaborationUser[]) => void): void {
    this.userListeners.add(listener);
  }

  removeUserListener(listener: (users: CollaborationUser[]) => void): void {
    this.userListeners.delete(listener);
  }

  addChangeListener(listener: (change: ContentChange) => void): void {
    this.changeListeners.add(listener);
  }

  removeChangeListener(listener: (change: ContentChange) => void): void {
    this.changeListeners.delete(listener);
  }

  addVersionListener(listener: (version: ContentVersion) => void): void {
    this.versionListeners.add(listener);
  }

  removeVersionListener(listener: (version: ContentVersion) => void): void {
    this.versionListeners.delete(listener);
  }

  addConflictListener(listener: (conflict: ConflictResolution) => void): void {
    this.conflictListeners.add(listener);
  }

  removeConflictListener(listener: (conflict: ConflictResolution) => void): void {
    this.conflictListeners.delete(listener);
  }

  addConnectionListener(listener: (status: 'connected' | 'disconnected' | 'reconnecting') => void): void {
    this.connectionListeners.add(listener);
  }

  removeConnectionListener(listener: (status: 'connected' | 'disconnected' | 'reconnecting') => void): void {
    this.connectionListeners.delete(listener);
  }

  // 通知方法
  private notifyUserListeners(): void {
    const users = this.currentSession ? Array.from(this.currentSession.users.values()) : [];
    this.userListeners.forEach(listener => listener(users));
  }

  private notifyChangeListeners(change: ContentChange): void {
    this.changeListeners.forEach(listener => listener(change));
  }

  private notifyVersionListeners(version: ContentVersion): void {
    this.versionListeners.forEach(listener => listener(version));
  }

  private notifyConflictListeners(conflict: ConflictResolution): void {
    this.conflictListeners.forEach(listener => listener(conflict));
  }

  private notifyConnectionListeners(status: 'connected' | 'disconnected' | 'reconnecting'): void {
    this.connectionListeners.forEach(listener => listener(status));
  }

  /**
   * 獲取當前會話
   */
  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): CollaborationUser | null {
    return this.currentUser;
  }

  /**
   * 獲取性能指標
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * 獲取版本歷史
   */
  getVersionHistory(): ContentVersion[] {
    return this.currentSession?.versions || [];
  }

  /**
   * 獲取變更歷史
   */
  getChangeHistory(): ContentChange[] {
    return this.currentSession?.changes || [];
  }

  /**
   * 格式化延遲時間
   */
  formatLatency(latency: number): string {
    if (latency < 100) return `${latency.toFixed(0)}ms`;
    if (latency < 1000) return `${latency.toFixed(0)}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  }

  /**
   * 獲取連接狀態
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
      return 'reconnecting';
    }
    return this.websocket ? 'connected' : 'disconnected';
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.websocket) {
      this.websocket.close();
    }

    this.userListeners.clear();
    this.changeListeners.clear();
    this.versionListeners.clear();
    this.conflictListeners.clear();
    this.connectionListeners.clear();
  }
}
