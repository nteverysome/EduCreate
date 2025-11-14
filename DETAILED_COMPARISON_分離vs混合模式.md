# 詳細對比：分離模式 vs 混合模式

## 1. 視覺佈局差異

### 分離模式（Separated Layout）
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  英文卡片（左邊）          中文空白框（右邊）          │
│  ┌──────────┐              ┌──────────┐               │
│  │  cat     │              │  ___     │               │
│  │  🔊      │              │  貓      │               │
│  └──────────┘              └──────────┘               │
│                                                         │
│  ┌──────────┐              ┌──────────┐               │
│  │  dog     │              │  ___     │               │
│  │  🔊      │              │  狗      │               │
│  └──────────┘              └──────────┘               │
│                                                         │
│  ┌──────────┐              ┌──────────┐               │
│  │  book    │              │  ___     │               │
│  │  🔊      │              │  書      │               │
│  └──────────┘              └──────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**特點**：
- ✅ 英文卡片在左邊，中文空白框在右邊
- ✅ 卡片和框分開，清晰的左右分離
- ✅ 用戶拖動英文卡片到右邊的空白框
- ✅ 空白框是容器，卡片被添加到容器中

### 混合模式（Mixed Layout）
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  cat     │  │  dog     │  │  book    │             │
│  │  🔊      │  │  🔊      │  │  🔊      │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  貓      │  │  狗      │  │  書      │             │
│  │  ___     │  │  ___     │  │  ___     │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  香蕉    │  │  機器人  │  │  ...     │             │
│  │  ___     │  │  ___     │  │  ___     │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**特點**：
- ✅ 英文卡片和中文卡片混合排列
- ✅ 所有卡片在同一個區域
- ✅ 用戶拖動英文卡片到中文卡片上進行交換
- ✅ 卡片可以交換位置

## 2. 卡片結構差異

### 分離模式卡片

**左卡片（英文）**：
```javascript
{
  pairId: 1,
  text: "cat",
  background: Rectangle,        // 有背景
  isEmptyBox: false,             // 不是空白框
  currentFrameIndex: 0,          // 當前位置（在哪個空白框中）
  x: 100,
  y: 100,
  parentContainer: null          // 不在容器中
}
```

**右卡片（空白框）**：
```javascript
{
  pairId: 1,
  background: Rectangle,        // 有背景
  isEmptyBox: true,              // ⚠️ 是空白框
  frameIndex: 0,                 // 框的索引
  x: 500,
  y: 100,
  list: [leftCard],              // ⚠️ 容器，包含卡片
  parentContainer: Container     // 是容器
}
```

### 混合模式卡片

**英文卡片**：
```javascript
{
  pairId: 1,
  text: "cat",
  background: Rectangle,        // 有背景
  isEmptyBox: false,             // 不是空白框
  currentFrameIndex: 1,          // 當前位置（在哪個中文框中）
  x: 100,
  y: 100,
  parentContainer: null          // 不在容器中
}
```

**中文卡片**：
```javascript
{
  pairId: 1,
  text: "貓",
  background: Rectangle,        // 有背景
  isEmptyBox: false,             // ✅ 不是空白框
  frameIndex: 0,                 // 框的索引
  x: 200,
  y: 100,
  list: [],                      // ✅ 不是容器
  parentContainer: null          // 不在容器中
}
```

## 3. 拖放邏輯差異

### 分離模式拖放

```javascript
// 分離模式：拖動英文卡片到空白框
checkDropInRightBox(pointer, draggedCard) {
  // 1. 檢查指針是否在任何右側空白框上
  for (let i = 0; i < this.rightEmptyBoxes.length; i++) {
    const emptyBox = this.rightEmptyBoxes[i];
    
    // 2. 檢查碰撞
    if (Phaser.Geom.Rectangle.Contains(emptyBox.getBounds(), pointer.x, pointer.y)) {
      // 3. 將卡片添加到空白框容器中
      emptyBox.add(draggedCard);
      
      // 4. 設置 currentFrameIndex
      draggedCard.setData('currentFrameIndex', i);
      
      // 5. 檢查是否配對正確
      if (emptyBox.getData('pairId') === draggedCard.getData('pairId')) {
        // ✅ 正確配對
        this.onMatchSuccess(draggedCard, emptyBox);
      } else {
        // ❌ 錯誤配對
        console.log('⚠️ 不匹配，但卡片仍然停留在框裡');
      }
      
      return true;
    }
  }
  
  return false;
}
```

**特點**：
- ✅ 檢查英文卡片是否在空白框上
- ✅ 將卡片添加到空白框容器中
- ✅ 設置 `currentFrameIndex`
- ✅ 檢查是否配對正確

### 混合模式拖放

