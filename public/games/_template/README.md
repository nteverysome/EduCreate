# 🎮 EduCreate 遊戲模板

🏆 **基於 shimozurdo-game 的成功架構**

## 📦 包含內容

- ✅ shimozurdo-game 的 Camera Zoom 響應式系統
- ✅ 固定設計尺寸（960×540）+ 自動縮放
- ✅ Mobile 完美支援（已在 shimozurdo-game 驗證）
- ✅ 自動管理器初始化（GEPT、SRS、Bilingual）
- ✅ 原生 ES6 模組（不需要打包工具）
- ✅ 標準場景結構

## 📖 使用說明

### 1. 創建新遊戲

```bash
# 複製模板到新遊戲目錄
cp -r public/games/_template public/games/my-new-game

# 進入新遊戲目錄
cd public/games/my-new-game
```

### 2. 修改配置

編輯 `config.js`：

```javascript
// 修改遊戲名稱
const GAME_NAME = 'my-new-game';

// 🏆 shimozurdo-game 標準設計尺寸
const DESIGN_WIDTH = 960;    // shimozurdo-game 標準
const DESIGN_HEIGHT = 540;   // shimozurdo-game 標準

// 導入你的遊戲場景
import GameScene from './scenes/game.js';
```

### 3. 創建遊戲場景

在 `scenes/game.js` 中：

```javascript
import BaseScene from '/games/shared/core/BaseScene.js';

export default class GameScene extends BaseScene {
  constructor() {
    super('game', {
      enableResponsive: true,   // 啟用響應式
      enableGEPT: true,         // 啟用 GEPT 管理器
      enableSRS: true,          // 啟用 SRS 管理器
      enableBilingual: true,    // 啟用雙語管理器
      designWidth: 1920,        // 設計寬度
      designHeight: 1080        // 設計高度
    });
  }

  create() {
    super.create();  // ✅ 必須調用
    
    // 🎯 使用固定設計尺寸
    const centerX = this.getDesignCenterX();  // 960
    const centerY = this.getDesignCenterY();  // 540
    
    // 你的遊戲邏輯...
    this.add.text(centerX, centerY, 'Hello World', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
  
  // 可選：響應式回調
  onResize(width, height) {
    console.log('視窗大小變化:', width, height);
    // 你的響應式邏輯...
  }
}
```

### 4. 啟動遊戲

在瀏覽器中打開：
```
http://localhost:3000/games/my-new-game
```

---

## ✅ 模板已包含的功能

### 1. 統一的響應式系統
- ✅ RESIZE 模式 + Camera Zoom
- ✅ 固定設計尺寸（1920x1080）
- ✅ 自動縮放到任何螢幕
- ✅ Mobile 完美支援

### 2. 自動管理器初始化
- ✅ GEPT 管理器（詞彙管理）
- ✅ SRS 管理器（間隔重複系統）
- ✅ Bilingual 管理器（雙語支援）

### 3. 標準化的場景結構
- ✅ Handler（場景管理器）
- ✅ Preload（資源預載）
- ✅ Game（遊戲場景）

### 4. 開發便利性
- ✅ 固定座標系統（不需要動態計算）
- ✅ 輔助方法（getDesignWidth、getDesignCenterX 等）
- ✅ 自動錯誤處理

---

## 🎯 BaseScene 提供的方法

### 設計尺寸方法
```javascript
this.getDesignWidth()      // 1920
this.getDesignHeight()     // 1080
this.getDesignCenterX()    // 960
this.getDesignCenterY()    // 540
```

### 管理器訪問
```javascript
this.geptManager           // GEPT 管理器
this.srsManager            // SRS 管理器
this.bilingualManager      // 雙語管理器
```

### 響應式回調
```javascript
onResize(width, height) {
  // 視窗大小變化時調用
}
```

---

## 📊 與舊遊戲的對比

| 項目 | 舊方式 | 新模板 |
|------|--------|--------|
| **響應式** | 手動計算 | 自動處理 |
| **座標系統** | 動態計算 | 固定設計尺寸 |
| **管理器** | 手動初始化 | 自動初始化 |
| **Mobile 支援** | 需要修復 | 完美支援 |
| **開發時間** | 1-2 天 | 1-2 小時 |

---

## 🚀 進階使用

### 自定義設計尺寸

```javascript
export default class GameScene extends BaseScene {
  constructor() {
    super('game', {
      designWidth: 1280,   // 自定義寬度
      designHeight: 720    // 自定義高度
    });
  }
}
```

### 禁用某些管理器

```javascript
export default class GameScene extends BaseScene {
  constructor() {
    super('game', {
      enableGEPT: false,      // 不需要 GEPT
      enableSRS: false,       // 不需要 SRS
      enableBilingual: true   // 只需要雙語
    });
  }
}
```

---

## 🔧 故障排除

### 問題：遊戲沒有顯示
- 檢查 Console 是否有錯誤
- 確認 Phaser 已載入
- 確認場景已正確導入

### 問題：響應式不工作
- 確認場景繼承自 BaseScene
- 確認調用了 `super.create()`
- 檢查 Console 是否有響應式初始化日誌

### 問題：管理器未初始化
- 確認 HTML 中已載入管理器腳本
- 確認場景選項中啟用了對應管理器
- 檢查 Console 是否有管理器初始化日誌

---

## 🆕 v132.0 - 動態卡片尺寸調整系統

### 📖 新功能說明

模板現已支援 **v132.0 動態卡片尺寸調整系統**，可根據容器寬度和高度自動調整卡片尺寸。

### 🎯 適用場景

✅ 需要響應式卡片佈局的遊戲
✅ 卡片數量可變的遊戲
✅ 需要充分利用屏幕空間的遊戲

### 📚 使用指南

詳見：[動態卡片尺寸調整指南](./DYNAMIC_CARD_SIZING_GUIDE.md)

### 🔄 版本更新

- v132.0 (2025-11-23) - 雙軸動態縮放系統
- v73.0 (2025-11-16) - Camera Zoom 修復

---

## 📚 相關文件

- [BaseScene 源碼](../shared/core/BaseScene.js)
- [響應式系統說明](../shared/core/README.md)
- [管理器使用指南](../shared/managers/README.md)
- [動態卡片尺寸調整指南](./DYNAMIC_CARD_SIZING_GUIDE.md)
- [模板系統更新 v132.0](../TEMPLATE_SYSTEM_UPDATE_v132.0_DYNAMIC_SIZING.md)

