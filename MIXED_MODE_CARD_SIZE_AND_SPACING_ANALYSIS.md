# 混合模式 - 卡片框大小與距離計算詳細分析

## 📐 卡片框大小計算

### 桌面模式 - 正方形卡片（有圖片）

**代碼位置**：第 1830-1965 行

#### 第一步：定義邊距和可用空間

```javascript
// 頂部按鈕區域（50-80px）
const topButtonAreaHeight = Math.max(50, Math.min(80, height * 0.08));

// 底部按鈕區域（50-80px）
const bottomButtonAreaHeight = Math.max(50, Math.min(80, height * 0.10));

// 左右邊距（30-80px）
const sideMargin = Math.max(30, Math.min(80, width * 0.03));

// 可用寬度 = 螢幕寬度 - 左右邊距
const availableWidth = width - sideMargin * 2;

// 可用高度 = 螢幕高度 - 頂部按鈕 - 底部按鈕
const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;
```

#### 第二步：計算水平和垂直間距

```javascript
// 水平間距（15-30px，基於寬度的1.5%）
const horizontalSpacing = Math.max(15, Math.min(30, width * 0.015));

// 垂直間距（40-80px，基於高度的4%）
const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
```

#### 第三步：計算最佳列數

```javascript
// 最小正方形卡片尺寸
const minSquareSize = 150;

// 最大可能列數
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minSquareSize + horizontalSpacing));

// 根據寬高比計算最佳列數
const aspectRatio = width / height;

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

#### 第四步：計算正方形卡片尺寸

```javascript
// 方法1：基於高度計算
// totalUnitHeight = squareSize + (squareSize * 0.4) = squareSize * 1.4
// 所以 squareSize = totalUnitHeight / 1.4
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
const squareSizeByHeight = availableHeightPerRow / 1.4;

// 方法2：基於寬度計算
const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

// 取較小值，確保卡片不會超出邊界
let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);

// 確保卡片不小於最小尺寸
if (squareSize < minSquareSize && optimalCols < itemCount) {
    // 嘗試增加列數，減少行數
    // ... 重新計算邏輯
}
```

#### 第五步：設置卡片尺寸

```javascript
frameWidth = squareSize;
cardHeightInFrame = squareSize;
chineseTextHeight = squareSize * 0.4;  // 中文文字高度為卡片高度的40%
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

---

### 桌面模式 - 長方形卡片（無圖片）

**代碼位置**：第 1990-2048 行

#### 計算步驟

```javascript
// 最小卡片大小
const minCardWidth = 200;
const minCardHeight = 100;

// 垂直間距（40-80px，基於高度的4%）
const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));

// 最大可能列數和行數
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minCardWidth + horizontalSpacing));
const maxPossibleRows = Math.floor((availableHeight + verticalSpacing) / (minCardHeight + verticalSpacing));

// 根據寬高比計算最佳列數
let optimalCols;
if (aspectRatio > 2.0) {
    optimalCols = Math.min(8, Math.ceil(Math.sqrt(itemCount * aspectRatio)));
} else if (aspectRatio > 1.5) {
    optimalCols = Math.min(6, Math.ceil(Math.sqrt(itemCount * aspectRatio / 1.5)));
} else if (aspectRatio > 1.2) {
    optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount)));
} else {
    optimalCols = Math.min(3, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
}

// 確保列數在合理範圍內
optimalCols = Math.max(1, Math.min(optimalCols, maxPossibleCols, itemCount));

// 計算行數
let optimalRows = Math.ceil(itemCount / optimalCols);

// 如果行數超過最大可能行數，增加列數
while (optimalRows > maxPossibleRows && optimalCols < itemCount) {
    optimalCols++;
    optimalRows = Math.ceil(itemCount / optimalCols);
}

// 計算卡片寬度
frameWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

// 計算單元總高度
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;

// 卡片高度：單元總高度的60%
cardHeightInFrame = availableHeightPerRow * 0.6;

// 中文文字高度：單元總高度的40%
chineseTextHeight = availableHeightPerRow * 0.4;

// 單元總高度
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

---

## 📏 卡片位置計算

### 水平位置（frameX）

**代碼位置**：第 2155 行

```javascript
const frameX = horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2;
```

#### 計算說明

```
frameX = horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2
         ↓                    ↓                                        ↓
         左邊距              列偏移                                   卡片中心偏移

