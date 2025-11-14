# 快速參考卡 - 容器操作速查表

## 🚀 快速查詢

### ❌ 錯誤做法
```javascript
// 只改變座標
card.x = targetX;
card.y = targetY;
```

### ✅ 正確做法
```javascript
// 完整的容器操作
if (card.parentContainer) {
    card.parentContainer.remove(card);
}
targetContainer.add(card);
card.setPosition(0, 0);
```

---

## 📋 常用代碼片段

### 1. 將物體移動到容器
```javascript
function moveToContainer(object, targetContainer) {
    if (object.parentContainer) {
        object.parentContainer.remove(object);
    }
    targetContainer.add(object);
    object.setPosition(0, 0);
}
```

### 2. 檢查物體座標系統
```javascript
function checkCoordinates(object) {
    const wm = object.getWorldTransformMatrix();
    return {
        local: { x: object.x, y: object.y },
        world: { x: wm.tx, y: wm.ty },
        hasParent: !!object.parentContainer,
        parentType: object.parentContainer?.constructor.name
    };
}
```

### 3. 驗證容器關係
```javascript
function verifyContainer(object, expectedContainer) {
    return object.parentContainer === expectedContainer &&
           object.x === 0 &&
           object.y === 0;
}
```

### 4. 保存物體狀態
```javascript
function saveObjectState(object) {
    return {
        id: object.getData('id'),
        parentContainerId: object.parentContainer?.getData('id'),
        localX: object.x,
        localY: object.y,
        visible: object.visible,
        alpha: object.alpha
    };
}
```

### 5. 恢復物體狀態
```javascript
function restoreObjectState(object, state, containerMap) {
    const container = containerMap[state.parentContainerId];
    if (container) {
        if (object.parentContainer) {
            object.parentContainer.remove(object);
        }
        container.add(object);
        object.setPosition(state.localX, state.localY);
        object.setVisible(state.visible);
        object.setAlpha(state.alpha);
    }
}
```

---

## 🎯 座標系統速查

| 情況 | 本地座標 | 世界座標 | 說明 |
|------|---------|---------|------|
| 物體不在容器中 | = 世界座標 | = 本地座標 | 座標相同 |
| 物體在容器中（正確） | (0, 0) | = 容器座標 | 物體在容器中心 |
| 物體在容器中（錯誤） | ≠ (0, 0) | ≠ 容器座標 | 物體位置錯誤 |

---

## 🔍 調試命令

### 快速檢查物體
```javascript
// 在瀏覽器控制台中執行
const card = gameScene.leftCards[0];
console.log({
    x: card.x,
    y: card.y,
    worldX: card.getWorldTransformMatrix().tx,
    worldY: card.getWorldTransformMatrix().ty,
    parent: card.parentContainer?.constructor.name
});
```

### 快速檢查容器
```javascript
const container = gameScene.rightEmptyBoxes[0];
console.log({
    x: container.x,
    y: container.y,
    worldX: container.getWorldTransformMatrix().tx,
    worldY: container.getWorldTransformMatrix().ty,
    childCount: container.list.length
});
```

### 快速驗證所有卡片
```javascript
gameScene.leftCards.forEach((card, i) => {
    const wm = card.getWorldTransformMatrix();
    console.log(`Card ${i}:`, {
        local: `(${card.x}, ${card.y})`,
        world: `(${wm.tx}, ${wm.ty})`,
        parent: card.parentContainer?.constructor.name
    });
});
```

---

## ⚠️ 常見陷阱

### 陷阱 1：忘記移除舊容器
```javascript
// ❌ 錯誤
container.add(card);

// ✅ 正確
if (card.parentContainer) {
    card.parentContainer.remove(card);
}
container.add(card);
```

### 陷阱 2：忘記設置本地座標
```javascript
// ❌ 錯誤
container.add(card);

// ✅ 正確
container.add(card);
card.setPosition(0, 0);
```

### 陷阱 3：混淆座標類型
```javascript
// ❌ 錯誤
card.x = container.getWorldTransformMatrix().tx;

// ✅ 正確
card.x = 0;  // 本地座標
```

### 陷阱 4：Tween 後忘記更新容器
```javascript
// ❌ 錯誤
this.tweens.add({
    targets: card,
    x: targetX,
    y: targetY
});

// ✅ 正確
this.tweens.add({
    targets: card,
    x: targetX,
    y: targetY,
    onComplete: () => {
        // 更新容器關係
        if (card.parentContainer !== targetContainer) {
            moveToContainer(card, targetContainer);
        }
    }
});
```

---

## 📊 決策樹

```
需要移動物體？
├─ 是否需要改變容器？
│  ├─ 是 → 使用 moveToContainer()
│  └─ 否 → 只改變座標 (card.x = x; card.y = y;)
└─ 頁面切換？
   ├─ 是 → 保存狀態 → 銷毀 → 重建 → 恢復狀態
   └─ 否 → 直接操作
```

---

## 🧪 測試檢查清單

- [ ] 物體被添加到容器中？
- [ ] 物體的本地座標是 (0, 0)？
- [ ] 物體的世界座標等於容器座標？
- [ ] 頁面切換後物體位置正確？
- [ ] Tween 動畫後容器關係正確？

---

## 📞 快速求助

### 問題：物體位置不對
**快速檢查：**
```javascript
checkCoordinates(card);  // 查看座標
verifyContainer(card, expectedContainer);  // 驗證容器
```

### 問題：頁面切換後物體消失
**快速檢查：**
```javascript
// 檢查物體是否被創建
console.log(gameScene.leftCards.length);

// 檢查物體是否在容器中
gameScene.leftCards.forEach(card => {
    console.log(card.parentContainer?.constructor.name);
});
```

### 問題：Tween 動畫後位置錯誤
**快速檢查：**
```javascript
// 動畫完成後檢查
checkCoordinates(card);
verifyContainer(card, expectedContainer);
```

---

## 🔗 相關文檔

- `ISSUE_COLLECTION_多頁面卡片座標系統一致性.md`
- `TECHNICAL_DEEP_DIVE_Phaser容器座標系統.md`
- `PRACTICE_GUIDE_多頁面遊戲開發檢查清單.md`

---

## 💾 複製粘貼模板

### 完整的容器操作模板
```javascript
// 移動物體到容器
if (card.parentContainer) {
    card.parentContainer.remove(card);
}
targetContainer.add(card);
card.setPosition(0, 0);

// 驗證
console.log('物體已移動到容器:', {
    inContainer: card.parentContainer === targetContainer,
    localCoord: `(${card.x}, ${card.y})`,
    worldCoord: `(${card.getWorldTransformMatrix().tx}, ${card.getWorldTransformMatrix().ty})`
});
```

**記住：這是標準做法，所有多頁面遊戲都應該使用！** ✅

