/**
 * 🔥 統一列數計算系統 v1.0
 * 
 * 核心原則：
 * - 根據容器寬度動態計算最優列數
 * - 忽略設備類型分類
 * - 統一所有佈局模式
 * - 支持所有分辨率（1024×768, 1024×1366, 等等）
 */

class UnifiedColumnCalculator {
    /**
     * 計算最優列數（通用算法）
     * 
     * @param {number} containerWidth - 容器寬度（像素）
     * @param {number} itemCount - 項目數量
     * @param {number} minCardWidth - 最小卡片寬度（像素）
     * @param {number} spacing - 卡片間距（像素）
     * @param {number} horizontalMargin - 水平邊距（像素）
     * @returns {number} 最優列數
     */
    static calculateOptimalColumns(
        containerWidth,
        itemCount,
        minCardWidth = 60,
        spacing = 10,
        horizontalMargin = 30
    ) {
        // 計算可用寬度
        const availableWidth = containerWidth - 2 * horizontalMargin;
        
        // 計算最大可能的列數
        // 公式：(可用寬度 + 間距) / (最小卡片寬度 + 間距)
        const maxPossibleCols = Math.floor(
            (availableWidth + spacing) / (minCardWidth + spacing)
        );
        
        // 確保列數不超過項目數
        const optimalCols = Math.min(maxPossibleCols, itemCount);
        
        // 確保至少有 1 列
        return Math.max(1, optimalCols);
    }

    /**
     * 根據容器寬度和高度計算最優列數（考慮寬高比）
     * 
     * @param {number} containerWidth - 容器寬度
     * @param {number} containerHeight - 容器高度
     * @param {number} itemCount - 項目數量
     * @param {object} options - 配置選項
     * @returns {number} 最優列數
     */
    static calculateOptimalColumnsWithAspectRatio(
        containerWidth,
        containerHeight,
        itemCount,
        options = {}
    ) {
        const {
            minCardWidth = 60,
            spacing = 10,
            horizontalMargin = 30,
            minCardHeight = 50,
            verticalMargin = 30
        } = options;

        // 計算寬高比
        const aspectRatio = containerWidth / containerHeight;

        // 計算可用寬度和高度
        const availableWidth = containerWidth - 2 * horizontalMargin;
        const availableHeight = containerHeight - 2 * verticalMargin;

        // 基於寬度計算最大列數
        const maxColsByWidth = Math.floor(
            (availableWidth + spacing) / (minCardWidth + spacing)
        );

        // 基於高度計算最大行數
        const maxRowsByHeight = Math.floor(
            (availableHeight + spacing) / (minCardHeight + spacing)
        );

        // 根據寬高比調整列數
        let optimalCols;

        if (aspectRatio > 2.0) {
            // 超寬螢幕（21:9, 32:9）- 優先使用寬度
            optimalCols = maxColsByWidth;
        } else if (aspectRatio > 1.5) {
            // 寬螢幕（16:9, 16:10）- 平衡寬度和高度
            optimalCols = Math.min(
                maxColsByWidth,
                Math.ceil(itemCount / maxRowsByHeight)
            );
        } else if (aspectRatio > 1.2) {
            // 標準螢幕（4:3, 3:2）- 平衡寬度和高度
            optimalCols = Math.min(
                maxColsByWidth,
                Math.ceil(itemCount / maxRowsByHeight)
            );
        } else {
            // 直向螢幕（9:16）- 優先使用高度
            optimalCols = Math.min(
                maxColsByWidth,
                Math.ceil(itemCount / maxRowsByHeight)
            );
        }

        // 確保列數在合理範圍內
        optimalCols = Math.max(1, Math.min(optimalCols, itemCount));

        return optimalCols;
    }

    /**
     * 計算卡片寬度（基於列數和容器寬度）
     * 
     * @param {number} containerWidth - 容器寬度
     * @param {number} columns - 列數
     * @param {number} spacing - 卡片間距
     * @param {number} horizontalMargin - 水平邊距
     * @returns {number} 卡片寬度
     */
    static calculateCardWidth(
        containerWidth,
        columns,
        spacing = 10,
        horizontalMargin = 30
    ) {
        const availableWidth = containerWidth - 2 * horizontalMargin;
        const totalSpacing = spacing * (columns - 1);
        const cardWidth = (availableWidth - totalSpacing) / columns;
        return Math.max(1, cardWidth);
    }

    /**
     * 計算卡片高度（基於行數和容器高度）
     * 
     * @param {number} containerHeight - 容器高度
     * @param {number} rows - 行數
     * @param {number} spacing - 卡片間距
     * @param {number} verticalMargin - 垂直邊距
     * @returns {number} 卡片高度
     */
    static calculateCardHeight(
        containerHeight,
        rows,
        spacing = 10,
        verticalMargin = 30
    ) {
        const availableHeight = containerHeight - 2 * verticalMargin;
        const totalSpacing = spacing * (rows - 1);
        const cardHeight = (availableHeight - totalSpacing) / rows;
        return Math.max(1, cardHeight);
    }

    /**
     * 驗證列數是否合理
     * 
     * @param {number} columns - 列數
     * @param {number} containerWidth - 容器寬度
     * @param {number} minCardWidth - 最小卡片寬度
     * @returns {boolean} 是否合理
     */
    static isValidColumns(containerWidth, columns, minCardWidth = 60) {
        const calculatedCardWidth = containerWidth / columns;
        return calculatedCardWidth >= minCardWidth;
    }

    /**
     * 調試信息
     * 
     * @param {object} params - 參數
     * @returns {object} 調試信息
     */
    static getDebugInfo(params) {
        const {
            containerWidth,
            containerHeight,
            itemCount,
            columns,
            minCardWidth,
            spacing,
            horizontalMargin
        } = params;

        const availableWidth = containerWidth - 2 * horizontalMargin;
        const cardWidth = this.calculateCardWidth(
            containerWidth,
            columns,
            spacing,
            horizontalMargin
        );
        const maxPossibleCols = Math.floor(
            (availableWidth + spacing) / (minCardWidth + spacing)
        );

        return {
            containerWidth,
            containerHeight,
            itemCount,
            columns,
            cardWidth: cardWidth.toFixed(2),
            minCardWidth,
            spacing,
            horizontalMargin,
            availableWidth,
            maxPossibleCols,
            isValid: this.isValidColumns(containerWidth, columns, minCardWidth),
            aspectRatio: (containerWidth / containerHeight).toFixed(2)
        };
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedColumnCalculator;
}

