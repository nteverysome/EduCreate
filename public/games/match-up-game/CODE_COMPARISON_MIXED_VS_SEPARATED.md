# 代碼對比：混合模式 vs 分離模式

## 1. 卡片大小計算

### 混合模式（動態計算）
```javascript
// 第 3681-3850 行
// 根據容器寬度和列數動態計算
const calculateOptimalCols = (containerWidth, itemCount, minCardWidth = 60, spacing = 10) => {
    const maxPossibleCols = Math.floor((containerWidth - 20) / (minCardWidth + spacing));
    
    if (itemCount <= 3) return Math.min(itemCount, 2);
    else if (itemCount <= 5) return Math.min(itemCount, 3);
    else if (itemCount <= 10) return Math.min(itemCount, Math.max(3, Math.min(4, maxPossibleCols)));
    // ... 更多規則
};

// 根據列數動態調整卡片高度
if (cols === 5) {
    maxCardHeight = hasImages ? 65 : 50;
} else if (cols === 4) {
    maxCardHeight = hasImages ? 75 : 60;
} else if (cols === 3) {
    maxCardHeight = hasImages ? 85 : 70;
} else {
    maxCardHeight = hasImages ? 95 : 80;
}

// 根據列數調整邊距
if (cols === 5) {
    horizontalMargin = 15;
} else if (cols === 4) {
    horizontalMargin = 20;
} else {
    horizontalMargin = 25;
}

// 計算實際卡片寬度
frameWidth = Math.min(maxFrameWidth, (width - 2 * horizontalMargin) / cols);
```

### 分離模式（固定計算）[v215.0]
```javascript
// 第 2110-2118 行
// 固定的按鈕大小計算
audioButton: {
    size: itemCount === 20
        ? Math.max(Math.floor(cardHeight * 0.12), 10)
        : Math.max(Math.floor(cardHeight * 0.18), 14),
    minSize: itemCount === 20 ? 10 : 14,
    maxSize: itemCount === 20 ? 24 : 32
}

// 卡片大小由外部傳入，不動態計算
// 只根據 itemCount 調整內容比例
```

---

## 2. 文字大小計算

### 混合模式（智能多層調整）
```javascript
// 第 3918-3953 行
// 層 1：基礎字體大小
let fontSize = Math.max(24, Math.min(48, tempCardHeight * 0.4));

// 層 2：根據文字長度調整
const textLength = pair.answer.length;
if (textLength <= 2) {
    fontSize = fontSize * 1.0;   // 1-2 字：100%
} else if (textLength <= 4) {
    fontSize = fontSize * 0.8;   // 3-4 字：80%
} else if (textLength <= 6) {
    fontSize = fontSize * 0.7;   // 5-6 字：70%
} else {
    fontSize = fontSize * 0.6;   // 7+ 字：60%
}

// 層 3：測量實際寬度，逐像素調整
const tempText = this.add.text(0, 0, pair.answer, {
    fontSize: `${fontSize}px`,
    fontFamily: 'Arial',
    fontStyle: 'bold'
});

const maxTextWidth = (frameWidth - 10) * 0.85;
while (tempText.width > maxTextWidth && fontSize > 14) {
    fontSize -= 1;
    tempText.setFontSize(fontSize);
}
tempText.destroy();
```

### 分離模式（簡單計算）[v215.0]
```javascript
// 第 5645-5680 行
// 單層計算
let fontSize = contentSizes
    ? contentSizes.text.fontSize
    : Math.max(14, Math.min(48, height * 0.6));

// 創建臨時文字測量寬度
const tempText = this.add.text(0, 0, text, {
    fontSize: `${fontSize}px`,
    fontFamily: 'Arial'
});

// 簡單的寬度檢查
const maxTextWidth = width * 0.85;
while (tempText.width > maxTextWidth && fontSize > 12) {
    fontSize -= 2;
    tempText.setFontSize(fontSize);
}
```

---

## 3. 按鈕大小計算

