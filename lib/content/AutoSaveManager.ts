/**
 * 自動保存管理器 - 模仿 wordwall.net 的自動保存機制
 * 提供實時自動保存、草稿管理和錯誤恢復功能
 */

import React from 'react';
import { UniversalContent } from './UniversalContentManager';
import { CompressionManager, CompressionResult } from './CompressionManager';
import { OfflineSyncManager, OfflineSyncMetrics } from './OfflineSyncManager';
import { PerformanceMonitor, PerformanceReport, PerformanceAlert } from './PerformanceMonitor';
import { IncrementalSyncManager, ContentVersion, SyncState, DiffResult } from './IncrementalSyncManager';
import { BatchSaveOptimizer, BatchOptimizationMetrics } from './BatchSaveOptimizer';

export interface AutoSaveState {
  activityId: string;
  guid: string; // 基於 Wordwall 的 GUID 系統
  title: string;
  lastSaved: Date;
  isAutoSave: boolean;
  hasUnsavedChanges: boolean;
  saveFrequency: number; // 實際保存頻率 (基於測試發現的 2 秒)
  contentChangeCount: number; // 內容變更計數
  sessionId: string; // Session 追蹤
  version: number; // 版本號追蹤
  compressionRatio: number; // 壓縮比例
  saveSuccessRate: number; // 保存成功率
  averageResponseTime: number; // 平均響應時間
  lastContentHash: string; // 內容哈希值
  conflictResolutionStatus: 'none' | 'pending' | 'resolved'; // 衝突解決狀態
}

export interface AutoSaveOptions {
  saveDelay?: number; // 自動保存延遲時間（毫秒）- 基於測試：2000ms
  maxRetries?: number; // 最大重試次數
  enableOfflineMode?: boolean; // 是否啟用離線模式
  enableCompression?: boolean; // 啟用數據壓縮 (基於 Wordwall ZIP 壓縮)
  enableGUIDTracking?: boolean; // 啟用 GUID 追蹤系統
  contentChangeThreshold?: number; // 內容變更觸發閾值 (基於測試：1 字符)
  enableSessionTracking?: boolean; // 啟用 Session 追蹤
  enableVersionTracking?: boolean; // 啟用版本追蹤
  enablePerformanceMonitoring?: boolean; // 啟用性能監控
  enableIncrementalSync?: boolean; // 啟用增量同步
  enableConflictResolution?: boolean; // 啟用衝突解決
  targetSuccessRate?: number; // 目標成功率 (默認 99.5%)
  targetResponseTime?: number; // 目標響應時間 (默認 300ms)
  enableBatchOptimization?: boolean; // 啟用批量優化
}

export class AutoSaveManager {
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly saveDelay: number;
  private readonly maxRetries: number;
  private readonly enableOfflineMode: boolean;
  private readonly enableCompression: boolean;
  private readonly enableGUIDTracking: boolean;
  private readonly contentChangeThreshold: number;
  private readonly enableSessionTracking: boolean;
  private readonly enableVersionTracking: boolean;
  private readonly enablePerformanceMonitoring: boolean;
  private readonly enableIncrementalSync: boolean;
  private readonly enableConflictResolution: boolean;
  private readonly targetSuccessRate: number;
  private readonly targetResponseTime: number;
  private readonly enableBatchOptimization: boolean;

  private retryCount = 0;
  private isOnline = true;
  private listeners: Set<(state: AutoSaveState) => void> = new Set();
  private guid: string;
  private sessionId: string;
  private contentChangeCount = 0;
  private lastContentHash = '';
  private version = 1;
  private saveAttempts = 0;
  private successfulSaves = 0;
  private totalResponseTime = 0;
  private compressionRatio = 1.0;
  private conflictResolutionStatus: 'none' | 'pending' | 'resolved' = 'none';
  private performanceMetrics: Array<{timestamp: number, responseTime: number, success: boolean}> = [];
  private compressionManager: CompressionManager;
  private offlineSyncManager: OfflineSyncManager;
  private performanceMonitor: PerformanceMonitor;
  private incrementalSyncManager: IncrementalSyncManager;
  private batchSaveOptimizer: BatchSaveOptimizer;

