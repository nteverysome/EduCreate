/**
 * 分離模式佈局計算器
 *
 * 統一的佈局計算邏輯
 * 支持左右分離、上下分離等多種佈局
 */

// 防止重複聲明
if (typeof SeparatedLayoutCalculator === 'undefined') {
    class SeparatedLayoutCalculator {
        /**
         * 構造函數
         *
         * @param {number} width - 容器寬度
         * @param {number} height - 容器高度
         * @param {number} itemCount - 卡片數量
         * @param {string} layoutType - 佈局類型（'left-right' 或 'top-bottom'）
         */
        constructor(width, height, itemCount, layoutType = 'left-right') {
            this.width = width;
            this.height = height;
            this.itemCount = itemCount;
            this.layoutType = layoutType;

            // 獲取設備類型和配置
            // 備用方案：如果 DeviceDetector 不可用，使用內聯邏輯
            if (typeof DeviceDetector !== 'undefined' && DeviceDetector.getDeviceType) {
                this.deviceType = DeviceDetector.getDeviceType(width, height);
            } else {
                // 備用設備檢測邏輯
                const isPortrait = height >= width;
                if (width <= 600) {
                    this.deviceType = isPortrait ? 'mobile-portrait' : 'mobile-landscape';
                } else if (width <= 1024) {
                    this.deviceType = isPortrait ? 'tablet-portrait' : 'tablet-landscape';
                } else {
                    this.deviceType = 'desktop';
                }
            }

            // 備用方案：如果 SeparatedModeConfig 不可用，使用簡單配置
            if (typeof SeparatedModeConfig !== 'undefined' && SeparatedModeConfig.get) {
                this.config = SeparatedModeConfig.get(this.deviceType);
            } else {
                // 簡單的備用配置
                this.config = {
                    cardWidth: { min: 120, max: 250, ratio: 0.2 },
                    cardHeight: { min: 40, max: 80, ratio: 0.1 },
                    positions: { leftX: 0.3, rightX: 0.7, leftStartY: 0.2, rightStartY: 0.2 },
                    spacing: { horizontal: 15, vertical: 10 },
                    margins: { top: 30, bottom: 30, left: 15, right: 15 }
                };
            }

            // 備用方案：如果 CalculationConstants 不可用，使用簡單常量
            if (typeof CalculationConstants !== 'undefined') {
                this.constants = CalculationConstants;
            } else {
                this.constants = {
                    CARD_SIZE: { MIN: 40, MAX: 300 },
                    SPACING: { MIN: 5, MAX: 30 },
                    MARGINS: { MIN: 10, MAX: 50 }
                };
            }
        }

        /**
         * 計算卡片尺寸
         *
         * @returns {object} { width, height }
         */
        calculateCardSize() {
            return SeparatedModeConfig.calculateCardSize(
                this.width,
                this.height,
                this.deviceType
            );
        }

        /**
         * 計算位置
         *
         * @returns {object} { leftX, rightX, leftStartY, rightStartY }
         */
        calculatePositions() {
            return SeparatedModeConfig.calculatePositions(
                this.width,
                this.height,
                this.deviceType
            );
        }

        /**
         * 計算間距
         *
         * @returns {object} { horizontal, vertical }
         */
        calculateSpacing() {
            return SeparatedModeConfig.calculateSpacing(
                this.height,
                this.deviceType
            );
        }

        /**
         * 計算邊距
         *
         * @returns {object} { top, bottom, left, right }
         */
        getMargins() {
            return SeparatedModeConfig.getMargins(this.deviceType);
        }

        /**
         * 計算字體大小
         *
         * @param {number} cardHeight - 卡片高度
         * @param {string} text - 文字內容
         * @returns {number} 字體大小
         */
        calculateFontSize(cardHeight, text = '') {
            // 基礎字體大小
            let fontSize = cardHeight * this.constants.FONT_SIZE.BASE_RATIO;

            // 根據文字長度調整
            const textLength = text ? text.length : 0;
            if (textLength > this.constants.FONT_SIZE.LONG_TEXT_LENGTH) {
                fontSize *= this.constants.FONT_SIZE.LONG_TEXT_RATIO;
            } else if (textLength > this.constants.FONT_SIZE.MEDIUM_TEXT_LENGTH) {
                fontSize *= this.constants.FONT_SIZE.MEDIUM_TEXT_RATIO;
            }

            // 限制在最小和最大值之間
            return Math.max(
                this.constants.FONT_SIZE.MIN,
                Math.min(this.constants.FONT_SIZE.MAX, fontSize)
            );
        }

        /**
         * 確定佈局變體
         *
         * @returns {string} 佈局變體：
         *   - 'single-column': 單列（3-5 個卡片）
         *   - 'multi-rows': 多行（6-20 個卡片）
         *   - 'multi-columns': 多列（21+ 個卡片）
         */
        getLayoutVariant() {
            if (this.itemCount <= 5) {
                return 'single-column';
            } else if (this.itemCount <= 20) {
                return 'multi-rows';
            } else {
                return 'multi-columns';
            }
        }

        /**
         * 計算列數
         *
         * @param {boolean} hasImages - 是否有圖片
         * @returns {number} 列數
         */
        calculateColumns(hasImages = false) {
            if (hasImages) {
                // 正方形模式（有圖片）
                return this.constants.COLUMNS.SQUARE_MODE_COLS;
            } else {
                // 長方形模式（無圖片）
                return this.constants.COLUMNS.RECTANGLE_MODE_COLS;
            }
        }

        /**
         * 計算行數
         *
         * @param {number} columns - 列數
         * @returns {number} 行數
         */
        calculateRows(columns) {
            return Math.ceil(this.itemCount / columns);
        }

        /**
         * 計算內容模式
         *
         * @param {boolean} hasImages - 是否有圖片
         * @returns {string} 內容模式：'square' 或 'rectangle'
         */
        getContentMode(hasImages = false) {
            return hasImages ?
                this.constants.CONTENT_MODE.SQUARE :
                this.constants.CONTENT_MODE.RECTANGLE;
        }

        /**
         * 計算可用高度
         *
         * @returns {number} 可用高度
         */
        calculateAvailableHeight() {
            const margins = this.getMargins();
            return this.height - margins.top - margins.bottom;
        }

        /**
         * 計算可用寬度
         *
         * @returns {number} 可用寬度
         */
        calculateAvailableWidth() {
            const margins = this.getMargins();
            return this.width - margins.left - margins.right;
        }

        /**
         * 計算左右分離 - 單列的卡片間距
         *
         * @param {number} cardHeight - 卡片高度
         * @returns {object} { leftSpacing, rightSpacing }
         */
        calculateSingleColumnSpacing(cardHeight) {
            const availableHeight = this.calculateAvailableHeight();
            const maxSpacing = (availableHeight - cardHeight * this.itemCount) / (this.itemCount - 1);

            const spacing = this.calculateSpacing();

            return {
                leftSpacing: Math.max(
                    spacing.vertical,
                    Math.min(maxSpacing, cardHeight + spacing.vertical)
                ),
                rightSpacing: Math.max(
                    spacing.vertical,
                    Math.min(maxSpacing, cardHeight + spacing.vertical * 2)
                )
            };
        }

        /**
         * 計算多行佈局的卡片尺寸
         *
         * @param {number} columns - 列數
         * @param {number} rows - 行數
         * @returns {object} { cardWidth, cardHeight }
         */
        calculateMultiRowCardSize(columns, rows) {
            const spacing = this.calculateSpacing();
            const availableWidth = this.calculateAvailableWidth();
            const availableHeight = this.calculateAvailableHeight();

            // 計算卡片寬度
            const totalHorizontalSpacing = (columns - 1) * spacing.horizontal;
            const cardWidth = (availableWidth - totalHorizontalSpacing) / columns;

            // 計算卡片高度
            const totalVerticalSpacing = (rows - 1) * spacing.vertical;
            const cardHeight = (availableHeight - totalVerticalSpacing) / rows;

            return {
                width: Math.max(
                    this.constants.CARD_SIZE.MIN_WIDTH,
                    Math.min(this.constants.CARD_SIZE.MAX_WIDTH, cardWidth)
                ),
                height: Math.max(
                    this.constants.CARD_SIZE.MIN_HEIGHT,
                    Math.min(this.constants.CARD_SIZE.MAX_HEIGHT, cardHeight)
                )
            };
        }

        /**
         * 獲取完整的計算結果
         *
         * @param {boolean} hasImages - 是否有圖片
         * @returns {object} 完整的計算結果
         */
        getFullCalculation(hasImages = false) {
            const variant = this.getLayoutVariant();
            const cardSize = this.calculateCardSize();
            const positions = this.calculatePositions();
            const spacing = this.calculateSpacing();
            const margins = this.getMargins();
            const columns = this.calculateColumns(hasImages);
            const rows = this.calculateRows(columns);
            const contentMode = this.getContentMode(hasImages);

            return {
                deviceType: this.deviceType,
                layoutType: this.layoutType,
                variant,
                itemCount: this.itemCount,
                cardSize,
                positions,
                spacing,
                margins,
                columns,
                rows,
                contentMode,
                availableHeight: this.calculateAvailableHeight(),
                availableWidth: this.calculateAvailableWidth()
            };
        }

        /**
         * 獲取調試信息
         *
         * @returns {object} 調試信息
         */
        getDebugInfo() {
            return {
                width: this.width,
                height: this.height,
                itemCount: this.itemCount,
                layoutType: this.layoutType,
                deviceType: this.deviceType,
                screenSize: DeviceDetector.getScreenSize(this.height),
                isIPad: DeviceDetector.isIPad(this.width, this.height),
                isLandscapeMobile: DeviceDetector.isLandscapeMobile(this.width, this.height),
                isSmallContainer: DeviceDetector.isSmallContainer(this.height),
                isMediumContainer: DeviceDetector.isMediumContainer(this.height),
                isLargeContainer: DeviceDetector.isLargeContainer(this.height)
            };
        }
    }

    // 導出到全局作用域
    if (typeof window !== 'undefined') {
        window.SeparatedLayoutCalculator = SeparatedLayoutCalculator;
    }

    // 導出到 Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SeparatedLayoutCalculator;
    }
}