### 混合模式（無按鈕區域概念）
```javascript
// 混合模式中，按鈕直接在卡片中央
// 不需要按鈕區域的概念
const buttonSize = Math.max(20, Math.min(40, buttonAreaHeight * 0.6));
```

### 分離模式（按鈕區域概念）[v215.0]
```javascript
// 第 5373-5388 行
// 按鈕區域：卡片高度的 20%
const buttonAreaHeight = height * 0.2;
const buttonAreaY = -height / 2 + buttonAreaHeight / 2;

// 按鈕大小：按鈕區域高度的 45%
const buttonSize = this.currentPageItemCount === 20
    ? Math.max(12, Math.min(24, buttonAreaHeight * 0.35))
    : Math.max(14, Math.min(28, buttonAreaHeight * 0.45));
```

---

## 4. 內容區域分配

### 混合模式（動態分配）
```javascript
// 根據列數和內容類型動態分配
// 沒有固定的百分比，而是根據實際需要計算
const cardHeightInFrame = Math.min(maxCardHeight, Math.max(20, Math.floor(rowHeight * 0.6)));
const chineseTextHeight = chineseTextHeightBase;  // 根據列數調整
```

### 分離模式（固定百分比）[v215.0]
```javascript
// 第 5373-5408 行
// 固定的百分比分配
const buttonAreaHeight = height * 0.2;      // 20%
const imageAreaHeight = height * 0.5;       // 50%
const textAreaHeight = height * 0.3;        // 30%
```

---

## 5. 邊距和間距

### 混合模式（動態調整）
```javascript
// 第 3895-3906 行
// 根據列數調整邊距
if (cols === 5) {
    horizontalMargin = 15;
} else if (cols === 4) {
    horizontalMargin = 20;
} else {
    horizontalMargin = 25;
}

// 根據列數調整垂直間距
if (cols === 5) {
    verticalSpacingBase = 3;
} else if (cols === 4) {
    verticalSpacingBase = 3;
} else if (cols === 3) {
    verticalSpacingBase = 4;
} else {
    verticalSpacingBase = 5;
}
```

### 分離模式（固定值）[v215.0]
```javascript
// 第 5405-5408 行
// 固定的底部間距
const bottomPadding = Math.max(6, height * 0.06);
```

---

## 6. 響應式檢測

### 混合模式（詳細檢測）
```javascript
// 第 3699-3733 行
const isMobileDevice = width < 768;
const isPortraitMode = height > width;
const isLandscapeMode = width > height;
const isLandscapeMobile = isLandscapeMode && height < 500;
const isTinyHeight = height < 400;
const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;
const isPortraitCompactMode = isMobileDevice && isPortraitMode;
const isLandscapeCompactMode = isLandscapeMobile || isTinyHeight;
```

### 分離模式（無檢測）[v215.0]
```javascript
// 分離模式沒有響應式檢測
// 只根據 itemCount 調整
```

---

## 核心差異總結

| 特性 | 混合模式 | 分離模式 [v215.0] |
|------|--------|-----------------|
| **卡片大小** | 動態計算 | 固定傳入 |
| **文字調整** | 3 層智能調整 | 簡單調整 |
| **邊距** | 動態根據列數 | 固定值 |
| **響應式** | 詳細檢測 | 無檢測 |
| **按鈕區域** | 無概念 | 20% 固定 |
| **內容分配** | 動態 | 固定百分比 |

---

## 改進建議

### 立即可實施
1. ✅ 添加文字長度調整（混合模式第 3922-3932 行）
2. ✅ 添加逐像素調整（混合模式第 3944-3947 行）
3. ✅ 添加動態邊距（混合模式第 3895-3906 行）

### 中期改進
1. 添加響應式檢測
2. 根據列數調整按鈕大小
3. 動態調整內容分配比例

### 長期目標
1. 統一混合模式和分離模式的計算邏輯
2. 創建統一的響應式計算器
3. 實現完全的動態適應

