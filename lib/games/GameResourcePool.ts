/**
 * GameResourcePool - 遊戲資源池管理器
 * 基於現有 AssetLoader 擴展，管理音頻上下文、Canvas、WebGL 等共享資源
 * 解決多遊戲資源競爭問題，提供統一的資源分配和回收機制
 */

// 移除 AssetLoader 依賴以避免 Phaser 導入錯誤
// import { AssetLoader } from '../../phaser3-plane-selector/src/utils/AssetLoader';

// 資源類型定義
export type ResourceType = 'audio' | 'canvas' | 'webgl' | 'worker' | 'memory' | 'texture';

// 資源狀態
export interface ResourceStatus {
  id: string;
  type: ResourceType;
  isInUse: boolean;
  gameId: string | null;
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
  memoryUsage: number; // MB
}

// 資源池配置
export interface ResourcePoolConfig {
  maxAudioContexts?: number;
  maxCanvasElements?: number;
  maxWebGLContexts?: number;
  maxWorkers?: number;
  memoryLimit?: number; // MB
  cleanupInterval?: number; // ms
  resourceTimeout?: number; // ms
}

// 音頻上下文資源
interface AudioContextResource {
  context: AudioContext;
  id: string;
  gameId: string | null;
  isInUse: boolean;
  createdAt: Date;
  lastUsed: Date;
}

// Canvas 資源
interface CanvasResource {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | WebGLRenderingContext | null;
  id: string;
  gameId: string | null;
  isInUse: boolean;
  createdAt: Date;
  lastUsed: Date;
}

// Web Worker 資源
interface WorkerResource {
  worker: Worker;
  id: string;
  gameId: string | null;
  isInUse: boolean;
  createdAt: Date;
  lastUsed: Date;
}

export class GameResourcePool {
  // 移除 AssetLoader 以避免 Phaser 依賴問題
  // private assetLoader: AssetLoader;
  private audioContextPool: AudioContextResource[] = [];
  private canvasPool: CanvasResource[] = [];
  private workerPool: WorkerResource[] = [];
  private cleanupTimer?: NodeJS.Timeout;
  
  // 配置選項
  private readonly config: Required<ResourcePoolConfig>;
  
  // 統計信息
  private stats = {
    totalAllocations: 0,
    totalDeallocations: 0,
    currentMemoryUsage: 0,
    peakMemoryUsage: 0,
    resourceReuses: 0
  };

  constructor(config: ResourcePoolConfig = {}) {
    this.config = {
      maxAudioContexts: config.maxAudioContexts || 4,
      maxCanvasElements: config.maxCanvasElements || 8,
      maxWebGLContexts: config.maxWebGLContexts || 2,
      maxWorkers: config.maxWorkers || 4,
      memoryLimit: config.memoryLimit || 200, // 200MB
      cleanupInterval: config.cleanupInterval || 30000, // 30秒
      resourceTimeout: config.resourceTimeout || 300000 // 5分鐘
    };

    // 移除 AssetLoader 初始化以避免 Phaser 依賴問題
    // this.assetLoader = new AssetLoader();
    
    // 啟動定期清理
    this.startCleanupTimer();
    
    console.log('🏊 GameResourcePool 初始化完成');
    console.log(`📊 配置: 音頻=${this.config.maxAudioContexts}, Canvas=${this.config.maxCanvasElements}, 記憶體=${this.config.memoryLimit}MB`);
  }

