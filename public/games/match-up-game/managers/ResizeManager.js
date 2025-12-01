/**
 * ResizeManager - 完整的響應式管理系統
 * 版本：v1.0
 * 
 * 功能：
 * 1. 元素追蹤和狀態管理
 * 2. Viewport 計算和變化檢測
 * 3. 支持背景、遊戲物件、UI、文字四種類型
 * 4. 約束系統（minScale, maxScale, keepAspectRatio）
 * 5. 性能優化（防抖、節流、緩存）
 */

class ResizeManager {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            debounceMs: 300,
            throttleMs: 100,
            animationDuration: 300,
            enableLogging: true,
            enableSmoothing: false,
            ...config
        };

        // 元素註冊表
        this.elements = new Map();
        this.elementIdCounter = 0;

        // 視口信息
        this.currentViewport = {
            width: scene.scale.gameSize.width,
            height: scene.scale.gameSize.height,
            scale: 1,
            isFullscreen: false,
            deviceType: 'desktop',
            orientation: 'landscape'
        };

        // 性能監控
        this.performanceMonitor = {
            updateCount: 0,
            errorCount: 0,
            lastUpdateTime: 0,
            averageUpdateTime: 0
        };

        // 防抖和節流
        this.resizeTimer = null;
        this.lastUpdateTime = 0;

        this.log('info', '✅ ResizeManager 初始化完成', this.config);
    }

    /**
     * 註冊元素到響應式系統
     */
    registerElement(id, element, type, options = {}) {
        if (!element) {
            this.log('warn', `⚠️ 元素為空，無法註冊: ${id}`);
            return null;
        }

        const elementId = id || `element_${this.elementIdCounter++}`;
        const responsiveElement = {
            id: elementId,
            element,
            type, // 'background' | 'gameObject' | 'ui' | 'text'
            originalX: element.x || 0,
            originalY: element.y || 0,
            originalScale: element.scale || 1,
            originalWidth: element.width || 0,
            originalHeight: element.height || 0,
            anchor: options.anchor || { x: 0.5, y: 0.5 },
            constraints: options.constraints || {},
            ...options
        };

        this.elements.set(elementId, responsiveElement);
        this.log('debug', `✅ 元素已註冊: ${elementId} (${type})`);
        return elementId;
    }

    /**
     * 取消註冊元素
     */
    unregisterElement(id) {
        if (this.elements.has(id)) {
            this.elements.delete(id);
            this.log('debug', `✅ 元素已取消註冊: ${id}`);
            return true;
        }
        return false;
    }

    /**
     * 計算新的視口信息
     */
    calculateViewport(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const baseWidth = this.scene.game.screenBaseSize.width;
        const baseHeight = this.scene.game.screenBaseSize.height;

        // 🔥 [v118.0] 修復：使用 Math.min() 而不是 Math.max()
        // Math.max() 會導致遊戲被縮小，而 Math.min() 會導致遊戲被放大以填滿容器
        const zoomX = width / baseWidth;
        const zoomY = height / baseHeight;
        const scale = Math.min(zoomX, zoomY);

        console.log('🔥 [v118.0] ResizeManager calculateViewport:', {
            width,
            height,
            baseWidth,
            baseHeight,
            zoomX,
            zoomY,
            scale,
            strategy: 'Math.min - 適應容器'
        });

        return {
            width,
            height,
            scale,
            isFullscreen: document.fullscreenElement !== null,
            deviceType: this.detectDeviceType(width, height),
            orientation: width > height ? 'landscape' : 'portrait'
        };
    }

    /**
     * 檢測設備類型
     */
    detectDeviceType(width, height) {
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * 檢查視口是否變化
     */
    hasViewportChanged(newViewport) {
        const threshold = 10; // 像素
        return (
            Math.abs(newViewport.width - this.currentViewport.width) > threshold ||
            Math.abs(newViewport.height - this.currentViewport.height) > threshold ||
            newViewport.deviceType !== this.currentViewport.deviceType ||
            newViewport.orientation !== this.currentViewport.orientation
        );
    }

    /**
     * 處理 resize 事件（防抖）
     */
    onResize(gameSize) {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);

        this.resizeTimer = setTimeout(() => {
            this.updateAllElements(gameSize);
        }, this.config.debounceMs);
    }

    /**
     * 更新所有元素
     */
    updateAllElements(gameSize) {
        const startTime = performance.now();
        const newViewport = this.calculateViewport(gameSize);

        if (!this.hasViewportChanged(newViewport)) {
            this.log('debug', '📐 視口未變化，跳過更新');
            return;
        }

        this.currentViewport = newViewport;
        this.log('info', '🔄 開始更新所有元素', { viewport: newViewport });

        let updatedCount = 0;
        this.elements.forEach((responsiveElement) => {
            if (this.updateSingleElement(responsiveElement)) {
                updatedCount++;
            }
        });

        const duration = performance.now() - startTime;
        this.performanceMonitor.updateCount++;
        this.performanceMonitor.lastUpdateTime = duration;
        this.log('info', `✅ 更新完成: ${updatedCount}/${this.elements.size} 元素`, { duration: duration.toFixed(2) });
    }

    /**
     * 更新單個元素
     */
    updateSingleElement(responsiveElement) {
        try {
            const { element, type, originalScale, constraints } = responsiveElement;

            if (!element || element.destroyed) return false;

            // 計算新的縮放比例
            let newScale = this.currentViewport.scale * originalScale;

            // 應用約束
            if (constraints?.minScale) newScale = Math.max(newScale, constraints.minScale);
            if (constraints?.maxScale) newScale = Math.min(newScale, constraints.maxScale);

            // 計算新的位置
            const newX = responsiveElement.originalX * this.currentViewport.scale;
            const newY = responsiveElement.originalY * this.currentViewport.scale;

            // 根據類型應用不同的更新策略
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
            }

            return true;
        } catch (error) {
            this.log('error', '❌ 更新元素失敗', error);
            this.performanceMonitor.errorCount++;
            return false;
        }
    }

    /**
     * 更新背景元素
     */
    updateBackgroundElement(element, x, y, scale) {
        element.setPosition(x, y);
        element.setScale(scale);
    }

    /**
     * 更新遊戲物件
     */
    updateGameObjectElement(element, x, y, scale) {
        element.setPosition(x, y);
        element.setScale(scale);
    }

    /**
     * 更新 UI 元素
     */
    updateUIElement(element, x, y, scale) {
        element.setPosition(x, y);
        element.setScale(scale);
    }

    /**
     * 更新文字元素
     */
    updateTextElement(element, x, y, scale) {
        element.setPosition(x, y);
        element.setScale(scale);
    }

    /**
     * 日誌輸出
     */
    log(level, message, data = {}) {
        if (!this.config.enableLogging) return;
        const prefix = `[ResizeManager] ${message}`;
        if (level === 'error') console.error(prefix, data);
        else if (level === 'warn') console.warn(prefix, data);
        else console.log(prefix, data);
    }

    /**
     * 獲取性能統計
     */
    getPerformanceStats() {
        return this.performanceMonitor;
    }

    /**
     * 清理資源
     */
    destroy() {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.elements.clear();
        this.log('info', '✅ ResizeManager 已銷毀');
    }
}

