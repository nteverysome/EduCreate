/**
 * 響應式管理器
 * 統一管理所有遊戲元素的自適應行為
 * 支援背景層、遊戲物件、UI 元素的縮放和重新定位
 */

export interface ResponsiveElement {
  element: any;
  type: 'background' | 'gameObject' | 'ui' | 'text';
  originalX: number;
  originalY: number;
  originalScale: number;
  originalSize?: { width: number; height: number };
  anchor?: { x: number; y: number };
  constraints?: {
    minScale?: number;
    maxScale?: number;
    keepAspectRatio?: boolean;
    fixedPosition?: boolean;
  };
}

export interface ViewportInfo {
  width: number;
  height: number;
  scale: number;
  isFullscreen: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

export interface ResponsiveConfig {
  baseWidth: number;
  baseHeight: number;
  minScale: number;
  maxScale: number;
  aspectRatio: number;
  enableSmoothing: boolean;
  animationDuration: number;
  throttleMs: number;
}

/**
 * 性能監控器
 */
class PerformanceMonitor {
  private updateCount: number = 0;
  private totalUpdateTime: number = 0;
  private lastReportTime: number = Date.now();
  private memoryUsage: number[] = [];

  public recordUpdate(duration: number): void {
    this.updateCount++;
    this.totalUpdateTime += duration;

    // 記錄記憶體使用情況
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.memoryUsage.push(memory.usedJSHeapSize / 1024 / 1024); // MB

      // 只保留最近 100 次記錄
      if (this.memoryUsage.length > 100) {
        this.memoryUsage.shift();
      }
    }

    // 每 30 秒報告一次性能
    const now = Date.now();
    if (now - this.lastReportTime > 30000) {
      this.reportPerformance();
      this.lastReportTime = now;
    }
  }

  private reportPerformance(): void {
    if (this.updateCount === 0) return;

    const avgUpdateTime = this.totalUpdateTime / this.updateCount;
    const avgMemory = this.memoryUsage.length > 0 ?
      this.memoryUsage.reduce((a, b) => a + b, 0) / this.memoryUsage.length : 0;

    console.log('📊 響應式管理器性能報告:', {
      更新次數: this.updateCount,
      平均更新時間: `${avgUpdateTime.toFixed(2)}ms`,
      平均記憶體使用: `${avgMemory.toFixed(1)}MB`,
      記憶體趨勢: this.getMemoryTrend()
    });

    // 重置計數器
    this.updateCount = 0;
    this.totalUpdateTime = 0;
  }

  private getMemoryTrend(): string {
    if (this.memoryUsage.length < 10) return '數據不足';

    const recent = this.memoryUsage.slice(-10);
    const older = this.memoryUsage.slice(-20, -10);

    if (older.length === 0) return '穩定';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 5) return '上升 ⚠️';
    if (diff < -5) return '下降 ✅';
    return '穩定 ✅';
  }

  public getStats() {
    return {
      updateCount: this.updateCount,
      avgUpdateTime: this.updateCount > 0 ? this.totalUpdateTime / this.updateCount : 0,
      memoryUsage: this.memoryUsage.slice(-10) // 最近 10 次記錄
    };
  }
}

export class ResponsiveManager {
  private scene: Phaser.Scene;
  private config: ResponsiveConfig;
  private elements: Map<string, ResponsiveElement> = new Map();
  private currentViewport: ViewportInfo;
  private isAnimating: boolean = false;
  
  // 性能優化
  private updateThrottleTimer: number | null = null;
  private lastUpdateTime: number = 0;
  private cleanupTimer: number | null = null;
  private performanceMonitor: PerformanceMonitor;
  
  // 預設配置
  private static readonly DEFAULT_CONFIG: ResponsiveConfig = {
    baseWidth: 1274,
    baseHeight: 739,
    minScale: 0.3,
    maxScale: 2.0,
    aspectRatio: 1274 / 739,
    enableSmoothing: true,
    animationDuration: 300,
    throttleMs: 100
  };

