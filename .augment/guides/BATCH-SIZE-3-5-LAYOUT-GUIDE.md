# 批數 3-5 布局調整指南

## 概述

本文檔說明如何調整 Match-Up 遊戲中批數為 3-5 的卡片布局。批數 3-5 使用**左右分離單列布局**，圖片+文字在空白框的右側**水平呈現**。

## 布局結構

### 視覺布局

```
┌──────────────────────────────────────────────────────┐
│              計時器區域 (50px)                        │
├──────────────────────────────────────────────────────┤
│  [英文卡片1]  │  [空白框1]  [答案卡片1]              │
│  (左側)       │  (中間)     [圖片+文字]              │
│               │            (右側水平呈現)            │
├──────────────────────────────────────────────────────┤
│  [英文卡片2]  │  [空白框2]  [答案卡片2]              │
│  (左側)       │  (中間)     [圖片+文字]              │
│               │            (右側水平呈現)            │
├──────────────────────────────────────────────────────┤
│  [英文卡片3]  │  [空白框3]  [答案卡片3]              │
│  (左側)       │  (中間)     [圖片+文字]              │
│               │            (右側水平呈現)            │
├──────────────────────────────────────────────────────┤
│              提交按鈕區域 (80px)                      │
└──────────────────────────────────────────────────────┘
```

### 區域劃分

| 區域 | 內容 | 寬度比例 | 說明 |
|------|------|---------|------|
| 左側 | 英文卡片 | ~30% | 垂直排列 |
| 中間 | 空白框 | ~35% | 垂直排列 |
| 右側 | 答案卡片 | ~35% | 圖片+文字水平呈現 |

## 關鍵參數

### 1. 水平空間分配

**文件**: `public/games/match-up-game/scenes/game.js` (L1911-2000)

```javascript
// 左右分離單列布局的寬度計算
const leftCardWidth = width * 0.25;      // 左側卡片寬度
const rightBoxWidth = width * 0.35;     // 右側空白框寬度
const answerCardWidth = width * 0.35;   // 答案卡片寬度
```

### 2. 垂直空間分配

```javascript
const timerHeight = 50;                 // 計時器高度
const timerGap = 20;                    // 計時器下方間距
const additionalTopMargin = 50;         // 上方邊距
const topButtonArea = 120;              // 上方區域總高度

const bottomButtonArea = 80;            // 提交按鈕區域
const availableHeight = height - topButtonArea - bottomButtonArea;

// 每個卡片的高度
const cardHeight = availableHeight / itemCount;
```

### 3. 卡片間距

```javascript
const verticalSpacing = 10;             // 卡片之間的垂直間距
const horizontalSpacing = 15;           // 左右區域之間的水平間距
```

## 調整方法

### 方法 1: 調整左側卡片寬度

**目標**: 讓英文卡片更寬或更窄

**步驟**:
1. 修改 `leftCardWidth` 比例
   - 增大比例 (如 0.3) → 卡片更寬
   - 減小比例 (如 0.2) → 卡片更窄

2. 例如，改為 `leftCardWidth = width * 0.3`:
   ```
   左側卡片寬度 = 1841 × 0.3 = 552px
   ```

### 方法 2: 調整右側答案卡片寬度

**目標**: 讓答案卡片（圖片+文字）更寬或更窄

**步驟**:
1. 修改 `answerCardWidth` 比例
   - 增大比例 (如 0.4) → 答案卡片更寬
   - 減小比例 (如 0.3) → 答案卡片更窄

2. 例如，改為 `answerCardWidth = width * 0.4`:
   ```
   答案卡片寬度 = 1841 × 0.4 = 736px
   ```

### 方法 3: 調整卡片高度

**目標**: 讓卡片更高或更矮

**步驟**:
1. 修改 `availableHeight` 計算
   - 減小 `topButtonArea` → 卡片更高
   - 減小 `bottomButtonArea` → 卡片更高

