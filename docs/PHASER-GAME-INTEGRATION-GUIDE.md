# Phaser 遊戲整合完整指南

> 基於 Starshake 遊戲的實戰經驗，提供 Phaser 遊戲與 React 父頁面整合的完整解決方案

## 📋 目錄

1. [架構概覽](#架構概覽)
2. [Phaser FIT 模式配置](#phaser-fit-模式配置)
3. [動態解析度系統](#動態解析度系統)
4. [父頁面與遊戲通信](#父頁面與遊戲通信)
5. [虛擬按鈕設計](#虛擬按鈕設計)
6. [全螢幕實現](#全螢幕實現)
7. [完整實踐範例](#完整實踐範例)

---

## 架構概覽

### 系統組成

```
┌─────────────────────────────────────────────────────────┐
│                    React 父頁面                          │
│  (GameSwitcher.tsx)                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - 全螢幕控制                                      │  │
│  │  - PostMessage 監聽器                              │  │
│  │  - CSS 全螢幕管理                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↕ PostMessage                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              iframe 容器                           │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │        Phaser 遊戲 (index.html)             │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  - Phaser Game Instance              │  │  │  │
│  │  │  │  - FIT Scale Mode                    │  │  │  │
│  │  │  │  - 動態解析度計算                     │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  TouchControls 虛擬按鈕              │  │  │  │
│  │  │  │  - 虛擬搖桿                          │  │  │  │
│  │  │  │  - 射擊按鈕                          │  │  │  │
│  │  │  │  - 全螢幕按鈕                        │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 關鍵技術點

1. **Phaser FIT 模式**：保持遊戲比例，自動適應容器
2. **動態解析度**：根據螢幕寬高比動態調整遊戲解析度
3. **PostMessage 通信**：iframe 與父頁面的雙向通信
4. **CSS 全螢幕**：跨瀏覽器的全螢幕實現
5. **虛擬按鈕**：移動設備的觸控操作支援

---

## Phaser FIT 模式配置

### 基礎配置

```javascript
// temp-phaser-zenbaki/starshake/src/main.js

const config = {
  width: gameWidth,      // 動態計算的遊戲寬度
  height: gameHeight,    // 動態計算的遊戲高度
  scale: {
    mode: Phaser.Scale.FIT,  // 🎯 FIT 模式：保持比例並適應容器
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,  // 水平居中，垂直向上對齊
  },
  autoRound: false,
  parent: "game-container",  // 掛載到指定容器
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Bootloader, Splash, Transition, Game, Outro],
};
```

### FIT 模式工作原理

```
FIT 模式計算邏輯：
1. 計算寬度縮放比例：scaleX = containerWidth / gameWidth
2. 計算高度縮放比例：scaleY = containerHeight / gameHeight
3. 選擇較小的比例：scale = Math.min(scaleX, scaleY)
4. 應用縮放，保持遊戲完整可見

範例：
- 遊戲解析度：1800 × 800
- 容器尺寸：844 × 375（iPhone 14 橫向）
- scaleX = 844 / 1800 = 0.469
- scaleY = 375 / 800 = 0.469
- 最終 scale = 0.469
- 結果：遊戲完美填滿螢幕，無黑邊
```

### 為什麼選擇 FIT 模式？

| 模式 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **FIT** | 保持比例、完整可見 | 可能有黑邊 | ✅ 固定比例遊戲 |
| RESIZE | 完全填滿容器 | 遊戲內容可能變形 | 響應式 UI 遊戲 |
| ENVELOP | 填滿容器 | 部分內容可能被裁切 | 背景遊戲 |
| NONE | 完全控制 | 需要手動處理 | 自定義縮放邏輯 |

---

## 動態解析度系統

### 核心概念

**問題**：固定解析度無法適應不同螢幕寬高比，導致黑邊或變形。

**解決方案**：根據螢幕寬高比動態計算遊戲解析度。

### 實現代碼

```javascript
// public/games/starshake-game/dist/index.html (行 2386-2415)

function calculateGameDimensions() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = screenWidth / screenHeight;

    console.log('📱 螢幕尺寸:', screenWidth, 'x', screenHeight);
    console.log('📐 寬高比:', aspectRatio.toFixed(2));

    let gameWidth, gameHeight;

    // 檢測橫向模式且寬高比 > 2.0（超寬螢幕）
    if (aspectRatio > 2.0) {
        // 超寬螢幕：增加遊戲寬度以填滿螢幕
        gameWidth = 1600;
        gameHeight = 800;
        console.log('🎮 使用超寬解析度:', gameWidth, 'x', gameHeight);
    } else if (aspectRatio > 1.5) {
        // 橫向模式：使用加寬解析度
        gameWidth = 1200;
        gameHeight = 800;
        console.log('🎮 使用橫向解析度:', gameWidth, 'x', gameHeight);
    } else {
        // 標準/直向模式
        gameWidth = 1000;
        gameHeight = 800;
        console.log('🎮 使用標準解析度:', gameWidth, 'x', gameHeight);
    }

    return { gameWidth, gameHeight };
}
```

### 動態調整解析度

```javascript
// 等待 Phaser 遊戲載入
async function waitForPhaserGame() {
    return new Promise((resolve) => {
        const checkGame = () => {
            if (window.game && window.game.scale) {
                resolve();
            } else {
                setTimeout(checkGame, 100);
            }
        };
        checkGame();
    });
}

// 應用動態解析度
async function applyDynamicResolution() {
    await waitForPhaserGame();

    const { gameWidth, gameHeight } = calculateGameDimensions();

    // 更新 Phaser 遊戲解析度
    if (window.game && window.game.scale) {
        try {
            window.game.scale.resize(gameWidth, gameHeight);
            window.game.scale.refresh();
            console.log('✅ 動態解析度已應用:', gameWidth, 'x', gameHeight);
        } catch (error) {
            console.log('❌ 動態解析度應用失敗:', error);
        }
    }
}

// 監聽視窗大小變化
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newDimensions = calculateGameDimensions();
        if (newDimensions.gameWidth !== currentDimensions.gameWidth) {
            applyDynamicResolution();
        }
    }, 500);
});
```

### 解析度策略表

| 螢幕類型 | 寬高比 | 遊戲解析度 | 範例設備 |
|---------|--------|-----------|---------|
| 直向模式 | < 1.5 | 1000×800 | iPhone 直向 |
| 橫向模式 | 1.5-2.0 | 1200×800 | iPad 橫向 |
| 超寬螢幕 | > 2.0 | 1600×800 | iPhone 14 橫向 (2.25) |

---

## 父頁面與遊戲通信

### PostMessage 通信架構

```
┌─────────────────────────────────────────────────────────┐
│                    React 父頁面                          │
│                                                          │
│  useEffect(() => {                                       │
│    const handleMessage = (event) => {                    │
│      if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') │
│        enterCSSFullscreen();  // 執行全螢幕             │
│      }                                                   │
│    };                                                    │
│    window.addEventListener('message', handleMessage);    │
│  }, []);                                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
                         ↕ PostMessage