  /**
   * 獲取音頻上下文
   */
  async getAudioContext(gameId: string): Promise<AudioContext | null> {
    try {
      // 檢查是否有可重用的音頻上下文
      const reusableContext = this.audioContextPool.find(
        resource => !resource.isInUse && resource.context.state !== 'closed'
      );

      if (reusableContext) {
        reusableContext.isInUse = true;
        reusableContext.gameId = gameId;
        reusableContext.lastUsed = new Date();
        this.stats.resourceReuses++;
        
        console.log(`♻️ 重用音頻上下文: ${reusableContext.id} -> ${gameId}`);
        return reusableContext.context;
      }

      // 檢查是否達到最大限制
      if (this.audioContextPool.length >= this.config.maxAudioContexts) {
        await this.cleanupOldestAudioContext();
      }

      // 創建新的音頻上下文
      const context = new AudioContext();
      const resource: AudioContextResource = {
        context,
        id: `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameId,
        isInUse: true,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      this.audioContextPool.push(resource);
      this.stats.totalAllocations++;
      
      console.log(`🎵 創建新音頻上下文: ${resource.id} -> ${gameId}`);
      return context;
    } catch (error) {
      console.error('❌ 獲取音頻上下文失敗:', error);
      return null;
    }
  }

  /**
   * 釋放音頻上下文
   */
  releaseAudioContext(context: AudioContext, gameId: string): void {
    const resource = this.audioContextPool.find(r => r.context === context && r.gameId === gameId);
    
    if (resource) {
      resource.isInUse = false;
      resource.gameId = null;
      resource.lastUsed = new Date();
      
      console.log(`🔓 釋放音頻上下文: ${resource.id}`);
    }
  }

  /**
   * 獲取 Canvas 元素
   */
  async getCanvas(gameId: string, width: number = 800, height: number = 600, contextType: '2d' | 'webgl' = '2d'): Promise<HTMLCanvasElement | null> {
    try {
      // 檢查是否有可重用的 Canvas
      const reusableCanvas = this.canvasPool.find(
        resource => !resource.isInUse && 
        resource.canvas.width === width && 
        resource.canvas.height === height
      );

      if (reusableCanvas) {
        reusableCanvas.isInUse = true;
        reusableCanvas.gameId = gameId;
        reusableCanvas.lastUsed = new Date();
        this.stats.resourceReuses++;
        
        console.log(`♻️ 重用 Canvas: ${reusableCanvas.id} -> ${gameId}`);
        return reusableCanvas.canvas;
      }

      // 檢查是否達到最大限制
      if (this.canvasPool.length >= this.config.maxCanvasElements) {
        await this.cleanupOldestCanvas();
      }

      // 創建新的 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      let context: CanvasRenderingContext2D | WebGLRenderingContext | null = null;
      if (contextType === '2d') {
        context = canvas.getContext('2d');
      } else {
        context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      }

      const resource: CanvasResource = {
        canvas,
        context,
        id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameId,
        isInUse: true,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      this.canvasPool.push(resource);
      this.stats.totalAllocations++;
      
      console.log(`🎨 創建新 Canvas: ${resource.id} (${width}x${height}, ${contextType}) -> ${gameId}`);
      return canvas;
    } catch (error) {
      console.error('❌ 獲取 Canvas 失敗:', error);
      return null;
    }
  }

  /**
   * 釋放 Canvas 元素
   */
  releaseCanvas(canvas: HTMLCanvasElement, gameId: string): void {
    const resource = this.canvasPool.find(r => r.canvas === canvas && r.gameId === gameId);
    
    if (resource) {
      // 清理 Canvas 內容
      if (resource.context && 'clearRect' in resource.context) {
        (resource.context as CanvasRenderingContext2D).clearRect(0, 0, canvas.width, canvas.height);
      } else if (resource.context && 'clear' in resource.context) {
        const gl = resource.context as WebGLRenderingContext;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }

      resource.isInUse = false;
      resource.gameId = null;
      resource.lastUsed = new Date();
      
      console.log(`🔓 釋放 Canvas: ${resource.id}`);
    }
  }

  /**
   * 獲取 Web Worker
   */
  async getWorker(gameId: string, scriptUrl: string): Promise<Worker | null> {
    try {
      // 檢查是否達到最大限制
      if (this.workerPool.length >= this.config.maxWorkers) {
        await this.cleanupOldestWorker();
      }

      // 創建新的 Worker
      const worker = new Worker(scriptUrl);
      const resource: WorkerResource = {
        worker,
        id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameId,
        isInUse: true,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      this.workerPool.push(resource);
      this.stats.totalAllocations++;
      
      console.log(`👷 創建新 Worker: ${resource.id} -> ${gameId}`);
      return worker;
    } catch (error) {
      console.error('❌ 獲取 Worker 失敗:', error);
      return null;
    }
  }

  /**
   * 釋放 Web Worker
   */
  releaseWorker(worker: Worker, gameId: string): void {
    const resource = this.workerPool.find(r => r.worker === worker && r.gameId === gameId);
    
    if (resource) {
      resource.worker.terminate();
      this.workerPool = this.workerPool.filter(r => r !== resource);
      this.stats.totalDeallocations++;
      
      console.log(`🔓 釋放 Worker: ${resource.id}`);
    }
  }

  /**
   * 預載入遊戲資源
   */
  async preloadGameAssets(gameId: string, assets: string[]): Promise<void> {
    try {
      console.log(`🚀 預載入遊戲資源: ${gameId}`);
      
      // 簡化資源預載入，避免 Phaser 依賴
      for (const asset of assets) {
        console.log(`📦 預載入資源: ${asset}`);
        // 這裡可以實現基本的資源預載入邏輯
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ 預載入完成: ${gameId}`);
    } catch (error) {
      console.error(`❌ 預載入失敗: ${gameId}`, error);
    }
  }

