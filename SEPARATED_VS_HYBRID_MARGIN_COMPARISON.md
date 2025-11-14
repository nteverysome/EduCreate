# 分離模式 vs 混合模式 - 邊距系統對比

## 📊 邊距系統對比

### 分離模式（Separated Layout）

**配置文件**：`separated-margin-config.js`

```javascript
CONTAINER: {
    TOP_RATIO: 0.083,       // 8.3% 頂部邊距（計時器下方 30px）
    BOTTOM_RATIO: 0.10,     // 10% 底部邊距
    SIDE_PIXEL: 150         // 150px 左右邊距（三等分佈局）
}
```

**特點**：
- ✅ 使用**比例系統**（TOP_RATIO）
- ✅ 固定的側邊距（SIDE_PIXEL）
- ✅ 簡單直接的配置
- ✅ 適合**左右對稱**的佈局

**計算方式**：
```javascript
leftStartY = height * TOP_RATIO = height * 0.083
rightStartY = height * TOP_RATIO = height * 0.083
```

**示例**（963px 高度）：
```
頂部邊距 = 963 × 0.083 = 80px
底部邊距 = 963 × 0.10 = 96px
```

---

### 混合模式（Hybrid Layout）

**配置方式**：動態計算（無配置文件）

```javascript
// 第 3350 行
const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);

// 第 3349 行
const totalContentHeight = rows * totalUnitHeight;

// 第 3164 行（正方形）或 3273 行（長方形）
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

**特點**：
- ✅ 使用**內容感知**系統
- ✅ 自動垂直居中
- ✅ 複雜的多層計算
- ✅ 適合**單面板**佈局

**計算方式**：
```javascript
topOffset = (height - totalContentHeight) / 2
bottomOffset = (height - totalContentHeight) / 2  // 自動對稱
```

**示例**（963px 高度，3 行，每行 180px）：
```
totalContentHeight = 3 × 180 = 540px
topOffset = (963 - 540) / 2 = 211.5px
bottomOffset = 211.5px（自動對稱）
```

---

## 🎯 邊距計算流程對比

### 分離模式流程

```
1. 讀取配置
   ├─ TOP_RATIO = 0.083
   ├─ BOTTOM_RATIO = 0.10
   └─ SIDE_PIXEL = 150

2. 計算位置
   ├─ leftStartY = height × 0.083
   ├─ rightStartY = height × 0.083
   └─ leftX = width × 0.1667（33% 中心）

3. 創建卡片
   └─ 按照計算的位置排列
```

### 混合模式流程

```
1. 檢測設備模式
   ├─ isCompactMode（手機）
   └─ 桌面模式

2. 計算卡片尺寸
   ├─ cardHeightInFrame
   ├─ chineseTextHeight
   └─ verticalSpacing

3. 計算單元高度
   └─ totalUnitHeight = 卡片 + 文字 + 間距

4. 計算內容高度
   └─ totalContentHeight = 行數 × 單元高度

5. 計算頂部偏移
   ├─ 緊湊模式：固定 30px
   └─ 桌面模式：(height - totalContentHeight) / 2

6. 計算卡片位置
   └─ frameY = topOffset + row × totalUnitHeight + totalUnitHeight / 2
```

---

## 📐 邊距值對比

### 頂部邊距

| 模式 | 計算方式 | 值（963px） | 特點 |
|------|---------|-----------|------|
| 分離 | height × 0.083 | 80px | 固定比例 |
| 混合（緊湊） | 固定值 | 30px | 手機優化 |
| 混合（桌面） | (height - content) / 2 | 動態 | 內容感知 |

### 底部邊距

| 模式 | 計算方式 | 值（963px） | 特點 |
|------|---------|-----------|------|
| 分離 | height × 0.10 | 96px | 固定比例 |
| 混合 | (height - content) / 2 | 動態 | 自動對稱 |

### 側邊距

| 模式 | 計算方式 | 值 | 特點 |
|------|---------|-----|------|
| 分離 | 固定像素 | 150px | 三等分佈局 |
| 混合 | 動態計算 | 變化 | 根據列數調整 |

---

## 💡 何時使用哪種邊距系統

### 使用分離模式邊距系統

✅ 需要**左右對稱**的佈局
✅ 邊距值**相對固定**
✅ 需要**簡單配置**
✅ 計時器或其他固定元素在頂部
✅ 需要**精確控制**邊距

### 使用混合模式邊距系統

✅ 需要**自動垂直居中**
✅ 內容數量**變化較大**
✅ 需要**響應式設計**
✅ 需要**自動對稱**邊距
✅ 支持**多種設備**（手機/平板/桌面）

---

## 🔄 邊距系統的互補性

```
分離模式（Separated）
├─ 優勢：簡單、可預測、易於調試
├─ 劣勢：不夠靈活、邊距固定
└─ 適用：固定佈局、左右對稱

混合模式（Hybrid）
├─ 優勢：靈活、自動居中、響應式
├─ 劣勢：計算複雜、難以調試
└─ 適用：動態佈局、單面板
```

---

## 🎨 邊距系統調整指南

### 分離模式調整

**文件**：`separated-margin-config.js`

```javascript
// 增加頂部邊距
TOP_RATIO: 0.12  // 從 0.083 改為 0.12

// 增加側邊距
SIDE_PIXEL: 200  // 從 150 改為 200
```

### 混合模式調整

**文件**：`game.js`

```javascript
// 增加頂部邊距（緊湊模式）
const topOffset = isCompactMode ? 50 : Math.max(10, (height - totalContentHeight) / 2);
//                                  ↑ 改為 50

// 增加中文文字高度
chineseTextHeight = squareSize * 0.8;  // 從 0.6 改為 0.8
```

---

## 📊 實際應用場景

### 場景 1：固定計時器 + 左右卡片

**推薦**：分離模式
- 計時器在頂部（固定）
- 左右卡片對稱排列
- 邊距相對固定

### 場景 2：動態卡片數量 + 自動居中

**推薦**：混合模式
- 卡片數量變化（3-20 個）
- 需要自動垂直居中
- 支持多種設備

### 場景 3：混合需求

**方案**：結合兩種系統
- 使用分離模式的配置思想
- 應用混合模式的計算邏輯
- 創建統一的邊距管理系統

