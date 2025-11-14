# 實踐指南 - 多頁面遊戲開發檢查清單

## 🎯 目的

為開發新的多頁面遊戲提供檢查清單，避免重複 Match-up Game 中遇到的座標系統問題。

---

## 📋 開發階段檢查清單

### 第 1 階段：架構設計

- [ ] **確認遊戲是否多頁面**
  - 如果是，進行以下檢查
  - 如果否，跳過此文檔

- [ ] **確認物體管理方式**
  - [ ] 使用容器系統？
  - [ ] 使用精靈組？
  - [ ] 使用其他方式？

- [ ] **規劃頁面切換流程**
  - [ ] 頁面切換時是否銷毀物體？
  - [ ] 頁面切換時是否重新創建物體？
  - [ ] 如何保存物體狀態？

### 第 2 階段：物體創建

- [ ] **為相關物體創建容器**
  ```javascript
  // 例子：Match-up Game
  this.leftCardsContainer = this.add.container(leftX, leftY);
  this.rightEmptyBoxesContainer = this.add.container(rightX, rightY);
  ```

- [ ] **明確定義座標系統**
  - [ ] 本地座標用於容器內物體
  - [ ] 世界座標用於容器本身

- [ ] **為物體添加元數據**
  ```javascript
  card.setData('pairId', 1);
  card.setData('type', 'question');
  ```

### 第 3 階段：物體移動

- [ ] **使用完整的容器操作**
  ```javascript
  // ✅ 正確方式
  if (card.parentContainer) {
      card.parentContainer.remove(card);
  }
  targetContainer.add(card);
  card.setPosition(0, 0);
  ```

- [ ] **避免只改變座標**
  ```javascript
  // ❌ 錯誤方式
  card.x = targetX;
  card.y = targetY;
  ```

- [ ] **Tween 動畫後確認容器關係**
  ```javascript
  this.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      onComplete: () => {
          // 動畫完成後，確認容器關係
          if (card.parentContainer !== targetContainer) {
              // 修正容器關係
          }
      }
  });
  ```

### 第 4 階段：頁面切換

- [ ] **保存物體狀態**
  ```javascript
  savePageState(pageIndex) {
      this.pageStates[pageIndex] = {
          cardPositions: this.cards.map(card => ({
              pairId: card.getData('pairId'),
              parentContainerId: card.parentContainer?.getData('id'),
              localX: card.x,
              localY: card.y
          }))
      };
  }
  ```

- [ ] **恢復物體狀態**
  ```javascript
  restorePageState(pageIndex) {
      const state = this.pageStates[pageIndex];
      state.cardPositions.forEach(pos => {
          const card = this.cards.find(c => c.getData('pairId') === pos.pairId);
          const container = this.containers.find(c => c.getData('id') === pos.parentContainerId);
          
          if (card && container) {
              if (card.parentContainer) {
                  card.parentContainer.remove(card);
              }
              container.add(card);
              card.setPosition(pos.localX, pos.localY);
          }
      });
  }
  ```

### 第 5 階段：調試和驗證

- [ ] **添加調試日誌**
  ```javascript
  console.log('物體座標系統:', {
      objectId: object.getData('id'),
      localX: object.x,
      localY: object.y,
      worldX: object.getWorldTransformMatrix().tx,
      worldY: object.getWorldTransformMatrix().ty,
      parentContainer: object.parentContainer?.constructor.name
  });
  ```

- [ ] **驗證座標一致性**
  ```javascript
  function verifyCoordinateConsistency(object, expectedContainer) {
      const inCorrectContainer = object.parentContainer === expectedContainer;
      const localCoordOK = object.x === 0 && object.y === 0;
      
      if (!inCorrectContainer || !localCoordOK) {
          console.warn('座標系統不一致！', {
              inCorrectContainer,
              localCoordOK
          });
          return false;
      }
      return true;
  }
  ```

