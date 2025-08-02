/**
 * GamePerformanceMonitor - 遊戲性能監控系統
 * 基於現有 PerformanceMonitor 擴展，專門監控遊戲切換性能
 * 實現記憶體使用追蹤、載入時間分析、警報系統
 */

import { PerformanceMonitor } from '../utils/performanceMonitor';

// 性能指標類型
export interface GamePerformanceMetrics {
  gameId: string;
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  fps: number;
  switchTime: number;
  errorCount: number;
  timestamp: Date;
}

// 性能警報類型
export interface PerformanceAlert {
  id: string;
  type: 'memory' | 'load_time' | 'fps' | 'error' | 'switch_time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  gameId: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

// 性能統計
export interface PerformanceStats {
  totalGames: number;
  averageLoadTime: number;
  averageMemoryUsage: number;
  averageSwitchTime: number;
  totalErrors: number;
  peakMemoryUsage: number;
  slowestGame: { gameId: string; loadTime: number } | null;
  fastestGame: { gameId: string; loadTime: number } | null;
}

// 監控配置
export interface GamePerformanceConfig {
  memoryThreshold?: number; // MB
  loadTimeThreshold?: number; // ms
  switchTimeThreshold?: number; // ms
  fpsThreshold?: number;
  errorThreshold?: number;
  alertCallback?: (alert: PerformanceAlert) => void;
  metricsRetentionDays?: number;
}

export class GamePerformanceMonitor {
  private performanceMonitor: PerformanceMonitor;
  private metrics: GamePerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private fpsCounter = 0;
  private lastFpsTime = 0;
  
  // 配置選項
  private readonly config: Required<GamePerformanceConfig>;
  
  // 實時監控數據
  private currentMetrics = {
    memoryUsage: 0,
    cpuUsage: 0,
    fps: 0,
    activeGames: 0
  };

  constructor(config: GamePerformanceConfig = {}) {
    this.config = {
      memoryThreshold: config.memoryThreshold || 400, // 400MB
      loadTimeThreshold: config.loadTimeThreshold || 2000, // 2秒
      switchTimeThreshold: config.switchTimeThreshold || 500, // 500ms
      fpsThreshold: config.fpsThreshold || 30,
      errorThreshold: config.errorThreshold || 5,
      alertCallback: config.alertCallback || this.defaultAlertHandler,
      metricsRetentionDays: config.metricsRetentionDays || 7
    };

    // 初始化基礎性能監控器
    this.performanceMonitor = new PerformanceMonitor();
    
    // 啟動實時監控
    this.startRealTimeMonitoring();
    
    console.log('📊 GamePerformanceMonitor 初始化完成');
    console.log(`⚠️ 警報閾值: 記憶體=${this.config.memoryThreshold}MB, 載入=${this.config.loadTimeThreshold}ms, 切換=${this.config.switchTimeThreshold}ms`);
  }

  /**
   * 記錄遊戲載入性能
   */
  recordGameLoad(gameId: string, loadTime: number, memoryUsage: number): void {
    const metrics: GamePerformanceMetrics = {
      gameId,
      loadTime,
      memoryUsage,
      cpuUsage: this.getCurrentCpuUsage(),
      fps: this.currentMetrics.fps,
      switchTime: 0,
      errorCount: 0,
      timestamp: new Date()
    };

    this.metrics.push(metrics);
    
    // 使用基礎性能監控器記錄
    this.performanceMonitor.recordMetric('game_load_time', loadTime);
    this.performanceMonitor.recordMetric('memory_usage', memoryUsage);
    
    // 檢查是否需要發出警報
    this.checkLoadTimeAlert(gameId, loadTime);
    this.checkMemoryAlert(gameId, memoryUsage);
    
    console.log(`📈 記錄遊戲載入: ${gameId} (${loadTime}ms, ${memoryUsage}MB)`);
  }

  /**
   * 記錄遊戲切換性能
   */
  recordGameSwitch(fromGameId: string, toGameId: string, switchTime: number): void {
    const metrics: GamePerformanceMetrics = {
      gameId: toGameId,
      loadTime: 0,
      memoryUsage: this.currentMetrics.memoryUsage,
      cpuUsage: this.getCurrentCpuUsage(),
      fps: this.currentMetrics.fps,
      switchTime,
      errorCount: 0,
      timestamp: new Date()
    };

    this.metrics.push(metrics);
    
    // 使用基礎性能監控器記錄
    this.performanceMonitor.recordMetric('game_switch_time', switchTime);
    
    // 檢查切換時間警報
    this.checkSwitchTimeAlert(toGameId, switchTime);
    
    console.log(`🔄 記錄遊戲切換: ${fromGameId} → ${toGameId} (${switchTime}ms)`);
  }

