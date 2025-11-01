# 正方形模式 vs 長方形模式 - 詳細對比分析

## 📊 兩種模式的核心區別

### 模式選擇邏輯

```javascript
// 代碼位置：第 1815-1830 行
if (hasImages) {
    // 🟦 正方形模式（有圖片）
} else {
    // 🟨 長方形模式（無圖片）
}
```

---

## 🟦 正方形模式（有圖片）- Screenshot_174

**代碼位置**：第 1830-1989 行

### 特點
- ✅ 卡片是正方形（1:1 比例）
- ✅ 卡片下方有中文文字
- ✅ 適合展示圖片
- ✅ 列數較少（1-10 列）

### 計算流程

#### 第一步：定義最小卡片尺寸
```javascript
const minSquareSize = 150;  // 最小正方形尺寸 150×150
```

#### 第二步：計算垂直間距
```javascript
verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
// 範圍：40-80px，基於高度的 4%
```

#### 第三步：計算最大可能列數
```javascript
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minSquareSize + horizontalSpacing));
```

#### 第四步：智能計算最佳列數
```javascript
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
```

#### 第五步：計算卡片尺寸
```javascript
// 方法1：基於高度
// totalUnitHeight = squareSize * 1.4（包含中文文字）
let squareSizeByHeight = availableHeightPerRow / 1.4;

// 方法2：基於寬度
const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

// 取較小值
let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);
```

#### 第六步：設置卡片尺寸
```javascript
frameWidth = squareSize;
cardHeightInFrame = squareSize;
chineseTextHeight = squareSize * 0.4;  // 中文文字高度為卡片高度的 40%
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
// = squareSize * 1.4 + verticalSpacing
```

### 計算示例（1280×720，20 個卡片）

```
第一步：定義最小尺寸
- minSquareSize = 150px

第二步：計算垂直間距
- verticalSpacing = max(40, min(80, 720 * 0.04)) = 28.8 ≈ 29px

第三步：計算最大可能列數
- maxPossibleCols = floor((1220 + 29) / (150 + 29)) = floor(1249 / 179) = 6

第四步：計算最佳列數
- aspectRatio = 1280 / 720 = 1.78（寬螢幕）
- optimalCols = min(6, 10, 20) = 5

第五步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- availableHeightPerRow = (560 - 29 * 5) / 4 = (560 - 145) / 4 = 103.75px
- squareSizeByHeight = 103.75 / 1.4 = 74.1px
- squareSizeByWidth = (1220 - 29 * 6) / 5 = (1220 - 174) / 5 = 209.2px
- squareSize = min(74.1, 209.2) = 74.1px ❌ 小於最小值 150px

第六步：智能調整
- 嘗試增加列數或縮小卡片
- 最終結果：squareSize ≈ 74-100px（根據實際高度調整）
```

---

## 🟨 長方形模式（無圖片）- Screenshot_176

**代碼位置**：第 1990-2071 行

### 特點
- ✅ 卡片是長方形（寬 > 高）
- ✅ 卡片下方有中文文字
- ✅ 適合純文字內容
- ✅ 列數較多（3-8 列）
- ✅ 卡片更寬，文字更易讀

### 計算流程

#### 第一步：定義最小卡片尺寸
```javascript
const minCardWidth = 200;
const minCardHeight = 100;
```

#### 第二步：計算垂直間距
```javascript
verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
// 範圍：40-80px，基於高度的 4%（與正方形模式相同）
```

#### 第三步：計算最大可能列數和行數
```javascript
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minCardWidth + horizontalSpacing));
const maxPossibleRows = Math.floor((availableHeight + verticalSpacing) / (minCardHeight + verticalSpacing));
```

#### 第四步：智能計算最佳列數
```javascript
let optimalCols;

if (aspectRatio > 2.0) {
    // 超寬螢幕（21:9, 32:9）
    optimalCols = Math.min(8, Math.ceil(Math.sqrt(itemCount * aspectRatio)));
} else if (aspectRatio > 1.5) {
    // 寬螢幕（16:9, 16:10）
    optimalCols = Math.min(6, Math.ceil(Math.sqrt(itemCount * aspectRatio / 1.5)));
} else if (aspectRatio > 1.2) {
    // 標準螢幕（4:3, 3:2）
    optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount)));
} else {
    // 直向螢幕（9:16）
    optimalCols = Math.min(3, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
}
```

#### 第五步：計算卡片尺寸
```javascript
// 卡片寬度（充分利用可用空間）
frameWidth = (availableWidth - horizontalSpacing * (cols + 1)) / cols;

// 計算單元總高度（包含中文文字）
const availableHeightPerRow = (availableHeight - verticalSpacing * (rows + 1)) / rows;

// 卡片高度：單元總高度的 60%
cardHeightInFrame = availableHeightPerRow * 0.6;

// 中文文字高度：單元總高度的 40%
chineseTextHeight = availableHeightPerRow * 0.4;

totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

### 計算示例（1280×720，20 個卡片）

```
第一步：定義最小尺寸
- minCardWidth = 200px
- minCardHeight = 100px