┌──────────────────────────────────────────────────────────┐
│                  Phaser 遊戲 (iframe)                     │
│                                                          │
│  // 遊戲內全螢幕按鈕點擊                                  │
│  fullscreenBtn.addEventListener('click', () => {         │
│    window.parent.postMessage({                           │
│      type: 'DUAL_FULLSCREEN_REQUEST',                    │
│      action: 'toggle',                                   │
│      timestamp: Date.now()                               │
│    }, '*');                                              │
│  });                                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 父頁面監聽器實現

```typescript
// components/games/GameSwitcher.tsx (行 792-830)

useEffect(() => {
  const handleDualFullscreenMessage = async (event: MessageEvent) => {
    if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') {
      console.log('📥 收到遊戲內全螢幕切換請求:', event.data);

      // 防重複處理
      if (isProcessingFullscreen) {
        console.log('⚠️ 正在處理全螢幕請求，忽略重複請求');
        return;
      }

      setIsProcessingFullscreen(true);

      try {
        if (!isGameFullscreen) {
          console.log('🚀 執行進入全螢幕');
          await enterCSSFullscreen();
        } else {
          console.log('🔄 執行退出全螢幕');
          await exitCSSFullscreen();
        }
      } catch (error) {
        console.error('❌ 全螢幕切換失敗:', error);
      } finally {
        setTimeout(() => {
          setIsProcessingFullscreen(false);
        }, 500);
      }
    }
  };

  window.addEventListener('message', handleDualFullscreenMessage);

  return () => {
    window.removeEventListener('message', handleDualFullscreenMessage);
  };
}, [isGameFullscreen, isProcessingFullscreen]);
```

