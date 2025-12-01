# 手機上比例不對的診斷分析

## 📅 診斷日期
2025-11-16

## 🔍 問題描述

根據用戶提供的截圖：
- **桌面端**：卡片顯示正常，2行 × 10列佈局
- **手機端**：卡片太小，佈局混亂，顯示為 5列 × 4行

## 🎯 可能的原因

### 1. **容器尺寸傳遞問題** ❓

#### 檢查點：
- GameSwitcher 是否正確設置 iframe 容器尺寸？
- iframe 內的遊戲是否正確讀取容器尺寸？

#### 相關代碼：
```javascript
// components/games/GameSwitcher.tsx (第 1011-1072 行)
useEffect(() => {
  const handleContainerResize = () => {
    const container = document.querySelector('.game-iframe-container') as HTMLElement;
    if (container) {
      const isLandscapeMobile = window.innerWidth === 812 && window.innerHeight === 375;
      
      if (isLandscapeMobile) {
        // 計算最佳尺寸
        const gameAspectRatio = 1274 / 739;
        const screenAspectRatio = 812 / 375;
        
        let optimalWidth, optimalHeight;
        if (screenAspectRatio > gameAspectRatio) {
          optimalHeight = 375;
          optimalWidth = Math.round(375 * gameAspectRatio);
        } else {
          optimalWidth = 812;
          optimalHeight = Math.round(812 / gameAspectRatio);
        }
        
        container.style.width = `${optimalWidth}px`;
        container.style.height = `${optimalHeight}px`;
      }
    }
  };
}, []);
```

**問題**：這段代碼只針對 `812 × 375` 的特定尺寸，其他手機尺寸可能沒有正確處理！

### 2. **Phaser Scale.RESIZE 模式問題** ⚠️

#### Phaser 如何獲取容器尺寸：
```javascript
// public/games/match-up-game/config.js
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',  // ← 關鍵：Phaser 會讀取這個容器的尺寸
  scale: {
    mode: Phaser.Scale.RESIZE,  // ← 動態調整尺寸
    width: SIZE_WIDTH_SCREEN,   // 960 (初始值)
    height: SIZE_HEIGHT_SCREEN, // 540 (初始值)
  }
};
```

**Phaser.Scale.RESIZE 的行為**：
- 自動讀取 `parent` 容器的 `offsetWidth` 和 `offsetHeight`
- 當容器尺寸改變時，觸發 `resize` 事件
- 遊戲 Canvas 會自動調整到容器尺寸

#### 檢查點：
- 手機上的 `#game-container` 實際尺寸是多少？
- Phaser 是否正確讀取了容器尺寸？

### 3. **resize 事件處理問題** ❓

#### 當前的 resize 處理：
```javascript
// public/games/match-up-game/scenes/handler.js (v73.0)
resize(gameSize) {
  if (!this.sceneStopped) {
    const width = gameSize.width
    const height = gameSize.height
    
    this.parent.setSize(width, height)
    this.sizer.setSize(width, height)
    
    // 🔥 [v73.0] 重置攝影機縮放為 1
    const camera = this.cameras.main
    if (camera) {
      camera.setZoom(1);
    }
  }
}
```

**問題**：v73.0 修復後，Camera zoom 固定為 1，但這可能導致手機上的卡片太小！

### 4. **響應式佈局計算問題** ⚠️

#### 卡片尺寸計算邏輯：
```javascript
// public/games/match-up-game/scenes/game.js (createTopBottomSeparated)
const itemsPerRow = this.calculateItemsPerRow(width, height, itemCount);
const baseCardWidth = availableWidth / itemsPerRow;
const cardWidth = Math.min(baseCardWidth, maxCardWidth);
const cardHeight = cardWidth * cardAspectRatio;
```

**檢查點**：
- 手機上的 `width` 和 `height` 值是多少？
- `itemsPerRow` 計算結果是多少？
- `cardWidth` 和 `cardHeight` 是多少？

---

## 🔧 診斷步驟

