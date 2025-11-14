# 混合模式卡片動態調整尺寸策略 - 完整分析

## 📊 核心架構

混合模式的卡片動態調整尺寸採用**多層次響應式設計**，從上到下分為 6 個層級：

```
┌─────────────────────────────────────────┐
│  第 1 層：設備檢測層                      │
│  (Device Detection)                     │
├─────────────────────────────────────────┤
│  第 2 層：容器配置層                      │
│  (Container Configuration)              │
├─────────────────────────────────────────┤
│  第 3 層：可用空間計算層                  │
│  (Available Space Calculation)          │
├─────────────────────────────────────────┤
│  第 4 層：列數計算層                      │
│  (Column Count Calculation)             │
├─────────────────────────────────────────┤
│  第 5 層：卡片尺寸計算層                  │
│  (Card Size Calculation)                │
├─────────────────────────────────────────┤
│  第 6 層：特殊處理層                      │
│  (Special Handling)                     │
└─────────────────────────────────────────┘
```

---

## 🎯 第 1 層：設備檢測層

### 設備類型分類

根據螢幕寬度和方向自動檢測：

| 設備類型 | 寬度範圍 | 高度範圍 | 佈局模式 | 列數 |
|---------|---------|---------|---------|------|
| **手機直向** | < 768px | > 768px | 緊湊 | 固定 5 |
| **手機橫向** | > 768px | < 500px | 緊湊 | 固定 5 |
| **平板直向** | 768px | 1024px | 桌面 | 動態 |
| **平板橫向** | 1024px | 768px | 桌面 | 動態 |
| **桌面版** | > 1024px | > 768px | 桌面 | 動態 |

### 檢測代碼

```javascript
function getDeviceType(width, height) {
    const aspectRatio = width / height;
    
    if (width < 768) {
        return height > width ? 'mobile-portrait' : 'mobile-landscape';
    } else if (width < 1024) {
        return height > width ? 'tablet-portrait' : 'tablet-landscape';
    } else {
        return 'desktop';
    }
}

// 檢測全螢幕狀態
const isFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
);
```

---

## 🎛️ 第 2 層：容器配置層

### 設備配置表

```javascript
const CONTAINER_CONFIG = {
    'mobile-portrait': {
        topButtonArea: 40,      // 頂部按鈕區域
        bottomButtonArea: 40,   // 底部按鈕區域
        sideMargin: 20,         // 左右邊距
        cols: 5,                // 固定 5 列
        mode: 'compact',        // 緊湊模式
        minCardSize: 150        // 最小卡片尺寸
    },
    'mobile-landscape': {
        topButtonArea: 30,
        bottomButtonArea: 30,
        sideMargin: 15,
        cols: 5,
        mode: 'compact',
        minCardSize: 150
    },
    'tablet-portrait': {
        topButtonArea: 60,
        bottomButtonArea: 60,
        sideMargin: 30,
        cols: 'dynamic',        // 動態計算
        mode: 'desktop',
        minCardSize: 150
    },
    'tablet-landscape': {
        topButtonArea: 50,
        bottomButtonArea: 50,
        sideMargin: 40,
        cols: 'dynamic',
        mode: 'desktop',
        minCardSize: 150
    },
    'desktop': {
        topButtonArea: 80,
        bottomButtonArea: 80,
        sideMargin: 50,
        cols: 'dynamic',
        mode: 'desktop',
        minCardSize: 150
    }
};
```

### 全螢幕模式調整

全螢幕模式下，邊距和最小卡片尺寸會動態調整：

```javascript
if (isFullscreen) {
    config.topButtonArea *= 0.5;      // 減少 50%
    config.bottomButtonArea *= 0.5;
    config.sideMargin *= 0.75;
    config.minCardSize *= 0.8;        // 允許更小的卡片
}
```

---

## 📐 第 3 層：可用空間計算層

### 計算公式

```javascript
// 可用寬度 = 螢幕寬度 - 左右邊距
const availableWidth = width - sideMargin * 2;

// 可用高度 = 螢幕高度 - 頂部按鈕 - 底部按鈕
const availableHeight = height - topButtonArea - bottomButtonArea;

// 水平間距（15-30px，基於寬度的1.5%）
const horizontalSpacing = Math.max(15, Math.min(30, width * 0.015));

// 垂直間距（40-80px，基於高度的4%）
const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
```

### 間距動態調整

間距會根據卡片數量動態調整：

```javascript
function calculateSpacing(baseSpacing, itemCount, minSpacing = 10) {
    if (itemCount <= 5) return baseSpacing;
    const reduction = (itemCount - 5) * 0.5;
    return Math.max(minSpacing, baseSpacing - reduction);
}
```

---

## 🔢 第 4 層：列數計算層

### 動態列數計算

