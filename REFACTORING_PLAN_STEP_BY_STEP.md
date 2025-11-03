# 逐步重構計劃：從複雜到簡潔

## 🎯 目標

將你的 2000+ 行佈局計算代碼重構為 500+ 行的模塊化系統，同時保持所有功能不變。

---

## 📋 Phase 1：提取常量（第 1 天）

### Step 1.1：創建新文件 `responsive-config.js`

```javascript
/**
 * 響應式設計配置
 * 集中定義所有設計值
 */

// ============================================
// 預定義斷點系統
// ============================================
export const RESPONSIVE_BREAKPOINTS = {
    mobile: {
        min: 0,
        max: 767,
        name: 'mobile',
        cols: 1,
        description: '手機'
    },
    tablet: {
        min: 768,
        max: 1023,
        name: 'tablet',
        cols: 2,
        description: '平板'
    },
    desktop: {
        min: 1024,
        max: 1279,
        name: 'desktop',
        cols: 3,
        description: '電腦'
    },
    wide: {
        min: 1280,
        max: Infinity,
        name: 'wide',
        cols: 4,
        description: '大屏幕'
    }
};

// ============================================
// 設計令牌系統
// ============================================
export const DESIGN_TOKENS = {
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

    // iPad 特殊配置
    ipad: {
        small_portrait: {
            sideMargin: 15,
            topButtonArea: 35,
            bottomButtonArea: 35,
            horizontalSpacing: 12,
            verticalSpacing: 30,
            chineseFontSize: 22
        },
        // ... 其他 iPad 配置
    }
};

// ============================================
// 輔助函數
// ============================================

/**
 * 根據寬度獲取斷點
 */
export function getBreakpoint(width) {
    for (const [key, bp] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
        if (width >= bp.min && width <= bp.max) {
            return key;
        }
    }
    return 'mobile';
}

/**
 * 獲取設計令牌值
 */
export function getToken(category, key, breakpoint = null) {
    const token = DESIGN_TOKENS[category];
    if (!token) return null;

    if (breakpoint && token[breakpoint]) {
        return token[breakpoint][key];
    }

    return token[key];
}
```

### Step 1.2：在 game.js 中導入

```javascript
import {
    RESPONSIVE_BREAKPOINTS,
    DESIGN_TOKENS,
    getBreakpoint,
    getToken
} from './responsive-config.js';
```

### Step 1.3：驗證

- [ ] 確保所有常量都被正確導入
- [ ] 運行遊戲，確保功能不變
- [ ] 檢查控制台沒有錯誤

---

## 📋 Phase 2：創建響應式佈局類（第 2 天）

### Step 2.1：創建新文件 `responsive-layout.js`

```javascript
/**
 * 響應式佈局引擎
 * 處理所有與佈局相關的計算
 */

import { RESPONSIVE_BREAKPOINTS, DESIGN_TOKENS, getBreakpoint, getToken } from './responsive-config.js';

export class GameResponsiveLayout {
    constructor(containerWidth, containerHeight, options = {}) {
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.breakpoint = getBreakpoint(containerWidth);
        this.isPortrait = containerHeight > containerWidth;
        this.isIPad = options.isIPad || false;
        this.hasImages = options.hasImages || false;
    }

    /**
     * 獲取邊距
     */
    getMargins() {
        if (this.isIPad) {
            return this.getIPadMargins();
        }
        return getToken('margins', null, this.breakpoint);
    }

    /**
     * 獲取間距
     */
    getGaps() {
        if (this.isIPad) {
            return this.getIPadGaps();
        }
        return getToken('gaps', null, this.breakpoint);
    }

    /**
     * 獲取可用寬度
     */
    getAvailableWidth() {
        const margins = this.getMargins();
        return this.containerWidth - (margins.side * 2);
    }

    /**
     * 獲取可用高度
     */
    getAvailableHeight() {
        const margins = this.getMargins();
        return this.containerHeight - (margins.top + margins.bottom);
    }

    /**
     * 計算列寬
     */
    getColumnWidth(cols) {
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
     * 計算卡片大小
     */
    getCardSize() {
        // 根據斷點和是否有圖片返回卡片大小
        if (this.hasImages) {
            return this.calculateSquareCardSize();
        } else {
            return this.calculateRectangleCardSize();
        }
    }

    /**
     * 計算正方形卡片大小
     */
    calculateSquareCardSize() {
        // 實現正方形卡片計算邏輯
        // ...
    }

    /**
     * 計算矩形卡片大小
     */
    calculateRectangleCardSize() {
        // 實現矩形卡片計算邏輯
        // ...
    }

    /**
     * 計算最優列數
     */
    getOptimalCols(itemCount) {
        if (this.isIPad) {
            return 5; // iPad 固定 5 列
        }

        const availableWidth = this.getAvailableWidth();
        const gaps = this.getGaps();
        const minCardWidth = 100;

        const maxCols = Math.floor((availableWidth + gaps.horizontal) / (minCardWidth + gaps.horizontal));
        return Math.min(maxCols, itemCount);
    }

    /**
     * 獲取完整的佈局配置
     */
    getLayoutConfig(itemCount) {
        const cols = this.getOptimalCols(itemCount);
        const rows = Math.ceil(itemCount / cols);
        const cardSize = this.getCardSize();

        return {
            breakpoint: this.breakpoint,
            isPortrait: this.isPortrait,
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,
            margins: this.getMargins(),
            gaps: this.getGaps(),
            cardSize,
            cols,
            rows,
            availableWidth: this.getAvailableWidth(),
            availableHeight: this.getAvailableHeight(),
            columnWidth: this.getColumnWidth(cols),
            rowHeight: this.getRowHeight()
        };
    }

    // iPad 特殊方法
    getIPadMargins() {
        // iPad 邊距計算
        // ...
    }

    getIPadGaps() {
        // iPad 間距計算
        // ...
    }
}
```