```javascript
// 混合模式：拖動英文卡片到中文卡片
checkMixedModeDrop(pointer, draggedCard) {
  // 1. 檢查指針是否在任何中文卡片上
  for (let i = 0; i < this.rightCards.length; i++) {
    const rightCard = this.rightCards[i];
    
    // 2. 檢查碰撞
    if (Phaser.Geom.Rectangle.Contains(rightCard.getBounds(), pointer.x, pointer.y)) {
      // 3. 交換卡片位置
      const tempX = draggedCard.x;
      const tempY = draggedCard.y;
      
      draggedCard.x = rightCard.x;
      draggedCard.y = rightCard.y;
      
      rightCard.x = tempX;
      rightCard.y = tempY;
      
      // 4. 設置 currentFrameIndex
      draggedCard.setData('currentFrameIndex', i);
      
      // 5. 檢查是否配對正確
      if (rightCard.getData('pairId') === draggedCard.getData('pairId')) {
        // ✅ 正確配對
        this.onMatchSuccess(draggedCard, rightCard);
      }
      
      return true;
    }
  }
  
  return false;
}
```

**特點**：
- ✅ 檢查英文卡片是否在中文卡片上
- ✅ 交換卡片位置
- ✅ 設置 `currentFrameIndex`
- ✅ 檢查是否配對正確

## 4. 答案檢查邏輯差異

### 分離模式答案檢查

```javascript
// 分離模式：檢查所有空白框中的卡片
for (let frameIndex = 0; frameIndex < this.rightEmptyBoxes.length; frameIndex++) {
  const expectedPairId = this.frameIndexToPairIdMap[frameIndex];
  
  // 1. 找到在這個框中的卡片
  const currentCardInFrame = this.leftCards.find(card =>
    card.getData('currentFrameIndex') === frameIndex
  );
  
  if (currentCardInFrame) {
    const currentCardPairId = currentCardInFrame.getData('pairId');
    const isCorrect = expectedPairId === currentCardPairId;
    
    if (isCorrect) {
      // ✅ 正確配對
      const emptyBox = this.rightEmptyBoxes[frameIndex];
      this.showCorrectAnswer(emptyBox, ...);  // 在空白框上顯示勾勾
    } else {
      // ❌ 錯誤配對
      const emptyBox = this.rightEmptyBoxes[frameIndex];
      this.showIncorrectAnswer(emptyBox, ...);  // 在空白框上顯示叉叉
    }
  }
}
```

**特點**：
- ✅ 遍歷所有空白框
- ✅ 檢查每個框中是否有卡片
- ✅ 視覺指示器顯示在空白框上

### 混合模式答案檢查

```javascript
// 混合模式：檢查所有中文卡片的位置
currentPagePairs.forEach((pair, pairIndex) => {
  const frameIndex = pairIndex;
  
  // 1. 找到在這個位置的英文卡片
  const currentCardInFrame = this.rightCards.find(card =>
    card.getData('currentFrameIndex') === frameIndex
  );
  
  if (currentCardInFrame) {
    const currentCardPairId = currentCardInFrame.getData('pairId');
    const isCorrect = pair.id === currentCardPairId;
    
    if (isCorrect) {
      // ✅ 正確配對
      this.showCorrectAnswer(currentCardInFrame, ...);  // 在英文卡片上顯示勾勾
    } else {
      // ❌ 錯誤配對
      this.showIncorrectAnswer(currentCardInFrame, ...);  // 在英文卡片上顯示叉叉
    }
  }
});
```

**特點**：
- ✅ 遍歷所有中文卡片
- ✅ 檢查每個位置是否有英文卡片
- ✅ 視覺指示器顯示在英文卡片上

## 5. 關鍵差異總結

| 方面 | 分離模式 | 混合模式 |
|------|--------|--------|
| **佈局** | 左右分離 | 混合排列 |
| **卡片類型** | 英文卡片 + 空白框 | 英文卡片 + 中文卡片 |
| **空白框** | ✅ 有 | ❌ 沒有 |
| **容器** | ✅ 空白框是容器 | ❌ 卡片不是容器 |
| **拖放方式** | 拖到框中 | 交換位置 |
| **視覺指示器** | 顯示在空白框上 | 顯示在英文卡片上 |
| **邏輯複雜度** | ⚠️ 複雜 | ✅ 簡單 |
| **舊有邏輯適用** | ⚠️ 需要修改 | ✅ 完全適用 |

## 6. 為什麼分離模式需要新邏輯

1. **空白框是容器**：卡片被添加到容器中，需要特殊處理
2. **視覺指示器位置不同**：需要顯示在空白框上，而不是卡片上
3. **複雜的座標系統**：容器有自己的座標系統，需要計算世界座標
4. **frameIndexToPairIdMap**：需要映射框索引到卡片 ID，因為框的順序可能被洗牌

## 7. 為什麼混合模式能保存舊有邏輯

1. **卡片結構統一**：所有卡片都是普通卡片
2. **沒有容器概念**：卡片不被添加到容器中
3. **視覺指示器邏輯通用**：可以直接在卡片上顯示
4. **簡單的邏輯流程**：直接交換位置，不需要複雜的計算

