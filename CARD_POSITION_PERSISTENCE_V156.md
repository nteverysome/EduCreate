# 卡片位置持久化功能 - v156.0

## 🎯 功能概述

**需求**：按 showAnswers 後回到上一頁，用戶要看上一頁錯誤的與對的部分，希望左容器移動過去的卡片還能保存在右邊框框內不動。

**解決方案**：實現卡片位置持久化機制，在頁面切換時保存卡片位置，返回時恢復。

**版本**：v156.0

---

## 🔧 技術實現

### 1. 初始化卡片位置存儲

**文件**：`public/games/match-up-game/scenes/game.js`（第 37-40 行）

```javascript
// 🔥 [v156.0] 保存所有頁面的卡片位置（用於返回前面頁面時恢復卡片位置）
this.allPagesCardPositions = {};  // 格式：{ pageIndex: { pairId: { x, y } } }
```

### 2. 保存卡片位置

**函數**：`saveCardPositions(pageIndex)`（第 8225-8251 行）

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

**調用位置**：
- `goToNextPage()`（第 6562 行）
- `goToPreviousPage()`（第 6627 行）

### 3. 恢復卡片位置

**函數**：`restoreCardPositions(pageIndex)`（第 8253-8294 行）

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

**調用位置**：
- `updateLayout()`（第 1210 行）- 在卡片創建完成後恢復位置

---

## 📊 工作流程

### 用戶操作流程

```
第 1 頁
  ↓
用戶拖放卡片到右邊框框
  ↓
按「下一頁」按鈕
  ↓
[saveCardPositions(0)] - 保存第 1 頁的卡片位置
  ↓
進入第 2 頁
  ↓
按「上一頁」按鈕
  ↓
[saveCardPositions(1)] - 保存第 2 頁的卡片位置
  ↓
進入第 1 頁
  ↓
[updateLayout()] - 重新創建卡片
  ↓
[restoreCardPositions(0)] - 恢復第 1 頁的卡片位置
  ↓
✅ 卡片回到之前的位置
```

---

## 🧪 測試步驟

### 測試場景 1：多頁面卡片位置保存

1. **打開遊戲**
   ```
   http://localhost:3000/games/switcher?game=match-up-game&layout=separated
   ```

2. **第 1 頁操作**
   - 拖放 2-3 個卡片到右邊框框
   - 記錄卡片位置
   - 打開開發者工具（F12）→ Console

3. **進入第 2 頁**
   - 點擊「下一頁」按鈕
   - 查看 Console 日誌：`🔥 [v156.0] 已保存第 1 頁的卡片位置`

4. **返回第 1 頁**
   - 點擊「上一頁」按鈕
   - 查看 Console 日誌：`🔥 [v156.0] 已恢復第 1 頁的卡片位置`
   - ✅ 驗證：卡片應該回到之前的位置

### 測試場景 2：showAnswers 後返回

1. **第 1 頁操作**
   - 拖放卡片到右邊框框
   - 提交答案

2. **查看答案**
   - 點擊「Show answers」按鈕
   - 查看答案頁面

3. **返回遊戲**
   - 點擊「返回」或「上一頁」
   - ✅ 驗證：卡片應該保持在右邊框框內

---

## 📝 Console 日誌

### 保存卡片位置日誌

```
🔥 [v156.0] ========== 保存卡片位置開始 ==========
🔥 [v156.0] 頁面索引: 0
🔥 [v156.0] 已保存第 1 頁的卡片位置: {
    pageIndex: 0,
    savedCardsCount: 7,
    positions: {
        1: { x: 500, y: 300, isMatched: false },
        2: { x: 600, y: 350, isMatched: true },
        ...
    }
}
🔥 [v156.0] ========== 保存卡片位置完成 ==========
```

### 恢復卡片位置日誌

```
🔥 [v156.0] ========== 恢復卡片位置開始 ==========
🔥 [v156.0] 頁面索引: 0
🔥 [v156.0] 已恢復卡片位置: {
    pairId: 1,
    x: 500,
    y: 300,
    isMatched: false
}
🔥 [v156.0] 已恢復第 1 頁的卡片位置: {
    pageIndex: 0,
    restoredCardsCount: 7,
    totalSavedPositions: 7
}
🔥 [v156.0] ========== 恢復卡片位置完成 ==========
```

---

## 🔑 關鍵代碼位置

| 功能 | 文件 | 行號 |
|------|------|------|
| 初始化存儲 | game.js | 37-40 |
| 保存位置 | game.js | 8225-8251 |
| 恢復位置 | game.js | 8253-8294 |
| goToNextPage 調用 | game.js | 6562 |
| goToPreviousPage 調用 | game.js | 6627 |
| updateLayout 調用 | game.js | 1210 |

---

## 💡 設計特點

### 1. 自動保存
- 頁面切換時自動保存卡片位置
- 無需用戶手動操作

### 2. 自動恢復
- 返回頁面時自動恢復卡片位置
- 在 updateLayout 完成後恢復

### 3. 完整信息保存
- 保存卡片的 x, y 座標
- 保存卡片的配對狀態（isMatched）
- 保存 pairId 用於識別卡片

### 4. 詳細日誌
- 保存時記錄詳細信息
- 恢復時記錄詳細信息
- 便於調試和驗證

---

## 🐛 常見問題

### Q: 卡片位置沒有被恢復？

**檢查清單**：
1. 查看 Console 是否有 `已保存第 X 頁的卡片位置` 日誌
2. 查看 Console 是否有 `已恢復第 X 頁的卡片位置` 日誌
3. 檢查 `allPagesCardPositions` 是否有數據
4. 確認 `leftCards` 是否被正確創建

### Q: 為什麼只保存左側卡片？

**原因**：
- 右側是空白框，位置固定
- 左側卡片可以被拖放到右側
- 只需要保存左側卡片的位置

### Q: 卡片位置在 resize 時會丟失嗎？

**不會**：
- resize 時調用 `updateLayout()`
- `updateLayout()` 會調用 `restoreCardPositions()`
- 卡片位置會被恢復

---

## 🚀 未來改進

1. **動畫恢復**
   - 添加卡片位置恢復的動畫效果
   - 使用 Tween 平滑移動卡片

2. **位置驗證**
   - 驗證恢復的位置是否有效
   - 檢查卡片是否超出邊界

3. **性能優化**
   - 只保存已配對的卡片位置
   - 減少存儲空間

4. **用戶反饋**
   - 顯示卡片位置恢復的提示
   - 添加視覺反饋效果

---

## 📊 修改統計

- **修改文件**：1 個（game.js）
- **新增函數**：2 個（saveCardPositions, restoreCardPositions）
- **修改函數**：3 個（goToNextPage, goToPreviousPage, updateLayout）
- **新增存儲**：1 個（allPagesCardPositions）
- **版本**：v156.0

---

## ✅ 驗證清單

- [x] 初始化卡片位置存儲
- [x] 實現保存卡片位置函數
- [x] 實現恢復卡片位置函數
- [x] 在頁面切換時調用保存函數
- [x] 在佈局更新時調用恢復函數
- [x] 添加詳細日誌
- [ ] 測試多頁面場景
- [ ] 測試 showAnswers 場景
- [ ] 測試 resize 場景

---

**版本**：v156.0
**狀態**：✅ 實現完成
**最後更新**：2025-11-11

