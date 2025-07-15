/**
 * OfflineSyncManager - 離線支持和同步隊列系統
 * 實現智能衝突解決的三方合併算法和完整的離線數據管理
 */

export interface SyncQueueItem {
  id: string;
  activityId: string;
  data: any;
  timestamp: number;
  queuedAt: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  syncStatus: 'pending' | 'syncing' | 'success' | 'failed' | 'conflict';
  conflictData?: any;
  lastError?: string;
}

export interface ConflictResolution {
  conflictId: string;
  strategy: 'auto' | 'manual' | 'server-wins' | 'client-wins' | 'merge';
  baseVersion: any;
  serverVersion: any;
  clientVersion: any;
  mergedResult?: any;
  resolution: 'resolved' | 'pending' | 'failed';
  timestamp: number;
}

export interface OfflineSyncMetrics {
  totalItems: number;
  pendingItems: number;
  syncedItems: number;
  failedItems: number;
  conflictItems: number;
  averageSyncTime: number;
  lastSyncTime: number;
  offlineDuration: number;
  networkStatus: 'online' | 'offline' | 'unstable';
}

export class OfflineSyncManager {
  private syncQueue: SyncQueueItem[] = [];
  private conflictResolutions: Map<string, ConflictResolution> = new Map();
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private offlineStartTime: number | null = null;
  private metrics: OfflineSyncMetrics;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(metrics: OfflineSyncMetrics) => void> = new Set();

  constructor(private options: {
    maxQueueSize?: number;
    syncIntervalMs?: number;
    maxRetries?: number;
    enableAutoMerge?: boolean;
    conflictResolutionTimeout?: number;
  } = {}) {
    this.options = {
      maxQueueSize: 100,
      syncIntervalMs: 5000,
      maxRetries: 3,
      enableAutoMerge: true,
      conflictResolutionTimeout: 30000,
      ...options
    };

    this.metrics = {
      totalItems: 0,
      pendingItems: 0,
      syncedItems: 0,
      failedItems: 0,
      conflictItems: 0,
      averageSyncTime: 0,
      lastSyncTime: 0,
      offlineDuration: 0,
      networkStatus: this.isOnline ? 'online' : 'offline'
    };

    this.initializeNetworkListeners();
    this.loadSyncQueue();
    this.startSyncInterval();
  }

  /**
   * 初始化網絡監聽器
   */
  private initializeNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * 添加項目到同步隊列
   */
  async addToQueue(activityId: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<string> {
    const item: SyncQueueItem = {
      id: this.generateId(),
      activityId,
      data,
      timestamp: Date.now(),
      queuedAt: Date.now(),
      retryCount: 0,
      priority,
      syncStatus: 'pending'
    };

    this.syncQueue.push(item);
    this.sortQueueByPriority();
    
    // 保持隊列大小限制
    if (this.syncQueue.length > this.options.maxQueueSize!) {
      this.syncQueue = this.syncQueue.slice(-this.options.maxQueueSize!);
    }

    await this.saveSyncQueue();
    this.updateMetrics();
    
    // 如果在線，立即嘗試同步
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }

    return item.id;
  }

