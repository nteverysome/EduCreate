interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageResponseTime: number;
    errorRate: number;
    slowestOperations: Array<{ name: string; value: number }>;
  };
  timestamp: number;
}

/**
 * 性能監控工具
 * 用於追蹤應用性能指標
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private maxMetrics: number;

  constructor(maxMetrics = 1000) {
    this.maxMetrics = maxMetrics;
  }

  /**
   * 開始計時
   */
  startTimer(name: string, tags?: Record<string, string>): void {
    const key = this.getTimerKey(name, tags);
    this.timers.set(key, performance.now());
  }

  /**
   * 結束計時並記錄
   */
  endTimer(name: string, tags?: Record<string, string>): number {
    const key = this.getTimerKey(name, tags);
    const startTime = this.timers.get(key);
    
    if (startTime === undefined) {
      console.warn(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(key);

    this.recordMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      type: 'timing',
      tags,
    });

    return duration;
  }

  /**
   * 測量函數執行時間
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startTimer(name, tags);
    try {
      const result = await fn();
      this.endTimer(name, tags);
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, error: 'true' });
      throw error;
    }
  }

  /**
   * 測量同步函數執行時間
   */
  measure<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    this.startTimer(name, tags);
    try {
      const result = fn();
      this.endTimer(name, tags);
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, error: 'true' });
      throw error;
    }
  }

  /**
   * 增加計數器
   */
  increment(name: string, value = 1, tags?: Record<string, string>): void {
    const key = this.getCounterKey(name, tags);
    const currentValue = this.counters.get(key) || 0;
    this.counters.set(key, currentValue + value);

    this.recordMetric({
      name,
      value: currentValue + value,
      timestamp: Date.now(),
      type: 'counter',
      tags,
    });
  }

  /**
   * 設置儀表值
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'gauge',
      tags,
    });
  }

  /**
   * 記錄 Web Vitals
   */
  recordWebVital(name: string, value: number): void {
    this.recordMetric({
      name: `web_vital_${name}`,
      value,
      timestamp: Date.now(),
      type: 'gauge',
      tags: { category: 'web_vitals' },
    });
  }

  /**
   * 記錄 API 調用
   */
  recordApiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number
  ): void {
    this.recordMetric({
      name: 'api_call',
      value: duration,
      timestamp: Date.now(),
      type: 'timing',
      tags: {
        endpoint,
        method,
        status: status.toString(),
        success: status >= 200 && status < 300 ? 'true' : 'false',
      },
    });
  }

  /**
   * 記錄錯誤
   */
  recordError(
    error: Error,
    context?: string,
    tags?: Record<string, string>
  ): void {
    this.increment('error_count', 1, {
      error_type: error.name,
      context: context || 'unknown',
      ...tags,
    });

    this.recordMetric({
      name: 'error',
      value: 1,
      timestamp: Date.now(),
      type: 'counter',
      tags: {
        error_message: error.message,
        error_type: error.name,
        context: context || 'unknown',
        ...tags,
      },
    });
  }

  /**
   * 獲取性能報告
   */
  getReport(): PerformanceReport {
    const timingMetrics = this.metrics.filter(m => m.type === 'timing');
    const errorMetrics = this.metrics.filter(m => m.name === 'error');

    const averageResponseTime = timingMetrics.length > 0
      ? timingMetrics.reduce((sum, m) => sum + m.value, 0) / timingMetrics.length
      : 0;

    const errorRate = this.metrics.length > 0
      ? (errorMetrics.length / this.metrics.length) * 100
      : 0;

    const slowestOperations = timingMetrics
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map(m => ({ name: m.name, value: m.value }));

    return {
      metrics: [...this.metrics],
      summary: {
        totalMetrics: this.metrics.length,
        averageResponseTime,
        errorRate,
        slowestOperations,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * 獲取特定指標的統計信息
   */
  getMetricStats(name: string): {
    count: number;
    min: number;
    max: number;
    average: number;
    p95: number;
  } | null {
    const metrics = this.metrics.filter(m => m.name === name);
    
    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;
    const min = values[0];
    const max = values[count - 1];
    const average = values.reduce((sum, v) => sum + v, 0) / count;
    const p95Index = Math.floor(count * 0.95);
    const p95 = values[p95Index] || max;

    return { count, min, max, average, p95 };
  }

  /**
   * 清除所有指標
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
    this.counters.clear();
  }

  /**
   * 導出指標數據
   */
  export(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }

  /**
   * 記錄指標
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // 限制指標數量，移除最舊的指標
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * 生成計時器鍵
   */
  private getTimerKey(name: string, tags?: Record<string, string>): string {
    const tagString = tags ? JSON.stringify(tags) : '';
    return `${name}:${tagString}`;
  }

  /**
   * 生成計數器鍵
   */
  private getCounterKey(name: string, tags?: Record<string, string>): string {
    const tagString = tags ? JSON.stringify(tags) : '';
    return `${name}:${tagString}`;
  }
}

// 創建全局性能監控實例
export const performanceMonitor = new PerformanceMonitor();

// 便捷的導出函數
export const perf = {
  start: (name: string, tags?: Record<string, string>) =>
    performanceMonitor.startTimer(name, tags),
  
  end: (name: string, tags?: Record<string, string>) =>
    performanceMonitor.endTimer(name, tags),
  
  measure: <T>(name: string, fn: () => T, tags?: Record<string, string>) =>
    performanceMonitor.measure(name, fn, tags),
  
  measureAsync: <T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>) =>
    performanceMonitor.measureAsync(name, fn, tags),
  
  count: (name: string, value?: number, tags?: Record<string, string>) =>
    performanceMonitor.increment(name, value, tags),
  
  gauge: (name: string, value: number, tags?: Record<string, string>) =>
    performanceMonitor.gauge(name, value, tags),
  
  error: (error: Error, context?: string, tags?: Record<string, string>) =>
    performanceMonitor.recordError(error, context, tags),
  
  api: (endpoint: string, method: string, status: number, duration: number) =>
    performanceMonitor.recordApiCall(endpoint, method, status, duration),
  
  webVital: (name: string, value: number) =>
    performanceMonitor.recordWebVital(name, value),
  
  report: () => performanceMonitor.getReport(),
  
  stats: (name: string) => performanceMonitor.getMetricStats(name),
};

export default performanceMonitor;
