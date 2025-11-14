# 代碼對比：混合模式 vs 分離模式

## 1. showCorrectAnswer() 函數對比

### 混合模式（保存舊有邏輯）

```javascript
showCorrectAnswer(rightCard, correctAnswer) {
  // 🔥 [v142.0] 修復：在混合佈局中使用 showCorrectAnswerOnCard 函數
  if (this.layout === 'mixed') {
    // 混合佈局：使用統一的 showCorrectAnswerOnCard 函數
    console.log('🔍 [v142.0] showCorrectAnswer 混合佈局 - 調用 showCorrectAnswerOnCard');
    this.showCorrectAnswerOnCard(rightCard);  // ✅ 直接使用舊有邏輯
  }
}
```

**特點**：
- ✅ 直接調用 `showCorrectAnswerOnCard()`
- ✅ 不需要檢查卡片類型
- ✅ 所有卡片都適用

### 分離模式（新邏輯）

```javascript
showCorrectAnswer(rightCard, correctAnswer) {
  // 分離模式：使用原有的邏輯
  const background = rightCard.getData('background');
  const isEmptyBox = rightCard.getData('isEmptyBox');
  
  // 🔥 [v174.0] 調試：記錄卡片類型
  console.log('🔥 [v174.0] showCorrectAnswer 分離模式:', {
    pairId: rightCard.getData('pairId'),
    isEmptyBox: isEmptyBox,
    hasBackground: !!background,
  });
  
  if (isEmptyBox) {
    // 空白框模式：直接在框上顯示勾勾
    console.log('🔍 [v35.0] showCorrectAnswer 空白框模式 - 顯示勾勾');
    this.showCorrectAnswerOnCard(rightCard);  // ✅ 在空白框上顯示
    return;
  }
  
  // 其他邏輯...
}
```

**特點**：
- ⚠️ 需要檢查 `isEmptyBox` 屬性
- ⚠️ 根據卡片類型選擇不同的邏輯
- ⚠️ 複雜的條件判斷

## 2. checkAllMatches() 函數對比

### 混合模式（保存舊有邏輯）

```javascript
if (this.layout === 'mixed') {
  console.log('🔍 [v66.0] 混合模式：檢查所有右卡片的當前位置');
  
  // 直接使用舊有邏輯
  currentPagePairs.forEach((pair, pairIndex) => {
    const currentCardInFrame = this.rightCards.find(card =>
      card.getData('currentFrameIndex') === pairIndex
    );
    
    if (currentCardInFrame) {
      const currentCardPairId = currentCardInFrame.getData('pairId');
      const isCorrect = pair.id === currentCardPairId;
      
      if (isCorrect) {
        correctCount++;
        console.log('✅ [v66.0] 配對正確:', pair.chinese, '-', userAnswerPair.english);
        this.showCorrectAnswer(currentCardInFrame, pair.english);  // ✅ 舊有邏輯
      } else {
        incorrectCount++;
        console.log('❌ [v66.0] 配對錯誤:', pair.chinese, '-', userAnswerPair.english);
        this.showIncorrectAnswer(currentCardInFrame, pair.english);  // ✅ 舊有邏輯
      }
    }
  });
}
```

**特點**：
- ✅ 完全保存舊有邏輯
- ✅ 不需要修改
- ✅ 直接調用 `showCorrectAnswer()` 和 `showIncorrectAnswer()`

### 分離模式（新邏輯）

```javascript
// 🔥 [v180.0] 改進：使用 frameIndexToPairIdMap 驗證答案
for (let frameIndex = 0; frameIndex < this.rightEmptyBoxes.length; frameIndex++) {
  const expectedPairId = this.frameIndexToPairIdMap[frameIndex];
  
  const currentCardInFrame = this.leftCards.find(card =>
    card.getData('currentFrameIndex') === frameIndex
  );
  
  if (currentCardInFrame) {
    const currentCardPairId = currentCardInFrame.getData('pairId');
    const isCorrect = expectedPairId === currentCardPairId;
    
    if (isCorrect) {
      correctCount++;
      console.log('✅ [v180.0] 配對正確:', expectedPair ? expectedPair.chinese : 'N/A');
      
      // 🔥 [v190.0] 修復：在分離模式中，視覺指示器應該顯示在空白框上
      if (this.layout === 'separated') {
        // 在空白框上顯示勾勾
        const emptyBox = this.rightEmptyBoxes[frameIndex];
        if (emptyBox) {
          this.showCorrectAnswer(emptyBox, expectedPair ? expectedPair.english : 'N/A');  // ✅ 新邏輯
        }
      } else {
        // 混合模式：在左卡片上顯示勾勾
        this.showCorrectAnswer(currentCardInFrame, expectedPair ? expectedPair.english : 'N/A');
      }
    }
  }
}
```

**特點**：
- ⚠️ 需要檢查 `this.layout`
- ⚠️ 根據佈局模式選擇不同的卡片
- ⚠️ 複雜的邏輯流程

## 3. 卡片結構對比

### 混合模式卡片

```javascript
{
  pairId: 1,
  text: "cat",
  background: Rectangle,      // ✅ 所有卡片都有
  isEmptyBox: false,           // ✅ 統一的屬性
  x: 100,
  y: 100,
  checkMark: null,             // ✅ 可以直接添加標記
  xMark: null
}
```

### 分離模式卡片

```javascript
// 左卡片（英文）
{
  pairId: 1,
  text: "cat",
  background: Rectangle,      // ✅ 有背景
  isEmptyBox: false,           // ✅ 不是空白框
  currentFrameIndex: 0,        // ✅ 當前位置
  x: 100,
  y: 100
}

// 右卡片（空白框）
{
  pairId: 1,
  background: Rectangle,      // ✅ 有背景
  isEmptyBox: true,            // ⚠️ 是空白框
  frameIndex: 0,               // ✅ 框的索引
  x: 500,
  y: 100,
  list: [leftCard],            // ⚠️ 容器，包含卡片
  checkMark: null,             // ✅ 可以直接添加標記
  xMark: null
}
```

## 4. 為什麼混合模式能保存舊有邏輯

| 方面 | 混合模式 | 分離模式 |
|------|--------|--------|
| 卡片結構 | ✅ 統一 | ⚠️ 不同 |
| background 屬性 | ✅ 所有卡片都有 | ✅ 所有卡片都有 |
| isEmptyBox 屬性 | ✅ 都是 false | ⚠️ 有 true 和 false |
| 視覺指示器位置 | ✅ 卡片上 | ⚠️ 空白框上 |
| 邏輯複雜度 | ✅ 簡單 | ⚠️ 複雜 |
| 舊有邏輯適用性 | ✅ 100% 適用 | ⚠️ 需要修改 |

## 5. 設計優勢

### 向後兼容性
- 混合模式完全保存舊有邏輯
- 不需要修改任何代碼
- 確保現有功能不受影響

### 代碼重用
- `showCorrectAnswerOnCard()` 函數在兩種模式中都使用
- 減少代碼重複
- 易於維護

### 清晰的分支
- 根據 `this.layout` 進行明確的分支
- 易於理解和調試
- 易於擴展新的佈局模式

## 總結

**混合模式能保存舊有邏輯的根本原因**：
1. ✅ 卡片結構統一
2. ✅ 視覺指示器邏輯通用
3. ✅ 沒有特殊概念（如空白框）
4. ✅ 代碼設計優秀（使用分支邏輯）

**分離模式需要新邏輯的原因**：
1. ⚠️ 卡片結構不同
2. ⚠️ 視覺指示器位置不同
3. ⚠️ 空白框是容器
4. ⚠️ 複雜的邏輯流程

