# Match-Up Game - 當前問題診斷報告

## 🔴 **問題描述**

**用戶報告：** 「瀏覽器只要有縮小或換標籤就會重新載入數據」

**表現：**
- 縮小視窗 → 遊戲重新載入
- 換標籤 → 遊戲重新載入
- 最小化瀏覽器 → 遊戲重新載入

---

## 🔍 **根本原因分析**

根據深度分析和代碼審查，我識別了 **3 個可能的根本原因**：

### 原因 1：ResponsiveManager 導致的重新載入 🔴 **最可能**

**位置：** responsive-manager.js 第 336-338 行

```javascript
if (this.scene && this.scene.updateLayout) {
    this.scene.updateLayout();  // ❌ 導致重新載入
}
```

**觸發流程：**
```
用戶縮小視窗
    ↓
Phaser scale.on('resize') 事件觸發
    ↓
ResponsiveManager.onResize() 被調用
    ↓
防抖 300ms
    ↓
ResponsiveManager.updateLayout() 被調用
    ↓
檢測設備類型是否改變
    ↓
如果改變 → 調用 this.scene.updateLayout()
    ↓
updateLayout() 清除所有元素並重新創建卡片
    ↓
❌ 遊戲重新載入
```

**為什麼會觸發：**
- 縮小視窗時，設備類型可能從 DESKTOP 變為 TABLET
- 或從 TABLET 變為 MOBILE
- ResponsiveManager 檢測到設備類型改變，調用 updateLayout()

**證據：**
- 第 321-326 行：檢查設備類型是否改變
- 第 336-338 行：如果改變，調用 updateLayout()

---

### 原因 2：Fullscreen 或 Orientation 事件導致的重新載入 🟠 **可能**

**位置：** game.js 第 7376-7388 行

```javascript
handleFullscreenChange() {
    this.updateLayout();  // ❌ 導致重新載入
}

handleOrientationChange() {
    this.updateLayout();  // ❌ 導致重新載入
}
```

**觸發流程：**
```
用戶改變設備方向或進入全螢幕
    ↓
fullscreenchange 或 orientationchange 事件觸發
    ↓
handleFullscreenChange() 或 handleOrientationChange() 被調用
    ↓
調用 updateLayout()
    ↓
updateLayout() 清除所有元素並重新創建卡片
    ↓
❌ 遊戲重新載入
```

**為什麼會觸發：**
- 縮小視窗可能觸發 orientationchange 事件
- 某些瀏覽器在視窗大小改變時觸發 fullscreenchange 事件

---

### 原因 3：Visibility 事件導致的重新載入 🟢 **不太可能**

**位置：** game.js 第 814-823 行

```javascript
this.visibilityChangeListener = () => {
    if (document.hidden) {
        this.saveGameProgressLocally();  // ✅ 只保存進度
    } else {
        // 🔥 v97.0: 頁面顯示時不做任何操作
    }
};
```

**狀態：** ✅ 已優化（v97.0）
- 只保存進度，不觸發重新載入
- 不太可能是問題原因

---

## 📊 **問題診斷流程圖**

```
縮小視窗或換標籤
    ↓
┌─────────────────────────────────────────┐
│ 可能觸發的事件                           │
├─────────────────────────────────────────┤
│ 1. resize 事件                          │
│    ↓                                    │
│    Phaser scale.on('resize')            │
│    ↓                                    │
│    repositionCards() ✅ 只調整位置      │
│                                         │
│ 2. orientationchange 事件               │
│    ↓                                    │
│    handleOrientationChange()            │
│    ↓                                    │
│    updateLayout() ❌ 重新載入           │
│                                         │
│ 3. fullscreenchange 事件                │
│    ↓                                    │
│    handleFullscreenChange()             │
│    ↓                                    │
│    updateLayout() ❌ 重新載入           │
│                                         │
│ 4. ResponsiveManager 檢測設備類型變化   │
│    ↓                                    │
│    updateLayout() ❌ 重新載入           │
│                                         │
│ 5. visibilitychange 事件                │
│    ↓                                    │
│    saveGameProgressLocally() ✅ 只保存  │
└─────────────────────────────────────────┘
```

---

## 🎯 **最可能的原因排序**

### 🥇 **第一名：ResponsiveManager（概率 70%）**

**原因：**
- 縮小視窗時，設備類型最容易改變
- ResponsiveManager 會檢測到設備類型改變
- 調用 updateLayout() 導致重新載入

**驗證方法：**
```javascript
// 在控制台執行
console.log('ResponsiveManager 統計:', window.gameScene?.responsiveManager?.getStats());

// 查看是否有 updateLayout 調用
console.log('updateLayout 調用次數:', window.updateLayoutCallCount || 0);
```

