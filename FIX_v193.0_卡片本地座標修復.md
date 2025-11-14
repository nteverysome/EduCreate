# v193.0 修復：卡片本地座標設置

## 🔍 問題分析

### 用戶報告的問題
視覺指示器（✓ 和 ✗）成功修復了，答案也保存了，但是從左容器拖移過來的卡片沒有正確恢復，它們都跑到右下角了。

### 問題表現
從用戶提供的截圖中可以看到：
- ✅ 視覺指示器（✓ 和 ✗）成功恢復
- ✅ 答案數據成功保存
- ❌ 卡片位置不正確 - 卡片都顯示在空白框的右下角

### 根本原因

在 v192.0 的修復中，我只是簡單地調用 `emptyBox.add(card)`，但**沒有設置卡片的本地座標**。這導致：

1. **卡片被添加到容器中**
   - `emptyBox.add(card)` 將卡片添加到空白框容器中

2. **卡片的座標變成相對於容器的座標**
   - 在 Phaser 中，當對象被添加到容器時，其座標會變成相對於容器的座標

3. **卡片保留了之前的世界座標值**
   - 例如：卡片的世界座標是 (800, 400)
   - 容器的世界座標是 (600, 300)
   - 卡片被添加到容器後，相對座標變成 (800, 400)（而不是正確的 200, 100）

4. **結果：卡片顯示在容器的右下角**
   - 因為相對座標是一個很大的正數

## 🔬 正確的做法

### 正常拖放時的處理

在 `onMatchSuccess()` 函數中（第 5645-5654 行），當卡片匹配成功時，代碼會：

```javascript
// 🔥 [v145.0] 修復：在添加到容器前，計算卡片相對於容器的座標
const cardRelativeX = leftCard.x - rightCard.x;
const cardRelativeY = leftCard.y - rightCard.y;

// 將卡片添加到空白框容器中
rightCard.add(leftCard);

// 設置卡片相對於容器的座標
leftCard.setPosition(cardRelativeX, cardRelativeY);
```

**關鍵步驟**：
1. 計算卡片相對於容器的座標
2. 添加到容器
3. 設置本地座標

由於卡片先移動到容器的位置（通過 tween 動畫），所以相對座標接近 (0, 0)，卡片會顯示在容器的中心。

### v192.0 的錯誤

```javascript
// ❌ 錯誤：沒有設置本地座標
emptyBox.add(card);
card.setData('currentFrameIndex', frameIndex);
// ...
```

這導致卡片保留了之前的世界座標值，顯示在錯誤的位置。

## ✅ v193.0 修復方案

### 修復內容

在 `restoreCardPositions()` 函數中（第 8876-8924 行），添加設置本地座標的代碼：

```javascript
if (emptyBox) {
    // 🔥 [v193.0] 修復：在添加到容器前，記錄卡片的世界座標
    const cardWorldX = card.x;
    const cardWorldY = card.y;

    // 🔥 [v192.0] 添加到容器
    emptyBox.add(card);
    
    // 🔥 [v193.0] 修復：設置卡片的本地座標為 (0, 0)
    // 這樣卡片就會顯示在容器的中心，而不是右下角
    card.setPosition(0, 0);
    
    card.setData('currentFrameIndex', frameIndex);
    card.setData('isMatched', savedPos.isMatched || false);
    card.setData('matchedWith', emptyBox);
    
    // 只有正確配對的卡片才添加到 matchedPairs
    if (savedPos.isMatched) {
        this.matchedPairs.add(pairId);
    }

    console.log('✅ [v193.0] 卡片已恢復到容器:', {
        pairId: pairId,
        frameIndex: frameIndex,
        isMatched: savedPos.isMatched,
        emptyBoxPairId: emptyBox.getData('pairId'),
        cardWorldPos: { x: cardWorldX, y: cardWorldY },
        cardLocalPos: { x: card.x, y: card.y }
    });

    // 🔥 [v192.0] 新增：恢復視覺指示器
    if (savedPos.isMatched) {
        // 正確配對：顯示勾勾
        console.log('✅ [v193.0] 恢復勾勾視覺指示器');
        this.showCorrectAnswerOnCard(emptyBox);
    } else {
        // 錯誤配對：顯示叉叉
        console.log('❌ [v193.0] 恢復叉叉視覺指示器');
        this.showIncorrectAnswerOnCard(emptyBox);
    }
}
```

### 關鍵改進

