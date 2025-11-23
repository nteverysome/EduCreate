# 🚀 v132.0 動態卡片尺寸調整 - 快速參考

## 📋 核心代碼片段

### 1️⃣ 計算可用空間
```javascript
const containerWidth = width * 0.3333;
const usableContainerWidth = containerWidth - 80 * 2;
const availableHeightForCards = height - 160 - 60;
const cardSpacingBetweenCards = Math.max(10, availableHeightForCards * 0.05);
```

### 2️⃣ 水平縮放因子
```javascript
let horizontalScaleFactor = 1.0;
if (cardWidth > usableContainerWidth) {
    horizontalScaleFactor = usableContainerWidth / cardWidth;
} else {
    const util = cardWidth / usableContainerWidth;
    if (util > 0.85) horizontalScaleFactor = 1.0;
    else if (util > 0.70) horizontalScaleFactor = 0.95;
    else horizontalScaleFactor = 0.85;
}
```

### 3️⃣ 垂直縮放因子
```javascript
const verticalUtilization = (cardHeight * itemCount + cardSpacingBetweenCards * (itemCount - 1)) / availableHeightForCards;
let verticalScaleFactor = 1.0;

if (verticalUtilization > 0.95) verticalScaleFactor = 0.9;
else if (verticalUtilization > 0.85) verticalScaleFactor = 1.0;
else if (verticalUtilization > 0.70) verticalScaleFactor = 1.1;
else if (verticalUtilization > 0.50) verticalScaleFactor = 1.2;
else verticalScaleFactor = 1.3;
```

### 4️⃣ 應用縮放
```javascript
cardWidth = cardWidth * horizontalScaleFactor;
cardHeight = cardHeight * verticalScaleFactor;
fontSize = Math.round(fontSize * Math.max(horizontalScaleFactor, verticalScaleFactor));
```

---

## 📊 縮放因子對照表

### 水平縮放
| 容器利用率 | 縮放因子 | 說明 |
|-----------|---------|------|
| > 100% | 計算值 | 卡片超出容器 |
| 85-100% | 1.0x | 保持當前 |
| 70-85% | 0.95x | 適度縮小 |
| < 70% | 0.85x | 進一步縮小 |

### 垂直縮放
| 垂直利用率 | 縮放因子 | 說明 |
|-----------|---------|------|
| > 95% | 0.9x | 縮小 10% |
| 85-95% | 1.0x | 保持當前 |
| 70-85% | 1.1x | 增加 10% |
| 50-70% | 1.2x | 增加 20% |
| < 50% | 1.3x | 增加 30% |

---

## 🔍 調試日誌

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

console.log('✅ [v132.0] 最終尺寸:', {
    cardWidth: cardWidth.toFixed(0),
    cardHeight: cardHeight.toFixed(0),
    fontSize: fontSize
});
```

---

## 🎯 常見問題

**Q: 卡片太小？**
A: 檢查垂直利用率，如果 < 50%，應該使用 1.3x 縮放

**Q: 卡片太大？**
A: 檢查水平利用率，如果 > 100%，應該自動縮小

**Q: 字體大小不對？**
A: 使用 `Math.max(horizontalScaleFactor, verticalScaleFactor)` 計算

---

## 📚 完整文檔

- [完整技術文檔](./TEMPLATE_SYSTEM_UPDATE_v132.0_DYNAMIC_SIZING.md)
- [實現指南](./public/games/_template/DYNAMIC_CARD_SIZING_GUIDE.md)
- [實現代碼](./public/games/match-up-game/scenes/game.js) (v132.0, 行 2150-2227)

