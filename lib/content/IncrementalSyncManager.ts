/**
 * IncrementalSyncManager - 增量同步和差異計算系統
 * 實現智能差異計算、增量數據傳輸和版本歷史管理
 */

export interface ContentVersion {
  id: string;
  version: number;
  timestamp: number;
  content: any;
  contentHash: string;
  changeType: 'create' | 'update' | 'delete';
  changes: ContentChange[];
  metadata: {
    author?: string;
    sessionId: string;
    size: number;
    compressionRatio?: number;
  };
}

export interface ContentChange {
  path: string; // JSON path to the changed field
  operation: 'add' | 'remove' | 'replace' | 'move';
  oldValue?: any;
  newValue?: any;
  timestamp: number;
}

export interface DiffResult {
  hasChanges: boolean;
  changes: ContentChange[];
  addedPaths: string[];
  removedPaths: string[];
  modifiedPaths: string[];
  changesSummary: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface SyncState {
  status: 'idle' | 'calculating' | 'syncing' | 'complete' | 'error';
  progress: number; // 0-100
  currentOperation: string;
  lastSyncTime: number;
  pendingChanges: number;
  syncedChanges: number;
  errors: string[];
}

export class IncrementalSyncManager {
  private versions: Map<number, ContentVersion> = new Map();
  private currentVersion = 1;
  private lastSyncedVersion = 0;
  private syncState: SyncState;
  private stateListeners: Set<(state: SyncState) => void> = new Set();
  private maxVersionHistory: number;

  constructor(
    private activityId: string,
    private options: {
      maxVersionHistory?: number;
      enableDetailedDiff?: boolean;
      compressionEnabled?: boolean;
      autoCleanupOldVersions?: boolean;
      syncBatchSize?: number;
    } = {}
  ) {
    this.maxVersionHistory = options.maxVersionHistory || 50;
    
    this.syncState = {
      status: 'idle',
      progress: 0,
      currentOperation: '準備中',
      lastSyncTime: 0,
      pendingChanges: 0,
      syncedChanges: 0,
      errors: []
    };

    this.loadVersionHistory();
  }

  /**
   * 創建新版本
   */
  createVersion(content: any, sessionId: string, author?: string): ContentVersion {
    const contentHash = this.generateContentHash(content);
    const previousVersion = this.versions.get(this.currentVersion - 1);
    
    // 計算變更
    const changes = previousVersion ? 
      this.calculateDiff(previousVersion.content, content).changes : 
      [];

    const version: ContentVersion = {
      id: this.generateVersionId(),
      version: this.currentVersion,
      timestamp: Date.now(),
      content: this.deepClone(content),
      contentHash,
      changeType: previousVersion ? 'update' : 'create',
      changes,
      metadata: {
        author,
        sessionId,
        size: JSON.stringify(content).length
      }
    };

    this.versions.set(this.currentVersion, version);
    this.currentVersion++;

    // 清理舊版本
    if (this.options.autoCleanupOldVersions && this.versions.size > this.maxVersionHistory) {
      this.cleanupOldVersions();
    }

    // 更新同步狀態
    this.updateSyncState({
      pendingChanges: this.currentVersion - this.lastSyncedVersion - 1
    });

    this.saveVersionHistory();
    return version;
  }

  /**
   * 計算差異
   */
  calculateDiff(oldContent: any, newContent: any): DiffResult {
    const changes: ContentChange[] = [];
    const addedPaths: string[] = [];
    const removedPaths: string[] = [];
    const modifiedPaths: string[] = [];

    this.compareObjects(oldContent, newContent, '', changes, addedPaths, removedPaths, modifiedPaths);

    return {
      hasChanges: changes.length > 0,
      changes,
      addedPaths,
      removedPaths,
      modifiedPaths,
      changesSummary: {
        additions: addedPaths.length,
        deletions: removedPaths.length,
        modifications: modifiedPaths.length
      }
    };
  }

  /**
   * 比較對象
   */
  private compareObjects(
    oldObj: any, 
    newObj: any, 
    path: string, 
    changes: ContentChange[],
    addedPaths: string[],
    removedPaths: string[],
    modifiedPaths: string[]
  ): void {
    const oldKeys = oldObj ? Object.keys(oldObj) : [];
    const newKeys = newObj ? Object.keys(newObj) : [];
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      if (oldValue === undefined && newValue !== undefined) {
        // 新增
        changes.push({
          path: currentPath,
          operation: 'add',
          newValue,
          timestamp: Date.now()
        });
        addedPaths.push(currentPath);
      } else if (oldValue !== undefined && newValue === undefined) {
        // 刪除
        changes.push({
          path: currentPath,
          operation: 'remove',
          oldValue,
          timestamp: Date.now()
        });
        removedPaths.push(currentPath);
      } else if (oldValue !== newValue) {
        if (typeof oldValue === 'object' && typeof newValue === 'object' && 
            oldValue !== null && newValue !== null) {
          // 遞歸比較對象
          this.compareObjects(oldValue, newValue, currentPath, changes, addedPaths, removedPaths, modifiedPaths);
        } else {
          // 值變更
          changes.push({
            path: currentPath,
            operation: 'replace',
            oldValue,
            newValue,
            timestamp: Date.now()
          });
          modifiedPaths.push(currentPath);
        }
      }
    }
  }