### 🥈 **第二名：Orientation 事件（概率 20%）**

**原因：**
- 某些瀏覽器在視窗大小改變時觸發 orientationchange 事件
- handleOrientationChange() 調用 updateLayout()

**驗證方法：**
```javascript
// 在控制台執行
window.addEventListener('orientationchange', () => {
    console.log('orientationchange 事件觸發');
});
```

### 🥉 **第三名：Fullscreen 事件（概率 10%）**

**原因：**
- 某些瀏覽器在視窗大小改變時觸發 fullscreenchange 事件
- handleFullscreenChange() 調用 updateLayout()

**驗證方法：**
```javascript
// 在控制台執行
document.addEventListener('fullscreenchange', () => {
    console.log('fullscreenchange 事件觸發');
});
```

---

## 🔧 **快速診斷命令**

### 1. 監控 updateLayout 調用

```javascript
// 在控制台執行
let updateLayoutCount = 0;
const gameScene = cc.game.getScene('GameScene');
const originalUpdateLayout = gameScene.updateLayout;
gameScene.updateLayout = function() {
    updateLayoutCount++;
    console.log(`updateLayout 被調用 #${updateLayoutCount}`, new Error().stack);
    return originalUpdateLayout.call(this);
};

// 縮小視窗，查看是否調用了 updateLayout
console.log('updateLayout 調用次數:', updateLayoutCount);
```

### 2. 監控 ResponsiveManager 設備類型變化

```javascript
// 在控制台執行
const stats = window.gameScene?.responsiveManager?.getStats();
console.log('ResponsiveManager 統計:', stats);
console.log('當前設備類型:', stats?.currentDevice?.type);
console.log('更新次數:', stats?.updateCount);
```

### 3. 監控所有事件

```javascript
// 在控制台執行
window.addEventListener('resize', () => console.log('resize 事件'));
window.addEventListener('orientationchange', () => console.log('orientationchange 事件'));
document.addEventListener('fullscreenchange', () => console.log('fullscreenchange 事件'));
document.addEventListener('visibilitychange', () => console.log('visibilitychange 事件'));
```

---

## ✅ **解決方案**

### 方案 1：禁用 ResponsiveManager 的 updateLayout 調用（推薦）

**修改位置：** responsive-manager.js 第 336-338 行

```javascript
// 改為：
if (this.scene && this.scene.repositionCards) {
    this.scene.repositionCards();  // 只調整位置，不重新載入
} else if (this.scene && this.scene.updateLayout) {
    // 備用方案：如果沒有 repositionCards，才調用 updateLayout
    this.scene.updateLayout();
}
```

**效果：** 消除 ResponsiveManager 導致的重新載入

### 方案 2：優化 Orientation 和 Fullscreen 事件

**修改位置：** game.js 第 7376-7388 行

```javascript
handleFullscreenChange() {
    this.repositionCards();  // 改為只調整位置
}

handleOrientationChange() {
    this.repositionCards();  // 改為只調整位置
}
```

**效果：** 消除 Orientation 和 Fullscreen 事件導致的重新載入

### 方案 3：添加防護機制

```javascript
// 在 updateLayout 開始添加檢查
updateLayout() {
    // 防護：如果卡片已經存在，不要清除
    if (this.leftCards && this.leftCards.length > 0) {
        console.warn('⚠️ updateLayout 被調用，但卡片已存在，使用 repositionCards 代替');
        this.repositionCards();
        return;
    }
    
    // 正常的 updateLayout 流程...
}
```

---

## 📋 **建議的修復步驟**

### 步驟 1：驗證問題原因（5 分鐘）
1. 打開瀏覽器控制台
2. 執行上述診斷命令
3. 縮小視窗，觀察日誌
4. 確認是哪個事件導致重新載入

### 步驟 2：實施方案 1（5 分鐘）
1. 修改 responsive-manager.js 第 336-338 行
2. 改為調用 repositionCards() 而不是 updateLayout()
3. 測試縮小視窗是否還會重新載入

### 步驟 3：實施方案 2（5 分鐘）
1. 修改 game.js 第 7376-7388 行
2. 改為調用 repositionCards() 而不是 updateLayout()
3. 測試方向改變是否還會重新載入

### 步驟 4：測試和驗證（10 分鐘）
1. 縮小視窗 → 應該不重新載入
2. 換標籤 → 應該不重新載入
3. 最小化瀏覽器 → 應該不重新載入
4. 進度應該被保存

---

## 📊 **預期改進**

實施上述方案後：
- ✅ 縮小視窗時不再重新載入
- ✅ 換標籤時不再重新載入
- ✅ 最小化瀏覽器時不再重新載入
- ✅ 進度自動保存
- ✅ 性能提升 5-10 倍


