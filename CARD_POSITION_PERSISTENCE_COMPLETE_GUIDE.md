# 卡片位置保存與恢復完整指南 (v156.0)

## 📋 功能概述

當用戶在 Match-up 遊戲中拖放卡片到右邊框框後，按下 "Show Answers" 返回上一頁時，**左容器移動過去的卡片仍然保存在右邊框框內不動**。

### 核心需求
- ✅ 卡片位置在頁面切換時被保存
- ✅ 返回頁面時卡片位置被恢復
- ✅ 用戶可以看到之前的配對結果

---

## 🔧 技術實現 (v156.0)

### 1. 初始化存儲結構 (第 37-40 行)

```javascript
// 🔥 [v156.0] 保存所有頁面的卡片位置（用於返回前面頁面時恢復卡片位置）
this.allPagesCardPositions = {};  // 格式：{ pageIndex: { pairId: { x, y, isMatched } } }
```

### 2. 保存卡片位置函數 (第 8225-8251 行)

```javascript
saveCardPositions(pageIndex) {
    // 初始化該頁的位置存儲
    if (!this.allPagesCardPositions[pageIndex]) {
        this.allPagesCardPositions[pageIndex] = {};
    }

    // 保存所有左側卡片的位置
    this.leftCards.forEach(card => {
        const pairId = card.getData('pairId');
        this.allPagesCardPositions[pageIndex][pairId] = {
            x: card.x,
            y: card.y,
            isMatched: card.getData('isMatched')
        };
    });
}
```

### 3. 恢復卡片位置函數 (第 8253-8294 行)

```javascript
restoreCardPositions(pageIndex) {
    // 檢查是否有保存的位置
    if (!this.allPagesCardPositions[pageIndex]) {
        return;
    }

    const savedPositions = this.allPagesCardPositions[pageIndex];

    // 恢復所有卡片的位置
    this.leftCards.forEach(card => {
        const pairId = card.getData('pairId');
        if (savedPositions[pairId]) {
            const savedPos = savedPositions[pairId];
            card.x = savedPos.x;
            card.y = savedPos.y;
        }
    });
}
```

### 4. 頁面導航集成

#### goToNextPage (第 6562 行)
```javascript
this.saveCardPositions(previousPage);  // 保存當前頁
```

#### goToPreviousPage (第 6627 行)
```javascript
this.saveCardPositions(previousPage);  // 保存當前頁
```

#### updateLayout (第 1210 行)
```javascript
this.restoreCardPositions(this.currentPage);  // 恢復卡片位置
```

---

## 📊 工作流程

```
用戶拖放卡片到右邊框框
    ↓
用戶點擊「下一頁」或「上一頁」
    ↓
saveCardPositions() 被調用
    ↓
卡片位置被保存到 allPagesCardPositions[pageIndex]
    ↓
updateLayout() 重新創建卡片
    ↓
restoreCardPositions() 被調用
    ↓
卡片恢復到之前的位置 ✅
```

---

## 🧪 測試步驟

### 測試場景 1：多頁導航
1. 在第 1 頁拖放 2-3 張卡片到右邊框框
2. 點擊「下一頁」按鈕
3. 返回第 1 頁
4. **驗證**：卡片應該在相同位置

### 測試場景 2：Show Answers
1. 拖放卡片到右邊框框
2. 提交答案
3. 點擊「Show Answers」
4. 返回遊戲
5. **驗證**：卡片應該在相同位置

### 控制台日誌檢查
```
✅ 保存時：
🔥 [v156.0] 已保存第 1 頁的卡片位置: {
    pageIndex: 0,
    savedCardsCount: 3,
    positions: { ... }
}

✅ 恢復時：
🔥 [v156.0] 已恢復第 1 頁的卡片位置: {
    pageIndex: 0,
    restoredCardsCount: 3,
    totalSavedPositions: 3
}
```

---

## 🎯 關鍵設計特性

| 特性 | 說明 |
|------|------|
| **自動保存** | 每次頁面切換時自動保存 |
| **自動恢復** | 返回頁面時自動恢復 |
| **多頁支持** | 支援無限頁面 |
| **狀態追蹤** | 保存 x, y, isMatched 狀態 |
| **調試日誌** | 完整的控制台日誌 |

---

## 📝 給下個遊戲的建議

### 1. 通用模式
```javascript
// 初始化
this.allPagesStates = {};

// 保存
savePageState(pageIndex) {
    this.allPagesStates[pageIndex] = {
        positions: this.getCardPositions(),
        matches: this.getMatchedPairs(),
        // ... 其他狀態
    };
}

// 恢復
restorePageState(pageIndex) {
    if (this.allPagesStates[pageIndex]) {
        this.applyCardPositions(this.allPagesStates[pageIndex].positions);
        // ... 恢復其他狀態
    }
}
```

### 2. 最佳實踐
- ✅ 在 updateLayout 前保存狀態
- ✅ 在 updateLayout 後恢復狀態
- ✅ 添加詳細的控制台日誌
- ✅ 驗證數據完整性

---

## 🔍 故障排除

| 問題 | 原因 | 解決方案 |
|------|------|--------|
| 卡片位置未恢復 | 沒有保存的位置 | 檢查 saveCardPositions 是否被調用 |
| 位置不正確 | 座標系統不同 | 確保使用世界座標 |
| 性能問題 | 保存過多數據 | 只保存必要的狀態 |

---

## ✅ 完成清單

- [x] 實現 saveCardPositions 函數
- [x] 實現 restoreCardPositions 函數
- [x] 集成到 goToNextPage
- [x] 集成到 goToPreviousPage
- [x] 集成到 updateLayout
- [x] 添加詳細日誌
- [x] 測試多頁場景
- [x] 測試 Show Answers 場景
- [x] 創建文檔

---

## 📚 相關文檔

- `X_MARK_FIX_SUMMARY.md` - 叉叉顯示修復
- `PHASER_CONTAINER_COORDINATE_SYSTEM_GUIDE.md` - 座標系統指南
- `GAME_VISUAL_FEEDBACK_CHECKLIST.md` - 開發檢查清單

---

**版本**: v156.0  
**最後更新**: 2025-11-11  
**狀態**: ✅ 完成並測試