### 步驟 1：檢查容器尺寸
在手機上打開 Console，執行：
```javascript
const container = document.getElementById('game-container');
console.log('容器尺寸:', {
  offsetWidth: container.offsetWidth,
  offsetHeight: container.offsetHeight,
  clientWidth: container.clientWidth,
  clientHeight: container.clientHeight,
  style: {
    width: container.style.width,
    height: container.style.height
  }
});
```

### 步驟 2：檢查 Phaser 讀取的尺寸
```javascript
console.log('Phaser 尺寸:', {
  scaleWidth: game.scale.width,
  scaleHeight: game.scale.height,
  gameWidth: game.scale.gameSize.width,
  gameHeight: game.scale.gameSize.height
});
```

### 步驟 3：檢查卡片計算結果
查看 Console 中的 `[v72.0]` 和 `[v91.0]` 調試訊息：
```
📐 [v72.0] createTopBottomSeparated 卡片寬度計算:
📊 [v91.0] 動態列數響應式佈局 - 20個匹配數:
```

---

## 💡 可能的解決方案

### 方案 1：修復 GameSwitcher 的容器尺寸設置
**問題**：只針對 `812 × 375` 處理，其他尺寸沒有處理

**解決方案**：
```typescript
// components/games/GameSwitcher.tsx
useEffect(() => {
  const handleContainerResize = () => {
    const container = document.querySelector('.game-iframe-container') as HTMLElement;
    if (container && isMobile) {
      // 🔥 修復：為所有手機尺寸設置合適的容器大小
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // 設置容器為全螢幕
      container.style.width = `${screenWidth}px`;
      container.style.height = `${screenHeight}px`;
      
      console.log('📱 手機容器尺寸設置:', {
        screenWidth,
        screenHeight,
        containerWidth: container.offsetWidth,
        containerHeight: container.offsetHeight
      });
    }
  };
  
  handleContainerResize();
  window.addEventListener('resize', handleContainerResize);
  
  return () => {
    window.removeEventListener('resize', handleContainerResize);
  };
}, [isMobile]);
```

### 方案 2：添加手機專用的 Camera zoom 調整
**問題**：v73.0 將 Camera zoom 固定為 1，可能導致手機上內容太小

**解決方案**：
```javascript
// public/games/match-up-game/scenes/handler.js
updateCamera(scene) {
  const camera = scene.cameras.main
  if (!camera) {
    console.warn('⚠️ updateCamera: camera 不存在');
    return;
  }
  
  // 🔥 檢測是否為手機
  const isMobile = scene.scale.width < 768;
  
  if (isMobile) {
    // 手機上可能需要稍微放大
    const scaleX = scene.sizer.width / this.game.screenBaseSize.width;
    const scaleY = scene.sizer.height / this.game.screenBaseSize.height;
    const zoom = Math.min(scaleX, scaleY);  // 使用 Math.min 避免裁切
    camera.setZoom(zoom);
    console.log('📱 手機模式 Camera zoom:', zoom);
  } else {
    // 桌面端保持 zoom = 1
    camera.setZoom(1);
    console.log('🖥️ 桌面模式 Camera zoom: 1');
  }
}
```

---

## 🎯 建議的診斷流程

1. **先檢查容器尺寸** - 確認 `#game-container` 在手機上的實際尺寸
2. **檢查 Phaser 讀取的尺寸** - 確認 Phaser 是否正確讀取容器尺寸
3. **檢查卡片計算結果** - 確認響應式佈局計算是否正確
4. **測試修復方案** - 根據診斷結果應用相應的修復

---

## 📝 需要收集的數據

請在手機上打開遊戲，並在 Console 中查看以下訊息：

1. `🔍 [DEBUG-v62.0]` - Phaser Scale 事件
2. `🔍 [DEBUG-v63.0]` - 實際窗口尺寸
3. `📐 [v72.0]` - 卡片寬度計算
4. `📊 [v91.0]` - 動態列數響應式佈局

將這些數據提供給我，我就能確定問題的根本原因！

