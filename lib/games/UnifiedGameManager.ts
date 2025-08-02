/**
 * UnifiedGameManager - 統一遊戲管理器
 * 基於現有 MatchGameManager 擴展，管理所有 25 種遊戲的生命週期
 * 解決多遊戲干擾問題，提供統一的資源管理和性能優化
 */

import { MatchGameManager } from './MatchGameManager';
import { PerformanceMonitor } from '../utils/performanceMonitor';
import { AutoSaveManager } from '../content/AutoSaveManager';
import { GameResourcePool } from './GameResourcePool';
import { GamePerformanceMonitor } from './GamePerformanceMonitor';
import { GamePauseResumeManager } from './GamePauseResumeManager';

// 遊戲類型定義
export type GameType = 'lightweight' | 'medium' | 'heavyweight';
export type GameLoadStrategy = 'direct' | 'lazy' | 'cdn' | 'iframe';

// 遊戲配置接口
export interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  type: GameType;
  loadStrategy: GameLoadStrategy;
  memoryLimit: number; // MB
  estimatedLoadTime: number; // ms
  requiresPhaser: boolean;
  requiresAudio: boolean;
  componentPath?: string;
  cdnUrl?: string;
  iframeUrl?: string;
}

// 遊戲實例接口
export interface GameInstance {
  id: string;
  gameId: string;
  manager: any; // 可以是 MatchGameManager 或其他遊戲管理器
  loadTime: number;
  memoryUsage: number;
  lastActive: Date;
  isActive: boolean;
  isPaused: boolean;
}

// 統一遊戲管理器選項
export interface UnifiedGameManagerOptions {
  maxActiveGames?: number; // 最大同時活躍遊戲數
  memoryLimit?: number; // 總記憶體限制 (MB)
  enablePerformanceMonitoring?: boolean;
  enableAutoSave?: boolean;
  cleanupInterval?: number; // 清理間隔 (ms)
}

export class UnifiedGameManager {
  private activeGames = new Map<string, GameInstance>();
  private gameConfigs = new Map<string, GameConfig>();
  private performanceMonitor?: PerformanceMonitor;
  private autoSaveManager?: AutoSaveManager;
  private resourcePool?: GameResourcePool;
  private gamePerformanceMonitor?: GamePerformanceMonitor;
  private pauseResumeManager?: GamePauseResumeManager;
  private cleanupTimer?: NodeJS.Timeout;
  private memoryOptimizationTimer?: NodeJS.Timeout;
  
  // 配置選項
  private readonly maxActiveGames: number;
  private readonly memoryLimit: number;
  private readonly enablePerformanceMonitoring: boolean;
  private readonly enableAutoSave: boolean;
  private readonly cleanupInterval: number;

  constructor(options: UnifiedGameManagerOptions = {}) {
    this.maxActiveGames = options.maxActiveGames || 3;
    this.memoryLimit = options.memoryLimit || 500; // 500MB
    this.enablePerformanceMonitoring = options.enablePerformanceMonitoring ?? true;
    this.enableAutoSave = options.enableAutoSave ?? true;
    this.cleanupInterval = options.cleanupInterval || 30000; // 30秒

    this.initializeManager();
  }

  /**
   * 初始化管理器
   */
  private initializeManager(): void {
    // 初始化基礎性能監控
    if (this.enablePerformanceMonitoring) {
      this.performanceMonitor = new PerformanceMonitor();
    }

    // 初始化自動保存
    if (this.enableAutoSave) {
      this.autoSaveManager = new AutoSaveManager();
    }

    // 初始化資源池
    this.resourcePool = new GameResourcePool({
      maxAudioContexts: 4,
      maxCanvasElements: 8,
      maxWebGLContexts: 2,
      maxWorkers: 4,
      memoryLimit: this.memoryLimit * 0.4, // 40% 記憶體用於資源池
      cleanupInterval: 30000
    });

    // 初始化遊戲性能監控
    this.gamePerformanceMonitor = new GamePerformanceMonitor({
      memoryThreshold: this.memoryLimit * 0.8, // 80% 記憶體閾值
      loadTimeThreshold: 2000,
      switchTimeThreshold: 500,
      fpsThreshold: 30,
      errorThreshold: 5,
      alertCallback: this.handlePerformanceAlert.bind(this)
    });

    // 初始化暫停/恢復管理器
    this.pauseResumeManager = new GamePauseResumeManager({
      idleTimeout: 300000, // 5分鐘
      memoryThreshold: this.memoryLimit * 0.7, // 70% 記憶體壓力閾值
      enableSmartPause: true,
      preserveAudioContext: false,
      preserveCanvasState: true
    }, this.resourcePool);

    // 設置定期清理
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);

