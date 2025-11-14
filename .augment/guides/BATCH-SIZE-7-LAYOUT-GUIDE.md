# 批數 7 布局調整指南

## 概述

本文檔說明如何調整 Match-Up 遊戲中批數為 7 的卡片布局。批數 7 表示每頁顯示 7 對詞彙（7 張英文卡片 + 7 個空白框 + 7 張答案卡片）。

### 重要：不同批數的布局方式

Match-Up 遊戲根據批數使用**不同的布局策略**：

| 批數 | 布局方式 | 結構 | 圖片+文字位置 |
|------|---------|------|-------------|
| **3-5** | 左右分離 | 左側卡片 + 右側空白框 | 在空白框右側水平呈現 |
| **6** | 左右分離多行 | 多行多列 | 在空白框右側水平呈現 |
| **7** | 上下分離 | 上方卡片 + 下方空白框 | 在下方垂直堆疊 |
| **8-20** | 左右分離多行 | 多行多列 | 在空白框右側水平呈現 |
| **21+** | 上下分離多行 | 多行多列 | 在下方垂直堆疊 |

**本文檔重點**: 批數 7 的上下分離單行布局

## 布局方式對比

### 批數 3-5（左右分離 - 單列）

```
┌──────────────────────────────────────────┐
│         計時器區域                        │
├──────────────────────────────────────────┤
│  [卡片1]  │  [空白框1]  [答案1]          │
│           │  [圖片+文字]                 │
├──────────────────────────────────────────┤
│  [卡片2]  │  [空白框2]  [答案2]          │
│           │  [圖片+文字]                 │
├──────────────────────────────────────────┤
│  [卡片3]  │  [空白框3]  [答案3]          │
│           │  [圖片+文字]                 │
├──────────────────────────────────────────┤
│         提交按鈕                         │
└──────────────────────────────────────────┘
```

**特點**:
- 左側：英文卡片（垂直排列）
- 右側：空白框 + 答案卡片（水平排列）
- 圖片+文字在空白框的右側，**水平呈現**
- 適合少量詞彙（3-5 個）

### 批數 7（上下分離 - 單行）

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
│  [圖片+文字垂直堆疊]                                      │
├─────────────────────────────────────────────────────────┤
│                  提交按鈕區域 (80px)                      │
└─────────────────────────────────────────────────────────┘
```

**特點**:
- 上方：英文卡片（水平排列，7 列）
- 中間：空白框（水平排列，7 列）
- 下方：答案卡片（水平排列，7 列）
- 圖片+文字在下方，**垂直堆疊**
- 適合較多詞彙（7 個）

## 核心概念

### 布局結構（批數 7）
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

## 關鍵參數

### 1. 垂直空間分配

**文件**: `public/games/match-up-game/scenes/game.js` (L2528-2535)

```javascript
const timerHeight = 50;                    // 計時器高度
const timerGap = 20;                       // 計時器下方間距
const additionalTopMargin = 50;            // 上方邊距
const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 120px
const bottomButtonArea = 80;               // 提交按鈕區域
const answerCardsHeight = 140;             // 答案卡片區域高度
```

**計算公式**:
```
可用高度 = 遊戲高度 - topButtonArea - bottomButtonArea - answerCardsHeight
可用高度 = 963 - 120 - 80 - 140 = 623px

上方卡片高度 = 可用高度 / 2 = 311.5px ≈ 311px
下方框高度 = 可用高度 / 2 = 311.5px ≈ 311px
```

### 2. 水平空間分配

**文件**: `public/games/match-up-game/scenes/game.js` (L2537-2550)

```javascript
const horizontalMargin = 0;                // 左右邊距（0px 完全填滿）
const availableWidth = width - horizontalMargin * 2;  // 容器寬度

const fixedHorizontalSpacing = 18;         // 卡片間距（18px）
const totalSpacingWidth = (itemCount - 1) * fixedHorizontalSpacing;  // 6 × 18 = 108px
const baseCardWidth = (availableWidth - totalSpacingWidth) / itemCount;
```

**計算公式**:
```
可用寬度 = 1841px
項目數 = 7
固定間距 = 18px

