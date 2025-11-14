# v116.0 多頁面卡片數組累積修復 - 完整文檔

## 📋 執行摘要

**問題**：多頁面遊戲中，第二頁及以後的頁面無法正確顯示答案標記（勾勾/叉叉），所有卡片都顯示叉叉。

**根本原因**：`createCards()` 方法沒有在每次創建卡片前清空 `this.leftCards` 和 `this.rightCards` 數組，導致舊卡片引用累積。

**解決方案**：在 `createCards()` 方法開始時添加數組清空邏輯。

**影響範圍**：所有使用分頁功能的遊戲（Match-up Game、其他多頁面遊戲）

**修復版本**：v116.0

---

## 🔍 問題描述

### 用戶報告
- 第一頁：正常工作，勾勾和叉叉根據實際匹配結果正確顯示
- 第二頁：所有卡片都顯示叉叉，無論實際匹配結果如何
- 第三頁：同樣問題

### 表現症狀
```
第一頁：2/2 正確 ✅
第二頁：2/2 正確（實際），但全部顯示叉叉 ❌
第三頁：2/2 正確（實際），但全部顯示叉叉 ❌
```

---

## 🔬 調查過程

### 第一步：添加調適訊息（v115.0）
在三個關鍵位置添加詳細日誌：
- `createCards()` - 追蹤頁面狀態和詞彙列表
- `checkAllMatches()` - 追蹤提交答案時的狀態
- `goToNextPage()` - 追蹤頁面轉換和 matchedPairs 清空

### 第二步：使用 Playwright 自動化測試
```javascript
// 自動配對卡片
for (let i = 0; i < leftCards.length; i++) {
    const leftCard = leftCards[i];
    const leftPairId = leftCard.getData('pairId');
    const rightCard = rightCards.find(card => 
        card.getData('pairId') === leftPairId
    );
    if (rightCard) {
        scene.checkMatch(leftCard, rightCard);
    }
}
```

### 第三步：分析控制台日誌
發現關鍵線索：
```
第一頁進入時：leftCardsCount: 0, rightCardsCount: 0
第二頁進入時：leftCardsCount: 2, rightCardsCount: 2  ← 舊卡片！
第二頁創建後：leftCardsCount: 4, rightCardsCount: 4  ← 累積了！
```

---

## 🎯 根本原因分析

### 代碼流程對比

**第一頁（正常）：**
```
1. 初始化：leftCards = [], rightCards = []
2. createCards() 被調用
3. 創建新卡片並添加到空數組
4. 結果：leftCards.length = 2, rightCards.length = 2 ✅
```

**第二頁（修復前）：**
```
1. goToNextPage() 被調用
2. matchedPairs 被清空 ✅
3. updateLayout() 被調用
4. children.removeAll(true) 清除所有 Phaser 對象 ✅
5. createCards() 被調用
6. ❌ leftCards 和 rightCards 數組 NOT 被清空
7. 新卡片被添加到舊卡片之後
8. 結果：leftCards.length = 4, rightCards.length = 4 ❌
```

### 為什麼這導致標記顯示錯誤？

在 `checkAllMatches()` 中：
```javascript
// 遍歷 leftCards 數組
for (let i = 0; i < leftCards.length; i++) {
    const leftCard = leftCards[i];
    // 獲取卡片的 pairId
    const selectedPairId = leftCard.getData('pairId');
    // 檢查是否在 matchedPairs 中
    const isCorrect = matchedPairs.has(selectedPairId);
}
```

**問題**：
- 第二頁時，`leftCards` 包含 4 個卡片（2 個舊的 + 2 個新的）
- 舊卡片的 pairId 是 1, 2（第一頁的）
- 新卡片的 pairId 是 3, 4（第二頁的）
- `matchedPairs` 只包含 3, 4（第二頁配對的）
- 當檢查舊卡片時，pairId 1, 2 不在 matchedPairs 中 → 顯示叉叉
- 當檢查新卡片時，pairId 3, 4 在 matchedPairs 中 → 顯示勾勾
- 結果：混亂的標記顯示

---

## ✅ 修復方案（v116.0）

### 代碼修改

在 `createCards()` 方法開始時添加：

```javascript
createCards() {
    console.log('🎮 GameScene: createCards 開始');
    console.log('🎮 GameScene: pairs 數據', this.pairs);

    // 🔥 [v116.0] 清空 leftCards 和 rightCards 數組，防止卡片累積
    console.log('🔥 [v116.0] 清空卡片數組前:', {
        leftCardsCount: this.leftCards ? this.leftCards.length : 0,
        rightCardsCount: this.rightCards ? this.rightCards.length : 0
    });
    this.leftCards = [];
    this.rightCards = [];
    console.log('🔥 [v116.0] 已清空卡片數組');

    // ... 其餘代碼保持不變
}
```

### 修改位置
- **文件**：`public/games/match-up-game/scenes/game.js`
- **方法**：`createCards()`
- **行號**：第 1181-1208 行

### 為什麼這個修復有效？

```
修復前：
進入第二頁 → leftCards = [舊1, 舊2] → 添加新卡片 → leftCards = [舊1, 舊2, 新1, 新2]

修復後：
進入第二頁 → leftCards = [舊1, 舊2] → 清空 → leftCards = [] → 添加新卡片 → leftCards = [新1, 新2]
```