  /**
   * 獲取增量數據
   */
  getIncrementalData(fromVersion: number, toVersion?: number): {
    versions: ContentVersion[];
    totalChanges: number;
    compressedSize: number;
  } {
    const targetVersion = toVersion || this.currentVersion - 1;
    const versions: ContentVersion[] = [];
    let totalChanges = 0;

    for (let v = fromVersion + 1; v <= targetVersion; v++) {
      const version = this.versions.get(v);
      if (version) {
        versions.push(version);
        totalChanges += version.changes.length;
      }
    }

    const compressedSize = this.estimateCompressedSize(versions);

    return {
      versions,
      totalChanges,
      compressedSize
    };
  }

  /**
   * 應用增量更新
   */
  applyIncrementalUpdate(versions: ContentVersion[]): boolean {
    try {
      this.updateSyncState({
        status: 'syncing',
        currentOperation: '應用增量更新',
        progress: 0
      });

      for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        this.versions.set(version.version, version);
        
        // 更新進度
        this.updateSyncState({
          progress: Math.round(((i + 1) / versions.length) * 100)
        });
      }

      this.lastSyncedVersion = Math.max(...versions.map(v => v.version));
      
      this.updateSyncState({
        status: 'complete',
        currentOperation: '同步完成',
        progress: 100,
        lastSyncTime: Date.now(),
        syncedChanges: this.syncState.syncedChanges + versions.reduce((sum, v) => sum + v.changes.length, 0),
        pendingChanges: Math.max(0, this.currentVersion - this.lastSyncedVersion - 1)
      });

      this.saveVersionHistory();
      return true;
    } catch (error) {
      this.updateSyncState({
        status: 'error',
        errors: [...this.syncState.errors, (error as Error).message]
      });
      return false;
    }
  }

  /**
   * 回滾到指定版本
   */
  rollbackToVersion(targetVersion: number): any | null {
    const version = this.versions.get(targetVersion);
    if (!version) {
      console.error(`版本 ${targetVersion} 不存在`);
      return null;
    }

    console.log(`🔄 回滾到版本 ${targetVersion} (${new Date(version.timestamp).toLocaleString()})`);
    return this.deepClone(version.content);
  }

  /**
   * 獲取版本歷史
   */
  getVersionHistory(limit?: number): ContentVersion[] {
    const versions = Array.from(this.versions.values())
      .sort((a, b) => b.version - a.version);
    
    return limit ? versions.slice(0, limit) : versions;
  }

  /**
   * 獲取版本統計
   */
  getVersionStats(): {
    totalVersions: number;
    currentVersion: number;
    lastSyncedVersion: number;
    pendingVersions: number;
    totalChanges: number;
    storageSize: number;
  } {
    const totalChanges = Array.from(this.versions.values())
      .reduce((sum, v) => sum + v.changes.length, 0);
    
    const storageSize = this.estimateStorageSize();

    return {
      totalVersions: this.versions.size,
      currentVersion: this.currentVersion - 1,
      lastSyncedVersion: this.lastSyncedVersion,
      pendingVersions: this.currentVersion - this.lastSyncedVersion - 1,
      totalChanges,
      storageSize
    };
  }

  /**
   * 清理舊版本
   */
  private cleanupOldVersions(): void {
    const versions = Array.from(this.versions.keys()).sort((a, b) => a - b);
    const toDelete = versions.slice(0, versions.length - this.maxVersionHistory);
    
    toDelete.forEach(version => {
      this.versions.delete(version);
    });

    console.log(`🧹 清理了 ${toDelete.length} 個舊版本`);
  }

  /**
   * 估算壓縮大小
   */
  private estimateCompressedSize(versions: ContentVersion[]): number {
    const jsonSize = JSON.stringify(versions).length;
    return Math.round(jsonSize * 0.4); // 估算 2.5x 壓縮比例
  }

  /**
   * 估算存儲大小
   */
  private estimateStorageSize(): number {
    const allVersions = Array.from(this.versions.values());
    return JSON.stringify(allVersions).length;
  }

  /**
   * 生成內容哈希
   */
  private generateContentHash(content: any): string {
    const jsonString = JSON.stringify(content, Object.keys(content).sort());
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * 生成版本ID
   */
  private generateVersionId(): string {
    return `v${this.currentVersion}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 深度克隆
   */
  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 更新同步狀態
   */
  private updateSyncState(updates: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...updates };
    this.stateListeners.forEach(listener => listener(this.syncState));
  }

  /**
   * 保存版本歷史
   */
  private saveVersionHistory(): void {
    try {
      const data = {
        versions: Array.from(this.versions.entries()),
        currentVersion: this.currentVersion,
        lastSyncedVersion: this.lastSyncedVersion
      };
      localStorage.setItem(`incremental_sync_${this.activityId}`, JSON.stringify(data));
    } catch (error) {
      console.error('保存版本歷史失敗:', error);
    }
  }

  /**
   * 載入版本歷史
   */
  private loadVersionHistory(): void {
    try {
      const saved = localStorage.getItem(`incremental_sync_${this.activityId}`);
      if (saved) {
        const data = JSON.parse(saved);
        this.versions = new Map(data.versions);
        this.currentVersion = data.currentVersion || 1;
        this.lastSyncedVersion = data.lastSyncedVersion || 0;
      }
    } catch (error) {
      console.error('載入版本歷史失敗:', error);
    }
  }

  /**
   * 添加狀態監聽器
   */
  addStateListener(listener: (state: SyncState) => void): void {
    this.stateListeners.add(listener);
  }

  /**
   * 移除狀態監聽器
   */
  removeStateListener(listener: (state: SyncState) => void): void {
    this.stateListeners.delete(listener);
  }

  /**
   * 獲取當前同步狀態
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.saveVersionHistory();
    this.stateListeners.clear();
    this.versions.clear();
  }
}