  constructor(scene: Phaser.Scene, config?: Partial<ResponsiveConfig>) {
    try {
      this.scene = scene;
      this.config = { ...ResponsiveManager.DEFAULT_CONFIG, ...config };

      // 初始化性能監控器
      this.performanceMonitor = new PerformanceMonitor();

      // 初始化視窗信息
      this.currentViewport = this.calculateViewportInfo();

      // 設置事件監聽
      this.setupEventListeners();

      // 啟動定期清理
      this.startPeriodicCleanup();

      console.log('🎯 響應式管理器初始化完成', {
        baseSize: `${this.config.baseWidth}×${this.config.baseHeight}`,
        currentViewport: this.currentViewport,
        throttleMs: this.config.throttleMs
      });
    } catch (error) {
      console.error('❌ 響應式管理器初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 註冊需要響應式管理的元素
   */
  public registerElement(
    id: string,
    element: any,
    type: ResponsiveElement['type'],
    options?: Partial<ResponsiveElement>
  ): void {
    try {
      // 驗證輸入參數
      if (!id || typeof id !== 'string') {
        throw new Error('元素 ID 必須是非空字符串');
      }

      if (!element) {
        throw new Error('元素不能為空');
      }

      if (!['background', 'gameObject', 'ui', 'text'].includes(type)) {
        throw new Error(`不支援的元素類型: ${type}`);
      }

      // 檢查元素是否已經註冊
      if (this.elements.has(id)) {
        console.warn(`⚠️ 元素 ${id} 已存在，將被覆蓋`);
      }

      // 檢查元素是否有效
      if (element.destroyed) {
        throw new Error(`元素 ${id} 已被銷毀，無法註冊`);
      }

      const responsiveElement: ResponsiveElement = {
        element,
        type,
        originalX: this.safeGetProperty(element, 'x', 0),
        originalY: this.safeGetProperty(element, 'y', 0),
        originalScale: this.safeGetProperty(element, 'scale',
          this.safeGetProperty(element, 'scaleX', 1)),
        originalSize: element.width && element.height ?
          { width: element.width, height: element.height } : undefined,
        anchor: { x: 0.5, y: 0.5 },
        constraints: {
          keepAspectRatio: true,
          minScale: this.config.minScale,
          maxScale: this.config.maxScale
        },
        ...options
      };

      this.elements.set(id, responsiveElement);
      console.log(`📝 註冊響應式元素: ${id} (${type})`);

    } catch (error) {
      console.error(`❌ 註冊響應式元素失敗 (${id}):`, error);
      throw error;
    }
  }

  /**
   * 安全獲取物件屬性
   */
  private safeGetProperty(obj: any, property: string, defaultValue: any): any {
    try {
      return obj && typeof obj[property] !== 'undefined' ? obj[property] : defaultValue;
    } catch (error) {
      console.warn(`⚠️ 無法獲取屬性 ${property}，使用預設值:`, defaultValue);
      return defaultValue;
    }
  }

  /**
   * 移除響應式元素
   */
  public unregisterElement(id: string): void {
    if (this.elements.has(id)) {
      this.elements.delete(id);
      console.log(`🗑️ 移除響應式元素: ${id}`);
    }
  }

  /**
   * 計算當前視窗信息
   */
  private calculateViewportInfo(): ViewportInfo {
    const gameSize = this.scene.scale.gameSize;
    const displaySize = this.scene.scale.displaySize;
    
    const width = displaySize.width;
    const height = displaySize.height;
    const scale = Math.min(width / this.config.baseWidth, height / this.config.baseHeight);
    
    // 檢測全螢幕狀態
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    // 檢測設備類型
    let deviceType: ViewportInfo['deviceType'] = 'desktop';
    if (width < 768) deviceType = 'mobile';
    else if (width < 1024) deviceType = 'tablet';

    // 檢測方向
    const orientation: ViewportInfo['orientation'] = width > height ? 'landscape' : 'portrait';

    return {
      width,
      height,
      scale: Math.max(this.config.minScale, Math.min(this.config.maxScale, scale)),
      isFullscreen,
      deviceType,
      orientation
    };
  }

  /**
   * 更新所有響應式元素（帶性能優化）
   */
  public updateAllElements(animated: boolean = true): Promise<void> {
    return new Promise((resolve) => {
      // 性能優化：防抖處理
      const now = Date.now();
      if (now - this.lastUpdateTime < this.config.throttleMs) {
        if (this.updateThrottleTimer) {
          clearTimeout(this.updateThrottleTimer);
        }
        
        this.updateThrottleTimer = window.setTimeout(() => {
          this.performUpdate(animated).then(resolve);
        }, this.config.throttleMs);
        return;
      }
      
      this.lastUpdateTime = now;
      this.performUpdate(animated).then(resolve);
    });
  }

  /**
   * 執行實際的更新操作
   */
  private performUpdate(animated: boolean): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();

      if (this.isAnimating && animated) {
        console.log('⏳ 動畫進行中，跳過更新');
        resolve();
        return;
      }

      // 更新視窗信息
      const newViewport = this.calculateViewportInfo();
      const viewportChanged = this.hasViewportChanged(newViewport);

      if (!viewportChanged) {
        console.log('📐 視窗未變化，跳過更新');
        resolve();
        return;
      }

      console.log('🔄 開始更新所有響應式元素', {
        from: this.currentViewport,
        to: newViewport
      });

      this.currentViewport = newViewport;

      // 清理無效元素
      this.cleanupInvalidElements();

      const finishUpdate = () => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // 記錄性能數據
        this.performanceMonitor.recordUpdate(duration);

        resolve();
      };

      if (animated && this.config.enableSmoothing) {
        this.animateElements().then(finishUpdate);
      } else {
        this.updateElementsImmediate();
        finishUpdate();
      }
    });
  }

  /**
   * 檢查視窗是否發生變化
   */
  private hasViewportChanged(newViewport: ViewportInfo): boolean {
    const threshold = 0.01; // 1% 的變化閾值
    
    return (
      Math.abs(newViewport.width - this.currentViewport.width) > 10 ||
      Math.abs(newViewport.height - this.currentViewport.height) > 10 ||
      Math.abs(newViewport.scale - this.currentViewport.scale) > threshold ||
      newViewport.isFullscreen !== this.currentViewport.isFullscreen ||
      newViewport.deviceType !== this.currentViewport.deviceType ||
      newViewport.orientation !== this.currentViewport.orientation
    );
  }

  /**
   * 立即更新所有元素（無動畫）
   */
  private updateElementsImmediate(): void {
    this.elements.forEach((element, id) => {
      this.updateSingleElement(element, false);
    });
    
    console.log(`✅ 立即更新完成 ${this.elements.size} 個元素`);
  }

  /**
   * 動畫更新所有元素
   */
  private animateElements(): Promise<void> {
    return new Promise((resolve) => {
      this.isAnimating = true;
      
      const animations: Promise<void>[] = [];
      
      this.elements.forEach((element, id) => {
        const animationPromise = this.animateSingleElement(element);
        animations.push(animationPromise);
      });

      Promise.all(animations).then(() => {
        this.isAnimating = false;
        console.log(`✨ 動畫更新完成 ${this.elements.size} 個元素`);
        resolve();
      });
    });
  }

  /**
   * 更新單個元素
   */
  private updateSingleElement(responsiveElement: ResponsiveElement, animated: boolean = false): void {
    try {
      const { element, type, originalX, originalY, originalScale, constraints } = responsiveElement;

      // 安全檢查
      if (!element) {
        console.warn('⚠️ 元素為空，跳過更新');
        return;
      }

      if (element.destroyed) {
        console.warn('⚠️ 元素已銷毀，跳過更新');
        return;
      }

      if (!element.active && element.hasOwnProperty('active')) {
        console.warn('⚠️ 元素未激活，跳過更新');
        return;
      }

      // 計算新的縮放比例
      let newScale = this.currentViewport.scale * originalScale;

      // 🔧 詳細的縮放計算調試
      console.log('🔍 縮放計算詳情:', {
        elementId: responsiveElement.id || 'unknown',
        viewportScale: this.currentViewport.scale,
        originalScale: originalScale,
        calculatedScale: newScale,
        constraints: constraints
      });

      // 應用約束
      const beforeConstraints = newScale;
      if (constraints?.minScale) newScale = Math.max(newScale, constraints.minScale);
      if (constraints?.maxScale) newScale = Math.min(newScale, constraints.maxScale);

      if (beforeConstraints !== newScale) {
        console.log('⚙️ 約束已應用:', {
          before: beforeConstraints,
          after: newScale,
          minScale: constraints?.minScale,
          maxScale: constraints?.maxScale
        });
      }

      // 驗證縮放值
      if (!isFinite(newScale) || newScale <= 0) {
        console.warn(`⚠️ 無效的縮放值: ${newScale}，使用預設值 1`);
        newScale = 1;
      }

      // 計算新的位置
      const newX = this.calculateNewPosition(originalX, 'x');
      const newY = this.calculateNewPosition(originalY, 'y');

      // 驗證位置值
      if (!isFinite(newX) || !isFinite(newY)) {
        console.warn(`⚠️ 無效的位置值: (${newX}, ${newY})，跳過更新`);
        return;
      }

      // 根據元素類型應用不同的更新策略
      switch (type) {
        case 'background':
          this.updateBackgroundElement(element, newX, newY, newScale);
          break;
        case 'gameObject':
          this.updateGameObjectElement(element, newX, newY, newScale);
          break;
        case 'ui':
          this.updateUIElement(element, newX, newY, newScale);
          break;
        case 'text':
          this.updateTextElement(element, newX, newY, newScale);
          break;
        default:
          console.warn(`⚠️ 未知的元素類型: ${type}`);
      }

    } catch (error) {
      console.error('❌ 更新單個元素時發生錯誤:', error);
      // 不重新拋出錯誤，避免影響其他元素的更新
    }
  }

  /**
   * 動畫更新單個元素
   */
  private animateSingleElement(responsiveElement: ResponsiveElement): Promise<void> {
    return new Promise((resolve) => {
      const { element } = responsiveElement;
      
      if (!element || !element.active) {
        resolve();
        return;
      }

      // 計算目標值
      const targetScale = this.currentViewport.scale * responsiveElement.originalScale;
      const targetX = this.calculateNewPosition(responsiveElement.originalX, 'x');
      const targetY = this.calculateNewPosition(responsiveElement.originalY, 'y');

      // 創建動畫
      this.scene.tweens.add({
        targets: element,
        x: targetX,
        y: targetY,
        scaleX: targetScale,
        scaleY: targetScale,
        duration: this.config.animationDuration,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }

  /**
   * 計算新位置
   */
  private calculateNewPosition(originalPosition: number, axis: 'x' | 'y'): number {
    const baseSize = axis === 'x' ? this.config.baseWidth : this.config.baseHeight;
    const currentSize = axis === 'x' ? this.currentViewport.width : this.currentViewport.height;
    
    // 按比例縮放位置
    return (originalPosition / baseSize) * currentSize;
  }

  /**
   * 更新背景元素
   */
  private updateBackgroundElement(element: any, x: number, y: number, scale: number): void {
    try {
      if (element.setPosition && typeof element.setPosition === 'function') {
        element.setPosition(x, y);
      } else if (element.x !== undefined && element.y !== undefined) {
        element.x = x;
        element.y = y;
      }

      if (element.setScale && typeof element.setScale === 'function') {
        element.setScale(scale);
      } else if (element.scaleX !== undefined && element.scaleY !== undefined) {
        element.scaleX = scale;
        element.scaleY = scale;
      }

      // TileSprite 特殊處理
      if (element.setSize && typeof element.setSize === 'function' && this.currentViewport.isFullscreen) {
        element.setSize(this.currentViewport.width, this.currentViewport.height);
      }
    } catch (error) {
      console.error('❌ 更新背景元素時發生錯誤:', error);
    }
  }

  /**
   * 更新遊戲物件元素
   */
  private updateGameObjectElement(element: any, x: number, y: number, scale: number): void {
    // 🔧 添加詳細調試信息
    console.log('🎯 更新遊戲物件:', {
      elementType: element.constructor.name,
      currentPosition: { x: element.x, y: element.y },
      currentScale: { x: element.scaleX, y: element.scaleY },
      newPosition: { x, y },
      newScale: scale,
      hasSetPosition: !!element.setPosition,
      hasSetScale: !!element.setScale
    });

    if (element.setPosition) {
      element.setPosition(x, y);
      console.log('✅ 位置已更新:', { x: element.x, y: element.y });
    }

    if (element.setScale) {
      // 🔧 確保等比例縮放，避免變形
      element.setScale(scale, scale);
      console.log('✅ 縮放已更新（等比例）:', { x: element.scaleX, y: element.scaleY });
    }
  }

  /**
   * 更新UI元素
   */
  private updateUIElement(element: any, x: number, y: number, scale: number): void {
    if (element.setPosition) element.setPosition(x, y);
    if (element.setScale) element.setScale(scale);
  }

  /**
   * 更新文字元素
   */
  private updateTextElement(element: any, x: number, y: number, scale: number): void {
    if (element.setPosition) element.setPosition(x, y);
    if (element.setScale) element.setScale(scale);
    
    // 文字大小調整
    if (element.setFontSize) {
      const originalSize = parseInt(element.style.fontSize) || 16;
      const newSize = Math.round(originalSize * scale);
      element.setFontSize(`${newSize}px`);
    }
  }

  /**
   * 設置事件監聽
   */
  private setupEventListeners(): void {
    // 監聽 Phaser 的 resize 事件
    this.scene.scale.on('resize', () => {
      this.updateAllElements(true);
    });

    // 監聽全螢幕變化
    const handleFullscreenChange = () => {
      setTimeout(() => {
        this.updateAllElements(true);
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    console.log('👂 響應式事件監聽器已設置');
  }

  /**
   * 清理無效元素（性能優化）
   */
  private cleanupInvalidElements(): void {
    const invalidElements: string[] = [];
    
    this.elements.forEach((element, id) => {
      if (!element.element || !element.element.active || element.element.destroyed) {
        invalidElements.push(id);
      }
    });
    
    invalidElements.forEach(id => {
      this.elements.delete(id);
      console.log(`🗑️ 清理無效響應式元素: ${id}`);
    });
    
    if (invalidElements.length > 0) {
      console.log(`🧹 清理了 ${invalidElements.length} 個無效元素`);
    }
  }

  /**
   * 定期清理任務
   */
  private startPeriodicCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = window.setInterval(() => {
      this.cleanupInvalidElements();
    }, 30000); // 每30秒清理一次
  }

  /**
   * 獲取當前視窗信息
   */
  public getViewportInfo(): ViewportInfo {
    return { ...this.currentViewport };
  }

  /**
   * 強制更新（用於全螢幕按鈕觸發）
   */
  public forceUpdate(animated: boolean = true): Promise<void> {
    console.log('🔄 強制更新所有響應式元素');

    // 🔧 添加全螢幕專用調試信息
    const currentViewport = this.calculateViewportInfo();
    console.log('📐 當前視窗信息:', {
      width: currentViewport.width,
      height: currentViewport.height,
      scale: currentViewport.scale,
      isFullscreen: currentViewport.isFullscreen,
      deviceType: currentViewport.deviceType,
      orientation: currentViewport.orientation
    });

    console.log('🎯 註冊的元素數量:', this.elements.size);

    return this.updateAllElements(animated);
  }

  /**
   * 獲取性能統計
   */
  public getPerformanceStats() {
    return {
      ...this.performanceMonitor.getStats(),
      elementsCount: this.elements.size,
      currentViewport: this.currentViewport,
      config: this.config
    };
  }

  /**
   * 優化建議檢查
   */
  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const stats = this.performanceMonitor.getStats();

    // 檢查元素數量
    if (this.elements.size > 100) {
      suggestions.push(`元素數量過多 (${this.elements.size})，考慮分組管理`);
    }

    // 檢查更新頻率
    if (stats.avgUpdateTime > 50) {
      suggestions.push(`平均更新時間過長 (${stats.avgUpdateTime.toFixed(2)}ms)，考慮增加防抖間隔`);
    }

    // 檢查記憶體使用
    const memoryTrend = this.getMemoryTrend();
    if (memoryTrend === '上升 ⚠️') {
      suggestions.push('記憶體使用呈上升趨勢，檢查是否有記憶體洩漏');
    }

    // 檢查防抖設置
    if (this.config.throttleMs < 50) {
      suggestions.push('防抖間隔過短，可能影響性能');
    }

    return suggestions;
  }

  /**
   * 獲取記憶體趨勢
   */
  private getMemoryTrend(): string {
    const stats = this.performanceMonitor.getStats();
    const memoryUsage = stats.memoryUsage;

    if (memoryUsage.length < 5) return '數據不足';

    const recent = memoryUsage.slice(-3);
    const older = memoryUsage.slice(-6, -3);

    if (older.length === 0) return '穩定';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 5) return '上升 ⚠️';
    if (diff < -5) return '下降 ✅';
    return '穩定 ✅';
  }

  /**
   * 強制垃圾回收（如果支援）
   */
  public forceGarbageCollection(): void {
    if ((window as any).gc) {
      (window as any).gc();
      console.log('🧹 強制垃圾回收已執行');
    } else {
      console.log('⚠️ 瀏覽器不支援強制垃圾回收');
    }
  }

  /**
   * 銷毀管理器
   */
  public destroy(): void {
    // 清理定時器
    if (this.updateThrottleTimer) {
      clearTimeout(this.updateThrottleTimer);
      this.updateThrottleTimer = null;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // 清理所有元素
    this.elements.clear();
    
    console.log('🧹 響應式管理器已銷毀（包含性能優化清理）');
  }
}

export default ResponsiveManager;
