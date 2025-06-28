/**
 * 數據同步 API 端點
 * 處理離線數據同步和衝突解決
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface SyncItem {
  id: string;
  type: 'activity' | 'progress' | 'content' | 'user_action';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  userId: string;
  deviceId?: string;
  version?: number;
}

interface SyncRequest {
  items: SyncItem[];
  lastSyncTimestamp?: string;
  deviceId: string;
  userId: string;
}

interface SyncResponse {
  success: boolean;
  syncedItems: string[];
  conflicts: ConflictItem[];
  serverUpdates: SyncItem[];
  newSyncTimestamp: string;
  errors?: SyncError[];
}

interface ConflictItem {
  itemId: string;
  type: string;
  clientData: any;
  serverData: any;
  resolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  mergedData?: any;
}

interface SyncError {
  itemId: string;
  error: string;
  code: string;
}

// 模擬服務器數據存儲
const serverData = new Map<string, any>();
const syncHistory = new Map<string, SyncItem[]>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const syncRequest: SyncRequest = req.body;
    
    // 驗證請求
    if (!syncRequest.items || !syncRequest.userId || !syncRequest.deviceId) {
      return res.status(400).json({
        error: '缺少必要參數',
        required: ['items', 'userId', 'deviceId']
      });
    }

    const response = await processSyncRequest(syncRequest);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('同步處理失敗:', error);
    return res.status(500).json({
      error: '同步處理失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理同步請求
async function processSyncRequest(request: SyncRequest): Promise<SyncResponse> {
  const { items, lastSyncTimestamp, deviceId, userId } = request;
  const currentTimestamp = new Date().toISOString();
  
  const syncedItems: string[] = [];
  const conflicts: ConflictItem[] = [];
  const errors: SyncError[] = [];
  
  // 處理客戶端提交的項目
  for (const item of items) {
    try {
      const result = await processSyncItem(item, userId);
      
      if (result.success) {
        syncedItems.push(item.id);
      } else if (result.conflict) {
        conflicts.push(result.conflict);
      } else if (result.error) {
        errors.push(result.error);
      }
    } catch (error) {
      errors.push({
        itemId: item.id,
        error: error instanceof Error ? error.message : '處理失敗',
        code: 'PROCESSING_ERROR'
      });
    }
  }

  // 獲取服務器端更新
  const serverUpdates = await getServerUpdates(userId, lastSyncTimestamp);
  
  // 記錄同步歷史
  recordSyncHistory(userId, items, currentTimestamp);

  return {
    success: true,
    syncedItems,
    conflicts,
    serverUpdates,
    newSyncTimestamp: currentTimestamp,
    errors: errors.length > 0 ? errors : undefined
  };
}

// 處理單個同步項目
async function processSyncItem(item: SyncItem, userId: string): Promise<{
  success?: boolean;
  conflict?: ConflictItem;
  error?: SyncError;
}> {
  const serverKey = `${item.type}_${item.id}`;
  const existingData = serverData.get(serverKey);
  
  // 檢查權限
  if (!hasPermission(userId, item.type, item.action)) {
    return {
      error: {
        itemId: item.id,
        error: '權限不足',
        code: 'PERMISSION_DENIED'
      }
    };
  }

  switch (item.action) {
    case 'create':
      return await handleCreate(item, existingData, serverKey);
    
    case 'update':
      return await handleUpdate(item, existingData, serverKey);
    
    case 'delete':
      return await handleDelete(item, existingData, serverKey);
    
    default:
      return {
        error: {
          itemId: item.id,
          error: `不支持的操作: ${item.action}`,
          code: 'UNSUPPORTED_ACTION'
        }
      };
  }
}

// 處理創建操作
async function handleCreate(item: SyncItem, existingData: any, serverKey: string) {
  if (existingData) {
    // 項目已存在，檢查是否為衝突
    if (existingData.timestamp > item.timestamp) {
      return {
        conflict: {
          itemId: item.id,
          type: item.type,
          clientData: item.data,
          serverData: existingData,
          resolution: 'server_wins'
        }
      };
    }
  }

  // 創建或更新項目
  serverData.set(serverKey, {
    ...item.data,
    id: item.id,
    timestamp: item.timestamp,
    lastModifiedBy: item.userId
  });

  return { success: true };
}

// 處理更新操作
async function handleUpdate(item: SyncItem, existingData: any, serverKey: string) {
  if (!existingData) {
    return {
      error: {
        itemId: item.id,
        error: '項目不存在',
        code: 'ITEM_NOT_FOUND'
      }
    };
  }

  // 檢查版本衝突
  if (existingData.timestamp > item.timestamp) {
    // 嘗試自動合併
    const mergedData = attemptAutoMerge(item.data, existingData);
    
    if (mergedData) {
      serverData.set(serverKey, {
        ...mergedData,
        id: item.id,
        timestamp: new Date().toISOString(),
        lastModifiedBy: item.userId
      });
      
      return {
        conflict: {
          itemId: item.id,
          type: item.type,
          clientData: item.data,
          serverData: existingData,
          resolution: 'merge',
          mergedData
        }
      };
    } else {
      return {
        conflict: {
          itemId: item.id,
          type: item.type,
          clientData: item.data,
          serverData: existingData,
          resolution: 'manual'
        }
      };
    }
  }

  // 更新項目
  serverData.set(serverKey, {
    ...item.data,
    id: item.id,
    timestamp: item.timestamp,
    lastModifiedBy: item.userId
  });

  return { success: true };
}

// 處理刪除操作
async function handleDelete(item: SyncItem, existingData: any, serverKey: string) {
  if (!existingData) {
    // 項目已不存在，視為成功
    return { success: true };
  }

  // 檢查是否有更新的版本
  if (existingData.timestamp > item.timestamp) {
    return {
      conflict: {
        itemId: item.id,
        type: item.type,
        clientData: null,
        serverData: existingData,
        resolution: 'server_wins'
      }
    };
  }

  // 刪除項目
  serverData.delete(serverKey);
  return { success: true };
}

// 嘗試自動合併
function attemptAutoMerge(clientData: any, serverData: any): any | null {
  // 簡化的自動合併邏輯
  // 實際實現需要根據數據類型進行更複雜的合併
  
  if (typeof clientData === 'object' && typeof serverData === 'object') {
    const merged = { ...serverData };
    
    // 合併非衝突字段
    for (const [key, value] of Object.entries(clientData)) {
      if (!(key in serverData) || serverData[key] === value) {
        merged[key] = value;
      }
    }
    
    return merged;
  }
  
  return null;
}

// 檢查權限
function hasPermission(userId: string, type: string, action: string): boolean {
  // 簡化的權限檢查
  // 實際實現需要更複雜的權限邏輯
  
  const permissions = {
    'activity': ['create', 'update', 'delete'],
    'progress': ['create', 'update'],
    'content': ['create', 'update', 'delete'],
    'user_action': ['create']
  };
  
  return permissions[type as keyof typeof permissions]?.includes(action) || false;
}

// 獲取服務器端更新
async function getServerUpdates(userId: string, lastSyncTimestamp?: string): Promise<SyncItem[]> {
  const updates: SyncItem[] = [];
  const cutoffTime = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
  
  // 查找用戶相關的更新
  for (const [key, data] of serverData.entries()) {
    if (data.timestamp && new Date(data.timestamp) > cutoffTime) {
      // 檢查用戶是否有權限訪問此數據
      if (canUserAccess(userId, key, data)) {
        const [type, id] = key.split('_', 2);
        updates.push({
          id,
          type: type as any,
          action: 'update',
          data,
          timestamp: data.timestamp,
          userId: data.lastModifiedBy || 'system'
        });
      }
    }
  }
  
  return updates;
}

// 檢查用戶訪問權限
function canUserAccess(userId: string, key: string, data: any): boolean {
  // 簡化的訪問控制
  // 實際實現需要更複雜的權限邏輯
  
  // 用戶可以訪問自己創建的內容
  if (data.createdBy === userId || data.lastModifiedBy === userId) {
    return true;
  }
  
  // 公開內容
  if (data.isPublic) {
    return true;
  }
  
  return false;
}

// 記錄同步歷史
function recordSyncHistory(userId: string, items: SyncItem[], timestamp: string): void {
  const userHistory = syncHistory.get(userId) || [];
  
  const historyEntry: SyncItem = {
    id: `sync_${timestamp}`,
    type: 'user_action',
    action: 'create',
    data: {
      syncedItems: items.length,
      timestamp
    },
    timestamp,
    userId
  };
  
  userHistory.push(historyEntry);
  
  // 保留最近 100 條記錄
  if (userHistory.length > 100) {
    userHistory.splice(0, userHistory.length - 100);
  }
  
  syncHistory.set(userId, userHistory);
}