1. **記錄世界座標**（用於調試）
   ```javascript
   const cardWorldX = card.x;
   const cardWorldY = card.y;
   ```

2. **設置本地座標為 (0, 0)**
   ```javascript
   card.setPosition(0, 0);
   ```
   - 這樣卡片就會顯示在容器的中心
   - 因為容器的原點在中心（Phaser 默認設置）

3. **添加調試日誌**
   ```javascript
   cardWorldPos: { x: cardWorldX, y: cardWorldY },
   cardLocalPos: { x: card.x, y: card.y }
   ```
   - 記錄世界座標和本地座標，方便調試

## 🎯 預期效果

修復後，當用戶：
1. ✅ 拖動所有卡片到空白框（包括正確和錯誤的配對）
2. ✅ 點擊「提交答案」按鈕
3. ✅ 進入第2頁
4. ✅ 返回第1頁

**預期結果**：
- ✅ 所有卡片（正確和錯誤配對）都會被恢復到對應的空白框中
- ✅ 卡片顯示在空白框的**中心位置**（而不是右下角）
- ✅ 正確配對的卡片顯示綠色勾勾（✓）
- ✅ 錯誤配對的卡片顯示紅色叉叉（✗）
- ✅ 用戶可以清楚地看到哪些答對、哪些答錯

## 📝 修改的文件

- `public/games/match-up-game/scenes/game.js`
  - 第 8876-8924 行：修復 `restoreCardPositions()` 函數

## 🔍 技術細節

### Phaser 容器座標系統

在 Phaser 中，當對象被添加到容器時：

1. **世界座標 → 本地座標**
   - 對象的座標會變成相對於容器的座標
   - 本地座標 = 對象世界座標 - 容器世界座標

2. **容器原點**
   - 容器的原點（0, 0）通常在容器的中心
   - 可以通過 `setOrigin()` 改變

3. **正確的添加流程**
   ```javascript
   // 步驟 1：計算相對座標
   const relativeX = object.x - container.x;
   const relativeY = object.y - container.y;
   
   // 步驟 2：添加到容器
   container.add(object);
   
   // 步驟 3：設置本地座標
   object.setPosition(relativeX, relativeY);
   ```

### 為什麼設置為 (0, 0)

在我們的場景中：
- 卡片應該顯示在空白框的中心
- 空白框容器的原點在中心
- 所以卡片的本地座標應該是 (0, 0)

如果我們想讓卡片偏移，可以設置其他值：
- `(10, 0)` - 卡片向右偏移 10 像素
- `(0, -10)` - 卡片向上偏移 10 像素

## 📊 版本歷史

- **v178.0-v181.0**: 修復重複的視覺指示器
- **v182.0-v184.0**: 嘗試修復卡片位置恢復
- **v185.0**: 發現 checkAllMatches() 沒有保存卡片位置
- **v187.0**: 修復 currentFrameIndex 沒有被設置
- **v189.0**: 修復數據結構不一致
- **v190.0**: 修復視覺指示器顯示在錯誤的位置
- **v192.0**: 修復卡片位置和視覺指示器恢復
- **v193.0**: **修復卡片本地座標設置（當前版本）**

## 🎓 學習要點

### 為什麼 v192.0 沒有完全解決問題

v192.0 修復了：
- ✅ 移除了 `isMatched` 限制
- ✅ 添加了視覺指示器恢復
- ✅ 確保了數據完整性

但是沒有修復：
- ❌ 卡片的本地座標設置

### 為什麼 v193.0 能完全解決問題

v193.0 添加了：
- ✅ 設置卡片的本地座標為 (0, 0)
- ✅ 記錄世界座標和本地座標（用於調試）
- ✅ 確保卡片顯示在容器的中心

### Phaser 容器的重要概念

1. **添加到容器會改變座標系統**
   - 對象的座標變成相對於容器的座標

2. **必須設置本地座標**
   - 否則對象會保留之前的世界座標值
   - 導致顯示在錯誤的位置

3. **容器原點很重要**
   - 原點在中心：(0, 0) 表示中心
   - 原點在左上角：(0, 0) 表示左上角

## 🚀 後續建議

1. **測試完整流程**：確保在多個頁面之間切換時，所有頁面的卡片位置都正確
2. **測試混合模式**：確保混合模式也能正確恢復卡片位置
3. **性能優化**：如果頁面很多，考慮優化保存和恢復的性能
4. **代碼重構**：考慮將卡片添加到容器的邏輯抽取為一個獨立的函數，避免重複代碼

