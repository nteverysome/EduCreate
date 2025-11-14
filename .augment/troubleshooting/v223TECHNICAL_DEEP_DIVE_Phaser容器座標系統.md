# 技術深度分析 - Phaser 容器座標系統

## 🎯 核心問題

在 Phaser 3 中，**物體的座標系統取決於它是否被添加到容器中**。

---

## 📊 座標系統對比

### 情況 1：物體不在容器中

```javascript
const card = this.add.sprite(100, 100, 'card');

console.log({
    x: card.x,                              // 100
    y: card.y,                              // 100
    worldX: card.getWorldTransformMatrix().tx,  // 100
    worldY: card.getWorldTransformMatrix().ty,  // 100
    parentContainer: card.parentContainer   // null
});
```

**特點：** x/y = worldX/worldY（座標相同）

---

### 情況 2：物體在容器中（正確方式）

```javascript
const container = this.add.container(500, 500);
const card = this.add.sprite(0, 0, 'card');
container.add(card);

console.log({
    x: card.x,                              // 0 (本地座標)
    y: card.y,                              // 0
    worldX: card.getWorldTransformMatrix().tx,  // 500 (世界座標)
    worldY: card.getWorldTransformMatrix().ty,  // 500
    parentContainer: card.parentContainer   // Container
});
```

**特點：** x/y ≠ worldX/worldY（座標不同）

---

### 情況 3：物體在容器中（錯誤方式）

```javascript
const container = this.add.container(500, 500);
const card = this.add.sprite(100, 100, 'card');
container.add(card);  // ❌ 沒有設置本地座標

console.log({
    x: card.x,                              // 100 (保留舊座標)
    y: card.y,                              // 100
    worldX: card.getWorldTransformMatrix().tx,  // 600 (100 + 500)
    worldY: card.getWorldTransformMatrix().ty,  // 600
    parentContainer: card.parentContainer   // Container
});
// ❌ 卡片顯示在 (600, 600)，不是容器中心 (500, 500)！
```

**特點：** 卡片位置錯誤！

---

## 🔧 正確的容器操作流程

### 步驟 1：創建容器
```javascript
const emptyBox = this.add.container(1196.65, 276.1225);
emptyBox.setData('pairId', 1);
```

### 步驟 2：創建卡片
```javascript
const card = this.add.sprite(662.12, 152.78, 'card');
card.setData('pairId', 1);
```

### 步驟 3：移動卡片到容器（正確方式）
```javascript
// ❌ 錯誤：只改變座標
card.x = emptyBox.x;
card.y = emptyBox.y;

// ✅ 正確：完整的容器操作
if (card.parentContainer) {
    card.parentContainer.remove(card);
}
emptyBox.add(card);
card.setPosition(0, 0);
```

---

## 🎮 Match-up Game 中的應用

### 問題場景

```
第1頁：
  leftCards[0] → 位置 (662.12, 152.78)
  rightEmptyBoxes[0] → 位置 (1196.65, 276.1225)

用戶拖拽 leftCards[0] 到 rightEmptyBoxes[0]
  → 卡片被添加到 rightEmptyBoxes[0] 容器中
  → 卡片本地座標設置為 (0, 0)
  → 卡片顯示在 (1196.65, 276.1225) ✅

頁面切換到第2頁：
  → 所有卡片被銷毀
  → 新的卡片被創建

返回第1頁：
  → 新的卡片被創建
  → 需要恢復卡片到容器中

❌ v220.0 做法：
  → 只改變卡片座標
  → 卡片不在容器中
  → 座標系統混亂

✅ v223.0 做法：
  → 將卡片添加到容器中
  → 設置本地座標為 (0, 0)
  → 座標系統一致
```

---

## 📈 座標系統流程圖

```
創建卡片
  ↓
卡片座標 = (662.12, 152.78)
  ↓
用戶拖拽到空白框
  ↓
移除舊父容器 ← 關鍵！
  ↓
添加到新容器
  ↓
設置本地座標 = (0, 0) ← 關鍵！
  ↓
卡片顯示在容器中心 ✅
  ↓
頁面切換
  ↓
卡片被銷毀
  ↓
新卡片被創建
  ↓
恢復卡片到容器（重複上述步驟）
  ↓
卡片顯示在正確位置 ✅
```

---

## 🐛 常見錯誤

### 錯誤 1：忘記移除舊父容器
```javascript
// ❌ 錯誤
emptyBox.add(card);  // 卡片可能還在舊容器中！

// ✅ 正確
if (card.parentContainer) {
    card.parentContainer.remove(card);
}
emptyBox.add(card);
```

### 錯誤 2：忘記設置本地座標
```javascript
// ❌ 錯誤
emptyBox.add(card);  // 卡片保留舊座標

// ✅ 正確
emptyBox.add(card);
card.setPosition(0, 0);
```

### 錯誤 3：混淆世界座標和本地座標
```javascript
// ❌ 錯誤
card.x = emptyBox.getWorldTransformMatrix().tx;
card.y = emptyBox.getWorldTransformMatrix().ty;

// ✅ 正確
card.x = 0;  // 本地座標
card.y = 0;
```

---

## 🧪 調試技巧

### 檢查物體座標系統
```javascript
function debugObjectCoordinates(object, name) {
    const worldMatrix = object.getWorldTransformMatrix();
    console.log(`${name}:`, {
        localX: object.x,
        localY: object.y,
        worldX: worldMatrix.tx,
        worldY: worldMatrix.ty,
        hasParent: !!object.parentContainer,
        parentType: object.parentContainer?.constructor.name
    });
}

// 使用
debugObjectCoordinates(card, 'Card');
debugObjectCoordinates(emptyBox, 'EmptyBox');
```

### 驗證容器關係
```javascript
function verifyContainerRelationship(card, container) {
    const isInContainer = card.parentContainer === container;
    const localCoordOK = card.x === 0 && card.y === 0;
    const worldCoordOK = 
        card.getWorldTransformMatrix().tx === container.getWorldTransformMatrix().tx &&
        card.getWorldTransformMatrix().ty === container.getWorldTransformMatrix().ty;
    
    return {
        isInContainer,
        localCoordOK,
        worldCoordOK,
        allOK: isInContainer && localCoordOK && worldCoordOK
    };
}
```

---

## 📚 Phaser 3 官方參考

- **Container 文檔：** https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Container.html
- **座標系統：** https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html
- **Transform Matrix：** https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Transform.html

---

## ✅ 最佳實踐

1. **始終使用容器** - 為相關物體創建容器
2. **明確的座標系統** - 清楚地區分本地座標和世界座標
3. **完整的操作** - 移除舊容器 → 添加到新容器 → 設置座標
4. **充分的調試** - 使用調試函數驗證座標系統
5. **單元測試** - 測試容器操作的正確性