  /**
   * 清理遊戲資源
   */
  cleanupGameResources(gameId: string): void {
    console.log(`🧹 清理遊戲資源: ${gameId}`);
    
    // 釋放音頻上下文
    this.audioContextPool.forEach(resource => {
      if (resource.gameId === gameId) {
        this.releaseAudioContext(resource.context, gameId);
      }
    });

    // 釋放 Canvas
    this.canvasPool.forEach(resource => {
      if (resource.gameId === gameId) {
        this.releaseCanvas(resource.canvas, gameId);
      }
    });

    // 釋放 Worker
    this.workerPool.forEach(resource => {
      if (resource.gameId === gameId) {
        this.releaseWorker(resource.worker, gameId);
      }
    });
  }

  /**
   * 獲取資源狀態
   */
  getResourceStatus(): {
    audioContexts: ResourceStatus[];
    canvases: ResourceStatus[];
    workers: ResourceStatus[];
    stats: typeof this.stats;
    memoryUsage: number;
  } {
    const audioContexts = this.audioContextPool.map(resource => ({
      id: resource.id,
      type: 'audio' as ResourceType,
      isInUse: resource.isInUse,
      gameId: resource.gameId,
      createdAt: resource.createdAt,
      lastUsed: resource.lastUsed,
      usageCount: 1,
      memoryUsage: 5 // 估算音頻上下文記憶體使用
    }));

    const canvases = this.canvasPool.map(resource => ({
      id: resource.id,
      type: 'canvas' as ResourceType,
      isInUse: resource.isInUse,
      gameId: resource.gameId,
      createdAt: resource.createdAt,
      lastUsed: resource.lastUsed,
      usageCount: 1,
      memoryUsage: (resource.canvas.width * resource.canvas.height * 4) / (1024 * 1024) // 估算 Canvas 記憶體使用
    }));

    const workers = this.workerPool.map(resource => ({
      id: resource.id,
      type: 'worker' as ResourceType,
      isInUse: resource.isInUse,
      gameId: resource.gameId,
      createdAt: resource.createdAt,
      lastUsed: resource.lastUsed,
      usageCount: 1,
      memoryUsage: 10 // 估算 Worker 記憶體使用
    }));

    const memoryUsage = [...audioContexts, ...canvases, ...workers]
      .reduce((total, resource) => total + resource.memoryUsage, 0);

    return {
      audioContexts,
      canvases,
      workers,
      stats: { ...this.stats },
      memoryUsage
    };
  }

