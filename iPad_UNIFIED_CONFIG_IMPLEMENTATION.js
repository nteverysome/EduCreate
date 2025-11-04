/**
 * iPad 統一容器配置系統 (v42.0)
 * 根據容器大小動態調整所有佈局參數
 */

// ============================================================================
// 第一步：容器大小分類
// ============================================================================

function classifyIPadContainerSize(width, height) {
    /**
     * 根據寬度和高度分類 iPad 容器大小
     * 返回: 'small' | 'medium' | 'large' | 'xlarge'
     */
    
    if (width <= 768) {
        return 'small';      // iPad mini: 768×1024
    } else if (width <= 820) {
        return 'medium';     // iPad/Air: 810×1080, 820×1180
    } else if (width <= 834) {
        return 'large';      // iPad Pro 11": 834×1194
    } else {
        return 'xlarge';     // iPad Pro 12.9": 1024×1366
    }
}

// ============================================================================
// 第二步：根據分類獲取基礎配置
// ============================================================================

function getIPadConfigBySize(containerSize, aspectRatio) {
    /**
     * 根據容器大小和寬高比返回基礎配置
     */
    
    const configs = {
        small: {
            margins: { top: 40, bottom: 40, left: 15, right: 15 },
            spacing: { horizontal: 12, vertical: 30 },
            card: { minWidth: 120, minHeight: 120 },
            font: { chinese: 24, english: 16 },
            cols: 5
        },
        medium: {
            margins: { top: 45, bottom: 45, left: 18, right: 18 },
            spacing: { horizontal: 14, vertical: 35 },
            card: { minWidth: 140, minHeight: 140 },
            font: { chinese: 28, english: 18 },
            cols: 5
        },
        large: {
            margins: { top: 50, bottom: 50, left: 20, right: 20 },
            spacing: { horizontal: 15, vertical: 40 },
            card: { minWidth: 160, minHeight: 160 },
            font: { chinese: 32, english: 20 },
            cols: 5
        },
        xlarge: {
            margins: { top: 55, bottom: 55, left: 25, right: 25 },
            spacing: { horizontal: 18, vertical: 45 },
            card: { minWidth: 180, minHeight: 180 },
            font: { chinese: 36, english: 22 },
            cols: 5
        }
    };
    
    return configs[containerSize];
}

// ============================================================================
// 第三步：根據項目數調整配置
// ============================================================================

function adjustIPadConfigByItemCount(baseConfig, itemCount, cols) {
    /**
     * 根據項目數調整配置
     * 如果項目數少，可以增加卡片尺寸
     * 如果項目數多，可能需要減少間距
     */
    
    const adjustedConfig = JSON.parse(JSON.stringify(baseConfig));
    
    // 如果項目數少於 6，增加卡片尺寸
    if (itemCount <= 6) {
        adjustedConfig.card.minWidth *= 1.1;
        adjustedConfig.card.minHeight *= 1.1;
        adjustedConfig.font.chinese *= 1.1;
    }
    
    // 如果項目數多於 20，減少間距
    if (itemCount > 20) {
        adjustedConfig.spacing.horizontal *= 0.9;
        adjustedConfig.spacing.vertical *= 0.9;
    }
    
    return adjustedConfig;
}

// ============================================================================
// 第四步：計算最終的佈局參數
// ============================================================================

function calculateIPadLayoutParams(width, height, itemCount, isIPad = true) {
    /**
     * 計算 iPad 的最終佈局參數
     * 返回完整的佈局配置對象
     */
    
    if (!isIPad) {
        return null;  // 非 iPad 設備使用原有邏輯
    }
    
    // 第一步：分類容器大小
    const containerSize = classifyIPadContainerSize(width, height);
    
    // 第二步：獲取基礎配置
    const baseConfig = getIPadConfigBySize(containerSize, width / height);
    
    // 第三步：根據項目數調整
    const config = adjustIPadConfigByItemCount(baseConfig, itemCount, baseConfig.cols);
    
    // 第四步：計算可用空間
    const availableWidth = width - config.margins.left - config.margins.right;
    const availableHeight = height - config.margins.top - config.margins.bottom;
    
    // 第五步：計算卡片尺寸
    const cardWidth = (availableWidth - config.spacing.horizontal * 6) / config.cols;
    const rows = Math.ceil(itemCount / config.cols);
    const cardHeight = (availableHeight - config.spacing.vertical * (rows + 1)) / rows / 1.4;
    
    // 第六步：計算文字大小
    const chineseFontSize = Math.max(
        config.font.chinese * 0.8,
        Math.min(config.font.chinese, cardHeight * 0.6)
    );
    
    // 返回完整配置
    return {
        // 容器信息
        containerSize,
        width,
        height,
        aspectRatio: (width / height).toFixed(2),
        
        // 邊距
        margins: config.margins,
        
        // 間距
        spacing: config.spacing,
        
        // 可用空間
        availableWidth: availableWidth.toFixed(1),
        availableHeight: availableHeight.toFixed(1),
        
        // 卡片尺寸
        card: {
            width: cardWidth.toFixed(1),
            height: cardHeight.toFixed(1),
            minWidth: config.card.minWidth,
            minHeight: config.card.minHeight
        },
        
        // 文字大小
        font: {
            chinese: chineseFontSize.toFixed(1),
            english: (chineseFontSize * 0.7).toFixed(1)
        },
        
        // 佈局
        layout: {
            cols: config.cols,
            rows: rows,
            itemCount: itemCount
        }
    };
}

// ============================================================================
// 第五步：使用示例
// ============================================================================

/*
// 在 createMixedLayout 方法中使用

const isIPad = width >= 768 && width <= 1280;

if (isIPad) {
    // 使用統一的 iPad 配置
    const layoutParams = calculateIPadLayoutParams(width, height, itemCount, true);
    
    console.log('📱 iPad 統一佈局配置:', layoutParams);
    
    // 應用配置
    const topButtonAreaHeight = layoutParams.margins.top;
    const bottomButtonAreaHeight = layoutParams.margins.bottom;
    const sideMargin = layoutParams.margins.left;
    const horizontalSpacing = layoutParams.spacing.horizontal;
    const verticalSpacing = layoutParams.spacing.vertical;
    const frameWidth = parseFloat(layoutParams.card.width);
    const cardHeightInFrame = parseFloat(layoutParams.card.height);
    const chineseFontSize = parseFloat(layoutParams.font.chinese);
    
    // ... 繼續使用這些參數
} else {
    // 使用原有邏輯
}
*/

// ============================================================================
// 導出函數
// ============================================================================

module.exports = {
    classifyIPadContainerSize,
    getIPadConfigBySize,
    adjustIPadConfigByItemCount,
    calculateIPadLayoutParams
};

