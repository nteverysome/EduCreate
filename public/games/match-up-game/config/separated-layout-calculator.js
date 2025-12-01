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
         * 🔥 [v53.1] 修復 7 個匹配數:使用 1 列布局(1列 × 7行)
         *
         * @param {boolean} hasImages - 是否有圖片
         * @returns {number} 列數
         */
        calculateColumns(hasImages = false) {
            // 🔥 [v53.1] 特殊處理:7 個匹配數使用單列布局
            if (this.itemCount === 7 && this.layoutType === 'left-right') {
                return 1;  // 1 列 × 7 行
            }

            if (hasImages) {
                // 正方形模式(有圖片)
                return this.constants.COLUMNS.SQUARE_MODE_COLS;
            } else {
                // 長方形模式(無圖片)
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
         * 計算左側佈局（根據卡片數量自動選擇）
         *
         * @param {number} itemCount - 卡片數量
         * @returns {object} { columns, rows, layout }
         */
        calculateLeftLayout(itemCount) {
            if (itemCount <= 5) {
                return {
                    columns: 1,
                    rows: itemCount,
                    layout: 'single-column'
                };
            } else if (itemCount === 7) {
                return {
                    columns: 2,
                    rows: Math.ceil(itemCount / 2),
                    layout: 'multi-rows'
                };
            } else if (itemCount === 10) {
                return {
                    columns: 10,
                    rows: 1,
                    layout: 'single-row'
                };
            } else if (itemCount === 20) {
                return {
                    columns: 10,
                    rows: 2,
                    layout: 'multi-rows'
                };
            } else {
                // 默認佈局
                return {
                    columns: 1,
                    rows: itemCount,
                    layout: 'single-column'
                };
            }
        }

        /**
         * 計算右側佈局（始終是單列）
         *
         * @param {number} itemCount - 卡片數量
         * @returns {object} { columns, rows, layout }
         */
        calculateRightLayout(itemCount) {
            return {
                columns: 1,
                rows: itemCount,
                layout: 'single-column'
            };
        }

        /**
         * 根據卡片數量計算預設卡片大小（舊方法，保留向後兼容）
         *
         * @param {number} itemCount - 卡片數量
         * @returns {object} { width, height }
         */
        calculateCardSizeByItemCount(itemCount) {
            const sizeMap = {
                3: { width: 160, height: 85 },   // 🔥 [Screenshot_280] 增加卡片大小以匹配 Screenshot_275 風格
                4: { width: 150, height: 75 },   // 🔥 [Screenshot_280] 增加卡片大小以匹配 Screenshot_275
                5: { width: 130, height: 65 },   // 🔥 [Screenshot_280] 增加卡片大小以匹配 Screenshot_275 風格
                7: { width: 90, height: 45 },    // 🔥 [Screenshot_280] 增加卡片大小以匹配 Screenshot_275 風格
                10: { width: 70, height: 35 },   // 🔥 [Screenshot_280] 增加卡片大小以匹配 Screenshot_275 風格
                20: { width: 80, height: 45 }    // 🔥 [Screenshot_280] 增加卡片大小以匹配 Screenshot_275 風格
            };

            return sizeMap[itemCount] || { width: 80, height: 35 };
        }

        /**
         * 🔥 [Dynamic Sizing] 根據容器大小和卡片數量計算最優卡片大小
         * 這個方法會根據實際容器尺寸動態計算卡片大小，以最大化空間利用率
         *
         * 佈局結構：
         * ┌─────────────────────────────────────────────────────────┐
         * │ 邊距 │ 左側卡片 │ 中間空白 │ 右側卡片 │ 邊距 │
         * │ 15px │  25%    │  50%    │  25%    │ 15px │
         * └─────────────────────────────────────────────────────────┘
         *
         * @param {number} itemCount - 卡片數量
         * @returns {object} { width, height, layout: { columns, rows }, contentSizes: {...} }
         */
        calculateOptimalCardSize(itemCount) {
            // 🔥 [v6.0] 使用統一邊距配置系統
            // 從 SeparatedMarginConfig 獲取邊距配置
            const margins = typeof SeparatedMarginConfig !== 'undefined'
                ? SeparatedMarginConfig.calculateMargins(this.height)
                : {
                    containerTop: this.height * 0.15,
                    containerBottom: this.height * 0.10,
                    containerSide: 15,
                    cardMinSpacing: 8,
                    cardMaxSpacing: 20
                };

            // 容器配置 - 基於視覺分析優化
            // 🔥 [v9.0] 三等分佈局：左33% | 中33% | 右33%
            const containerConfig = {
                leftRatio: 0.3333,    // 左側容器佔總寬度的 33%
                rightRatio: 0.3333,   // 右側容器佔總寬度的 33%
                middleRatio: 0.3334,  // 中間空白區佔總寬度的 33%
                topMargin: margins.containerTop,      // 使用統一配置
                bottomMargin: margins.containerBottom, // 使用統一配置
                sideMargin: margins.containerSide,    // 使用統一配置
                minSpacing: margins.cardMinSpacing,   // 使用統一配置
                maxSpacing: margins.cardMaxSpacing    // 使用統一配置
            };

            // 計算可用空間
            const availableWidth = this.width * containerConfig.leftRatio - containerConfig.sideMargin * 2;
            const availableHeight = this.height * (1 - containerConfig.topMargin / this.height - containerConfig.bottomMargin / this.height);

            // 根據卡片數量確定佈局
            let layout, cardWidth, cardHeight, dynamicSpacing;

            if (itemCount <= 5) {
                // 單列佈局：1 列 × itemCount 行
                layout = { columns: 1, rows: itemCount };
                // 🔥 [v9.0] 三等分佈局 - 卡片寬度調整到 320px
                cardWidth = Math.min(availableWidth, 320); // 最大寬度調整到 320px

                // 🔥 [v3.0] 動態計算卡片間距，確保均勻分布
                const totalCardHeight = availableHeight;
                const totalSpacingHeight = totalCardHeight - (itemCount * 60); // 假設最小卡片高度 60px
                dynamicSpacing = Math.max(
                    containerConfig.minSpacing,
                    Math.min(
                        containerConfig.maxSpacing,
                        totalSpacingHeight / Math.max(itemCount - 1, 1)
                    )
                );

                cardHeight = (availableHeight - dynamicSpacing * (itemCount - 1)) / itemCount;
                cardHeight = Math.max(cardHeight, 40); // 最小高度 40px
            } else if (itemCount === 7) {
                // 多列佈局：2 列 × 4 行
                layout = { columns: 2, rows: 4 };
                dynamicSpacing = 10;
                cardWidth = (availableWidth - dynamicSpacing) / 2;
                cardHeight = (availableHeight - dynamicSpacing * 3) / 4;
                cardWidth = Math.max(cardWidth, 50); // 最小寬度 50px
                cardHeight = Math.max(cardHeight, 35); // 最小高度 35px
            } else if (itemCount === 10) {
                // 單行佈局：10 列 × 1 行
                layout = { columns: 10, rows: 1 };
                dynamicSpacing = 8;
                cardWidth = (availableWidth - dynamicSpacing * 9) / 10;
                cardHeight = availableHeight - dynamicSpacing;
                cardWidth = Math.max(cardWidth, 40); // 最小寬度 40px
                cardHeight = Math.max(cardHeight, 30); // 最小高度 30px
            } else if (itemCount === 20) {
                // 多行佈局：10 列 × 2 行
                layout = { columns: 10, rows: 2 };
                dynamicSpacing = 8;
                cardWidth = (availableWidth - dynamicSpacing * 9) / 10;
                cardHeight = (availableHeight - dynamicSpacing) / 2;
                cardWidth = Math.max(cardWidth, 40); // 最小寬度 40px
                cardHeight = Math.max(cardHeight, 30); // 最小高度 30px
            } else {
                // 默認：單列佈局
                layout = { columns: 1, rows: itemCount };
                cardWidth = Math.min(availableWidth, 200);

                // 動態計算卡片間距
                const totalCardHeight = availableHeight;
                const totalSpacingHeight = totalCardHeight - (itemCount * 60);
                dynamicSpacing = Math.max(
                    containerConfig.minSpacing,
                    Math.min(
                        containerConfig.maxSpacing,
                        totalSpacingHeight / Math.max(itemCount - 1, 1)
                    )
                );

                cardHeight = (availableHeight - dynamicSpacing * (itemCount - 1)) / itemCount;
                cardHeight = Math.max(cardHeight, 40);
            }

            // 確保卡片大小在合理範圍內
            cardWidth = Math.min(cardWidth, 320); // 🔥 [v9.0] 最大寬度調整到 320px
            cardHeight = Math.min(cardHeight, 150); // 最大高度 150px

            // 保存動態間距供後續使用
            this.dynamicSpacing = dynamicSpacing || 10;

            // 🎨 計算卡片內容大小（圖片、文字、按鈕）
            const contentSizes = this.calculateContentSizes(cardWidth, cardHeight);

            return {
                width: Math.floor(cardWidth),
                height: Math.floor(cardHeight),
                layout: layout,
                contentSizes: contentSizes,
                containerConfig: containerConfig,
                debug: {
                    availableWidth: Math.floor(availableWidth),
                    availableHeight: Math.floor(availableHeight),
                    utilization: {
                        width: Math.floor((layout.columns * cardWidth + containerConfig.spacing * (layout.columns - 1)) / availableWidth * 100),
                        height: Math.floor((layout.rows * cardHeight + containerConfig.spacing * (layout.rows - 1)) / availableHeight * 100)
                    }
                }
            };
        }

        /**
         * 🎨 根據卡片大小計算內容大小（圖片、文字、按鈕）
         * @param {number} cardWidth - 卡片寬度
         * @param {number} cardHeight - 卡片高度
         * @returns {object} 內容大小配置
         */
        calculateContentSizes(cardWidth, cardHeight) {
            return {
                // 🔥 [v215.0] 改進：語音按鈕大小計算更合理
                audioButton: {
                    size: Math.max(Math.floor(cardHeight * 0.18), 14),  // 🔥 [v215.0] 改為 18%（從 25% 減少）
                    minSize: 14,
                    maxSize: 32
                },
                // 圖片大小
                image: {
                    width: Math.max(Math.floor(cardWidth * 0.35), 30),
                    height: Math.max(Math.floor(cardHeight * 0.5), 25),
                    minWidth: 30,
                    maxWidth: 100,
                    minHeight: 25,
                    maxHeight: 80
                },
                // 文字大小
                text: {
                    fontSize: Math.max(Math.floor(cardHeight * 0.22), 12),
                    minFontSize: 12,
                    maxFontSize: 28,
                    lineHeight: Math.max(Math.floor(cardHeight * 0.28), 14)
                },
                // 邊距和間距
                spacing: {
                    padding: Math.max(Math.floor(cardHeight * 0.1), 5),
                    gap: Math.max(Math.floor(cardHeight * 0.08), 4)
                }
            };
        }

        /**
         * 計算左側卡片位置
         *
         * @param {number} index - 卡片索引
         * @param {number} columns - 列數
         * @param {number} cardWidth - 卡片寬度
         * @param {number} cardHeight - 卡片高度
         * @param {number} startX - 起始 X 座標
         * @param {number} startY - 起始 Y 座標
         * @returns {object} { x, y }
         */
        calculateLeftCardPosition(index, columns, cardWidth, cardHeight, startX, startY) {
            // 🔥 [v3.0] 使用動態間距確保卡片均勻分布
            const dynamicSpacing = this.dynamicSpacing || 10;
            const row = Math.floor(index / columns);
            const col = index % columns;

            return {
                x: startX + col * (cardWidth + dynamicSpacing),
                y: startY + row * (cardHeight + dynamicSpacing)
            };
        }

        /**
         * 計算右側卡片位置
         *
         * @param {number} index - 卡片索引
         * @param {number} cardHeight - 卡片高度
         * @param {number} startX - 起始 X 座標
         * @param {number} startY - 起始 Y 座標
         * @returns {object} { x, y }
         */
        calculateRightCardPosition(index, cardHeight, startX, startY) {
            const spacing = this.calculateSpacing();

            return {
                x: startX,
                y: startY + index * (cardHeight + spacing.vertical)
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