2. 例如，改為 `bottomButtonArea = 60`:
   ```
   可用高度 = 674 - 120 - 60 = 494px
   卡片高度 = 494 / 3 = 164.67px ≈ 165px
   ```

### 方法 4: 調整圖片+文字的水平呈現

**目標**: 改變圖片和文字的排列方式

**步驟**:
1. 在答案卡片中調整圖片和文字的比例
   - 圖片寬度比例：`imageWidth = cardWidth * 0.5`
   - 文字寬度比例：`textWidth = cardWidth * 0.5`

2. 例如，改為 `imageWidth = cardWidth * 0.6`:
   ```
   圖片寬度 = 卡片寬度 × 0.6
   文字寬度 = 卡片寬度 × 0.4
   ```

## 實際調整示例

### 示例 1: 讓英文卡片更寬

**需求**: 英文卡片太窄，文字看不清

**調整**:
```javascript
// 修改前
const leftCardWidth = width * 0.25;
const rightBoxWidth = width * 0.35;
const answerCardWidth = width * 0.35;

// 修改後
const leftCardWidth = width * 0.35;
const rightBoxWidth = width * 0.30;
const answerCardWidth = width * 0.30;
```

**結果**:
```
英文卡片寬度：從 460px 增加到 644px
空白框寬度：從 644px 減少到 552px
答案卡片寬度：從 644px 減少到 552px
```

### 示例 2: 讓答案卡片更寬

**需求**: 答案卡片（圖片+文字）太窄，圖片看不清

**調整**:
```javascript
// 修改前
const leftCardWidth = width * 0.25;
const rightBoxWidth = width * 0.35;
const answerCardWidth = width * 0.35;

// 修改後
const leftCardWidth = width * 0.20;
const rightBoxWidth = width * 0.30;
const answerCardWidth = width * 0.45;
```

**結果**:
```
英文卡片寬度：從 460px 減少到 368px
空白框寬度：從 644px 減少到 552px
答案卡片寬度：從 644px 增加到 828px
```

## 與批數 7 的對比

| 特性 | 批數 3-5 | 批數 7 |
|------|---------|--------|
| 布局方式 | 左右分離 | 上下分離 |
| 卡片排列 | 垂直（3-5 行） | 水平（7 列） |
| 圖片+文字 | 水平呈現 | 垂直堆疊 |
| 適用場景 | 少量詞彙 | 較多詞彙 |
| 文件位置 | L1911-2000 | L2523-2674 |

## 調試技巧

### 1. 查看控制台日誌

```
📐 創建左右分離佈局 - 自適應佈局（3-20個匹配數）
```

### 2. 檢查實際尺寸

```javascript
// 在瀏覽器控制台執行
const gameScene = window.matchUpGame.scene.scenes[1];
console.log('左側卡片寬度:', gameScene.leftCardWidth);
console.log('右側框寬度:', gameScene.rightBoxWidth);
console.log('答案卡片寬度:', gameScene.answerCardWidth);
console.log('卡片高度:', gameScene.cardHeight);
```

## 常見問題

### Q1: 英文卡片和空白框重疊

**解決方案**:
1. 檢查 `leftCardWidth` 和 `rightBoxWidth` 的比例
2. 確保總寬度不超過 100%
3. 增加 `horizontalSpacing` 間距

### Q2: 答案卡片（圖片+文字）太擁擠

**解決方案**:
1. 增加 `answerCardWidth` 比例
2. 減少 `leftCardWidth` 或 `rightBoxWidth`
3. 調整圖片和文字的寬度比例

### Q3: 卡片高度不夠

**解決方案**:
1. 減少 `topButtonArea` 或 `bottomButtonArea`
2. 減少 `verticalSpacing` 間距
3. 考慮改為批數 7 的上下分離布局

## 相關文件

- `public/games/match-up-game/scenes/game.js` - 主要布局邏輯
- `.augment/guides/BATCH-SIZE-7-LAYOUT-GUIDE.md` - 批數 7 布局指南
- `public/games/match-up-game/config.js` - Phaser 配置

