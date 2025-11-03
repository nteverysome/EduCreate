/**
 * 模塊化響應式設計系統 - 為 Phaser 遊戲設計
 * 基於業界標準：預定義斷點 + 設計令牌 + 組件化架構
 */

// ============================================
// 第 1 層：預定義斷點系統
// ============================================
class BreakpointSystem {
    constructor() {
        // 預定義的斷點（基於業界標準）
        this.breakpoints = {
            mobile: { min: 0, max: 767, name: 'mobile', cols: 1 },
            tablet: { min: 768, max: 1023, name: 'tablet', cols: 2 },
            desktop: { min: 1024, max: 1279, name: 'desktop', cols: 3 },
            wide: { min: 1280, max: Infinity, name: 'wide', cols: 4 }
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

    /**
     * 添加自定義斷點
     */
    addBreakpoint(name, min, max, cols) {
        this.breakpoints[name] = { min, max, name, cols };
    }
}

// ============================================
// 第 2 層：設計令牌系統
// ============================================
class DesignTokens {
    constructor() {
        // 統一定義所有設計值
        this.tokens = {
            // 間距令牌
            spacing: {
                xs: 4,
                sm: 8,
                md: 12,
                lg: 16,
                xl: 20,
                xxl: 24
            },

            // 字體大小令牌
            fontSize: {
                xs: 12,
                sm: 14,
                md: 16,
                lg: 18,
                xl: 20,
                xxl: 24
            },

            // 邊距令牌（根據斷點）
            margins: {
                mobile: { side: 12, top: 16, bottom: 16 },
                tablet: { side: 16, top: 20, bottom: 20 },
                desktop: { side: 20, top: 24, bottom: 24 },
                wide: { side: 24, top: 28, bottom: 28 }
            },

            // 間距令牌（根據斷點）
            gaps: {
                mobile: { horizontal: 8, vertical: 12 },
                tablet: { horizontal: 12, vertical: 16 },
                desktop: { horizontal: 16, vertical: 20 },
                wide: { horizontal: 20, vertical: 24 }
            },

            // 卡片大小令牌（根據斷點）
            cardSize: {
                mobile: { width: 100, height: 120 },
                tablet: { width: 140, height: 160 },
                desktop: { width: 160, height: 180 },
                wide: { width: 180, height: 200 }
            }
        };
    }

    /**
     * 獲取令牌值
     */
    get(category, key, breakpoint = null) {
        const token = this.tokens[category];
        if (!token) return null;

        // 如果指定了斷點，返回該斷點的值
        if (breakpoint && token[breakpoint]) {
            return token[breakpoint][key];
        }

        // 否則返回通用值
        return token[key];
    }

    /**
     * 獲取所有令牌
     */
    getAll(category) {
        return this.tokens[category];
    }

    /**
     * 設置令牌值
     */
    set(category, key, value) {
        if (!this.tokens[category]) {
            this.tokens[category] = {};
        }
        this.tokens[category][key] = value;
    }

    /**
     * 添加新的令牌類別
     */
    addCategory(name, values) {
        this.tokens[name] = values;
    }
}

// ============================================
// 第 3 層：響應式佈局引擎
// ============================================
class ResponsiveLayout {
    constructor(containerWidth, containerHeight) {
        this.breakpointSystem = new BreakpointSystem();
        this.designTokens = new DesignTokens();

        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.breakpoint = this.breakpointSystem.getBreakpoint(containerWidth);
        this.isPortrait = containerHeight > containerWidth;
    }

    /**
     * 獲取當前斷點
     */
    getBreakpoint() {
        return this.breakpoint;
    }

    /**
     * 獲取邊距
     */
    getMargins() {
        return this.designTokens.get('margins', null, this.breakpoint);
    }

    /**
     * 獲取間距
     */
    getGaps() {
        return this.designTokens.get('gaps', null, this.breakpoint);
    }

    /**
     * 獲取卡片大小
     */
    getCardSize() {
        return this.designTokens.get('cardSize', null, this.breakpoint);
    }

    /**
     * 獲取列數
     */
    getColumns() {
        const info = this.breakpointSystem.getBreakpointInfo(this.breakpoint);
        return info.cols;
    }

    /**
     * 計算可用寬度
     */
    getAvailableWidth() {
        const margins = this.getMargins();
        return this.containerWidth - (margins.side * 2);
    }

    /**
     * 計算可用高度
     */
    getAvailableHeight() {
        const margins = this.getMargins();
        return this.containerHeight - (margins.top + margins.bottom);
    }

    /**
     * 計算列寬
     */
    getColumnWidth() {
        const cols = this.getColumns();
        const gaps = this.getGaps();
        const availableWidth = this.getAvailableWidth();
        const totalGap = (cols - 1) * gaps.horizontal;
        return (availableWidth - totalGap) / cols;
    }

    /**
     * 計算行高
     */
    getRowHeight() {
        const gaps = this.getGaps();
        const cardSize = this.getCardSize();
        return cardSize.height + gaps.vertical;
    }

    /**
     * 計算可以顯示的行數
     */
    getRows() {
        const availableHeight = this.getAvailableHeight();
        const rowHeight = this.getRowHeight();
        return Math.floor(availableHeight / rowHeight);
    }

    /**
     * 獲取字體大小
     */
    getFontSize(size = 'md') {
        return this.designTokens.get('fontSize', size);
    }

    /**
     * 獲取間距
     */
    getSpacing(size = 'md') {
        return this.designTokens.get('spacing', size);
    }

    /**
     * 獲取完整的佈局配置
     */
    getLayoutConfig() {
        return {
            breakpoint: this.breakpoint,
            isPortrait: this.isPortrait,
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,
            margins: this.getMargins(),
            gaps: this.getGaps(),
            cardSize: this.getCardSize(),
            columns: this.getColumns(),
            rows: this.getRows(),
            availableWidth: this.getAvailableWidth(),
            availableHeight: this.getAvailableHeight(),
            columnWidth: this.getColumnWidth(),
            rowHeight: this.getRowHeight()
        };
    }
}

// ============================================
// 第 4 層：組件化架構
// ============================================
class ResponsiveComponent {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        this.layout = new ResponsiveLayout(
            scene.cameras.main.width,
            scene.cameras.main.height
        );
    }

    /**
     * 獲取組件大小
     */
    getSize() {
        return this.layout.getCardSize();
    }

    /**
     * 獲取組件位置
     */
    getPosition(row, col) {
        const margins = this.layout.getMargins();
        const gaps = this.layout.getGaps();
        const columnWidth = this.layout.getColumnWidth();
        const rowHeight = this.layout.getRowHeight();

        const x = margins.side + (col * (columnWidth + gaps.horizontal));
        const y = margins.top + (row * rowHeight);

        return { x, y };
    }

    /**
     * 獲取組件配置
     */
    getComponentConfig() {
        return {
            size: this.getSize(),
            fontSize: this.layout.getFontSize(),
            spacing: this.layout.getSpacing(),
            breakpoint: this.layout.getBreakpoint()
        };
    }

    /**
     * 響應屏幕大小變化
     */
    onResize(newWidth, newHeight) {
        this.layout = new ResponsiveLayout(newWidth, newHeight);
        this.update();
    }

    /**
     * 更新組件（子類實現）
     */
    update() {
        // 子類實現
    }
}

// ============================================
// 使用示例
// ============================================

// 在 Phaser 場景中使用
class GameScene extends Phaser.Scene {
    create() {
        // 創建響應式佈局
        const layout = new ResponsiveLayout(
            this.cameras.main.width,
            this.cameras.main.height
        );

        // 獲取佈局配置
        const config = layout.getLayoutConfig();
        console.log('佈局配置:', config);

        // 使用佈局配置創建卡片
        const columns = config.columns;
        const rows = config.rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const pos = layout.getPosition(row, col);
                const size = layout.getCardSize();

                // 創建卡片
                const card = this.add.rectangle(
                    pos.x + size.width / 2,
                    pos.y + size.height / 2,
                    size.width,
                    size.height,
                    0x00ff00
                );
            }
        }

        // 監聽屏幕大小變化
        this.scale.on('resize', (gameSize) => {
            layout.onResize(gameSize.width, gameSize.height);
        });
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BreakpointSystem,
        DesignTokens,
        ResponsiveLayout,
        ResponsiveComponent
    };
}

