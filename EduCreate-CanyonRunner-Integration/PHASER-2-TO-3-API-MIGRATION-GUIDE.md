# 🔄 Phaser 2.1.3 → 3.90.0 API 遷移對照表

## 📋 核心架構變化

### 🏗️ **State → Scene 系統**

#### Phaser 2.1.3 (舊)
```javascript
// Boot.js
CanyonRunner.Boot = function (game) {};
CanyonRunner.Boot.prototype = {
    preload: function () {},
    create: function () {
        this.state.start('Preloader');
    }
};

// 註冊狀態
game.state.add('Boot', CanyonRunner.Boot);
game.state.start('Boot');
```

#### Phaser 3.90.0 (新)
```javascript
// BootScene.js
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {}
    
    create() {
        this.scene.start('PreloaderScene');
    }
}

// 註冊場景
const config = {
    scene: [BootScene, PreloaderScene, MainMenuScene]
};
```

### 🎮 **遊戲初始化**

#### Phaser 2.1.3 (舊)
```javascript
var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game-div');
game.state.add('Boot', CanyonRunner.Boot);
```

#### Phaser 3.90.0 (新)
```javascript
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-div',
    scene: [BootScene, PreloaderScene, MainMenuScene],
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    }
};
const game = new Phaser.Game(config);
```

## 🖼️ **圖片和精靈系統**

### 📥 **圖片加載**

#### Phaser 2.1.3 (舊)
```javascript
// Preloader.js
this.game.load.image('simple-white-cloud', 'assets/sprites/simple-white-cloud.png');
this.game.load.atlasJSONHash('sprites', 'assets/sprites/sprites.png', 'assets/sprites/sprites.json');
```

#### Phaser 3.90.0 (新)
```javascript
// PreloaderScene.js
this.load.image('simple-white-cloud', 'assets/sprites/simple-white-cloud.png');
this.load.atlas('sprites', 'assets/sprites/sprites.png', 'assets/sprites/sprites.json');
```

### 🎭 **精靈創建和操作**

#### Phaser 2.1.3 (舊)
```javascript
// 創建精靈
this.player = this.game.add.sprite(64, 64, 'sprites', 'rocket-sprite');

// 錨點設置
this.player.anchor.setTo(0.5, 0.5);

// 縮放翻轉
this.player.scale.x = -1;

// 固定到相機
this.player.fixedToCamera = true;

// 深度（z-index）
this.player.bringToTop();
```

#### Phaser 3.90.0 (新)
```javascript
// 創建精靈
this.player = this.add.sprite(64, 64, 'sprites', 'rocket-sprite');

// 原點設置（替代錨點）
this.player.setOrigin(0.5, 0.5);

// 翻轉（不改變縮放）
this.player.setFlipX(true);

// 滾動因子（替代固定到相機）
this.player.setScrollFactor(0);

// 深度控制
this.player.setDepth(10);
```

### 🎯 **群組和容器**

#### Phaser 2.1.3 (舊)
```javascript
// 創建群組
this.vocabulary_clouds = this.game.add.group();
this.vocabulary_clouds.createMultiple(20, 'sprites', 'smoke-puff');

// 添加子物件
this.vocabulary_clouds.add(cloudSprite);
```

#### Phaser 3.90.0 (新)
```javascript
// 創建群組
this.vocabulary_clouds = this.add.group();

// 創建多個精靈
for (let i = 0; i < 20; i++) {
    const cloud = this.add.sprite(0, 0, 'sprites', 'smoke-puff');
    this.vocabulary_clouds.add(cloud);
}

// 或使用容器（如需要變換）
this.cloudContainer = this.add.container(0, 0);
this.cloudContainer.add(cloudSprite);
```

## 🎮 **輸入系統**

### 🖱️ **滑鼠/觸控輸入**

#### Phaser 2.1.3 (舊)
```javascript
// 全域輸入
this.game.input.onDown.add(this.handleClick, this);

// 精靈輸入
sprite.inputEnabled = true;
sprite.events.onInputDown.add(this.spriteClicked, this);
```

#### Phaser 3.90.0 (新)
```javascript
// 全域輸入
this.input.on('pointerdown', this.handleClick, this);

// 精靈輸入
sprite.setInteractive();
sprite.on('pointerdown', this.spriteClicked, this);
```