- [ ] **測試頁面切換**
  - [ ] 進入第1頁
  - [ ] 移動物體
  - [ ] 進入第2頁
  - [ ] 返回第1頁
  - [ ] 驗證物體位置正確

---

## 🎮 遊戲類型特定檢查

### 配對遊戲（Match-up）
- [ ] 卡片被拖拽到空白框時，是否添加到容器中？
- [ ] 頁面切換後，卡片是否恢復到正確的容器中？
- [ ] Show All Answers 功能是否正確處理容器關係？

### 排序遊戲（Sort）
- [ ] 物體被排序時，是否改變容器關係？
- [ ] 排序完成後，物體的座標系統是否一致？

### 拖拽遊戲（Drag）
- [ ] 拖拽開始時，是否保存原始容器？
- [ ] 拖拽結束時，是否恢復或更新容器關係？

### 分類遊戲（Classify）
- [ ] 物體被分類時，是否添加到新的容器中？
- [ ] 分類完成後，物體的位置是否正確？

---

## 🧪 測試用例

### 測試 1：基本容器操作
```javascript
test('物體應該被正確添加到容器中', () => {
    const container = scene.add.container(100, 100);
    const sprite = scene.add.sprite(0, 0, 'test');
    
    container.add(sprite);
    sprite.setPosition(0, 0);
    
    expect(sprite.parentContainer).toBe(container);
    expect(sprite.x).toBe(0);
    expect(sprite.y).toBe(0);
});
```

### 測試 2：頁面切換
```javascript
test('頁面切換後物體應該恢復到正確位置', () => {
    // 第1頁
    const card = createCard(1);
    const container = createContainer(1);
    moveCardToContainer(card, container);
    
    // 保存狀態
    const state = savePageState();
    
    // 銷毀物體
    destroyAllObjects();
    
    // 重新創建物體
    recreateAllObjects();
    
    // 恢復狀態
    restorePageState(state);
    
    // 驗證
    expect(card.parentContainer).toBe(container);
    expect(card.x).toBe(0);
    expect(card.y).toBe(0);
});
```

### 測試 3：座標一致性
```javascript
test('物體的世界座標應該等於容器座標', () => {
    const container = scene.add.container(500, 500);
    const sprite = scene.add.sprite(0, 0, 'test');
    
    container.add(sprite);
    sprite.setPosition(0, 0);
    
    const worldMatrix = sprite.getWorldTransformMatrix();
    expect(worldMatrix.tx).toBe(500);
    expect(worldMatrix.ty).toBe(500);
});
```

---

## 📊 常見問題排查

### 問題：物體位置不正確
**檢查清單：**
- [ ] 物體是否在正確的容器中？
- [ ] 物體的本地座標是否正確？
- [ ] 容器的世界座標是否正確？

### 問題：頁面切換後物體消失
**檢查清單：**
- [ ] 物體狀態是否被保存？
- [ ] 物體是否被正確重新創建？
- [ ] 物體是否被添加到正確的容器中？

### 問題：Tween 動畫後物體位置錯誤
**檢查清單：**
- [ ] 動畫完成後是否更新了容器關係？
- [ ] 動畫是否改變了物體的父容器？
- [ ] 動畫完成後是否設置了正確的本地座標？

---

## 📚 相關文檔

- `ISSUE_COLLECTION_多頁面卡片座標系統一致性.md` - 問題集
- `TECHNICAL_DEEP_DIVE_Phaser容器座標系統.md` - 技術深度分析
- `FIX_v193.0_卡片本地座標修復.md` - 原始修復文檔

---

## ✅ 完成檢查

在開始開發新遊戲前，確保：

- [ ] 已閱讀本文檔
- [ ] 已閱讀技術深度分析文檔
- [ ] 已理解容器座標系統
- [ ] 已準備好調試工具
- [ ] 已計劃好測試用例

**祝你開發順利！** 🚀

