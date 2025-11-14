# 批數 10 布局分析與調整指南

## 概述

本文檔對比批數 7 和批數 10 的布局差異，並提供詳細的調整方法。

## 布局結構對比

### 批數 7 - 單行布局
```
┌─────────────────────────────────────────────────────────┐
│                    計時器區域 (50px)                      │
├─────────────────────────────────────────────────────────┤
│                  上方英文卡片區域 (311px)                 │
│  [卡片1] [卡片2] [卡片3] [卡片4] [卡片5] [卡片6] [卡片7]  │
├─────────────────────────────────────────────────────────┤
│                  下方空白框區域 (311px)                   │
│  [框1]   [框2]   [框3]   [框4]   [框5]   [框6]   [框7]   │
├─────────────────────────────────────────────────────────┤
│              答案卡片區域 (140px)                         │
│  [答案1] [答案2] [答案3] [答案4] [答案5] [答案6] [答案7]  │
├─────────────────────────────────────────────────────────┤
│                  提交按鈕區域 (80px)                      │
└─────────────────────────────────────────────────────────┘
```

### 批數 10 - 雙行布局
```
┌─────────────────────────────────────────────────────────┐
│                    計時器區域 (50px)                      │
├─────────────────────────────────────────────────────────┤
│              上方英文卡片區域 - 第 1 行 (60px)            │
│  [卡片1] [卡片2] [卡片3] [卡片4] [卡片5]                 │
│              上方英文卡片區域 - 第 2 行 (60px)            │
│  [卡片6] [卡片7] [卡片8] [卡片9] [卡片10]                │
├─────────────────────────────────────────────────────────┤
│              下方答案卡片區域 - 第 1 行 (60px)            │
│  [答案1] [答案2] [答案3] [答案4] [答案5]                 │
│              下方答案卡片區域 - 第 2 行 (60px)            │
│  [答案6] [答案7] [答案8] [答案9] [答案10]                │
├─────────────────────────────────────────────────────────┤
│                  提交按鈕區域 (80px)                      │
└─────────────────────────────────────────────────────────┘
```

## 核心參數對比

| 參數 | 批數 7 | 批數 10 | 說明 |
|------|--------|---------|------|
| **布局方式** | 單行 | 雙行 (2×5) | 批數 10 使用 2 行 5 列 |
| **卡片寬度** | 248px | 120-160px | 批數 10 卡片更小 |
| **卡片高度** | 311px | 45-75px | 批數 10 卡片更小 |
| **行數** | 1 | 2 | 批數 10 需要 2 行 |
| **列數** | 7 | 5 | 批數 10 每行 5 列 |
| **卡片間距** | 18px | 5-10px | 批數 10 間距更小 |
| **文字高度** | 26px | 24-48px | 根據卡片高度計算 |

## 批數 10 的布局邏輯

### 1. 行列計算

**文件**: `public/games/match-up-game/scenes/game.js` (L2455-2475)

```javascript
const itemCount = 10;  // 批數 10
const rows = 2;        // 固定 2 行
const columns = Math.ceil(itemCount / rows);  // 5 列

// 結果：2 行 × 5 列
```

### 2. 卡片尺寸計算

**文件**: `public/games/match-up-game/scenes/game.js` (L2476-2487)

```javascript
// 根據容器高度選擇不同的計算方式
if (isSmallContainer) {  // height < 600px
    cardWidth = Math.max(80, Math.min(120, width * (0.85 / columns)));
    cardHeight = Math.max(35, Math.min(55, height * 0.15));
} else if (isMediumContainer) {  // 600px <= height < 800px
    cardWidth = Math.max(80, Math.min(140, width * (0.88 / columns)));
    cardHeight = Math.max(40, Math.min(65, height * 0.16));
} else {  // height >= 800px
    cardWidth = Math.max(90, Math.min(160, width * (0.9 / columns)));
    cardHeight = Math.max(45, Math.min(75, height * 0.17));
}
```

### 3. 位置計算

**文件**: `public/games/match-up-game/scenes/game.js` (L2503-2516)

```javascript
// 上方區域（英文卡片）
const topAreaStartX = (width - (columns * cardWidth + (columns - 1) * horizontalSpacing)) / 2;
const topAreaStartY = height * 0.12;  // 距離頂部 12%

// 下方區域（中文卡片）
const bottomAreaStartX = topAreaStartX;  // 與上方對齐
const bottomAreaStartY = height * 0.55;  // 距離頂部 55%
```

## 調整方法

### 方法 1: 調整卡片寬度

**目標**: 讓卡片更寬或更窄

**步驟**:
1. 修改寬度計算公式中的係數
   ```javascript
   // 修改前（0.85 / columns）
   cardWidth = Math.max(80, Math.min(120, width * (0.85 / columns)));
   
   // 修改後（增加係數到 0.90）
   cardWidth = Math.max(80, Math.min(140, width * (0.90 / columns)));
   ```

2. 調整最小值和最大值
   - 增大最小值 (如 100) → 卡片最小寬度更大
   - 增大最大值 (如 160) → 卡片最大寬度更大

### 方法 2: 調整卡片高度

**目標**: 讓卡片更高或更矮

