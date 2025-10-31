# Match-up 遊戲 - 中文字位置與卡片間距分析

## 📍 中文字代碼實際路徑

### 文件位置
```
public/games/match-up-game/scenes/game.js
```

### 核心函數路徑

#### 1. 右側卡片創建函數
**路徑**：第 2992-3100 行
```javascript
createRightCard(x, y, width, height, text, pairId, textPosition = 'bottom')
```

#### 2. 中文字位置計算
**路徑**：第 3038-3058 行
```javascript
// 🔥 根據 textPosition 設置文字位置
let textX, textY, originX, originY;
if (textPosition === 'right') {
    // 文字在框右邊
    textX = width / 2 + 15;
    textY = 0;
    originX = 0;      // 左對齊
    originY = 0.5;    // 垂直居中
} else if (textPosition === 'left') {
    // 文字在框左邊
    textX = -width / 2 - 15;
    textY = 0;
    originX = 1;      // 右對齊
    originY = 0.5;    // 垂直居中
} else {
    // 文字在框下邊（默認）
    textX = 0;
    textY = height / 2 + 10;
    originX = 0.5;    // 水平居中
    originY = 0;      // 頂部對齊
}
```

#### 3. 中文字創建
**路徑**：第 3060-3070 行
```javascript
const cardText = this.add.text(textX, textY, text, {
    fontSize: `${fontSize}px`,
    color: '#333333',
    fontFamily: 'Arial',
    fontStyle: 'normal'
});
cardText.setOrigin(originX, originY);
cardText.setDepth(10);  // 確保文字在最上層
container.add([background, cardText]);
```

---

## 📐 中文字與下方卡片的距離計算

### 卡片位置計算

#### 卡片排列公式
**路徑**：第 1292-1302 行
```javascript
// 右側中文卡片（多行 2 列）
shuffledAnswers.forEach((pair, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    
    // 🔥 卡片中心位置
    const x = rightAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
    const y = rightAreaStartY + row * (cardHeight + rightVerticalSpacing) + cardHeight / 2;
    
    // 🔥 根據列號決定文字位置
    const textPosition = col === 0 ? 'left' : 'right';
    const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, textPosition);
});
```

### 間距計算

#### 垂直間距公式
**路徑**：第 1188-1189 行
```javascript
const horizontalSpacing = Math.max(5, width * 0.01);
const verticalSpacing = Math.max(3, height * 0.008);

// 🔥 右側卡片使用相同的垂直間距
const rightVerticalSpacing = verticalSpacing;
```

#### 示例計算（假設容器高度 800px）
```
verticalSpacing = Math.max(3, 800 * 0.008)
                = Math.max(3, 6.4)
                = 6.4px
```

---

## 🎯 中文字與下方卡片的距離

### 距離計算公式

#### 第一行卡片的中文字到第二行卡片頂部的距離

```
距離 = 第二行卡片Y位置 - 第一行卡片Y位置 - 第一行卡片高度/2 - 中文字高度/2

其中：
- 第二行卡片Y位置 = rightAreaStartY + 1 * (cardHeight + rightVerticalSpacing) + cardHeight / 2
- 第一行卡片Y位置 = rightAreaStartY + 0 * (cardHeight + rightVerticalSpacing) + cardHeight / 2
- 差值 = cardHeight + rightVerticalSpacing
```

### 簡化公式

```
距離 = cardHeight + rightVerticalSpacing - cardHeight/2 - 中文字高度/2
     = cardHeight/2 + rightVerticalSpacing - 中文字高度/2
```

### 具體示例

**假設條件**：
- cardHeight = 80px
- rightVerticalSpacing = 6.4px
- 中文字高度 = 24px（假設字體大小 32px）

**計算**：
```
距離 = 80/2 + 6.4 - 24/2
     = 40 + 6.4 - 12
     = 34.4px
```

---

## 📊 中文字位置詳解

### 左側文字（第一列）
```
textX = -width / 2 - 15
textY = 0
originX = 1  (右對齊)
originY = 0.5 (垂直居中)

含義：
- 文字在卡片框左邊，距離框邊 15px
- 文字垂直居中於卡片框
- 文字右邊界對齐於 X 坐標
```

### 右側文字（第二列）
```
textX = width / 2 + 15
textY = 0
originX = 0  (左對齊)
originY = 0.5 (垂直居中)

含義：
- 文字在卡片框右邊，距離框邊 15px
- 文字垂直居中於卡片框
- 文字左邊界對齐於 X 坐標
```

---

## 🔧 關鍵代碼位置總結

| 功能 | 文件 | 行號 | 說明 |
|------|------|------|------|
| 右側卡片創建 | game.js | 2992-3100 | createRightCard 函數 |
| 中文字位置計算 | game.js | 3038-3058 | textPosition 邏輯 |
| 中文字創建 | game.js | 3060-3070 | 文字對象創建 |
| 卡片排列 | game.js | 1292-1302 | 卡片位置計算 |
| 間距計算 | game.js | 1188-1189 | verticalSpacing 計算 |
| 區域起始位置 | game.js | 1240-1242 | rightAreaStartX/Y |

---

## 📐 完整計算流程

### 步驟 1：計算間距
```javascript
// 第 1188-1189 行
const verticalSpacing = Math.max(3, height * 0.008);
```

### 步驟 2：計算卡片位置
```javascript
// 第 1295-1296 行
const x = rightAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
const y = rightAreaStartY + row * (cardHeight + rightVerticalSpacing) + cardHeight / 2;
```

### 步驟 3：確定文字位置類型
```javascript
// 第 1299 行
const textPosition = col === 0 ? 'left' : 'right';
```

### 步驟 4：創建卡片和文字
```javascript
// 第 1300 行
const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, textPosition);

// 在 createRightCard 中（第 3038-3058 行）
// 根據 textPosition 計算 textX, textY
```

---

## 💡 設計特點

### 1. 文字在卡片外
- 左列：文字在框左邊 15px
- 右列：文字在框右邊 15px
- 這樣設計可以節省卡片內部空間

### 2. 卡片間距
- 垂直間距 = max(3px, 高度 × 0.8%)
- 確保不同屏幕尺寸都有合理的間距

### 3. 文字與下方卡片的距離
- 自動計算，取決於：
  - 卡片高度
  - 垂直間距
  - 文字高度（動態計算）

---

## 🎯 如何調整中文字與下方卡片的距離

### 方法 1：調整垂直間距
**位置**：第 1189 行
```javascript
// 增加間距
const verticalSpacing = Math.max(5, height * 0.01);  // 從 0.008 改為 0.01
```

### 方法 2：調整文字位置
**位置**：第 3042 和 3048 行
```javascript
// 增加文字與框的距離
textX = width / 2 + 20;  // 從 15 改為 20
textX = -width / 2 - 20; // 從 15 改為 20
```

### 方法 3：調整文字下邊距
**位置**：第 3055 行
```javascript
// 增加文字下方的間距
textY = height / 2 + 15;  // 從 10 改為 15
```

---

**最後更新**：2025-11-01
**版本**：v1.0 - 中文字位置與卡片間距分析

