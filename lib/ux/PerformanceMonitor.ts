/**
 * 性能監控器
 * 監控應用性能指標，提供優化建議
 */

export interface PerformanceMetrics {
  // 頁面加載性能
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  
  // 運行時性能
  runtime: {
    memoryUsage: number;
    jsHeapSize: number;
    renderTime: number;
    frameRate: number;
    longTasks: number;
  };
  
  // 用戶交互性能
  interaction: {
    clickResponseTime: number;
    scrollPerformance: number;
    inputLatency: number;
    navigationTiming: number;
  };
  
  // 資源性能
  resources: {
    totalSize: number;
    imageOptimization: number;
    cacheHitRate: number;
    compressionRatio: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: 'loading' | 'runtime' | 'interaction' | 'resources';
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface PerformanceReport {
  score: number; // 0-100
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  recommendations: string[];
  timestamp: Date;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  // 開始監控
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.initializeObservers();
    this.measurePageLoad();
    this.measureRuntime();
    this.measureInteraction();
    this.measureResources();
  }

  // 停止監控
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // 獲取當前性能報告
  getPerformanceReport(): PerformanceReport {
    const score = this.calculatePerformanceScore();
    const recommendations = this.generateRecommendations();
    
    return {
      score,
      metrics: this.metrics as PerformanceMetrics,
      alerts: this.alerts,
      recommendations,
      timestamp: new Date()
    };
  }

  // 初始化性能觀察器
  private initializeObservers(): void {
    // 觀察 LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.updateMetric('pageLoad.largestContentfulPaint', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // 觀察 FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              this.updateMetric('pageLoad.firstInputDelay', fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // 觀察 CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.updateMetric('pageLoad.cumulativeLayoutShift', clsValue);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // 觀察長任務
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const currentCount = this.metrics.runtime?.longTasks || 0;
          this.updateMetric('runtime.longTasks', currentCount + entries.length);
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  // 測量頁面加載性能
  private measurePageLoad(): void {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.updateMetric('pageLoad.domContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.updateMetric('pageLoad.loadComplete', navigation.loadEventEnd - navigation.fetchStart);
      } else {
        this.updateMetric('pageLoad.domContentLoaded', timing.domContentLoadedEventEnd - timing.navigationStart);
        this.updateMetric('pageLoad.loadComplete', timing.loadEventEnd - timing.navigationStart);
      }

      // 測量 FCP (First Contentful Paint)
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.updateMetric('pageLoad.firstContentfulPaint', fcpEntry.startTime);
      }
    }
  }

  // 測量運行時性能
  private measureRuntime(): void {
    // 內存使用情況
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetric('runtime.memoryUsage', memory.usedJSHeapSize / 1024 / 1024); // MB
      this.updateMetric('runtime.jsHeapSize', memory.totalJSHeapSize / 1024 / 1024); // MB
    }

