/**
 * 響應式佈局引擎
 * 處理所有與佈局相關的計算
 *
 * 基於業界標準的模塊化設計
 * 將複雜的計算邏輯集中在一個類中
 */

/**
 * 遊戲響應式佈局引擎
 *
 * 職責：
 * 1. 計算邊距和間距
 * 2. 計算卡片大小
 * 3. 計算列數和行數
 * 4. 生成完整的佈局配置
 */
class GameResponsiveLayout {
    /**
     * 構造函數
     * @param {number} containerWidth - 容器寬度
     * @param {number} containerHeight - 容器高度
     * @param {object} options - 選項
     *   - isIPad: 是否是 iPad
     *   - hasImages: 是否有圖片
     *   - itemCount: 項目數量
     */
    constructor(containerWidth, containerHeight, options = {}) {
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.breakpoint = getBreakpoint(containerWidth);
        this.isPortrait = containerHeight > containerWidth;
        this.aspectRatio = containerWidth / containerHeight;

        this.isIPad = options.isIPad || false;
        this.hasImages = options.hasImages || false;
        this.itemCount = options.itemCount || 0;

        // iPad 特殊配置
        if (this.isIPad) {
            this.iPadSize = classifyIPadSize(containerWidth, containerHeight);
            this.iPadConfig = getIPadConfig(this.iPadSize);
        }
    }

    /**
     * 獲取邊距配置
     * @returns {object} 邊距配置 { side, top, bottom }
     */
    getMargins() {
        if (this.isIPad && this.iPadConfig) {
            return {
                side: this.iPadConfig.sideMargin,
                top: this.iPadConfig.topButtonArea,
                bottom: this.iPadConfig.bottomButtonArea
            };
        }

        return getToken('margins', null, this.breakpoint);
    }

    /**
     * 獲取間距配置
     * @returns {object} 間距配置 { horizontal, vertical }
     */
    getGaps() {
        if (this.isIPad && this.iPadConfig) {
            return {
                horizontal: this.iPadConfig.horizontalSpacing,
                vertical: this.iPadConfig.verticalSpacing
            };
        }

        return getToken('gaps', null, this.breakpoint);
    }

    /**
     * 獲取字體大小
     * @returns {number} 字體大小
     */
    getFontSize() {
        if (this.isIPad && this.iPadConfig) {
            return this.iPadConfig.chineseFontSize;
        }

        return getToken('fontSize', 'md');
    }

    /**
     * 獲取可用寬度
     * @returns {number} 可用寬度
     */
    getAvailableWidth() {
        const margins = this.getMargins();
        return this.containerWidth - (margins.side * 2);
    }

    /**
     * 獲取可用高度
     * @returns {number} 可用高度
     */
    getAvailableHeight() {
        const margins = this.getMargins();
        return this.containerHeight - (margins.top + margins.bottom);
    }

    /**
     * 計算最優列數
     * @returns {number} 列數
     */
    getOptimalCols() {
        if (this.isIPad) {
            return 5; // iPad 固定 5 列
        }

        const availableWidth = this.getAvailableWidth();
        const gaps = this.getGaps();
        const minCardWidth = 100;

        const maxCols = Math.floor(
            (availableWidth + gaps.horizontal) / (minCardWidth + gaps.horizontal)
        );

        return Math.min(maxCols, this.itemCount || 10);
    }

    /**
     * 計算列寬
     * @param {number} cols - 列數
     * @returns {number} 列寬
     */
    getColumnWidth(cols) {
        const gaps = this.getGaps();
        const availableWidth = this.getAvailableWidth();
        const totalGap = (cols - 1) * gaps.horizontal;
        return (availableWidth - totalGap) / cols;
    }

    /**
     * 計算卡片大小（正方形模式）
     * @returns {object} 卡片大小 { width, height }
     */
    calculateSquareCardSize() {
        const cols = this.getOptimalCols();
        const gaps = this.getGaps();
        const availableWidth = this.getAvailableWidth();
        const availableHeight = this.getAvailableHeight();

        // 根據寬度計算
        const cardWidthByWidth = (availableWidth - (cols - 1) * gaps.horizontal) / cols;

        // 根據高度計算（假設 4 行）
        const rows = Math.ceil(this.itemCount / cols) || 4;
        const cardHeightByHeight = (availableHeight - (rows - 1) * gaps.vertical) / rows;

        // 取較小值，確保卡片不會溢出
        const cardSize = Math.min(cardWidthByWidth, cardHeightByHeight);

        return {
            width: cardSize,
            height: cardSize
        };
    }

    /**
     * 計算卡片大小（矩形模式）
     * @returns {object} 卡片大小 { width, height }
     */
    calculateRectangleCardSize() {
        const cols = this.getOptimalCols();
        const gaps = this.getGaps();
        const availableWidth = this.getAvailableWidth();

        const cardWidth = (availableWidth - (cols - 1) * gaps.horizontal) / cols;
        const cardHeight = cardWidth * 0.75; // 寬高比 4:3

        return {
            width: cardWidth,
            height: cardHeight
        };
    }

    /**
     * 獲取卡片大小
     * @returns {object} 卡片大小 { width, height }
     */
    getCardSize() {
        if (this.hasImages) {
            return this.calculateSquareCardSize();
        } else {
            return this.calculateRectangleCardSize();
        }
    }

    /**
     * 計算行高
     * @returns {number} 行高
     */
    getRowHeight() {
        const gaps = this.getGaps();
        const cardSize = this.getCardSize();
        return cardSize.height + gaps.vertical;
    }

    /**
     * 計算行數
     * @returns {number} 行數
     */
    getRows() {
        const cols = this.getOptimalCols();
        return Math.ceil(this.itemCount / cols) || 1;
    }

    /**
     * 獲取完整的佈局配置
     * @returns {object} 完整的佈局配置
     */
    getLayoutConfig() {
        const cols = this.getOptimalCols();
        const rows = this.getRows();
        const cardSize = this.getCardSize();
        const margins = this.getMargins();
        const gaps = this.getGaps();

        return {
            // 基本信息
            breakpoint: this.breakpoint,
            isPortrait: this.isPortrait,
            isIPad: this.isIPad,
            iPadSize: this.isIPad ? this.iPadSize : null,

            // 容器信息
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,

            // 邊距和間距
            margins,
            gaps,

            // 可用空間
            availableWidth: this.getAvailableWidth(),
            availableHeight: this.getAvailableHeight(),

            // 卡片信息
            cardSize,
            cardWidth: cardSize.width,
            cardHeight: cardSize.height,

            // 佈局信息
            cols,
            rows,
            columnWidth: this.getColumnWidth(cols),
            rowHeight: this.getRowHeight(),

            // 字體大小
            fontSize: this.getFontSize(),

            // 計算時間戳
            timestamp: Date.now()
        };
    }

    /**
     * 調試：打印佈局配置
     */
    debug() {
        const config = this.getLayoutConfig();
        console.log('📐 佈局配置:', {
            breakpoint: config.breakpoint,
            isIPad: config.isIPad,
            iPadSize: config.iPadSize,
            containerSize: `${config.containerWidth}×${config.containerHeight}`,
            margins: config.margins,
            gaps: config.gaps,
            cardSize: `${config.cardWidth.toFixed(1)}×${config.cardHeight.toFixed(1)}`,
            layout: `${config.cols}列 × ${config.rows}行`,
            availableSpace: `${config.availableWidth.toFixed(1)}×${config.availableHeight.toFixed(1)}`
        });
        return config;
    }
}
