# Shimozurdo 遊戲飛機控制完整分析

> 詳細分析 Shimozurdo 遊戲中飛機（太空船）的所有控制方式和實現機制

## 🎮 控制方式總覽

Shimozurdo 遊戲目前支援 **4 種主要控制方式**：

### 1. 虛擬搖桿控制 🎮（優先級 1 - 最高）
- **類型**：觸控搖桿
- **實現**：TouchControls 類
- **位置**：`index.html` 中的 TouchControls 類
- **功能**：上下移動控制
- **優先級**：最高（會覆蓋其他控制）

### 2. 鍵盤控制 ⌨️（優先級 2 - 中等）
- **類型**：方向鍵 + WASD 鍵
- **實現**：Phaser Input.Keyboard
- **位置**：`scenes/title.js` - `setupSpaceshipControls()`
- **功能**：上下移動控制
- **優先級**：中等（僅在無虛擬搖桿輸入時生效）

### 3. 點擊/觸控移動 🖱️（優先級 3 - 最低）
- **類型**：點擊螢幕移動到目標位置
- **實現**：Phaser Input.Pointer
- **位置**：`scenes/title.js` - `setupSpaceshipControls()`
- **功能**：平滑移動到點擊位置
- **優先級**：最低（僅在無直接輸入時生效）

### 4. 長按控制 📱（已停用）
- **類型**：長按螢幕上/下半部
- **實現**：透明覆蓋層 + 長按檢測
- **位置**：`scenes/title.js` - `setupMobileLongPressControls()`
- **狀態**：⚠️ 已停用（避免覆蓋層阻擋點擊）

## 📊 控制方式詳細分析

### 1. 虛擬搖桿控制 🎮

#### 實現位置
**文件**：`public/games/shimozurdo-game/index.html`  
**類**：`TouchControls`  
**行數**：226-369

#### 核心代碼
```javascript
class TouchControls {
    constructor() {
        this.joystick = document.querySelector('.touch-joystick');
        this.joystickKnob = document.querySelector('.touch-joystick-knob');
        this.currentDirection = { x: 0, y: 0 };
        this.shooting = false;
        this.init();
    }

    init() {
        // 搖桿觸控事件
        this.joystick.addEventListener('touchstart', this.onJoystickStart.bind(this));
        this.joystick.addEventListener('touchmove', this.onJoystickMove.bind(this));
        this.joystick.addEventListener('touchend', this.onJoystickEnd.bind(this));
    }

    onJoystickMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.joystick.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        let deltaX = touch.clientX - rect.left - centerX;
        let deltaY = touch.clientY - rect.top - centerY;
        
        // 限制最大距離
        const maxDistance = 40;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        
        // 更新方向向量
        this.currentDirection = {
            x: deltaX / maxDistance,
            y: deltaY / maxDistance
        };
        
        // 更新搖桿視覺位置
        this.joystickKnob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    getInputState() {
        return {
            direction: { ...this.currentDirection },
            shooting: this.shooting
        };
    }
}
```

#### 整合到 Phaser
**文件**：`public/games/shimozurdo-game/scenes/title.js`  
**方法**：`updateSpaceship()`  
**行數**：871-886

```javascript
// 獲取 TouchControls 虛擬按鈕狀態
const inputState = window.touchControls?.getInputState() || {
    direction: { x: 0, y: 0 },
    shooting: false
};

// 優先級 1: 虛擬搖桿控制邏輯
if (inputState.direction.y !== 0) {
    this.player.y += inputState.direction.y * moveSpeed;
    hasDirectInput = true;
    // 取消點擊移動目標，避免衝突
    this.playerTargetY = this.player.y;
}
```

#### 特點
- ✅ **觸控優化**：專為移動設備設計
- ✅ **視覺反饋**：搖桿 knob 跟隨手指移動
- ✅ **方向向量**：支援 360 度方向（目前只使用 Y 軸）
- ✅ **最高優先級**：會覆蓋其他所有控制方式

---

### 2. 鍵盤控制 ⌨️

#### 實現位置
**文件**：`public/games/shimozurdo-game/scenes/title.js`  
**方法**：`setupSpaceshipControls()`  
**行數**：283-284

