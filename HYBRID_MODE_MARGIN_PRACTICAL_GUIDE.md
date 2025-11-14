# 混合模式邊距系統 - 實踐指南

## 🎯 快速理解

混合模式的邊距系統分為**三個層級**：

```
第 1 層：屏幕級別邊距
├─ topButtonAreaHeight（頂部按鈕區域）
├─ bottomButtonAreaHeight（底部按鈕區域）
└─ sideMargin（側邊距）

第 2 層：內容級別邊距
├─ topOffset（頂部偏移）← 關鍵！
└─ bottomOffset（底部偏移，自動計算）

第 3 層：單元級別邊距
├─ cardHeightInFrame（卡片高度）
├─ chineseTextHeight（文字高度）
└─ verticalSpacing（卡片和文字之間的間距）
```

---

## 📍 關鍵代碼位置

### 1. 頂部邊距計算

**文件**：`public/games/match-up-game/scenes/game.js`
**行號**：3350

```javascript
const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);
```

**含義**：
- 如果是手機（緊湊模式）：頂部邊距 = 30px
- 如果是桌面：頂部邊距 = (屏幕高度 - 內容高度) / 2

### 2. 內容高度計算

**文件**：`public/games/match-up-game/scenes/game.js`
**行號**：3349

```javascript
const totalContentHeight = rows * totalUnitHeight;
```

**含義**：
- 內容總高度 = 行數 × 每行高度

### 3. 單元高度計算

**文件**：`public/games/match-up-game/scenes/game.js`
**行號**：3164（正方形）或 3273（長方形）

```javascript
// 正方形模式
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;

// 長方形模式
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

### 4. 卡片位置計算

**文件**：`public/games/match-up-game/scenes/game.js`
**行號**：3463

```javascript
const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;
```

---

## 🔧 調整邊距的三種方法

### 方法 1：調整頂部邊距（topOffset）

**目的**：增加或減少頂部空間

**步驟**：
1. 打開 `game.js`
2. 找到第 3350 行
3. 修改公式

**示例**：增加頂部邊距

```javascript
// 原始
const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);

// 修改後（增加 20px）
const topOffset = isCompactMode ? 50 : Math.max(30, (height - totalContentHeight) / 2);
//                                  ↑ 30→50      ↑ 10→30
```

**效果**：
- 緊湊模式：30px → 50px
- 桌面模式：最小 10px → 最小 30px

### 方法 2：調整中文文字高度（chineseTextHeight）

**目的**：增加或減少單元內部的文字區域

**步驟**：
1. 打開 `game.js`
2. 找到第 3163 行（正方形）或 3271 行（長方形）
3. 修改公式

**示例**：增加中文文字高度

```javascript
// 正方形模式（第 3163 行）
// 原始
chineseTextHeight = squareSize * 0.6;

// 修改後（增加到 70%）
chineseTextHeight = squareSize * 0.7;

// 長方形模式（第 3271 行）
// 原始
chineseTextHeight = 30;

// 修改後（增加到 40px）
chineseTextHeight = 40;
```

**效果**：
- 正方形模式：卡片下方文字區域變大
- 長方形模式：文字區域固定增加

### 方法 3：調整垂直間距（verticalSpacing）

**目的**：增加或減少卡片和文字之間的間距

**步驟**：
1. 打開 `game.js`
2. 找到 verticalSpacing 的計算位置
3. 修改公式

**示例**：增加垂直間距

```javascript
// 原始（第 2690 行）
dynamicVerticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));

// 修改後（增加範圍）
dynamicVerticalSpacing = Math.max(15, Math.min(50, availableHeight * 0.04));
//                              ↑ 10→15    ↑ 40→50    ↑ 0.03→0.04
```

**效果**：
- 最小間距：10px → 15px
- 最大間距：40px → 50px
- 計算比例：3% → 4%

---

## 📊 邊距調整影響分析

### 調整 topOffset 的影響

| 調整 | 效果 | 適用場景 |
|------|------|---------|
| 增加 | 內容下移，頂部空間增加 | 頂部有其他元素 |
| 減少 | 內容上移，頂部空間減少 | 需要更多垂直空間 |

### 調整 chineseTextHeight 的影響

| 調整 | 效果 | 適用場景 |
|------|------|---------|
| 增加 | 文字區域變大，卡片間距增加 | 文字內容較多 |
| 減少 | 文字區域變小，卡片間距減少 | 文字內容較少 |

### 調整 verticalSpacing 的影響

| 調整 | 效果 | 適用場景 |
|------|------|---------|
| 增加 | 卡片間距變大，行數減少 | 需要更清晰的分隔 |
| 減少 | 卡片間距變小，行數增加 | 需要顯示更多卡片 |

---

## 🧪 測試邊距調整

### 測試步驟

1. **修改代碼**
   ```javascript
   // 在第 3350 行修改
   const topOffset = isCompactMode ? 50 : Math.max(30, (height - totalContentHeight) / 2);
   ```

2. **刷新頁面**
   - 按 F5 或 Ctrl+R

3. **檢查效果**
   - 頂部邊距是否符合預期
   - 底部邊距是否自動調整
   - 卡片是否仍在框內

4. **驗證對稱性**
   - 頂部邊距 ≈ 底部邊距
   - 左右邊距相等

### 調試技巧

**在控制台查看邊距信息**：

```javascript
// 第 3352-3360 行的日誌輸出
console.log('📐 混合佈局間距:', {
    horizontalSpacing,
    verticalSpacing,
    chineseTextHeight,
    rows,
    totalContentHeight,
    topOffset,  // ← 查看這個值
    verticalSpacingFormula: isCompactMode ? `${chineseTextHeight} * 0.2 = ${verticalSpacing.toFixed(1)}` : '0'
});
```

---

## 💡 最佳實踐

### ✅ 推薦做法

1. **保持對稱性**
   - 頂部邊距 ≈ 底部邊距
   - 左右邊距相等

2. **測試多種設備**
   - 手機（緊湊模式）
   - 平板（混合模式）
   - 桌面（桌面模式）

3. **驗證卡片位置**
   - 卡片完全在框內
   - 沒有被裁切

4. **監控性能**
   - 邊距計算不應該影響幀率
   - 使用 Chrome DevTools 檢查

### ❌ 避免做法

1. **硬編碼邊距值**
   - 應該使用公式計算
   - 便於響應式調整

2. **忽視不同設備**
   - 手機和桌面邊距應該不同
   - 使用 isCompactMode 區分

3. **過度調整**
   - 邊距變化應該漸進
   - 避免突然的大幅改變

4. **不驗證結果**
   - 每次修改後都要測試
   - 檢查控制台日誌

---

## 🎯 常見問題解決

### Q1：頂部邊距太大，卡片顯示不全

**解決方案**：
```javascript
// 減少 topOffset
const topOffset = isCompactMode ? 20 : Math.max(5, (height - totalContentHeight) / 2);
```

### Q2：卡片之間間距太小

**解決方案**：
```javascript
// 增加 verticalSpacing
dynamicVerticalSpacing = Math.max(20, Math.min(50, availableHeight * 0.05));
```

### Q3：文字區域太小，文字被裁切

**解決方案**：
```javascript
// 增加 chineseTextHeight
chineseTextHeight = squareSize * 0.8;  // 從 0.6 改為 0.8
```

### Q4：邊距在不同設備上不一致

**解決方案**：
```javascript
// 確保使用 isCompactMode 區分
const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);
```

