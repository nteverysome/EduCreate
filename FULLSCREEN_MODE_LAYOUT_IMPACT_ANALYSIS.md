# 全螢幕模式對佈局計算的影響分析

## 📱 全螢幕模式的尺寸變化

### 1. 當前全螢幕配置

**代碼位置**：`public/games/match-up-game/config.js` 第 15-29 行

```javascript
scale: {
    mode: Phaser.Scale.RESIZE,  // 動態調整尺寸
    width: SIZE_WIDTH_SCREEN,   // 960px
    height: SIZE_HEIGHT_SCREEN, // 540px
    min: {
        width: MIN_SIZE_WIDTH_SCREEN,   // 480px
        height: MIN_SIZE_HEIGHT_SCREEN  // 270px
    },
    max: {
        width: MAX_SIZE_WIDTH_SCREEN,   // 1920px
        height: MAX_SIZE_HEIGHT_SCREEN  // 1080px
    },
    fullscreenTarget: 'game-container',
    expandParent: true,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### 2. 全螢幕時的尺寸

| 模式 | 寬度 | 高度 | 寬高比 | 說明 |
|------|------|------|--------|------|
| **非全螢幕** | 960px | 540px | 1.78:1 | 預設尺寸 |
| **全螢幕（手機直向）** | 375px | 667px | 0.56:1 | 實際螢幕尺寸 |
| **全螢幕（手機橫向）** | 812px | 375px | 2.16:1 | 實際螢幕尺寸 |
| **全螢幕（平板直向）** | 768px | 1024px | 0.75:1 | 實際螢幕尺寸 |
| **全螢幕（平板橫向）** | 1024px | 768px | 1.33:1 | 實際螢幕尺寸 |
| **全螢幕（桌面）** | 1440px | 900px | 1.60:1 | 實際螢幕尺寸 |

---

## 🎯 全螢幕對 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 的影響

### 1. 按鈕區域計算的影響

**當前計算**（第 1816-1818 行）：

```javascript
const topButtonAreaHeight = Math.max(50, Math.min(80, height * 0.08));
const bottomButtonAreaHeight = Math.max(50, Math.min(80, height * 0.10));
const sideMargin = Math.max(30, Math.min(80, width * 0.03));
```

**全螢幕時的變化**：

| 設備 | 非全螢幕 | 全螢幕 | 變化 |
|------|---------|--------|------|
| **手機直向** | 頂部: 43px | 頂部: 50px | ⬆️ 7px |
| | 底部: 54px | 底部: 67px | ⬆️ 13px |
| **手機橫向** | 頂部: 43px | 頂部: 30px | ⬇️ 13px |
| | 底部: 54px | 底部: 38px | ⬇️ 16px |
| **平板橫向** | 頂部: 43px | 頂部: 72px | ⬆️ 29px |
| | 底部: 54px | 底部: 90px | ⬆️ 36px |

### 2. 可用空間計算的影響

**計算公式**：

```javascript
const availableWidth = width - sideMargin * 2;
const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;
```

**全螢幕時的變化**：

#### 手機直向（375×667px）

```
非全螢幕（960×540px）：
- availableWidth = 960 - 60 = 900px
- availableHeight = 540 - 43 - 54 = 443px

全螢幕（375×667px）：
- availableWidth = 375 - 22 = 353px
- availableHeight = 667 - 50 - 67 = 550px

變化：
- 寬度減少 61%（900 → 353px）
- 高度增加 24%（443 → 550px）
- 寬高比從 2.03:1 變為 0.64:1
```

#### 手機橫向（812×375px）

```
非全螢幕（960×540px）：
- availableWidth = 960 - 60 = 900px
- availableHeight = 540 - 43 - 54 = 443px

全螢幕（812×375px）：
- availableWidth = 812 - 24 = 788px
- availableHeight = 375 - 30 - 38 = 307px

變化：
- 寬度減少 12%（900 → 788px）
- 高度減少 31%（443 → 307px）
- 寬高比從 2.03:1 變為 2.57:1
```

#### 平板橫向（1024×768px）

```
非全螢幕（960×540px）：
- availableWidth = 960 - 60 = 900px
- availableHeight = 540 - 43 - 54 = 443px

全螢幕（1024×768px）：
- availableWidth = 1024 - 31 = 993px
- availableHeight = 768 - 72 - 90 = 606px

變化：
- 寬度增加 10%（900 → 993px）
- 高度增加 37%（443 → 606px）
- 寬高比從 2.03:1 變為 1.64:1
```

### 3. 列數計算的影響

**正方形模式（有圖片）**：

```javascript
// 非全螢幕（960×540px，20個卡片）
maxPossibleCols = floor((900 + 29) / (150 + 29)) = 5
optimalCols = 5

// 全螢幕手機直向（375×667px，20個卡片）
maxPossibleCols = floor((353 + 29) / (150 + 29)) = 2
optimalCols = 2  // ⬇️ 從 5 列減少到 2 列

