/**
 * 分離模式統一邊距配置系統
 * 
 * 在一個地方管理分離模式的所有邊距配置
 * 包括：容器邊距、外框邊距、卡片間距
 */

if (typeof SeparatedMarginConfig === 'undefined') {
    // 🔥 使用傳統方式定義靜態屬性（避免 static field 語法問題）
    // 先定義 CONFIG 對象
    const CONFIG = {
        // 容器級別邊距（相對於容器高度的比例）
        // 🔥 [v10.0] 三等分佈局 - 左單元離遊戲頂部 30px（計時器下方）
        CONTAINER: {
            TOP_RATIO: 0.083,       // 8.3% 頂部邊距（約 80px，計時器 50px + 30px 間距）
            BOTTOM_RATIO: 0.10,     // 10% 底部邊距
            SIDE_PIXEL: 150         // 🔥 [v9.0] 150px 左右邊距（三等分佈局）
        },

        // 外框級別邊距（像素值）
        FRAME: {
            PADDING: 10,            // 外框與卡片間距
            TOP_PADDING: 15         // 外框內頂部空間
        },

        // 卡片級別間距（像素值）
        CARD: {
            MIN_SPACING: 8,         // 最小卡片間距
            MAX_SPACING: 20         // 最大卡片間距
        }
    };

    // 定義類
    class SeparatedMarginConfig {
        static CONFIG = CONFIG;

        /**
         * 根據容器大小計算實際邊距
         *
         * @param {number} containerHeight - 容器高度
         * @returns {object} 計算後的邊距對象
         */
        static calculateMargins(containerHeight) {
            return {
                // 容器邊距（像素）
                containerTop: containerHeight * CONFIG.CONTAINER.TOP_RATIO,
                containerBottom: containerHeight * CONFIG.CONTAINER.BOTTOM_RATIO,
                containerSide: CONFIG.CONTAINER.SIDE_PIXEL,

                // 外框邊距（像素）
                framePadding: CONFIG.FRAME.PADDING,
                frameTopPadding: CONFIG.FRAME.TOP_PADDING,

                // 卡片間距（像素）
                cardMinSpacing: CONFIG.CARD.MIN_SPACING,
                cardMaxSpacing: CONFIG.CARD.MAX_SPACING
            };
        }

        /**
         * 計算可用高度（容器高度 - 頂部邊距 - 底部邊距）
         *
         * @param {number} containerHeight - 容器高度
         * @returns {number} 可用高度
         */
        static calculateAvailableHeight(containerHeight) {
            const topMargin = containerHeight * CONFIG.CONTAINER.TOP_RATIO;
            const bottomMargin = containerHeight * CONFIG.CONTAINER.BOTTOM_RATIO;
            return containerHeight - topMargin - bottomMargin;
        }

        /**
         * 計算外框高度（包含頂部空間）
         *
         * @param {number} containerHeight - 容器內卡片總高度
         * @returns {number} 外框總高度
         */
        static calculateFrameHeight(containerHeight) {
            const padding = CONFIG.FRAME.PADDING;
            const topPadding = CONFIG.FRAME.TOP_PADDING;
            return containerHeight + padding * 2 + topPadding;
        }

        /**
         * 計算外框中心 Y 位置
         *
         * @param {number} startY - 卡片起始 Y 位置
         * @param {number} containerHeight - 容器內卡片總高度
         * @returns {number} 外框中心 Y 位置
         */
        static calculateFrameCenterY(startY, containerHeight) {
            const padding = CONFIG.FRAME.PADDING;
            const topPadding = CONFIG.FRAME.TOP_PADDING;
            return startY + padding + topPadding + containerHeight / 2;
        }

        /**
         * 計算動態卡片間距
         *
         * @param {number} availableHeight - 可用高度
         * @param {number} itemCount - 卡片數量
         * @param {number} minCardHeight - 最小卡片高度
         * @returns {number} 動態間距
         */
        static calculateDynamicSpacing(availableHeight, itemCount, minCardHeight = 60) {
            const totalCardHeight = availableHeight;
            const totalSpacingHeight = totalCardHeight - (itemCount * minCardHeight);

            return Math.max(
                CONFIG.CARD.MIN_SPACING,
                Math.min(
                    CONFIG.CARD.MAX_SPACING,
                    totalSpacingHeight / Math.max(itemCount - 1, 1)
                )
            );
        }

        /**
         * 更新邊距配置（用於調試或動態調整）
         *
         * @param {string} key - 配置鍵（如 'CONTAINER.TOP_RATIO'）
         * @param {number} value - 新值
         */
        static updateConfig(key, value) {
            const keys = key.split('.');
            let obj = CONFIG;

            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }

            obj[keys[keys.length - 1]] = value;
            console.log(`✅ 邊距配置已更新: ${key} = ${value}`);
        }

        /**
         * 打印當前配置（用於調試）
         */
        static printConfig() {
            console.log('📐 分離模式邊距配置:', CONFIG);
        }

        /**
         * 🔥 [v12.0] 計算頂部偏移（自動居中，考慮計時器高度）
         *
         * @param {number} availableHeight - 可用高度（排除按鈕區域）
         * @param {number} totalContentHeight - 內容總高度（卡片 + 間距）
         * @param {number} timerHeight - 計時器高度（可選，默認 50px）
         * @returns {number} 頂部偏移（相對於 topButtonArea）
         */
        static calculateTopOffsetForSeparated(availableHeight, totalContentHeight, timerHeight = 50) {
            // 計算卡片可用的高度（排除計時器區域）
            const cardAvailableHeight = availableHeight - timerHeight;

            // 自動居中：(可用高度 - 內容高度) / 2
            const centeredOffset = Math.max(0, (cardAvailableHeight - totalContentHeight) / 2);

            // 返回相對於 topButtonArea 的偏移
            // 這樣 leftStartY = topButtonArea + topOffset 就能正確定位
            return centeredOffset;
        }

        /**
         * 🔥 [v11.0] 計算可用高度（排除按鈕區域）
         *
         * @param {number} height - 屏幕高度
         * @param {number} topButtonArea - 頂部按鈕區域高度
         * @param {number} bottomButtonArea - 底部按鈕區域高度
         * @returns {number} 可用高度
         */
        static calculateAvailableHeightWithButtons(height, topButtonArea = 60, bottomButtonArea = 60) {
            return height - topButtonArea - bottomButtonArea;
        }

        /**
         * 🔥 [v11.0] 計算卡片總高度（用於邊距計算）
         *
         * @param {number} itemCount - 卡片數量
         * @param {number} cardHeight - 單個卡片高度
         * @param {number} spacing - 卡片間距
         * @returns {number} 卡片總高度
         */
        static calculateTotalCardHeight(itemCount, cardHeight, spacing) {
            let rows;
            if (itemCount <= 5) {
                rows = itemCount;  // 單列
            } else if (itemCount <= 10) {
                rows = 2;  // 2 行
            } else {
                rows = Math.ceil(itemCount / 2);  // 多行
            }

            return rows * cardHeight + (rows - 1) * spacing;
        }
    }

    // 分配到全局作用域
    window.SeparatedMarginConfig = SeparatedMarginConfig;
}