視覺示意：
┌─────────────────────────────────────────────────────────────┐
│ ← horizontalSpacing →                                       │
│                    ┌─────────────┐                          │
│                    │  卡片 (col=0)│ ← frameX (col=0)        │
│                    └─────────────┘                          │
│                                  ← frameWidth + horizontalSpacing →
│                                                 ┌─────────────┐
│                                                 │  卡片 (col=1)│ ← frameX (col=1)
│                                                 └─────────────┘
└─────────────────────────────────────────────────────────────┘
```

#### 具體計算示例

```
假設：
- horizontalSpacing = 20px
- frameWidth = 150px
- col = 0

frameX(col=0) = 20 + 0 * (150 + 20) + 150/2 = 20 + 0 + 75 = 95px

假設：
- col = 1

frameX(col=1) = 20 + 1 * (150 + 20) + 150/2 = 20 + 170 + 75 = 265px

水平距離 = frameX(col=1) - frameX(col=0) = 265 - 95 = 170px
         = frameWidth + horizontalSpacing = 150 + 20 = 170px ✅
```

---

### 垂直位置（frameY）

**代碼位置**：第 2157 行

```javascript
const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;
```

#### 計算說明

```
frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2
         ↓          ↓                        ↓
         頂部偏移   行偏移                   容器中心偏移

視覺示意：
┌─────────────────────────────────────────┐
│ ← topOffset →                           │
│              ┌─────────────────────┐   │
│              │  卡片 (row=0)       │   │ ← frameY (row=0)
│              ├─────────────────────┤   │
│              │  中文文字           │   │
│              └─────────────────────┘   │
│                                         │
│              ← totalUnitHeight →        │
│                                         │
│              ┌─────────────────────┐   │
│              │  卡片 (row=1)       │   │ ← frameY (row=1)
│              ├─────────────────────┤   │
│              │  中文文字           │   │
│              └─────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### 具體計算示例

```
假設：
- topOffset = 50px
- totalUnitHeight = 280px（200 + 80 + 0）
- row = 0

frameY(row=0) = 50 + 0 * 280 + 280/2 = 50 + 0 + 140 = 190px

假設：
- row = 1

frameY(row=1) = 50 + 1 * 280 + 280/2 = 50 + 280 + 140 = 470px

垂直距離 = frameY(row=1) - frameY(row=0) = 470 - 190 = 280px
         = totalUnitHeight = 280px ✅
```

---

## 📊 不同解析度的計算示例

### 示例 1：1920×1080（16:9 寬螢幕）

```
輸入：
- width = 1920, height = 1080
- itemCount = 25（5×5 網格）
- hasImages = true（正方形模式）

第一步：計算邊距
- topButtonAreaHeight = min(80, 1080 * 0.08) = 80px
- bottomButtonAreaHeight = min(80, 1080 * 0.10) = 80px
- sideMargin = min(80, 1920 * 0.03) = 57.6 ≈ 58px
- availableWidth = 1920 - 58*2 = 1804px
- availableHeight = 1080 - 80 - 80 = 920px

第二步：計算間距
- horizontalSpacing = min(30, 1920 * 0.015) = 28.8 ≈ 29px
- verticalSpacing = min(80, 1080 * 0.04) = 43.2 ≈ 43px

第三步：計算列數
- aspectRatio = 1920 / 1080 = 1.78（寬螢幕）
- maxPossibleCols = floor((1804 + 29) / (150 + 29)) = floor(1833 / 179) = 10
- optimalCols = min(10, 10, 25) = 5（因為 5×5 = 25）

第四步：計算卡片尺寸
- optimalRows = ceil(25 / 5) = 5
- availableHeightPerRow = (920 - 43 * 6) / 5 = (920 - 258) / 5 = 132.4px
- squareSizeByHeight = 132.4 / 1.4 = 94.6px
- squareSizeByWidth = (1804 - 29 * 6) / 5 = (1804 - 174) / 5 = 326px
- squareSize = min(94.6, 326) = 94.6px ❌ 小於最小值 150px

結果：需要調整列數或卡片尺寸
```

