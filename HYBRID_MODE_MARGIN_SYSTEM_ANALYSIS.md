# 混合模式邊距系統深度分析

## 📊 整體結構

混合模式通過**三層邊距系統**來管理頂部和底部空間：

```
遊戲容器（height）
├─ 頂部按鈕區域（topButtonAreaHeight）
├─ 頂部偏移（topOffset）← 關鍵！
├─ 第 1 行單元
│  ├─ 英文卡片（cardHeightInFrame）
│  ├─ 垂直間距（verticalSpacing）
│  └─ 中文文字區域（chineseTextHeight）
├─ 第 2 行單元（totalUnitHeight）
├─ 底部偏移（自動計算）← 對稱！
└─ 底部按鈕區域（bottomButtonAreaHeight）
```

---

## 🔑 核心公式

### 1️⃣ 頂部空間計算（topOffset）

**代碼位置**：`game.js` 第 3350 行

```javascript
const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);
```

**邏輯**：
- **緊湊模式**（手機）：固定 30px
- **桌面模式**：垂直居中 = (總高度 - 內容高度) / 2

### 2️⃣ 內容總高度計算（totalContentHeight）

**代碼位置**：`game.js` 第 3349 行

```javascript
const totalContentHeight = rows * totalUnitHeight;
```

**說明**：
- `rows`：行數 = ceil(itemCount / cols)
- `totalUnitHeight`：單元總高度（包含所有邊距）

### 3️⃣ 單元總高度計算（totalUnitHeight）

**正方形模式**（第 3164 行）：
```javascript
chineseTextHeight = squareSize * 0.6;
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

**長方形模式**（第 3273 行）：
```javascript
chineseTextHeight = 30;  // 固定 30px
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

### 4️⃣ 底部空間計算

**自動計算**：
```javascript
bottomOffset = (height - totalContentHeight) / 2;
```

---

## 📐 邊距配置詳解

### 頂部邊距（Top Margin）

| 模式 | 值 | 計算方式 | 說明 |
|------|-----|---------|------|
| 緊湊模式 | 30px | 固定值 | 手機直向/橫向 |
| 桌面模式 | 動態 | (height - totalContentHeight) / 2 | 垂直居中 |

### 單元內部邊距（Unit Internal Margins）

| 組件 | 正方形模式 | 長方形模式 | 說明 |
|------|-----------|-----------|------|
| 英文卡片 | squareSize | cardHeightInFrame | 卡片高度 |
| 垂直間距 | 動態計算 | 動態計算 | 卡片和文字之間 |
| 中文文字 | squareSize × 0.6 | 30px（固定） | 文字區域高度 |

### 底部邊距（Bottom Margin）

| 模式 | 值 | 計算方式 | 說明 |
|------|-----|---------|------|
| 所有模式 | 動態 | (height - totalContentHeight) / 2 | 與頂部對稱 |

---

## 🎯 卡片位置計算

**代碼位置**：`game.js` 第 3463 行

```javascript
const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;
```

**分解**：
- `topOffset`：頂部偏移（第一行的起始位置）
- `row * totalUnitHeight`：當前行的累積高度
- `totalUnitHeight / 2`：單元中心偏移

---

## 💡 邊距系統的優勢

✅ 自動垂直居中 - 內容自動在屏幕中央
✅ 對稱邊距 - 頂部和底部邊距相等
✅ 響應式設計 - 根據屏幕大小自動調整
✅ 緊湊模式支持 - 手機設備有固定邊距
✅ 靈活配置 - 可輕鬆調整各個邊距值

---

## 🔧 如何調整邊距

### 調整頂部邊距

```javascript
// 修改第 3350 行
const topOffset = isCompactMode ? 50 : Math.max(20, (height - totalContentHeight) / 2);
```

### 調整中文文字高度

```javascript
// 正方形模式（第 3163 行）
chineseTextHeight = squareSize * 0.7;  // 改為 70%

// 長方形模式（第 3271 行）
chineseTextHeight = 40;  // 改為 40px
```

### 調整垂直間距

```javascript
// 第 3164 行（正方形模式）
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing * 2;
```

---

## 📊 實際數值示例

**場景**：1920×963 屏幕，3 行 4 列佈局

```
總高度：963px
按鈕區域：60px（頂部）+ 60px（底部）= 120px
可用高度：963 - 120 = 843px

內容計算：
- 卡片高度：100px
- 中文文字：60px
- 垂直間距：20px
- totalUnitHeight = 100 + 60 + 20 = 180px

- 行數：3
- totalContentHeight = 3 × 180 = 540px

邊距計算：
- topOffset = (843 - 540) / 2 = 151.5px
- bottomOffset = 151.5px（對稱）

驗證：
- 頂部：60 + 151.5 = 211.5px
- 內容：540px
- 底部：151.5 + 60 = 211.5px
- 總計：211.5 + 540 + 211.5 = 963px ✅
```