  constructor(
    private activityId: string,
    private options: AutoSaveOptions = {}
  ) {
    this.saveDelay = options.saveDelay || 2000; // 默認 2 秒
    this.maxRetries = options.maxRetries || 3;
    this.enableOfflineMode = options.enableOfflineMode ?? true;
    this.enableCompression = options.enableCompression ?? true;
    this.enableGUIDTracking = options.enableGUIDTracking ?? true;
    this.contentChangeThreshold = options.contentChangeThreshold || 1;
    this.enableSessionTracking = options.enableSessionTracking ?? true;
    this.enableVersionTracking = options.enableVersionTracking ?? true;
    this.enablePerformanceMonitoring = options.enablePerformanceMonitoring ?? true;
    this.enableIncrementalSync = options.enableIncrementalSync ?? true;
    this.enableConflictResolution = options.enableConflictResolution ?? true;
    this.targetSuccessRate = options.targetSuccessRate || 99.5;
    this.targetResponseTime = options.targetResponseTime || 300;
    this.enableBatchOptimization = options.enableBatchOptimization ?? true;

    // 初始化 GUID 和 Session ID
    this.guid = this.generateGUID();
    this.sessionId = this.generateSessionId();

    // 初始化壓縮管理器
    this.compressionManager = new CompressionManager({
      level: 6, // 平衡壓縮率和速度
      algorithm: 'auto',
      enableIntegrityCheck: true,
      enableMetrics: true,
      targetRatio: 2.5, // 目標 2.5x 壓縮比例
      maxSize: 10 * 1024 * 1024 // 10MB 限制
    });

    // 初始化離線同步管理器
    this.offlineSyncManager = new OfflineSyncManager({
      maxQueueSize: 100,
      syncIntervalMs: 5000,
      maxRetries: 3,
      enableAutoMerge: this.enableConflictResolution,
      conflictResolutionTimeout: 30000
    });

    // 初始化性能監控器
    this.performanceMonitor = new PerformanceMonitor(
      {
        saveTime: this.targetResponseTime,
        loadTime: 1000,
        compressionTime: 500,
        syncTime: 2000,
        successRate: this.targetSuccessRate
      },
      {
        maxMetrics: 1000,
        maxAlerts: 100,
        monitoringIntervalMs: 5000,
        enableAutoReporting: this.enablePerformanceMonitoring,
        reportIntervalMs: 60000
      }
    );

    // 初始化增量同步管理器
    this.incrementalSyncManager = new IncrementalSyncManager(this.activityId, {
      maxVersionHistory: 50,
      enableDetailedDiff: this.enableIncrementalSync,
      compressionEnabled: this.enableCompression,
      autoCleanupOldVersions: true,
      syncBatchSize: 10
    });

    // 初始化批量保存優化器
    this.batchSaveOptimizer = new BatchSaveOptimizer({
      maxBatchSize: 50,
      maxConcurrentBatches: 20,
      batchTimeoutMs: 5000,
      maxQueueSize: 10000,
      priorityWeights: { critical: 4, high: 3, medium: 2, low: 1 },
      enableLoadBalancing: true,
      enableDataIntegrityCheck: true,
      retryDelayMs: 1000,
      maxRetries: 3
    });

    // 監聽網絡狀態
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * 生成 GUID (基於 Wordwall 格式)
   */
  private generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 生成 Session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 計算內容哈希值
   */
  private calculateContentHash(content: string): string {
    let hash = 0;
    if (content.length === 0) return hash.toString();
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 檢查內容變更是否達到觸發閾值
   */
  private shouldTriggerSave(data: Partial<UniversalContent>): boolean {
    const currentContent = JSON.stringify(data);
    const currentHash = this.calculateContentHash(currentContent);

    if (currentHash !== this.lastContentHash) {
      this.contentChangeCount++;
      this.lastContentHash = currentHash;
      return this.contentChangeCount >= this.contentChangeThreshold;
    }

    return false;
  }

  /**
   * 觸發自動保存 (增強版 - 支持增量同步)
   */
  triggerAutoSave(data: Partial<UniversalContent>): void {
    // 檢查是否需要觸發保存
    if (!this.shouldTriggerSave(data)) {
      return;
    }

    // 創建新版本（如果啟用增量同步）
    if (this.enableIncrementalSync) {
      const version = this.incrementalSyncManager.createVersion(
        data,
        this.sessionId,
        'auto-save-user'
      );
      console.log(`📝 創建版本 ${version.version}，變更數量: ${version.changes.length}`);
    }

    // 清除之前的定時器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 立即更新 UI 狀態
    this.notifyListeners(this.getCurrentState(data, true));

    // 設置新的自動保存定時器
    this.saveTimer = setTimeout(() => {
      this.performAutoSave(data);
    }, this.saveDelay);
  }

  /**
   * 獲取當前狀態
   */
  private getCurrentState(data: Partial<UniversalContent>, hasUnsavedChanges: boolean): AutoSaveState {
    const currentSuccessRate = this.saveAttempts > 0 ? (this.successfulSaves / this.saveAttempts) * 100 : 100;
    const currentResponseTime = this.saveAttempts > 0 ? this.totalResponseTime / this.saveAttempts : 0;

    return {
      activityId: this.activityId,
      guid: this.guid,
      title: data.title || 'Untitled',
      lastSaved: new Date(),
      isAutoSave: true,
      hasUnsavedChanges,
      saveFrequency: this.saveDelay,
      contentChangeCount: this.contentChangeCount,
      sessionId: this.sessionId,
      version: this.version,
      compressionRatio: this.compressionRatio,
      saveSuccessRate: currentSuccessRate,
      averageResponseTime: currentResponseTime,
      lastContentHash: this.lastContentHash,
      conflictResolutionStatus: this.conflictResolutionStatus
    };
  }

  /**
   * 壓縮數據 (增強版 - 使用 CompressionManager)
   */
  private async compressData(data: any): Promise<{compressed: string, ratio: number, result: CompressionResult}> {
    if (!this.enableCompression) {
      const jsonData = JSON.stringify(data);
      return {
        compressed: jsonData,
        ratio: 1.0,
        result: {
          compressed: jsonData,
          originalSize: new Blob([jsonData]).size,
          compressedSize: new Blob([jsonData]).size,
          compressionRatio: 1.0,
          hash: '',
          algorithm: 'none',
          timestamp: Date.now(),
          integrity: true
        }
      };
    }

    try {
      const compressionStart = performance.now();
      const result = await this.compressionManager.compress(data);
      const compressionTime = performance.now() - compressionStart;

      this.compressionRatio = result.compressionRatio;

      // 記錄壓縮性能
      this.performanceMonitor.recordMetric('compress', compressionTime, true, {
        dataSize: result.originalSize,
        compressionRatio: result.compressionRatio
      });

      console.log(`🗜️ 壓縮完成: ${result.originalSize}B → ${result.compressedSize}B (${result.compressionRatio.toFixed(2)}x) 耗時: ${compressionTime.toFixed(2)}ms`);

      return {
        compressed: result.compressed,
        ratio: result.compressionRatio,
        result
      };
    } catch (error) {
      console.warn('數據壓縮失敗，使用原始數據:', error);
      const jsonData = JSON.stringify(data);
      const size = new Blob([jsonData]).size;

      return {
        compressed: jsonData,
        ratio: 1.0,
        result: {
          compressed: jsonData,
          originalSize: size,
          compressedSize: size,
          compressionRatio: 1.0,
          hash: '',
          algorithm: 'none',
          timestamp: Date.now(),
          integrity: true
        }
      };
    }
  }

  /**
   * 執行自動保存 (增強版)
   */
  private async performAutoSave(data: Partial<UniversalContent>): Promise<void> {
    const startTime = performance.now();
    this.saveAttempts++;

    try {
      // 如果離線且啟用離線模式，添加到同步隊列
      if (!this.isOnline && this.enableOfflineMode) {
        await this.handleOfflineSave(data);
        return;
      }

      // 如果啟用批量優化，添加到批量隊列
      if (this.enableBatchOptimization) {
        await this.handleBatchSave(data);
        return;
      }

      // 準備保存數據
      const saveData = {
        ...data,
        guid: this.guid,
        sessionId: this.sessionId,
        version: this.version,
        lastModified: new Date().toISOString(),
        isAutoSave: true,
        contentHash: this.lastContentHash
      };

      // 壓縮數據
      const { compressed, ratio, result } = await this.compressData(saveData);
      this.compressionRatio = ratio;

      // 準備 API 請求數據
      const apiRequestData = {
        guid: this.guid,
        sessionId: this.sessionId,
        content: saveData,
        contentHash: result.hash,
        changeType: this.getChangeType(),
        changeCount: this.contentChangeCount,
        isCompressed: this.enableCompression,
        templateId: saveData.templateId,
        folderId: saveData.folderId,
        metadata: {
          compressionAlgorithm: result.algorithm,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          networkStatus: this.isOnline ? 'online' : 'offline',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      // 在線保存到服務器
      const response = await fetch(`/api/universal-content/${this.activityId}/enhanced-autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Compression-Enabled': this.enableCompression.toString(),
          'X-Compression-Algorithm': result.algorithm,
          'X-Compression-Ratio': result.compressionRatio.toString(),
          'X-Content-Hash': result.hash,
          'X-Session-ID': this.sessionId,
          'X-Content-Version': this.version.toString(),
          'X-Original-Size': result.originalSize.toString(),
          'X-Compressed-Size': result.compressedSize.toString()
        },
        body: JSON.stringify(apiRequestData)
      });

      if (!response.ok) {
        throw new Error(`自動保存失敗: ${response.status}`);
      }

      const responseData = await response.json();

      // 記錄性能指標
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      this.recordPerformanceMetric(responseTime, true);

      // 記錄到性能監控器
      this.performanceMonitor.recordMetric('save', responseTime, true, {
        dataSize: result.originalSize,
        compressionRatio: result.compressionRatio,
        networkStatus: this.isOnline ? 'online' : 'offline'
      });

      // 更新版本號
      this.version++;
      this.retryCount = 0;
      this.successfulSaves++;

      // 處理衝突解決
      if (responseData.conflictDetected) {
        this.conflictResolutionStatus = 'pending';
        await this.handleConflictResolution(responseData.conflictData);
      }

      // 更新保存狀態
      this.notifyListeners(this.getCurrentState(data, false));

      // 更新自動保存指示器
      this.updateAutoSaveIndicator(data.title || 'Untitled');

    } catch (error) {
      console.error('自動保存失敗:', error);

      // 記錄失敗的性能指標
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      this.recordPerformanceMetric(responseTime, false);

      // 記錄到性能監控器
      this.performanceMonitor.recordMetric('save', responseTime, false, {
        retryCount: this.retryCount,
        networkStatus: this.isOnline ? 'online' : 'offline'
      }, (error as Error).message);

      // 重試機制 (指數退避策略)
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
        setTimeout(() => {
          this.performAutoSave(data);
        }, retryDelay);
      } else {
        // 達到最大重試次數，保存到本地存儲
        if (this.enableOfflineMode) {
          await this.saveToLocalStorage(data);
        }
        this.notifyError(error as Error);
      }
    }
  }

  /**
   * 記錄性能指標
   */
  private recordPerformanceMetric(responseTime: number, success: boolean): void {
    if (!this.enablePerformanceMonitoring) return;

    this.performanceMetrics.push({
      timestamp: Date.now(),
      responseTime,
      success
    });

    // 保持最近100條記錄
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }

    // 更新總響應時間
    if (success) {
      this.totalResponseTime += responseTime;
    }

    // 檢查性能警告
    this.checkPerformanceWarnings();
  }

  /**
   * 檢查性能警告
   */
  private checkPerformanceWarnings(): void {
    const recentMetrics = this.performanceMetrics.slice(-10);
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    const successRate = (this.successfulSaves / this.saveAttempts) * 100;

    if (avgResponseTime > this.targetResponseTime) {
      console.warn(`⚠️ 自動保存響應時間過慢: ${avgResponseTime.toFixed(2)}ms (目標: ${this.targetResponseTime}ms)`);
    }

    if (successRate < this.targetSuccessRate) {
      console.warn(`⚠️ 自動保存成功率過低: ${successRate.toFixed(2)}% (目標: ${this.targetSuccessRate}%)`);
    }
  }

  /**
   * 處理衝突解決
   */
  private async handleConflictResolution(conflictData: any): Promise<void> {
    if (!this.enableConflictResolution) return;

    this.conflictResolutionStatus = 'pending';

    try {
      // 三方合併算法 (簡化版)
      const mergedData = await this.performThreeWayMerge(conflictData);

      if (mergedData) {
        this.conflictResolutionStatus = 'resolved';
        console.log('✅ 衝突已自動解決');
      } else {
        console.warn('⚠️ 衝突需要手動解決');
      }
    } catch (error) {
      console.error('衝突解決失敗:', error);
      this.conflictResolutionStatus = 'none';
    }
  }

  /**
   * 處理批量保存
   */
  private async handleBatchSave(data: Partial<UniversalContent>): Promise<void> {
    try {
      // 準備保存數據
      const saveData = {
        ...data,
        guid: this.guid,
        sessionId: this.sessionId,
        version: this.version,
        lastModified: new Date().toISOString(),
        isAutoSave: true,
        contentHash: this.lastContentHash
      };

      // 壓縮數據
      const { compressed, ratio, result } = await this.compressData(saveData);
      this.compressionRatio = ratio;

      // 確定優先級
      const priority = this.determineSavePriority(data);

      // 添加到批量隊列
      const batchId = await this.batchSaveOptimizer.addSaveItem(
        this.activityId,
        this.sessionId, // 使用 sessionId 作為 userId
        {
          compressed,
          compressionMetadata: {
            algorithm: result.algorithm,
            hash: result.hash,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio
          }
        },
        priority
      );

      console.log(`📦 批量保存已加入隊列: ${batchId} (優先級: ${priority})`);

      // 同時保存到本地存儲作為備份
      await this.saveToLocalStorage(data);

      // 更新狀態
      this.successfulSaves++;
      this.notifyListeners(this.getCurrentState(data, false));

    } catch (error) {
      console.error('批量保存失敗:', error);
      // 降級到直接保存
      await this.performDirectSave(data);
    }
  }

  /**
   * 確定保存優先級
   */
  private determineSavePriority(data: Partial<UniversalContent>): 'critical' | 'high' | 'medium' | 'low' {
    // 基於內容類型和變更頻率確定優先級
    const changeCount = this.contentChangeCount;
    const dataSize = JSON.stringify(data).length;

    if (changeCount > 10 || dataSize > 100000) {
      return 'critical';
    } else if (changeCount > 5 || dataSize > 50000) {
      return 'high';
    } else if (changeCount > 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 直接保存（降級方案）
   */
  private async performDirectSave(data: Partial<UniversalContent>): Promise<void> {
    // 使用原有的直接保存邏輯作為降級方案
    console.log('🔄 使用直接保存作為降級方案');
    // 這裡可以調用原有的保存邏輯
  }

  /**
   * 處理離線保存
   */
  private async handleOfflineSave(data: Partial<UniversalContent>): Promise<void> {
    try {
      // 準備保存數據
      const saveData = {
        ...data,
        guid: this.guid,
        sessionId: this.sessionId,
        version: this.version,
        lastModified: new Date().toISOString(),
        isAutoSave: true,
        contentHash: this.lastContentHash
      };

      // 壓縮數據
      const { compressed, ratio, result } = await this.compressData(saveData);
      this.compressionRatio = ratio;

      // 添加到離線同步隊列
      const queueId = await this.offlineSyncManager.addToQueue(
        this.activityId,
        {
          compressed,
          compressionMetadata: {
            algorithm: result.algorithm,
            hash: result.hash,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio
          }
        },
        'high' // 自動保存使用高優先級
      );

      console.log(`📱 離線保存已加入同步隊列: ${queueId}`);

      // 同時保存到本地存儲作為備份
      await this.saveToLocalStorage(data);

      // 更新狀態
      this.successfulSaves++;
      this.notifyListeners(this.getCurrentState(data, false));

    } catch (error) {
      console.error('離線保存失敗:', error);
      // 降級到基本本地存儲
      await this.saveToLocalStorage(data);
    }
  }

  /**
   * 三方合併算法 (委託給 OfflineSyncManager)
   */
  private async performThreeWayMerge(conflictData: any): Promise<any> {
    // 現在由 OfflineSyncManager 處理更複雜的合併邏輯
    return conflictData.autoMerged || null;
  }

  /**
   * 保存到本地存儲 (增強版)
   */
  private async saveToLocalStorage(data: Partial<UniversalContent>): Promise<void> {
    try {
      const autoSaveData = {
        activityId: this.activityId,
        guid: this.guid,
        sessionId: this.sessionId,
        version: this.version,
        data,
        timestamp: new Date().toISOString(),
        contentHash: this.lastContentHash,
        compressionRatio: this.compressionRatio
      };

      // 壓縮本地存儲數據
      const { compressed, result } = await this.compressData(autoSaveData);

      // 存儲壓縮元數據
      autoSaveData.compressionMetadata = {
        algorithm: result.algorithm,
        hash: result.hash,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio
      };

      localStorage.setItem(
        `autosave_${this.activityId}`,
        compressed
      );

      // 同時保存到同步隊列
      this.addToSyncQueue(autoSaveData);

      this.successfulSaves++;
      this.notifyListeners(this.getCurrentState(data, false));

    } catch (error) {
      console.error('本地存儲保存失敗:', error);
    }
  }

  /**
   * 添加到同步隊列
   */
  private addToSyncQueue(data: any): void {
    try {
      const syncQueue = JSON.parse(localStorage.getItem('autosave_sync_queue') || '[]');
      syncQueue.push({
        ...data,
        queuedAt: Date.now()
      });

      // 保持隊列大小
      if (syncQueue.length > 50) {
        syncQueue.splice(0, syncQueue.length - 50);
      }

      localStorage.setItem('autosave_sync_queue', JSON.stringify(syncQueue));
    } catch (error) {
      console.error('添加到同步隊列失敗:', error);
    }
  }

  /**
   * 從本地存儲恢復數據 (增強版 - 支持解壓縮)
   */
  async restoreFromLocalStorage(): Promise<Partial<UniversalContent> | null> {
    const loadStart = performance.now();

    try {
      const saved = localStorage.getItem(`autosave_${this.activityId}`);
      if (saved) {
        let autoSaveData;

        try {
          // 嘗試使用 CompressionManager 解壓縮
          if (this.enableCompression) {
            // 首先嘗試解析為壓縮數據結構
            const compressedData = JSON.parse(saved);

            if (compressedData.compressionMetadata) {
              const { algorithm, hash } = compressedData.compressionMetadata;

              if (algorithm !== 'none') {
                // 解壓縮數據
                autoSaveData = await this.compressionManager.decompress(
                  compressedData.compressed || saved,
                  algorithm,
                  hash
                );
                console.log('✅ 本地數據解壓縮成功');
              } else {
                autoSaveData = compressedData;
              }
            } else {
              // 舊格式，嘗試 base64 解碼
              const decompressed = atob(saved);
              autoSaveData = JSON.parse(decompressed);
            }
          } else {
            // 直接解析
            autoSaveData = JSON.parse(saved);
          }
        } catch (decompressError) {
          console.warn('解壓縮失敗，嘗試直接解析:', decompressError);
          // 降級處理：直接解析
          autoSaveData = JSON.parse(saved);
        }

        // 恢復狀態信息
        if (autoSaveData.guid) this.guid = autoSaveData.guid;
        if (autoSaveData.sessionId) this.sessionId = autoSaveData.sessionId;
        if (autoSaveData.version) this.version = autoSaveData.version;
        if (autoSaveData.contentHash) this.lastContentHash = autoSaveData.contentHash;
        if (autoSaveData.compressionRatio) this.compressionRatio = autoSaveData.compressionRatio;

        // 記錄載入性能
        const loadTime = performance.now() - loadStart;
        this.performanceMonitor.recordMetric('load', loadTime, true, {
          dataSize: JSON.stringify(autoSaveData.data).length
        });

        return autoSaveData.data;
      }
    } catch (error) {
      console.error('本地存儲恢復失敗:', error);

      // 記錄載入失敗
      const loadTime = performance.now() - loadStart;
      this.performanceMonitor.recordMetric('load', loadTime, false, {}, (error as Error).message);
    }
    return null;
  }

  /**
   * 處理同步隊列
   */
  private async processSyncQueue(): Promise<void> {
    try {
      const syncQueue = JSON.parse(localStorage.getItem('autosave_sync_queue') || '[]');

      for (const item of syncQueue) {
        try {
          await this.performAutoSave(item.data);
          // 成功同步後從隊列中移除
          const updatedQueue = syncQueue.filter((q: any) => q.queuedAt !== item.queuedAt);
          localStorage.setItem('autosave_sync_queue', JSON.stringify(updatedQueue));
        } catch (error) {
          console.error('同步隊列項目失敗:', error);
        }
      }
    } catch (error) {
      console.error('處理同步隊列失敗:', error);
    }
  }

  /**
   * 清除本地存儲的自動保存數據
   */
  clearLocalStorage(): void {
    try {
      localStorage.removeItem(`autosave_${this.activityId}`);
    } catch (error) {
      console.error('清除本地存儲失敗:', error);
    }
  }

  /**
   * 強制保存（不等待延遲）
   */
  async forceSave(data: Partial<UniversalContent>): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    await this.performAutoSave(data);
  }

  /**
   * 更新自動保存指示器
   */
  private updateAutoSaveIndicator(title: string): void {
    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
      indicator.innerHTML = `
        <a href="/universal-game?autosave=true&id=${this.activityId}" 
           class="text-blue-600 hover:text-blue-800 text-sm">
          Continue editing: ${title}?
        </a>
      `;
      indicator.style.display = 'block';
    }
  }

  /**
   * 處理網絡連接恢復 (增強版 - 使用 OfflineSyncManager)
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('🌐 網絡連接已恢復，OfflineSyncManager 將自動處理同步...');

    // OfflineSyncManager 會自動處理同步隊列
    // 這裡只需要處理舊的本地存儲數據
    this.restoreFromLocalStorage().then(localData => {
      if (localData) {
        this.performAutoSave(localData).then(() => {
          this.clearLocalStorage();
          console.log('✅ 舊版本本地數據同步完成');
        }).catch(error => {
          console.error('❌ 舊版本本地數據同步失敗:', error);
        });
      }
    });
  }

  /**
   * 處理網絡連接斷開
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('網絡連接已斷開，切換到離線模式...');
  }

  /**
   * 添加狀態監聽器
   */
  addListener(listener: (state: AutoSaveState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除狀態監聽器
   */
  removeListener(listener: (state: AutoSaveState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有監聽器
   */
  private notifyListeners(state: AutoSaveState): void {
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * 通知錯誤
   */
  private notifyError(error: Error): void {
    // 可以通過事件系統或回調通知錯誤
    console.error('AutoSave Error:', error);
    
    // 顯示用戶友好的錯誤消息
    const errorElement = document.getElementById('autosave-error');
    if (errorElement) {
      errorElement.textContent = '自動保存失敗，數據已保存到本地';
      errorElement.style.display = 'block';
      
      // 3秒後隱藏錯誤消息
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * 獲取性能指標
   */
  getPerformanceMetrics(): {
    successRate: number;
    averageResponseTime: number;
    compressionRatio: number;
    totalSaves: number;
    recentMetrics: Array<{timestamp: number, responseTime: number, success: boolean}>;
  } {
    const successRate = this.saveAttempts > 0 ? (this.successfulSaves / this.saveAttempts) * 100 : 100;
    const averageResponseTime = this.saveAttempts > 0 ? this.totalResponseTime / this.saveAttempts : 0;

    return {
      successRate,
      averageResponseTime,
      compressionRatio: this.compressionRatio,
      totalSaves: this.successfulSaves,
      recentMetrics: this.performanceMetrics.slice(-10)
    };
  }

  /**
   * 獲取當前完整狀態
   */
  getCurrentFullState(): AutoSaveState {
    return this.getCurrentState({ title: 'Current State' }, false);
  }

  /**
   * 重置性能指標
   */
  resetPerformanceMetrics(): void {
    this.saveAttempts = 0;
    this.successfulSaves = 0;
    this.totalResponseTime = 0;
    this.performanceMetrics = [];
    this.compressionRatio = 1.0;
  }

  /**
   * 檢查是否達到性能目標
   */
  isPerformanceTargetMet(): {
    successRateOk: boolean;
    responseTimeOk: boolean;
    compressionRatioOk: boolean;
    overall: boolean;
  } {
    const metrics = this.getPerformanceMetrics();
    const successRateOk = metrics.successRate >= this.targetSuccessRate;
    const responseTimeOk = metrics.averageResponseTime <= this.targetResponseTime;
    const compressionRatioOk = this.compressionManager.isTargetRatioMet();

    return {
      successRateOk,
      responseTimeOk,
      compressionRatioOk,
      overall: successRateOk && responseTimeOk && compressionRatioOk
    };
  }

  /**
   * 獲取壓縮指標
   */
  getCompressionMetrics() {
    return this.compressionManager.getMetrics();
  }

  /**
   * 重置壓縮指標
   */
  resetCompressionMetrics(): void {
    this.compressionManager.resetMetrics();
  }

  /**
   * 獲取離線同步指標
   */
  getOfflineSyncMetrics(): OfflineSyncMetrics {
    return this.offlineSyncManager.getMetrics();
  }

  /**
   * 獲取衝突解決狀態
   */
  getConflictResolutions() {
    return this.offlineSyncManager.getConflictResolutions();
  }

  /**
   * 手動解決衝突
   */
  async resolveConflict(conflictId: string, resolution: 'server-wins' | 'client-wins' | 'merge', mergedData?: any): Promise<void> {
    return this.offlineSyncManager.resolveConflict(conflictId, resolution, mergedData);
  }

  /**
   * 添加離線同步指標監聽器
   */
  addOfflineSyncListener(listener: (metrics: OfflineSyncMetrics) => void): void {
    this.offlineSyncManager.addMetricsListener(listener);
  }

  /**
   * 移除離線同步指標監聽器
   */
  removeOfflineSyncListener(listener: (metrics: OfflineSyncMetrics) => void): void {
    this.offlineSyncManager.removeMetricsListener(listener);
  }

  /**
   * 生成性能報告
   */
  generatePerformanceReport(timeRangeMs: number = 3600000): PerformanceReport {
    return this.performanceMonitor.generateReport(timeRangeMs);
  }

  /**
   * 獲取最近的性能指標
   */
  getRecentPerformanceMetrics(count: number = 50) {
    return this.performanceMonitor.getRecentMetrics(count);
  }

  /**
   * 獲取最近的性能警告
   */
  getRecentPerformanceAlerts(count: number = 20) {
    return this.performanceMonitor.getRecentAlerts(count);
  }

  /**
   * 添加性能警告監聽器
   */
  addPerformanceAlertListener(listener: (alert: PerformanceAlert) => void): void {
    this.performanceMonitor.addAlertListener(listener);
  }

  /**
   * 移除性能警告監聽器
   */
  removePerformanceAlertListener(listener: (alert: PerformanceAlert) => void): void {
    this.performanceMonitor.removeAlertListener(listener);
  }

  /**
   * 添加性能報告監聽器
   */
  addPerformanceReportListener(listener: (report: PerformanceReport) => void): void {
    this.performanceMonitor.addReportListener(listener);
  }

  /**
   * 移除性能報告監聽器
   */
  removePerformanceReportListener(listener: (report: PerformanceReport) => void): void {
    this.performanceMonitor.removeReportListener(listener);
  }

  /**
   * 獲取版本歷史
   */
  getVersionHistory(limit?: number): ContentVersion[] {
    return this.incrementalSyncManager.getVersionHistory(limit);
  }

  /**
   * 回滾到指定版本
   */
  rollbackToVersion(version: number): Partial<UniversalContent> | null {
    return this.incrementalSyncManager.rollbackToVersion(version);
  }

  /**
   * 獲取版本統計
   */
  getVersionStats() {
    return this.incrementalSyncManager.getVersionStats();
  }

  /**
   * 獲取增量數據
   */
  getIncrementalData(fromVersion: number, toVersion?: number) {
    return this.incrementalSyncManager.getIncrementalData(fromVersion, toVersion);
  }

  /**
   * 計算內容差異
   */
  calculateDiff(oldContent: any, newContent: any): DiffResult {
    return this.incrementalSyncManager.calculateDiff(oldContent, newContent);
  }

  /**
   * 獲取同步狀態
   */
  getIncrementalSyncState(): SyncState {
    return this.incrementalSyncManager.getSyncState();
  }

  /**
   * 添加增量同步狀態監聽器
   */
  addIncrementalSyncListener(listener: (state: SyncState) => void): void {
    this.incrementalSyncManager.addStateListener(listener);
  }

  /**
   * 移除增量同步狀態監聽器
   */
  removeIncrementalSyncListener(listener: (state: SyncState) => void): void {
    this.incrementalSyncManager.removeStateListener(listener);
  }

  /**
   * 獲取批量保存指標
   */
  getBatchOptimizationMetrics(): BatchOptimizationMetrics {
    return this.batchSaveOptimizer.getMetrics();
  }

  /**
   * 獲取批量隊列狀態
   */
  getBatchQueueStatus() {
    return this.batchSaveOptimizer.getQueueStatus();
  }

  /**
   * 添加批量保存指標監聽器
   */
  addBatchMetricsListener(listener: (metrics: BatchOptimizationMetrics) => void): void {
    this.batchSaveOptimizer.addMetricsListener(listener);
  }

  /**
   * 移除批量保存指標監聽器
   */
  removeBatchMetricsListener(listener: (metrics: BatchOptimizationMetrics) => void): void {
    this.batchSaveOptimizer.removeMetricsListener(listener);
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }

    // 清理離線同步管理器
    this.offlineSyncManager.destroy();

    // 清理性能監控器
    this.performanceMonitor.destroy();

    // 清理增量同步管理器
    this.incrementalSyncManager.destroy();

    // 清理批量保存優化器
    this.batchSaveOptimizer.destroy();

    this.listeners.clear();
    this.performanceMetrics = [];
  }

  /**
   * 獲取變更類型 (基於內容變更模式)
   */
  private getChangeType(): 'typing' | 'paste' | 'delete' | 'template-switch' | 'manual' {
    // 這裡可以根據實際的變更模式來判斷
    // 目前簡化為基於變更計數的判斷
    if (this.contentChangeCount === 1) {
      return 'typing';
    } else if (this.contentChangeCount > 5) {
      return 'paste';
    } else {
      return 'manual';
    }
  }
}

/**
 * 生成唯一的活動 ID
 */
export function generateActivityId(): string {
  return 'activity_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * 創建自動保存管理器的 Hook (增強版)
 */
export function useAutoSave(activityId: string, options?: AutoSaveOptions) {
  const [autoSaveManager] = React.useState(() => new AutoSaveManager(activityId, options));
  const [autoSaveState, setAutoSaveState] = React.useState<AutoSaveState | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = React.useState<any>(null);
  const [compressionMetrics, setCompressionMetrics] = React.useState<any>(null);
  const [offlineSyncMetrics, setOfflineSyncMetrics] = React.useState<OfflineSyncMetrics | null>(null);
  const [performanceAlerts, setPerformanceAlerts] = React.useState<PerformanceAlert[]>([]);
  const [performanceReport, setPerformanceReport] = React.useState<PerformanceReport | null>(null);
  const [incrementalSyncState, setIncrementalSyncState] = React.useState<SyncState | null>(null);
  const [versionHistory, setVersionHistory] = React.useState<ContentVersion[]>([]);
  const [batchOptimizationMetrics, setBatchOptimizationMetrics] = React.useState<BatchOptimizationMetrics | null>(null);

  React.useEffect(() => {
    const handleStateChange = (state: AutoSaveState) => {
      setAutoSaveState(state);
      // 同時更新性能和壓縮指標
      setPerformanceMetrics(autoSaveManager.getPerformanceMetrics());
      setCompressionMetrics(autoSaveManager.getCompressionMetrics());
      setOfflineSyncMetrics(autoSaveManager.getOfflineSyncMetrics());
    };

    const handleOfflineSyncMetrics = (metrics: OfflineSyncMetrics) => {
      setOfflineSyncMetrics(metrics);
    };

    const handlePerformanceAlert = (alert: PerformanceAlert) => {
      setPerformanceAlerts(prev => [...prev.slice(-19), alert]); // 保持最近20個警告
    };

    const handlePerformanceReport = (report: PerformanceReport) => {
      setPerformanceReport(report);
    };

    const handleIncrementalSyncState = (state: SyncState) => {
      setIncrementalSyncState(state);
    };

    const handleBatchOptimizationMetrics = (metrics: BatchOptimizationMetrics) => {
      setBatchOptimizationMetrics(metrics);
    };

    autoSaveManager.addListener(handleStateChange);
    autoSaveManager.addOfflineSyncListener(handleOfflineSyncMetrics);
    autoSaveManager.addPerformanceAlertListener(handlePerformanceAlert);
    autoSaveManager.addPerformanceReportListener(handlePerformanceReport);
    autoSaveManager.addIncrementalSyncListener(handleIncrementalSyncState);
    autoSaveManager.addBatchMetricsListener(handleBatchOptimizationMetrics);

    // 定期更新指標
    const metricsInterval = setInterval(() => {
      setPerformanceMetrics(autoSaveManager.getPerformanceMetrics());
      setCompressionMetrics(autoSaveManager.getCompressionMetrics());
      setOfflineSyncMetrics(autoSaveManager.getOfflineSyncMetrics());
      setVersionHistory(autoSaveManager.getVersionHistory(10)); // 最近10個版本
      setBatchOptimizationMetrics(autoSaveManager.getBatchOptimizationMetrics());
    }, 5000);

    return () => {
      autoSaveManager.removeListener(handleStateChange);
      autoSaveManager.removeOfflineSyncListener(handleOfflineSyncMetrics);
      autoSaveManager.removePerformanceAlertListener(handlePerformanceAlert);
      autoSaveManager.removePerformanceReportListener(handlePerformanceReport);
      autoSaveManager.removeIncrementalSyncListener(handleIncrementalSyncState);
      autoSaveManager.removeBatchMetricsListener(handleBatchOptimizationMetrics);
      clearInterval(metricsInterval);
      autoSaveManager.destroy();
    };
  }, [autoSaveManager]);

  return {
    // 基本功能
    triggerAutoSave: autoSaveManager.triggerAutoSave.bind(autoSaveManager),
    forceSave: autoSaveManager.forceSave.bind(autoSaveManager),
    restoreFromLocalStorage: autoSaveManager.restoreFromLocalStorage.bind(autoSaveManager),

    // 狀態和指標
    autoSaveState,
    performanceMetrics,
    compressionMetrics,
    offlineSyncMetrics,
    performanceAlerts,
    performanceReport,
    incrementalSyncState,
    versionHistory,
    batchOptimizationMetrics,

    // 高級功能
    getPerformanceMetrics: autoSaveManager.getPerformanceMetrics.bind(autoSaveManager),
    getCompressionMetrics: autoSaveManager.getCompressionMetrics.bind(autoSaveManager),
    getOfflineSyncMetrics: autoSaveManager.getOfflineSyncMetrics.bind(autoSaveManager),
    getCurrentFullState: autoSaveManager.getCurrentFullState.bind(autoSaveManager),
    resetPerformanceMetrics: autoSaveManager.resetPerformanceMetrics.bind(autoSaveManager),
    resetCompressionMetrics: autoSaveManager.resetCompressionMetrics.bind(autoSaveManager),
    isPerformanceTargetMet: autoSaveManager.isPerformanceTargetMet.bind(autoSaveManager),

    // 離線同步功能
    getConflictResolutions: autoSaveManager.getConflictResolutions.bind(autoSaveManager),
    resolveConflict: autoSaveManager.resolveConflict.bind(autoSaveManager),
    addOfflineSyncListener: autoSaveManager.addOfflineSyncListener.bind(autoSaveManager),
    removeOfflineSyncListener: autoSaveManager.removeOfflineSyncListener.bind(autoSaveManager),

    // 性能監控功能
    generatePerformanceReport: autoSaveManager.generatePerformanceReport.bind(autoSaveManager),
    getRecentPerformanceMetrics: autoSaveManager.getRecentPerformanceMetrics.bind(autoSaveManager),
    getRecentPerformanceAlerts: autoSaveManager.getRecentPerformanceAlerts.bind(autoSaveManager),
    addPerformanceAlertListener: autoSaveManager.addPerformanceAlertListener.bind(autoSaveManager),
    removePerformanceAlertListener: autoSaveManager.removePerformanceAlertListener.bind(autoSaveManager),
    addPerformanceReportListener: autoSaveManager.addPerformanceReportListener.bind(autoSaveManager),
    removePerformanceReportListener: autoSaveManager.removePerformanceReportListener.bind(autoSaveManager),

    // 增量同步功能
    getVersionHistory: autoSaveManager.getVersionHistory.bind(autoSaveManager),
    rollbackToVersion: autoSaveManager.rollbackToVersion.bind(autoSaveManager),
    getVersionStats: autoSaveManager.getVersionStats.bind(autoSaveManager),
    getIncrementalData: autoSaveManager.getIncrementalData.bind(autoSaveManager),
    calculateDiff: autoSaveManager.calculateDiff.bind(autoSaveManager),
    getIncrementalSyncState: autoSaveManager.getIncrementalSyncState.bind(autoSaveManager),
    addIncrementalSyncListener: autoSaveManager.addIncrementalSyncListener.bind(autoSaveManager),
    removeIncrementalSyncListener: autoSaveManager.removeIncrementalSyncListener.bind(autoSaveManager),

    // 批量保存優化功能
    getBatchOptimizationMetrics: autoSaveManager.getBatchOptimizationMetrics.bind(autoSaveManager),
    getBatchQueueStatus: autoSaveManager.getBatchQueueStatus.bind(autoSaveManager),
    addBatchMetricsListener: autoSaveManager.addBatchMetricsListener.bind(autoSaveManager),
    removeBatchMetricsListener: autoSaveManager.removeBatchMetricsListener.bind(autoSaveManager),

    // 管理器實例 (用於高級用途)
    manager: autoSaveManager
  };
}