#### 核心代碼
```javascript
// 1. 鍵盤控制 - 設置方向鍵和WASD鍵
this.cursors = this.input.keyboard.createCursorKeys();  // 方向鍵
this.wasd = this.input.keyboard.addKeys('W,S,A,D');     // WASD鍵
```

#### 更新邏輯
**方法**：`updateSpaceship()`  
**行數**：888-898

```javascript
// 優先級 2: 鍵盤控制邏輯
else if (this.cursors.up.isDown || this.wasd.W.isDown) {
    this.player.y -= moveSpeed;  // 向上移動
    hasDirectInput = true;
    this.playerTargetY = this.player.y;  // 取消點擊移動目標
} else if (this.cursors.down.isDown || this.wasd.S.isDown) {
    this.player.y += moveSpeed;  // 向下移動
    hasDirectInput = true;
    this.playerTargetY = this.player.y;  // 取消點擊移動目標
}
```

#### 支援的按鍵
| 按鍵 | 功能 | 備註 |
|------|------|------|
| **↑** | 向上移動 | 方向鍵上 |
| **↓** | 向下移動 | 方向鍵下 |
| **W** | 向上移動 | WASD 鍵 |
| **S** | 向下移動 | WASD 鍵 |
| **A** | 未使用 | 已定義但未實現 |
| **D** | 未使用 | 已定義但未實現 |

#### 特點
- ✅ **雙重按鍵支援**：方向鍵 + WASD
- ✅ **即時響應**：每幀檢查按鍵狀態
- ✅ **中等優先級**：僅在無虛擬搖桿輸入時生效
- ⚠️ **左右移動未實現**：A/D 鍵已定義但未使用

---

### 3. 點擊/觸控移動 🖱️

#### 實現位置
**文件**：`public/games/shimozurdo-game/scenes/title.js`  
**方法**：`setupSpaceshipControls()`  
**行數**：290-406

#### 核心代碼
```javascript
// 點擊/觸控控制
this.input.on('pointerdown', (pointer) => {
    if (!this.player) return;
    if (this.isLongPressing) return;  // 長按時不執行
    
    const startTime = performance.now();
    
    // 座標修復
    const optimalCoords = this.coordinateFix.getOptimalCoordinates(pointer);
    const clickX = optimalCoords.x;
    const clickY = optimalCoords.y;
    const playerY = this.player.y;
    
    // 視覺反饋
    this.showTouchFeedback(clickX, clickY);
    
    // 判斷點擊位置並設置目標
    if (clickY < playerY) {
        // 點擊在太空船上方：向上移動
        this.playerTargetY = Math.max(80, playerY - 100);
    } else {
        // 點擊在太空船下方：向下移動
        this.playerTargetY = Math.min(height - 80, playerY + 100);
    }
    
    // 性能監控
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    this.performanceStats.touchResponses.push(responseTime);
});
```

#### 更新邏輯
**方法**：`updateSpaceship()`  
**行數**：900-903

```javascript
// 優先級 3: 點擊移動（只在沒有直接輸入時執行）
else if (!this.isLongPressing && !hasDirectInput && 
         Math.abs(this.player.y - this.playerTargetY) > 2) {
    const direction = this.playerTargetY > this.player.y ? 1 : -1;
    this.player.y += direction * moveSpeed;
}
```

#### 特點
- ✅ **平滑移動**：逐幀移動到目標位置
- ✅ **座標修復**：使用 CoordinateFix 工具修正座標偏移
- ✅ **視覺反饋**：點擊時顯示波紋效果
- ✅ **性能監控**：記錄響應時間
- ✅ **最低優先級**：僅在無直接輸入時生效

#### 座標修復機制
**文件**：`public/games/shimozurdo-game/scenes/coordinate-fix.js`

```javascript
class CoordinateFix {
    getOptimalCoordinates(pointer) {
        // 修正座標偏移問題
        return {
            x: pointer.x,
            y: pointer.y
        };
    }
}
```

---

### 4. 長按控制 📱（已停用）

