# 重新載入問題 - 調適訊息監控系統

## 🔍 **當前發現的所有重新載入觸發點**

根據代碼分析，存在 **4 個主要的重新載入觸發點**：

### 1️⃣ **ResponsiveManager（第一優先級）**
- **位置：** game.js 第 765-773 行
- **觸發方式：** 初始化時自動監聽 resize 事件
- **調用方法：** `updateLayout()`
- **影響：** ❌ 清除所有元素，重新創建卡片

### 2️⃣ **Fullscreen 事件（第二優先級）**
- **位置：** game.js 第 7376-7380 行
- **觸發方式：** `handleFullscreenChange()`
- **調用方法：** `updateLayout()`
- **影響：** ❌ 清除所有元素，重新創建卡片

### 3️⃣ **Orientation 事件（第三優先級）**
- **位置：** game.js 第 7383-7388 行
- **觸發方式：** `handleOrientationChange()`
- **調用方法：** `updateLayout()`
- **影響：** ❌ 清除所有元素，重新創建卡片

### 4️⃣ **Visibility Change 事件（已優化）**
- **位置：** game.js 第 814-823 行
- **觸發方式：** `visibilityChangeListener`
- **調用方法：** `saveGameProgressLocally()`（只保存，不重新載入）
- **影響：** ✅ 已優化，不重新載入

---

## 📊 **重新載入觸發流程圖**

```
用戶操作
    ↓
┌─────────────────────────────────────────────────────┐
│ 可能觸發的事件                                      │
├─────────────────────────────────────────────────────┤
│ 1. 縮小視窗 → resize 事件                           │
│    ↓                                                │
│    ResponsiveManager.onResize()                     │
│    ↓                                                │
│    scene.updateLayout() ❌                          │
│                                                     │
│ 2. 換分頁 → visibilitychange 事件                   │
│    ↓                                                │
│    saveGameProgressLocally() ✅                     │
│    ↓                                                │
│    不重新載入                                       │
│                                                     │
│ 3. 縮小到工作列 → blur 事件（可能）                 │
│    ↓                                                │
│    可能觸發 resize 或其他事件                       │
│    ↓                                                │
│    updateLayout() ❌                                │
│                                                     │
│ 4. 放大 → resize 事件                               │
│    ↓                                                │
│    ResponsiveManager.onResize()                     │
│    ↓                                                │
│    scene.updateLayout() ❌                          │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **調適訊息監控系統**

### 在瀏覽器控制台執行以下代碼進行監控：

```javascript
// ============================================
// 🔍 Match-Up Game 重新載入監控系統 v1.0
// ============================================

console.log('🔍 開始監控重新載入事件...\n');

// 1. 監控 updateLayout 調用
let updateLayoutCount = 0;
const gameScene = cc.game.getScene('GameScene');
const originalUpdateLayout = gameScene.updateLayout;
gameScene.updateLayout = function() {
    updateLayoutCount++;
    const stack = new Error().stack;
    console.log(`\n❌ [#${updateLayoutCount}] updateLayout 被調用`);
    console.log('調用堆棧:', stack);
    return originalUpdateLayout.call(this);
};

// 2. 監控 repositionCards 調用
let repositionCardsCount = 0;
const originalRepositionCards = gameScene.repositionCards;
gameScene.repositionCards = function() {
    repositionCardsCount++;
    console.log(`✅ [#${repositionCardsCount}] repositionCards 被調用`);
    return originalRepositionCards.call(this);
};

// 3. 監控 resize 事件
let resizeCount = 0;
window.addEventListener('resize', () => {
    resizeCount++;
    console.log(`📏 [#${resizeCount}] resize 事件觸發 - 視窗大小: ${window.innerWidth}x${window.innerHeight}`);
});

// 4. 監控 visibilitychange 事件
let visibilityCount = 0;
document.addEventListener('visibilitychange', () => {
    visibilityCount++;
    console.log(`👁️ [#${visibilityCount}] visibilitychange 事件 - 頁面${document.hidden ? '隱藏' : '顯示'}`);
});

// 5. 監控 fullscreenchange 事件
let fullscreenCount = 0;
document.addEventListener('fullscreenchange', () => {
    fullscreenCount++;
    console.log(`🖥️ [#${fullscreenCount}] fullscreenchange 事件 - ${document.fullscreenElement ? '進入' : '退出'}全螢幕`);
});

