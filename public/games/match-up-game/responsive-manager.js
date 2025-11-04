/**
 * 響應式管理系統 - 完整的設備檢測、邊界檢查、防抖/節流機制
 * 版本：v1.0
 * 
 * 功能：
 * 1. 多維度設備檢測（寬度、高度、比例）
 * 2. 邊界檢查和驗證
 * 3. 防抖和節流機制
 * 4. 詳細的日誌系統
 * 5. 性能監控
 */

class DeviceDetector {
    /**
     * 多維度設備檢測
     * @param {number} width - 螢幕寬度
     * @param {number} height - 螢幕高度
     * @returns {Object} 設備信息
     */
    static detect(width, height) {
        const aspectRatio = width / height;
        
        // 特殊情況優先（邊界情況）
        if (width === 1024 && height === 768) {
            return {
                type: 'DESKTOP_XGA',
                category: 'desktop',
                name: 'XGA 桌面',
                aspectRatio: aspectRatio.toFixed(2),
                isSpecialCase: true
            };
        }
        
        // 多維度檢測
        if (width < 768) {
            return {
                type: 'MOBILE',
                category: 'mobile',
                name: '手機',
                aspectRatio: aspectRatio.toFixed(2),
                isSpecialCase: false
            };
        }
        
        if (width >= 768 && width <= 1024 && height >= 600) {
            return {
                type: 'TABLET',
                category: 'tablet',
                name: '平板',
                aspectRatio: aspectRatio.toFixed(2),
                isSpecialCase: false
            };
        }
        
        if (width > 1024) {
            return {
                type: 'DESKTOP',
                category: 'desktop',
                name: '桌面',
                aspectRatio: aspectRatio.toFixed(2),
                isSpecialCase: false
            };
        }
        
        return {
            type: 'UNKNOWN',
            category: 'unknown',
            name: '未知',
            aspectRatio: aspectRatio.toFixed(2),
            isSpecialCase: false
        };
    }
    
    /**
     * 獲取設備的佈局配置
     */
    static getLayoutConfig(device) {
        const configs = {
            'MOBILE': {
                layout: 'single-column',
                cardWidthPercent: 0.8,
                cardHeightPercent: 0.15,
                spacing: 10,
                maxCards: 5
            },
            'TABLET': {
                layout: 'two-column',
                cardWidthPercent: 0.4,
                cardHeightPercent: 0.12,
                spacing: 15,
                maxCards: 10
            },
            'DESKTOP': {
                layout: 'two-column',
                cardWidthPercent: 0.35,
                cardHeightPercent: 0.1,
                spacing: 20,
                maxCards: 20
            },
            'DESKTOP_XGA': {
                layout: 'two-column',
                cardWidthPercent: 0.35,
                cardHeightPercent: 0.1,
                spacing: 20,
                maxCards: 20
            }
        };
        
        return configs[device.type] || configs['UNKNOWN'];
    }
}

class ResponsiveValidator {
    /**
     * 驗證螢幕尺寸
     */
    static validateDimensions(width, height) {
        const errors = [];
        
        if (width < 320) {
            errors.push(`寬度過小: ${width}px < 320px`);
        }
        
        if (height < 270) {
            errors.push(`高度過小: ${height}px < 270px`);
        }
        
        if (width > 1920) {
            errors.push(`寬度過大: ${width}px > 1920px`);
        }
        
        if (height > 1080) {
            errors.push(`高度過大: ${height}px > 1080px`);
        }
        
        if (errors.length > 0) {
            throw new Error(`螢幕尺寸驗證失敗: ${errors.join(', ')}`);
        }
        
        return true;
    }
    
    /**
     * 驗證卡片尺寸
     */
    static validateCardDimensions(cardWidth, cardHeight, containerWidth) {
        const maxCardWidth = (containerWidth - 60) * 0.45;
        
        if (cardWidth > maxCardWidth) {
            console.warn(`⚠️ 卡片寬度過大: ${cardWidth.toFixed(1)}px > ${maxCardWidth.toFixed(1)}px`);
            return Math.min(cardWidth, maxCardWidth);
        }
        
        if (cardWidth < 100) {
            console.warn(`⚠️ 卡片寬度過小: ${cardWidth.toFixed(1)}px < 100px`);
            return 100;
        }
        
        return cardWidth;
    }
    
