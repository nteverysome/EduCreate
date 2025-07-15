/**
 * PerformanceMonitor - 性能監控和分析系統
 * 實現詳細的性能監控、實時指標追蹤、自動重試機制和性能分析報告
 */

export interface PerformanceMetric {
  id: string;
  timestamp: number;
  operation: 'save' | 'load' | 'compress' | 'sync' | 'conflict-resolve';
  duration: number;
  success: boolean;
  error?: string;
  metadata?: {
    dataSize?: number;
    compressionRatio?: number;
    retryCount?: number;
    networkStatus?: 'online' | 'offline';
    conflictType?: string;
  };
}

export interface PerformanceThresholds {
  saveTime: number; // 保存操作閾值 (默認 300ms)
  loadTime: number; // 載入操作閾值 (默認 1000ms)
  compressionTime: number; // 壓縮操作閾值 (默認 500ms)
  syncTime: number; // 同步操作閾值 (默認 2000ms)
  successRate: number; // 成功率閾值 (默認 99.5%)
}

export interface PerformanceAlert {
  id: string;
  timestamp: number;
  type: 'warning' | 'error' | 'critical';
  operation: string;
  message: string;
  threshold: number;
  actualValue: number;
  suggestion?: string;
}

export interface PerformanceReport {
  generatedAt: number;
  timeRange: { start: number; end: number };
  summary: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageResponseTime: number;
    successRate: number;
  };
  operationBreakdown: {
    [operation: string]: {
      count: number;
      averageTime: number;
      successRate: number;
      slowestOperation: PerformanceMetric;
      fastestOperation: PerformanceMetric;
    };
  };
  alerts: PerformanceAlert[];
  recommendations: string[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds;
  private alertListeners: Set<(alert: PerformanceAlert) => void> = new Set();
  private reportListeners: Set<(report: PerformanceReport) => void> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    thresholds: Partial<PerformanceThresholds> = {},
    private options: {
      maxMetrics?: number;
      maxAlerts?: number;
      monitoringIntervalMs?: number;
      enableAutoReporting?: boolean;
      reportIntervalMs?: number;
    } = {}
  ) {
    this.thresholds = {
      saveTime: 300,
      loadTime: 1000,
      compressionTime: 500,
      syncTime: 2000,
      successRate: 99.5,
      ...thresholds
    };

    this.options = {
      maxMetrics: 1000,
      maxAlerts: 100,
      monitoringIntervalMs: 5000,
      enableAutoReporting: true,
      reportIntervalMs: 60000, // 1分鐘
      ...options
    };

    this.startMonitoring();
  }

  /**
   * 記錄性能指標
   */
  recordMetric(
    operation: PerformanceMetric['operation'],
    duration: number,
    success: boolean,
    metadata?: PerformanceMetric['metadata'],
    error?: string
  ): string {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      operation,
      duration,
      success,
      metadata,
      error
    };

    this.metrics.push(metric);

    // 保持指標數量限制
    if (this.metrics.length > this.options.maxMetrics!) {
      this.metrics = this.metrics.slice(-this.options.maxMetrics!);
    }

    // 檢查是否需要發出警告
    this.checkThresholds(metric);

    return metric.id;
  }

  /**
   * 檢查性能閾值
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds[`${metric.operation}Time` as keyof PerformanceThresholds] as number;
    
    if (threshold && metric.duration > threshold) {
      this.createAlert(
        'warning',
        metric.operation,
        `${metric.operation} 操作響應時間過慢`,
        threshold,
        metric.duration,
        this.getOptimizationSuggestion(metric.operation, metric.duration, threshold)
      );
    }

    // 檢查成功率
    this.checkSuccessRate(metric.operation);
  }

  /**
   * 檢查成功率
   */
  private checkSuccessRate(operation: PerformanceMetric['operation']): void {
    const recentMetrics = this.metrics
      .filter(m => m.operation === operation)
      .slice(-20); // 最近20次操作

    if (recentMetrics.length >= 10) {
      const successCount = recentMetrics.filter(m => m.success).length;
      const successRate = (successCount / recentMetrics.length) * 100;

      if (successRate < this.thresholds.successRate) {
        this.createAlert(
          'error',
          operation,
          `${operation} 操作成功率過低`,
          this.thresholds.successRate,
          successRate,
          `建議檢查網絡連接和服務器狀態，考慮增加重試次數`
        );
      }
    }
  }

  /**
   * 創建警告
   */
  private createAlert(
    type: PerformanceAlert['type'],
    operation: string,
    message: string,
    threshold: number,
    actualValue: number,
    suggestion?: string
  ): void {
    const alert: PerformanceAlert = {
      id: this.generateId(),
      timestamp: Date.now(),
      type,
      operation,
      message,
      threshold,
      actualValue,
      suggestion
    };

    this.alerts.push(alert);

    // 保持警告數量限制
    if (this.alerts.length > this.options.maxAlerts!) {
      this.alerts = this.alerts.slice(-this.options.maxAlerts!);
    }

    // 通知監聽器
    this.alertListeners.forEach(listener => listener(alert));

    // 控制台輸出
    const emoji = type === 'critical' ? '🚨' : type === 'error' ? '❌' : '⚠️';
    console.warn(`${emoji} 性能警告: ${message} (${actualValue.toFixed(2)} > ${threshold})`);
    if (suggestion) {
      console.info(`💡 建議: ${suggestion}`);
    }
  }

  /**
   * 獲取優化建議
   */
  private getOptimizationSuggestion(operation: string, actualTime: number, threshold: number): string {
    const ratio = actualTime / threshold;
    
    switch (operation) {
      case 'save':
        if (ratio > 3) return '考慮啟用數據壓縮或減少保存頻率';
        if (ratio > 2) return '檢查網絡連接，考慮使用批量保存';
        return '優化數據結構或啟用增量保存';
        
      case 'load':
        if (ratio > 3) return '考慮實現懶加載或數據分頁';
        if (ratio > 2) return '啟用數據緩存或預加載機制';
        return '優化數據查詢或使用索引';
        
      case 'compress':
        if (ratio > 2) return '調整壓縮級別或使用更快的壓縮算法';
        return '考慮異步壓縮或分塊處理';
        
      case 'sync':
        if (ratio > 2) return '優化同步策略或使用增量同步';
        return '檢查網絡狀況或調整同步間隔';
        
      default:
        return '檢查操作邏輯和網絡狀況';
    }
  }

  /**
   * 生成性能報告
   */
  generateReport(timeRangeMs: number = 3600000): PerformanceReport {
    const now = Date.now();
    const startTime = now - timeRangeMs;
    
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= startTime);
    const relevantAlerts = this.alerts.filter(a => a.timestamp >= startTime);

    const summary = this.calculateSummary(relevantMetrics);
    const operationBreakdown = this.calculateOperationBreakdown(relevantMetrics);
    const recommendations = this.generateRecommendations(relevantMetrics, relevantAlerts);

    const report: PerformanceReport = {
      generatedAt: now,
      timeRange: { start: startTime, end: now },
      summary,
      operationBreakdown,
      alerts: relevantAlerts,
      recommendations
    };

    // 通知報告監聽器
    this.reportListeners.forEach(listener => listener(report));

    return report;
  }

  /**
   * 計算摘要統計
   */
  private calculateSummary(metrics: PerformanceMetric[]) {
    const totalOperations = metrics.length;
    const successfulOperations = metrics.filter(m => m.success).length;
    const failedOperations = totalOperations - successfulOperations;
    const averageResponseTime = totalOperations > 0 
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations 
      : 0;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 100;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageResponseTime,
      successRate
    };
  }

  /**
   * 計算操作分解統計
   */
  private calculateOperationBreakdown(metrics: PerformanceMetric[]) {
    const breakdown: PerformanceReport['operationBreakdown'] = {};

    const operations = [...new Set(metrics.map(m => m.operation))];

    operations.forEach(operation => {
      const operationMetrics = metrics.filter(m => m.operation === operation);
      const count = operationMetrics.length;
      const successfulMetrics = operationMetrics.filter(m => m.success);
      const averageTime = count > 0 
        ? operationMetrics.reduce((sum, m) => sum + m.duration, 0) / count 
        : 0;
      const successRate = count > 0 ? (successfulMetrics.length / count) * 100 : 100;
      
      const sortedByTime = [...operationMetrics].sort((a, b) => a.duration - b.duration);
      const slowestOperation = sortedByTime[sortedByTime.length - 1];
      const fastestOperation = sortedByTime[0];

      breakdown[operation] = {
        count,
        averageTime,
        successRate,
        slowestOperation,
        fastestOperation
      };
    });

    return breakdown;
  }

  /**
   * 生成建議
   */
  private generateRecommendations(metrics: PerformanceMetric[], alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // 基於警告生成建議
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    const errorAlerts = alerts.filter(a => a.type === 'error');

    if (criticalAlerts.length > 0) {
      recommendations.push('🚨 發現嚴重性能問題，建議立即檢查系統狀態');
    }

    if (errorAlerts.length > 0) {
      recommendations.push('❌ 檢測到多個錯誤，建議檢查網絡連接和服務器狀態');
    }

    // 基於指標趨勢生成建議
    const recentMetrics = metrics.slice(-50);
    if (recentMetrics.length > 10) {
      const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
      const successRate = (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100;

      if (avgResponseTime > 1000) {
        recommendations.push('⏱️ 平均響應時間較高，建議優化數據處理邏輯');
      }

      if (successRate < 95) {
        recommendations.push('📉 成功率偏低，建議增強錯誤處理和重試機制');
      }
    }

    // 操作特定建議
    const saveMetrics = metrics.filter(m => m.operation === 'save');
    if (saveMetrics.length > 0) {
      const avgSaveTime = saveMetrics.reduce((sum, m) => sum + m.duration, 0) / saveMetrics.length;
      if (avgSaveTime > this.thresholds.saveTime) {
        recommendations.push('💾 保存操作較慢，考慮啟用數據壓縮或批量保存');
      }
    }

    return recommendations.length > 0 ? recommendations : ['✅ 系統性能良好，無需特別優化'];
  }

  /**
   * 開始監控
   */
  private startMonitoring(): void {
    if (this.options.enableAutoReporting) {
      this.monitoringInterval = setInterval(() => {
        this.generateReport();
      }, this.options.reportIntervalMs);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加警告監聽器
   */
  addAlertListener(listener: (alert: PerformanceAlert) => void): void {
    this.alertListeners.add(listener);
  }

  /**
   * 移除警告監聽器
   */
  removeAlertListener(listener: (alert: PerformanceAlert) => void): void {
    this.alertListeners.delete(listener);
  }

  /**
   * 添加報告監聽器
   */
  addReportListener(listener: (report: PerformanceReport) => void): void {
    this.reportListeners.add(listener);
  }

  /**
   * 移除報告監聽器
   */
  removeReportListener(listener: (report: PerformanceReport) => void): void {
    this.reportListeners.delete(listener);
  }

  /**
   * 獲取最近的指標
   */
  getRecentMetrics(count: number = 50): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * 獲取最近的警告
   */
  getRecentAlerts(count: number = 20): PerformanceAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.alertListeners.clear();
    this.reportListeners.clear();
    this.metrics = [];
    this.alerts = [];
  }
}
