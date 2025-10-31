# Match-up 遊戲 - 混合模式中文字位置分析

## 🎮 混合模式概述

**代碼位置**：第 36 行
```javascript
this.layout = 'mixed';  // 佈局模式：separated, mixed
```

**混合模式特點**：
- ✅ 英文卡片和中文框混合排列在同一區域
- ✅ 英文卡片初始放在中文框內
- ✅ 用戶拖動英文卡片進行配對
- ✅ 適用於移動設備和小屏幕

---

## 📍 混合模式中文字代碼實際路徑

### 核心函數路徑

#### 1. 混合模式入口函數
**路徑**：第 1668-2250 行
```javascript
createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight)
```
**功能**：
- 檢測設備類型（緊湊模式或桌面模式）
- 計算卡片尺寸和間距
- 創建中文文字框
- 創建英文卡片

#### 2. 中文文字創建
**路徑**：第 2149-2194 行
```javascript
// 第二步：創建中文文字（固定位置，作為"框"的參考）
const chineseFrames = [];
currentPagePairs.forEach((pair, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    const frameX = horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2;
    const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;
    
    // 創建中文文字容器
    const frameContainer = this.add.container(frameX, frameY);
    
    // 中文文字位置
    const chineseY = cardHeightInFrame / 2;  // 緊貼白色框底部
    
    const chineseText = this.add.text(0, chineseY, pair.answer, {
        fontSize: `${chineseActualFontSize}px`,
        color: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    chineseText.setOrigin(0.5, 0);  // 水平居中，垂直從上方開始
});
```

---

## 📐 混合模式中文字位置計算

### 中文字位置公式

```javascript
// 中文文字容器位置
frameX = horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2
frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2

// 中文文字在容器內的位置
chineseY = cardHeightInFrame / 2  // 緊貼白色框底部
```

### 坐標系統說明

```
frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2
         ↓
         中文文字容器的中心位置

chineseY = cardHeightInFrame / 2
           ↓
           中文文字在容器內的位置（相對於容器中心）
```

### 視覺示意

```
┌─────────────────────────────────────────┐
│  topOffset                              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  英文卡片（cardHeightInFrame）  │   │  ← frameY (容器中心)
│  ├─────────────────────────────────┤   │
│  │  中文文字（chineseTextHeight）  │   │  ← chineseY (文字位置)
│  └─────────────────────────────────┘   │
│                                         │
│  ← totalUnitHeight (行高)               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  英文卡片                       │   │
│  ├─────────────────────────────────┤   │
│  │  中文文字                       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 關鍵尺寸計算

### 緊湊模式（手機橫向或極小高度）

**路徑**：第 1701-1800 行

```javascript
// 緊湊模式參數
const isLandscapeMobile = width > height && height < 500;
const isTinyHeight = height < 400;
const isCompactMode = isLandscapeMobile || isTinyHeight;

// 列數：固定最多5列
cols = Math.min(5, itemCount);

// 卡片高度：根據匹配數調整
const maxCardHeight = itemCount <= 5 ? 35 : itemCount <= 10 ? 32 : itemCount <= 20 ? 30 : 34;

// 框寬度：根據匹配數調整
const maxFrameWidth = itemCount <= 5 ? 280 : itemCount <= 10 ? 230 : itemCount <= 20 ? 180 : 250;
frameWidth = Math.min(maxFrameWidth, (width - horizontalMargin) / cols);

// 中文文字高度 = 最大字體大小 + 5px
chineseTextHeight = maxChineseFontSize + 5;

// 動態垂直間距 = 字體大小的20%
dynamicVerticalSpacing = Math.max(5, Math.floor(maxChineseFontSize * 0.2));

// 單元總高度 = 英文卡片高度 + 中文文字高度 + 垂直間距
totalUnitHeight = cardHeightInFrame + chineseTextHeight + dynamicVerticalSpacing;
```

### 桌面模式（正方形卡片）

**路徑**：第 1830-1989 行

```javascript
// 正方形模式（有圖片）
const minSquareSize = 150;
verticalSpacing = Math.max(40, Math.min(80, height * 0.04));

// 卡片尺寸
frameWidth = squareSize;
cardHeightInFrame = squareSize;

// 中文文字高度 = 卡片高度的40%
chineseTextHeight = squareSize * 0.4;

