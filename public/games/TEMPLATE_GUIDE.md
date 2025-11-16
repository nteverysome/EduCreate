# 🎮 EduCreate 遊戲模板系統完整指南

## 🎯 為什麼需要模板系統？

### 問題
- ❌ 每次開發新遊戲都要重新處理響應式
- ❌ 重複實現管理器初始化
- ❌ Mobile 適配問題反覆出現
- ❌ 缺乏統一的代碼標準

### 解決方案
- ✅ 統一的遊戲模板
- ✅ 自動響應式處理
- ✅ 標準化的管理器系統
- ✅ 固定設計尺寸 + 自動縮放

---

## 📁 模板系統架構

```
public/games/
├── _template/                    # 🆕 遊戲模板
│   ├── index.html               # 標準 HTML
│   ├── config.js                # 標準配置
│   ├── scenes/
│   │   ├── handler.js           # 場景管理器
│   │   ├── preload.js           # 資源預載
│   │   └── game.js              # 遊戲場景模板
│   └── README.md                # 使用說明
│
├── shared/                       # 🆕 共享代碼庫
│   ├── core/
│   │   └── BaseScene.js         # 🔥 基礎場景類
│   ├── managers/
│   │   ├── GEPTManager.js       # GEPT 管理器
│   │   ├── SRSManager.js        # SRS 管理器
│   │   └── BilingualManager.js  # 雙語管理器
│   └── utils/
│       ├── result-collector.js  # 結果收集器
│       └── sm2.js                # SRS 算法
│
├── match-up-game/               # 現有遊戲
├── shimozurdo-game/             # 現有遊戲
└── airplane-game/               # 現有遊戲
```

---

## 🚀 快速開始

### 步驟 1：創建新遊戲

```bash
# 複製模板
cp -r public/games/_template public/games/word-match-game

# 進入目錄
cd public/games/word-match-game
```

### 步驟 2：修改配置

編輯 `config.js`：

```javascript
const GAME_NAME = 'word-match-game';  // 遊戲名稱

// 設計尺寸（可選，預設 1920x1080）
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

// 導入場景
import GameScene from './scenes/game.js';
```

### 步驟 3：創建遊戲場景

創建 `scenes/game.js`：

```javascript
import BaseScene from '/games/shared/core/BaseScene.js';

export default class GameScene extends BaseScene {
  constructor() {
    super('game');
  }

  create() {
    super.create();  // ✅ 必須調用
    
    // 使用固定設計尺寸
    const centerX = this.getDesignCenterX();  // 960
    const centerY = this.getDesignCenterY();  // 540
    
    // 你的遊戲邏輯
    this.createCards();
  }
  
  createCards() {
    // 使用固定座標，不需要動態計算
    const cardX = 480;   // 固定位置
    const cardY = 270;
    
    this.add.image(cardX, cardY, 'card');
  }
}
```

### 步驟 4：啟動遊戲

```
http://localhost:3000/games/word-match-game
```

---

## 🔥 核心：BaseScene 基礎類

### 功能

1. **自動響應式處理**
   - RESIZE 模式 + Camera Zoom
   - 固定設計尺寸（1920x1080）
   - 自動縮放到任何螢幕

2. **自動管理器初始化**
   - GEPT 管理器
   - SRS 管理器
   - Bilingual 管理器

3. **輔助方法**
   - `getDesignWidth()` - 獲取設計寬度
   - `getDesignHeight()` - 獲取設計高度
   - `getDesignCenterX()` - 獲取中心 X
   - `getDesignCenterY()` - 獲取中心 Y

### 使用方法

```javascript
import BaseScene from '/games/shared/core/BaseScene.js';

export default class MyScene extends BaseScene {
  constructor() {
    super('my-scene', {
      enableResponsive: true,   // 啟用響應式
      enableGEPT: true,         // 啟用 GEPT
      enableSRS: true,          // 啟用 SRS
      enableBilingual: true,    // 啟用雙語
      designWidth: 1920,        // 設計寬度
      designHeight: 1080        // 設計高度
    });
  }

  create() {
    super.create();  // ✅ 必須調用
    
    // 你的代碼...
  }
  
  // 可選：響應式回調
  onResize(width, height) {
    console.log('視窗大小變化');
  }
}
```

---

## 📊 模板 vs 手動開發對比

| 項目 | 手動開發 | 使用模板 |
|------|---------|---------|
| **響應式設置** | 50-100 行代碼 | 0 行（自動） |
| **管理器初始化** | 30-50 行代碼 | 0 行（自動） |
| **Mobile 適配** | 需要調試修復 | 完美支援 |
| **座標計算** | 動態計算（複雜） | 固定尺寸（簡單） |
| **開發時間** | 1-2 天 | 1-2 小時 |
| **維護成本** | 高 | 低 |

---

## 🎯 遷移現有遊戲

### Match-up Game 遷移示例

**之前（複雜）**：
```javascript
updateLayout() {
  const width = this.scale.width;   // 動態
  const height = this.scale.height; // 動態
  
  const cardX = width * 0.25;       // 百分比計算
  const cardY = height * 0.3;
  
  // 複雜的響應式邏輯...
}
```

**之後（簡單）**：
```javascript
import BaseScene from '/games/shared/core/BaseScene.js';

export default class GameScene extends BaseScene {
  create() {
    super.create();
    
    const cardX = 480;   // 固定座標（1920 * 0.25）
    const cardY = 324;   // 固定座標（1080 * 0.3）
    
    // 簡單！
  }
}
```

---

## 🔧 進階配置

### 自定義設計尺寸

```javascript
export default class GameScene extends BaseScene {
  constructor() {
    super('game', {
      designWidth: 1280,   // 自定義
      designHeight: 720
    });
  }
}
```

### 選擇性啟用管理器

```javascript
export default class GameScene extends BaseScene {
  constructor() {
    super('game', {
      enableGEPT: true,       // 需要
      enableSRS: false,       // 不需要
      enableBilingual: false  // 不需要
    });
  }
}
```

---

## 📚 下一步

1. **閱讀** [模板 README](/_template/README.md)
2. **查看** [BaseScene 源碼](/shared/core/BaseScene.js)
3. **創建** 你的第一個遊戲
4. **遷移** 現有遊戲到新模板

---

## 🎉 總結

使用模板系統後：
- ✅ **不再重複造輪子**
- ✅ **統一的代碼標準**
- ✅ **更快的開發速度**
- ✅ **更低的維護成本**
- ✅ **完美的 Mobile 支援**

**開始使用模板，專注於遊戲邏輯，而不是基礎架構！**

