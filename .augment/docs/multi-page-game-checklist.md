# 多頁面遊戲開發檢查清單

基於 v116.0 修復的經驗，為其他遊戲開發者提供的檢查清單。

---

## 🔧 開發階段檢查清單

### 1. 狀態管理檢查

#### 數組初始化
- [ ] 在 `create()` 方法中初始化所有卡片數組
  ```javascript
  this.leftCards = [];
  this.rightCards = [];
  this.allCards = [];
  ```

- [ ] 在 `updateLayout()` 或 `createCards()` 中清空舊數組
  ```javascript
  this.leftCards = [];
  this.rightCards = [];
  ```

#### 頁面狀態清空
- [ ] 進入新頁面時清空 `matchedPairs`
- [ ] 進入新頁面時清空 `currentPageAnswers`
- [ ] 進入新頁面時清空其他頁面相關的臨時狀態

#### 數據結構驗證
- [ ] 確認卡片數組只包含當前頁面的卡片
- [ ] 確認 matchedPairs 只包含當前頁面的配對
- [ ] 確認 currentPageAnswers 只包含當前頁面的答案

### 2. 頁面轉換檢查

#### goToNextPage() 方法
```javascript
goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
        // ✅ 增加頁碼
        this.currentPage++;
        
        // ✅ 清空舊狀態
        this.matchedPairs.clear();
        this.currentPageAnswers = [];
        
        // ✅ 清空洗牌緩存
        this.shuffledPairsCache = null;
        
        // ✅ 重新佈局（會調用 createCards）
        this.updateLayout();
    }
}
```

- [ ] 頁碼正確遞增
- [ ] matchedPairs 被清空
- [ ] currentPageAnswers 被清空
- [ ] 洗牌緩存被清空
- [ ] updateLayout() 被調用

#### updateLayout() 方法
```javascript
updateLayout() {
    // ✅ 清除所有 Phaser 對象
    this.children.removeAll(true);
    
    // ✅ 清除按鈕引用
    this.submitButton = null;
    
    // ✅ 創建卡片（會清空數組）
    this.createCards();
}
```

- [ ] 所有 Phaser 對象被清除
- [ ] 按鈕引用被清除
- [ ] createCards() 被調用

#### createCards() 方法
```javascript
createCards() {
    // ✅ 清空卡片數組
    this.leftCards = [];
    this.rightCards = [];
    
    // ✅ 獲取當前頁的詞彙
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
    const currentPagePairs = this.pairs.slice(startIndex, endIndex);
    
    // ✅ 創建卡片
    // ...
}
```

- [ ] leftCards 被清空
- [ ] rightCards 被清空
- [ ] 正確計算當前頁的詞彙範圍
- [ ] 只創建當前頁的卡片

### 3. 調適訊息檢查

#### 關鍵位置的日誌
- [ ] `goToNextPage()` 開始時記錄頁面轉換
- [ ] `goToNextPage()` 中記錄 matchedPairs 清空前後
- [ ] `createCards()` 開始時記錄卡片數組清空前後
- [ ] `checkAllMatches()` 開始時記錄當前頁面狀態

#### 日誌內容建議
```javascript
console.log('🔥 [v116.0] 清空卡片數組前:', {
    leftCardsCount: this.leftCards ? this.leftCards.length : 0,
    rightCardsCount: this.rightCards ? this.rightCards.length : 0
});
this.leftCards = [];
this.rightCards = [];
console.log('🔥 [v116.0] 已清空卡片數組');
```

- [ ] 記錄數組清空前的大小
- [ ] 記錄清空操作
- [ ] 記錄數組清空後的大小

---

## 🧪 測試階段檢查清單

### 1. 單頁面測試
- [ ] 第一頁能正確加載卡片
- [ ] 第一頁能正確配對卡片
- [ ] 第一頁能正確提交答案
- [ ] 第一頁標記顯示正確

### 2. 多頁面轉換測試
- [ ] 進入第二頁時卡片數量正確
- [ ] 第二頁的詞彙 ID 與第一頁不同
- [ ] 第二頁能正確配對卡片
- [ ] 第二頁標記顯示正確

### 3. 完整流程測試
```javascript
// 測試腳本
const game = window.matchUpGame;
const scene = game.scene.keys?.GameScene;

// 第一頁
console.log('第一頁卡片數:', scene.leftCards.length);
// 配對並提交
// 進入第二頁

// 第二頁
console.log('第二頁卡片數:', scene.leftCards.length);
// 應該等於第一頁的卡片數，不應該累積
```