    /**
     * 驗證卡片位置
     */
    static validateCardPosition(x, y, cardWidth, cardHeight, containerWidth, containerHeight) {
        const errors = [];
        
        if (x - cardWidth / 2 < 0) {
            errors.push(`卡片超出左邊界: x=${x}, cardWidth=${cardWidth}`);
        }
        
        if (x + cardWidth / 2 > containerWidth) {
            errors.push(`卡片超出右邊界: x=${x}, cardWidth=${cardWidth}, containerWidth=${containerWidth}`);
        }
        
        if (y - cardHeight / 2 < 0) {
            errors.push(`卡片超出上邊界: y=${y}, cardHeight=${cardHeight}`);
        }
        
        if (y + cardHeight / 2 > containerHeight) {
            errors.push(`卡片超出下邊界: y=${y}, cardHeight=${cardHeight}, containerHeight=${containerHeight}`);
        }
        
        if (errors.length > 0) {
            console.warn(`⚠️ 卡片位置驗證警告: ${errors.join(', ')}`);
        }
        
        return true;
    }
}

class ResponsiveLogger {
    /**
     * 詳細的日誌系統
     */
    static log(level, category, message, data = {}) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${category}]`;
        
        const logData = {
            timestamp,
            category,
            message,
            data,
            level
        };
        
        // 存儲日誌到全局對象
        if (!window.responsiveDebugLogs) {
            window.responsiveDebugLogs = [];
        }
        window.responsiveDebugLogs.push(logData);
        
        // 限制日誌數量
        if (window.responsiveDebugLogs.length > 1000) {
            window.responsiveDebugLogs.shift();
        }
        
        // 輸出到控制台
        switch (level) {
            case 'error':
                console.error(`${prefix} ❌ ${message}`, data);
                break;
            case 'warn':
                console.warn(`${prefix} ⚠️ ${message}`, data);
                break;
            case 'info':
                console.info(`${prefix} ℹ️ ${message}`, data);
                break;
            case 'debug':
                console.log(`${prefix} 🔍 ${message}`, data);
                break;
        }
    }
    
    /**
     * 獲取所有日誌
     */
    static getLogs(filter = {}) {
        if (!window.responsiveDebugLogs) return [];
        
        let logs = window.responsiveDebugLogs;
        
        if (filter.level) {
            logs = logs.filter(l => l.level === filter.level);
        }
        
        if (filter.category) {
            logs = logs.filter(l => l.category === filter.category);
        }
        
        return logs;
    }
    
    /**
     * 清除日誌
     */
    static clearLogs() {
        window.responsiveDebugLogs = [];
    }
}

class ResponsiveManager {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            debounceMs: 300,
            throttleMs: 100,
            animationDuration: 300,
            enableLogging: true,
            ...config
        };
        
        this.resizeTimer = null;
        this.lastUpdateTime = 0;
        this.currentDevice = null;
        this.updateCount = 0;
        this.errorCount = 0;
        
        ResponsiveLogger.log('info', 'ResponsiveManager', '初始化完成', this.config);
    }
    
    /**
     * 防抖：等待用戶停止調整後再更新
     */
    onResize(width, height) {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        
        ResponsiveLogger.log('debug', 'ResponsiveManager', '檢測到 resize 事件', { width, height });
        
        this.resizeTimer = setTimeout(() => {
            this.updateLayout(width, height);
        }, this.config.debounceMs);
    }
    
    /**
     * 節流：限制更新頻率
     */
    updateLayout(width, height) {
        const now = Date.now();
        if (now - this.lastUpdateTime < this.config.throttleMs) {
            ResponsiveLogger.log('debug', 'ResponsiveManager', '節流：跳過更新', { 
                timeSinceLastUpdate: now - this.lastUpdateTime 
            });
            return;
        }
        
        this.lastUpdateTime = now;
        this.updateCount++;
        
        try {
            // 驗證尺寸
            ResponsiveValidator.validateDimensions(width, height);
            
            // 檢測設備
            const device = DeviceDetector.detect(width, height);
            
            // 檢查是否需要更新
            if (this.currentDevice?.type === device.type) {
                ResponsiveLogger.log('debug', 'ResponsiveManager', '設備類型未變，跳過更新', { 
                    device: device.type 
                });
                return;
            }
            
            ResponsiveLogger.log('info', 'ResponsiveManager', '設備類型變化', {
                oldDevice: this.currentDevice?.type,
                newDevice: device.type,
                updateCount: this.updateCount
            });
            
            this.currentDevice = device;
            
            if (this.scene && this.scene.updateLayout) {
                this.scene.updateLayout();
            }
            
        } catch (error) {
            this.errorCount++;
            ResponsiveLogger.log('error', 'ResponsiveManager', '佈局更新失敗', {
                error: error.message,
                errorCount: this.errorCount
            });
        }
    }
    
    /**
     * 獲取統計信息
     */
    getStats() {
        return {
            updateCount: this.updateCount,
            errorCount: this.errorCount,
            currentDevice: this.currentDevice,
            config: this.config
        };
    }
}

// 暴露到全局
window.DeviceDetector = DeviceDetector;
window.ResponsiveValidator = ResponsiveValidator;
window.ResponsiveLogger = ResponsiveLogger;
window.ResponsiveManager = ResponsiveManager;

