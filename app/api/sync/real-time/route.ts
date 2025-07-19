import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../pages/api/auth/[...nextauth]';

interface SyncRequest {
  action: 'sync' | 'conflict-check' | 'resolve-conflict' | 'get-status';
  documentId?: string;
  content?: any;
  version?: number;
  conflictId?: string;
  resolution?: 'local' | 'server' | 'merge';
}

interface SyncResponse {
  success: boolean;
  data?: any;
  conflicts?: ConflictItem[];
  version?: number;
  message?: string;
  error?: string;
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

interface DocumentState {
  id: string;
  content: any;
  version: number;
  lastModified: Date;
  modifiedBy: string;
  activeUsers: string[];
}

// 模擬文檔狀態存儲 (實際應用中應使用 Redis 或數據庫)
const documentStates = new Map<string, DocumentState>();
const activeConflicts = new Map<string, ConflictItem>();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: '未授權訪問' 
      }, { status: 401 });
    }

    const body: SyncRequest = await request.json();
    const userId = session.user.id;

    switch (body.action) {
      case 'sync':
        return await handleSync(body, userId);
      
      case 'conflict-check':
        return await handleConflictCheck(body, userId);
      
      case 'resolve-conflict':
        return await handleResolveConflict(body, userId);
      
      case 'get-status':
        return await handleGetStatus(body, userId);
      
      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作類型'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('實時同步 API 錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '服務器內部錯誤',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// 處理同步請求
async function handleSync(body: SyncRequest, userId: string): Promise<NextResponse> {
  const { documentId, content, version } = body;
  
  if (!documentId || !content || version === undefined) {
    return NextResponse.json({
      success: false,
      error: '缺少必要參數'
    }, { status: 400 });
  }

  try {
    const currentState = documentStates.get(documentId);
    
    if (!currentState) {
      // 創建新文檔狀態
      const newState: DocumentState = {
        id: documentId,
        content,
        version: 1,
        lastModified: new Date(),
        modifiedBy: userId,
        activeUsers: [userId]
      };
      
      documentStates.set(documentId, newState);
      
      return NextResponse.json({
        success: true,
        data: newState,
        version: newState.version,
        message: '文檔創建成功'
      });
    }

    // 檢查版本衝突
    if (version < currentState.version) {
      // 版本衝突，創建衝突記錄
      const conflict: ConflictItem = {
        id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'version',
        description: `版本衝突：客戶端版本 ${version}，服務器版本 ${currentState.version}`,
        localVersion: { content, version },
        serverVersion: { content: currentState.content, version: currentState.version },
        timestamp: new Date(),
        resolved: false
      };
      
      activeConflicts.set(conflict.id, conflict);
      
      return NextResponse.json({
        success: false,
        conflicts: [conflict],
        version: currentState.version,
        message: '檢測到版本衝突'
      });
    }

    // 更新文檔狀態
    const updatedState: DocumentState = {
      ...currentState,
      content,
      version: currentState.version + 1,
      lastModified: new Date(),
      modifiedBy: userId,
      activeUsers: Array.from(new Set([...currentState.activeUsers, userId]))
    };
    
    documentStates.set(documentId, updatedState);
    
    return NextResponse.json({
      success: true,
      data: updatedState,
      version: updatedState.version,
      message: '同步成功'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '同步失敗',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// 處理衝突檢查
async function handleConflictCheck(body: SyncRequest, userId: string): Promise<NextResponse> {
  const { documentId } = body;
  
  if (!documentId) {
    return NextResponse.json({
      success: false,
      error: '缺少文檔 ID'
    }, { status: 400 });
  }

  try {
    const conflicts = Array.from(activeConflicts.values())
      .filter(conflict => !conflict.resolved);
    
    return NextResponse.json({
      success: true,
      conflicts,
      message: `找到 ${conflicts.length} 個未解決的衝突`
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '衝突檢查失敗',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// 處理衝突解決
async function handleResolveConflict(body: SyncRequest, userId: string): Promise<NextResponse> {
  const { conflictId, resolution, documentId } = body;
  
  if (!conflictId || !resolution || !documentId) {
    return NextResponse.json({
      success: false,
      error: '缺少必要參數'
    }, { status: 400 });
  }

  try {
    const conflict = activeConflicts.get(conflictId);
    
    if (!conflict) {
      return NextResponse.json({
        success: false,
        error: '衝突不存在'
      }, { status: 404 });
    }

    if (conflict.resolved) {
      return NextResponse.json({
        success: false,
        error: '衝突已經解決'
      }, { status: 400 });
    }

    let resolvedContent: any;
    let resolvedVersion: number;

    switch (resolution) {
      case 'local':
        resolvedContent = conflict.localVersion.content;
        resolvedVersion = conflict.localVersion.version;
        break;
      
      case 'server':
        resolvedContent = conflict.serverVersion.content;
        resolvedVersion = conflict.serverVersion.version;
        break;
      
      case 'merge':
        // 簡單的合併策略 (實際應用中需要更複雜的合併邏輯)
        resolvedContent = {
          ...conflict.serverVersion.content,
          ...conflict.localVersion.content,
          mergedAt: new Date().toISOString()
        };
        resolvedVersion = Math.max(conflict.localVersion.version, conflict.serverVersion.version) + 1;
        break;
      
      default:
        return NextResponse.json({
          success: false,
          error: '無效的解決方案'
        }, { status: 400 });
    }

    // 更新文檔狀態
    const currentState = documentStates.get(documentId);
    if (currentState) {
      const updatedState: DocumentState = {
        ...currentState,
        content: resolvedContent,
        version: resolvedVersion,
        lastModified: new Date(),
        modifiedBy: userId
      };
      
      documentStates.set(documentId, updatedState);
    }

    // 標記衝突為已解決
    conflict.resolved = true;
    activeConflicts.set(conflictId, conflict);

    return NextResponse.json({
      success: true,
      data: {
        content: resolvedContent,
        version: resolvedVersion
      },
      message: `衝突已使用${resolution === 'local' ? '本地' : resolution === 'server' ? '服務器' : '合併'}版本解決`
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '衝突解決失敗',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// 處理狀態查詢
async function handleGetStatus(body: SyncRequest, userId: string): Promise<NextResponse> {
  const { documentId } = body;
  
  try {
    const allConflicts = Array.from(activeConflicts.values());
    const unresolvedConflicts = allConflicts.filter(c => !c.resolved);
    
    let documentState = null;
    if (documentId) {
      documentState = documentStates.get(documentId);
    }

    const status = {
      totalDocuments: documentStates.size,
      totalConflicts: allConflicts.length,
      unresolvedConflicts: unresolvedConflicts.length,
      activeUsers: documentState ? documentState.activeUsers.length : 0,
      lastSync: documentState ? documentState.lastModified : null,
      documentState
    };

    return NextResponse.json({
      success: true,
      data: status,
      conflicts: unresolvedConflicts,
      message: '狀態查詢成功'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '狀態查詢失敗',
      message: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // 處理 GET 請求，返回當前同步狀態
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: '未授權訪問' 
      }, { status: 401 });
    }

    const allConflicts = Array.from(activeConflicts.values());
    const unresolvedConflicts = allConflicts.filter(c => !c.resolved);
    
    const status = {
      totalDocuments: documentStates.size,
      totalConflicts: allConflicts.length,
      unresolvedConflicts: unresolvedConflicts.length,
      serverTime: new Date(),
      isOnline: true
    };

    return NextResponse.json({
      success: true,
      data: status,
      conflicts: unresolvedConflicts,
      message: '同步服務正常運行'
    });

  } catch (error) {
    console.error('獲取同步狀態錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '服務器內部錯誤',
      message: (error as Error).message
    }, { status: 500 });
  }
}