### 遊戲內發送請求

```javascript
// public/games/starshake-game/dist/index.html

function toggleFullscreen() {
    console.log('🖥️ 遊戲內全螢幕按鈕被點擊');
    
    // 發送 PostMessage 到父頁面
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'DUAL_FULLSCREEN_REQUEST',
            action: 'toggle',
            timestamp: Date.now(),
            source: 'game-fullscreen-button'
        }, '*');
        
        console.log('📤 已發送全螢幕請求到父頁面');
    } else {
        console.log('⚠️ 不在 iframe 中，使用本地全螢幕 API');
        // 備用方案：使用瀏覽器原生全螢幕 API
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}
```

### 通信消息格式

```typescript
// 全螢幕請求消息
interface FullscreenRequestMessage {
  type: 'DUAL_FULLSCREEN_REQUEST';
  action: 'toggle' | 'enter' | 'exit';
  timestamp: number;
  source?: string;
}

// 通信測試消息
interface CommunicationTestMessage {
  type: 'COMMUNICATION_TEST';
  testId: string;
  timestamp: number;
}

// 父頁面就緒消息
interface ParentReadyMessage {
  type: 'PARENT_LISTENER_READY';
  timestamp: number;
  parentUserAgent: string;
}
```

---

## 虛擬按鈕設計

### HTML 結構

```html
<!-- public/games/starshake-game/dist/index.html (行 64-155) -->

<div id="touch-controls">
    <!-- 虛擬搖桿 -->
    <div class="touch-joystick">
        <div class="touch-joystick-knob"></div>
    </div>
    
    <!-- 射擊按鈕 -->
    <button class="touch-shoot-btn">🚀</button>
    
    <!-- 全螢幕按鈕 -->
    <button class="fullscreen-btn">⛶</button>
</div>
```

### CSS 樣式設計

```css
/* 觸摸控制面板 */
#touch-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 240px;
    background: transparent;
    display: none;  /* 預設隱藏，媒體查詢控制顯示 */
    z-index: 1000;
    pointer-events: none;
}

/* 虛擬搖桿 */
.touch-joystick {
    position: absolute;
    bottom: 60px;
    left: 20px;
    width: 120px;
    height: 120px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    pointer-events: all;
}

.touch-joystick-knob {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: transform 0.1s;
}

/* 射擊按鈕 */
.touch-shoot-btn {
    position: absolute;
    bottom: 60px;
    right: 20px;
    width: 80px;
    height: 80px;
    background: #ff4757;
    border: none;
    border-radius: 50%;
    font-size: 32px;
    pointer-events: all;
}

/* 全螢幕按鈕 */
.fullscreen-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-size: 24px;
    pointer-events: all;
}

/* 媒體查詢：移動設備顯示 */
@media (max-width: 1024px) and (max-height: 768px),
       (pointer: coarse),
       (hover: none) and (pointer: coarse) {
    #touch-controls {
        display: block !important;
    }
}
```

### TouchControls JavaScript 類

