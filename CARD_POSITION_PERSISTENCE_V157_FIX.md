# 卡片位置保存修復 (v157.0) - 完整解決方案

## 🎯 問題分析

用戶反映：按 "Show Answers" 後回到上一頁，卡片沒有保存在右邊框框內，而是回到了原始位置。

### 根本原因

v156.0 的實現有一個關鍵缺陷：
- ❌ 卡片位置只在頁面切換時保存（`goToNextPage`、`goToPreviousPage`）
- ❌ 但卡片拖放時的位置改變**沒有被保存**
- ❌ 導致返回頁面時，卡片位置無法恢復

## 🔧 v157.0 修復方案

### 1. 添加實時位置保存函數

```javascript
// 🔥 [v157.0] 保存當前頁面的單個卡片位置（在拖放時調用）
saveCardPositionForCurrentPage(card) {
    const pageIndex = this.currentPage;
    const pairId = card.getData('pairId');

    // 初始化該頁的位置存儲
    if (!this.allPagesCardPositions[pageIndex]) {
        this.allPagesCardPositions[pageIndex] = {};
    }

    // 保存卡片位置
    this.allPagesCardPositions[pageIndex][pairId] = {
        x: card.x,
        y: card.y,
        isMatched: card.getData('isMatched')
    };
}
```

### 2. 在拖放邏輯中調用保存

#### 不匹配但停留在框內的情況（第 5259 行）
```javascript
this.tweens.add({
    targets: draggedCard,
    x: boxCenterX,
    y: boxCenterY,
    duration: 200,
    ease: 'Back.easeOut',
    onComplete: () => {
        // ... 其他代碼 ...
        
        // 🔥 [v157.0] 保存卡片位置（即使不匹配也要保存）
        this.saveCardPositionForCurrentPage(draggedCard);
    }
});
```

#### 配對成功的情況（第 5527 行）
```javascript
// 🔥 [v157.0] 保存卡片位置（配對成功時）
if (!this.allPagesCardPositions[this.currentPage]) {
    this.allPagesCardPositions[this.currentPage] = {};
}
this.allPagesCardPositions[this.currentPage][pairId] = {
    x: rightCard.x + cardRelativeX,
    y: rightCard.y + cardRelativeY,
    isMatched: true,
    containerX: rightCard.x,
    containerY: rightCard.y,
    relativeX: cardRelativeX,
    relativeY: cardRelativeY
};
```

### 3. 改進恢復邏輯

```javascript
restoreCardPositions(pageIndex) {
    // ... 檢查保存的位置 ...
    
    this.leftCards.forEach(card => {
        const pairId = card.getData('pairId');
        if (savedPositions[pairId]) {
            const savedPos = savedPositions[pairId];
            
            // 🔥 [v157.0] 檢查卡片是否被配對（在容器內）
            if (savedPos.isMatched && savedPos.containerX !== undefined) {
                // 卡片被配對，需要添加到容器中
                const emptyBox = this.rightEmptyBoxes.find(
                    box => box.getData('pairId') === pairId
                );
                if (emptyBox) {
                    // 將卡片添加到空白框容器中
                    emptyBox.add(card);
                    // 設置相對座標
                    card.setPosition(savedPos.relativeX, savedPos.relativeY);
                    card.setData('isMatched', true);
                    card.setData('matchedWith', emptyBox);
                    this.matchedPairs.add(pairId);
                }
            } else {
                // 卡片未被配對，恢復到世界座標
                card.x = savedPos.x;
                card.y = savedPos.y;
            }
        }
    });
}
```

## 📊 修改位置總結

| 位置 | 修改內容 | 版本 |
|------|--------|------|
| 第 5259 行 | 不匹配時保存位置 | v157.0 |
| 第 5527 行 | 配對成功時保存位置 | v157.0 |
| 第 8237-8288 行 | 新增 saveCardPositionForCurrentPage 函數 | v157.0 |
| 第 8316-8380 行 | 改進 restoreCardPositions 函數 | v157.0 |

## ✅ 現在應該能看到

✅ **拖放卡片到框內** → 位置被保存  
✅ **返回上一頁** → 卡片在相同位置  
✅ **配對成功** → 卡片在容器內被恢復  
✅ **不匹配但停留** → 卡片位置被保存  

## 🧪 測試步驟

1. 拖放卡片到右邊框框
2. 點擊「下一頁」或「上一頁」
3. 返回頁面
4. **驗證**：卡片應該在相同位置

## 📝 控制台日誌

```
🔥 [v157.0] 保存卡片位置（不匹配但停留在框內）
🔥 [v157.0] 保存卡片位置（配對成功）
🔥 [v157.0] 恢復配對卡片（在容器內）
```

## 🧪 完整測試指南

### 測試場景 1：拖放卡片到框內

1. **打開遊戲**
   - 訪問 `http://localhost:3000/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=separated`

2. **拖放卡片**
   - 從左邊拖放一個卡片到右邊的空白框
   - 例如：拖放第一個卡片到第一個框

3. **檢查控制台日誌**
   - 應該看到：`🔥 [v157.0] 保存卡片位置（不匹配但停留在框內）`
   - 或者：`🔥 [v157.0] 保存卡片位置（配對成功）`

4. **導航到下一頁**
   - 點擊分頁選擇器的「下一頁」按鈕

5. **返回上一頁**
   - 點擊分頁選擇器的「上一頁」按鈕

6. **驗證卡片位置**
   - 卡片應該在相同位置（在框內）
   - 控制台應該看到：`🔥 [v157.0] 恢復配對卡片（在容器內）`

### 測試場景 2：Show Answers 後返回

1. **拖放卡片到框內**
   - 拖放 2-3 個卡片到右邊的框

2. **點擊「提交答案」按鈕**
   - 提交當前頁面的答案

3. **點擊「Show Answers」按鈕**
   - 查看答案

4. **返回遊戲**
   - 點擊返回按鈕或導航回遊戲

5. **驗證卡片位置**
   - 卡片應該仍然在框內
   - 位置應該被保存和恢復

## 📊 代碼修改詳情

### 修改 1：新增 saveCardPositionForCurrentPage 函數

**位置**：第 8290-8312 行

```javascript
saveCardPositionForCurrentPage(card) {
    const pageIndex = this.currentPage;
    const pairId = card.getData('pairId');

    if (!this.allPagesCardPositions[pageIndex]) {
        this.allPagesCardPositions[pageIndex] = {};
    }

    this.allPagesCardPositions[pageIndex][pairId] = {
        x: card.x,
        y: card.y,
        isMatched: card.getData('isMatched')
    };
}
```

### 修改 2：在 checkDropInRightBox 中調用保存

**位置**：第 5259 行

```javascript
this.saveCardPositionForCurrentPage(draggedCard);
```

### 修改 3：在 onMatchSuccess 中保存配對信息

**位置**：第 5528-5551 行

保存世界座標和相對座標，用於恢復時重新添加到容器中。

---

**版本**: v157.0
**狀態**: ✅ 完成
**日期**: 2025-11-11
**測試狀態**: 等待手動測試

