# Match-Up Game - 重新載入機制監控指南

## 🔍 實時監控方法

### 1. 控制台日誌監控

#### A. 監控 updateLayout() 調用

```javascript
// 在瀏覽器控制台執行
const logs = [];
const originalLog = console.log;
console.log = function(...args) {
    if (args[0]?.includes?.('updateLayout')) {
        logs.push({
            time: new Date().toLocaleTimeString(),
            message: args[0],
            stack: new Error().stack.split('\n')[2]
        });
    }
    originalLog.apply(console, args);
};

// 查看所有 updateLayout 調用
console.table(logs);
```

#### B. 監控 repositionCards() 調用

```javascript
// 在瀏覽器控制台執行
const reposLogs = [];
const originalLog = console.log;
console.log = function(...args) {
    if (args[0]?.includes?.('repositionCards')) {
        reposLogs.push({
            time: new Date().toLocaleTimeString(),
            message: args[0]
        });
    }
    originalLog.apply(console, args);
};

// 查看所有 repositionCards 調用
console.table(reposLogs);
```

#### C. 監控 scene.restart() 調用

```javascript
// 在瀏覽器控制台執行
const restartLogs = [];
const originalLog = console.log;
console.log = function(...args) {
    if (args[0]?.includes?.('scene.restart') || args[0]?.includes?.('重新開始')) {
        restartLogs.push({
            time: new Date().toLocaleTimeString(),
            message: args[0]
        });
    }
    originalLog.apply(console, args);
};

// 查看所有 restart 調用
console.table(restartLogs);
```

---

### 2. 緩存狀態監控

#### A. 檢查右側卡片順序緩存

```javascript
// 在瀏覽器控制台執行
const gameScene = cc.game.getScene('GameScene');
console.log('rightCardsOrderCache:', gameScene.rightCardsOrderCache);
console.log('rightCardsOrderCache 長度:', gameScene.rightCardsOrderCache?.length);
```

#### B. 檢查混合佈局洗牌緩存

```javascript
// 在瀏覽器控制台執行
const gameScene = cc.game.getScene('GameScene');
console.log('shuffledPairsCache:', gameScene.shuffledPairsCache);
console.log('shuffledPairsCache 長度:', gameScene.shuffledPairsCache?.length);
```

#### C. 監控緩存變化

```javascript
// 在瀏覽器控制台執行
setInterval(() => {
    const gameScene = cc.game.getScene('GameScene');
    console.log({
        time: new Date().toLocaleTimeString(),
        rightCardsOrderCache: gameScene.rightCardsOrderCache?.length || 'null',
        shuffledPairsCache: gameScene.shuffledPairsCache?.length || 'null',
        currentPage: gameScene.currentPage,
        layout: gameScene.layout
    });
}, 1000);
```

---

### 3. 事件監聽監控

#### A. 監控 Resize 事件

```javascript
// 在瀏覽器控制台執行
let resizeCount = 0;
window.addEventListener('resize', () => {
    resizeCount++;
    console.log(`Resize 事件觸發 #${resizeCount}`, {
        width: window.innerWidth,
        height: window.innerHeight,
        time: new Date().toLocaleTimeString()
    });
});
```

#### B. 監控 Fullscreen 事件

```javascript
// 在瀏覽器控制台執行
let fullscreenCount = 0;
document.addEventListener('fullscreenchange', () => {
    fullscreenCount++;
    console.log(`Fullscreen 事件觸發 #${fullscreenCount}`, {
        isFullscreen: !!document.fullscreenElement,
        time: new Date().toLocaleTimeString()
    });
});
```

#### C. 監控 Orientation 事件

```javascript
// 在瀏覽器控制台執行
let orientationCount = 0;
window.addEventListener('orientationchange', () => {
    orientationCount++;
    console.log(`Orientation 事件觸發 #${orientationCount}`, {
        orientation: window.orientation,
        time: new Date().toLocaleTimeString()
    });
});
```

#### D. 監控 Visibility 事件

```javascript
// 在瀏覽器控制台執行
let visibilityCount = 0;
document.addEventListener('visibilitychange', () => {
    visibilityCount++;
    console.log(`Visibility 事件觸發 #${visibilityCount}`, {
        hidden: document.hidden,
        time: new Date().toLocaleTimeString()
    });
});
```

---

### 4. 卡片狀態監控

#### A. 監控卡片數量

```javascript
// 在瀏覽器控制台執行
const gameScene = cc.game.getScene('GameScene');
console.log({
    leftCardsCount: gameScene.leftCards?.length,
    rightCardsCount: gameScene.rightCards?.length,
    matchedPairsCount: gameScene.matchedPairs?.size,
    totalCards: (gameScene.leftCards?.length || 0) + (gameScene.rightCards?.length || 0)
});
```

#### B. 監控卡片順序

```javascript
// 在瀏覽器控制台執行
const gameScene = cc.game.getScene('GameScene');
const rightCardIds = gameScene.rightCards?.map(card => card.pairId);
console.log('右側卡片順序:', rightCardIds);
```

#### C. 監控已配對狀態

```javascript
// 在瀏覽器控制台執行
const gameScene = cc.game.getScene('GameScene');
console.log('已配對的卡片:', Array.from(gameScene.matchedPairs));
```

---

### 5. 性能監控

#### A. 監控 updateLayout() 執行時間

```javascript
// 在 game.js 中添加
const originalUpdateLayout = this.updateLayout;
this.updateLayout = function() {
    const startTime = performance.now();
    originalUpdateLayout.call(this);
    const endTime = performance.now();
    console.log(`updateLayout 執行時間: ${(endTime - startTime).toFixed(2)}ms`);
};
```

#### B. 監控 repositionCards() 執行時間

```javascript
// 在 game.js 中添加
const originalRepositionCards = this.repositionCards;
this.repositionCards = function() {
    const startTime = performance.now();
    originalRepositionCards.call(this);
    const endTime = performance.now();
    console.log(`repositionCards 執行時間: ${(endTime - startTime).toFixed(2)}ms`);
};
```

#### C. 監控 FPS

```javascript
// 在瀏覽器控制台執行
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function measureFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        console.log(`FPS: ${fps}`);
    }
    requestAnimationFrame(measureFPS);
}