```javascript
// public/games/starshake-game/dist/index.html (行 170-406)

class TouchControls {
    constructor() {
        this.joystick = document.querySelector('.touch-joystick');
        this.knob = document.querySelector('.touch-joystick-knob');
        this.shootBtn = document.querySelector('.touch-shoot-btn');
        this.fullscreenBtn = document.querySelector('.fullscreen-btn');
        
        this.joystickActive = false;
        this.joystickCenter = { x: 0, y: 0 };
        this.currentDirection = { x: 0, y: 0 };
        this.shooting = false;
        
        this.init();
    }
    
    init() {
        // 搖桿控制
        this.joystick.addEventListener('touchstart', this.onJoystickStart.bind(this), { passive: false });
        this.joystick.addEventListener('touchmove', this.onJoystickMove.bind(this), { passive: false });
        this.joystick.addEventListener('touchend', this.onJoystickEnd.bind(this), { passive: false });
        
        // 射擊按鈕
        this.shootBtn.addEventListener('touchstart', this.onShootStart.bind(this), { passive: false });
        this.shootBtn.addEventListener('touchend', this.onShootEnd.bind(this), { passive: false });
        
        // 全螢幕按鈕
        this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
    }
    
    updateJoystickPosition(clientX, clientY) {
        const deltaX = clientX - this.joystickCenter.x;
        const deltaY = clientY - this.joystickCenter.y;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 40;
        
        if (distance <= maxDistance) {
            this.knob.style.transform = `translate(${deltaX - 20}px, ${deltaY - 20}px)`;
            this.currentDirection = {
                x: deltaX / maxDistance,
                y: deltaY / maxDistance
            };
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            const limitedX = Math.cos(angle) * maxDistance;
            const limitedY = Math.sin(angle) * maxDistance;
            
            this.knob.style.transform = `translate(${limitedX - 20}px, ${limitedY - 20}px)`;
            this.currentDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
        }
    }
    
    getInputState() {
        return {
            direction: { ...this.currentDirection },
            shooting: this.shooting
        };
    }
}

// 初始化
window.touchControls = new TouchControls();
```

### 與 Phaser 遊戲整合

```javascript
// 在 Phaser 遊戲的 update 循環中讀取虛擬按鈕狀態

update() {
    // 獲取虛擬按鈕狀態
    const inputState = window.touchControls?.getInputState() || {
        direction: { x: 0, y: 0 },
        shooting: false
    };
    
    // 應用到玩家移動
    if (inputState.direction.x !== 0 || inputState.direction.y !== 0) {
        this.player.setVelocity(
            inputState.direction.x * this.playerSpeed,
            inputState.direction.y * this.playerSpeed
        );
    }
    
    // 處理射擊
    if (inputState.shooting && this.canShoot) {
        this.shoot();
    }
}
```

---

## 全螢幕實現

### CSS 全螢幕方案

```typescript
// components/games/GameSwitcher.tsx (行 670-731)

const enterCSSFullscreen = useCallback(() => {
    console.log('🚀 執行進入CSS全螢幕');

    const gameContainer = document.querySelector('[data-testid="game-container"]') as HTMLElement;
    const iframe = iframeRef.current;

    if (gameContainer && iframe) {
        // 隱藏上面的控制按鈕區域
        const gameHeader = document.querySelector('[data-testid="game-header"]') as HTMLElement;
        const geptSelector = document.querySelector('[data-testid="gept-selector"]') as HTMLElement;
        
        if (gameHeader) gameHeader.style.display = 'none';
        if (geptSelector) geptSelector.style.display = 'none';

        // 設置容器全螢幕
        gameContainer.style.position = 'fixed';
        gameContainer.style.top = '0';
        gameContainer.style.left = '0';
        gameContainer.style.width = '100vw';
        gameContainer.style.height = '100vh';
        gameContainer.style.zIndex = '9999';
        gameContainer.style.backgroundColor = '#000';

        // 設置 iframe 全螢幕
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';

        // 隱藏地址欄（移動設備）
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 1), 100);

        setIsGameFullscreen(true);
        console.log('✅ 進入CSS全螢幕完成');
    }
}, []);
```

### 退出全螢幕

