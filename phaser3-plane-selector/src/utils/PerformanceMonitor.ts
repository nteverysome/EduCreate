export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private metrics: Map<string, number[]> = new Map();
  private isEnabled: boolean = false;
  private updateInterval: number | null = null;

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startMonitoring(): void {
    if (!this.isEnabled) return;

    this.updateInterval = window.setInterval(() => {
      this.collectMetrics();
    }, 1000);

    console.log('🔍 性能監控已啟動');
  }

  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('⏹️ 性能監控已停止');
  }

  private collectMetrics(): void {
    // FPS 監控
    this.recordMetric('fps', this.getFPS());
    
    // 記憶體使用監控
    this.recordMetric('memory', this.getMemoryUsage());
    
    // DOM 節點數量
    this.recordMetric('domNodes', document.querySelectorAll('*').length);
    
    // 事件監聽器數量（估算）
    this.recordMetric('eventListeners', this.estimateEventListeners());
  }

  private getFPS(): number {
    // 簡單的 FPS 估算
    const now = performance.now();
    if (!this.lastFrameTime) {
      this.lastFrameTime = now;
      return 60;
    }
    
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    return Math.round(1000 / delta);
  }

  private lastFrameTime: number = 0;

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  private estimateEventListeners(): number {
    // 簡單估算，實際應用中可能需要更精確的方法
    const elements = document.querySelectorAll('*');
    let count = 0;
    
    elements.forEach(element => {
      // 檢查常見的事件屬性
      const events = ['onclick', 'onmouseover', 'onkeydown', 'ontouchstart'];
      events.forEach(event => {
        if ((element as any)[event]) count++;
      });
    });
    
    return count;
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 只保留最近 60 個數據點（約 1 分鐘）
    if (values.length > 60) {
      values.shift();
    }
  }

  public getMetric(name: string): number[] {
    return this.metrics.get(name) || [];
  }

  public getAverageMetric(name: string): number {
    const values = this.getMetric(name);
    if (values.length === 0) return 0;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  public getMetricSummary(): { [key: string]: any } {
    const summary: { [key: string]: any } = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;
      
      const sorted = [...values].sort((a, b) => a - b);
      summary[name] = {
        current: values[values.length - 1],
        average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        min: sorted[0],
        max: sorted[sorted.length - 1],
        median: sorted[Math.floor(sorted.length / 2)]
      };
    }
    
    return summary;
  }

  public logPerformanceReport(): void {
    if (!this.isEnabled) return;
    
    const summary = this.getMetricSummary();
    console.group('📊 性能報告');
    
    for (const [metric, stats] of Object.entries(summary)) {
      console.log(`${metric}:`, stats);
    }
    
    // 性能警告
    this.checkPerformanceWarnings(summary);
    
    console.groupEnd();
  }

  private checkPerformanceWarnings(summary: { [key: string]: any }): void {
    const warnings: string[] = [];
    
    // FPS 警告
    if (summary.fps && summary.fps.average < 30) {
      warnings.push(`⚠️ 平均 FPS 過低: ${summary.fps.average}`);
    }
    
    // 記憶體警告
    if (summary.memory && summary.memory.current > 100) {
      warnings.push(`⚠️ 記憶體使用過高: ${summary.memory.current}MB`);
    }
    
    // DOM 節點警告
    if (summary.domNodes && summary.domNodes.current > 5000) {
      warnings.push(`⚠️ DOM 節點過多: ${summary.domNodes.current}`);
    }
    
    if (warnings.length > 0) {
      console.warn('性能警告:');
      warnings.forEach(warning => console.warn(warning));
    } else {
      console.log('✅ 性能狀況良好');
    }
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) return fn();
    
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(`function_${name}`, end - start);
    
    return result;
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn();
    
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(`async_${name}`, end - start);
    
    return result;
  }

  public markEvent(name: string): void {
    if (!this.isEnabled) return;
    
    performance.mark(name);
    console.log(`🏷️ 事件標記: ${name} at ${performance.now().toFixed(2)}ms`);
  }

  public measureBetweenMarks(startMark: string, endMark: string, measureName: string): void {
    if (!this.isEnabled) return;
    
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      console.log(`⏱️ ${measureName}: ${measure.duration.toFixed(2)}ms`);
      
      this.recordMetric(`measure_${measureName}`, measure.duration);
    } catch (error) {
      console.warn(`無法測量 ${measureName}:`, error);
    }
  }

  public getResourceTimings(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  public analyzeResourceLoading(): void {
    if (!this.isEnabled) return;
    
    const resources = this.getResourceTimings();
    const analysis = {
      totalResources: resources.length,
      totalSize: 0,
      totalLoadTime: 0,
      slowestResource: null as PerformanceResourceTiming | null,
      largestResource: null as PerformanceResourceTiming | null
    };
    
    resources.forEach(resource => {
      const loadTime = resource.responseEnd - resource.requestStart;
      const size = resource.transferSize || 0;
      
      analysis.totalSize += size;
      analysis.totalLoadTime += loadTime;
      
      if (!analysis.slowestResource || loadTime > (analysis.slowestResource.responseEnd - analysis.slowestResource.requestStart)) {
        analysis.slowestResource = resource;
      }
      
      if (!analysis.largestResource || size > (analysis.largestResource.transferSize || 0)) {
        analysis.largestResource = resource;
      }
    });
    
    console.group('📦 資源載入分析');
    console.log('總資源數:', analysis.totalResources);
    console.log('總大小:', (analysis.totalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('總載入時間:', analysis.totalLoadTime.toFixed(2), 'ms');
    
    if (analysis.slowestResource) {
      const slowTime = analysis.slowestResource.responseEnd - analysis.slowestResource.requestStart;
      console.log('最慢資源:', analysis.slowestResource.name, `(${slowTime.toFixed(2)}ms)`);
    }
    
    if (analysis.largestResource) {
      const size = (analysis.largestResource.transferSize || 0) / 1024;
      console.log('最大資源:', analysis.largestResource.name, `(${size.toFixed(2)}KB)`);
    }
    
    console.groupEnd();
  }

  public destroy(): void {
    this.stopMonitoring();
    this.metrics.clear();
    PerformanceMonitor.instance = null;
  }
}