第二步：計算垂直間距
- verticalSpacing = max(40, min(80, 720 * 0.04)) = 28.8 ≈ 29px

第三步：計算最大可能列數和行數
- maxPossibleCols = floor((1220 + 29) / (200 + 29)) = floor(1249 / 229) = 5
- maxPossibleRows = floor((560 + 29) / (100 + 29)) = floor(589 / 129) = 4

第四步：計算最佳列數
- aspectRatio = 1280 / 720 = 1.78（寬螢幕）
- optimalCols = min(6, ceil(sqrt(20 * 1.78 / 1.5))) = min(6, ceil(sqrt(23.73))) = min(6, 5) = 5

第五步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- frameWidth = (1220 - 29 * 6) / 5 = (1220 - 174) / 5 = 209.2px
- availableHeightPerRow = (560 - 29 * 5) / 4 = (560 - 145) / 4 = 103.75px
- cardHeightInFrame = 103.75 * 0.6 = 62.25px
- chineseTextHeight = 103.75 * 0.4 = 41.5px
- totalUnitHeight = 62.25 + 41.5 + 29 = 132.75px

結果：
- 卡片尺寸：209.2 × 62.25px（寬 > 高）
- 卡片比例：3.36:1（長方形）
- 中文文字高度：41.5px
- 行高：132.75px
```

---

## 📈 對比表格

| 項目 | 正方形模式 | 長方形模式 |
|------|----------|----------|
| **卡片比例** | 1:1（正方形） | 3.36:1（長方形） |
| **最小寬度** | 150px | 200px |
| **最小高度** | 150px | 100px |
| **最大列數** | 10 列 | 8 列 |
| **最大行數** | 無限制 | 無限制 |
| **適用場景** | 有圖片 | 無圖片 |
| **列數計算** | 固定限制 | 基於 sqrt(itemCount) |
| **卡片寬度** | 基於正方形 | 充分利用寬度 |
| **卡片高度** | 與寬度相同 | 單元高度的 60% |
| **中文文字** | 卡片高度的 40% | 單元高度的 40% |
| **視覺效果** | 緊湊 | 寬鬆 |

---

## 🔍 關鍵差異分析

### 1. 列數計算策略

**正方形模式**：
```javascript
// 固定限制，不超過 10 列
optimalCols = Math.min(maxPossibleCols, maxColsLimit, itemCount);
```

**長方形模式**：
```javascript
// 基於匹配數的平方根，更靈活
optimalCols = Math.min(maxCols, Math.ceil(Math.sqrt(itemCount * aspectRatio)));
```

### 2. 卡片尺寸計算

**正方形模式**：
```javascript
// 卡片是正方形，寬度 = 高度
frameWidth = squareSize;
cardHeightInFrame = squareSize;
```

**長方形模式**：
```javascript
// 卡片是長方形，充分利用寬度
frameWidth = (availableWidth - horizontalSpacing * (cols + 1)) / cols;
cardHeightInFrame = availableHeightPerRow * 0.6;
```

### 3. 高度分配

**正方形模式**：
```javascript
// 總高度 = 卡片高度 + 中文文字高度 + 間距
// = squareSize + squareSize * 0.4 + verticalSpacing
// = squareSize * 1.4 + verticalSpacing
```

**長方形模式**：
```javascript
// 總高度 = 單元高度 + 間距
// = (cardHeightInFrame + chineseTextHeight) + verticalSpacing
// = (availableHeightPerRow * 0.6 + availableHeightPerRow * 0.4) + verticalSpacing
// = availableHeightPerRow + verticalSpacing
```

---

## 💡 何時使用哪種模式

### 使用正方形模式（有圖片）
- ✅ 卡片包含圖片
- ✅ 需要展示視覺內容
- ✅ 圖片是 1:1 比例
- ✅ 匹配數較少（≤ 20）

### 使用長方形模式（無圖片）
- ✅ 卡片只有文字
- ✅ 只有語音和英文
- ✅ 需要更寬的卡片
- ✅ 文字易讀性優先
- ✅ 匹配數較多（> 10）

---

## 🎯 實施建議

### 1. 自動檢測
```javascript
// 根據內容自動選擇模式
const hasImages = currentPagePairs.some(pair => pair.imageUrl);
if (hasImages) {
    // 使用正方形模式
} else {
    // 使用長方形模式
}
```

### 2. 手動覆蓋
```javascript
// 允許通過 URL 參數手動指定
const layoutParam = urlParams.get('cardLayout');  // 'square' 或 'rectangle'
```

### 3. 響應式調整
```javascript
// 根據屏幕尺寸調整
if (width < 768) {
    // 小屏幕：使用長方形模式
} else {
    // 大屏幕：根據內容選擇
}
```

---

**最後更新**：2025-11-01
**版本**：v1.0 - 正方形模式 vs 長方形模式對比分析