```typescript
const exitCSSFullscreen = useCallback(() => {
    console.log('🔄 執行退出CSS全螢幕');

    const gameContainer = document.querySelector('[data-testid="game-container"]') as HTMLElement;
    const iframe = iframeRef.current;

    if (gameContainer && iframe) {
        // 恢復控制按鈕
        const gameHeader = document.querySelector('[data-testid="game-header"]') as HTMLElement;
        const geptSelector = document.querySelector('[data-testid="gept-selector"]') as HTMLElement;
        
        if (gameHeader) gameHeader.style.display = '';
        if (geptSelector) geptSelector.style.display = '';

        // 恢復容器樣式
        gameContainer.style.position = '';
        gameContainer.style.top = '';
        gameContainer.style.left = '';
        gameContainer.style.width = '';
        gameContainer.style.height = '';
        gameContainer.style.zIndex = '';

        // 恢復 iframe 樣式
        iframe.style.position = '';
        iframe.style.top = '';
        iframe.style.left = '';
        iframe.style.width = '';
        iframe.style.height = '';

        setIsGameFullscreen(false);
        console.log('✅ 退出CSS全螢幕完成');
    }
}, []);
```

### 跨瀏覽器全螢幕 API

```javascript
// 遊戲內備用方案：使用瀏覽器原生全螢幕 API

async function requestFullscreen(element) {
    try {
        // Safari iOS
        if (element.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();
        }
        // 標準 API
        else if (element.requestFullscreen) {
            await element.requestFullscreen();
        }
        // Firefox
        else if (element.mozRequestFullScreen) {
            await element.mozRequestFullScreen();
        }
        // IE
        else if (element.msRequestFullscreen) {
            await element.msRequestFullscreen();
        }
    } catch (error) {
        console.error('全螢幕請求失敗:', error);
    }
}
```

---

## 完整實踐範例

### 步驟 1：創建 Phaser 遊戲配置

```javascript
// src/main.js

import Phaser from "phaser";

// 動態解析度計算
function calculateGameDimensions() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  
  if (aspectRatio > 2.0) {
    return { gameWidth: 1600, gameHeight: 800 };
  } else if (aspectRatio > 1.5) {
    return { gameWidth: 1200, gameHeight: 800 };
  } else {
    return { gameWidth: 1000, gameHeight: 800 };
  }
}

const { gameWidth, gameHeight } = calculateGameDimensions();

const config = {
  width: gameWidth,
  height: gameHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  parent: "game-container",
  scene: [/* 你的場景 */],
};

const game = new Phaser.Game(config);
window.game = game;  // 暴露到全局供動態調整使用
```

### 步驟 2：添加虛擬按鈕

```html
<!-- dist/index.html -->

<div id="touch-controls">
    <div class="touch-joystick">
        <div class="touch-joystick-knob"></div>
    </div>
    <button class="touch-shoot-btn">🚀</button>
    <button class="fullscreen-btn">⛶</button>
</div>

<script>
class TouchControls {
    // ... (完整實現見上文)
}
window.touchControls = new TouchControls();
</script>
```

### 步驟 3：實現 PostMessage 通信

```javascript
// dist/index.html

// 全螢幕按鈕點擊處理
document.querySelector('.fullscreen-btn').addEventListener('click', () => {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'DUAL_FULLSCREEN_REQUEST',
            action: 'toggle',
            timestamp: Date.now()
        }, '*');
    }
});
```

### 步驟 4：React 父頁面整合

```typescript
// components/games/GameSwitcher.tsx

export default function GameSwitcher() {
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // PostMessage 監聽器
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') {
        if (!isGameFullscreen) {
          await enterCSSFullscreen();
        } else {
          await exitCSSFullscreen();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isGameFullscreen]);

  return (
    <div data-testid="game-container">
      <iframe
        ref={iframeRef}
        src="/games/your-game/dist/index.html"
        style={{ width: '100%', height: '90vh' }}
      />
    </div>
  );
}
```

### 步驟 5：添加動態解析度調整

