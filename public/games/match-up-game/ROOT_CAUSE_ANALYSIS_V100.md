# 根本原因分析 - 為什麼 v99.0 修復後仍然重新載入

## 🔴 **用戶報告**

即使在 v99.0 修復後，仍然存在：
- ❌ 換標籤就重新載入詞彙
- ❌ 縮小到工作列或換分頁就重新載入詞彙

---

## 🔍 **深度分析**

### 第一步：回顧 v99.0 修復

v99.0 修復了：
1. ✅ 移除 ResponsiveManager 初始化
2. ✅ 修改 handleFullscreenChange 改為 repositionCards
3. ✅ 修改 handleOrientationChange 改為 repositionCards

### 第二步：發現的遺漏

在代碼審查中發現了 **3 個遺漏的觸發點**：

#### 遺漏 1：handleResize 方法（第 1256-1260 行）
```javascript
handleResize(gameSize) {
    console.log('🎮 GameScene: handleResize 觸發', gameSize);
    // 螢幕尺寸改變時重新佈局
    this.updateLayout();  // ❌ 仍在調用 updateLayout
}
```

**問題：** 雖然這個方法沒有被直接使用，但代碼仍然存在，可能被意外調用。

#### 遺漏 2：goToNextPage 方法（第 6042-6058 行）
```javascript
goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        // ...
        this.updateLayout();  // ❌ 仍在調用 updateLayout
    }
}
```

**問題：** 進入下一頁時仍然調用 updateLayout()，導致重新載入。

#### 遺漏 3：create 方法中的初始化（第 760-761 行）
```javascript
console.log('🎮 GameScene: 調用 updateLayout');
this.updateLayout();  // ❌ 場景初始化時調用
console.log('🎮 GameScene: updateLayout 完成');
```

**問題：** 場景初始化時調用 updateLayout() 是必要的，但這不是問題。

---

## 🎯 **真正的根本原因**

### 假設 1：Phaser 場景重新啟動

當用戶：
1. 換標籤 → 頁面隱藏 → visibilitychange 事件觸發
2. 返回標籤 → 頁面顯示 → 可能觸發某個事件

**可能的觸發鏈：**
```
頁面隱藏
  ↓
visibilitychange 事件
  ↓
saveGameProgressLocally()
  ↓
可能觸發某個事件？
  ↓
重新載入詞彙
```

### 假設 2：Phaser 的 pause/resume 事件

Phaser 場景可能在頁面隱藏時自動暫停，在頁面顯示時自動恢復。

**可能的觸發鏈：**
```
頁面隱藏
  ↓
Phaser 場景自動暫停
  ↓
頁面顯示
  ↓
Phaser 場景自動恢復
  ↓
可能觸發 resize 或其他事件？
  ↓
重新載入詞彙
```

### 假設 3：瀏覽器的 blur/focus 事件

瀏覽器在窗口失焦/獲焦時可能觸發某些事件。

**可能的觸發鏈：**
```
窗口失焦（縮小到工作列）
  ↓
blur 事件
  ↓
可能觸發 resize 或其他事件？
  ↓
窗口獲焦（恢復）
  ↓
focus 事件
  ↓
可能觸發 resize 或其他事件？
  ↓
重新載入詞彙
```

---

## 🧪 **診斷步驟**

### 步驟 1：打開瀏覽器開發者工具

1. 按 F12 打開開發者工具
2. 進入 Console 標籤

### 步驟 2：執行監控代碼

```javascript
// 監控所有可能的觸發點
let eventLog = [];

// 監控 updateLayout
const gameScene = cc?.game?.getScene?.('GameScene');
if (gameScene) {
    const originalUpdateLayout = gameScene.updateLayout;
    gameScene.updateLayout = function() {
        const stack = new Error().stack;
        eventLog.push({
            event: 'updateLayout',
            time: new Date().toLocaleTimeString(),
            stack: stack
        });
        console.log('❌ updateLayout 被調用！堆棧：', stack);
        return originalUpdateLayout.call(this);
    };
}

// 監控 visibilitychange
document.addEventListener('visibilitychange', () => {
    eventLog.push({
        event: 'visibilitychange',
        time: new Date().toLocaleTimeString(),
        hidden: document.hidden
    });
    console.log('👁️ visibilitychange:', document.hidden ? '隱藏' : '顯示');
});

// 監控 blur/focus
window.addEventListener('blur', () => {
    eventLog.push({
        event: 'blur',
        time: new Date().toLocaleTimeString()
    });
    console.log('⚫ blur 事件');
});

window.addEventListener('focus', () => {
    eventLog.push({
        event: 'focus',
        time: new Date().toLocaleTimeString()
    });
    console.log('⚪ focus 事件');
});

// 監控 resize
window.addEventListener('resize', () => {
    eventLog.push({
        event: 'resize',
        time: new Date().toLocaleTimeString(),
        size: `${window.innerWidth}x${window.innerHeight}`
    });
    console.log('📏 resize 事件');
});

console.log('✅ 監控已啟動，事件日誌：', eventLog);
```

### 步驟 3：進行測試操作

1. **測試 1：換標籤**
   - 切換到另一個標籤頁
   - 等待 2 秒
   - 切換回遊戲標籤
   - 查看控制台日誌

2. **測試 2：縮小到工作列**
   - 點擊最小化按鈕
   - 等待 2 秒
   - 點擊任務欄恢復
   - 查看控制台日誌

### 步驟 4：分析日誌

查看 `eventLog` 中的事件順序，找出 `updateLayout` 被調用前的事件。

---

## 📝 **預期發現**

根據分析，預期會發現以下情況之一：

### 情況 A：Phaser 場景重新啟動
```
visibilitychange (hidden=true)
  ↓
saveGameProgressLocally()
  ↓
visibilitychange (hidden=false)
  ↓
❌ updateLayout 被調用
```

### 情況 B：Phaser 自動 pause/resume
```
blur 事件
  ↓
Phaser 場景暫停
  ↓
focus 事件
  ↓
Phaser 場景恢復
  ↓
❌ updateLayout 被調用
```

### 情況 C：resize 事件被觸發
```
visibilitychange (hidden=false)
  ↓
resize 事件
  ↓
repositionCards()
  ↓
❌ 但卡片仍然被洗牌？
```

---

## 🔧 **可能的修復方案**

### 方案 1：禁用 Phaser 的自動 pause/resume
```javascript
this.scene.isActive() // 檢查場景是否活躍
```

### 方案 2：監聽 Phaser 的 pause/resume 事件
```javascript
this.events.on('pause', () => {
    console.log('場景暫停');
});

this.events.on('resume', () => {
    console.log('場景恢復');
});
```

### 方案 3：在 visibilitychange 時禁用 resize 監聽
```javascript
if (document.hidden) {
    this.scale.off('resize');
} else {
    this.scale.on('resize', ...);
}
```

---

## 📊 **下一步**

1. 執行診斷代碼
2. 記錄事件日誌
3. 分析觸發鏈
4. 根據發現應用修復方案
5. 驗證修復效果