    // 設置記憶體優化定時器
    this.memoryOptimizationTimer = setInterval(() => {
      this.performMemoryOptimization();
    }, 60000); // 每分鐘檢查一次

    // 載入遊戲配置
    this.loadGameConfigs();

    console.log('🎮 UnifiedGameManager 初始化完成');
    console.log(`📊 配置: 最大活躍遊戲=${this.maxActiveGames}, 記憶體限制=${this.memoryLimit}MB`);
    console.log(`🔧 組件: 資源池✅ 性能監控✅ 暫停管理✅ 自動保存✅`);
  }

  /**
   * 載入遊戲配置
   */
  private loadGameConfigs(): void {
    // 輕量級遊戲配置
    const lightweightGames: GameConfig[] = [
      {
        id: 'quiz',
        name: 'quiz',
        displayName: '問答遊戲',
        type: 'lightweight',
        loadStrategy: 'lazy',
        memoryLimit: 20,
        estimatedLoadTime: 500,
        requiresPhaser: false,
        requiresAudio: false,
        componentPath: './QuizGame'
      },
      {
        id: 'flashcard',
        name: 'flashcard',
        displayName: '閃卡遊戲',
        type: 'lightweight',
        loadStrategy: 'lazy',
        memoryLimit: 15,
        estimatedLoadTime: 400,
        requiresPhaser: false,
        requiresAudio: false,
        componentPath: './FlashcardGame'
      },
      {
        id: 'true-false',
        name: 'true-false',
        displayName: '是非題',
        type: 'lightweight',
        loadStrategy: 'lazy',
        memoryLimit: 10,
        estimatedLoadTime: 300,
        requiresPhaser: false,
        requiresAudio: false,
        componentPath: './TrueFalseGame'
      },
      {
        id: 'match',
        name: 'match',
        displayName: '配對遊戲',
        type: 'lightweight',
        loadStrategy: 'direct',
        memoryLimit: 25,
        estimatedLoadTime: 600,
        requiresPhaser: false,
        requiresAudio: true,
        componentPath: './MatchGame'
      }
    ];

    // 中等遊戲配置
    const mediumGames: GameConfig[] = [
      {
        id: 'crossword',
        name: 'crossword',
        displayName: '填字遊戲',
        type: 'medium',
        loadStrategy: 'lazy',
        memoryLimit: 40,
        estimatedLoadTime: 800,
        requiresPhaser: false,
        requiresAudio: true,
        componentPath: './CrosswordGame'
      },
      {
        id: 'wordsearch',
        name: 'wordsearch',
        displayName: '找字遊戲',
        type: 'medium',
        loadStrategy: 'lazy',
        memoryLimit: 35,
        estimatedLoadTime: 700,
        requiresPhaser: false,
        requiresAudio: true,
        componentPath: './WordsearchGame'
      },
      {
        id: 'hangman',
        name: 'hangman',
        displayName: '猜字遊戲',
        type: 'medium',
        loadStrategy: 'lazy',
        memoryLimit: 30,
        estimatedLoadTime: 650,
        requiresPhaser: false,
        requiresAudio: true,
        componentPath: './HangmanGame'
      }
    ];

    // 重型遊戲配置
    const heavyweightGames: GameConfig[] = [
      {
        id: 'airplane',
        name: 'airplane',
        displayName: '飛機碰撞遊戲',
        type: 'heavyweight',
        loadStrategy: 'cdn',
        memoryLimit: 80,
        estimatedLoadTime: 1200,
        requiresPhaser: true,
        requiresAudio: true,
        cdnUrl: 'https://games.educreat.vercel.app/airplane-game'
      },
      {
        id: 'maze-chase',
        name: 'maze-chase',
        displayName: '迷宮追逐',
        type: 'heavyweight',
        loadStrategy: 'cdn',
        memoryLimit: 70,
        estimatedLoadTime: 1000,
        requiresPhaser: true,
        requiresAudio: true,
        cdnUrl: 'https://games.educreat.vercel.app/maze-game'
      },
      {
        id: 'flying-fruit',
        name: 'flying-fruit',
        displayName: '飛行水果',
        type: 'heavyweight',
        loadStrategy: 'cdn',
        memoryLimit: 60,
        estimatedLoadTime: 900,
        requiresPhaser: true,
        requiresAudio: true,
        cdnUrl: 'https://games.educreat.vercel.app/fruit-game'
      }
    ];

    // 註冊所有遊戲配置
    [...lightweightGames, ...mediumGames, ...heavyweightGames].forEach(config => {
      this.gameConfigs.set(config.id, config);
    });

    console.log(`📋 載入 ${this.gameConfigs.size} 個遊戲配置`);
  }

  /**
   * 切換遊戲
   */
  async switchGame(gameId: string, fromGameId?: string): Promise<GameInstance | null> {
    const switchStartTime = performance.now();
    console.log(`🔄 切換到遊戲: ${gameId}`);

    const config = this.gameConfigs.get(gameId);
    if (!config) {
      console.error(`❌ 找不到遊戲配置: ${gameId}`);
      if (this.gamePerformanceMonitor) {
        this.gamePerformanceMonitor.recordGameError(gameId, `找不到遊戲配置: ${gameId}`);
      }
      return null;
    }

    try {
      // 檢查是否已經載入
      const existingInstance = this.activeGames.get(gameId);
      if (existingInstance) {
        console.log(`♻️ 重用現有遊戲實例: ${gameId}`);

        // 如果遊戲被暫停，恢復它
        if (this.pauseResumeManager && this.pauseResumeManager.isPaused(gameId)) {
          await this.pauseResumeManager.resumeGame(existingInstance);
        }

        existingInstance.lastActive = new Date();
        existingInstance.isActive = true;

        // 記錄切換性能
        const switchTime = performance.now() - switchStartTime;
        if (this.gamePerformanceMonitor && fromGameId) {
          this.gamePerformanceMonitor.recordGameSwitch(fromGameId, gameId, switchTime);
        }

        return existingInstance;
      }

      // 檢查資源限制
      await this.ensureResourceAvailability(config);

      // 載入新遊戲
      const instance = await this.loadGame(config);
      if (instance) {
        this.activeGames.set(gameId, instance);

        // 記錄載入性能
        if (this.gamePerformanceMonitor) {
          this.gamePerformanceMonitor.recordGameLoad(gameId, instance.loadTime, instance.memoryUsage);
        }

        // 記錄切換性能
        const switchTime = performance.now() - switchStartTime;
        if (this.gamePerformanceMonitor && fromGameId) {
          this.gamePerformanceMonitor.recordGameSwitch(fromGameId, gameId, switchTime);
        }

        console.log(`✅ 遊戲載入成功: ${gameId} (${Math.round(instance.loadTime)}ms, ${instance.memoryUsage}MB)`);
      }

      return instance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      console.error(`❌ 切換遊戲失敗: ${gameId}`, error);

      if (this.gamePerformanceMonitor) {
        this.gamePerformanceMonitor.recordGameError(gameId, errorMessage);
      }

      return null;
    }
  }

  /**
   * 確保資源可用性
   */
  private async ensureResourceAvailability(config: GameConfig): Promise<void> {
    // 檢查活躍遊戲數量限制
    if (this.activeGames.size >= this.maxActiveGames) {
      await this.cleanupOldestGame();
    }

    // 檢查記憶體使用限制
    const currentMemoryUsage = this.getCurrentMemoryUsage();
    if (currentMemoryUsage + config.memoryLimit > this.memoryLimit) {
      await this.cleanupMemoryIntensiveGames(config.memoryLimit);
    }
  }

  /**
   * 載入遊戲
   */
  private async loadGame(config: GameConfig): Promise<GameInstance | null> {
    const startTime = performance.now();

    try {
      // 嘗試載入保存的遊戲狀態
      const savedState = await this.loadGameState(config.id);

      let manager: any = null;

      switch (config.loadStrategy) {
        case 'direct':
          manager = await this.loadDirectGame(config, savedState);
          break;
        case 'lazy':
          manager = await this.loadLazyGame(config, savedState);
          break;
        case 'cdn':
          manager = await this.loadCDNGame(config, savedState);
          break;
        case 'iframe':
          manager = await this.loadIframeGame(config, savedState);
          break;
        default:
          throw new Error(`不支援的載入策略: ${config.loadStrategy}`);
      }

      const loadTime = performance.now() - startTime;

      const instance: GameInstance = {
        id: `${config.id}-${Date.now()}`,
        gameId: config.id,
        manager,
        loadTime,
        memoryUsage: config.memoryLimit,
        lastActive: new Date(),
        isActive: true,
        isPaused: false
      };

      // 如果有保存的狀態，恢復遊戲狀態
      if (savedState && savedState.gameSpecificState) {
        await this.restoreGameState(instance, savedState.gameSpecificState);
      }

      // 記錄性能指標
      if (this.performanceMonitor) {
        this.performanceMonitor.recordMetric('game_load_time', loadTime);
        this.performanceMonitor.recordMetric('memory_usage', this.getCurrentMemoryUsage());
      }

      // 設置自動保存
      this.setupAutoSave(instance);

      return instance;
    } catch (error) {
      console.error(`❌ 載入遊戲失敗: ${config.id}`, error);
      return null;
    }
  }

  /**
   * 直接載入遊戲
   */
  private async loadDirectGame(config: GameConfig, savedState?: any): Promise<any> {
    // 對於 match 遊戲，使用現有的 MatchGameManager
    if (config.id === 'match') {
      const manager = new MatchGameManager();

      // 如果有保存的狀態，嘗試恢復
      if (savedState && savedState.gameSpecificState) {
        console.log(`🔄 恢復 Match 遊戲狀態`);
        // MatchGameManager 的狀態恢復邏輯
      }

      return manager;
    }

    // 其他直接載入的遊戲
    console.log(`📦 直接載入遊戲: ${config.displayName}`);
    return { type: 'direct', config, savedState };
  }

  /**
   * 懶載入遊戲
   */
  private async loadLazyGame(config: GameConfig, savedState?: any): Promise<any> {
    console.log(`⏳ 懶載入遊戲: ${config.displayName}`);

    // 模擬懶載入過程
    await new Promise(resolve => setTimeout(resolve, config.estimatedLoadTime / 2));

    return { type: 'lazy', config, savedState };
  }

  /**
   * CDN 載入遊戲
   */
  private async loadCDNGame(config: GameConfig, savedState?: any): Promise<any> {
    console.log(`🌐 CDN 載入遊戲: ${config.displayName}`);

    // 模擬 CDN 載入過程
    await new Promise(resolve => setTimeout(resolve, config.estimatedLoadTime));

    return { type: 'cdn', config, url: config.cdnUrl, savedState };
  }

  /**
   * Iframe 載入遊戲 (Vite + Phaser3)
   */
  private async loadIframeGame(config: GameConfig, savedState?: any): Promise<any> {
    console.log(`🖼️ Iframe 載入遊戲: ${config.displayName}`);

    if (!config.iframeUrl) {
      throw new Error(`Iframe 遊戲缺少 iframeUrl: ${config.id}`);
    }

    // 檢查 Vite 開發服務器是否可用
    try {
      const response = await fetch(config.iframeUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Vite 服務器不可用: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ 無法連接到 Vite 服務器: ${config.iframeUrl}`, error);
      // 繼續載入，讓 iframe 自己處理錯誤
    }

    return {
      type: 'iframe',
      config,
      iframeUrl: config.iframeUrl,
      savedState,
      isVitePhaser: true
    };
  }

  /**
   * 恢復遊戲狀態
   */
  private async restoreGameState(instance: GameInstance, gameState: any): Promise<void> {
    try {
      // 對於 MatchGameManager，使用其狀態恢復方法
      if (instance.manager && typeof instance.manager.restoreGameState === 'function') {
        instance.manager.restoreGameState(gameState);
        console.log(`🔄 遊戲狀態已恢復: ${instance.gameId}`);
        return;
      }

      // 對於其他遊戲管理器，設置基本狀態
      if (instance.manager && gameState) {
        instance.manager.gameState = gameState;
        console.log(`🔄 基本遊戲狀態已恢復: ${instance.gameId}`);
      }
    } catch (error) {
      console.warn(`⚠️ 恢復遊戲狀態失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 設置自動保存
   */
  private setupAutoSave(instance: GameInstance): void {
    if (!this.autoSaveManager) return;

    try {
      // 設置定期自動保存
      const autoSaveInterval = setInterval(async () => {
        if (instance.isActive && this.activeGames.has(instance.gameId)) {
          await this.saveGameState(instance);
        } else {
          // 如果遊戲不再活躍，清理定時器
          clearInterval(autoSaveInterval);
        }
      }, 30000); // 每30秒自動保存一次

      console.log(`⏰ 自動保存已設置: ${instance.gameId}`);
    } catch (error) {
      console.warn(`⚠️ 設置自動保存失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 獲取當前記憶體使用量
   */
  private getCurrentMemoryUsage(): number {
    return Array.from(this.activeGames.values())
      .reduce((total, instance) => total + instance.memoryUsage, 0);
  }

  /**
   * 清理最舊的遊戲
   */
  private async cleanupOldestGame(): Promise<void> {
    const instances = Array.from(this.activeGames.values())
      .sort((a, b) => a.lastActive.getTime() - b.lastActive.getTime());
    
    if (instances.length > 0) {
      const oldest = instances[0];
      await this.destroyGameInstance(oldest);
      console.log(`🧹 清理最舊遊戲: ${oldest.gameId}`);
    }
  }

  /**
   * 清理記憶體密集型遊戲
   */
  private async cleanupMemoryIntensiveGames(requiredMemory: number): Promise<void> {
    const instances = Array.from(this.activeGames.values())
      .sort((a, b) => b.memoryUsage - a.memoryUsage);
    
    let freedMemory = 0;
    for (const instance of instances) {
      if (freedMemory >= requiredMemory) break;
      
      await this.destroyGameInstance(instance);
      freedMemory += instance.memoryUsage;
      console.log(`🧹 清理記憶體密集遊戲: ${instance.gameId} (釋放 ${instance.memoryUsage}MB)`);
    }
  }

  /**
   * 銷毀遊戲實例
   */
  private async destroyGameInstance(instance: GameInstance): Promise<void> {
    try {
      // 使用 AutoSaveManager 保存遊戲狀態
      if (this.autoSaveManager && instance.isActive) {
        await this.saveGameState(instance);
      }

      // 銷毀遊戲管理器
      if (instance.manager && typeof instance.manager.destroy === 'function') {
        instance.manager.destroy();
      }

      // 從活躍遊戲中移除
      this.activeGames.delete(instance.gameId);

      console.log(`🗑️ 遊戲實例已銷毀: ${instance.gameId}`);
    } catch (error) {
      console.error(`❌ 銷毀遊戲實例失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 保存遊戲狀態
   */
  private async saveGameState(instance: GameInstance): Promise<void> {
    if (!this.autoSaveManager) return;

    try {
      // 構建遊戲狀態數據
      const gameStateData = {
        gameId: instance.gameId,
        instanceId: instance.id,
        lastActive: instance.lastActive,
        memoryUsage: instance.memoryUsage,
        loadTime: instance.loadTime,
        isActive: instance.isActive,
        isPaused: instance.isPaused,
        // 從遊戲管理器獲取具體的遊戲狀態
        gameSpecificState: this.extractGameSpecificState(instance)
      };

      // 使用 AutoSaveManager 保存狀態
      await this.autoSaveManager.saveContent({
        activityId: instance.gameId,
        title: `遊戲狀態 - ${instance.gameId}`,
        content: gameStateData,
        lastModified: new Date(),
        autoSave: true
      });

      console.log(`💾 遊戲狀態已保存: ${instance.gameId}`);
    } catch (error) {
      console.error(`❌ 保存遊戲狀態失敗: ${instance.gameId}`, error);
    }
  }

  /**
   * 提取遊戲特定狀態
   */
  private extractGameSpecificState(instance: GameInstance): any {
    try {
      // 對於 MatchGameManager，提取遊戲狀態
      if (instance.manager && typeof instance.manager.getGameState === 'function') {
        return instance.manager.getGameState();
      }

      // 對於其他類型的遊戲管理器，提取基本狀態
      if (instance.manager && instance.manager.gameState) {
        return instance.manager.gameState;
      }

      return null;
    } catch (error) {
      console.warn(`⚠️ 無法提取遊戲狀態: ${instance.gameId}`, error);
      return null;
    }
  }

  /**
   * 載入遊戲狀態
   */
  private async loadGameState(gameId: string): Promise<any> {
    if (!this.autoSaveManager) return null;

    try {
      // 從 AutoSaveManager 載入狀態
      const savedState = await this.autoSaveManager.loadContent(gameId);

      if (savedState && savedState.content) {
        console.log(`📂 載入遊戲狀態: ${gameId}`);
        return savedState.content;
      }
    } catch (error) {
      console.warn(`⚠️ 載入遊戲狀態失敗: ${gameId}`, error);
    }

    return null;
  }

  /**
   * 執行定期清理
   */
  private performCleanup(): void {
    const currentTime = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5分鐘

    for (const [gameId, instance] of this.activeGames.entries()) {
      const inactiveTime = currentTime.getTime() - instance.lastActive.getTime();
      
      if (inactiveTime > inactiveThreshold && !instance.isActive) {
        this.destroyGameInstance(instance);
        console.log(`🧹 清理非活躍遊戲: ${gameId} (非活躍時間: ${Math.round(inactiveTime / 1000)}秒)`);
      }
    }
  }

  /**
   * 暫停遊戲
   */
  pauseGame(gameId: string): boolean {
    const instance = this.activeGames.get(gameId);
    if (instance) {
      instance.isPaused = true;
      instance.isActive = false;
      console.log(`⏸️ 遊戲已暫停: ${gameId}`);
      return true;
    }
    return false;
  }

  /**
   * 恢復遊戲
   */
  resumeGame(gameId: string): boolean {
    const instance = this.activeGames.get(gameId);
    if (instance) {
      instance.isPaused = false;
      instance.isActive = true;
      instance.lastActive = new Date();
      console.log(`▶️ 遊戲已恢復: ${gameId}`);
      return true;
    }
    return false;
  }

  /**
   * 獲取遊戲狀態
   */
  getGameStatus(): {
    activeGames: number;
    totalMemoryUsage: number;
    gameInstances: Array<{
      gameId: string;
      isActive: boolean;
      isPaused: boolean;
      memoryUsage: number;
      loadTime: number;
    }>;
  } {
    const instances = Array.from(this.activeGames.values());
    
    return {
      activeGames: instances.filter(i => i.isActive).length,
      totalMemoryUsage: this.getCurrentMemoryUsage(),
      gameInstances: instances.map(instance => ({
        gameId: instance.gameId,
        isActive: instance.isActive,
        isPaused: instance.isPaused,
        memoryUsage: instance.memoryUsage,
        loadTime: instance.loadTime
      }))
    };
  }

  /**
   * 執行記憶體優化
   */
  private performMemoryOptimization(): void {
    const currentMemoryUsage = this.getCurrentMemoryUsage();
    const instances = Array.from(this.activeGames.values());

    console.log(`🧠 記憶體優化檢查: ${Math.round(currentMemoryUsage)}MB / ${this.memoryLimit}MB`);

    // 如果記憶體使用超過 80%，執行優化
    if (currentMemoryUsage > this.memoryLimit * 0.8) {
      console.log('⚠️ 記憶體使用過高，開始優化...');

      // 使用智能暫停建議
      if (this.pauseResumeManager) {
        const candidatesForPause = this.pauseResumeManager.checkSmartPause(instances, currentMemoryUsage);

        for (const instance of candidatesForPause) {
          this.pauseResumeManager.pauseGame(instance, 'memory_pressure');
        }
      }

      // 如果仍然超過限制，強制清理最舊的遊戲
      if (this.getCurrentMemoryUsage() > this.memoryLimit * 0.9) {
        this.cleanupOldestGame();
      }
    }

    // 記錄性能指標
    if (this.gamePerformanceMonitor) {
      // 這裡可以記錄系統級性能指標
    }
  }

  /**
   * 處理性能警報
   */
  private handlePerformanceAlert(alert: any): void {
    console.warn(`🚨 性能警報: ${alert.message} (${alert.gameId})`);

    // 根據警報類型採取行動
    switch (alert.type) {
      case 'memory':
        if (alert.severity === 'critical') {
          // 立即暫停非活躍遊戲
          const instances = Array.from(this.activeGames.values());
          const inactiveGames = instances.filter(i => !i.isActive);

          for (const instance of inactiveGames) {
            if (this.pauseResumeManager) {
              this.pauseResumeManager.pauseGame(instance, 'memory_pressure');
            }
          }
        }
        break;

      case 'load_time':
        // 記錄載入時間過長的遊戲
        console.warn(`⏰ 遊戲載入時間過長: ${alert.gameId} (${alert.value}ms)`);
        break;

      case 'switch_time':
        // 記錄切換時間過長的遊戲
        console.warn(`🔄 遊戲切換時間過長: ${alert.gameId} (${alert.value}ms)`);
        break;

      case 'error':
        // 處理遊戲錯誤
        if (alert.severity === 'critical') {
          const instance = this.activeGames.get(alert.gameId);
          if (instance) {
            this.destroyGameInstance(instance);
          }
        }
        break;
    }
  }

  /**
   * 獲取系統狀態
   */
  getSystemStatus(): {
    memoryUsage: number;
    memoryLimit: number;
    activeGames: number;
    pausedGames: number;
    resourcePoolStatus: any;
    performanceStats: any;
    alerts: any[];
  } {
    const resourcePoolStatus = this.resourcePool?.getResourceStatus() || null;
    const performanceStats = this.gamePerformanceMonitor?.getPerformanceStats() || null;
    const alerts = this.gamePerformanceMonitor?.getAlerts() || [];
    const pausedGames = this.pauseResumeManager?.getPausedGames() || [];

    return {
      memoryUsage: this.getCurrentMemoryUsage(),
      memoryLimit: this.memoryLimit,
      activeGames: Array.from(this.activeGames.values()).filter(i => i.isActive).length,
      pausedGames: pausedGames.length,
      resourcePoolStatus,
      performanceStats,
      alerts
    };
  }

  /**
   * 銷毀管理器
   */
  destroy(): void {
    // 清理定時器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.memoryOptimizationTimer) {
      clearInterval(this.memoryOptimizationTimer);
    }

    // 銷毀所有遊戲實例
    for (const instance of this.activeGames.values()) {
      this.destroyGameInstance(instance);
    }

    // 銷毀子管理器
    if (this.resourcePool) {
      this.resourcePool.destroy();
    }
    if (this.gamePerformanceMonitor) {
      this.gamePerformanceMonitor.destroy();
    }
    if (this.pauseResumeManager) {
      this.pauseResumeManager.destroy();
    }

    // 清理資源
    this.activeGames.clear();
    this.gameConfigs.clear();

    console.log('🧹 UnifiedGameManager 已銷毀');
  }
}