// 全螢幕平板橫向（1024×768px，20個卡片）
maxPossibleCols = floor((993 + 29) / (150 + 29)) = 6
optimalCols = 6  // ⬆️ 從 5 列增加到 6 列
```

### 4. 卡片尺寸的影響

**正方形模式（有圖片）**：

```
非全螢幕（960×540px）：
- squareSizeByWidth = (900 - 24*6) / 5 = 169.2px
- squareSizeByHeight = (443 - 17*5) / 4 / 1.4 = 71.1px
- finalCardSize = min(71.1, 169.2) = 71.1px → 調整到 150px（最小值）

全螢幕手機直向（375×667px）：
- squareSizeByWidth = (353 - 24*3) / 2 = 141.5px
- squareSizeByHeight = (550 - 17*3) / 10 / 1.4 = 35.6px
- finalCardSize = min(35.6, 141.5) = 35.6px → 調整到 150px（最小值）

全螢幕平板橫向（1024×768px）：
- squareSizeByWidth = (993 - 24*7) / 6 = 136.5px
- squareSizeByHeight = (606 - 17*4) / 3 / 1.4 = 134.3px
- finalCardSize = min(134.3, 136.5) = 134.3px → 調整到 150px（最小值）
```

---

## ⚠️ 全螢幕模式的問題

### 1. 寬高比變化劇烈

```
非全螢幕：960×540 = 1.78:1（寬螢幕）
全螢幕手機直向：375×667 = 0.56:1（直向）
全螢幕手機橫向：812×375 = 2.16:1（超寬）
全螢幕平板橫向：1024×768 = 1.33:1（標準）

→ 需要重新計算列數和卡片尺寸
```

### 2. 按鈕區域計算不準確

```
當前公式：
- topButtonAreaHeight = max(50, min(80, height * 0.08))
- bottomButtonAreaHeight = max(50, min(80, height * 0.10))

問題：
- 手機直向（667px）：頂部 50px，底部 67px（共 117px）
- 手機橫向（375px）：頂部 30px，底部 38px（共 68px）
- 平板橫向（768px）：頂部 72px，底部 90px（共 162px）

→ 按鈕區域佔比不一致
```

### 3. 卡片尺寸受限於最小值

```
在全螢幕手機直向模式下：
- 計算出的卡片尺寸：35.6px
- 最小卡片尺寸：150px
- 實際使用：150px（被迫調整）

→ 卡片尺寸不符合實際可用空間
```

---

## 🎯 改進建議

### 優先級 1：檢測全螢幕狀態

```javascript
// 檢測全螢幕狀態
const isFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
);

console.log('🖥️ 全螢幕狀態:', isFullscreen);
```

### 優先級 2：根據全螢幕狀態調整按鈕區域

```javascript
// 根據全螢幕狀態調整按鈕區域
let topButtonAreaHeight, bottomButtonAreaHeight;

if (isFullscreen) {
    // 全螢幕模式：根據設備類型調整
    if (deviceType === 'mobile-portrait') {
        topButtonAreaHeight = 40;
        bottomButtonAreaHeight = 50;
    } else if (deviceType === 'mobile-landscape') {
        topButtonAreaHeight = 25;
        bottomButtonAreaHeight = 30;
    } else {
        topButtonAreaHeight = 60;
        bottomButtonAreaHeight = 80;
    }
} else {
    // 非全螢幕模式：使用百分比計算
    topButtonAreaHeight = Math.max(50, Math.min(80, height * 0.08));
    bottomButtonAreaHeight = Math.max(50, Math.min(80, height * 0.10));
}
```

### 優先級 3：動態調整最小卡片尺寸

```javascript
// 根據全螢幕狀態調整最小卡片尺寸
let minCardSize;

if (isFullscreen) {
    // 全螢幕模式：降低最小卡片尺寸
    minCardSize = 80;  // 從 150px 降低到 80px
} else {
    // 非全螢幕模式：使用標準最小值
    minCardSize = 150;
}
```

### 優先級 4：添加全螢幕事件監聽

```javascript
// 監聽全螢幕狀態變化
document.addEventListener('fullscreenchange', () => {
    console.log('🔄 全螢幕狀態已改變，重新計算佈局');
    // 觸發佈局重新計算
    this.calculateLayout();
});

// 監聽方向變化
window.addEventListener('orientationchange', () => {
    console.log('🔄 設備方向已改變，重新計算佈局');
    setTimeout(() => this.calculateLayout(), 100);
});
```

---

## 📋 實施步驟

### 步驟 1：添加全螢幕檢測

在 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 的第零步添加全螢幕檢測。

### 步驟 2：根據全螢幕狀態調整按鈕區域

在第二步（計算可用空間）中添加全螢幕狀態判斷。

### 步驟 3：動態調整最小卡片尺寸

在第五步（計算卡片尺寸）中添加全螢幕狀態判斷。

### 步驟 4：添加事件監聽

在遊戲初始化時添加全螢幕和方向變化事件監聽。

### 步驟 5：測試全螢幕模式

- 手機直向全螢幕
- 手機橫向全螢幕
- 平板直向全螢幕
- 平板橫向全螢幕
- 桌面全螢幕

---

**最後更新**：2025-11-01
**版本**：v1.0 - 全螢幕模式對佈局計算的影響分析

