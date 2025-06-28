/**
 * 實時協作系統 - 第三階段
 * 支持多用戶實時協作編輯、評論、版本控制等功能
 */

export interface CollaborationSession {
  id: string;
  activityId: string;
  ownerId: string;
  participants: Participant[];
  permissions: SessionPermissions;
  status: 'active' | 'paused' | 'ended';
  createdAt: Date;
  lastActiveAt: Date;
  settings: SessionSettings;
}

export interface Participant {
  userId: string;
  username: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  status: 'online' | 'away' | 'offline';
  cursor?: CursorPosition;
  selection?: SelectionRange;
  joinedAt: Date;
  lastSeenAt: Date;
  permissions: UserPermissions;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  timestamp: Date;
}

export interface SelectionRange {
  startElementId: string;
  endElementId: string;
  startOffset: number;
  endOffset: number;
  timestamp: Date;
}

export interface SessionPermissions {
  allowEdit: boolean;
  allowComment: boolean;
  allowShare: boolean;
  allowExport: boolean;
  requireApproval: boolean;
  maxParticipants: number;
}

export interface UserPermissions {
  canEdit: boolean;
  canComment: boolean;
  canViewHistory: boolean;
  canInviteOthers: boolean;
  canChangePermissions: boolean;
}

export interface SessionSettings {
  autoSave: boolean;
  saveInterval: number; // 秒
  showCursors: boolean;
  showSelections: boolean;
  enableVoiceChat: boolean;
  enableVideoChat: boolean;
  enableScreenShare: boolean;
  conflictResolution: 'last-write-wins' | 'operational-transform' | 'manual';
}

export interface CollaborationEvent {
  id: string;
  sessionId: string;
  userId: string;
  type: 'edit' | 'comment' | 'cursor' | 'selection' | 'join' | 'leave' | 'permission';
  data: any;
  timestamp: Date;
  acknowledged: boolean;
}

export interface EditOperation {
  id: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  elementId: string;
  position?: number;
  content?: any;
  oldContent?: any;
  userId: string;
  timestamp: Date;
  dependencies?: string[]; // 依賴的其他操作
}

export interface Comment {
  id: string;
  sessionId: string;
  elementId: string;
  userId: string;
  username: string;
  content: string;
  position?: { x: number; y: number };
  replies: CommentReply[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentReply {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export interface VersionSnapshot {
  id: string;
  sessionId: string;
  version: number;
  content: any;
  operations: EditOperation[];
  createdBy: string;
  createdAt: Date;
  description?: string;
  tags?: string[];
}

export class RealtimeCollaboration {
  private static sessions: Map<string, CollaborationSession> = new Map();
  private static operations: Map<string, EditOperation[]> = new Map();
  private static comments: Map<string, Comment[]> = new Map();
  private static versions: Map<string, VersionSnapshot[]> = new Map();
  private static eventHandlers: Map<string, Function[]> = new Map();
  
  // WebSocket 連接管理
  private static connections: Map<string, WebSocket> = new Map();
  private static wsServer: any = null;

  // 初始化協作系統
  static initialize(wsServer?: any) {
    this.wsServer = wsServer;
    this.setupWebSocketHandlers();
    this.startCleanupTimer();
  }

  // 創建協作會話
  static async createSession(
    activityId: string,
    ownerId: string,
    settings: Partial<SessionSettings> = {}
  ): Promise<CollaborationSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      activityId,
      ownerId,
      participants: [{
        userId: ownerId,
        username: 'Owner', // 應該從用戶數據庫獲取
        role: 'owner',
        status: 'online',
        joinedAt: new Date(),
        lastSeenAt: new Date(),
        permissions: {
          canEdit: true,
          canComment: true,
          canViewHistory: true,
          canInviteOthers: true,
          canChangePermissions: true
        }
      }],
      permissions: {
        allowEdit: true,
        allowComment: true,
        allowShare: true,
        allowExport: true,
        requireApproval: false,
        maxParticipants: 10
      },
      status: 'active',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      settings: {
        autoSave: true,
        saveInterval: 30,
        showCursors: true,
        showSelections: true,
        enableVoiceChat: false,
        enableVideoChat: false,
        enableScreenShare: false,
        conflictResolution: 'operational-transform',
        ...settings
      }
    };

    this.sessions.set(sessionId, session);
    this.operations.set(sessionId, []);
    this.comments.set(sessionId, []);
    this.versions.set(sessionId, []);

    // 創建初始版本快照
    await this.createVersionSnapshot(sessionId, ownerId, '初始版本');

    return session;
  }

  // 加入協作會話
  static async joinSession(
    sessionId: string,
    userId: string,
    username: string
  ): Promise<{ success: boolean; session?: CollaborationSession; error?: string }> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { success: false, error: '會話不存在' };
    }

