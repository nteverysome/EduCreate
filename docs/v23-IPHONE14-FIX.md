# 🎉 iPhone 14 卡片切割問題 - v23.0 修復

**修復版本**: v23.0  
**修復日期**: 2025-11-02  
**狀態**: ✅ 完成

---

## 📋 問題描述

iPhone 14 直向模式（390px 寬度）的混合布局中，卡片被切割，無法完整顯示。

### 根本原因

舊版本的邊距計算方式不正確：
```
實際 iPhone 14 寬度: 390px
舊邊距設置: 動態計算，導致可用寬度不足
結果: 卡片被切割 ❌
```

---

## ✅ 修復方案

### 修改 1: 固定邊距計算

**文件**: `public/games/match-up-game/scenes/game.js` (第 1956-1966 行)

**改進**:
- 5 列: 邊距 = 30px（確保 390px 寬度下有 330px 可用寬度）
- 4 列: 邊距 = 20px
- 3 列或更少: 邊距 = 25px

**效果**:
```
iPhone 14 (390px, 5 列):
- 邊距: 30px × 2 = 60px
- 可用寬度: 390 - 60 = 330px ✅
- 卡片寬度: 330 / 5 = 66px ✅
```

### 修改 2: 修正 frameWidth 計算

**文件**: `public/games/match-up-game/scenes/game.js` (第 1971-1973 行)

**改進**:
```javascript
// 舊版本
frameWidth = Math.min(maxFrameWidth, (width - horizontalMargin) / cols);

// 新版本
frameWidth = Math.min(maxFrameWidth, (width - 2 * horizontalMargin) / cols);
```

### 修改 3: 修正水平間距計算

**文件**: `public/games/match-up-game/scenes/game.js` (第 2391-2407 行)

**改進**:
```javascript
// 基於實際可用寬度計算
const availableWidth = width - 2 * horizontalMargin;
const totalCardWidth = frameWidth * cols;
const availableSpace = availableWidth - totalCardWidth;

// 5 列：最小間距（1-3px）
horizontalSpacing = Math.max(1, Math.min(3, availableSpace / (cols + 1)));
```

### 修改 4: 修正卡片位置計算

**文件**: `public/games/match-up-game/scenes/game.js` (第 2506-2510 行)

**改進**:
```javascript
// 舊版本
const frameX = horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2;

// 新版本
const frameX = horizontalMargin + horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2;
```

---

## 📊 預期結果

### iPhone 14 (390×844px, 5 列)

| 項目 | 值 | 說明 |
|------|-----|------|
| **視口寬度** | 390px | 實際 iPhone 14 寬度 |
| **邊距** | 30px × 2 | 固定值 |
| **可用寬度** | 330px | 390 - 60 ✅ |
| **卡片寬度** | 66px | 330 / 5 ✅ |
| **間距** | 1-3px | 動態計算 |
| **總寬度** | ~330px | 66 × 5 ≈ 330px ✅ |
| **結果** | ✅ 完整顯示 | 所有 5 列卡片都能看到 |

---

## 🧪 測試步驟

### 在實際 iPhone 14 上測試

1. 打開遊戲 URL
2. 打開 Safari 開發者工具
3. 查看控制台日誌，找到 `[v23.0] 寬度計算詳情`
4. 驗證：
   - `availableWidth` = 330px
   - `frameWidth` ≈ 66px
   - `totalCardWidth` ≈ 330px
5. 驗證卡片是否完整顯示（不被切割）

### 預期日誌輸出

```
📐 [v23.0] 寬度計算詳情: {
  screenWidth: 390,
  horizontalMargin: 30,
  availableWidth: 330,
  cols: 5,
  frameWidth: 66,
  totalCardWidth: 330,
  availableSpace: 0,
  note: "iPhone 14 (390px) 應該有 330px 可用寬度"
}
```

---

## 🔄 相關改動

- 更新了水平間距計算日誌（v23.0）
- 添加了詳細的寬度計算日誌
- 確保所有位置計算都考慮邊距

---

## ✨ 改進亮點

✅ 固定邊距，確保一致性  
✅ 正確計算可用寬度  
✅ 卡片完整顯示，不被切割  
✅ 詳細的日誌便於調試  
✅ 支援多列數（3、4、5 列）

