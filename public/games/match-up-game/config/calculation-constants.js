/**
 * 計算常量
 *
 * 統一管理分離模式的所有計算常量
 */

// 防止重複聲明
if (typeof CalculationConstants === 'undefined') {
    class CalculationConstants {
        /**
         * 卡片尺寸常量
         */
        static CARD_SIZE = {
            // 最小卡片尺寸
            MIN_WIDTH: 50,
            MIN_HEIGHT: 28,

            // 最大卡片尺寸
            MAX_WIDTH: 280,
            MAX_HEIGHT: 90,

            // 正方形模式（有圖片）
            SQUARE_MODE: {
                MIN_WIDTH: 50,
                MAX_WIDTH: 140,
                MIN_HEIGHT: 50,
                MAX_HEIGHT: 140
            },

            // 長方形模式（無圖片）
            RECTANGLE_MODE: {
                MIN_WIDTH: 70,
                MAX_WIDTH: 130,
                MIN_HEIGHT: 18,
                MAX_HEIGHT: 45
            }
        };

        /**
         * 間距常量
         */
        static SPACING = {
            // 水平間距
            HORIZONTAL_MIN: 3,
            HORIZONTAL_MAX: 20,
            HORIZONTAL_RATIO: 0.01,

            // 垂直間距
            VERTICAL_MIN: 3,
            VERTICAL_MAX: 15,
            VERTICAL_RATIO: 0.008,

            // 特殊間距
            LANDSCAPE_MOBILE_HORIZONTAL: 8,
            LANDSCAPE_MOBILE_VERTICAL: 3
        };

        /**
         * 邊距常量
         */
        static MARGINS = {
            // 頂部邊距
            TOP_MIN: 20,
            TOP_MAX: 60,

            // 底部邊距
            BOTTOM_MIN: 20,
            BOTTOM_MAX: 60,

            // 左邊距
            LEFT_MIN: 10,
            LEFT_MAX: 30,

            // 右邊距
            RIGHT_MIN: 10,
            RIGHT_MAX: 30
        };

        /**
         * 位置常量
         */
        static POSITIONS = {
            // 左側位置
            LEFT_X_MIN: 0.35,
            LEFT_X_MAX: 0.45,

            // 右側位置
            RIGHT_X_MIN: 0.65,
            RIGHT_X_MAX: 0.70,

            // 起始 Y 位置
            START_Y_MIN: 0.12,
            START_Y_MAX: 0.35
        };

        /**
         * 容器常量
         */
        static CONTAINER = {
            // 容器高度閾值
            SMALL_HEIGHT: 600,
            MEDIUM_HEIGHT: 800,

            // 容器寬度閾值
            MOBILE_WIDTH: 600,
            TABLET_WIDTH: 1024,

            // 橫向模式高度閾值
            LANDSCAPE_HEIGHT: 450,

            // 可用區域比例
            AVAILABLE_HEIGHT_RATIO: 0.8,
            AVAILABLE_WIDTH_RATIO: 0.85
        };

        /**
         * 列數常量
         */
        static COLUMNS = {
            // 最小列數
            MIN: 1,

            // 最大列數
            MAX: 10,

            // 正方形模式列數
            SQUARE_MODE_COLS: 5,

            // 長方形模式列數
            RECTANGLE_MODE_COLS: 2,

            // 多列模式列數
            MULTI_COLUMN_COLS: 3
        };

        /**
         * 字體大小常量
         */
        static FONT_SIZE = {
            // 最小字體大小
            MIN: 12,

            // 最大字體大小
            MAX: 72,

            // 基礎比例
            BASE_RATIO: 0.4,

            // 文字長度調整
            LONG_TEXT_RATIO: 0.7,
            MEDIUM_TEXT_RATIO: 0.85,
            SHORT_TEXT_RATIO: 1.0,

            // 文字長度閾值
            LONG_TEXT_LENGTH: 20,
            MEDIUM_TEXT_LENGTH: 15
        };

        /**
         * 動畫常量
         */
        static ANIMATION = {
            // 卡片出現動畫延遲
            CARD_DELAY: 100,

            // 動畫持續時間
            DURATION: 300
        };

        /**
         * 隨機模式常量
         */
        static RANDOM_MODE = {
            SAME: 'same',
            RANDOM: 'random'
        };

        /**
         * 文字位置常量
         */
        static TEXT_POSITION = {
            LEFT: 'left',
            RIGHT: 'right',
            BOTTOM: 'bottom'
        };

        /**
         * 佈局模式常量
         */
        static LAYOUT_MODE = {
            LEFT_RIGHT_SINGLE_COLUMN: 'left-right-single-column',
            LEFT_RIGHT_MULTI_ROWS: 'left-right-multi-rows',
            TOP_BOTTOM_MULTI_ROWS: 'top-bottom-multi-rows',
            MIXED_GRID: 'mixed-grid'
        };

        /**
         * 卡片內容模式常量
         */
        static CONTENT_MODE = {
            SQUARE: 'square',      // 有圖片
            RECTANGLE: 'rectangle' // 無圖片
        };

        /**
         * 獲取卡片尺寸配置
         * @param {string} mode - 內容模式（'square' 或 'rectangle'）
         * @returns {object} 卡片尺寸配置
         */
        static getCardSizeConfig(mode) {
            if (mode === this.CONTENT_MODE.SQUARE) {
                return this.CARD_SIZE.SQUARE_MODE;
            } else {
                return this.CARD_SIZE.RECTANGLE_MODE;
            }
        }

        /**
         * 獲取列數
         * @param {string} mode - 內容模式（'square' 或 'rectangle'）
         * @returns {number} 列數
         */
        static getColumnCount(mode) {
            if (mode === this.CONTENT_MODE.SQUARE) {
                return this.COLUMNS.SQUARE_MODE_COLS;
            } else {
                return this.COLUMNS.RECTANGLE_MODE_COLS;
            }
        }
    }

    // 導出到全局作用域
    if (typeof window !== 'undefined') {
        window.CalculationConstants = CalculationConstants;
    }

    // 導出到 Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CalculationConstants;
    }
}