```javascript
// dist/index.html

async function applyDynamicResolution() {
    await waitForPhaserGame();
    
    const { gameWidth, gameHeight } = calculateGameDimensions();
    
    if (window.game && window.game.scale) {
        window.game.scale.resize(gameWidth, gameHeight);
        window.game.scale.refresh();
    }
}

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(applyDynamicResolution, 500);
});

// 初始應用
applyDynamicResolution();
```

---

## 總結

### 關鍵要點

1. **FIT 模式**：保持遊戲比例，自動適應容器
2. **動態解析度**：根據螢幕寬高比調整遊戲解析度，消除黑邊
3. **PostMessage**：實現 iframe 與父頁面的雙向通信
4. **虛擬按鈕**：為移動設備提供觸控操作支援
5. **CSS 全螢幕**：跨瀏覽器的全螢幕實現方案

### 最佳實踐

- ✅ 使用 FIT 模式保持遊戲比例
- ✅ 根據螢幕寬高比動態調整解析度
- ✅ 使用 PostMessage 實現父子頁面通信
- ✅ 提供虛擬按鈕支援移動設備
- ✅ 實現 CSS 全螢幕作為主要方案
- ✅ 提供瀏覽器原生全螢幕 API 作為備用

### 參考資源

- **Starshake 遊戲源碼**：`public/games/starshake-game/`
- **GameSwitcher 組件**：`components/games/GameSwitcher.tsx`
- **Phaser 官方文檔**：https://photonstorm.github.io/phaser3-docs/

---

## 故障排除

### 常見問題 1：黑邊問題

**症狀**：遊戲上下或左右出現黑邊

**原因**：
- 遊戲解析度與螢幕寬高比不匹配
- FIT 模式為保持比例而添加的 letterbox

**解決方案**：
```javascript
// 使用動態解析度計算
function calculateGameDimensions() {
    const aspectRatio = window.innerWidth / window.innerHeight;

    // 根據寬高比選擇合適的解析度
    if (aspectRatio > 2.0) {
        return { gameWidth: Math.round(800 * aspectRatio), gameHeight: 800 };
    }
    // ... 其他情況
}
```

### 常見問題 2：PostMessage 不工作

**症狀**：點擊遊戲內全螢幕按鈕沒有反應

**診斷步驟**：
```javascript
// 1. 檢查是否在 iframe 中
console.log('在 iframe 中:', window.parent !== window);

// 2. 檢查父頁面監聽器
window.addEventListener('message', (event) => {
    console.log('收到消息:', event.data);
});

// 3. 測試發送消息
window.parent.postMessage({ type: 'TEST' }, '*');
```

**解決方案**：
- 確保父頁面有 message 監聽器
- 檢查消息格式是否正確
- 使用 `'*'` 作為 targetOrigin（開發環境）

### 常見問題 3：虛擬按鈕不顯示

**症狀**：移動設備上看不到虛擬按鈕

**診斷**：
```javascript
// 檢查媒體查詢
window.checkMediaQueries = function() {
    const queries = [
        '(max-width: 1024px)',
        '(pointer: coarse)',
        '(hover: none) and (pointer: coarse)'
    ];

    queries.forEach(query => {
        console.log(`${query}: ${window.matchMedia(query).matches}`);
    });
};
```

**解決方案**：
```css
/* 確保媒體查詢正確 */
@media (max-width: 1024px) and (max-height: 768px),
       (pointer: coarse),
       (hover: none) and (pointer: coarse) {
    #touch-controls {
        display: block !important;
    }
}
```

### 常見問題 4：全螢幕後遊戲變形

**症狀**：進入全螢幕後遊戲畫面拉伸或壓縮

**原因**：
- iframe 尺寸設置不正確
- Phaser scale 配置問題

**解決方案**：
```typescript
// 確保 iframe 完全填滿容器
iframe.style.width = '100vw';
iframe.style.height = '100vh';
iframe.style.position = 'absolute';
iframe.style.top = '0';
iframe.style.left = '0';

// Phaser 配置使用 FIT 模式
scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
}
```

### 常見問題 5：iOS Safari 全螢幕問題

**症狀**：iOS Safari 上全螢幕功能異常

