# 🔧 Match-Up 獨立統一 - 逐行代碼修改指南

## 📍 修改位置

```
public/games/match-up-game/scenes/game.js (6940 行)

修改 1: 第 1093-1104 行 - 移除 iPad 檢測
修改 2: 第 1975-2096 行 - 移除 iPad 函數
修改 3: 第 2125-2129 行 - 移除 iPad 參數初始化
修改 4: 第 2503-2509 行 - 移除 iPad 參數初始化
修改 5: 第 2108-2120 行 - 簡化 iPad 條件判斷
修改 6: 第 2542-2552 行 - 統一間距邏輯
修改 7: 第 2598-2630 行 - 統一卡片尺寸邏輯
修改 8: 第 3007-3012 行 - 統一字體大小邏輯
```

---

## 🔄 修改 1：移除 iPad 檢測（第 1093-1104 行）

### ❌ 刪除

```javascript
// 修復 1024×768 白屏問題：排除桌面 XGA 分辨率
const isDesktopXGA = width === 1024 && height === 768;
const isRealTablet = width >= 768 && width <= 1024 && height >= 600 && !isDesktopXGA;
const isIPad = isRealTablet;

console.log('🔍 [v46.0] 設備檢測:', {
    width,
    height,
    isDesktopXGA,
    isRealTablet,
    isIPad
});
```

### ✅ 替換為

```javascript
// 統一的寬度檢測
const breakpoint = getBreakpointByWidth(width);

console.log('📐 [統一布局] 寬度檢測:', {
    width,
    height,
    breakpoint: breakpoint.name,
    cols: breakpoint.cols
});
```

---

## 🔄 修改 2：移除 iPad 函數（第 1975-2096 行）

### ❌ 完全刪除

```javascript
// 🔥 第一步：iPad 容器大小分類函數
const classifyIPadSize = (w, h) => {
    // ... 33 行代碼
};

// 🔥 第二步：根據 iPad 大小獲取最優參數
const getIPadOptimalParams = (iPadSize) => {
    // ... 87 行代碼
};
```

### ✅ 替換為統一函數（在 game.js 頂部添加）

```javascript
// ============================================
// 統一的響應式布局系統
// ============================================

const UNIFIED_BREAKPOINTS = {
    mobile: {
        min: 0,
        max: 480,
        cols: 2,
        fontSize: 14,
        spacing: 8,
        margins: { side: 12, top: 16, bottom: 16 }
    },
    mobileLandscape: {
        min: 480,
        max: 640,
        cols: 3,
        fontSize: 16,
        spacing: 10,
        margins: { side: 12, top: 16, bottom: 16 }
    },
    tablet: {
        min: 640,
        max: 768,
        cols: 4,
        fontSize: 18,
        spacing: 12,
        margins: { side: 16, top: 20, bottom: 20 }
    },
    tabletLandscape: {
        min: 768,
        max: 1024,
        cols: 5,
        fontSize: 20,
        spacing: 14,
        margins: { side: 16, top: 20, bottom: 20 }
    },
    desktop: {
        min: 1024,
        max: Infinity,
        cols: 6,
        fontSize: 24,
        spacing: 16,
        margins: { side: 20, top: 24, bottom: 24 }
    }
};

function getBreakpointByWidth(width) {
    for (const [key, bp] of Object.entries(UNIFIED_BREAKPOINTS)) {
        if (width >= bp.min && width <= bp.max) {
            return bp;
        }
    }
    return UNIFIED_BREAKPOINTS.mobile;
}

function calculateResponsiveLayout(width, itemCount) {
    const breakpoint = getBreakpointByWidth(width);
    const cols = Math.min(breakpoint.cols, itemCount);
    const availableWidth = width - (breakpoint.margins.side * 2);
    const cardSize = Math.floor((availableWidth - (breakpoint.spacing * (cols - 1))) / cols);
    
    return {
        breakpoint: breakpoint,
        cols: cols,
        cardSize: cardSize,
        fontSize: breakpoint.fontSize,
        spacing: breakpoint.spacing,
        margins: breakpoint.margins
    };
}
```

---

## 🔄 修改 3 & 4：移除 iPad 參數初始化

### ❌ 刪除第 2125-2129 行

```javascript
let iPadSize = null;
let iPadParams = null;
if (isIPad) {
    iPadSize = classifyIPadSize(width, height);
    iPadParams = getIPadOptimalParams(iPadSize);
    console.log('📱 [v45.0] iPad 參數已初始化:', { ... });
}
```

### ❌ 刪除第 2503-2509 行

```javascript
let iPadSize = null;
let iPadParams = null;

if (isIPad) {
    iPadSize = classifyIPadSize(width, height);
    iPadParams = getIPadOptimalParams(iPadSize);
    // ...
}
```

---

## 🔄 修改 5-8：統一佈局邏輯

### 模式：替換所有 iPad 條件判斷

#### ❌ 舊模式

```javascript
if (isIPad && iPadParams) {
    // iPad 特殊邏輯
    cardWidth = iPadParams.xxx;
    cardHeight = iPadParams.yyy;
} else {
    // 其他設備邏輯
    cardWidth = calculateXXX();
    cardHeight = calculateYYY();
}
```

#### ✅ 新模式

```javascript
// 統一邏輯
const layout = calculateResponsiveLayout(width, itemCount);
cardWidth = layout.cardSize;
cardHeight = layout.cardSize;
```

### 具體修改位置

**修改 5: 第 2108-2120 行**
```javascript
// ❌ 刪除 if (isIPad) { ... } else { ... }
// ✅ 替換為
const layout = calculateResponsiveLayout(width, itemCount);
cardWidth = layout.cardSize;
cardHeight = layout.cardSize;
```

**修改 6: 第 2542-2552 行**
```javascript
// ❌ 刪除 if (isIPad && iPadParams) { ... } else { ... }
// ✅ 替換為
const layout = calculateResponsiveLayout(width, itemCount);
horizontalSpacing = layout.spacing;
verticalSpacing = layout.spacing;
```

**修改 7: 第 2598-2630 行**
```javascript
// ❌ 刪除 if (isIPad) { ... } else { ... }
// ✅ 替換為
const layout = calculateResponsiveLayout(width, itemCount);
minSquareSize = layout.cardSize;
optimalCols = layout.cols;
```

**修改 8: 第 3007-3012 行**
```javascript
// ❌ 刪除 if (isIPad && iPadParams) { ... } else { ... }
// ✅ 替換為
const layout = calculateResponsiveLayout(width, itemCount);
baseFontSize = layout.fontSize;
```

---

## 📋 修改檢查清單

- [ ] 修改 1：移除 iPad 檢測（第 1093-1104 行）
- [ ] 修改 2：移除 iPad 函數（第 1975-2096 行）
- [ ] 修改 3：移除 iPad 參數初始化（第 2125-2129 行）
- [ ] 修改 4：移除 iPad 參數初始化（第 2503-2509 行）
- [ ] 修改 5：統一卡片尺寸邏輯（第 2108-2120 行）
- [ ] 修改 6：統一間距邏輯（第 2542-2552 行）
- [ ] 修改 7：統一卡片尺寸邏輯（第 2598-2630 行）
- [ ] 修改 8：統一字體大小邏輯（第 3007-3012 行）
- [ ] 在 game.js 頂部添加統一函數
- [ ] 驗證代碼語法
- [ ] 測試所有解析度
- [ ] 推送到 GitHub

---

**準備好開始修改了嗎？** 🚀

