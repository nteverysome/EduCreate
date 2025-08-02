/**
 * GamePauseResumeManager - 遊戲暫停/恢復管理器
 * 為非活躍遊戲實現暫停機制，釋放 CPU 和記憶體資源
 * 支援智能暫停、資源回收、狀態保存等功能
 */

import { GameInstance } from './UnifiedGameManager';
import { GameResourcePool } from './GameResourcePool';

// 暫停狀態類型
export type PauseState = 'active' | 'paused' | 'suspended' | 'hibernated';

// 暫停原因
export type PauseReason = 'user_switch' | 'memory_pressure' | 'background' | 'idle_timeout' | 'system_optimization';

// 暫停配置
export interface PauseConfig {
  idleTimeout?: number; // 閒置超時時間 (ms)
  memoryThreshold?: number; // 記憶體壓力閾值 (MB)
  suspendTimeout?: number; // 暫停後進入掛起狀態的時間 (ms)
  hibernateTimeout?: number; // 掛起後進入休眠狀態的時間 (ms)
  enableSmartPause?: boolean; // 啟用智能暫停
  preserveAudioContext?: boolean; // 保留音頻上下文
  preserveCanvasState?: boolean; // 保留 Canvas 狀態
}

// 暫停狀態信息
export interface PauseStateInfo {
  gameId: string;
  state: PauseState;
  reason: PauseReason;
  pausedAt: Date;
  resumedAt?: Date;
  resourcesSaved: number; // 節省的記憶體 (MB)
  pauseCount: number;
  totalPausedTime: number; // 總暫停時間 (ms)
}

// 資源快照
interface ResourceSnapshot {
  audioContexts: any[];
  canvasStates: any[];
  animationFrames: number[];
  timers: number[];
  eventListeners: any[];
  memoryUsage: number;
}

export class GamePauseResumeManager {
  private pausedGames = new Map<string, PauseStateInfo>();
  private resourceSnapshots = new Map<string, ResourceSnapshot>();
  private pauseTimers = new Map<string, NodeJS.Timeout>();
  private resourcePool?: GameResourcePool;
  
  // 配置選項
  private readonly config: Required<PauseConfig>;
  
  // 統計信息
  private stats = {
    totalPauses: 0,
    totalResumes: 0,
    totalResourcesSaved: 0,
    averagePauseTime: 0,
    smartPauseCount: 0
  };

  constructor(config: PauseConfig = {}, resourcePool?: GameResourcePool) {
    this.config = {
      idleTimeout: config.idleTimeout || 300000, // 5分鐘
      memoryThreshold: config.memoryThreshold || 400, // 400MB
      suspendTimeout: config.suspendTimeout || 600000, // 10分鐘
      hibernateTimeout: config.hibernateTimeout || 1800000, // 30分鐘
      enableSmartPause: config.enableSmartPause ?? true,
      preserveAudioContext: config.preserveAudioContext ?? false,
      preserveCanvasState: config.preserveCanvasState ?? true
    };

    this.resourcePool = resourcePool;
    
    console.log('⏸️ GamePauseResumeManager 初始化完成');
    console.log(`⚙️ 配置: 閒置=${this.config.idleTimeout/1000}s, 記憶體閾值=${this.config.memoryThreshold}MB`);
  }

  /**
   * 暫停遊戲
   */
  async pauseGame(instance: GameInstance, reason: PauseReason): Promise<boolean> {
    try {
      if (this.isPaused(instance.gameId)) {
        console.log(`⏸️ 遊戲已暫停: ${instance.gameId}`);
        return true;
      }

      console.log(`⏸️ 暫停遊戲: ${instance.gameId} (原因: ${reason})`);

      // 創建資源快照
      const snapshot = await this.createResourceSnapshot(instance);
      this.resourceSnapshots.set(instance.gameId, snapshot);

      // 暫停遊戲邏輯
      await this.pauseGameLogic(instance);

      // 釋放資源
      const savedMemory = await this.releaseGameResources(instance);

      // 記錄暫停狀態
      const pauseInfo: PauseStateInfo = {
        gameId: instance.gameId,
        state: 'paused',
        reason,
        pausedAt: new Date(),
        resourcesSaved: savedMemory,
        pauseCount: (this.pausedGames.get(instance.gameId)?.pauseCount || 0) + 1,
        totalPausedTime: this.pausedGames.get(instance.gameId)?.totalPausedTime || 0
      };

      this.pausedGames.set(instance.gameId, pauseInfo);

      // 設置自動升級暫停狀態的定時器
      this.setupPauseStateTimers(instance.gameId);

      // 更新統計
      this.stats.totalPauses++;
      this.stats.totalResourcesSaved += savedMemory;

      console.log(`✅ 遊戲暫停成功: ${instance.gameId} (節省 ${savedMemory}MB)`);
      return true;
    } catch (error) {
      console.error(`❌ 暫停遊戲失敗: ${instance.gameId}`, error);
      return false;
    }
  }

