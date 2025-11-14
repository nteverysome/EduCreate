# 🔥 卡片保存在錯誤格子裡 - 深度分析報告

## 📊 問題根源發現

### 問題現象
- 用戶拖放卡片到某個空白框
- 提交答案後進入第2頁
- 返回第1頁時，卡片出現在**錯誤的空白框**裡

### 根本原因鏈

#### 1️⃣ **保存階段的問題**（onMatchSuccess 第 5601-5607 行）
```javascript
this.allPagesCardPositions[this.currentPage][pairIdForSave] = {
    isMatched: true,
    containerX: rightCard.x,      // ❌ 保存的是空白框的世界座標
    containerY: rightCard.y,      // ❌ 這個座標在頁面返回時可能不再有效
    relativeX: actualRelativeX,
    relativeY: actualRelativeY
};
```

**問題**：保存的 `containerX/Y` 是空白框的**世界座標**，但這個座標在以下情況下會失效：
- 空白框被銷毀並重新創建
- 空白框的順序改變
- 頁面重新佈局

#### 2️⃣ **恢復階段的問題**（restoreCardPositions 第 8468 行）
```javascript
const emptyBox = this.rightEmptyBoxes.find(box => box.getData('pairId') === pairId);
```

**問題**：雖然通過 `pairId` 查找空白框是正確的，但：
- 新創建的空白框可能在**不同的位置**
- 保存的 `containerX/Y` 是舊位置，新空白框在新位置
- 導致卡片被放入錯誤的空白框

#### 3️⃣ **座標計算的問題**（restoreCardPositions 第 8490-8492 行）
```javascript
const worldX = savedPos.containerX + savedPos.relativeX;  // ❌ 使用舊的 containerX
const worldY = savedPos.containerY + savedPos.relativeY;  // ❌ 使用舊的 containerY
card.setPosition(worldX, worldY);
```

**問題**：
- 計算出的世界座標基於**舊的空白框位置**
- 新空白框在新位置，卡片被放入錯誤的位置

### 具體例子

**第1頁初始狀態**：
```
空白框順序: [pairId: 3, 4, 1, 2]
位置:      [y: 160, 276, 392, 508]

用戶拖放卡片 pairId=4 到第2個空白框
保存: containerY = 276
```

**返回第1頁時**（如果洗牌順序改變）：
```
新空白框順序: [pairId: 1, 4, 2, 3]
新位置:      [y: 160, 276, 392, 508]

恢復時：
- 找到 pairId=4 的空白框 ✅
- 但新空白框在第2個位置（y: 276）
- 保存的 containerY = 276 恰好匹配 ❌ 錯誤！
- 卡片被放入錯誤的空白框
```

## ✅ 解決方案

### 方案 1：保存空白框的索引（推薦）
```javascript
// 保存時
const emptyBoxIndex = this.rightEmptyBoxes.indexOf(rightCard);
this.allPagesCardPositions[this.currentPage][pairIdForSave] = {
    isMatched: true,
    emptyBoxIndex: emptyBoxIndex,  // ✅ 保存索引而不是座標
    relativeX: actualRelativeX,
    relativeY: actualRelativeY
};

// 恢復時
const emptyBox = this.rightEmptyBoxes[savedPos.emptyBoxIndex];
```

### 方案 2：保存空白框的 pairId（當前方案，但需要修復）
```javascript
// 保存時
this.allPagesCardPositions[this.currentPage][pairIdForSave] = {
    isMatched: true,
    emptyBoxPairId: rightCard.getData('pairId'),  // ✅ 保存 pairId
    relativeX: actualRelativeX,
    relativeY: actualRelativeY
};

// 恢復時
const emptyBox = this.rightEmptyBoxes.find(box => box.getData('pairId') === savedPos.emptyBoxPairId);
// 然後直接使用 emptyBox 的座標，不使用保存的 containerX/Y
```

## 🔧 建議修復步驟

1. **移除保存的 containerX/Y**
   - 這些座標在頁面返回時不再有效

2. **保存空白框的 pairId**
   - 這是唯一不變的標識符

3. **恢復時使用新空白框的座標**
   - 不使用保存的舊座標

4. **測試多頁面場景**
   - 確保卡片在所有頁面都能正確恢復

