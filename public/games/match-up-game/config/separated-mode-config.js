/**
 * 分離模式配置系統
 *
 * 統一管理分離模式的所有配置參數
 * 支持 5 種設備類型：mobile-portrait, mobile-landscape, tablet-portrait, tablet-landscape, desktop
 */

// 防止重複聲明
if (typeof SeparatedModeConfig === 'undefined') {
    class SeparatedModeConfig {
        /**
         * 設備類型配置
         *
         * 每個設備類型包含：
         * - cardWidth: 卡片寬度配置 { min, max, ratio }
         * - cardHeight: 卡片高度配置 { min, max, ratio }
         * - positions: 位置配置 { leftX, rightX, leftStartY, rightStartY }
         * - spacing: 間距配置 { horizontal, vertical }
         * - margins: 邊距配置 { top, bottom, left, right }
         */
        static CONFIG = {
            'mobile-portrait': {
                // 卡片尺寸配置 - 優化：增加卡片尺寸以更好利用空間
                cardWidth: { min: 120, max: 200, ratio: 0.20 },
                cardHeight: { min: 40, max: 65, ratio: 0.10 },

                // 位置配置（左右分離 - 單列）
                positions: {
                    leftX: 0.42,
                    rightX: 0.68,
                    leftStartY: 0.18,  // 優化：減少頂部邊距
                    rightStartY: 0.15
                },

                // 間距配置 - 優化：減少間距以容納更多卡片
                spacing: {
                    horizontal: 8,
                    vertical: 3
                },

                // 邊距配置 - 優化：減少邊距以增加可用空間
                margins: {
                    top: 20,
                    bottom: 20,
                    left: 12,
                    right: 12
                },

                // 容器檢測
                isSmallContainer: true,
                isMediumContainer: false,
                isLargeContainer: false
            },

            'mobile-landscape': {
                // 卡片尺寸配置（超緊湊）
                cardWidth: { min: 100, max: 150, ratio: 0.15 },
                cardHeight: { min: 28, max: 40, ratio: 0.08 },

                // 位置配置（左右分離 - 單列）
                positions: {
                    leftX: 0.38,
                    rightX: 0.70,
                    leftStartY: 0.15,
                    rightStartY: 0.12
                },

                // 間距配置
                spacing: {
                    horizontal: 8,
                    vertical: 3
                },

                // 邊距配置
                margins: {
                    top: 20,
                    bottom: 20,
                    left: 10,
                    right: 10
                },

                // 容器檢測
                isSmallContainer: false,
                isMediumContainer: false,
                isLargeContainer: false,
                isLandscapeMobile: true
            },

            'tablet-portrait': {
                // 卡片尺寸配置 - 優化：增加卡片尺寸
                cardWidth: { min: 140, max: 240, ratio: 0.21 },
                cardHeight: { min: 45, max: 75, ratio: 0.11 },

                // 位置配置（左右分離 - 單列）
                positions: {
                    leftX: 0.44,
                    rightX: 0.66,
                    leftStartY: 0.22,  // 優化：減少頂部邊距
                    rightStartY: 0.19
                },

                // 間距配置 - 優化：減少間距
                spacing: {
                    horizontal: 10,
                    vertical: 5
                },

                // 邊距配置 - 優化：減少邊距
                margins: {
                    top: 30,
                    bottom: 30,
                    left: 15,
                    right: 15
                },

                // 容器檢測
                isSmallContainer: false,
                isMediumContainer: true,
                isLargeContainer: false
            },

            'tablet-landscape': {
                // 卡片尺寸配置 - 優化：增加卡片尺寸
                cardWidth: { min: 150, max: 260, ratio: 0.22 },
                cardHeight: { min: 50, max: 85, ratio: 0.11 },

                // 位置配置（左右分離 - 單列）
                positions: {
                    leftX: 0.40,
                    rightX: 0.65,
                    leftStartY: 0.18,  // 優化：減少頂部邊距
                    rightStartY: 0.15
                },

                // 間距配置 - 優化：減少間距
                spacing: {
                    horizontal: 12,
                    vertical: 6
                },

                // 邊距配置 - 優化：減少邊距
                margins: {
                    top: 35,
                    bottom: 35,
                    left: 20,
                    right: 20
                },

                // 容器檢測
                isSmallContainer: false,
                isMediumContainer: false,
                isLargeContainer: true
            },

            'desktop': {
                // 卡片尺寸配置 - 優化：增加卡片尺寸
                cardWidth: { min: 160, max: 300, ratio: 0.24 },
                cardHeight: { min: 55, max: 95, ratio: 0.13 },

                // 位置配置（左右分離 - 單列）
                positions: {
                    leftX: 0.35,
                    rightX: 0.70,
                    leftStartY: 0.15,  // 優化：減少頂部邊距
                    rightStartY: 0.12
                },

                // 間距配置 - 優化：減少間距
                spacing: {
                    horizontal: 16,
                    vertical: 10
                },

                // 邊距配置 - 優化：減少邊距
                margins: {
                    top: 45,
                    bottom: 45,
                    left: 25,
                    right: 25
                },

                // 容器檢測
                isSmallContainer: false,
                isMediumContainer: false,
                isLargeContainer: true
            }
        };

        /**
         * 獲取指定設備類型的配置
         * @param {string} deviceType - 設備類型
         * @returns {object} 配置對象
         */
        static get(deviceType) {
            return this.CONFIG[deviceType] || this.CONFIG['mobile-portrait'];
        }

        /**
         * 計算卡片尺寸
         * @param {number} width - 容器寬度
     * @param {number} height - 容器高度
     * @param {string} deviceType - 設備類型
     * @returns {object} { width, height }
     */
    static calculateCardSize(width, height, deviceType) {
        const config = this.get(deviceType);
        const cardWidthConfig = config.cardWidth;
        const cardHeightConfig = config.cardHeight;
        
        const calculatedWidth = Math.max(
            cardWidthConfig.min,
            Math.min(cardWidthConfig.max, width * cardWidthConfig.ratio)
        );
        
        const calculatedHeight = Math.max(
            cardHeightConfig.min,
            Math.min(cardHeightConfig.max, height * cardHeightConfig.ratio)
        );
        
        return {
            width: calculatedWidth,
            height: calculatedHeight
        };
    }
    
    /**
     * 計算位置
     * @param {number} width - 容器寬度
     * @param {number} height - 容器高度
     * @param {string} deviceType - 設備類型
     * @returns {object} { leftX, rightX, leftStartY, rightStartY }
     */
    static calculatePositions(width, height, deviceType) {
        const config = this.get(deviceType);
        const positions = config.positions;
        
        return {
            leftX: width * positions.leftX,
            rightX: width * positions.rightX,
            leftStartY: height * positions.leftStartY,
            rightStartY: height * positions.rightStartY
        };
    }
    
    /**
     * 計算間距
     * @param {number} height - 容器高度
     * @param {string} deviceType - 設備類型
     * @returns {object} { horizontal, vertical }
     */
    static calculateSpacing(height, deviceType) {
        const config = this.get(deviceType);
        const spacing = config.spacing;
        
        return {
            horizontal: Math.max(spacing.horizontal, height * 0.01),
            vertical: Math.max(spacing.vertical, height * 0.008)
        };
    }
    
    /**
     * 計算邊距
     * @param {string} deviceType - 設備類型
     * @returns {object} { top, bottom, left, right }
     */
    static getMargins(deviceType) {
        const config = this.get(deviceType);
        return config.margins;
    }
    }

    // 導出到全局作用域
    if (typeof window !== 'undefined') {
        window.SeparatedModeConfig = SeparatedModeConfig;
    }

    // 導出到 Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SeparatedModeConfig;
    }
}