### ⌨️ **鍵盤輸入**

#### Phaser 2.1.3 (舊)
```javascript
// 鍵盤輸入
this.cursors = this.game.input.keyboard.createCursorKeys();
if (this.cursors.left.isDown) {
    // 處理左鍵
}
```

#### Phaser 3.90.0 (新)
```javascript
// 鍵盤輸入
this.cursors = this.input.keyboard.createCursorKeys();
if (this.cursors.left.isDown) {
    // 處理左鍵
}
```

## ⚡ **物理系統**

### 🏃 **物理啟用和設置**

#### Phaser 2.1.3 (舊)
```javascript
// 啟用物理
this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

// 設置速度
this.player.body.velocity.x = 100;

// 碰撞檢測
this.game.physics.arcade.collide(player, rocks);
```

#### Phaser 3.90.0 (新)
```javascript
// 啟用物理（在場景配置中已設置）
this.physics.add.existing(this.player);

// 設置速度
this.player.body.setVelocity(100, 0);

// 碰撞檢測
this.physics.add.collider(player, rocks);
```

## 🔊 **音效系統**

### 🎵 **音效加載和播放**

#### Phaser 2.1.3 (舊)
```javascript
// 加載音效
this.game.load.audio('bgm', 'assets/audio/bgm.mp3');

// 播放音效
this.bgm = this.game.add.audio('bgm');
this.bgm.play();
```

#### Phaser 3.90.0 (新)
```javascript
// 加載音效
this.load.audio('bgm', 'assets/audio/bgm.mp3');

// 播放音效
this.bgm = this.sound.add('bgm');
this.bgm.play();
```

## 🎨 **粒子系統**

### ✨ **粒子發射器**

#### Phaser 2.1.3 (舊)
```javascript
// 創建粒子發射器
this.emitter = this.game.add.emitter(x, y, 400);
this.emitter.makeParticles('sprites', ['smoke-puff']);
this.emitter.start(false, 3000, 5);
```

#### Phaser 3.90.0 (新)
```javascript
// 創建粒子發射器
this.emitter = this.add.particles(x, y, 'sprites', {
    frame: 'smoke-puff',
    lifespan: 3000,
    frequency: 200,
    scale: { start: 0.4, end: 0 }
});
```

## 📱 **相機系統**

### 📷 **相機控制**

#### Phaser 2.1.3 (舊)
```javascript
// 相機跟隨
this.game.camera.follow(this.player);

// 相機邊界
this.game.camera.setBoundsToWorld();
```

#### Phaser 3.90.0 (新)
```javascript
// 相機跟隨
this.cameras.main.startFollow(this.player);

// 相機邊界
this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

// 多相機支援
const minimap = this.cameras.add(600, 0, 200, 200);
minimap.setZoom(0.2);
```

## 🎯 **CanyonRunner 特定遷移**

### 🎮 **VocabularyCloudSystem 升級**

#### Phaser 2.1.3 (舊)
```javascript
// 當前實現
this.levelGameState.vocabulary_clouds.createMultiple(20, 'sprites', 'smoke-puff');
cloud.tint = 0xFFFFFF;
```

#### Phaser 3.90.0 (新)
```javascript
// 升級後實現
for (let i = 0; i < 20; i++) {
    const cloud = this.add.sprite(0, 0, 'sprites', 'smoke-puff');
    cloud.setTint(0xFFFFFF);
    this.vocabulary_clouds.add(cloud);
}
```

### 🔧 **EduCreate 整合適配**

#### 保持兼容的接口
```javascript
// EduCreateIntegration.js 適配
class EduCreateIntegration {
    constructor(scene) {  // 改為接收 scene 而非 gameState
        this.scene = scene;
        this.game = scene.game;  // 保持 game 引用
    }
    
    // 保持原有方法簽名，內部實現升級
    initialize() {
        // 適配 Phaser 3 的新 API
    }
}
```

---

## 🚀 **下一步：開始實際遷移**

準備好開始 Phase 1 環境準備了嗎？我們將：
1. 安裝 Phaser 3.90.0
2. 配置現代構建工具
3. 設置開發環境
4. 開始第一個 Scene 的遷移

您希望使用 **Webpack 5** 還是 **Vite** 作為構建工具？
