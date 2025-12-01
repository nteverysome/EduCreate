/**
 * 分離模式完整響應式配置系統
 * 
 * 基於混合模式的最佳實踐，為分離模式提供：
 * - 斷點系統（Breakpoint System）
 * - 動態列數計算
 * - 卡片大小自適應
 * - 字體大小響應式調整
 * - 邊距和間距的動態計算
 */

if (typeof SeparatedResponsiveConfig === 'undefined') {
    /**
     * 斷點系統 - 預定義不同解析度的配置
     */
    class BreakpointSystem {
        constructor() {
            this.breakpoints = {
                mobile: { 
                    min: 0, 
                    max: 767, 
                    name: 'mobile', 
                    cols: 1,
                    sideMargin: 8,
                    spacing: 8,
                    minCardSize: 100
                },
                tablet: { 
                    min: 768, 
                    max: 1023, 
                    name: 'tablet', 
                    cols: 2,
                    sideMargin: 12,
                    spacing: 10,
                    minCardSize: 120
                },
                desktop: { 
                    min: 1024, 
                    max: 1279, 
                    name: 'desktop', 
                    cols: 3,
                    sideMargin: 16,
                    spacing: 12,
                    minCardSize: 140
                },
                wide: { 
                    min: 1280, 
                    max: Infinity, 
                    name: 'wide', 
                    cols: 4,
                    sideMargin: 20,
                    spacing: 14,
                    minCardSize: 160
                }
            };
        }

        /**
         * 根據寬度獲取當前斷點
         */
        getBreakpoint(width) {
            for (const [key, bp] of Object.entries(this.breakpoints)) {
                if (width >= bp.min && width <= bp.max) {
                    return key;
                }
            }
            return 'mobile';
        }

        /**
         * 獲取斷點信息
         */
        getBreakpointInfo(breakpoint) {
            return this.breakpoints[breakpoint];
        }
    }

    /**
     * 動態列數計算器
     */
    class ColumnCalculator {
        /**
         * 計算最優列數
         */
        static calculateOptimalCols(availableWidth, minCardWidth, spacing, maxLimit) {
            const maxPossible = Math.floor(
                (availableWidth - spacing) / (minCardWidth + spacing)
            );
            return Math.min(maxPossible, maxLimit);
        }

        /**
         * 根據寬高比應用列數上限
         */
        static getColsLimitByAspectRatio(aspectRatio) {
            if (aspectRatio > 1.5) {
                return 10;  // 超寬螢幕
            } else if (aspectRatio > 1.2) {
                return 8;   // 標準螢幕
            } else {
                return 5;   // 直向螢幕
            }
        }
    }

    /**
     * 卡片大小計算器
     */
    class CardSizeCalculator {
        /**
         * 計算卡片寬度
         */
        static calculateCardWidth(availableWidth, cols, spacing) {
            const totalSpacing = spacing * (cols - 1);
            return (availableWidth - totalSpacing) / cols;
        }

        /**
         * 計算卡片高度（基於寬度和寬高比）
         */
        static calculateCardHeight(cardWidth, aspectRatio = 1) {
            return cardWidth / aspectRatio;
        }

        /**
         * 限制卡片大小在合理範圍內
         */
        static constrainCardSize(width, height, minSize = 50, maxSize = 300) {
            return {
                width: Math.max(minSize, Math.min(maxSize, width)),
                height: Math.max(minSize, Math.min(maxSize, height))
            };
        }
    }

    /**
     * 字體大小計算器
     */
    class FontSizeCalculator {
        /**
         * 計算最優字體大小（基於寬度）
         */
        static calculateByWidth(width) {
            if (width < 480) return 12;
            if (width >= 1024) return 24;

            const ratio = (width - 480) / (1024 - 480);
            return 12 + (24 - 12) * ratio;
        }

        /**
         * 計算中文字體大小（基於卡片高度和文字長度）
         */
        static calculateChineseFontSize(cardHeight, textLength, mode = 'desktop') {
            // 基礎大小
            const baseSize = mode === 'compact'
                ? Math.max(14, Math.min(32, cardHeight * 0.4))
                : Math.max(16, Math.min(48, cardHeight * 0.6));

            // 根據文字長度調整
            const lengthAdjustments = {
                1: 1.0,
                2: 1.0,
                3: 0.85,
                4: 0.80,
                5: 0.75,
                6: 0.70,
                default: 0.60
            };

            const adjustment = lengthAdjustments[textLength] || lengthAdjustments.default;
            return Math.round(baseSize * adjustment);
        }
    }

    /**
     * 邊距和間距計算器
     */
    class MarginCalculator {
        /**
         * 計算動態邊距（基於項目數量）
         */
        static calculateDynamicMargin(baseMargin, itemCount, minMargin = 10) {
            if (itemCount <= 5) return baseMargin;
            const reduction = (itemCount - 5) * 2;
            return Math.max(minMargin, baseMargin - reduction);
        }

        /**
         * 計算動態間距（基於項目數量）
         */
        static calculateDynamicSpacing(baseSpacing, itemCount, minSpacing = 2) {
            if (itemCount <= 5) return baseSpacing;
            const reduction = (itemCount - 5) * 0.5;
            return Math.max(minSpacing, baseSpacing - reduction);
        }

        /**
         * 計算容器邊距（基於解析度）
         */
        static calculateContainerMargins(width, height, breakpoint) {
            const bpInfo = new BreakpointSystem().getBreakpointInfo(breakpoint);
            return {
                side: bpInfo.sideMargin,
                top: height * 0.083,      // 8.3% 頂部邊距
                bottom: height * 0.10,    // 10% 底部邊距
                spacing: bpInfo.spacing
            };
        }
    }

    /**
     * 主響應式配置類
     */
    class SeparatedResponsiveConfig {
        constructor(width, height, itemCount = 1) {
            this.width = width;
            this.height = height;
            this.itemCount = itemCount;
            this.breakpointSystem = new BreakpointSystem();
            this.breakpoint = this.breakpointSystem.getBreakpoint(width);
            this.bpInfo = this.breakpointSystem.getBreakpointInfo(this.breakpoint);
        }

        /**
         * 計算完整的響應式布局
         */
        calculateLayout() {
            const availableWidth = this.width - (this.bpInfo.sideMargin * 2);
            const availableHeight = this.height - (this.height * 0.083) - (this.height * 0.10);

            // 計算列數
            const cols = ColumnCalculator.calculateOptimalCols(
                availableWidth,
                this.bpInfo.minCardSize,
                this.bpInfo.spacing,
                this.bpInfo.cols
            );

            // 計算卡片大小
            const cardWidth = CardSizeCalculator.calculateCardWidth(
                availableWidth,
                cols,
                this.bpInfo.spacing
            );

            const cardHeight = CardSizeCalculator.calculateCardHeight(cardWidth, 1.2);

            // 限制卡片大小
            const constrainedSize = CardSizeCalculator.constrainCardSize(
                cardWidth,
                cardHeight,
                this.bpInfo.minCardSize,
                300
            );

            // 計算字體大小
            const fontSize = FontSizeCalculator.calculateByWidth(this.width);

            // 計算邊距
            const margins = MarginCalculator.calculateContainerMargins(
                this.width,
                this.height,
                this.breakpoint
            );

            return {
                breakpoint: this.breakpoint,
                cols,
                cardSize: constrainedSize,
                fontSize,
                margins,
                availableWidth,
                availableHeight
            };
        }

        /**
         * 計算左右容器的位置和大小
         * 🔥 [v26.0] 改進：考慮外框寬度，確保卡片不被切割
         */
        calculateContainerPositions() {
            const layout = this.calculateLayout();
            const containerWidth = this.width / 2;
            const usableWidth = containerWidth - layout.margins.side;

            // 🔥 [v26.0] 外框邊距（來自 SeparatedMarginConfig）
            const framePadding = 10;  // 外框與卡片間距
            const cardWidth = layout.cardSize.width;
            const boxWidth = cardWidth + framePadding * 2;  // 外框寬度

            return {
                left: {
                    x: layout.margins.side + usableWidth / 2,
                    width: usableWidth,
                    containerWidth: containerWidth,
                    // 🔥 [v26.0] 新增：外框信息
                    boxWidth: boxWidth,
                    framePadding: framePadding,
                    cardWidth: cardWidth
                },
                right: {
                    x: this.width / 2 + layout.margins.side + usableWidth / 2,
                    width: usableWidth,
                    containerWidth: containerWidth,
                    // 🔥 [v26.0] 新增：外框信息
                    boxWidth: boxWidth,
                    framePadding: framePadding,
                    cardWidth: cardWidth
                }
            };
        }

        /**
         * 獲取當前斷點信息
         */
        getBreakpointInfo() {
            return {
                name: this.breakpoint,
                width: this.width,
                height: this.height,
                ...this.bpInfo
            };
        }

        /**
         * 打印配置信息（用於調試）
         */
        printConfig() {
            const layout = this.calculateLayout();
            console.log('📱 分離模式響應式配置:', {
                breakpoint: this.breakpoint,
                screenSize: `${this.width}×${this.height}`,
                itemCount: this.itemCount,
                layout
            });
        }
    }

    // 分配到全局作用域
    window.SeparatedResponsiveConfig = SeparatedResponsiveConfig;
    window.BreakpointSystem = BreakpointSystem;
    window.ColumnCalculator = ColumnCalculator;
    window.CardSizeCalculator = CardSizeCalculator;
    window.FontSizeCalculator = FontSizeCalculator;
    window.MarginCalculator = MarginCalculator;
}

