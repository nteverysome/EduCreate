# 混合模式 vs 分離模式 - 英文卡片設計對比分析

## 核心差異

### 混合模式的設計哲學
混合模式採用**相對尺寸計算**，所有內容（聲音、圖片、文字）都根據卡片大小的**百分比**來計算，這使得它能夠完美適應各種卡片大小而不變形。

### 分離模式的設計問題
分離模式之前採用**固定比例**，導致在不同卡片大小下出現不協調的情況。

---

## 混合模式的響應式設計原理

### 1. 卡片大小計算（動態適應）

```javascript
// 混合模式：根據容器寬度和列數動態計算
const cols = calculateOptimalCols(width, itemCount, minCardWidth, spacing);
const frameWidth = Math.min(maxFrameWidth, (width - 2 * horizontalMargin) / cols);
const cardHeight = Math.min(maxCardHeight, Math.max(20, Math.floor(rowHeight * 0.6)));
```

**特點**：
- ✅ 根據容器寬度動態計算列數
- ✅ 根據列數動態調整卡片尺寸
- ✅ 根據可用高度動態計算行高
- ✅ 卡片大小會根據內容數量自動調整

### 2. 內容大小計算（百分比基礎）

```javascript
// 混合模式：所有內容都基於卡片高度的百分比
const buttonSize = Math.max(20, Math.min(40, buttonAreaHeight * 0.6));
const imageHeight = Math.max(Math.floor(cardHeight * 0.5), 25);
const fontSize = Math.max(Math.floor(cardHeight * 0.22), 12);
```

**特點**：
- ✅ 聲音按鈕 = 按鈕區域高度 × 60%
- ✅ 圖片高度 = 卡片高度 × 50%
- ✅ 文字大小 = 卡片高度 × 22%
- ✅ 所有尺寸都是相對的，不會變形

### 3. 文字自適應（智能縮放）

```javascript
// 混合模式：根據文字長度智能調整字體大小
const textLength = pair.answer.length;
if (textLength <= 2) {
    fontSize = fontSize * 1.0;  // 1-2 字：100%
} else if (textLength <= 4) {
    fontSize = fontSize * 0.8;  // 3-4 字：80%
} else if (textLength <= 6) {
    fontSize = fontSize * 0.7;  // 5-6 字：70%
} else {
    fontSize = fontSize * 0.6;  // 7+ 字：60%
}

// 如果文字超寬，進一步縮小
while (tempText.width > maxTextWidth && fontSize > 14) {
    fontSize -= 1;
    tempText.setFontSize(fontSize);
}
```

**特點**：
- ✅ 根據文字長度自動調整字體大小
- ✅ 測量實際文字寬度，確保不超出卡片
- ✅ 逐像素調整，確保最佳顯示效果

---

## 分離模式的改進方向

### 之前的問題
```javascript
// ❌ 舊方式：固定比例，不夠靈活
const buttonSize = Math.max(20, Math.min(40, buttonAreaHeight * 0.6));
const imageHeight = Math.max(Math.floor(cardHeight * 0.5), 25);
```

### 改進後的方式 [v215.0]
```javascript
// ✅ 新方式：更合理的百分比
const buttonSize = Math.max(14, Math.min(28, buttonAreaHeight * 0.45));
const imageHeight = Math.max(Math.floor(cardHeight * 0.5), 25);
```

---

## 混合模式的關鍵設計要素

### 1. 列數動態計算
```javascript
const calculateOptimalCols = (containerWidth, itemCount, minCardWidth = 60, spacing = 10) => {
    const maxPossibleCols = Math.floor((containerWidth - 20) / (minCardWidth + spacing));
    
    if (itemCount <= 3) return Math.min(itemCount, 2);
    else if (itemCount <= 5) return Math.min(itemCount, 3);
    else if (itemCount <= 10) return Math.min(itemCount, Math.max(3, Math.min(4, maxPossibleCols)));
    // ... 更多規則
};
```

### 2. 卡片高度根據列數調整
```javascript
if (cols === 5) {
    maxCardHeight = hasImages ? 65 : 50;
} else if (cols === 4) {
    maxCardHeight = hasImages ? 75 : 60;
} else if (cols === 3) {
    maxCardHeight = hasImages ? 85 : 70;
} else {
    maxCardHeight = hasImages ? 95 : 80;
}
```

### 3. 邊距根據列數調整
```javascript
if (cols === 5) {
    horizontalMargin = 15;  // 5 列：小邊距
} else if (cols === 4) {
    horizontalMargin = 20;  // 4 列：中邊距
} else {
    horizontalMargin = 25;  // 3 列或更少：大邊距
}
```

---

## 為什麼混合模式不變形？

### 原因 1：相對尺寸計算
所有內容都基於卡片尺寸的百分比，卡片變大時，內容也按比例變大；卡片變小時，內容也按比例變小。

### 原因 2：智能文字縮放
根據文字長度和實際寬度動態調整字體大小，確保文字始終適應卡片寬度。

### 原因 3：動態邊距和間距
根據列數和容器大小動態調整邊距和間距，確保整體佈局協調。

### 原因 4：最小/最大值限制
所有尺寸都有最小值和最大值限制，防止過小或過大。

---

## 應用到分離模式的建議

### 1. 採用相對尺寸計算
```javascript
// 所有內容都基於卡片高度的百分比
const buttonSize = cardHeight * 0.18;  // 18% 而不是固定值
const imageHeight = cardHeight * 0.5;  // 50%
const fontSize = cardHeight * 0.22;    // 22%
```

### 2. 添加最小/最大值限制
```javascript
const buttonSize = Math.max(14, Math.min(32, cardHeight * 0.18));
const fontSize = Math.max(12, Math.min(28, cardHeight * 0.22));
```

### 3. 根據卡片大小調整比例
```javascript
if (cardHeight < 50) {
    // 小卡片：減少按鈕大小
    buttonSize = cardHeight * 0.15;
} else if (cardHeight > 100) {
    // 大卡片：增加按鈕大小
    buttonSize = cardHeight * 0.20;
}
```

---

## 總結

| 特性 | 混合模式 | 分離模式（改進前） | 分離模式（改進後） |
|------|--------|-----------------|-----------------|
| 卡片大小計算 | 動態 | 固定 | 動態 |
| 內容尺寸 | 相對（百分比） | 固定 | 相對（百分比） |
| 文字自適應 | ✅ 智能縮放 | ❌ 無 | ⚠️ 基礎 |
| 邊距調整 | ✅ 動態 | ❌ 固定 | ⚠️ 基礎 |
| 不變形能力 | ✅ 完美 | ❌ 容易變形 | ✅ 改善 |

混合模式的成功在於**完全採用相對尺寸計算**，這是實現完美響應式設計的關鍵！