**解決方案**：
```javascript
// 使用 CSS 全螢幕而非原生 API
// iOS Safari 對原生全螢幕 API 支援有限

// 隱藏地址欄
window.scrollTo(0, 1);
setTimeout(() => window.scrollTo(0, 1), 100);

// 使用 viewport meta 標籤
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

---

## 性能優化

### 1. 減少重繪

```javascript
// 使用 transform 而非 top/left
// ❌ 不好
element.style.top = '100px';
element.style.left = '100px';

// ✅ 好
element.style.transform = 'translate(100px, 100px)';
```

### 2. 防抖處理

```javascript
// resize 事件防抖
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        applyDynamicResolution();
    }, 500);  // 500ms 防抖
});
```

### 3. 虛擬按鈕優化

```javascript
// 使用 passive 事件監聽器
element.addEventListener('touchstart', handler, { passive: false });
element.addEventListener('touchmove', handler, { passive: false });

// 只在必要時阻止默認行為
onTouchMove(e) {
    if (this.joystickActive) {
        e.preventDefault();  // 只在搖桿激活時阻止
    }
}
```

### 4. Phaser 性能配置

```javascript
const config = {
    // ... 其他配置
    render: {
        antialias: false,      // 關閉抗鋸齒提升性能
        pixelArt: true,        // 像素藝術遊戲
        roundPixels: true,     // 像素對齊
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,      // 生產環境關閉調試
        },
    },
};
```

---

## 測試清單

### 桌面測試

- [ ] Chrome 瀏覽器正常運行
- [ ] Firefox 瀏覽器正常運行
- [ ] Safari 瀏覽器正常運行
- [ ] Edge 瀏覽器正常運行
- [ ] 全螢幕功能正常
- [ ] 視窗縮放時遊戲正常調整
- [ ] 鍵盤控制正常

### 移動設備測試

- [ ] iPhone Safari 正常運行
- [ ] Android Chrome 正常運行
- [ ] 虛擬按鈕顯示正常
- [ ] 虛擬搖桿操作流暢
- [ ] 射擊按鈕響應正常
- [ ] 全螢幕按鈕功能正常
- [ ] 橫向模式正常
- [ ] 直向模式正常

### 不同螢幕尺寸測試

- [ ] iPhone 14 (844×390)
- [ ] iPhone 14 Pro Max (932×430)
- [ ] iPad (1024×768)
- [ ] iPad Pro (1366×1024)
- [ ] 超寬顯示器 (3440×1440)

### PostMessage 通信測試

- [ ] 遊戲內全螢幕按鈕觸發父頁面全螢幕
- [ ] 父頁面全螢幕按鈕觸發遊戲全螢幕
- [ ] 通信延遲在可接受範圍內
- [ ] 錯誤處理正常

---

## 進階技巧

### 1. 自適應 UI 縮放

```javascript
// 根據螢幕尺寸動態調整 UI 元素大小
class ResponsiveUI {
    constructor(scene) {
        this.scene = scene;
        this.baseWidth = 1000;
        this.baseHeight = 800;
    }

    getScale() {
        const scaleX = this.scene.scale.width / this.baseWidth;
        const scaleY = this.scene.scale.height / this.baseHeight;
        return Math.min(scaleX, scaleY);
    }

    createScaledText(x, y, text, style) {
        const scale = this.getScale();
        const scaledStyle = {
            ...style,
            fontSize: `${parseInt(style.fontSize) * scale}px`
        };
        return this.scene.add.text(x, y, text, scaledStyle);
    }
}
```

### 2. 多點觸控支援

```javascript
class MultiTouchControls {
    constructor() {
        this.touches = new Map();
        this.init();
    }

    init() {
        document.addEventListener('touchstart', (e) => {
            for (let touch of e.changedTouches) {
                this.touches.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY,
                    target: touch.target
                });
            }
        });

        document.addEventListener('touchend', (e) => {
            for (let touch of e.changedTouches) {
                this.touches.delete(touch.identifier);
            }
        });
    }

    getTouchCount() {
        return this.touches.size;
    }
}
```

### 3. 遊戲狀態同步

```javascript
// 父頁面與遊戲狀態同步
class GameStateSync {
    constructor() {
        this.state = {
            score: 0,
            level: 1,
            lives: 3
        };
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };

