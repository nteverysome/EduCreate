# 分離模式 vs 混合模式 - 核心差異總結

## 🎯 一句話總結

**分離模式**：英文卡片在左邊，中文空白框在右邊，卡片被拖到框中
**混合模式**：英文卡片和中文卡片混合排列，卡片可以交換位置

## 📊 快速對比表

| 特性 | 分離模式 | 混合模式 |
|------|--------|--------|
| **視覺佈局** | 左右分離 | 混合排列 |
| **左邊** | 英文卡片 | 英文卡片 |
| **右邊** | 中文空白框 | 中文卡片 |
| **拖放方式** | 拖到框中 | 交換位置 |
| **容器** | ✅ 空白框是容器 | ❌ 沒有容器 |
| **視覺指示器** | 顯示在空白框上 | 顯示在英文卡片上 |
| **邏輯複雜度** | ⚠️ 複雜 | ✅ 簡單 |
| **代碼修改** | ⚠️ 需要新邏輯 | ✅ 保存舊邏輯 |

## 🔍 詳細差異

### 1. 視覺佈局

**分離模式**：
```
左邊（英文）          右邊（中文框）
┌────────┐           ┌────────┐
│ cat    │           │ ___    │
│ 🔊     │    →      │ 貓     │
└────────┘           └────────┘
```

**混合模式**：
```
┌────────┐  ┌────────┐  ┌────────┐
│ cat    │  │ 貓     │  │ dog    │
│ 🔊     │  │ ___    │  │ 🔊     │
└────────┘  └────────┘  └────────┘
```

### 2. 卡片結構

**分離模式**：
- 左卡片：`{ pairId, text, background, isEmptyBox: false }`
- 右卡片：`{ pairId, background, isEmptyBox: true, list: [] }` ⚠️ 容器

**混合模式**：
- 英文卡片：`{ pairId, text, background, isEmptyBox: false }`
- 中文卡片：`{ pairId, text, background, isEmptyBox: false }`

### 3. 拖放邏輯

**分離模式**：
```javascript
// 1. 檢查是否在空白框上
// 2. 將卡片添加到框容器中
emptyBox.add(draggedCard);
// 3. 設置 currentFrameIndex
draggedCard.setData('currentFrameIndex', frameIndex);
```

**混合模式**：
```javascript
// 1. 檢查是否在中文卡片上
// 2. 交換卡片位置
[draggedCard.x, rightCard.x] = [rightCard.x, draggedCard.x];
[draggedCard.y, rightCard.y] = [rightCard.y, draggedCard.y];
// 3. 設置 currentFrameIndex
draggedCard.setData('currentFrameIndex', frameIndex);
```

### 4. 答案檢查

**分離模式**：
```javascript
// 遍歷所有空白框
for (let frameIndex = 0; frameIndex < this.rightEmptyBoxes.length; frameIndex++) {
  // 檢查框中是否有卡片
  const card = this.leftCards.find(c => c.getData('currentFrameIndex') === frameIndex);
  
  if (card) {
    // 在空白框上顯示勾勾或叉叉
    const emptyBox = this.rightEmptyBoxes[frameIndex];
    this.showCorrectAnswer(emptyBox, ...);
  }
}
```

**混合模式**：
```javascript
// 遍歷所有中文卡片
currentPagePairs.forEach((pair, pairIndex) => {
  // 檢查位置是否有英文卡片
  const card = this.rightCards.find(c => c.getData('currentFrameIndex') === pairIndex);
  
  if (card) {
    // 在英文卡片上顯示勾勾或叉叉
    this.showCorrectAnswer(card, ...);
  }
});
```

## 🔑 關鍵概念

### 分離模式的關鍵概念

1. **空白框是容器**
   - 卡片被添加到空白框容器中
   - 需要考慮容器的座標系統
   - 需要使用 `getWorldTransformMatrix()` 計算世界座標

2. **frameIndexToPairIdMap**
   - 映射框索引到卡片 ID
   - 因為框的順序可能被洗牌（Fisher-Yates 算法）
   - 用於驗證答案時找到正確的卡片

3. **視覺指示器在空白框上**
   - 勾勾和叉叉顯示在空白框上
   - 不是顯示在左卡片上
   - 需要特殊的邏輯來處理

### 混合模式的關鍵概念

1. **卡片交換**
   - 英文卡片和中文卡片交換位置
   - 簡單的座標交換
   - 不需要容器邏輯

2. **統一的卡片結構**
   - 所有卡片都是普通卡片
   - 都有 `background` 屬性
   - 都可以使用相同的視覺指示器邏輯

3. **視覺指示器在卡片上**
   - 勾勾和叉叉顯示在英文卡片上
   - 使用舊有的邏輯
   - 不需要特殊處理

## 💡 為什麼分離模式需要新邏輯

1. **空白框是容器**
   - 卡片被添加到容器中
   - 需要特殊的座標計算
   - 需要考慮容器的座標系統

2. **視覺指示器位置不同**
   - 需要顯示在空白框上
   - 不是顯示在左卡片上
   - 需要檢查 `isEmptyBox` 屬性

3. **複雜的邏輯流程**
   - 需要使用 `frameIndexToPairIdMap`
   - 需要檢查 `currentFrameIndex`
   - 需要遍歷所有空白框

## 💡 為什麼混合模式能保存舊有邏輯

1. **卡片結構統一**
   - 所有卡片都是普通卡片
   - 都有 `background` 屬性
   - 都可以使用相同的邏輯

2. **沒有容器概念**
   - 卡片不被添加到容器中
   - 不需要特殊的座標計算
   - 簡單的位置交換

3. **視覺指示器邏輯通用**
   - 可以直接在卡片上顯示
   - 使用舊有的 `showCorrectAnswerOnCard()` 函數
   - 不需要修改任何代碼

## 🎓 學習要點

### 分離模式的複雜性來自於

1. **容器管理**：卡片被添加到容器中，需要管理容器的狀態
2. **座標系統**：容器有自己的座標系統，需要計算世界座標
3. **視覺指示器位置**：需要顯示在容器上，而不是卡片上
4. **洗牌算法**：框的順序被洗牌，需要映射來找到正確的框

### 混合模式的簡單性來自於

1. **統一的結構**：所有卡片都是相同的結構
2. **簡單的交換**：只需要交換座標
3. **通用的邏輯**：可以使用舊有的邏輯
4. **沒有特殊概念**：沒有容器、沒有空白框

## 🚀 實踐建議

### 如果要添加新的佈局模式

1. **確定視覺佈局**：卡片如何排列？
2. **確定卡片結構**：是否需要容器？
3. **確定拖放邏輯**：如何處理拖放？
4. **確定答案檢查**：如何檢查答案？
5. **確定視覺指示器**：勾勾和叉叉顯示在哪裡？

### 如果要修改現有邏輯

1. **檢查 `this.layout`**：確定當前佈局模式
2. **根據佈局模式分支**：使用 `if (this.layout === 'separated')` 或 `if (this.layout === 'mixed')`
3. **保存舊有邏輯**：混合模式應該保存舊有邏輯
4. **添加新邏輯**：分離模式需要新邏輯
5. **測試兩種模式**：確保兩種模式都能正常工作

## 📚 相關文件

- `ANALYSIS_混合模式保存舊有邏輯.md` - 為什麼混合模式能保存舊有邏輯
- `CODE_COMPARISON_混合vs分離模式.md` - 代碼對比
- `DETAILED_COMPARISON_分離vs混合模式.md` - 詳細對比