- [ ] 每頁的卡片數量一致
- [ ] 卡片數量不會累積
- [ ] 所有頁面的標記顯示正確

### 4. 邊界情況測試
- [ ] 最後一頁能正確完成
- [ ] 只有一頁的遊戲能正常工作
- [ ] 大量頁面（10+）能正常工作

---

## 🐛 故障排除指南

### 問題 1：第二頁顯示所有叉叉

**症狀**：
- 第一頁正常
- 第二頁所有卡片都顯示叉叉
- 實際配對是正確的

**檢查步驟**：
1. 在控制台檢查 `leftCards.length`
   ```javascript
   const scene = window.matchUpGame.scene.keys?.GameScene;
   console.log('leftCards:', scene.leftCards.length);
   // 第一頁應該是 2，第二頁也應該是 2
   // 如果第二頁是 4，說明數組沒有被清空
   ```

2. 檢查 `matchedPairs` 的內容
   ```javascript
   console.log('matchedPairs:', Array.from(scene.matchedPairs));
   // 應該只包含當前頁的 pairId
   ```

3. 檢查卡片的 `pairId`
   ```javascript
   scene.leftCards.forEach((card, i) => {
       console.log(`卡片 ${i}:`, card.getData('pairId'));
   });
   ```

**解決方案**：
- [ ] 確認 `createCards()` 開始時清空了數組
- [ ] 確認 `goToNextPage()` 清空了 `matchedPairs`
- [ ] 添加調適訊息驗證清空過程

### 問題 2：卡片數量不斷增加

**症狀**：
- 第一頁：2 個卡片
- 第二頁：4 個卡片
- 第三頁：6 個卡片

**根本原因**：
- `createCards()` 沒有清空舊數組

**解決方案**：
```javascript
createCards() {
    // 添加這兩行
    this.leftCards = [];
    this.rightCards = [];
    
    // 其餘代碼...
}
```

### 問題 3：標記顯示混亂

**症狀**：
- 有些卡片顯示正確的標記
- 有些卡片顯示錯誤的標記
- 標記位置不對

**檢查步驟**：
1. 驗證卡片數組是否包含舊卡片
2. 驗證 matchedPairs 是否包含舊 pairId
3. 檢查 `checkAllMatches()` 中的邏輯

**解決方案**：
- [ ] 清空卡片數組
- [ ] 清空 matchedPairs
- [ ] 驗證卡片引用的正確性

---

## 📊 驗證腳本

### 快速驗證腳本
```javascript
// 在控制台執行
const scene = window.matchUpGame.scene.keys?.GameScene;

console.log('=== 頁面狀態 ===');
console.log('當前頁:', scene.currentPage + 1);
console.log('總頁數:', scene.totalPages);

console.log('=== 卡片狀態 ===');
console.log('左側卡片數:', scene.leftCards.length);
console.log('右側卡片數:', scene.rightCards.length);

console.log('=== 配對狀態 ===');
console.log('matchedPairs 大小:', scene.matchedPairs.size);
console.log('matchedPairs 內容:', Array.from(scene.matchedPairs));

console.log('=== 卡片 ID ===');
scene.leftCards.forEach((card, i) => {
    console.log(`左側卡片 ${i}:`, card.getData('pairId'));
});
```

### 完整流程驗證腳本
```javascript
// 自動配對並驗證
const scene = window.matchUpGame.scene.keys?.GameScene;
const leftCards = scene.leftCards;
const rightCards = scene.rightCards;

console.log(`配對 ${leftCards.length} 對卡片`);

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

console.log('提交答案');
scene.checkAllMatches();

console.log('驗證完成');
```

---

## 📝 代碼審查清單

在代碼審查時，檢查以下項目：

- [ ] 所有數組在使用前都被初始化
- [ ] 所有數組在重新創建前都被清空
- [ ] 頁面轉換時所有狀態都被清空
- [ ] 調適訊息清楚地記錄了狀態變化
- [ ] 測試覆蓋了所有頁面轉換場景
- [ ] 沒有硬編碼的頁面數量假設

---

## 🎓 最佳實踐總結

1. **及時清空**：在重新創建前清空，不要依賴垃圾回收
2. **詳細日誌**：添加調適訊息驗證狀態變化
3. **完整測試**：測試所有頁面轉換場景
4. **代碼審查**：檢查數組管理邏輯
5. **文檔記錄**：記錄頁面狀態管理的設計

---

**版本**：1.0  
**基於**：v116.0 修復  
**最後更新**：2025-11-09

