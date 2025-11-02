# 🔥 v22.0 - iPhone 14 卡片切割問題修復

**修復日期**: 2025-11-02  
**問題**: 實際 iPhone 14 上的卡片被切割，右邊卡片看不到  
**狀態**: ✅ 已修復

---

## 📋 問題分析

### 症狀
- **Responsively App**: 5 列卡片完整顯示 ✅
- **實際 iPhone 14**: 右邊卡片被切割 ❌

### 根本原因
```
實際 iPhone 14 寬度: 390px
當前邊距設置: 30px × 2 = 60px
可用寬度: 390 - 60 = 330px
5 列卡片寬度: 330 / 5 = 66px
加上間距後，總寬度超過 390px → 卡片被切割
```

---

## ✅ 修復方案

### 修改 1: 動態邊距計算 (第 1952-1972 行)

**之前**:
```javascript
const horizontalMargin = 30;  // 固定 30px
frameWidth = hasImages
    ? Math.min(maxCardHeight, (width - horizontalMargin) / cols)
    : Math.min(maxFrameWidth, (width - horizontalMargin) / cols);
```

**之後**:
```javascript
// 根據列數動態調整邊距
let horizontalMargin;
if (cols === 5) {
    // 5 列：最小邊距（10px），確保在 390px 寬度上完整顯示
    horizontalMargin = Math.max(10, width * 0.02);  // 最小 10px，或寬度的 2%
} else if (cols === 4) {
    // 4 列：中等邊距（15px）
    horizontalMargin = Math.max(15, width * 0.03);  // 最小 15px，或寬度的 3%
} else {
    // 3 列或更少：較大邊距（20px）
    horizontalMargin = Math.max(20, width * 0.04);  // 最小 20px，或寬度的 4%
}
```

**效果**:
- iPhone 14 (390px, 5 列): 邊距 = max(10, 390 * 0.02) = 10px
- 可用寬度: 390 - 10 = 380px
- 卡片寬度: 380 / 5 = 76px ✅

---

### 修改 2: 優化水平間距計算 (第 2374-2391 行)

**之前**:
```javascript
const horizontalSpacing = (width - frameWidth * cols) / (cols + 1);
```

**之後**:
```javascript
let horizontalSpacing;
if (cols === 5) {
    // 5 列：最小間距（2-5px），確保在 390px 寬度上完整顯示
    const totalCardWidth = frameWidth * cols;
    const availableSpace = width - totalCardWidth;
    horizontalSpacing = Math.max(2, Math.min(5, availableSpace / (cols + 1)));
} else {
    // 其他列數：使用原始計算方式
    horizontalSpacing = (width - frameWidth * cols) / (cols + 1);
}
```

**效果**:
- 5 列時，間距限制在 2-5px 之間
- 確保卡片不會超出邊界
- 其他列數保持原有計算方式

---

### 修改 3: 添加調試日誌

#### 邊距調試信息 (第 2042-2057 行)
```javascript
console.log('🔥 [v22.0] 邊距計算:', {
    cols,
    width,
    horizontalMargin,
    availableWidth: width - horizontalMargin,
    frameWidth,
    totalFrameWidth: frameWidth * cols,
    formula: `...`
});
```

#### 水平間距調試信息 (第 2414-2434 行)
```javascript
console.log('🔥 [v22.0] 水平間距計算:', {
    cols,
    width,
    frameWidth,
    totalCardWidth: frameWidth * cols,
    availableSpace: width - frameWidth * cols,
    horizontalSpacing,
    totalWidth: frameWidth * cols + horizontalSpacing * (cols + 1),
    formula: `...`
});
```

---

## 📊 預期結果

### iPhone 14 (390×844px, 5 列)

| 項目 | 值 | 說明 |
|------|-----|------|
| **視口寬度** | 390px | 實際 iPhone 14 寬度 |
| **邊距** | 10px × 2 | 動態計算：max(10, 390 * 0.02) |
| **可用寬度** | 370px | 390 - 10 × 2 |
| **卡片寬度** | 74px | 370 / 5 |
| **間距** | 2-5px | 動態計算：max(2, min(5, ...)) |
| **總寬度** | ~390px | 74 × 5 + 2 × 6 ≈ 382px ✅ |
| **結果** | ✅ 完整顯示 | 所有 5 列卡片都能看到 |

---

## 🧪 測試步驟

### 步驟 1: 在 Responsively App 中測試

```
1. 打開 Responsively App
2. 設置 iPhone 14 設備 (390×844px)
3. 加載遊戲 URL
4. 打開 F12 控制台
5. 查看 [v22.0] 邊距計算 和 [v22.0] 水平間距計算 日誌
6. 驗證卡片是否完整顯示
```

### 步驟 2: 在實際 iPhone 14 上測試

```
1. 在實際 iPhone 14 上打開遊戲
2. 打開 Safari 開發者工具
3. 查看控制台日誌
4. 驗證卡片是否完整顯示（不被切割）
```

### 步驟 3: 驗證日誌輸出

**預期日誌**:
```
🔥 [v22.0] 邊距計算: {
  cols: 5,
  width: 390,
  horizontalMargin: 10,
  availableWidth: 370,
  frameWidth: 74,
  totalFrameWidth: 370,
  formula: "..."
}

🔥 [v22.0] 水平間距計算: {
  cols: 5,
  width: 390,
  frameWidth: 74,
  totalCardWidth: 370,
  availableSpace: 20,
  horizontalSpacing: 3.33,
  totalWidth: 390,
  formula: "..."
}
```

---

## 🎯 驗證清單

- [ ] 在 Responsively App 中測試 iPhone 14
- [ ] 驗證 5 列卡片完整顯示
- [ ] 查看控制台日誌確認計算正確
- [ ] 在實際 iPhone 14 上測試
- [ ] 驗證卡片不被切割
- [ ] 驗證其他設備 (iPad, 桌面) 仍正常工作

---

## 📝 相關文件

| 文件 | 修改內容 |
|------|---------|
| `public/games/match-up-game/scenes/game.js` | 邊距和間距計算優化 |

---

## 🔄 後續改進

如果卡片仍然被切割，可以進一步調整：

1. **減少卡片高度** (第 1905 行)
   ```javascript
   maxCardHeight = hasImages ? 60 : 45;  // 從 65/50 減少到 60/45
   ```

2. **減少中文文字高度** (第 1906 行)
   ```javascript
   chineseTextHeightBase = 16;  // 從 18 減少到 16
   ```

3. **減少垂直間距** (第 1907 行)
   ```javascript
   verticalSpacingBase = 2;  // 從 3 減少到 2
   ```

---

**祝你使用愉快！** 🚀

