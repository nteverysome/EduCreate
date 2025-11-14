# 版本 v60.0 - 文字位置調整（在空白框下方）

## 🎯 修改摘要

根據您的要求，已完成文字位置調整：

**當上下分離時，文字應該在空白框的下方，而不是右邊。**

---

## 📝 修改詳情

### 修改位置
**文件**: `public/games/match-up-game/scenes/game.js`  
**函數**: `createOutsideAnswerCard()`  
**行號**: L9291-9342

---

## ❌ 修改前（v33.0）

### 佈局方式：水平排列（圖片 + 文字在右邊）

```
┌─────────────┐
│   空白框    │  [圖片] 文字
└─────────────┘
```

### 代碼

```javascript
// 圖片位置：容器右邊界 + 間距（圖片中心）
const imageX = boxRightEdge + imagePadding + imageSize / 2;
const imageY = boxY;

// 文字位置：圖片右邊 + 間距
const textX = imageX + imageSize / 2 + textPadding;
const textY = boxY;
```

---

## ✅ 修改後（v60.0）

### 佈局方式：垂直排列（圖片 + 文字在下方）

```
┌─────────────┐
│   空白框    │
└─────────────┘
    [圖片]
    文字
```

### 代碼

```javascript
// 圖片位置：容器下邊界 + 間距（圖片中心）
const imageX = boxX;  // 水平居中於框
const imageY = boxBottomEdge + imagePadding + imageSize / 2;

// 文字位置：圖片下方 + 間距
const textX = boxX;  // 水平居中於框
const textY = imageY + imageSize / 2 + textPadding;
```

---

## 📊 修改對比

| 項目 | 修改前 | 修改後 |
|------|--------|--------|
| 文字位置 | 圖片右邊（水平） | 圖片下方（垂直） |
| 文字對齐 | 左對齐 | 水平居中 |
| 文字方向 | 水平排列 | 垂直排列 |
| 容器位置 | 圖片中心 | 圖片中心 |
| 字體大小 | 20-32px | 16-28px |

---

## 🎨 視覺效果

### 修改前（v33.0）

```
上方容器
┌─────────────┐
│  英文卡片   │
└─────────────┘

下方容器
┌─────────────┐
│   空白框    │  [圖片] 中文文字
└─────────────┘
```

### 修改後（v60.0）

```
上方容器
┌─────────────┐
│  英文卡片   │
└─────────────┘

下方容器
┌─────────────┐
│   空白框    │
└─────────────┘
    [圖片]
    中文文字
```

---

## 🔧 技術細節

### 位置計算

#### 修改前（水平排列）
```
boxRightEdge = boxX + boxWidth / 2
imageX = boxRightEdge + imagePadding + imageSize / 2
textX = imageX + imageSize / 2 + textPadding
```

#### 修改後（垂直排列）
```
boxBottomEdge = boxY + boxHeight / 2
imageX = boxX  // 水平居中
imageY = boxBottomEdge + imagePadding + imageSize / 2
textX = boxX  // 水平居中
textY = imageY + imageSize / 2 + textPadding
```

### 文字對齐

#### 修改前
```javascript
textObj.setOrigin(0, 0.5);  // 左對齐，垂直居中
```

#### 修改後
```javascript
textObj.setOrigin(0.5, 0);  // 水平居中，頂部對齐
```

---

## 📐 間距調整

| 項目 | 修改前 | 修改後 | 變化 |
|------|--------|--------|------|
| imagePadding | 20px | 10px | ↓ 減少 50% |
| textPadding | 15px | 8px | ↓ 減少 47% |
| 字體大小 | 20-32px | 16-28px | ↓ 減少 20% |

---

## ✅ 驗證修改

### 步驟 1：重新加載遊戲
```
http://localhost:3000/games/match-up-game/
```

### 步驟 2：查看下方答案卡片
- ✅ 圖片應該在空白框下方
- ✅ 文字應該在圖片下方
- ✅ 文字應該水平居中
- ✅ 整體佈局應該是垂直排列

### 步驟 3：打開控制台（F12）
查看日誌：
```
✅ [v60.0] 框外答案卡片已創建（文字在下方）
```

---

## 📋 修改清單

- [x] 修改 `createOutsideAnswerCard()` 函數
- [x] 調整圖片位置（從右邊改為下方）
- [x] 調整文字位置（從圖片右邊改為圖片下方）
- [x] 調整文字對齐（從左對齐改為水平居中）
- [x] 調整間距參數
- [x] 更新控制台日誌
- [ ] 重新加載遊戲頁面
- [ ] 驗證視覺效果

---

## 🔍 相關文檔

1. **VERSION-59-PARAMETER-ADJUSTMENT.md** - 參數調整
2. **BUG-FIX-v58-VERTICAL-SPACING.md** - Bug 修復
3. **QUICK-SUMMARY-v59.md** - 快速總結

---

## 📝 版本歷史

| 版本 | 修改 | 狀態 |
|------|------|------|
| v57.0 | 增加 bottomButtonArea 到 80px | ✅ 完成 |
| v58.0 | 修復上下容器間距計算 bug | ✅ 完成 |
| v59.0 | 參數調整（移除垂直間距，減少邊距） | ✅ 完成 |
| v60.0 | 文字位置調整（在空白框下方） | ✅ 完成 |

---

**最後更新**: 2025-01-14  
**版本**: v60.0  
**狀態**: ✅ 已完成

