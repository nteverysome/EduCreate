# Match-Up Game 核心函數詳細說明

## 🎯 高優先級函數

### 1. createCards() - 卡片創建主入口

**位置**: L1707  
**用途**: 根據當前頁面的詞彙數據創建所有卡片

**核心邏輯**:
```javascript
createCards() {
  // 1. 獲取當前頁面的詞彙對
  const currentPagePairs = this.pairs.slice(startIndex, endIndex);
  
  // 2. 根據卡片數量選擇佈局
  if (itemCount <= 5) {
    this.createLeftRightSingleColumn();  // 左右單列
  } else if (itemCount <= 7) {
    this.createTopBottomSingleRow();     // 上下單行
  } else if (itemCount <= 10) {
    this.createTopBottomTwoRows();       // 上下雙行
  } else {
    this.createMixedLayout();            // 混合佈局
  }
}
```

**關鍵決策**:
- 根據 `itemCount` 選擇最適合的佈局
- 考慮屏幕尺寸和設備類型
- 保存卡片到 `this.leftCards` 和 `this.rightCards`

---

### 2. checkAllMatches() - 答案檢查核心

**位置**: L6202  
**用途**: 檢查所有卡片配對是否正確

**核心邏輯**:
```javascript
checkAllMatches() {
  let correctCount = 0;
  let incorrectCount = 0;
  
  // 遍歷所有右側框
  for (let frameIndex = 0; frameIndex < this.rightEmptyBoxes.length; frameIndex++) {
    const expectedPairId = this.frameIndexToPairIdMap[frameIndex];
    const currentCardInFrame = this.rightEmptyBoxes[frameIndex].list[0];
    
    if (currentCardInFrame) {
      const currentCardPairId = currentCardInFrame.getData('pairId');
      const isCorrect = expectedPairId === currentCardPairId;
      
      if (isCorrect) {
        correctCount++;
        this.showCorrectAnswer(emptyBox, expectedPair.english);
      } else {
        incorrectCount++;
        this.showIncorrectAnswer(emptyBox, expectedPair.english);
      }
    }
  }
  
  return { correctCount, incorrectCount };
}
```

**返回值**:
- `correctCount`: 正確配對數
- `incorrectCount`: 錯誤配對數

---

### 3. onMatchSuccess() - 配對成功處理

**位置**: L5902  
**用途**: 處理卡片配對成功的邏輯

**核心邏輯**:
```javascript
onMatchSuccess(leftCard, rightCard) {
  // 1. 標記為已配對
  leftCard.setData('isMatched', true);
  leftCard.setData('matchedWith', rightCard);
  rightCard.setData('isMatched', true);
  rightCard.setData('matchedWith', leftCard);
  
  // 2. 添加到已配對集合
  this.matchedPairs.add(leftCard.getData('pairId'));
  
  // 3. 視覺效果：降低透明度
  leftCard.setAlpha(0.5);
  rightCard.setAlpha(0.5);
  
  // 4. 分離模式：隱藏右側空白框
  if (this.layout === 'separated') {
    rightCard.getData('background').setVisible(false);
  }
  
  // 5. 檢查是否所有卡片都已配對
  this.checkAllCardsMatched();
}
```

**副作用**:
- 修改 `matchedPairs` 集合
- 改變卡片透明度
- 可能顯示提交按鈕

---

### 4. goToNextPage() - 進入下一頁

**位置**: L7190  
**用途**: 進入下一頁並保存當前頁狀態

**核心邏輯**:
```javascript
goToNextPage() {
  if (this.currentPage < this.totalPages - 1) {
    // 1. 保存當前頁答案
    const pageAnswersKey = `page_${this.currentPage}_answers`;
    this[pageAnswersKey] = [...this.currentPageAnswers];
    
    // 2. 保存當前頁卡片位置
    this.saveCardPositions(this.currentPage);
    
    // 3. 保存洗牌順序
    this.allPagesShuffledCache[this.currentPage] = this.shuffledPairsCache;
    
    // 4. 進入下一頁
    this.currentPage++;
    this.currentPageAnswers = [];
    this.matchedPairs.clear();
    
    // 5. 重新佈局
    this.updateLayout();
  }
}
```

**保存的狀態**:
- `page_X_answers`: 每頁的答案
- `allPagesCardPositions`: 卡片位置
- `allPagesShuffledCache`: 洗牌順序

---

### 5. goToPreviousPage() - 進入上一頁

**位置**: L7300  
**用途**: 返回上一頁並恢復之前的狀態

**核心邏輯**:
```javascript
goToPreviousPage() {
  if (this.currentPage > 0) {
    // 1. 保存當前頁狀態（同 goToNextPage）
    this.saveCardPositions(this.currentPage);
    
    // 2. 進入上一頁
    this.currentPage--;
    
    // 3. 恢復上一頁的答案
    const pageAnswersKey = `page_${this.currentPage}_answers`;
    this.currentPageAnswers = this[pageAnswersKey] || [];
    
    // 4. 恢復上一頁的配對
    this.matchedPairs = new Set(this.allPagesMatchedPairs[this.currentPage] || []);
    
    // 5. 重新佈局（會自動恢復卡片位置）
    this.updateLayout();
  }
}
```

**恢復的狀態**:
- 答案和配對結果
- 卡片位置和視覺效果
- 洗牌順序

---

## 📊 函數調用流程

```
遊戲開始
  ↓
create() → loadVocabularyFromAPI() → initializePagination()
  ↓
createCards() → 選擇佈局 → 創建卡片
  ↓
用戶拖拽卡片
  ↓
onMatchSuccess() / onMatchFail()
  ↓
checkAllCardsMatched() → showSubmitButton()
  ↓
用戶點擊提交
  ↓
checkAllMatches() → showMatchSummary()
  ↓
goToNextPage() / 遊戲完成
```

---

## 🔄 狀態管理

### 重要狀態變數

| 變數 | 類型 | 說明 |
|------|------|------|
| `matchedPairs` | Set | 當前頁已配對的 pairId |
| `allPagesMatchedPairs` | Object | 所有頁面的配對結果 |
| `currentPageAnswers` | Array | 當前頁的答案記錄 |
| `allPagesCardPositions` | Object | 所有頁面的卡片位置 |
| `currentPage` | Number | 當前頁索引 |

---

**最後更新**: 2025-01-14  
**版本**: v1.0

