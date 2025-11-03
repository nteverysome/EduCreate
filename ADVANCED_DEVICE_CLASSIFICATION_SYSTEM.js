/**
 * 高級設備分類系統
 * 綜合使用多種方法進行設備分類
 */

class AdvancedDeviceClassifier {
    constructor() {
        this.profile = this.analyzeDevice();
    }

    /**
     * 完整的設備分析
     */
    analyzeDevice() {
        return {
            // 1. 基礎尺寸信息
            screen: this.getScreenInfo(),
            
            // 2. 像素密度信息
            pixelDensity: this.getPixelDensityInfo(),
            
            // 3. 交互特性
            interaction: this.getInteractionInfo(),
            
            // 4. 性能信息
            performance: this.getPerformanceInfo(),
            
            // 5. 用戶代理信息
            userAgent: this.getUserAgentInfo(),
            
            // 6. 用戶偏好
            preferences: this.getUserPreferences(),
            
            // 7. 綜合分類
            classification: this.classifyDevice()
        };
    }

    /**
     * 1. 獲取屏幕信息
     */
    getScreenInfo() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const diagonal = Math.sqrt(width * width + height * height);
        const area = width * height;
        const aspectRatio = width / height;
        const isPortrait = aspectRatio < 1;

        return {
            width,
            height,
            diagonal: diagonal.toFixed(1),
            area,
            aspectRatio: aspectRatio.toFixed(2),
            isPortrait,
            isLandscape: !isPortrait,
            orientation: isPortrait ? 'portrait' : 'landscape'
        };
    }

    /**
     * 2. 獲取像素密度信息
     */
    getPixelDensityInfo() {
        const dpr = window.devicePixelRatio;
        const dpi = dpr * 96; // 96 是標準 DPI

        return {
            dpr: dpr.toFixed(2),
            dpi: dpi.toFixed(0),
            densityCategory: this.categorizeDensity(dpi),
            isHighDPI: dpi >= 192,
            isRetina: dpr >= 2
        };
    }

    /**
     * 3. 獲取交互特性
     */
    getInteractionInfo() {
        const isTouchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        const supportsHover = window.matchMedia('(hover:hover)').matches;
        const pointerFine = window.matchMedia('(pointer:fine)').matches;
        const pointerCoarse = window.matchMedia('(pointer:coarse)').matches;

        return {
            isTouchDevice,
            supportsHover,
            pointerFine,
            pointerCoarse,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            pointerType: this.detectPointerType()
        };
    }

    /**
     * 4. 獲取性能信息
     */
    getPerformanceInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;

        return {
            networkType: connection?.type || 'unknown',
            effectiveType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 'unknown',
            rtt: connection?.rtt || 'unknown',
            deviceMemory: memory || 'unknown',
            cpuCores: cores || 'unknown',
            performanceCategory: this.categorizePerformance(memory, cores)
        };
    }

    /**
     * 5. 獲取用戶代理信息
     */
    getUserAgentInfo() {
        const ua = navigator.userAgent;

        return {
            userAgent: ua,
            isIPhone: /iPhone/.test(ua),
            isIPad: /iPad/.test(ua),
            isAndroid: /Android/.test(ua),
            isWindows: /Windows/.test(ua),
            isMac: /Macintosh/.test(ua),
            isLinux: /Linux/.test(ua),
            browser: this.detectBrowser(ua),
            os: this.detectOS(ua)
        };
    }

    /**
     * 6. 獲取用戶偏好
     */
    getUserPreferences() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

        return {
            colorScheme: prefersDark ? 'dark' : prefersLight ? 'light' : 'auto',
            prefersReducedMotion,
            prefersReducedData,
            fontSize: this.detectFontSize()
        };
    }

    /**
     * 7. 綜合設備分類
     */
    classifyDevice() {
        const screen = this.profile.screen;
        const interaction = this.profile.interaction;
        const performance = this.profile.performance;

        // 根據寬度和觸摸支持分類
        let deviceType;
        if (screen.width < 768) {
            deviceType = interaction.isTouchDevice ? 'mobile' : 'small-desktop';
        } else if (screen.width < 1024) {
            deviceType = interaction.isTouchDevice ? 'tablet' : 'medium-desktop';
        } else {
            deviceType = 'desktop';
        }

        // 根據性能分類
        let performanceLevel;
        if (performance.deviceMemory >= 8 || performance.cpuCores >= 8) {
            performanceLevel = 'high-end';
        } else if (performance.deviceMemory >= 4 || performance.cpuCores >= 4) {
            performanceLevel = 'mid-range';
        } else {
            performanceLevel = 'low-end';
        }

        // 根據網絡分類
        let networkLevel;
        const effectiveType = performance.effectiveType;
        if (effectiveType === '4g') {
            networkLevel = 'fast';
        } else if (effectiveType === '3g') {
            networkLevel = 'medium';
        } else {
            networkLevel = 'slow';
        }

        return {
            deviceType,
            performanceLevel,
            networkLevel,
            summary: `${deviceType} (${performanceLevel} performance, ${networkLevel} network)`
        };
    }

    /**
     * 輔助方法：分類像素密度
     */
    categorizeDensity(dpi) {
        if (dpi < 100) return 'low';
        if (dpi < 200) return 'medium';
        if (dpi < 300) return 'high';
        return 'ultra-high';
    }

    /**
     * 輔助方法：檢測指針類型
     */
    detectPointerType() {
        if (navigator.maxTouchPoints > 0) return 'touch';
        if (window.matchMedia('(pointer:fine)').matches) return 'mouse';
        if (window.matchMedia('(pointer:coarse)').matches) return 'touch';
        return 'unknown';
    }

    /**
     * 輔助方法：分類性能
     */
    categorizePerformance(memory, cores) {
        if (memory >= 8 || cores >= 8) return 'high-end';
        if (memory >= 4 || cores >= 4) return 'mid-range';
        return 'low-end';
    }

    /**
     * 輔助方法：檢測瀏覽器
     */
    detectBrowser(ua) {
        if (/Chrome/.test(ua)) return 'Chrome';
        if (/Safari/.test(ua)) return 'Safari';
        if (/Firefox/.test(ua)) return 'Firefox';
        if (/Edge/.test(ua)) return 'Edge';
        return 'Unknown';
    }

    /**
     * 輔助方法：檢測操作系統
     */
    detectOS(ua) {
        if (/Windows/.test(ua)) return 'Windows';
        if (/Macintosh/.test(ua)) return 'macOS';
        if (/Linux/.test(ua)) return 'Linux';
        if (/Android/.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
        return 'Unknown';
    }

    /**
     * 輔助方法：檢測字體大小
     */
    detectFontSize() {
        const fontSize = window.getComputedStyle(document.documentElement).fontSize;
        return parseFloat(fontSize);
    }

    /**
     * 獲取完整的設備配置建議
     */
    getRecommendedConfig() {
        const profile = this.profile;
        const config = {};

        // 根據設備類型調整
        if (profile.classification.deviceType === 'mobile') {
            config.buttonSize = 44; // 最小觸摸目標
            config.spacing = 16;
            config.fontSize = 16;
        } else if (profile.classification.deviceType === 'tablet') {
            config.buttonSize = 48;
            config.spacing = 20;
            config.fontSize = 18;
        } else {
            config.buttonSize = 40;
            config.spacing = 24;
            config.fontSize = 14;
        }

        // 根據 DPR 調整
        config.fontSize *= profile.pixelDensity.dpr;

        // 根據性能調整
        if (profile.classification.performanceLevel === 'low-end') {
            config.animationEnabled = false;
            config.imageQuality = 'low';
        } else if (profile.classification.performanceLevel === 'mid-range') {
            config.animationEnabled = true;
            config.imageQuality = 'medium';
        } else {
            config.animationEnabled = true;
            config.imageQuality = 'high';
        }

        // 根據網絡調整
        if (profile.classification.networkLevel === 'slow') {
            config.preloadImages = false;
            config.videoAutoplay = false;
        } else {
            config.preloadImages = true;
            config.videoAutoplay = true;
        }

        // 根據用戶偏好調整
        if (profile.preferences.prefersReducedMotion) {
            config.animationEnabled = false;
        }

        return config;
    }

    /**
     * 打印完整的設備信息
     */
    printProfile() {
        console.log('=== 完整設備分析 ===');
        console.log('屏幕信息:', this.profile.screen);
        console.log('像素密度:', this.profile.pixelDensity);
        console.log('交互特性:', this.profile.interaction);
        console.log('性能信息:', this.profile.performance);
        console.log('用戶代理:', this.profile.userAgent);
        console.log('用戶偏好:', this.profile.preferences);
        console.log('設備分類:', this.profile.classification);
        console.log('推薦配置:', this.getRecommendedConfig());
    }
}

// 使用示例
const classifier = new AdvancedDeviceClassifier();
classifier.printProfile();

// 獲取特定信息
console.log('設備類型:', classifier.profile.classification.deviceType);
console.log('推薦配置:', classifier.getRecommendedConfig());