### 示例 2：1280×720（16:9 標準寬螢幕）

```
輸入：
- width = 1280, height = 720
- itemCount = 20（4×5 網格）
- hasImages = true（正方形模式）

第一步：計算邊距
- topButtonAreaHeight = min(80, 720 * 0.08) = 57.6 ≈ 58px
- bottomButtonAreaHeight = min(80, 720 * 0.10) = 72px
- sideMargin = min(80, 1280 * 0.03) = 38.4 ≈ 38px
- availableWidth = 1280 - 38*2 = 1204px
- availableHeight = 720 - 58 - 72 = 590px

第二步：計算間距
- horizontalSpacing = min(30, 1280 * 0.015) = 19.2 ≈ 19px
- verticalSpacing = min(80, 720 * 0.04) = 28.8 ≈ 29px

第三步：計算列數
- aspectRatio = 1280 / 720 = 1.78（寬螢幕）
- maxPossibleCols = floor((1204 + 19) / (150 + 19)) = floor(1223 / 169) = 7
- optimalCols = min(7, 10, 20) = 5（因為 5×4 = 20）

第四步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- availableHeightPerRow = (590 - 29 * 5) / 4 = (590 - 145) / 4 = 111.25px
- squareSizeByHeight = 111.25 / 1.4 = 79.5px
- squareSizeByWidth = (1204 - 19 * 6) / 5 = (1204 - 114) / 5 = 218px
- squareSize = min(79.5, 218) = 79.5px ❌ 小於最小值 150px

結果：需要調整列數或卡片尺寸
```

### 示例 3：768×1024（3:4 直向螢幕）

```
輸入：
- width = 768, height = 1024
- itemCount = 12（3×4 網格）
- hasImages = true（正方形模式）

第一步：計算邊距
- topButtonAreaHeight = min(80, 1024 * 0.08) = 80px
- bottomButtonAreaHeight = min(80, 1024 * 0.10) = 80px
- sideMargin = min(80, 768 * 0.03) = 23.04 ≈ 30px
- availableWidth = 768 - 30*2 = 708px
- availableHeight = 1024 - 80 - 80 = 864px

第二步：計算間距
- horizontalSpacing = min(30, 768 * 0.015) = 11.52 ≈ 15px
- verticalSpacing = min(80, 1024 * 0.04) = 40.96 ≈ 41px

第三步：計算列數
- aspectRatio = 768 / 1024 = 0.75（直向螢幕）
- maxPossibleCols = floor((708 + 15) / (150 + 15)) = floor(723 / 165) = 4
- optimalCols = min(4, 5, 12) = 3（因為 3×4 = 12）

第四步：計算卡片尺寸
- optimalRows = ceil(12 / 3) = 4
- availableHeightPerRow = (864 - 41 * 5) / 4 = (864 - 205) / 4 = 164.75px
- squareSizeByHeight = 164.75 / 1.4 = 117.7px
- squareSizeByWidth = (708 - 15 * 4) / 3 = (708 - 60) / 3 = 216px
- squareSize = min(117.7, 216) = 117.7px ❌ 小於最小值 150px

結果：需要調整列數或卡片尺寸
```

---

## 🔍 Screenshot_174 的計算分析

根據截圖顯示 **5 列 4 行** 的佈局（20 個卡片），推測解析度約為 **1280×720 或類似**：

```
計算結果：
- 列數：5
- 行數：4
- 卡片寬度：約 150-200px
- 卡片高度：約 150-200px（正方形）
- 水平間距：約 15-20px
- 垂直間距：約 30-40px
- 中文文字高度：約 60-80px（卡片高度的40%）
```

---

**最後更新**：2025-11-01
**版本**：v1.0 - 混合模式卡片尺寸和距離計算分析