        // 發送到父頁面
        window.parent.postMessage({
            type: 'GAME_STATE_UPDATE',
            state: this.state,
            timestamp: Date.now()
        }, '*');
    }
}
```

### 4. 離線支援

```javascript
// Service Worker 註冊
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker 註冊成功'))
        .catch(err => console.log('Service Worker 註冊失敗', err));
}

// sw.js
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('game-cache-v1').then((cache) => {
            return cache.addAll([
                '/games/your-game/dist/index.html',
                '/games/your-game/dist/assets/index.js',
                // ... 其他資源
            ]);
        })
    );
});
```

---

## 部署注意事項

### 1. 資源路徑

```html
<!-- 使用絕對路徑 -->
<script src="/games/starshake-game/dist/assets/index.js"></script>

<!-- 而非相對路徑 -->
<script src="./assets/index.js"></script>
```

### 2. CORS 配置

```javascript
// Vercel vercel.json
{
  "headers": [
    {
      "source": "/games/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 3. 壓縮優化

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console.log
      },
    },
  },
};
```

### 4. 資源預載入

```html
<link rel="preload" href="/games/starshake-game/dist/assets/index.js" as="script">
<link rel="preload" href="/games/starshake-game/dist/assets/phaser.js" as="script">
```

---

## 附錄

### A. Phaser Scale 模式對比

| 模式 | 描述 | 優點 | 缺點 | 使用場景 |
|------|------|------|------|----------|
| FIT | 保持比例，完整可見 | 不變形 | 可能有黑邊 | 固定比例遊戲 |
| ENVELOP | 填滿容器 | 無黑邊 | 可能裁切 | 背景遊戲 |
| RESIZE | 動態調整 | 完全填滿 | 可能變形 | 響應式 UI |
| NONE | 不縮放 | 完全控制 | 需手動處理 | 自定義邏輯 |

### B. 觸控事件對比

| 事件 | 觸發時機 | 是否冒泡 | 可取消 |
|------|---------|---------|--------|
| touchstart | 觸摸開始 | 是 | 是 |
| touchmove | 觸摸移動 | 是 | 是 |
| touchend | 觸摸結束 | 是 | 是 |
| touchcancel | 觸摸取消 | 是 | 否 |

### C. PostMessage 安全性

```javascript
// ❌ 不安全：接受所有來源
window.addEventListener('message', (event) => {
    // 沒有驗證 event.origin
    handleMessage(event.data);
});

// ✅ 安全：驗證來源
window.addEventListener('message', (event) => {
    // 驗證來源
    if (event.origin !== 'https://your-domain.com') {
        return;
    }

    // 驗證消息格式
    if (!event.data || typeof event.data !== 'object') {
        return;
    }

    handleMessage(event.data);
});
```

### D. 調試工具

```javascript
// 全局調試工具
window.gameDebug = {
    // 顯示遊戲信息
    info() {
        console.log('遊戲尺寸:', window.game.scale.width, 'x', window.game.scale.height);
        console.log('螢幕尺寸:', window.innerWidth, 'x', window.innerHeight);
        console.log('寬高比:', (window.innerWidth / window.innerHeight).toFixed(2));
    },

    // 測試虛擬按鈕
    testControls() {
        return window.touchControls?.testControls();
    },

    // 測試 PostMessage
    testMessage() {
        window.parent.postMessage({ type: 'TEST', timestamp: Date.now() }, '*');
    },

    // 強制顯示虛擬按鈕
    showControls() {
        document.getElementById('touch-controls').style.display = 'block';
    }
};
```

---

**文檔版本**：1.0
**最後更新**：2025-10-01
**基於專案**：EduCreate - Starshake Game
**作者**：EduCreate 開發團隊