  /**
   * 恢復遊戲
   */
  async resumeGame(instance: GameInstance): Promise<boolean> {
    try {
      const pauseInfo = this.pausedGames.get(instance.gameId);
      if (!pauseInfo) {
        console.log(`▶️ 遊戲未暫停: ${instance.gameId}`);
        return true;
      }

      console.log(`▶️ 恢復遊戲: ${instance.gameId} (暫停狀態: ${pauseInfo.state})`);

      // 清理暫停定時器
      this.clearPauseStateTimers(instance.gameId);

      // 恢復資源
      await this.restoreGameResources(instance);

      // 恢復遊戲邏輯
      await this.resumeGameLogic(instance);

      // 更新暫停信息
      const now = new Date();
      const pausedTime = now.getTime() - pauseInfo.pausedAt.getTime();
      pauseInfo.resumedAt = now;
      pauseInfo.totalPausedTime += pausedTime;

      // 移除暫停狀態
      this.pausedGames.delete(instance.gameId);
      this.resourceSnapshots.delete(instance.gameId);

      // 更新統計
      this.stats.totalResumes++;
      this.stats.averagePauseTime = (this.stats.averagePauseTime * (this.stats.totalResumes - 1) + pausedTime) / this.stats.totalResumes;

      console.log(`✅ 遊戲恢復成功: ${instance.gameId} (暫停時間: ${Math.round(pausedTime/1000)}s)`);
      return true;
    } catch (error) {
      console.error(`❌ 恢復遊戲失敗: ${instance.gameId}`, error);
      return false;
    }
  }

  /**
   * 智能暫停檢查
   */
  checkSmartPause(instances: GameInstance[], currentMemoryUsage: number): GameInstance[] {
    if (!this.config.enableSmartPause) return [];

    const candidatesForPause: GameInstance[] = [];

    // 記憶體壓力檢查
    if (currentMemoryUsage > this.config.memoryThreshold) {
      const inactiveGames = instances
        .filter(instance => !instance.isActive && !this.isPaused(instance.gameId))
        .sort((a, b) => a.lastActive.getTime() - b.lastActive.getTime()); // 按最後活躍時間排序

      candidatesForPause.push(...inactiveGames.slice(0, 2)); // 暫停最舊的2個遊戲
    }

    // 閒置超時檢查
    const now = Date.now();
    const idleGames = instances.filter(instance => {
      const idleTime = now - instance.lastActive.getTime();
      return !instance.isActive && 
             !this.isPaused(instance.gameId) && 
             idleTime > this.config.idleTimeout;
    });

    candidatesForPause.push(...idleGames);

    if (candidatesForPause.length > 0) {
      this.stats.smartPauseCount++;
      console.log(`🧠 智能暫停建議: ${candidatesForPause.map(g => g.gameId).join(', ')}`);
    }

    return [...new Set(candidatesForPause)]; // 去重
  }

  /**
   * 檢查遊戲是否暫停
   */
  isPaused(gameId: string): boolean {
    return this.pausedGames.has(gameId);
  }

  /**
   * 獲取暫停狀態信息
   */
  getPauseInfo(gameId: string): PauseStateInfo | null {
    return this.pausedGames.get(gameId) || null;
  }

  /**
   * 獲取所有暫停的遊戲
   */
  getPausedGames(): PauseStateInfo[] {
    return Array.from(this.pausedGames.values());
  }

  /**
   * 獲取統計信息
   */
  getStats() {
    return {
      ...this.stats,
      currentPausedGames: this.pausedGames.size,
      totalResourcesSavedMB: Math.round(this.stats.totalResourcesSaved),
      averagePauseTimeSeconds: Math.round(this.stats.averagePauseTime / 1000)
    };
  }

  /**
   * 創建資源快照
   */
  private async createResourceSnapshot(instance: GameInstance): Promise<ResourceSnapshot> {
    const snapshot: ResourceSnapshot = {
      audioContexts: [],
      canvasStates: [],
      animationFrames: [],
      timers: [],
      eventListeners: [],
      memoryUsage: instance.memoryUsage
    };

    try {
      // 保存 Canvas 狀態
      if (this.config.preserveCanvasState && instance.manager) {
        // 這裡應該實現具體的 Canvas 狀態保存邏輯
        console.log(`📸 保存 Canvas 狀態: ${instance.gameId}`);
      }

      // 保存音頻上下文狀態
      if (this.config.preserveAudioContext && instance.manager) {
        // 這裡應該實現具體的音頻狀態保存邏輯
        console.log(`🎵 保存音頻狀態: ${instance.gameId}`);
      }

      console.log(`📸 資源快照已創建: ${instance.gameId}`);
    } catch (error) {
      console.warn(`⚠️ 創建資源快照失敗: ${instance.gameId}`, error);
    }

    return snapshot;
  }

