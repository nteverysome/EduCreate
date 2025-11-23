# 動態卡片尺寸調整指南 - v132.0

## 📖 概述

本指南說明如何在遊戲中實現 **v132.0 動態卡片尺寸調整系統**，根據容器寬度和高度自動調整卡片尺寸。

---

## 🎯 適用場景

✅ 需要響應式卡片佈局的遊戲
✅ 卡片數量可變（3、4、5、7、10、20 等）
✅ 需要充分利用屏幕空間的遊戲
✅ 需要在不同屏幕尺寸上保持最優顯示效果的遊戲

---

## 🔧 實現步驟

### 第 1 步：計算可用空間

```javascript
// 計算容器寬度和可用寬度
const containerWidth = width * 0.3333;  // 每個容器的寬度（33%）
const sideMargin = 80;                  // 初始邊距
const usableContainerWidth = containerWidth - sideMargin * 2;

// 計算可用高度
const timerHeight = 50;
const timerGap = 20;
const additionalTopMargin = 90;
const topButtonArea = timerHeight + timerGap + additionalTopMargin;
const bottomButtonArea = 60;
const availableHeightForCards = height - topButtonArea - bottomButtonArea;

// 計算卡片間距
const cardSpacingBetweenCards = Math.max(10, availableHeightForCards * 0.05);
```

### 第 2 步：計算水平縮放因子

```javascript
let horizontalScaleFactor = 1.0;

if (cardWidth > usableContainerWidth) {
    horizontalScaleFactor = usableContainerWidth / cardWidth;
} else {
    const utilization = cardWidth / usableContainerWidth;
    if (utilization > 0.85) horizontalScaleFactor = 1.0;
    else if (utilization > 0.70) horizontalScaleFactor = 0.95;
    else horizontalScaleFactor = 0.85;
}
```

### 第 3 步：計算垂直縮放因子

```javascript
const verticalUtilization = (cardHeight * itemCount + cardSpacingBetweenCards * (itemCount - 1)) / availableHeightForCards;

let verticalScaleFactor = 1.0;

if (verticalUtilization > 0.95) verticalScaleFactor = 0.9;
else if (verticalUtilization > 0.85) verticalScaleFactor = 1.0;
else if (verticalUtilization > 0.70) verticalScaleFactor = 1.1;
else if (verticalUtilization > 0.50) verticalScaleFactor = 1.2;
else verticalScaleFactor = 1.3;
```

### 第 4 步：應用縮放因子

```javascript
cardWidth = cardWidth * horizontalScaleFactor;
cardHeight = cardHeight * verticalScaleFactor;
fontSize = Math.round(fontSize * Math.max(horizontalScaleFactor, verticalScaleFactor));
```

---

## 📊 調試日誌

添加日誌幫助調試：

```javascript
console.log('🔥 [v132.0] 水平縮放:', {
    cardWidth: cardWidth.toFixed(0),
    usableContainerWidth: usableContainerWidth.toFixed(0),
    horizontalScaleFactor: horizontalScaleFactor.toFixed(3)
});

console.log('🔥 [v132.0] 垂直縮放:', {
    verticalUtilization: (verticalUtilization * 100).toFixed(1) + '%',
    verticalScaleFactor: verticalScaleFactor.toFixed(3)
});
```

---

## ✅ 驗證清單

- [ ] 計算容器寬度和可用寬度
- [ ] 計算可用高度
- [ ] 計算水平縮放因子
- [ ] 計算垂直縮放因子
- [ ] 應用縮放因子到卡片尺寸
- [ ] 測試不同卡片數量
- [ ] 測試不同屏幕尺寸
- [ ] 驗證日誌輸出

---

## 📚 參考資源

- 完整實現：`public/games/match-up-game/scenes/game.js` (v132.0)
- 模板更新：`TEMPLATE_SYSTEM_UPDATE_v132.0_DYNAMIC_SIZING.md`