    // 幀率監控
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        this.updateMetric('runtime.frameRate', frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFrameRate);
      }
    };
    
    requestAnimationFrame(measureFrameRate);
  }

  // 測量交互性能
  private measureInteraction(): void {
    let clickStartTime = 0;
    
    // 點擊響應時間
    document.addEventListener('mousedown', () => {
      clickStartTime = performance.now();
    });
    
    document.addEventListener('click', () => {
      if (clickStartTime) {
        const responseTime = performance.now() - clickStartTime;
        this.updateMetric('interaction.clickResponseTime', responseTime);
      }
    });

    // 滾動性能
    let scrollStartTime = 0;
    let isScrolling = false;
    
    document.addEventListener('scroll', () => {
      if (!isScrolling) {
        scrollStartTime = performance.now();
        isScrolling = true;
      }
      
      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => {
        const scrollTime = performance.now() - scrollStartTime;
        this.updateMetric('interaction.scrollPerformance', scrollTime);
        isScrolling = false;
      }, 100);
    });
  }

  // 測量資源性能
  private measureResources(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    let compressedSize = 0;
    let imageCount = 0;
    let optimizedImages = 0;
    
    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize;
        
        if (resource.encodedBodySize && resource.decodedBodySize) {
          compressedSize += resource.encodedBodySize;
          
          // 檢查圖片優化
          if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            imageCount++;
            const compressionRatio = resource.encodedBodySize / resource.decodedBodySize;
            if (compressionRatio < 0.8 || resource.name.includes('.webp')) {
              optimizedImages++;
            }
          }
        }
      }
    });
    
    this.updateMetric('resources.totalSize', totalSize / 1024 / 1024); // MB
    this.updateMetric('resources.compressionRatio', compressedSize / totalSize);
    this.updateMetric('resources.imageOptimization', imageCount > 0 ? optimizedImages / imageCount : 1);
    
    // 緩存命中率（簡化計算）
    const cachedResources = resources.filter(r => r.transferSize === 0).length;
    this.updateMetric('resources.cacheHitRate', resources.length > 0 ? cachedResources / resources.length : 0);
  }

  // 更新指標
  private updateMetric(path: string, value: number): void {
    const keys = path.split('.');
    let current = this.metrics as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // 檢查是否需要生成警告
    this.checkForAlerts(path, value);
  }

  // 檢查性能警告
  private checkForAlerts(metric: string, value: number): void {
    const alerts: { [key: string]: { threshold: number; type: 'warning' | 'error'; message: string; suggestion: string; impact: 'low' | 'medium' | 'high' } } = {
      'pageLoad.loadComplete': {
        threshold: 3000,
        type: 'warning',
        message: '頁面加載時間過長',
        suggestion: '優化圖片大小、減少HTTP請求、使用CDN',
        impact: 'high'
      },
      'pageLoad.largestContentfulPaint': {
        threshold: 2500,
        type: 'warning',
        message: 'LCP 時間過長',
        suggestion: '優化關鍵渲染路徑、預加載重要資源',
        impact: 'high'
      },
      'pageLoad.firstInputDelay': {
        threshold: 100,
        type: 'warning',
        message: 'FID 時間過長',
        suggestion: '減少主線程阻塞、優化JavaScript執行',
        impact: 'medium'
      },
      'pageLoad.cumulativeLayoutShift': {
        threshold: 0.1,
        type: 'warning',
        message: 'CLS 分數過高',
        suggestion: '為圖片和廣告設置尺寸、避免動態插入內容',
        impact: 'medium'
      },
      'runtime.memoryUsage': {
        threshold: 100,
        type: 'warning',
        message: '內存使用過高',
        suggestion: '檢查內存洩漏、優化數據結構',
        impact: 'medium'
      },
      'runtime.frameRate': {
        threshold: 30,
        type: 'warning',
        message: '幀率過低',
        suggestion: '優化動畫、減少重繪和重排',
        impact: 'low'
      }
    };

    const alertConfig = alerts[metric];
    if (alertConfig && value > alertConfig.threshold) {
      const existingAlert = this.alerts.find(a => a.message === alertConfig.message);
      if (!existingAlert) {
        this.alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: alertConfig.type,
          category: metric.split('.')[0] as any,
          message: alertConfig.message,
          suggestion: alertConfig.suggestion,
          impact: alertConfig.impact,
          timestamp: new Date()
        });
      }
    }
  }

  // 計算性能分數
  private calculatePerformanceScore(): number {
    const weights = {
      pageLoad: 0.4,
      runtime: 0.3,
      interaction: 0.2,
      resources: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    // 頁面加載分數
    if (this.metrics.pageLoad) {
      const loadScore = this.calculateLoadScore();
      totalScore += loadScore * weights.pageLoad;
      totalWeight += weights.pageLoad;
    }

    // 運行時分數
    if (this.metrics.runtime) {
      const runtimeScore = this.calculateRuntimeScore();
      totalScore += runtimeScore * weights.runtime;
      totalWeight += weights.runtime;
    }

    // 交互分數
    if (this.metrics.interaction) {
      const interactionScore = this.calculateInteractionScore();
      totalScore += interactionScore * weights.interaction;
      totalWeight += weights.interaction;
    }

    // 資源分數
    if (this.metrics.resources) {
      const resourceScore = this.calculateResourceScore();
      totalScore += resourceScore * weights.resources;
      totalWeight += weights.resources;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  private calculateLoadScore(): number {
    const load = this.metrics.pageLoad!;
    let score = 100;

    if (load.loadComplete > 3000) score -= 20;
    if (load.largestContentfulPaint > 2500) score -= 15;
    if (load.firstInputDelay > 100) score -= 10;
    if (load.cumulativeLayoutShift > 0.1) score -= 10;

    return Math.max(0, score);
  }

  private calculateRuntimeScore(): number {
    const runtime = this.metrics.runtime!;
    let score = 100;

    if (runtime.memoryUsage > 100) score -= 15;
    if (runtime.frameRate < 30) score -= 10;
    if (runtime.longTasks > 5) score -= 10;

    return Math.max(0, score);
  }

  private calculateInteractionScore(): number {
    const interaction = this.metrics.interaction!;
    let score = 100;

    if (interaction.clickResponseTime > 100) score -= 15;
    if (interaction.scrollPerformance > 16) score -= 10;

    return Math.max(0, score);
  }

  private calculateResourceScore(): number {
    const resources = this.metrics.resources!;
    let score = 100;

    if (resources.totalSize > 5) score -= 15; // 5MB
    if (resources.imageOptimization < 0.8) score -= 10;
    if (resources.cacheHitRate < 0.5) score -= 10;

    return Math.max(0, score);
  }

  // 生成優化建議
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.metrics;

    if (metrics.pageLoad?.loadComplete && metrics.pageLoad.loadComplete > 3000) {
      recommendations.push('優化頁面加載時間：壓縮圖片、使用CDN、減少HTTP請求');
    }

    if (metrics.runtime?.memoryUsage && metrics.runtime.memoryUsage > 100) {
      recommendations.push('優化內存使用：檢查內存洩漏、清理未使用的變量');
    }

    if (metrics.resources?.imageOptimization && metrics.resources.imageOptimization < 0.8) {
      recommendations.push('優化圖片：使用WebP格式、適當壓縮、響應式圖片');
    }

    if (metrics.runtime?.frameRate && metrics.runtime.frameRate < 30) {
      recommendations.push('優化動畫性能：使用CSS動畫、避免強制同步佈局');
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表現良好！繼續保持最佳實踐。');
    }

    return recommendations;
  }
}
