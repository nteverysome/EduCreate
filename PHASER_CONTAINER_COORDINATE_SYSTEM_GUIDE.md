# Phaser 容器座標系統完全指南

## 📌 核心概念

### 1. 世界座標 vs 相對座標

```javascript
// 世界座標：相對於整個遊戲場景
const worldX = 500;
const worldY = 300;

// 相對座標：相對於容器中心
const relativeX = 100;
const relativeY = 50;
```

### 2. 容器的座標系統

```javascript
// 創建容器
const container = this.add.container(500, 300);

// 容器中心：(0, 0)
// 容器右邊：正 X
// 容器左邊：負 X
// 容器下方：正 Y
// 容器上方：負 Y

// 添加子元素（使用相對座標）
const element = this.add.text(0, 0, 'Hello');
container.add(element);  // 元素在容器中心

const element2 = this.add.text(100, -50, 'World');
container.add(element2);  // 元素在容器右上方
```

---

## ⚠️ 常見陷阱

### 陷阱 1：容器渲染問題

```javascript
// ❌ 問題代碼
const container = this.add.container(500, 300);
const mark = this.add.text(0, 0, '✗', { fontSize: '64px' });
container.add(mark);

// 問題：
// - mark 使用相對座標 (0, 0)
// - 應該在容器中心 (500, 300)
// - 但有時候會出現渲染問題
// - 特別是當容器有複雜的子元素時

// ✅ 解決方案
const worldX = 500 + 0;  // 容器 X + 相對 X
const worldY = 300 + 0;  // 容器 Y + 相對 Y
const mark = this.add.text(worldX, worldY, '✗', { fontSize: '64px' });
// 直接在場景中渲染，不添加到容器中
```

### 陷阱 2：座標計算錯誤

```javascript
// ❌ 錯誤的座標計算
const container = this.add.container(500, 300);
const background = { width: 200, height: 100 };

// 想要在背景右上角放置標記
const relativeX = background.width / 2 - 32;   // 68
const relativeY = -background.height / 2 + 32; // -18

const mark = this.add.text(relativeX, relativeY, '✗');
container.add(mark);

// 問題：mark 的世界座標是 (500 + 68, 300 - 18) = (568, 282)
// 但如果容器有其他複雜的子元素，渲染可能不正確

// ✅ 正確的做法
const worldX = 500 + background.width / 2 - 32;
const worldY = 300 - background.height / 2 + 32;
const mark = this.add.text(worldX, worldY, '✗');
// 直接在場景中渲染
```

### 陷阱 3：深度設置不當

```javascript
// ❌ 深度太低
const mark = this.add.text(x, y, '✗');
mark.setDepth(1);  // 可能被其他元素遮擋

// ✅ 深度設置足夠高
const mark = this.add.text(x, y, '✗');
mark.setDepth(2000);  // 確保在最上方
```

---

## 🛠️ 最佳實踐

### 1. 視覺反饋元素（標記、指示器）

```javascript
// 推薦：直接在場景中渲染
function showMark(containerX, containerY, offsetX, offsetY, text, color) {
    const worldX = containerX + offsetX;
    const worldY = containerY + offsetY;
    
    const mark = this.add.text(worldX, worldY, text, {
        fontSize: '80px',
        color: color,
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    mark.setOrigin(0.5);
    mark.setDepth(2000);
    
    return mark;
}
```

### 2. 動態內容（隨容器移動）

```javascript
// 推薦：添加到容器中
function addDynamicContent(container, content) {
    // 使用相對座標
    content.setPosition(0, 0);
    container.add(content);
    
    // 內容會隨容器移動
}
```

### 3. 座標轉換工具函數

```javascript
// 相對座標 → 世界座標
function toWorldCoordinates(containerX, containerY, relativeX, relativeY) {
    return {
        x: containerX + relativeX,
        y: containerY + relativeY
    };
}

// 世界座標 → 相對座標
function toRelativeCoordinates(containerX, containerY, worldX, worldY) {
    return {
        x: worldX - containerX,
        y: worldY - containerY
    };
}

// 使用示例
const world = toWorldCoordinates(500, 300, 100, -50);
console.log(world);  // { x: 600, y: 250 }
```

---

## 📊 決策樹

```
需要顯示視覺元素？
│
├─ 是否需要隨容器移動？
│  │
│  ├─ 是 → 添加到容器中（使用相對座標）
│  │       但要確保容器渲染正常
│  │
│  └─ 否 → 直接在場景中渲染（使用世界座標）
│          ✅ 推薦用於標記、指示器、反饋
│
└─ 是否是複雜的視覺效果？
   │
   ├─ 是 → 考慮使用 Graphics 或 Sprite
   │
   └─ 否 → 使用 Text 或 Rectangle
```

---

## 🔍 調試技巧

### 1. 打印座標信息

```javascript
function debugCoordinates(element, label) {
    console.log(`${label}:`, {
        x: element.x,
        y: element.y,
        depth: element.depth,
        visible: element.visible,
        alpha: element.alpha,
        parent: element.parentContainer ? 'container' : 'scene'
    });
}
```

### 2. 視覺調試

```javascript
// 在座標位置繪製調試點
function drawDebugPoint(scene, x, y, color = 0xff0000) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x, y, 5);
    graphics.setDepth(9999);
    return graphics;
}

// 使用示例
drawDebugPoint(this, worldX, worldY, 0x00ff00);  // 綠色點
```

### 3. 邊界框調試

```javascript
// 繪製容器邊界
function drawContainerBounds(scene, container) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xff0000);
    graphics.strokeRect(
        container.x - container.width / 2,
        container.y - container.height / 2,
        container.width,
        container.height
    );
    graphics.setDepth(9999);
}
```

---

## ✅ 檢查清單

在添加視覺元素時，檢查以下項目：

- [ ] 元素是否被創建？
- [ ] 元素是否被添加到正確的容器/場景？
- [ ] 座標是否正確（世界座標 vs 相對座標）？
- [ ] 深度是否足夠高？
- [ ] 元素是否可見（alpha > 0）？
- [ ] 元素的大小是否足夠大？
- [ ] 顏色對比度是否足夠？
- [ ] 字體大小是否足夠大？

---

## 📚 參考資源

- [Phaser 3 官方文檔 - Container](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Container.html)
- [Phaser 3 官方文檔 - Text](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Text.html)
- [Phaser 3 座標系統](https://photonstorm.github.io/phaser3-docs/Phaser.Math.Vector2.html)

---

## 🎯 總結

**何時使用容器的 add() 方法**：
- 內容需要隨容器移動
- 內容是容器的邏輯子元素
- 需要簡化座標管理

**何時直接在場景中渲染**：
- 視覺反饋元素（標記、指示器）
- 不需要隨容器移動
- 需要確保穩定的渲染
- ✅ **推薦用於遊戲反饋系統**