  /**
   * 處理同步隊列
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    console.log(`🔄 開始處理同步隊列，共 ${this.syncQueue.length} 項目`);

    const pendingItems = this.syncQueue.filter(item => 
      item.syncStatus === 'pending' || 
      (item.syncStatus === 'failed' && item.retryCount < this.options.maxRetries!)
    );

    for (const item of pendingItems) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error(`同步項目失敗: ${item.id}`, error);
        this.handleSyncError(item, error as Error);
      }
    }

    this.syncInProgress = false;
    await this.saveSyncQueue();
    this.updateMetrics();
  }

  /**
   * 同步單個項目
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    item.syncStatus = 'syncing';
    const startTime = Date.now();

    try {
      const response = await fetch(`/api/universal-content/${item.activityId}/enhanced-autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Queue-Item': item.id,
          'X-Offline-Sync': 'true'
        },
        body: JSON.stringify(item.data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 檢查是否有衝突
      if (result.conflictDetected) {
        await this.handleConflict(item, result.conflictData);
      } else {
        item.syncStatus = 'success';
        this.metrics.syncedItems++;
        
        // 從隊列中移除成功同步的項目
        this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
      }

      const syncTime = Date.now() - startTime;
      this.updateAverageSyncTime(syncTime);

    } catch (error) {
      this.handleSyncError(item, error as Error);
    }
  }

  /**
   * 處理衝突
   */
  private async handleConflict(item: SyncQueueItem, conflictData: any): Promise<void> {
    const conflictId = `${item.id}_${Date.now()}`;
    
    const resolution: ConflictResolution = {
      conflictId,
      strategy: this.options.enableAutoMerge ? 'auto' : 'manual',
      baseVersion: conflictData.baseVersion,
      serverVersion: conflictData.serverVersion,
      clientVersion: item.data,
      resolution: 'pending',
      timestamp: Date.now()
    };

    this.conflictResolutions.set(conflictId, resolution);
    item.syncStatus = 'conflict';
    item.conflictData = conflictData;
    this.metrics.conflictItems++;

    if (this.options.enableAutoMerge) {
      try {
        const mergedResult = await this.performThreeWayMerge(resolution);
        if (mergedResult) {
          resolution.mergedResult = mergedResult;
          resolution.resolution = 'resolved';
          
          // 使用合併結果重新同步
          item.data = mergedResult;
          item.syncStatus = 'pending';
          item.conflictData = undefined;
          
          console.log(`✅ 自動解決衝突: ${conflictId}`);
        } else {
          console.warn(`⚠️ 無法自動解決衝突: ${conflictId}，需要手動處理`);
        }
      } catch (error) {
        console.error(`衝突解決失敗: ${conflictId}`, error);
        resolution.resolution = 'failed';
      }
    }
  }

  /**
   * 三方合併算法 (增強版)
   */
  private async performThreeWayMerge(resolution: ConflictResolution): Promise<any> {
    const { baseVersion, serverVersion, clientVersion } = resolution;

    try {
      // 如果是數組內容，執行數組合併
      if (Array.isArray(clientVersion.content) && Array.isArray(serverVersion.content)) {
        return this.mergeArrayContent(baseVersion, serverVersion, clientVersion);
      }

      // 如果是對象內容，執行對象合併
      if (typeof clientVersion.content === 'object' && typeof serverVersion.content === 'object') {
        return this.mergeObjectContent(baseVersion, serverVersion, clientVersion);
      }

      // 文本內容合併
      if (typeof clientVersion.content === 'string' && typeof serverVersion.content === 'string') {
        return this.mergeTextContent(baseVersion, serverVersion, clientVersion);
      }

      // 無法自動合併
      return null;

    } catch (error) {
      console.error('三方合併失敗:', error);
      return null;
    }
  }

  /**
   * 數組內容合併
   */
  private mergeArrayContent(base: any, server: any, client: any): any {
    const merged = { ...client };
    const serverContent = server.content || [];
    const clientContent = client.content || [];
    const baseContent = base?.content || [];

    // 創建合併後的數組
    const mergedContent = [...clientContent];

    // 處理服務器端的變更
    serverContent.forEach((serverItem: any) => {
      const clientIndex = mergedContent.findIndex((item: any) => item.id === serverItem.id);
      const baseItem = baseContent.find((item: any) => item.id === serverItem.id);

      if (clientIndex >= 0) {
        // 項目在客戶端也存在，需要合併
        const clientItem = mergedContent[clientIndex];
        
        // 如果服務器版本比基礎版本新，且客戶端沒有修改，使用服務器版本
        if (!baseItem || this.isItemModified(baseItem, serverItem)) {
          if (!this.isItemModified(baseItem, clientItem)) {
            mergedContent[clientIndex] = serverItem;
          } else {
            // 兩邊都有修改，合併屬性
            mergedContent[clientIndex] = { ...clientItem, ...serverItem };
          }
        }
      } else {
        // 服務器端新增的項目
        mergedContent.push(serverItem);
      }
    });

    merged.content = mergedContent;
    return merged;
  }

  /**
   * 對象內容合併
   */
  private mergeObjectContent(base: any, server: any, client: any): any {
    const merged = { ...client };
    
    // 合併內容對象
    merged.content = {
      ...base?.content || {},
      ...server.content || {},
      ...client.content || {}
    };

    return merged;
  }

  /**
   * 文本內容合併 (簡化版)
   */
  private mergeTextContent(base: any, server: any, client: any): any {
    // 簡化的文本合併：如果客戶端和服務器都修改了，優先使用客戶端版本
    const merged = { ...client };
    
    if (client.content === base?.content) {
      // 客戶端沒有修改，使用服務器版本
      merged.content = server.content;
    }
    // 否則保持客戶端版本

    return merged;
  }

