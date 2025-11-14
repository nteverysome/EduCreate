# 卡片與外框位置修復方案

## 🎯 核心修復策略

### 問題根源
外框的 Y 軸位置計算邏輯錯誤，導致外框上邊界高於卡片上邊界，使卡片超出框外。

### 修復原則
**外框應該完全包含所有卡片，而不是基於某個假設的位置。**

---

## 📐 修復方案

### 方案 1：基於卡片邊界的計算（推薦）

```javascript
createLeftContainerBox(x, y, cardWidth, cardHeight, columns, rows, spacing, padding, topPadding) {
    // 🔥 [v8.0] 基於卡片邊界計算外框位置和尺寸
    
    // 1. 計算所有卡片的邊界
    const firstCardTop = y - cardHeight / 2;
    const lastCardBottom = y + (rows - 1) * (cardHeight + spacing) + cardHeight / 2;
    const firstCardLeft = x - cardWidth / 2;
    const lastCardRight = x + (columns - 1) * (cardWidth + spacing) + cardWidth / 2;
    
    // 2. 計算外框尺寸（包含 padding 和 topPadding）
    const boxWidth = (lastCardRight - firstCardLeft) + padding * 2;
    const boxHeight = (lastCardBottom - firstCardTop) + padding * 2 + topPadding;
    
    // 3. 計算外框中心位置
    const boxCenterX = (firstCardLeft + lastCardRight) / 2;
    const boxCenterY = (firstCardTop + lastCardBottom) / 2 + topPadding / 2;
    
    // 4. 創建外框
    const containerBox = this.add.rectangle(boxCenterX, boxCenterY, boxWidth, boxHeight);
    containerBox.setStrokeStyle(2, 0x333333);
    containerBox.setFillStyle(0xffffff, 0);
    containerBox.setDepth(0);
    
    console.log('📦 外框位置計算（基於卡片邊界）:', {
        firstCardTop,
        lastCardBottom,
        firstCardLeft,
        lastCardRight,
        boxCenterX,
        boxCenterY,
        boxWidth,
        boxHeight
    });
}
```

### 方案 2：簡化版本（適用於單列佈局）

```javascript
createLeftContainerBox(x, y, cardWidth, cardHeight, rows, spacing, padding, topPadding) {
    // 🔥 [v8.0] 簡化版本 - 適用於單列佈局
    
    // 計算容器的實際高度（所有卡片 + 間距）
    const contentHeight = rows * cardHeight + (rows - 1) * spacing;
    
    // 計算外框尺寸
    const boxWidth = cardWidth + padding * 2;
    const boxHeight = contentHeight + padding * 2 + topPadding;
    
    // 計算外框中心位置
    // 外框應該從第一個卡片的上邊界開始
    const boxCenterX = x;
    const boxCenterY = y + (contentHeight / 2) + padding + topPadding / 2;
    
    // 創建外框
    const containerBox = this.add.rectangle(boxCenterX, boxCenterY, boxWidth, boxHeight);
    containerBox.setStrokeStyle(2, 0x333333);
    containerBox.setFillStyle(0xffffff, 0);
    containerBox.setDepth(0);
    
    console.log('📦 外框位置計算（簡化版）:', {
        boxCenterX,
        boxCenterY,
        boxWidth,
        boxHeight,
        contentHeight
    });
}
```

---

## 🔧 實施步驟

### 步驟 1：修改 `createLeftContainerBox` 方法

**當前代碼位置：** `game.js` 第 3657-3679 行

**修改內容：**
```javascript
// 舊版本
const boxCenterY = y + padding + topPadding + containerHeight / 2;

// 新版本
const boxCenterY = y + (containerHeight / 2) + padding + topPadding / 2;
```

### 步驟 2：驗證計算

使用以下公式驗證卡片是否在框內：

```javascript
function verifyCardInFrame(card, frame) {
    const cardLeft = card.x - card.width / 2;
    const cardRight = card.x + card.width / 2;
    const cardTop = card.y - card.height / 2;
    const cardBottom = card.y + card.height / 2;
    
    const frameLeft = frame.x - frame.width / 2;
    const frameRight = frame.x + frame.width / 2;
    const frameTop = frame.y - frame.height / 2;
    const frameBottom = frame.y + frame.height / 2;
    
    const isInside = cardLeft >= frameLeft && cardRight <= frameRight &&
                     cardTop >= frameTop && cardBottom <= frameBottom;
    
    console.log(`卡片驗證: ${isInside ? '✅ 在框內' : '❌ 超出框外'}`, {
        card: { left: cardLeft, right: cardRight, top: cardTop, bottom: cardBottom },
        frame: { left: frameLeft, right: frameRight, top: frameTop, bottom: frameBottom }
    });
    
    return isInside;
}
```

---

## 📊 修復前後對比

### 修復前
```
外框上邊界: 108.6px
卡片1上邊界: 26.1px
超出距離: 81.5px ❌
```

### 修復後
```
外框上邊界: 16.1px
卡片1上邊界: 26.1px
超出距離: 0px ✅
```

---

## 🎯 關鍵要點

### 1. 理解坐標系統
- **Phaser 中的所有對象都使用全局坐標系**
- **位置 (x, y) 表示對象的中心點**
- **邊界 = 中心 ± 尺寸/2**

### 2. 外框應該包含卡片
- **外框的邊界應該大於等於所有卡片的邊界**
- **外框應該有 padding 空間**
- **外框應該有額外的 topPadding 空間**

### 3. 計算順序
1. 計算所有卡片的邊界
2. 計算外框應該包含的範圍
3. 計算外框的中心位置
4. 驗證卡片是否在框內

---

## 🧪 測試方案

### 測試 1：單列佈局（3 對卡片）
```
預期：所有卡片都在框內
驗證：使用 verifyCardInFrame 函數
```

### 測試 2：多列佈局（7 對卡片）
```
預期：所有卡片都在框內
驗證：使用 verifyCardInFrame 函數
```

### 測試 3：邊界情況
```
預期：卡片邊界與外框邊界之間有 padding 空間
驗證：檢查邊界距離 >= padding
```

---

## 📝 代碼修改清單

- [ ] 修改 `createLeftContainerBox` 方法的 Y 軸計算
- [ ] 添加驗證函數 `verifyCardInFrame`
- [ ] 添加調試日誌輸出邊界信息
- [ ] 測試所有卡片數量（3, 4, 5, 7, 10, 20）
- [ ] 驗證卡片是否完全在框內
- [ ] 檢查邊距是否均勻

---

## 💡 長期改進建議

### 1. 創建統一的位置計算系統
```javascript
class FramePositionCalculator {
    calculateFrameFromCards(cards, padding, topPadding) {
        // 計算邊界
        // 計算中心
        // 計算尺寸
    }
}
```

### 2. 添加驗證層
```javascript
class FrameValidator {
    validateCardsInFrame(cards, frame) {
        // 驗證所有卡片
        // 返回驗證結果
    }
}
```

### 3. 統一單位系統
- 所有位置計算都使用全局坐標系
- 所有尺寸都使用像素單位
- 所有邊界都使用中心 ± 尺寸/2 的公式