    if (session.status !== 'active') {
      return { success: false, error: '會話已結束' };
    }

    if (session.participants.length >= session.permissions.maxParticipants) {
      return { success: false, error: '會話人數已滿' };
    }

    // 檢查用戶是否已在會話中
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.status = 'online';
      existingParticipant.lastSeenAt = new Date();
    } else {
      const newParticipant: Participant = {
        userId,
        username,
        role: 'editor',
        status: 'online',
        joinedAt: new Date(),
        lastSeenAt: new Date(),
        permissions: {
          canEdit: session.permissions.allowEdit,
          canComment: session.permissions.allowComment,
          canViewHistory: false,
          canInviteOthers: false,
          canChangePermissions: false
        }
      };
      
      session.participants.push(newParticipant);
    }

    session.lastActiveAt = new Date();

    // 廣播用戶加入事件
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId,
      type: 'join',
      data: { username },
      timestamp: new Date(),
      acknowledged: false
    });

    return { success: true, session };
  }

  // 離開協作會話
  static async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.status = 'offline';
      participant.lastSeenAt = new Date();
    }

    // 廣播用戶離開事件
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId,
      type: 'leave',
      data: {},
      timestamp: new Date(),
      acknowledged: false
    });

    // 如果是所有者離開，轉移所有權或結束會話
    if (participant?.role === 'owner') {
      const activeParticipants = session.participants.filter(p => p.status === 'online' && p.userId !== userId);
      if (activeParticipants.length > 0) {
        activeParticipants[0].role = 'owner';
        activeParticipants[0].permissions = {
          canEdit: true,
          canComment: true,
          canViewHistory: true,
          canInviteOthers: true,
          canChangePermissions: true
        };
      } else {
        session.status = 'ended';
      }
    }
  }

  // 應用編輯操作
  static async applyOperation(
    sessionId: string,
    operation: Omit<EditOperation, 'id' | 'timestamp'>
  ): Promise<{ success: boolean; transformedOperation?: EditOperation; conflicts?: EditOperation[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false };
    }

    const participant = session.participants.find(p => p.userId === operation.userId);
    if (!participant?.permissions.canEdit) {
      return { success: false };
    }

    const fullOperation: EditOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const operations = this.operations.get(sessionId) || [];
    
    // 操作轉換處理衝突
    const { transformedOperation, conflicts } = this.transformOperation(fullOperation, operations);
    
    operations.push(transformedOperation);
    this.operations.set(sessionId, operations);

    // 廣播操作
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId: operation.userId,
      type: 'edit',
      data: transformedOperation,
      timestamp: new Date(),
      acknowledged: false
    });

    session.lastActiveAt = new Date();

    // 自動保存
    if (session.settings.autoSave) {
      this.scheduleAutoSave(sessionId);
    }

    return { success: true, transformedOperation, conflicts };
  }

  // 操作轉換（Operational Transform）
  private static transformOperation(
    operation: EditOperation,
    existingOperations: EditOperation[]
  ): { transformedOperation: EditOperation; conflicts: EditOperation[] } {
    let transformedOperation = { ...operation };
    const conflicts: EditOperation[] = [];

    // 查找可能的衝突操作
    const recentOperations = existingOperations.filter(op => 
      op.elementId === operation.elementId &&
      op.timestamp > new Date(Date.now() - 5000) // 5秒內的操作
    );

    for (const existingOp of recentOperations) {
      if (this.operationsConflict(operation, existingOp)) {
        conflicts.push(existingOp);
        transformedOperation = this.resolveConflict(transformedOperation, existingOp);
      }
    }

    return { transformedOperation, conflicts };
  }

  // 檢查操作衝突
  private static operationsConflict(op1: EditOperation, op2: EditOperation): boolean {
    if (op1.elementId !== op2.elementId) return false;
    if (op1.userId === op2.userId) return false;

    // 簡化的衝突檢測邏輯
    if (op1.type === 'delete' || op2.type === 'delete') return true;
    if (op1.type === 'update' && op2.type === 'update') return true;
    
    return false;
  }

  // 解決操作衝突
  private static resolveConflict(operation: EditOperation, conflictingOp: EditOperation): EditOperation {
    // 簡化的衝突解決邏輯
    // 實際實現需要更複雜的操作轉換算法
    
    if (operation.timestamp > conflictingOp.timestamp) {
      // 當前操作較新，保持不變
      return operation;
    } else {
      // 調整操作以避免衝突
      return {
        ...operation,
        position: (operation.position || 0) + 1
      };
    }
  }

  // 添加評論
  static async addComment(
    sessionId: string,
    elementId: string,
    userId: string,
    username: string,
    content: string,
    position?: { x: number; y: number }
  ): Promise<Comment> {
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      elementId,
      userId,
      username,
      content,
      position,
      replies: [],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const comments = this.comments.get(sessionId) || [];
    comments.push(comment);
    this.comments.set(sessionId, comments);

    // 廣播評論事件
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId,
      type: 'comment',
      data: comment,
      timestamp: new Date(),
      acknowledged: false
    });

    return comment;
  }

  // 回覆評論
  static async replyToComment(
    sessionId: string,
    commentId: string,
    userId: string,
    username: string,
    content: string
  ): Promise<CommentReply | null> {
    const comments = this.comments.get(sessionId) || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) return null;

    const reply: CommentReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      content,
      createdAt: new Date()
    };

    comment.replies.push(reply);
    comment.updatedAt = new Date();

    // 廣播回覆事件
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId,
      type: 'comment',
      data: { type: 'reply', commentId, reply },
      timestamp: new Date(),
      acknowledged: false
    });

    return reply;
  }

  // 創建版本快照
  static async createVersionSnapshot(
    sessionId: string,
    userId: string,
    description?: string,
    tags?: string[]
  ): Promise<VersionSnapshot> {
    const operations = this.operations.get(sessionId) || [];
    const versions = this.versions.get(sessionId) || [];
    
    const snapshot: VersionSnapshot = {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      version: versions.length + 1,
      content: this.reconstructContent(operations),
      operations: [...operations],
      createdBy: userId,
      createdAt: new Date(),
      description,
      tags
    };

    versions.push(snapshot);
    this.versions.set(sessionId, versions);

    return snapshot;
  }

  // 重構內容
  private static reconstructContent(operations: EditOperation[]): any {
    // 簡化的內容重構邏輯
    // 實際實現需要根據具體的數據結構來重構
    const content: any = {};
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'insert':
          content[operation.elementId] = operation.content;
          break;
        case 'update':
          content[operation.elementId] = operation.content;
          break;
        case 'delete':
          delete content[operation.elementId];
          break;
      }
    }
    
    return content;
  }

  // 更新游標位置
  static updateCursor(sessionId: string, userId: string, cursor: CursorPosition): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.cursor = cursor;
      participant.lastSeenAt = new Date();
    }

    // 廣播游標更新
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId,
      type: 'cursor',
      data: cursor,
      timestamp: new Date(),
      acknowledged: false
    });
  }

  // 更新選擇範圍
  static updateSelection(sessionId: string, userId: string, selection: SelectionRange): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.selection = selection;
      participant.lastSeenAt = new Date();
    }

    // 廣播選擇更新
    this.broadcastEvent(sessionId, {
      id: `event_${Date.now()}`,
      sessionId,
      userId,
      type: 'selection',
      data: selection,
      timestamp: new Date(),
      acknowledged: false
    });
  }

  // 廣播事件
  private static broadcastEvent(sessionId: string, event: CollaborationEvent): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // 向所有在線參與者廣播
    session.participants
      .filter(p => p.status === 'online')
      .forEach(participant => {
        const connection = this.connections.get(participant.userId);
        if (connection && connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify(event));
        }
      });

    // 觸發事件處理器
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }

  // 設置 WebSocket 處理器
  private static setupWebSocketHandlers(): void {
    // WebSocket 連接處理邏輯
    // 實際實現需要根據具體的 WebSocket 服務器來設置
  }

  // 自動保存調度
  private static scheduleAutoSave(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.settings.autoSave) return;

    setTimeout(() => {
      this.createVersionSnapshot(sessionId, 'system', '自動保存');
    }, session.settings.saveInterval * 1000);
  }

  // 清理定時器
  private static startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000); // 5分鐘清理一次
  }

  // 清理非活躍會話
  private static cleanupInactiveSessions(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30分鐘

    this.sessions.forEach((session, sessionId) => {
      if (now.getTime() - session.lastActiveAt.getTime() > inactiveThreshold) {
        const activeParticipants = session.participants.filter(p => p.status === 'online');
        if (activeParticipants.length === 0) {
          session.status = 'ended';
        }
      }
    });
  }

  // 獲取會話信息
  static getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // 獲取會話操作歷史
  static getOperations(sessionId: string): EditOperation[] {
    return this.operations.get(sessionId) || [];
  }

  // 獲取會話評論
  static getComments(sessionId: string): Comment[] {
    return this.comments.get(sessionId) || [];
  }

  // 獲取版本歷史
  static getVersions(sessionId: string): VersionSnapshot[] {
    return this.versions.get(sessionId) || [];
  }

  // 註冊事件處理器
  static addEventListener(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  // 移除事件處理器
  static removeEventListener(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(eventType, handlers);
    }
  }
}