**步驟**:
1. 修改高度計算公式中的係數
   ```javascript
   // 修改前（height * 0.15）
   cardHeight = Math.max(35, Math.min(55, height * 0.15));
   
   // 修改後（增加係數到 0.20）
   cardHeight = Math.max(35, Math.min(75, height * 0.20));
   ```

2. 調整最小值和最大值
   - 增大最小值 (如 50) → 卡片最小高度更大
   - 增大最大值 (如 80) → 卡片最大高度更大

### 方法 3: 調整卡片間距

**目標**: 改變卡片之間的距離

**步驟**:
1. 修改間距計算
   ```javascript
   // 修改前
   const horizontalSpacing = Math.max(5, width * 0.01);
   
   // 修改後（增加間距）
   const horizontalSpacing = Math.max(8, width * 0.015);
   ```

### 方法 4: 調整區域位置

**目標**: 改變上下區域的位置

**步驟**:
1. 修改起始位置百分比
   ```javascript
   // 修改前
   const topAreaStartY = height * 0.12;      // 距離頂部 12%
   const bottomAreaStartY = height * 0.55;   // 距離頂部 55%
   
   // 修改後（增加上方區域高度）
   const topAreaStartY = height * 0.10;      // 距離頂部 10%
   const bottomAreaStartY = height * 0.50;   // 距離頂部 50%
   ```

## 實際調整示例

### 示例 1: 讓卡片更大（適合大屏幕）

**需求**: 在大屏幕上顯示更大的卡片

**調整**:
```javascript
// 修改 createTopBottomTwoRows 函數中的卡片尺寸計算
// 大容器情況
cardWidth = Math.max(100, Math.min(180, width * (0.92 / columns)));  // 增加寬度
cardHeight = Math.max(50, Math.min(85, height * 0.20));              // 增加高度
```

**結果**:
- 卡片寬度從 160px 增加到 180px
- 卡片高度從 75px 增加到 85px
- 文字更清晰，更容易點擊

### 示例 2: 讓卡片更小（適合小屏幕）

**需求**: 在小屏幕上顯示更多內容

**調整**:
```javascript
// 修改小容器情況
cardWidth = Math.max(70, Math.min(100, width * (0.80 / columns)));   // 減少寬度
cardHeight = Math.max(30, Math.min(45, height * 0.12));              // 減少高度
```

**結果**:
- 卡片寬度從 120px 減少到 100px
- 卡片高度從 55px 減少到 45px
- 更多卡片可見，但文字可能更小

### 示例 3: 調整行間距

**需求**: 增加上下兩行卡片之間的距離

**調整**:
```javascript
// 修改區域位置
const topAreaStartY = height * 0.10;      // 從 0.12 改為 0.10
const bottomAreaStartY = height * 0.52;   // 從 0.55 改為 0.52
```

**結果**:
- 上方卡片區域向上移動
- 下方卡片區域向上移動
- 兩個區域之間的距離增加

## 批數 7 vs 批數 10 的關鍵差異

| 方面 | 批數 7 | 批數 10 |
|------|--------|---------|
| **布局複雜度** | 低 | 中 |
| **卡片大小** | 大 | 小 |
| **行數** | 1 | 2 |
| **調整難度** | 簡單 | 中等 |
| **文字可讀性** | 高 | 中 |
| **屏幕利用率** | 中 | 高 |
| **適用場景** | 詞彙量少 | 詞彙量多 |

## 調試技巧

### 1. 查看控制台日誌

```
📐 創建上下分離佈局 - 2行（6-10個匹配數）
📐 容器尺寸: 1841 × 674
📊 匹配數: 10, 使用 2 行 × 5 列佈局
📐 卡片尺寸: 120 × 55
📍 區域位置: {topAreaStartX: 500, topAreaStartY: 80, ...}
```

### 2. 檢查實際尺寸

```javascript
// 在瀏覽器控制台執行
const gameScene = window.matchUpGame.scene.scenes[1];
console.log('卡片寬度:', gameScene.cardWidth);
console.log('卡片高度:', gameScene.cardHeight);
console.log('行數:', gameScene.rows);
console.log('列數:', gameScene.columns);
```

## 常見問題

### Q1: 批數 10 的卡片太小，文字看不清

**解決方案**:
1. 增加卡片高度係數 (如 0.20 改為 0.25)
2. 增加卡片寬度係數 (如 0.88 改為 0.92)
3. 增加文字大小比例

### Q2: 批數 10 的卡片太大，超出屏幕

**解決方案**:
1. 減少卡片高度係數 (如 0.15 改為 0.12)
2. 減少卡片寬度係數 (如 0.85 改為 0.80)
3. 減少文字大小

### Q3: 上下兩行卡片重疊

**解決方案**:
1. 增加 `bottomAreaStartY` 值 (如 0.55 改為 0.60)
2. 減少卡片高度
3. 檢查 `topVerticalSpacing` 和 `bottomVerticalSpacing`

## 相關文件

- `public/games/match-up-game/scenes/game.js` - 主要布局邏輯 (L2455-2550)
- `.augment/guides/BATCH-SIZE-7-LAYOUT-GUIDE.md` - 批數 7 布局指南
- `public/games/match-up-game/config.js` - Phaser 配置