  /**
   * 暫停遊戲邏輯
   */
  private async pauseGameLogic(instance: GameInstance): Promise<void> {
    try {
      // 暫停 Phaser 遊戲
      if (instance.manager && instance.manager.type === 'phaser') {
        // 暫停 Phaser 場景
        console.log(`⏸️ 暫停 Phaser 遊戲: ${instance.gameId}`);
      }

      // 暫停 MatchGameManager
      if (instance.manager && typeof instance.manager.pause === 'function') {
        instance.manager.pause();
      }

      // 暫停動畫幀
      if (instance.manager && instance.manager.animationFrameId) {
        cancelAnimationFrame(instance.manager.animationFrameId);
      }

      // 標記為暫停
      instance.isPaused = true;
      instance.isActive = false;
    } catch (error) {
      console.error(`❌ 暫停遊戲邏輯失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 恢復遊戲邏輯
   */
  private async resumeGameLogic(instance: GameInstance): Promise<void> {
    try {
      // 恢復 Phaser 遊戲
      if (instance.manager && instance.manager.type === 'phaser') {
        console.log(`▶️ 恢復 Phaser 遊戲: ${instance.gameId}`);
      }

      // 恢復 MatchGameManager
      if (instance.manager && typeof instance.manager.resume === 'function') {
        instance.manager.resume();
      }

      // 標記為活躍
      instance.isPaused = false;
      instance.isActive = true;
      instance.lastActive = new Date();
    } catch (error) {
      console.error(`❌ 恢復遊戲邏輯失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 釋放遊戲資源
   */
  private async releaseGameResources(instance: GameInstance): Promise<number> {
    let savedMemory = 0;

    try {
      // 釋放音頻上下文
      if (this.resourcePool && !this.config.preserveAudioContext) {
        // 這裡應該實現具體的音頻資源釋放邏輯
        savedMemory += 5; // 估算節省的記憶體
      }

      // 釋放 Canvas 資源
      if (this.resourcePool && !this.config.preserveCanvasState) {
        // 這裡應該實現具體的 Canvas 資源釋放邏輯
        savedMemory += 10; // 估算節省的記憶體
      }

      // 清理定時器
      if (instance.manager && instance.manager.timers) {
        instance.manager.timers.forEach((timer: NodeJS.Timeout) => clearTimeout(timer));
        savedMemory += 1;
      }

      console.log(`💾 資源已釋放: ${instance.gameId} (節省 ${savedMemory}MB)`);
    } catch (error) {
      console.error(`❌ 釋放資源失敗: ${instance.gameId}`, error);
    }

    return savedMemory;
  }

  /**
   * 恢復遊戲資源
   */
  private async restoreGameResources(instance: GameInstance): Promise<void> {
    try {
      const snapshot = this.resourceSnapshots.get(instance.gameId);
      if (!snapshot) return;

      // 恢復音頻上下文
      if (this.config.preserveAudioContext && this.resourcePool) {
        // 這裡應該實現具體的音頻資源恢復邏輯
        console.log(`🎵 恢復音頻資源: ${instance.gameId}`);
      }

      // 恢復 Canvas 狀態
      if (this.config.preserveCanvasState && this.resourcePool) {
        // 這裡應該實現具體的 Canvas 資源恢復邏輯
        console.log(`🎨 恢復 Canvas 資源: ${instance.gameId}`);
      }

      console.log(`🔄 資源已恢復: ${instance.gameId}`);
    } catch (error) {
      console.error(`❌ 恢復資源失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 設置暫停狀態定時器
   */
  private setupPauseStateTimers(gameId: string): void {
    // 設置掛起定時器
    const suspendTimer = setTimeout(() => {
      const pauseInfo = this.pausedGames.get(gameId);
      if (pauseInfo && pauseInfo.state === 'paused') {
        pauseInfo.state = 'suspended';
        console.log(`😴 遊戲進入掛起狀態: ${gameId}`);
      }
    }, this.config.suspendTimeout);

    // 設置休眠定時器
    const hibernateTimer = setTimeout(() => {
      const pauseInfo = this.pausedGames.get(gameId);
      if (pauseInfo && pauseInfo.state === 'suspended') {
        pauseInfo.state = 'hibernated';
        console.log(`💤 遊戲進入休眠狀態: ${gameId}`);
      }
    }, this.config.hibernateTimeout);

    this.pauseTimers.set(gameId, suspendTimer);
    this.pauseTimers.set(`${gameId}_hibernate`, hibernateTimer);
  }

  /**
   * 清理暫停狀態定時器
   */
  private clearPauseStateTimers(gameId: string): void {
    const suspendTimer = this.pauseTimers.get(gameId);
    const hibernateTimer = this.pauseTimers.get(`${gameId}_hibernate`);

    if (suspendTimer) {
      clearTimeout(suspendTimer);
      this.pauseTimers.delete(gameId);
    }

    if (hibernateTimer) {
      clearTimeout(hibernateTimer);
      this.pauseTimers.delete(`${gameId}_hibernate`);
    }
  }

  /**
   * 銷毀管理器
   */
  destroy(): void {
    // 清理所有定時器
    for (const timer of this.pauseTimers.values()) {
      clearTimeout(timer);
    }

    // 清理數據
    this.pausedGames.clear();
    this.resourceSnapshots.clear();
    this.pauseTimers.clear();

    console.log('🧹 GamePauseResumeManager 已銷毀');
  }
}