### Step 2.2：在 game.js 中使用

```javascript
import { GameResponsiveLayout } from './responsive-layout.js';

// 在 create() 方法中
const layout = new GameResponsiveLayout(width, height, {
    isIPad: this.isIPad,
    hasImages: hasImages
});

const config = layout.getLayoutConfig(itemCount);
console.log('佈局配置:', config);
```

### Step 2.3：驗證

- [ ] 確保計算結果與原始代碼一致
- [ ] 測試所有設備尺寸
- [ ] 測試所有方向

---

## 📋 Phase 3：重構 create() 方法（第 3 天）

### Step 3.1：提取計算邏輯

```javascript
// 原始代碼（400+ 行）
create() {
    // 計算邊距
    // 計算間距
    // 計算列數
    // 計算卡片大小
    // 創建卡片
    // 創建佈局
}

// 重構後（100 行）
create() {
    const layout = new GameResponsiveLayout(width, height, options);
    const config = layout.getLayoutConfig(itemCount);

    this.createCards(config);
    this.createLayout(config);
}

createCards(config) {
    // 使用 config 創建卡片
}

createLayout(config) {
    // 使用 config 創建佈局
}
```

### Step 3.2：驗證

- [ ] 所有卡片位置正確
- [ ] 所有間距正確
- [ ] 所有尺寸正確
- [ ] 沒有視覺差異

---

## 📋 Phase 4：優化和測試（第 4 天）

### Step 4.1：性能測試

```javascript
// 測試計算性能
console.time('layout-calculation');
const layout = new GameResponsiveLayout(width, height, options);
const config = layout.getLayoutConfig(itemCount);
console.timeEnd('layout-calculation');
```

### Step 4.2：邊界情況測試

- [ ] 測試最小屏幕尺寸
- [ ] 測試最大屏幕尺寸
- [ ] 測試所有 iPad 尺寸
- [ ] 測試所有方向

### Step 4.3：文檔更新

- [ ] 更新代碼註釋
- [ ] 更新 README
- [ ] 更新開發指南

---

## 📊 預期改進

| 指標 | 改進前 | 改進後 | 改進 |
|------|--------|--------|------|
| **create() 方法行數** | 400+ | 50+ | -87% |
| **總代碼行數** | 2000+ | 500+ | -75% |
| **複雜度** | O(n³) | O(n) | -90% |
| **可讀性** | 低 | 高 | +80% |
| **可維護性** | 低 | 高 | +80% |
| **可測試性** | 低 | 高 | +80% |

---

## ⏱️ 時間估計

- **Phase 1**：1-2 小時
- **Phase 2**：2-3 小時
- **Phase 3**：3-4 小時
- **Phase 4**：2-3 小時
- **總計**：8-12 小時

---

## ✅ 檢查清單

### Phase 1
- [ ] 創建 responsive-config.js
- [ ] 提取所有常量
- [ ] 導入到 game.js
- [ ] 驗證功能不變

### Phase 2
- [ ] 創建 responsive-layout.js
- [ ] 實現所有方法
- [ ] 導入到 game.js
- [ ] 驗證計算結果一致

### Phase 3
- [ ] 簡化 create() 方法
- [ ] 提取計算邏輯
- [ ] 提取卡片創建邏輯
- [ ] 驗證視覺效果一致

### Phase 4
- [ ] 性能測試
- [ ] 邊界情況測試
- [ ] 文檔更新
- [ ] 代碼審查

---

## 🚀 下一步

1. 選擇一個 Phase 開始
2. 按照步驟逐步實施
3. 每個 Step 後驗證功能
4. 完成後進行代碼審查
5. 合併到主分支