measureFPS();
```

---

### 6. 完整監控儀表板

```javascript
// 在瀏覽器控制台執行
class GameMonitor {
    constructor() {
        this.events = [];
        this.setupMonitoring();
    }

    setupMonitoring() {
        // 監控 updateLayout
        console.log('🔍 開始監控遊戲重新載入機制...');
        
        // 監控事件
        window.addEventListener('resize', () => this.logEvent('resize'));
        document.addEventListener('fullscreenchange', () => this.logEvent('fullscreen'));
        window.addEventListener('orientationchange', () => this.logEvent('orientation'));
        document.addEventListener('visibilitychange', () => this.logEvent('visibility'));
    }

    logEvent(eventType) {
        this.events.push({
            time: new Date().toLocaleTimeString(),
            event: eventType,
            rightCardsOrderCache: this.getGameScene()?.rightCardsOrderCache?.length || 'null',
            shuffledPairsCache: this.getGameScene()?.shuffledPairsCache?.length || 'null'
        });
    }

    getGameScene() {
        // 根據你的遊戲框架調整
        return window.gameScene || null;
    }

    printReport() {
        console.table(this.events);
        console.log(`總事件數: ${this.events.length}`);
    }

    clear() {
        this.events = [];
        console.log('✅ 監控數據已清除');
    }
}

// 使用
const monitor = new GameMonitor();

// 查看報告
monitor.printReport();

// 清除數據
monitor.clear();
```

---

### 7. 快速診斷命令

```javascript
// 複製以下命令到控制台，快速診斷問題

// 1. 檢查是否有不必要的 updateLayout 調用
console.log('🔍 檢查 updateLayout 調用...');
const updateLayoutCalls = [];
const originalLog = console.log;
console.log = function(...args) {
    if (args[0]?.includes?.('updateLayout')) {
        updateLayoutCalls.push(args[0]);
    }
    originalLog.apply(console, args);
};

// 2. 檢查緩存狀態
console.log('🔍 檢查緩存狀態...');
const gameScene = window.gameScene;
console.log({
    rightCardsOrderCache: gameScene?.rightCardsOrderCache?.length || 'null',
    shuffledPairsCache: gameScene?.shuffledPairsCache?.length || 'null'
});

// 3. 檢查卡片順序是否改變
console.log('🔍 檢查卡片順序...');
const rightCardIds = gameScene?.rightCards?.map(card => card.pairId);
console.log('右側卡片順序:', rightCardIds);

// 4. 檢查已配對狀態
console.log('🔍 檢查已配對狀態...');
console.log('已配對的卡片:', Array.from(gameScene?.matchedPairs || []));
```

---

## 📊 **監控指標解釋**

| 指標 | 含義 | 正常值 | 異常值 |
|------|------|--------|--------|
| updateLayout 調用次數 | 佈局重新計算次數 | 1-2 次 | > 5 次 |
| repositionCards 調用次數 | 位置調整次數 | 1-10 次 | > 20 次 |
| rightCardsOrderCache | 右側卡片順序緩存 | 有值 | null |
| shuffledPairsCache | 混合佈局洗牌緩存 | 有值 | null |
| 卡片順序變化 | 卡片是否被重新洗牌 | 不變 | 改變 |
| 已配對狀態 | 已配對的卡片數 | 遞增 | 清零 |

---

## 🎯 **常見問題診斷**

### 問題 1：縮小視窗再放大時卡片被洗牌

**診斷步驟：**
1. 打開控制台
2. 執行 `console.log(gameScene.rightCardsOrderCache)`
3. 縮小視窗
4. 再次執行 `console.log(gameScene.rightCardsOrderCache)`
5. 如果值改變，說明緩存被清除了

**解決方案：**
- 檢查是否有其他地方調用了 `updateLayout()`
- 確保 `repositionCards()` 被正確調用

### 問題 2：進入全螢幕時卡片被洗牌

**診斷步驟：**
1. 打開控制台
2. 監控 `fullscreenchange` 事件
3. 進入全螢幕
4. 檢查是否調用了 `updateLayout()`

**解決方案：**
- 修改 `handleFullscreenChange()` 使用 `repositionCards()`

### 問題 3：設備方向改變時卡片被洗牌

**診斷步驟：**
1. 打開控制台
2. 監控 `orientationchange` 事件
3. 改變設備方向
4. 檢查是否調用了 `updateLayout()`

**解決方案：**
- 修改 `handleOrientationChange()` 使用 `repositionCards()`