// 6. 監控 orientationchange 事件
let orientationCount = 0;
window.addEventListener('orientationchange', () => {
    orientationCount++;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    console.log(`📱 [#${orientationCount}] orientationchange 事件 - ${isPortrait ? '直向' : '橫向'}`);
});

// 7. 監控 blur/focus 事件
let blurCount = 0, focusCount = 0;
window.addEventListener('blur', () => {
    blurCount++;
    console.log(`⚫ [#${blurCount}] blur 事件 - 視窗失焦`);
});
window.addEventListener('focus', () => {
    focusCount++;
    console.log(`⚪ [#${focusCount}] focus 事件 - 視窗獲焦`);
});

// 8. 定期輸出統計信息
setInterval(() => {
    console.log('\n📊 === 監控統計 ===');
    console.log(`updateLayout 調用: ${updateLayoutCount} 次`);
    console.log(`repositionCards 調用: ${repositionCardsCount} 次`);
    console.log(`resize 事件: ${resizeCount} 次`);
    console.log(`visibilitychange 事件: ${visibilityCount} 次`);
    console.log(`fullscreenchange 事件: ${fullscreenCount} 次`);
    console.log(`orientationchange 事件: ${orientationCount} 次`);
    console.log(`blur 事件: ${blurCount} 次`);
    console.log(`focus 事件: ${focusCount} 次`);
    console.log('==================\n');
}, 10000);  // 每 10 秒輸出一次

console.log('✅ 監控系統已啟動！');
console.log('現在進行以下操作並觀察控制台輸出：');
console.log('1. 縮小視窗');
console.log('2. 換分頁');
console.log('3. 縮小到工作列');
console.log('4. 放大視窗');
```

---

## 📋 **測試場景和預期結果**

### 場景 1：縮小視窗

**操作：** 拖動視窗邊界縮小

**預期結果（修復前）：**
```
📏 resize 事件觸發 - 視窗大小: 800x600
❌ updateLayout 被調用
```

**預期結果（修復後）：**
```
📏 resize 事件觸發 - 視窗大小: 800x600
✅ repositionCards 被調用
```

### 場景 2：換分頁

**操作：** 切換到另一個標籤頁，再切換回來

**預期結果（修復前）：**
```
👁️ visibilitychange 事件 - 頁面隱藏
❌ updateLayout 被調用（可能）
```

**預期結果（修復後）：**
```
👁️ visibilitychange 事件 - 頁面隱藏
✅ 只保存進度，不重新載入
```

### 場景 3：縮小到工作列再放大

**操作：** 點擊最小化按鈕，再點擊任務欄恢復

**預期結果（修復前）：**
```
⚫ blur 事件 - 視窗失焦
❌ updateLayout 被調用（可能）
⚪ focus 事件 - 視窗獲焦
📏 resize 事件觸發
❌ updateLayout 被調用
```

**預期結果（修復後）：**
```
⚫ blur 事件 - 視窗失焦
⚪ focus 事件 - 視窗獲焦
📏 resize 事件觸發
✅ repositionCards 被調用
```

---

## 🎯 **根據監控結果診斷問題**

### 如果看到 updateLayout 被調用

**可能的原因：**
1. ResponsiveManager 的 onResize() 被調用
2. handleFullscreenChange() 被調用
3. handleOrientationChange() 被調用

**解決方案：**
- 查看調用堆棧（stack trace）確定具體原因
- 根據原因應用相應的修復

### 如果看到 repositionCards 被調用

**這是正確的行為！** ✅
- 卡片只調整位置，不重新載入
- 遊戲應該正常運行

---

## 📝 **調適訊息記錄格式**

每次 updateLayout 被調用時，會輸出：
```
❌ [#1] updateLayout 被調用
調用堆棧: Error
    at GameScene.updateLayout (game.js:1196)
    at ResponsiveManager.updateLayout (responsive-manager.js:336)
    at ResponsiveManager.onResize (responsive-manager.js:295)
    ...
```

根據堆棧可以確定：
- 第一行：updateLayout 被調用
- 第二行：誰調用了 updateLayout（ResponsiveManager）
- 第三行：誰調用了 ResponsiveManager（onResize）
- 以此類推...