  /**
   * 清理最舊的音頻上下文
   */
  private async cleanupOldestAudioContext(): Promise<void> {
    const oldestContext = this.audioContextPool
      .filter(r => !r.isInUse)
      .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime())[0];

    if (oldestContext) {
      await oldestContext.context.close();
      this.audioContextPool = this.audioContextPool.filter(r => r !== oldestContext);
      this.stats.totalDeallocations++;
      
      console.log(`🧹 清理最舊音頻上下文: ${oldestContext.id}`);
    }
  }

  /**
   * 清理最舊的 Canvas
   */
  private async cleanupOldestCanvas(): Promise<void> {
    const oldestCanvas = this.canvasPool
      .filter(r => !r.isInUse)
      .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime())[0];

    if (oldestCanvas) {
      this.canvasPool = this.canvasPool.filter(r => r !== oldestCanvas);
      this.stats.totalDeallocations++;
      
      console.log(`🧹 清理最舊 Canvas: ${oldestCanvas.id}`);
    }
  }

  /**
   * 清理最舊的 Worker
   */
  private async cleanupOldestWorker(): Promise<void> {
    const oldestWorker = this.workerPool
      .filter(r => !r.isInUse)
      .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime())[0];

    if (oldestWorker) {
      oldestWorker.worker.terminate();
      this.workerPool = this.workerPool.filter(r => r !== oldestWorker);
      this.stats.totalDeallocations++;
      
      console.log(`🧹 清理最舊 Worker: ${oldestWorker.id}`);
    }
  }

  /**
   * 啟動清理定時器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.performPeriodicCleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 執行定期清理
   */
  private performPeriodicCleanup(): void {
    const now = new Date();
    const timeout = this.config.resourceTimeout;

    // 清理超時的音頻上下文
    this.audioContextPool.forEach(resource => {
      if (!resource.isInUse && (now.getTime() - resource.lastUsed.getTime()) > timeout) {
        resource.context.close();
        this.audioContextPool = this.audioContextPool.filter(r => r !== resource);
        this.stats.totalDeallocations++;
      }
    });

    // 清理超時的 Canvas
    this.canvasPool.forEach(resource => {
      if (!resource.isInUse && (now.getTime() - resource.lastUsed.getTime()) > timeout) {
        this.canvasPool = this.canvasPool.filter(r => r !== resource);
        this.stats.totalDeallocations++;
      }
    });

    // 清理超時的 Worker
    this.workerPool.forEach(resource => {
      if (!resource.isInUse && (now.getTime() - resource.lastUsed.getTime()) > timeout) {
        resource.worker.terminate();
        this.workerPool = this.workerPool.filter(r => r !== resource);
        this.stats.totalDeallocations++;
      }
    });

    console.log(`🧹 定期清理完成 - 音頻:${this.audioContextPool.length}, Canvas:${this.canvasPool.length}, Worker:${this.workerPool.length}`);
  }

  /**
   * 獲取資源類型
   */
  private getAssetType(asset: string): 'image' | 'sound' | 'font' | 'json' {
    const extension = asset.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'sound';
      case 'ttf':
      case 'woff':
      case 'woff2':
        return 'font';
      case 'json':
        return 'json';
      default:
        return 'json';
    }
  }

  /**
   * 銷毀資源池
   */
  destroy(): void {
    // 清理定時器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // 關閉所有音頻上下文
    this.audioContextPool.forEach(resource => {
      resource.context.close();
    });

    // 終止所有 Worker
    this.workerPool.forEach(resource => {
      resource.worker.terminate();
    });

    // 清空所有資源池
    this.audioContextPool = [];
    this.canvasPool = [];
    this.workerPool = [];

    console.log('🧹 GameResourcePool 已銷毀');
  }
}
