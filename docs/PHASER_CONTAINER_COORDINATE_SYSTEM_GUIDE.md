# Phaser 容器座標系統完整指南

## 核心概念

### 世界座標 vs 本地座標

在 Phaser 中，有兩種座標系統：

#### 世界座標（World Coordinates）
- 相對於遊戲世界的絕對位置
- 所有遊戲對象的默認座標系統
- 範圍：(0, 0) 到 (遊戲寬度, 遊戲高度)

#### 本地座標（Local Coordinates）
- 相對於父容器的相對位置
- 當對象被添加到容器時使用
- 範圍：取決於容器的大小和原點

### 座標轉換公式

```javascript
// 世界座標 → 本地座標
localX = worldX - containerWorldX;
localY = worldY - containerWorldY;

// 本地座標 → 世界座標
worldX = localX + containerWorldX;
worldY = localY + containerWorldY;
```

### 容器原點

在 Phaser 中，容器的原點（0, 0）通常在容器的**中心**：

```javascript
// 容器的默認原點
container.setOrigin(0.5, 0.5);  // 中心

// 如果需要改變原點
container.setOrigin(0, 0);      // 左上角
container.setOrigin(1, 1);      // 右下角
```

---

## 實踐指南

### 場景 1：將對象添加到容器中心

**需求**：將卡片添加到空白框容器的中心

**解決方案**：

```javascript
// 步驟 1：計算相對座標
const cardRelativeX = card.x - emptyBox.x;
const cardRelativeY = card.y - emptyBox.y;

// 步驟 2：添加到容器
emptyBox.add(card);

// 步驟 3：設置本地座標
card.setPosition(cardRelativeX, cardRelativeY);

// 結果：卡片會顯示在相對於容器的 (cardRelativeX, cardRelativeY) 位置
```

### 場景 2：將對象添加到容器中心（簡化版）

**需求**：卡片已經通過 tween 動畫移動到容器位置，現在要添加到容器中

**解決方案**：

```javascript
// 由於卡片已經在容器位置，相對座標應該是 (0, 0)
emptyBox.add(card);
card.setPosition(0, 0);

// 結果：卡片會顯示在容器的中心
```

### 場景 3：從容器中移除對象

**需求**：將對象從容器中移除，並保持其世界位置

**解決方案**：

```javascript
// 步驟 1：獲取對象的世界座標
const worldX = card.getWorldTransformMatrix().tx;
const worldY = card.getWorldTransformMatrix().ty;

// 步驟 2：從容器中移除
container.remove(card);

// 步驟 3：設置世界座標
card.setPosition(worldX, worldY);

// 結果：對象會保持在相同的世界位置，但不再是容器的子對象
```

---

## 常見問題

### Q1：為什麼對象添加到容器後位置不對？

**原因**：沒有正確設置本地座標

**解決**：
```javascript
// ❌ 錯誤
container.add(object);  // 對象保留之前的世界座標值

// ✅ 正確
container.add(object);
object.setPosition(localX, localY);
```

### Q2：如何獲取對象的世界座標？

**方法 1**：使用 `getWorldTransformMatrix()`
```javascript
const matrix = object.getWorldTransformMatrix();
const worldX = matrix.tx;
const worldY = matrix.ty;
```

**方法 2**：使用 `getTopLeft()`
```javascript
const point = object.getTopLeft();
const worldX = point.x;
const worldY = point.y;
```

### Q3：容器的原點如何影響座標？

**示例**：
```javascript
// 容器原點在中心（默認）
container.setOrigin(0.5, 0.5);
object.setPosition(0, 0);  // 對象在容器中心

// 容器原點在左上角
container.setOrigin(0, 0);
object.setPosition(0, 0);  // 對象在容器左上角
```

---

## 調試技巧

### 1. 打印座標信息

```javascript
function printCoordinates(object, container) {
    const worldMatrix = object.getWorldTransformMatrix();
    console.log('對象座標信息:', {
        localX: object.x,
        localY: object.y,
        worldX: worldMatrix.tx,
        worldY: worldMatrix.ty,
        containerWorldX: container.x,
        containerWorldY: container.y
    });
}
```

### 2. 視覺調試

```javascript
// 在容器中心添加一個標記
const marker = this.add.circle(0, 0, 5, 0xff0000);
container.add(marker);

// 在世界座標 (100, 100) 添加一個標記
const worldMarker = this.add.circle(100, 100, 5, 0x00ff00);
```

### 3. 驗證座標轉換

```javascript
// 驗證座標轉換公式
const object = this.add.sprite(100, 100, 'texture');
const container = this.add.container(50, 50);

container.add(object);
object.setPosition(50, 50);

// 驗證
const expectedWorldX = 50 + 50;  // 100
const expectedWorldY = 50 + 50;  // 100
const actualWorldX = object.getWorldTransformMatrix().tx;
const actualWorldY = object.getWorldTransformMatrix().ty;

console.assert(expectedWorldX === actualWorldX, '世界座標 X 不匹配');
console.assert(expectedWorldY === actualWorldY, '世界座標 Y 不匹配');
```

---

## 最佳實踐

### 1. 始終驗證座標

```javascript
// 添加到容器前
console.log('添加前:', { x: object.x, y: object.y });

// 添加到容器
container.add(object);
object.setPosition(localX, localY);

// 添加後驗證
console.log('添加後:', { 
    localX: object.x, 
    localY: object.y,
    worldX: object.getWorldTransformMatrix().tx,
    worldY: object.getWorldTransformMatrix().ty
});
```

### 2. 使用常量定義容器原點

```javascript
const CONTAINER_ORIGINS = {
    CENTER: { x: 0.5, y: 0.5 },
    TOP_LEFT: { x: 0, y: 0 },
    TOP_RIGHT: { x: 1, y: 0 },
    BOTTOM_LEFT: { x: 0, y: 1 },
    BOTTOM_RIGHT: { x: 1, y: 1 }
};

// 使用
container.setOrigin(CONTAINER_ORIGINS.CENTER.x, CONTAINER_ORIGINS.CENTER.y);
```

### 3. 創建輔助函數

```javascript
// 將對象添加到容器中心
function addToContainerCenter(container, object) {
    const relativeX = object.x - container.x;
    const relativeY = object.y - container.y;
    container.add(object);
    object.setPosition(relativeX, relativeY);
}

// 使用
addToContainerCenter(emptyBox, card);
```

---

## 相關資源

- [Phaser 官方文檔 - Container](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Container.html)
- [Phaser 官方文檔 - Transform Matrix](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Transform.html)
- `GAME_ISSUES_AND_SOLUTIONS_REFERENCE.md` - 遊戲問題集與解決方案

---

## 版本歷史

- **v1.0** (2025-11-12)：初始版本，包含核心概念、實踐指南和常見問題