  /**
   * 記錄遊戲錯誤
   */
  recordGameError(gameId: string, error: string): void {
    // 更新錯誤計數
    const recentMetrics = this.metrics.filter(m => 
      m.gameId === gameId && 
      (Date.now() - m.timestamp.getTime()) < 300000 // 5分鐘內
    );
    
    const errorCount = recentMetrics.reduce((sum, m) => sum + m.errorCount, 0) + 1;
    
    const metrics: GamePerformanceMetrics = {
      gameId,
      loadTime: 0,
      memoryUsage: this.currentMetrics.memoryUsage,
      cpuUsage: this.getCurrentCpuUsage(),
      fps: this.currentMetrics.fps,
      switchTime: 0,
      errorCount: 1,
      timestamp: new Date()
    };

    this.metrics.push(metrics);
    
    // 檢查錯誤警報
    this.checkErrorAlert(gameId, errorCount);
    
    console.log(`❌ 記錄遊戲錯誤: ${gameId} - ${error}`);
  }

  /**
   * 獲取遊戲性能統計
   */
  getPerformanceStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalGames: 0,
        averageLoadTime: 0,
        averageMemoryUsage: 0,
        averageSwitchTime: 0,
        totalErrors: 0,
        peakMemoryUsage: 0,
        slowestGame: null,
        fastestGame: null
      };
    }

    const gameIds = [...new Set(this.metrics.map(m => m.gameId))];
    const loadTimes = this.metrics.filter(m => m.loadTime > 0);
    const switchTimes = this.metrics.filter(m => m.switchTime > 0);
    const memoryUsages = this.metrics.map(m => m.memoryUsage);
    const totalErrors = this.metrics.reduce((sum, m) => sum + m.errorCount, 0);

    // 找出最慢和最快的遊戲
    const slowestGame = loadTimes.length > 0 ? 
      loadTimes.reduce((prev, curr) => prev.loadTime > curr.loadTime ? prev : curr) : null;
    const fastestGame = loadTimes.length > 0 ? 
      loadTimes.reduce((prev, curr) => prev.loadTime < curr.loadTime ? prev : curr) : null;

    return {
      totalGames: gameIds.length,
      averageLoadTime: loadTimes.length > 0 ? 
        loadTimes.reduce((sum, m) => sum + m.loadTime, 0) / loadTimes.length : 0,
      averageMemoryUsage: memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length,
      averageSwitchTime: switchTimes.length > 0 ? 
        switchTimes.reduce((sum, m) => sum + m.switchTime, 0) / switchTimes.length : 0,
      totalErrors,
      peakMemoryUsage: Math.max(...memoryUsages),
      slowestGame: slowestGame ? { gameId: slowestGame.gameId, loadTime: slowestGame.loadTime } : null,
      fastestGame: fastestGame ? { gameId: fastestGame.gameId, loadTime: fastestGame.loadTime } : null
    };
  }

  /**
   * 獲取特定遊戲的性能指標
   */
  getGameMetrics(gameId: string): GamePerformanceMetrics[] {
    return this.metrics.filter(m => m.gameId === gameId);
  }

  /**
   * 獲取性能警報
   */
  getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity);
    }
    return [...this.alerts];
  }

  /**
   * 清除舊的性能指標
   */
  cleanupOldMetrics(): void {
    const retentionTime = this.config.metricsRetentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    
    const oldMetricsCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);
    
    const oldAlertsCount = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoffTime);
    
    console.log(`🧹 清理舊指標: 指標 ${oldMetricsCount} → ${this.metrics.length}, 警報 ${oldAlertsCount} → ${this.alerts.length}`);
  }

  /**
   * 啟動實時監控
   */
  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateCurrentMetrics();
      this.checkSystemAlerts();
    }, 1000); // 每秒更新一次

    // 啟動 FPS 監控
    this.startFpsMonitoring();
  }

  /**
   * 更新當前指標
   */
  private updateCurrentMetrics(): void {
    // 更新記憶體使用
    if ((performance as any).memory) {
      this.currentMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }

    // 更新 CPU 使用（簡化估算）
    this.currentMetrics.cpuUsage = this.getCurrentCpuUsage();
  }

  /**
   * 啟動 FPS 監控
   */
  private startFpsMonitoring(): void {
    const measureFps = () => {
      this.fpsCounter++;
      const now = performance.now();
      
      if (now - this.lastFpsTime >= 1000) {
        this.currentMetrics.fps = Math.round((this.fpsCounter * 1000) / (now - this.lastFpsTime));
        this.fpsCounter = 0;
        this.lastFpsTime = now;
        
        // 檢查 FPS 警報
        if (this.currentMetrics.fps < this.config.fpsThreshold) {
          this.createAlert('fps', 'medium', `FPS 過低: ${this.currentMetrics.fps}`, 'system', this.currentMetrics.fps, this.config.fpsThreshold);
        }
      }
      
      requestAnimationFrame(measureFps);
    };
    
    requestAnimationFrame(measureFps);
  }

  /**
   * 獲取當前 CPU 使用率（簡化估算）
   */
  private getCurrentCpuUsage(): number {
    // 這是一個簡化的 CPU 使用率估算
    // 實際實現可能需要更複雜的邏輯
    const start = performance.now();
    let iterations = 0;
    
    while (performance.now() - start < 1) {
      iterations++;
    }
    
    // 基於迭代次數估算 CPU 負載
    return Math.min(100, Math.max(0, 100 - (iterations / 1000)));
  }

  /**
   * 檢查載入時間警報
   */
  private checkLoadTimeAlert(gameId: string, loadTime: number): void {
    if (loadTime > this.config.loadTimeThreshold) {
      const severity = loadTime > this.config.loadTimeThreshold * 2 ? 'high' : 'medium';
      this.createAlert('load_time', severity, `載入時間過長: ${loadTime}ms`, gameId, loadTime, this.config.loadTimeThreshold);
    }
  }

  /**
   * 檢查記憶體警報
   */
  private checkMemoryAlert(gameId: string, memoryUsage: number): void {
    if (memoryUsage > this.config.memoryThreshold) {
      const severity = memoryUsage > this.config.memoryThreshold * 1.5 ? 'critical' : 'high';
      this.createAlert('memory', severity, `記憶體使用過高: ${memoryUsage}MB`, gameId, memoryUsage, this.config.memoryThreshold);
    }
  }

  /**
   * 檢查切換時間警報
   */
  private checkSwitchTimeAlert(gameId: string, switchTime: number): void {
    if (switchTime > this.config.switchTimeThreshold) {
      const severity = switchTime > this.config.switchTimeThreshold * 2 ? 'high' : 'medium';
      this.createAlert('switch_time', severity, `切換時間過長: ${switchTime}ms`, gameId, switchTime, this.config.switchTimeThreshold);
    }
  }

  /**
   * 檢查錯誤警報
   */
  private checkErrorAlert(gameId: string, errorCount: number): void {
    if (errorCount > this.config.errorThreshold) {
      const severity = errorCount > this.config.errorThreshold * 2 ? 'critical' : 'high';
      this.createAlert('error', severity, `錯誤次數過多: ${errorCount}`, gameId, errorCount, this.config.errorThreshold);
    }
  }

  /**
   * 檢查系統級警報
   */
  private checkSystemAlerts(): void {
    // 檢查總記憶體使用
    if (this.currentMetrics.memoryUsage > this.config.memoryThreshold * 0.8) {
      this.createAlert('memory', 'medium', `系統記憶體使用接近限制: ${this.currentMetrics.memoryUsage}MB`, 'system', this.currentMetrics.memoryUsage, this.config.memoryThreshold);
    }
  }

  /**
   * 創建警報
   */
  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    gameId: string,
    value: number,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      gameId,
      value,
      threshold,
      timestamp: new Date()
    };

    this.alerts.push(alert);
    
    // 調用警報回調
    this.config.alertCallback(alert);
    
    console.warn(`⚠️ 性能警報 [${severity.toUpperCase()}]: ${message}`);
  }

  /**
   * 預設警報處理器
   */
  private defaultAlertHandler = (alert: PerformanceAlert): void => {
    const emoji = {
      low: '💛',
      medium: '🧡',
      high: '❤️',
      critical: '🚨'
    }[alert.severity];
    
    console.warn(`${emoji} 性能警報: ${alert.message} (${alert.gameId})`);
  };

  /**
   * 生成性能報告
   */
  generatePerformanceReport(): string {
    const stats = this.getPerformanceStats();
    const recentAlerts = this.alerts.filter(a => 
      (Date.now() - a.timestamp.getTime()) < 24 * 60 * 60 * 1000 // 24小時內
    );

    return `
📊 EduCreate 遊戲性能報告
=======================

📈 總體統計:
- 監控遊戲數量: ${stats.totalGames}
- 平均載入時間: ${Math.round(stats.averageLoadTime)}ms
- 平均記憶體使用: ${Math.round(stats.averageMemoryUsage)}MB
- 平均切換時間: ${Math.round(stats.averageSwitchTime)}ms
- 總錯誤次數: ${stats.totalErrors}
- 峰值記憶體: ${Math.round(stats.peakMemoryUsage)}MB

🏆 性能排行:
- 最快載入: ${stats.fastestGame ? `${stats.fastestGame.gameId} (${stats.fastestGame.loadTime}ms)` : 'N/A'}
- 最慢載入: ${stats.slowestGame ? `${stats.slowestGame.gameId} (${stats.slowestGame.loadTime}ms)` : 'N/A'}

⚠️ 近期警報 (24小時):
${recentAlerts.length === 0 ? '無警報' : recentAlerts.map(a => 
  `- [${a.severity.toUpperCase()}] ${a.message} (${a.gameId})`
).join('\n')}

📊 當前狀態:
- 記憶體使用: ${Math.round(this.currentMetrics.memoryUsage)}MB
- CPU 使用率: ${Math.round(this.currentMetrics.cpuUsage)}%
- FPS: ${this.currentMetrics.fps}
- 活躍遊戲: ${this.currentMetrics.activeGames}

生成時間: ${new Date().toLocaleString()}
    `.trim();
  }

  /**
   * 銷毀監控器
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // 清理數據
    this.metrics = [];
    this.alerts = [];

    console.log('🧹 GamePerformanceMonitor 已銷毀');
  }
}
