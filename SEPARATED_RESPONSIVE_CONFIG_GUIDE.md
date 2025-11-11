# 分離模式完整響應式配置系統使用指南

## 📋 目錄

1. [概述](#概述)
2. [核心組件](#核心組件)
3. [使用示例](#使用示例)
4. [API 參考](#api-參考)
5. [最佳實踐](#最佳實踐)
6. [遷移指南](#遷移指南)

---

## 概述

`SeparatedResponsiveConfig` 是一個完整的響應式設計系統，基於混合模式的最佳實踐，為分離模式提供：

- ✅ **斷點系統** - 預定義不同解析度的配置
- ✅ **動態列數計算** - 根據寬度自動計算最優列數
- ✅ **卡片大小自適應** - 根據容器寬度動態調整卡片大小
- ✅ **字體大小響應式** - 根據解析度和文字長度調整字體
- ✅ **邊距和間距動態計算** - 根據項目數量自動調整

---

## 核心組件

### 1. BreakpointSystem（斷點系統）

定義了 4 個預定義的斷點：

| 斷點 | 寬度範圍 | 列數 | 邊距 | 最小卡片 |
|------|---------|------|------|---------|
| mobile | 0-767px | 1 | 8px | 100px |
| tablet | 768-1023px | 2 | 12px | 120px |
| desktop | 1024-1279px | 3 | 16px | 140px |
| wide | 1280px+ | 4 | 20px | 160px |

```javascript
const bpSystem = new BreakpointSystem();
const breakpoint = bpSystem.getBreakpoint(1024);  // 返回 'desktop'
const info = bpSystem.getBreakpointInfo('desktop');
```

### 2. ColumnCalculator（列數計算器）

計算最優的列數：

```javascript
const cols = ColumnCalculator.calculateOptimalCols(
    availableWidth,    // 可用寬度
    minCardWidth,       // 最小卡片寬度
    spacing,            // 卡片間距
    maxLimit            // 最大列數限制
);
```

### 3. CardSizeCalculator（卡片大小計算器）

計算卡片的寬度和高度：

```javascript
const width = CardSizeCalculator.calculateCardWidth(
    availableWidth,     // 可用寬度
    cols,               // 列數
    spacing             // 間距
);

const height = CardSizeCalculator.calculateCardHeight(
    cardWidth,          // 卡片寬度
    aspectRatio         // 寬高比（默認 1）
);

const constrained = CardSizeCalculator.constrainCardSize(
    width,              // 寬度
    height,             // 高度
    minSize,            // 最小尺寸
    maxSize             // 最大尺寸
);
```

### 4. FontSizeCalculator（字體大小計算器）

計算響應式字體大小：

```javascript
// 基於寬度計算
const fontSize = FontSizeCalculator.calculateByWidth(width);

// 基於卡片高度和文字長度計算中文字體
const chineseFontSize = FontSizeCalculator.calculateChineseFontSize(
    cardHeight,         // 卡片高度
    textLength,         // 文字長度（1-6）
    mode                // 'compact' 或 'desktop'
);
```

### 5. MarginCalculator（邊距計算器）

計算動態邊距和間距：

```javascript
// 動態邊距
const margin = MarginCalculator.calculateDynamicMargin(
    baseMargin,         // 基礎邊距
    itemCount,          // 項目數量
    minMargin           // 最小邊距
);

// 動態間距
const spacing = MarginCalculator.calculateDynamicSpacing(
    baseSpacing,        // 基礎間距
    itemCount,          // 項目數量
    minSpacing          // 最小間距
);

// 容器邊距
const margins = MarginCalculator.calculateContainerMargins(
    width,              // 屏幕寬度
    height,             // 屏幕高度
    breakpoint          // 斷點名稱
);
```

### 6. SeparatedResponsiveConfig（主配置類）

整合所有計算器的主類：

```javascript
const config = new SeparatedResponsiveConfig(
    width,              // 屏幕寬度
    height,             // 屏幕高度
    itemCount           // 項目數量（可選）
);

// 計算完整布局
const layout = config.calculateLayout();
// 返回: { breakpoint, cols, cardSize, fontSize, margins, availableWidth, availableHeight }

// 計算容器位置
const positions = config.calculateContainerPositions();
// 返回: { left: {...}, right: {...} }

// 獲取斷點信息
const bpInfo = config.getBreakpointInfo();

// 打印配置（調試用）
config.printConfig();
```

---

## 使用示例

### 示例 1: 基本使用

```javascript
// 創建配置實例
const config = new SeparatedResponsiveConfig(1024, 768, 10);

// 獲取完整布局
const layout = config.calculateLayout();

console.log(`
    斷點: ${layout.breakpoint}
    卡片大小: ${layout.cardSize.width}×${layout.cardSize.height}px
    列數: ${layout.cols}
    字體大小: ${layout.fontSize}px
    邊距: ${JSON.stringify(layout.margins)}
`);
```

### 示例 2: 在 game.js 中使用

```javascript
// 在 createSeparatedLayout 方法中
createSeparatedLayout(pairs, width, height) {
    // 創建響應式配置
    const config = new SeparatedResponsiveConfig(width, height, pairs.length);
    const layout = config.calculateLayout();
    const positions = config.calculateContainerPositions();

    // 使用計算結果
    const cardWidth = layout.cardSize.width;
    const cardHeight = layout.cardSize.height;
    const fontSize = layout.fontSize;

    // 創建左側卡片
    pairs.forEach((pair, index) => {
        const x = positions.left.x;
        const y = positions.left.y + index * (cardHeight + layout.margins.spacing);
        
        this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, fontSize);
    });

    // 創建右側卡片
    pairs.forEach((pair, index) => {
        const x = positions.right.x;
        const y = positions.right.y + index * (cardHeight + layout.margins.spacing);
        
        this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, fontSize);
    });
}
```

### 示例 3: 動態調整

```javascript
// 監聽窗口大小變化
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // 重新計算布局
    const config = new SeparatedResponsiveConfig(newWidth, newHeight, itemCount);
    const newLayout = config.calculateLayout();

    // 如果斷點改變，重新渲染
    if (newLayout.breakpoint !== currentBreakpoint) {
        currentBreakpoint = newLayout.breakpoint;
        rerenderCards(newLayout);
    }
});
```

---

## API 參考

### SeparatedResponsiveConfig

#### 構造函數

```javascript
new SeparatedResponsiveConfig(width, height, itemCount = 1)
```

#### 方法

| 方法 | 返回值 | 說明 |
|------|--------|------|
| `calculateLayout()` | Object | 計算完整布局 |
| `calculateContainerPositions()` | Object | 計算容器位置 |
| `getBreakpointInfo()` | Object | 獲取斷點信息 |
| `printConfig()` | void | 打印配置（調試用） |

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `width` | number | 屏幕寬度 |
| `height` | number | 屏幕高度 |
| `itemCount` | number | 項目數量 |
| `breakpoint` | string | 當前斷點 |

---

## 最佳實踐

### 1. 緩存配置對象

```javascript
// ❌ 不好 - 每次都創建新對象
for (let i = 0; i < 100; i++) {
    const config = new SeparatedResponsiveConfig(width, height);
    // ...
}

// ✅ 好 - 緩存配置對象
const config = new SeparatedResponsiveConfig(width, height);
for (let i = 0; i < 100; i++) {
    const layout = config.calculateLayout();
    // ...
}
```

### 2. 監聽斷點變化

```javascript
let currentBreakpoint = null;

window.addEventListener('resize', () => {
    const config = new SeparatedResponsiveConfig(
        window.innerWidth,
        window.innerHeight
    );

    if (config.breakpoint !== currentBreakpoint) {
        currentBreakpoint = config.breakpoint;
        console.log(`斷點已改變: ${currentBreakpoint}`);
        // 觸發重新渲染
    }
});
```

### 3. 調試配置

```javascript
// 在控制台中
const config = new SeparatedResponsiveConfig(1024, 768, 10);
config.printConfig();

// 或者直接訪問
console.log(config.calculateLayout());
console.log(config.calculateContainerPositions());
```

---

## 遷移指南

### 從舊系統遷移

#### 步驟 1: 引入新配置

```html
<script src="/games/match-up-game/config/separated-responsive-config.js"></script>
```

#### 步驟 2: 替換硬編碼值

**舊代碼:**
```javascript
const cardWidth = 200;
const cardHeight = 150;
const fontSize = 18;
const sideMargin = 16;
```

**新代碼:**
```javascript
const config = new SeparatedResponsiveConfig(width, height, itemCount);
const layout = config.calculateLayout();

const cardWidth = layout.cardSize.width;
const cardHeight = layout.cardSize.height;
const fontSize = layout.fontSize;
const sideMargin = layout.margins.side;
```

#### 步驟 3: 測試各種解析度

```javascript
// 運行測試
SeparatedResponsiveConfigTest.runAllTests();
```

---

## 測試

運行測試套件：

```javascript
// 在瀏覽器控制台中
SeparatedResponsiveConfigTest.runAllTests();
```

測試包括：
- ✅ 斷點檢測
- ✅ 卡片大小計算
- ✅ 字體大小計算
- ✅ 邊距計算
- ✅ 完整布局計算
- ✅ 真實場景測試

---

## 常見問題

### Q: 如何自定義斷點？

A: 修改 `BreakpointSystem` 類中的 `breakpoints` 對象：

```javascript
this.breakpoints = {
    mobile: { min: 0, max: 600, name: 'mobile', cols: 1, ... },
    // ...
};
```

### Q: 如何調整卡片大小限制？

A: 在 `CardSizeCalculator.constrainCardSize()` 中修改 `minSize` 和 `maxSize`。

### Q: 如何根據設備類型調整？

A: 使用 `config.breakpoint` 來判斷當前設備類型，然後應用不同的邏輯。

---

## 版本歷史

- **v1.0** (2024-11-11) - 初始版本，包含完整的響應式系統