---

## 🧪 測試驗證

### 測試環境
- URL：`http://localhost:3000/games/match-up-game?devLayoutTest=true&itemsPerPage=2&layout=separated`
- 配置：3 頁，每頁 2 個詞彙對
- 總詞彙：6 對（ID: 1-6）

### 測試結果

| 頁面 | 詞彙 ID | 配對結果 | 標記顯示 | 狀態 |
|------|---------|---------|---------|------|
| 第一頁 | 1, 2 | 2/2 正確 | ✅ 正確 | ✅ |
| 第二頁 | 3, 4 | 2/2 正確 | ✅ 正確 | ✅ |
| 第三頁 | 5, 6 | 2/2 正確 | ✅ 正確 | ✅ |
| **總計** | 1-6 | **6/6 正確** | **✅ 全部正確** | **✅** |

### 關鍵日誌驗證

**第一頁進入：**
```
🔥 [v116.0] 清空卡片數組前: {leftCardsCount: 0, rightCardsCount: 0}
🔥 [v116.0] 已清空卡片數組
🎮 GameScene: createCards 完成 {leftCardsCount: 2, rightCardsCount: 2}
```

**第二頁進入：**
```
🔥 [v116.0] 清空卡片數組前: {leftCardsCount: 2, rightCardsCount: 2}  ← 舊卡片被清空
🔥 [v116.0] 已清空卡片數組
🎮 GameScene: createCards 完成 {leftCardsCount: 2, rightCardsCount: 2}  ← 只有新卡片
```

**第三頁進入：**
```
🔥 [v116.0] 清空卡片數組前: {leftCardsCount: 2, rightCardsCount: 2}  ← 舊卡片被清空
🔥 [v116.0] 已清空卡片數組
🎮 GameScene: createCards 完成 {leftCardsCount: 2, rightCardsCount: 2}  ← 只有新卡片
```

---

## 📚 最佳實踐

### 1. 數組管理原則
```javascript
// ❌ 錯誤：直接 push 到數組，不清空
this.cards.push(newCard);

// ✅ 正確：在重新創建前清空
this.cards = [];
this.cards.push(newCard);
```

### 2. 狀態管理檢查清單
- [ ] 進入新頁面時，是否清空了所有卡片數組？
- [ ] 是否清空了 matchedPairs？
- [ ] 是否清空了 currentPageAnswers？
- [ ] 是否清空了其他頁面相關的狀態？

### 3. 調適訊息最佳實踐
```javascript
// 在數組操作前後添加日誌
console.log('清空前:', {
    cardsCount: this.cards.length,
    content: this.cards.map(c => c.getData('id'))
});
this.cards = [];
console.log('清空後:', {
    cardsCount: this.cards.length
});
```

---

## 🔗 相關版本歷史

| 版本 | 修復內容 | 狀態 |
|------|---------|------|
| v113.0 | 進入新頁面時清空 matchedPairs | ✅ 必要 |
| v114.0 | 只在有已配對卡片時才恢復標記 | ✅ 必要 |
| v115.0 | 添加詳細調適訊息追蹤流程 | ✅ 診斷工具 |
| **v116.0** | **清空 leftCards 和 rightCards 數組** | **✅ 根本修復** |

---

## 📝 提交信息

```
commit dfcca10
Author: AI Assistant
Date:   [timestamp]

fix: 實現 v116.0 - 在 createCards 開始時清空 leftCards 和 rightCards 數組，防止卡片累積

- 在 createCards() 方法開始時添加數組清空邏輯
- 防止舊卡片引用在進入新頁面時累積
- 確保每個頁面都有正確的卡片引用
- 修復第二頁及以後頁面標記顯示錯誤的問題
- 添加 v116.0 調適訊息追蹤數組清空過程
```

---

## 🎓 其他遊戲的參考建議

### 1. 檢查清單
在開發多頁面遊戲時，確保：
- [ ] 每個頁面有獨立的卡片/元素數組
- [ ] 進入新頁面時清空舊數組
- [ ] 添加調適訊息驗證數組狀態
- [ ] 測試所有頁面的完整流程

### 2. 代碼模板
```javascript
// 在 updateLayout() 或 createCards() 中
createCards() {
    // 清空舊卡片數組
    this.leftCards = [];
    this.rightCards = [];
    
    // 清空舊狀態
    this.matchedPairs.clear();
    this.currentPageAnswers = [];
    
    // 創建新卡片
    // ...
}
```

### 3. 測試策略
- 使用 Playwright 自動化測試多頁面流程
- 驗證每個頁面的卡片數量是否正確
- 檢查標記顯示是否與實際匹配結果一致
- 測試頁面轉換時的狀態變化

---

## 📞 相關文件

- 主要修改：`public/games/match-up-game/scenes/game.js`
- 調試工具：`public/games/match-up-game/dev-tools/layout-smoke-test.js`
- 測試配置：`?devLayoutTest=true&itemsPerPage=2&layout=separated`

---

**文檔版本**：1.0  
**最後更新**：2025-11-09  
**適用版本**：v116.0 及以後