總間距寬度 = (7 - 1) × 18 = 108px
卡片寬度 = (1841 - 108) / 7 = 248px

驗證：7 × 248 + 6 × 18 = 1736 + 108 = 1844px ✅
```

## 布局選擇邏輯

**文件**: `public/games/match-up-game/scenes/game.js` (L1891-1905)

```javascript
if (itemCount <= 5) {
    // 批數 3-5：左右分離單列
    this.createLeftRightSingleColumn(currentPagePairs, width, height);
} else if (itemCount === 7) {
    // 批數 7：上下分離單行
    this.createTopBottomSingleRow(currentPagePairs, width, height);
} else if (itemCount <= 20) {
    // 批數 6, 8-20：左右分離多行
    this.createLeftRightMultiRows(currentPagePairs, width, height);
} else {
    // 批數 21+：上下分離多行
    this.createTopBottomMultiRows(currentPagePairs, width, height);
}
```

### 如何改變布局方式

如果您想改變某個批數的布局方式，可以修改上述邏輯。例如：

**示例**：讓批數 7 使用左右分離多行布局

```javascript
// 修改前
} else if (itemCount === 7) {
    this.createTopBottomSingleRow(currentPagePairs, width, height);

// 修改後
} else if (itemCount === 7) {
    this.createLeftRightMultiRows(currentPagePairs, width, height);
```

## 調整方法

### 方法 1: 調整卡片高度

**目標**: 讓卡片更大或更小

**步驟**:
1. 修改 `answerCardsHeight` 值
   - 減小值 → 卡片更大
   - 增大值 → 卡片更小

2. 例如，改為 `answerCardsHeight = 120`:
   ```
   可用高度 = 963 - 120 - 80 - 120 = 643px
   卡片高度 = 643 / 2 = 321.5px ≈ 321px
   ```

### 方法 2: 調整卡片寬度

**目標**: 讓卡片更寬或更窄

**步驟**:
1. 修改 `fixedHorizontalSpacing` 值
   - 減小值 → 卡片更寬
   - 增大值 → 卡片更窄

2. 例如，改為 `fixedHorizontalSpacing = 10`:
   ```
   總間距寬度 = (7 - 1) × 10 = 60px
   卡片寬度 = (1841 - 60) / 7 = 254px
   ```

### 方法 3: 調整文字大小

**文件**: `public/games/match-up-game/scenes/game.js` (L2570-2575)

```javascript
const fontSize = Math.max(14, Math.min(26, boxHeight * 0.35));
const wordWrap: { width: boxWidth * 1.0 }
```

**調整**:
- 改變 `0.35` 比例 → 控制文字大小
  - 增大比例 (如 0.4) → 文字更大
  - 減小比例 (如 0.3) → 文字更小

- 改變 `fontSize` 範圍 (14-26)
  - 增大最大值 (如 30) → 文字可以更大
  - 減小最小值 (如 12) → 文字可以更小

### 方法 4: 調整答案卡片區域

**文件**: `public/games/match-up-game/scenes/game.js` (L2534)

```javascript
const answerCardsHeight = 140;  // 修改這個值
```

**影響**:
- 減小值 → 上下卡片區域更大
- 增大值 → 上下卡片區域更小

## 實際調整示例

### 示例 1: 讓卡片更大

**需求**: 卡片太小，需要更大的卡片

**調整**:
```javascript
// 修改前
const answerCardsHeight = 140;
const fixedHorizontalSpacing = 18;

// 修改後
const answerCardsHeight = 100;      // 減少答案卡片區域
const fixedHorizontalSpacing = 12;  // 減少卡片間距
```

**結果**:
```
可用高度 = 963 - 120 - 80 - 100 = 663px
卡片高度 = 663 / 2 = 331.5px ≈ 331px (增加 20px)

卡片寬度 = (1841 - 72) / 7 = 252px (增加 4px)
```

### 示例 2: 讓文字更大

**需求**: 文字太小，難以閱讀

**調整**:
```javascript
// 修改前
const fontSize = Math.max(14, Math.min(26, boxHeight * 0.35));

// 修改後
const fontSize = Math.max(14, Math.min(32, boxHeight * 0.40));
```

**結果**:
- 文字最大值從 26px 增加到 32px
- 文字比例從 0.35 增加到 0.40
- 文字會自動變大

## 響應式設計考慮

### 不同屏幕尺寸

| 屏幕寬度 | 卡片寬度 | 卡片高度 | 適用場景 |
|---------|---------|---------|---------|
| 1920px | 248px | 311px | 桌面 (全螢幕) |
| 1841px | 248px | 311px | iframe 容器 |
| 1366px | 176px | 233px | 平板 |
| 768px | 99px | 131px | 手機 |

### 調整建議

- **桌面端**: 優先考慮卡片大小和文字可讀性
- **平板端**: 平衡卡片大小和屏幕利用率
- **手機端**: 優先考慮可點擊區域大小（最小 44×44px）

## 調試技巧

### 1. 查看控制台日誌

打開瀏覽器開發者工具，查看以下日誌：

```
📊 [v65.0] Wordwall 風格單行布局計算 - 卡片平均分佈到容器內: 
{itemCount: 7, cardWidth: 248, cardHeight: 311, ...}
```

### 2. 檢查實際尺寸

在瀏覽器控制台執行：

```javascript
// 獲取遊戲寬度和高度
console.log('遊戲寬度:', window.matchUpGame.scale.width);
console.log('遊戲高度:', window.matchUpGame.scale.height);

// 獲取卡片尺寸
const gameScene = window.matchUpGame.scene.scenes[1];
console.log('卡片寬度:', gameScene.cardWidth);
console.log('卡片高度:', gameScene.cardHeight);
```

### 3. 實時修改測試

在控制台修改參數後刷新頁面：

```javascript
// 修改 answerCardsHeight
window.matchUpGame.scene.scenes[1].answerCardsHeight = 120;
window.matchUpGame.scene.scenes[1].updateLayout();
```

## 常見問題

### Q1: 卡片太小，文字看不清

**解決方案**:
1. 減小 `answerCardsHeight` (如改為 100)
2. 增加 `fontSize` 比例 (如改為 0.4)
3. 減小 `fixedHorizontalSpacing` (如改為 12)

### Q2: 卡片太大，超出屏幕

**解決方案**:
1. 增大 `answerCardsHeight` (如改為 160)
2. 減小 `fontSize` 比例 (如改為 0.3)
3. 增大 `fixedHorizontalSpacing` (如改為 20)

### Q3: 卡片不居中

**解決方案**:
- 檢查 `horizontalMargin` 是否為 0
- 確認 `availableWidth` 計算正確
- 驗證 Phaser 容器的 `centerX` 設置

## 版本歷史

| 版本 | 日期 | 主要改動 |
|------|------|---------|
| v64.0 | 2024-11-14 | 增加卡片高度，增加文字大小 |
| v65.0 | 2024-11-14 | 實現卡片平均分佈 |
| v66.0 | 2024-11-14 | 減少邊距，充分利用容器 |
| v67.0 | 2024-11-14 | 7 組容器完全填滿容器 |
| v68.0 | 2024-11-14 | 精確填滿容器寬度 |
| v69.0 | 2024-11-14 | 修復 iframe 寬度限制 |

## 相關文件

- `public/games/match-up-game/scenes/game.js` - 主要布局邏輯
- `public/games/match-up-game/config.js` - Phaser 配置
- `components/games/GameSwitcher.tsx` - iframe 容器配置
- `.augment/guides/VERTICAL-SPACING-DETAILED-EXPLANATION.md` - 垂直空間詳細說明