```javascript
const aspectRatio = width / height;
const maxPossibleCols = Math.floor(
    (availableWidth + horizontalSpacing) / (minCardSize + horizontalSpacing)
);

let optimalCols;
if (aspectRatio > 2.0) {
    // 超寬螢幕（21:9, 32:9）
    optimalCols = Math.min(maxPossibleCols, 10, itemCount);
} else if (aspectRatio > 1.5) {
    // 寬螢幕（16:9, 16:10）
    optimalCols = Math.min(maxPossibleCols, 10, itemCount);
} else if (aspectRatio > 1.2) {
    // 標準螢幕（4:3, 3:2）
    optimalCols = Math.min(maxPossibleCols, 8, itemCount);
} else {
    // 直向螢幕（9:16）
    optimalCols = Math.min(maxPossibleCols, 5, itemCount);
}

// 計算行數
const optimalRows = Math.ceil(itemCount / optimalCols);
```

---

## 📏 第 5 層：卡片尺寸計算層

### 正方形模式（有圖片）

```javascript
// 方法1：基於高度計算
// totalUnitHeight = squareSize + (squareSize * 0.4) = squareSize * 1.4
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
const squareSizeByHeight = availableHeightPerRow / 1.4;

// 方法2：基於寬度計算
const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

// 取較小值，確保卡片不會超出邊界
let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);

// 應用最小/最大限制
const minSquareSize = isFullscreen ? minCardSize : 150;
const maxSquareSize = 300;
squareSize = Math.max(minSquareSize, Math.min(maxSquareSize, squareSize));

finalCardWidth = squareSize;
finalCardHeight = squareSize;
```

### 長方形模式（無圖片）

```javascript
// 卡片寬度：充分利用可用寬度
finalCardWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

// 卡片高度：單元總高度的 60%
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
finalCardHeight = (availableHeightPerRow - verticalSpacing) / 1.4;

// 應用最小/最大限制
const minCardWidth = isFullscreen ? minCardSize : 200;
const minCardHeight = isFullscreen ? (minCardSize * 0.5) : 100;
const maxCardSize = 300;

finalCardWidth = Math.max(minCardWidth, Math.min(maxCardSize, finalCardWidth));
finalCardHeight = Math.max(minCardHeight, Math.min(maxCardSize, finalCardHeight));
```

---

## ⚙️ 第 6 層：特殊處理層

### 中文文字高度計算

```javascript
// 正方形模式：中文文字高度 = 卡片高度 × 0.4
chineseTextHeight = squareSize * 0.4;

// 長方形模式：中文文字高度 = 固定 30px
chineseTextHeight = 30;

// 總單元高度 = 卡片高度 + 文字高度 + 垂直間距
totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing;
```

### 行數超限處理

```javascript
// 如果行數超過最大可能行數，增加列數
while (optimalRows > maxPossibleRows && optimalCols < itemCount) {
    optimalCols++;
    optimalRows = Math.ceil(itemCount / optimalCols);
}
```

### 卡片尺寸過小處理

```javascript
// 如果卡片尺寸小於最小值，嘗試增加列數
if (squareSize < minSquareSize && optimalCols < itemCount) {
    optimalCols++;
    optimalRows = Math.ceil(itemCount / optimalCols);
    // 重新計算卡片尺寸
}
```

---

## 🔄 完整計算流程

```
輸入：width, height, itemCount, hasImages, isFullscreen
  ↓
1. 檢測設備類型 → deviceType
  ↓
2. 獲取容器配置 → config
  ↓
3. 計算可用空間 → availableWidth, availableHeight
  ↓
4. 計算間距 → horizontalSpacing, verticalSpacing
  ↓
5. 計算列數 → optimalCols
  ↓
6. 計算行數 → optimalRows
  ↓
7. 根據卡片類型計算尺寸 → cardWidth, cardHeight
  ↓
8. 應用最小/最大限制 → finalCardWidth, finalCardHeight
  ↓
輸出：{ cardWidth, cardHeight, cols, rows, spacing }
```

---

## 📊 關鍵參數對照表

| 參數 | 手機直向 | 手機橫向 | 平板直向 | 平板橫向 | 桌面 |
|------|---------|---------|---------|---------|------|
| 頂部按鈕 | 40px | 30px | 60px | 50px | 80px |
| 底部按鈕 | 40px | 30px | 60px | 50px | 80px |
| 左右邊距 | 20px | 15px | 30px | 40px | 50px |
| 列數 | 5 | 5 | 動態 | 動態 | 動態 |
| 最小卡片 | 150px | 150px | 150px | 150px | 150px |
| 模式 | 緊湊 | 緊湊 | 桌面 | 桌面 | 桌面 |

---

## ✅ 驗證檢查清單

- [ ] 卡片寬度 ≥ 最小寬度
- [ ] 卡片高度 ≥ 最小高度
- [ ] 卡片寬度 ≤ 最大寬度
- [ ] 卡片高度 ≤ 最大高度
- [ ] 所有卡片都在容器內
- [ ] 間距合理（不過大也不過小）
- [ ] 文字能正確顯示
- [ ] 圖片能正確顯示
- [ ] 在所有設備上都能正常工作

