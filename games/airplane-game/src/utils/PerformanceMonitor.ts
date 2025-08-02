/**
 * 性能監控工具
 * 監控響應式系統的性能指標和記憶體使用情況
 */

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  updateTime: number;
  elementCount: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private scene: Phaser.Scene;
  private metrics: PerformanceMetrics[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;
  private displayContainer?: Phaser.GameObjects.Container;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * 開始性能監控
   */
  public startMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) {
      console.log('⚠️ 性能監控已在運行');
      return;
    }
    
    this.isMonitoring = true;
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
    
    console.log('📊 性能監控已啟動');
  }
  
  /**
   * 停止性能監控
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('📊 性能監控已停止');
  }
  
  /**
   * 收集性能指標
   */
  private collectMetrics(): void {
    const gameScene = this.scene as any;
    
    const metrics: PerformanceMetrics = {
      fps: Math.round(this.scene.game.loop.actualFps),
      memoryUsage: this.getMemoryUsage(),
      updateTime: gameScene.responsiveManager ? 
        gameScene.responsiveManager.getPerformanceStats().avgUpdateTime : 0,
      elementCount: gameScene.responsiveManager ? 
        gameScene.responsiveManager.getPerformanceStats().elementsCount : 0,
      timestamp: Date.now()
    };
    
    this.metrics.push(metrics);
    
    // 只保留最近 100 條記錄
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
    
    // 更新顯示
    if (this.displayContainer) {
      this.updateDisplay();
    }
  }
  
  /**
   * 獲取記憶體使用情況
   */
  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }
  
  /**
   * 顯示性能監控面板
   */
  public showPerformancePanel(): void {
    if (this.displayContainer) {
      this.hidePerformancePanel();
    }
    
    this.displayContainer = this.scene.add.container(20, 20);
    this.displayContainer.setDepth(2000);
    
    // 背景
    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 0.8);
    background.fillRoundedRect(0, 0, 200, 120, 8);
    
    // 標題
    const title = this.scene.add.text(10, 10, '📊 性能監控', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    
    // 性能指標文字
    const metricsText = this.scene.add.text(10, 35, '', {
      fontSize: '11px',
      color: '#ffffff'
    });
    
    this.displayContainer.add([background, title, metricsText]);
    this.displayContainer.setData('metricsText', metricsText);
    
    // 立即更新顯示
    this.updateDisplay();
    
    console.log('📊 性能監控面板已顯示');
  }
  
  /**
   * 隱藏性能監控面板
   */
  public hidePerformancePanel(): void {
    if (this.displayContainer) {
      this.displayContainer.destroy();
      this.displayContainer = undefined;
      console.log('📊 性能監控面板已隱藏');
    }
  }
  
  /**
   * 更新顯示內容
   */
  private updateDisplay(): void {
    if (!this.displayContainer || this.metrics.length === 0) return;
    
    const metricsText = this.displayContainer.getData('metricsText');
    if (!metricsText) return;
    
    const latest = this.metrics[this.metrics.length - 1];
    const avg = this.getAverageMetrics();
    
    const displayText = [
      `FPS: ${latest.fps} (平均: ${avg.fps})`,
      `記憶體: ${latest.memoryUsage}MB`,
      `更新時間: ${latest.updateTime.toFixed(1)}ms`,
      `元素數: ${latest.elementCount}`,
      `狀態: ${this.getPerformanceStatus()}`
    ].join('\n');
    
    metricsText.setText(displayText);
  }
  
  /**
   * 獲取平均性能指標
   */
  private getAverageMetrics() {
    if (this.metrics.length === 0) {
      return { fps: 0, memoryUsage: 0, updateTime: 0, elementCount: 0 };
    }
    
    const recent = this.metrics.slice(-10); // 最近 10 條記錄
    
    return {
      fps: Math.round(recent.reduce((sum, m) => sum + m.fps, 0) / recent.length),
      memoryUsage: Math.round(recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length),
      updateTime: recent.reduce((sum, m) => sum + m.updateTime, 0) / recent.length,
      elementCount: Math.round(recent.reduce((sum, m) => sum + m.elementCount, 0) / recent.length)
    };
  }
  
  /**
   * 獲取性能狀態
   */
  private getPerformanceStatus(): string {
    if (this.metrics.length === 0) return '未知';
    
    const latest = this.metrics[this.metrics.length - 1];
    
    if (latest.fps < 30) return '❌ 低FPS';
    if (latest.updateTime > 50) return '⚠️ 更新慢';
    if (latest.memoryUsage > 200) return '⚠️ 記憶體高';
    
    return '✅ 良好';
  }
  
  /**
   * 獲取性能報告
   */
  public getPerformanceReport(): string {
    if (this.metrics.length === 0) {
      return '📊 暫無性能數據';
    }
    
    const avg = this.getAverageMetrics();
    const latest = this.metrics[this.metrics.length - 1];
    
    const report = [
      '📊 性能監控報告',
      '='.repeat(30),
      `📈 當前 FPS: ${latest.fps}`,
      `📈 平均 FPS: ${avg.fps}`,
      `💾 記憶體使用: ${latest.memoryUsage}MB`,
      `⏱️ 更新時間: ${latest.updateTime.toFixed(2)}ms`,
      `📦 元素數量: ${latest.elementCount}`,
      `📊 整體狀態: ${this.getPerformanceStatus()}`,
      '',
      '🔧 優化建議:',
      ...this.getOptimizationSuggestions()
    ].join('\n');
    
    return report;
  }
  
  /**
   * 獲取優化建議
   */
  private getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const avg = this.getAverageMetrics();
    
    if (avg.fps < 45) {
      suggestions.push('• 考慮減少同時更新的元素數量');
    }
    
    if (avg.updateTime > 30) {
      suggestions.push('• 增加響應式更新的防抖間隔');
    }
    
    if (avg.memoryUsage > 150) {
      suggestions.push('• 檢查是否有記憶體洩漏');
      suggestions.push('• 及時清理不需要的響應式元素');
    }
    
    if (avg.elementCount > 50) {
      suggestions.push('• 考慮使用元素分組管理');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('• 性能表現良好，無需優化');
    }
    
    return suggestions;
  }
  
  /**
   * 導出性能數據
   */
  public exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
  
  /**
   * 清除性能數據
   */
  public clearMetrics(): void {
    this.metrics = [];
    console.log('📊 性能數據已清除');
  }
  
  /**
   * 銷毀性能監控器
   */
  public destroy(): void {
    this.stopMonitoring();
    this.hidePerformancePanel();
    this.clearMetrics();
    console.log('📊 性能監控器已銷毀');
  }
}

export default PerformanceMonitor;