// 單元總高度 = 卡片高度 + 中文文字高度
totalUnitHeight = cardHeightInFrame + chineseTextHeight;  // = squareSize * 1.4
```

### 桌面模式（長方形卡片）

**路徑**：第 1990-2070 行

```javascript
// 長方形模式（無圖片）
const minCardWidth = 200;
const minCardHeight = 100;
verticalSpacing = Math.max(40, Math.min(80, height * 0.04));

// 卡片尺寸
frameWidth = (availableWidth - horizontalSpacing * (cols + 1)) / cols;
const availableHeightPerRow = (availableHeight - verticalSpacing * (rows + 1)) / rows;

// 卡片高度：單元總高度的60%
cardHeightInFrame = availableHeightPerRow * 0.6;

// 中文文字高度：單元總高度的40%
chineseTextHeight = availableHeightPerRow * 0.4;

// 單元總高度
totalUnitHeight = cardHeightInFrame + chineseTextHeight;
```

---

## 📊 中文字與下方卡片的距離

### 距離計算公式

```
距離 = (下一行frameY) - (當前行frameY) - totalUnitHeight/2 - 中文字高度/2

簡化：
距離 = totalUnitHeight - totalUnitHeight/2 - 中文字高度/2
     = totalUnitHeight/2 - 中文字高度/2
```

### 具體示例（緊湊模式）

```
假設：
- cardHeightInFrame = 30px
- chineseTextHeight = 21px（字體18px + 5px行高）
- dynamicVerticalSpacing = 4px

totalUnitHeight = 30 + 21 + 4 = 55px

距離 = 55/2 - 21/2
     = 27.5 - 10.5
     = 17px
```

### 具體示例（桌面正方形模式）

```
假設：
- squareSize = 200px
- chineseTextHeight = 200 * 0.4 = 80px

totalUnitHeight = 200 + 80 = 280px

距離 = 280/2 - 80/2
     = 140 - 40
     = 100px
```

---

## 🔧 關鍵代碼位置總結

| 功能 | 文件 | 行號 | 說明 |
|------|------|------|------|
| **混合模式入口** | game.js | 1668-2250 | createMixedLayout 函數 |
| **響應式檢測** | game.js | 1673-1688 | 緊湊模式判斷 |
| **緊湊模式計算** | game.js | 1701-1800 | 手機橫向/極小高度 |
| **桌面模式計算** | game.js | 1801-2071 | 正方形/長方形模式 |
| **中文文字創建** | game.js | 2149-2194 | 中文框和文字位置 |
| **英文卡片創建** | game.js | 2196-2243 | 英文卡片初始位置 |
| **間距計算** | game.js | 2076-2099 | horizontalSpacing, verticalSpacing |

---

## 💡 中文字位置特點

### 1. 中文字在白色框下方
```javascript
// 中文文字位置（相對於容器中心）
const chineseY = cardHeightInFrame / 2;  // 緊貼白色框底部

// 設置原點為水平居中，垂直從上方開始
chineseText.setOrigin(0.5, 0);
```

### 2. 中文字與英文卡片的關係
```
┌─────────────────┐
│  英文卡片       │  ← 在上方
├─────────────────┤
│  中文文字       │  ← 在下方，緊貼框底部
└─────────────────┘
```

### 3. 中文字高度動態計算
- **緊湊模式**：根據實際字體大小 + 5px 行高
- **桌面模式**：卡片高度的 40%（正方形）或根據可用空間計算

---

## 📚 完整計算流程

### 步驟 1：檢測設備類型
```javascript
const isCompactMode = (width > height && height < 500) || height < 400;
```

### 步驟 2：計算卡片尺寸
- 緊湊模式：固定5列，根據匹配數調整卡片高度
- 桌面模式：根據屏幕寬高比和匹配數計算最佳列數

### 步驟 3：計算中文文字高度
- 預先計算所有中文文字的實際字體大小
- 使用最大字體大小作為中文文字高度

### 步驟 4：計算單元總高度
```javascript
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

### 步驟 5：計算中文文字位置
```javascript
frameX = horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2;
frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;
chineseY = cardHeightInFrame / 2;
```

### 步驟 6：創建中文文字和英文卡片
- 創建中文文字容器（frameContainer）
- 在容器內添加白色框和中文文字
- 創建英文卡片並放在中文文字上方

---

**最後更新**：2025-11-01
**版本**：v1.0 - 混合模式中文字位置分析

