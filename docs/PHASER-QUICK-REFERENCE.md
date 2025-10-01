# Phaser 遊戲整合快速參考

> 快速查閱 Phaser 遊戲整合的關鍵代碼片段

## 🎯 Phaser 配置

### FIT 模式基礎配置
```javascript
const config = {
  width: 1000,
  height: 800,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  parent: "game-container",
};
```

### 動態解析度配置
```javascript
function calculateGameDimensions() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  
  if (aspectRatio > 2.0) return { gameWidth: 1600, gameHeight: 800 };
  if (aspectRatio > 1.5) return { gameWidth: 1200, gameHeight: 800 };
  return { gameWidth: 1000, gameHeight: 800 };
}

const { gameWidth, gameHeight } = calculateGameDimensions();
```

## 📡 PostMessage 通信

### 遊戲發送消息
```javascript
window.parent.postMessage({
  type: 'DUAL_FULLSCREEN_REQUEST',
  action: 'toggle',
  timestamp: Date.now()
}, '*');
```

### 父頁面接收消息
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') {
      enterCSSFullscreen();
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## 🎮 虛擬按鈕

### HTML 結構
```html
<div id="touch-controls">
  <div class="touch-joystick">
    <div class="touch-joystick-knob"></div>
  </div>
  <button class="touch-shoot-btn">🚀</button>
  <button class="fullscreen-btn">⛶</button>
</div>
```

### CSS 媒體查詢
```css
@media (max-width: 1024px) and (max-height: 768px),
       (pointer: coarse) {
  #touch-controls {
    display: block !important;
  }
}
```

### JavaScript 類
```javascript
class TouchControls {
  constructor() {
    this.currentDirection = { x: 0, y: 0 };
    this.shooting = false;
    this.init();
  }
  
  getInputState() {
    return {
      direction: { ...this.currentDirection },
      shooting: this.shooting
    };
  }
}
```

## 🖥️ 全螢幕

### CSS 全螢幕（進入）
```typescript
const enterCSSFullscreen = () => {
  gameContainer.style.position = 'fixed';
  gameContainer.style.top = '0';
  gameContainer.style.left = '0';
  gameContainer.style.width = '100vw';
  gameContainer.style.height = '100vh';
  gameContainer.style.zIndex = '9999';
  
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
};
```

### CSS 全螢幕（退出）
```typescript
const exitCSSFullscreen = () => {
  gameContainer.style.position = '';
  gameContainer.style.width = '';
  gameContainer.style.height = '';
  
  iframe.style.width = '';
  iframe.style.height = '';
};
```

## 🔧 動態調整

### 應用動態解析度
```javascript
async function applyDynamicResolution() {
  await waitForPhaserGame();
  const { gameWidth, gameHeight } = calculateGameDimensions();
  window.game.scale.resize(gameWidth, gameHeight);
  window.game.scale.refresh();
}
```

### Resize 監聽
```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(applyDynamicResolution, 500);
});
```

## 🐛 調試工具

### 檢查遊戲狀態
```javascript
console.log('遊戲尺寸:', window.game.scale.width, 'x', window.game.scale.height);
console.log('螢幕尺寸:', window.innerWidth, 'x', window.innerHeight);
console.log('寬高比:', (window.innerWidth / window.innerHeight).toFixed(2));
```

### 測試虛擬按鈕
```javascript
window.testTouchControls = () => window.touchControls.testControls();
```

### 強制顯示虛擬按鈕
```javascript
document.getElementById('touch-controls').style.display = 'block';
```

## 📊 Scale 模式速查

| 模式 | 用途 | 優點 | 缺點 |
|------|------|------|------|
| FIT | 固定比例遊戲 | 不變形 | 可能有黑邊 |
| RESIZE | 響應式 UI | 完全填滿 | 可能變形 |
| ENVELOP | 背景遊戲 | 無黑邊 | 可能裁切 |
| NONE | 自定義 | 完全控制 | 需手動處理 |

## 🎯 常見問題速查

### 黑邊問題
```javascript
// 使用動態解析度匹配螢幕寬高比
const aspectRatio = window.innerWidth / window.innerHeight;
gameWidth = Math.round(800 * aspectRatio);
```

### PostMessage 不工作
```javascript
// 檢查是否在 iframe 中
console.log('在 iframe 中:', window.parent !== window);

// 測試發送
window.parent.postMessage({ type: 'TEST' }, '*');
```

### 虛擬按鈕不顯示
```javascript
// 檢查媒體查詢
window.matchMedia('(pointer: coarse)').matches;
```

## 📱 移動設備優化

### 隱藏地址欄
```javascript
window.scrollTo(0, 1);
setTimeout(() => window.scrollTo(0, 1), 100);
```

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 防止觸摸滾動
```javascript
document.addEventListener('touchmove', (e) => {
  if (e.target.closest('#touch-controls')) {
    e.preventDefault();
  }
}, { passive: false });
```

## 🚀 性能優化

### Transform 優於 Position
```javascript
// ✅ 好
element.style.transform = 'translate(100px, 100px)';

// ❌ 不好
element.style.top = '100px';
element.style.left = '100px';
```

### Passive 事件監聽
```javascript
element.addEventListener('touchstart', handler, { passive: false });
```

### Phaser 性能配置
```javascript
render: {
  antialias: false,
  pixelArt: true,
  roundPixels: true,
}
```

## 📦 部署檢查清單

- [ ] 使用絕對路徑
- [ ] 配置 CORS
- [ ] 壓縮資源
- [ ] 預載入關鍵資源
- [ ] 測試所有設備
- [ ] 檢查 PostMessage 安全性

---

**完整文檔**：[PHASER-GAME-INTEGRATION-GUIDE.md](./PHASER-GAME-INTEGRATION-GUIDE.md)  
**版本**：1.0  
**更新**：2025-10-01