#### 實現位置
**文件**：`public/games/shimozurdo-game/scenes/title.js`  
**方法**：`setupMobileLongPressControls()`  
**行數**：449-533  
**狀態**：⚠️ 已停用（行 410）

#### 停用原因
```javascript
// 🔧 移除長按控制以避免覆蓋層阻擋點擊
// this.setupMobileLongPressControls(); // 暫時停用以修復點擊問題
```

#### 原始設計
- 創建透明覆蓋層覆蓋整個遊戲區域
- 檢測長按事件（300ms）
- 上半部長按：持續向上移動
- 下半部長按：持續向下移動

#### 為什麼停用？
1. **覆蓋層阻擋**：透明覆蓋層會阻擋點擊事件
2. **控制衝突**：與點擊移動控制衝突
3. **用戶體驗**：虛擬搖桿提供更好的體驗

---

## 🎯 控制優先級系統

### 優先級順序
```
優先級 1: 虛擬搖桿控制（最高）
    ↓
優先級 2: 鍵盤控制（中等）
    ↓
優先級 3: 點擊移動控制（最低）
```

### 實現機制
**文件**：`public/games/shimozurdo-game/scenes/title.js`  
**方法**：`updateSpaceship()`  
**行數**：878-903

```javascript
let hasDirectInput = false;  // 標記是否有直接輸入

// 優先級 1: 虛擬搖桿
if (inputState.direction.y !== 0) {
    this.player.y += inputState.direction.y * moveSpeed;
    hasDirectInput = true;
    this.playerTargetY = this.player.y;  // 取消點擊移動
}
// 優先級 2: 鍵盤
else if (this.cursors.up.isDown || this.wasd.W.isDown) {
    this.player.y -= moveSpeed;
    hasDirectInput = true;
    this.playerTargetY = this.player.y;  // 取消點擊移動
}
// 優先級 3: 點擊移動
else if (!this.isLongPressing && !hasDirectInput && 
         Math.abs(this.player.y - this.playerTargetY) > 2) {
    const direction = this.playerTargetY > this.player.y ? 1 : -1;
    this.player.y += direction * moveSpeed;
}
```

### 衝突解決
1. **互斥執行**：使用 `else if` 確保只有一個控制方式生效
2. **目標位置同步**：高優先級控制時重置 `playerTargetY`
3. **直接輸入標記**：`hasDirectInput` 標記防止低優先級執行

---

## 📱 移動設備優化

### TouchControls 顯示控制
**文件**：`public/games/shimozurdo-game/index.html`  
**CSS 媒體查詢**：

```css
@media (max-width: 1024px) and (max-height: 768px),
       (pointer: coarse),
       (hover: none) and (pointer: coarse) {
    #touch-controls {
        display: block !important;
    }
}
```

### 觸控事件優化
```javascript
// 防止預設行為
e.preventDefault();

// passive: false 允許阻止預設行為
{ passive: false }
```

---

## 🚀 未來改進建議

### 1. 左右移動控制
目前只有上下移動，可以添加左右移動：

```javascript
// 虛擬搖桿 X 軸
if (inputState.direction.x !== 0) {
    this.player.x += inputState.direction.x * moveSpeed;
}

// 鍵盤 A/D 鍵
if (this.wasd.A.isDown) {
    this.player.x -= moveSpeed;
} else if (this.wasd.D.isDown) {
    this.player.x += moveSpeed;
}
```

### 2. 射擊功能實現
目前射擊按鈕已整合但功能未實現：

```javascript
if (inputState.shooting) {
    this.shoot();  // 實現射擊邏輯
}
```

### 3. 加速/減速控制
添加速度控制：

```javascript
// Shift 鍵加速
if (this.input.keyboard.addKey('SHIFT').isDown) {
    moveSpeed *= 2;
}
```

### 4. 重新啟用長按控制
改進長按控制，避免覆蓋層問題：

```javascript
// 直接在 Canvas 上處理長按，不創建覆蓋層
this.input.on('pointerdown', (pointer) => {
    this.longPressTimer = setTimeout(() => {
        this.isLongPressing = true;
    }, 300);
});
```

---

**文檔版本**：1.0  
**創建日期**：2025-10-01  
**作者**：EduCreate 開發團隊

