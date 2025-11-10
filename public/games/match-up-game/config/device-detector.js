/**
 * 設備檢測系統
 *
 * 統一的設備類型檢測和分類
 * 支持 5 種設備類型：mobile-portrait, mobile-landscape, tablet-portrait, tablet-landscape, desktop
 */

// 防止重複聲明
if (typeof DeviceDetector === 'undefined') {
    class DeviceDetector {
        /**
         * 預定義的斷點
         */
        static BREAKPOINTS = {
            MOBILE_MAX: 600,      // 手機最大寬度
            TABLET_MAX: 1024,     // 平板最大寬度
            TABLET_MIN: 600,      // 平板最小寬度
            LANDSCAPE_HEIGHT: 450 // 橫向模式最大高度
        };

        /**
         * 獲取設備類型
         *
         * @param {number} width - 屏幕寬度
         * @param {number} height - 屏幕高度
         * @returns {string} 設備類型：
         *   - 'mobile-portrait': 手機直向
         *   - 'mobile-landscape': 手機橫向
         *   - 'tablet-portrait': 平板直向
         *   - 'tablet-landscape': 平板橫向
         *   - 'desktop': 桌面
         */
        static getDeviceType(width, height) {
            const isPortrait = width < height;
            const isLandscape = width > height;
            const aspectRatio = width / height;

            // 檢測是否為橫向模式（寬度 > 高度 且 高度 < 450）
            if (isLandscape && height < this.BREAKPOINTS.LANDSCAPE_HEIGHT) {
                return 'mobile-landscape';
            }

            // 檢測設備類型
            if (width < this.BREAKPOINTS.MOBILE_MAX) {
                // 手機
                return isPortrait ? 'mobile-portrait' : 'mobile-landscape';
            } else if (width <= this.BREAKPOINTS.TABLET_MAX) {
                // 平板（包括邊界情況 1024×768）
                return isPortrait ? 'tablet-portrait' : 'tablet-landscape';
            } else {
                // 桌面
                return 'desktop';
            }
        }

        /**
         * 獲取屏幕尺寸分類
         *
         * @param {number} height - 屏幕高度
         * @returns {string} 尺寸分類：'small', 'medium', 'large'
         */
        static getScreenSize(height) {
            if (height < 600) {
                return 'small';
            } else if (height < 800) {
                return 'medium';
            } else {
                return 'large';
            }
        }

        /**
         * 檢測是否為 iPad
         *
         * @param {number} width - 屏幕寬度
         * @param {number} height - 屏幕高度
         * @returns {boolean} 是否為 iPad
         */
        static isIPad(width, height) {
            // iPad 的特徵：寬度 768-1024，高度 600+
            const isDesktopXGA = width === 1024 && height === 768;  // 排除舊 XGA 標準
            const isRealTablet = width >= 768 && width <= 1024 && height >= 600 && !isDesktopXGA;
            return isRealTablet;
        }

        /**
         * 檢測是否為手機橫向模式
         *
         * @param {number} width - 屏幕寬度
         * @param {number} height - 屏幕高度
         * @returns {boolean} 是否為手機橫向模式
         */
        static isLandscapeMobile(width, height) {
            return width > height && height < this.BREAKPOINTS.LANDSCAPE_HEIGHT;
        }

        /**
         * 檢測是否為小容器
         *
         * @param {number} height - 屏幕高度
         * @returns {boolean} 是否為小容器
         */
        static isSmallContainer(height) {
            return height < 600;
        }

        /**
         * 檢測是否為中等容器
         *
         * @param {number} height - 屏幕高度
         * @returns {boolean} 是否為中等容器
         */
        static isMediumContainer(height) {
            return height >= 600 && height < 800;
        }

        /**
         * 檢測是否為大容器
         *
         * @param {number} height - 屏幕高度
         * @returns {boolean} 是否為大容器
         */
        static isLargeContainer(height) {
            return height >= 800;
        }

        /**
         * 獲取設備信息（調試用）
         *
         * @param {number} width - 屏幕寬度
         * @param {number} height - 屏幕高度
         * @returns {object} 設備信息
         */
        static getDeviceInfo(width, height) {
            const deviceType = this.getDeviceType(width, height);
            const screenSize = this.getScreenSize(height);
            const isIPad = this.isIPad(width, height);
            const isLandscapeMobile = this.isLandscapeMobile(width, height);
            const isSmallContainer = this.isSmallContainer(height);
            const isMediumContainer = this.isMediumContainer(height);
            const isLargeContainer = this.isLargeContainer(height);

            return {
                width,
                height,
                aspectRatio: (width / height).toFixed(2),
                deviceType,
                screenSize,
                isIPad,
                isLandscapeMobile,
                isSmallContainer,
                isMediumContainer,
                isLargeContainer
            };
        }
    }

    // 導出到全局作用域
    if (typeof window !== 'undefined') {
        window.DeviceDetector = DeviceDetector;
    }

    // 導出到 Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DeviceDetector;
    }
}

