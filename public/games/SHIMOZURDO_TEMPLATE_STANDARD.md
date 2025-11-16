# 🏆 shimozurdo-game 模板標準

## 為什麼 shimozurdo-game 是最佳模板？

### ✅ 已驗證的成功架構

1. **Mobile 完美支援** - 在真實設備上測試通過
2. **Camera Zoom 方法** - 業界標準的響應式解決方案
3. **固定設計尺寸** - 960×540，簡化開發
4. **原生 ES6 模組** - 不需要打包工具
5. **完整的管理器系統** - GEPT、SRS、Bilingual

---

## 🎯 核心架構

### 1. 固定設計尺寸

```javascript
const DESIGN_WIDTH = 960;    // shimozurdo-game 標準
const DESIGN_HEIGHT = 540;   // shimozurdo-game 標準
```

**為什麼選擇 960×540？**
- ✅ 16:9 比例（最常見的螢幕比例）
- ✅ 適中的尺寸（不會太大或太小）
- ✅ 易於計算（960 = 1920/2, 540 = 1080/2）
- ✅ 已在 shimozurdo-game 驗證

### 2. Camera Zoom 響應式系統

```javascript
// handler.js 的核心方法
updateResize(scene) {
  scene.scale.on('resize', this.resize, scene);
  
  scene.parent = new Phaser.Structs.Size(scaleWidth, scaleHeight);
  scene.sizer = new Phaser.Structs.Size(
    scene.game.screenBaseSize.width,
    scene.game.screenBaseSize.height,
    Phaser.Structs.Size.FIT,  // 🔥 關鍵：FIT 模式
    scene.parent
  );
  
  this.updateCamera(scene);
}

resize(gameSize) {
  const scaleX = this.sizer.width / this.game.screenBaseSize.width;
  const scaleY = this.sizer.height / this.game.screenBaseSize.height;
  
  camera.setZoom(Math.max(scaleX, scaleY));  // 🔥 關鍵：Camera Zoom
  camera.centerOn(
    this.game.screenBaseSize.width / 2,
    this.game.screenBaseSize.height / 2
  );
}
```

**為什麼這個方法最好？**
- ✅ **Phaser.Structs.Size.FIT** - 自動計算縮放比例
- ✅ **camera.setZoom()** - 視覺縮放，不改變座標系統
- ✅ **固定座標** - 開發時使用固定座標（如 480, 270）
- ✅ **自動適應** - 自動適應所有螢幕尺寸

### 3. 原生 ES6 模組

```html
<!-- index.html -->
<script src="//cdn.jsdelivr.net/npm/phaser@3.53.1/dist/phaser.min.js"></script>
<script type="module" src="./config.js"></script>
```

**為什麼不需要打包工具？**
- ✅ 瀏覽器原生支援 ES6 模組
- ✅ 開發簡單快速
- ✅ 調試容易
- ✅ 部署簡單（複製文件夾即可）

---

## 📊 與其他方案的對比

| 方案 | shimozurdo-game | match-up-game（舊版） | 官方模板 |
|------|----------------|---------------------|---------|
| **響應式方法** | Camera Zoom | 手動計算 | 無 |
| **設計尺寸** | 960×540 固定 | 動態計算 | 無標準 |
| **Mobile 支援** | ✅ 完美 | ❌ 裁切問題 | ⚠️ 基礎 |
| **開發複雜度** | ✅ 簡單 | ❌ 複雜 | ⚠️ 中等 |
| **打包工具** | ❌ 不需要 | ❌ 不需要 | ✅ 需要 |
| **管理器系統** | ✅ 完整 | ✅ 完整 | ❌ 無 |

---

## 🚀 使用 shimozurdo-game 模板

### 快速開始

```bash
# 1. 複製模板
cp -r public/games/_template public/games/my-game

# 2. 修改 config.js
# - 改 GAME_NAME
# - 導入你的場景

# 3. 創建遊戲場景
# - 使用固定座標（960×540）
# - 調用 handler.updateResize(this)

# 4. 打開瀏覽器測試
http://localhost:3000/games/my-game
```

### 遊戲場景範例

```javascript
// scenes/game.js
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }
  
  create() {
    // 🔥 關鍵：啟用響應式系統
    const handler = this.scene.get('handler');
    handler.updateResize(this);
    
    // 使用固定座標開發
    const centerX = 960 / 2;  // 480
    const centerY = 540 / 2;  // 270
    
    this.add.text(centerX, centerY, 'Hello World', {
      fontSize: '32px'
    }).setOrigin(0.5);
  }
}
```

---

## 🎉 總結

### shimozurdo-game 是最佳模板因為：

1. ✅ **已驗證** - 在真實專案中成功運行
2. ✅ **簡單** - 不需要複雜的配置
3. ✅ **可靠** - Mobile 完美支援
4. ✅ **標準** - 統一的架構
5. ✅ **快速** - 不需要打包工具

### 下一步

1. ✅ **測試 match-up-game** - 驗證修復效果
2. ✅ **遷移其他遊戲** - 使用 shimozurdo-game 架構
3. ✅ **創建新遊戲** - 使用 _template 模板

---

**🏆 shimozurdo-game = EduCreate 遊戲開發的黃金標準！**