  /**
   * 檢查項目是否被修改
   */
  private isItemModified(baseItem: any, currentItem: any): boolean {
    if (!baseItem) return true;
    return JSON.stringify(baseItem) !== JSON.stringify(currentItem);
  }

  /**
   * 處理同步錯誤
   */
  private handleSyncError(item: SyncQueueItem, error: Error): void {
    item.retryCount++;
    item.lastError = error.message;

    if (item.retryCount >= this.options.maxRetries!) {
      item.syncStatus = 'failed';
      this.metrics.failedItems++;
      console.error(`項目同步失敗，已達最大重試次數: ${item.id}`);
    } else {
      item.syncStatus = 'pending';
      console.warn(`項目同步失敗，將重試 (${item.retryCount}/${this.options.maxRetries}): ${item.id}`);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 按優先級排序隊列
   */
  private sortQueueByPriority(): void {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    this.syncQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.queuedAt - b.queuedAt; // 相同優先級按時間排序
    });
  }

  /**
   * 更新平均同步時間
   */
  private updateAverageSyncTime(syncTime: number): void {
    const totalSynced = this.metrics.syncedItems;
    this.metrics.averageSyncTime = 
      ((this.metrics.averageSyncTime * (totalSynced - 1)) + syncTime) / totalSynced;
  }

  /**
   * 更新指標
   */
  private updateMetrics(): void {
    this.metrics.totalItems = this.syncQueue.length;
    this.metrics.pendingItems = this.syncQueue.filter(item => item.syncStatus === 'pending').length;
    this.metrics.lastSyncTime = Date.now();
    
    if (this.offlineStartTime) {
      this.metrics.offlineDuration = Date.now() - this.offlineStartTime;
    }

    // 通知監聽器
    this.listeners.forEach(listener => listener(this.metrics));
  }

  /**
   * 處理網絡連接恢復
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.metrics.networkStatus = 'online';
    this.offlineStartTime = null;
    
    console.log('🌐 網絡連接已恢復，開始處理同步隊列...');
    this.processSyncQueue();
  }

  /**
   * 處理網絡連接斷開
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.metrics.networkStatus = 'offline';
    this.offlineStartTime = Date.now();
    
    console.log('📱 網絡連接已斷開，進入離線模式...');
  }

  /**
   * 開始同步間隔
   */
  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, this.options.syncIntervalMs);
  }

  /**
   * 保存同步隊列到本地存儲
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      localStorage.setItem('offline_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('保存同步隊列失敗:', error);
    }
  }

  /**
   * 從本地存儲載入同步隊列
   */
  private loadSyncQueue(): void {
    try {
      const saved = localStorage.getItem('offline_sync_queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
        this.updateMetrics();
      }
    } catch (error) {
      console.error('載入同步隊列失敗:', error);
      this.syncQueue = [];
    }
  }

  /**
   * 添加指標監聽器
   */
  addMetricsListener(listener: (metrics: OfflineSyncMetrics) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除指標監聽器
   */
  removeMetricsListener(listener: (metrics: OfflineSyncMetrics) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 獲取當前指標
   */
  getMetrics(): OfflineSyncMetrics {
    return { ...this.metrics };
  }

  /**
   * 獲取衝突解決狀態
   */
  getConflictResolutions(): ConflictResolution[] {
    return Array.from(this.conflictResolutions.values());
  }

  /**
   * 手動解決衝突
   */
  async resolveConflict(conflictId: string, resolution: 'server-wins' | 'client-wins' | 'merge', mergedData?: any): Promise<void> {
    const conflict = this.conflictResolutions.get(conflictId);
    if (!conflict) {
      throw new Error(`找不到衝突: ${conflictId}`);
    }

    let resolvedData;
    switch (resolution) {
      case 'server-wins':
        resolvedData = conflict.serverVersion;
        break;
      case 'client-wins':
        resolvedData = conflict.clientVersion;
        break;
      case 'merge':
        resolvedData = mergedData || conflict.mergedResult;
        break;
    }

    // 更新對應的同步隊列項目
    const queueItem = this.syncQueue.find(item => item.conflictData && item.id.includes(conflictId.split('_')[0]));
    if (queueItem) {
      queueItem.data = resolvedData;
      queueItem.syncStatus = 'pending';
      queueItem.conflictData = undefined;
    }

    conflict.resolution = 'resolved';
    conflict.mergedResult = resolvedData;

    await this.saveSyncQueue();
    this.updateMetrics();
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }

    this.listeners.clear();
  }
}
