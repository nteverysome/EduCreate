// 🎨 導入視覺風格配置
import { VISUAL_STYLE_ASSETS } from '../config/visual-styles.js';

// 🎯 圖片大小常量 - 智能縮放系統
const CLOUD_MAX_IMAGE_SIZE = {
    small: 60,    // 小圖片最大 60x60 像素
    medium: 80,   // 中圖片最大 80x80 像素
    large: 100    // 大圖片最大 100x100 像素
};

const TARGET_MAX_IMAGE_SIZE = {
    small: 80,    // 小圖片最大 80x80 像素
    medium: 100,  // 中圖片最大 100x100 像素
    large: 120    // 大圖片最大 120x120 像素
};

export default class Title extends Phaser.Scene {

    // Vars - 場景變數定義
    handlerScene = false        // 場景管理器引用
    sceneStopped = false        // 場景停止狀態標記
    backgroundLayers = null     // 視差背景層物件容器
    scrollPositions = null      // 各背景層滾動位置記錄

    constructor() {
        super({ key: 'title' })  // 註冊場景名稱為 'title'
    }

    preload() {
        this.sceneStopped = false                        // 重置場景停止狀態
        this.width = this.game.screenBaseSize.width     // 獲取設計基準寬度
        this.height = this.game.screenBaseSize.height   // 獲取設計基準高度
        this.handlerScene = this.scene.get('handler')   // 獲取場景管理器引用
        this.handlerScene.sceneRunning = 'title'        // 通知管理器當前運行場景

        // 🎨 視覺風格資源已在 PreloadScene 中載入，這裡不需要再次載入
        console.log('🎨 TitleScene 啟動，視覺風格資源已在 PreloadScene 中載入');
    }

    create() {
        const { width, height } = this                   // 解構賦值獲取寬高

        // 🎮 讀取遊戲選項
        this.gameOptions = this.game.gameOptions || {
            timer: { type: 'countUp', minutes: 5, seconds: 0 },
            lives: 5,
            speed: 3,
            random: true,
            showAnswers: true,
            visualStyle: 'clouds'
        };
        console.log('🎮 Title 場景使用的遊戲選項:', this.gameOptions);

        // 🎨 應用視覺風格
        this.applyVisualStyle(this.gameOptions.visualStyle);

        // 🎮 記錄遊戲開始時間
        this.gameStartTime = Date.now();
        console.log('🎮 遊戲開始時間記錄:', new Date(this.gameStartTime).toLocaleTimeString());

        // 🧠 初始化 SRS 相關變數
        this.srsManager = this.game.srsManager || null;
        this.answerStartTime = Date.now();  // 記錄答題開始時間

        if (this.srsManager) {
            console.log('🧠 SRS 模式已啟用');
            // 顯示 SRS 進度
            this.createSRSProgressDisplay();
        }

        // 🔧 修復：在場景創建時立即清理攔截層
        this.cleanupInterceptLayers();

        // CONFIG SCENE - 場景配置區塊
        this.handlerScene.updateResize(this)             // 更新響應式配置
        if (this.game.debugMode)                         // 如果是調試模式
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)  // 顯示輔助參考線
        // CONFIG SCENE

        // 創建視差背景 - 多層滾動背景系統
        this.createParallaxBackground()

        // 🚀 創建太空船（防禦性編程）- 主角太空船系統
        this.createSpaceship()

        // ☁️ 創建敵人系統 - 雲朵敵人生成和管理
        this.createEnemySystem()

        // ❤️ 創建生命值系統 - 玩家血量顯示和管理
        this.createHealthSystem()

        // 🆕 創建目標詞彙顯示系統 - 從 Airplane Game 移植
        this.createTargetWordDisplay()

        // 🖼️ 預載入所有詞彙的圖片 - 確保第一輪就能顯示圖片
        this.preloadVocabularyImages()

        // 🆕 設置隨機目標詞彙 - 初始化第一個學習目標
        this.setRandomTargetWord()

        // GAME OBJECTS - 遊戲物件區塊
        // 初始化響應式元素數組 - 用於螢幕尺寸變化時的元素調整
        this.testElements = [];

        // 註冊響應式元素 - 將所有需要響應式調整的元素註冊到系統
        this.registerResponsiveElements();

        // 🔧 監聽視口變化事件 - 確保目標單字在全螢幕模式下正確顯示
        this.scale.on('resize', this.handleResize, this);
        // GAME OBJECTS

        // 🎮 應用遊戲選項
        this.applyGameOptions();
    }

    /**
     * 🔧 處理視口大小變化 - 當進入/退出全螢幕時更新目標單字位置
     * @param {Object} gameSize - 新的遊戲尺寸
     */
    handleResize(gameSize) {
        console.log('🔧 視口大小變化:', gameSize.width, 'x', gameSize.height);

        // 如果有當前目標詞彙，重新更新其顯示位置
        if (this.currentTargetWord) {
            // 五列布局會在 updateUIPositions() 中自動更新位置
            // 這裡只需要重新載入圖片（如果需要）
            this.updateChineseImage();
            this.updateEnglishImage();

            console.log('✅ 目標單字位置已更新');
        }
    }

    /**
     * 創建視差背景 - 建立多層滾動背景系統創造深度感
     */
    createParallaxBackground() {

        const { width, height } = this;                  // 獲取場景尺寸

        // 創建基礎背景色（深太空） - 確保有底色防止透明
        const bgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);  // 深藍紫色太空背景
        bgRect.setDepth(-110);                           // 設置為最底層

        // 創建背景層 - 用於存儲所有視差背景層
        this.backgroundLayers = {};

        // 🎨 檢查是否有自定義背景圖片
        const styleId = this.gameOptions.visualStyle || 'clouds';
        const customBgKey = `bg_layer_${styleId}`;
        const hasCustomBg = this.textures.exists(customBgKey);

        if (hasCustomBg) {
            // 使用自定義背景圖片
            console.log('🎨 使用自定義背景圖片:', customBgKey);

            // 獲取背景圖片的原始尺寸
            const texture = this.textures.get(customBgKey);
            const bgWidth = texture.source[0].width;
            const bgHeight = texture.source[0].height;

            console.log(`📐 背景圖片尺寸: ${bgWidth} x ${bgHeight}`);
            console.log(`📐 遊戲視口尺寸: ${width} x ${height}`);

            // 計算縮放比例以適應視口（保持寬高比）
            const scaleX = width / bgWidth;
            const scaleY = height / bgHeight;
            const scale = Math.max(scaleX, scaleY); // 使用較大的縮放比例以填滿視口

            console.log(`📐 背景縮放比例: ${scale.toFixed(3)}`);

            // 創建背景圖片（使用 image 而不是 tileSprite）
            const customBg = this.add.image(width / 2, height / 2, customBgKey);
            customBg.setScale(scale);
            customBg.setDepth(-100);
            customBg.setAlpha(1.0);
            customBg.setVisible(true);
            this.backgroundLayers['custom'] = customBg;
            console.log('✅ 自定義背景已創建並縮放');

            // 初始化滾動位置（雖然不會滾動，但保持兼容性）
            this.scrollPositions = { custom: 0 };
            return; // 使用自定義背景時，不創建默認背景層
        }

        // 背景層配置 - 定義6層背景的屬性和深度（默認背景）
        const layerConfigs = [
            { key: 'bg_layer_1', name: 'sky', depth: -100, alpha: 1.0 },    // 最遠星空層
            { key: 'bg_layer_2', name: 'moon', depth: -95, alpha: 1.0 },    // 月亮主體層
            { key: 'bg_layer_3', name: 'back', depth: -90, alpha: 0.9 },    // 遠景雲層
            { key: 'bg_layer_4', name: 'mid', depth: -85, alpha: 0.9 },     // 中景雲層
            { key: 'bg_layer_5', name: 'front', depth: -80, alpha: 0.9 },   // 近景雲層
            { key: 'bg_layer_6', name: 'floor', depth: -75, alpha: 0.8 }    // 最前景雲霧層
        ];

        // 創建每一層背景 - 遍歷配置數組創建所有背景層
        layerConfigs.forEach(config => {
            if (this.textures.exists(config.key)) {     // 檢查資源是否存在
                // 使用 TileSprite 創建可滾動背景 - 支援無限滾動
                const layer = this.add.tileSprite(0, 0, width, height, config.key);
                layer.setOrigin(0, 0);                   // 設置原點為左上角
                layer.setDepth(config.depth);            // 設置視覺深度層級
                layer.setAlpha(config.alpha);            // 設置透明度
                layer.setVisible(true);                  // 確保可見



                // 儲存到背景層物件 - 用名稱作為鍵值便於後續操作
                this.backgroundLayers[config.name] = layer;

                console.log(`✅ 創建背景層: ${config.key} (${config.name})`);
            } else {
                console.warn(`⚠️ 背景資源不存在: ${config.key}`);  // 資源不存在時的警告
            }
        });

        // 初始化滾動位置 - 記錄每層背景的滾動偏移量
        this.scrollPositions = {
            sky: 0,      // 星空層滾動位置
            moon: 0,     // 月亮層滾動位置
            back: 0,     // 遠景層滾動位置
            mid: 0,      // 中景層滾動位置
            front: 0,    // 近景層滾動位置
            floor: 0     // 前景層滾動位置
        };


    }

    /**
     * 🚀 創建太空船（防禦性編程）- 主角太空船創建和動畫設置
     */
    /**
     * 🚀 創建太空船（支持視覺風格）- 主角太空船創建和動畫設置
     */
    createSpaceship() {
        const { width, height } = this;                  // 獲取場景尺寸
        const styleId = this.gameOptions.visualStyle || 'clouds';  // 獲取視覺風格 ID
        const spaceshipKey = `spaceship_${styleId}`;     // 視覺風格太空船鍵值

        // 🎨 檢查是否成功載入自定義太空船
        const preloadScene = this.scene.get('preload');
        const hasCustomSpaceship = preloadScene && preloadScene.customSpaceshipLoaded && this.textures.exists(spaceshipKey);

        // 🎨 優先使用視覺風格太空船（如果存在且載入成功）
        if (hasCustomSpaceship) {
            console.log('✅ 使用視覺風格太空船:', styleId);

            try {
                // 🎨 檢查是否是精靈圖（有多個幀）
                const texture = this.textures.get(spaceshipKey);
                const frameCount = texture.frameTotal;
                const isSpriteSheet = frameCount > 1;

                if (isSpriteSheet) {
                    // 🎨 創建動畫（如果是精靈圖）
                    const animKey = `${styleId}_spaceship_fly`;
                    if (!this.anims.exists(animKey)) {
                        try {
                            this.anims.create({
                                key: animKey,
                                frames: this.anims.generateFrameNumbers(spaceshipKey, {
                                    start: 0,
                                    end: frameCount - 1
                                }),
                                frameRate: 10,
                                repeat: -1
                            });
                            console.log(`✅ 視覺風格太空船動畫創建成功: ${animKey} (${frameCount} 幀)`);
                        } catch (animError) {
                            console.warn('⚠️ 無法創建動畫:', animError);
                        }
                    }

                    // 創建太空船精靈（精靈圖）
                    this.player = this.add.sprite(width * 0.15, height * 0.5, spaceshipKey);

                    // 播放動畫
                    if (this.anims.exists(animKey)) {
                        this.player.play(animKey);
                        console.log('✅ 視覺風格太空船動畫播放中');
                    }
                } else {
                    // 🎨 單個圖片（不是精靈圖）
                    console.log('✅ 使用單個圖片作為太空船');
                    this.player = this.add.image(width * 0.15, height * 0.5, spaceshipKey);
                }

                this.player.setOrigin(0.5, 0.5);

                // 🎨 應用視覺風格配置
                const style = this.currentVisualStyle;
                if (style && style.ui && style.ui.targetWord) {
                    // 使用視覺風格的縮放配置（如果有）
                    this.player.setScale(0.2);  // 默認縮放
                } else {
                    this.player.setScale(0.2);
                }

                this.player.setDepth(-60);

                // 初始化移動相關變數
                this.playerSpeed = 250;
                this.playerTargetY = this.player.y;

                console.log('✅ 視覺風格太空船創建成功');

            } catch (error) {
                console.error('❌ 視覺風格太空船創建失敗:', error);
                this.createDefaultSpaceship(width, height);
            }

        // 降級到默認太空船
        } else if (this.textures.exists('player_spaceship')) {
            console.log('✅ 使用默認太空船精靈圖')
            this.createDefaultSpaceship(width, height);

        // 最後降級到備用太空船
        } else {
            console.warn('⚠️ 太空船精靈圖不存在，使用備用方案');
            this.createBackupSpaceship(width, height);
        }

        // 🔧 初始化調試模式和性能監控
        this.debugMode = true;
        this.performanceStats = {
            touchResponses: [],
            averageResponseTime: 0
        };

        // 🔧 初始化座標修復工具
        this.coordinateFix = new (window.CoordinateFix || class {
            getOptimalCoordinates(pointer) { return { x: pointer.x, y: pointer.y }; }
            testCoordinateAccuracy() { return { isAccurate: true }; }
        })(this);

        // 設置太空船控制
        this.setupSpaceshipControls();
    }

    /**
     * 🚀 創建默認太空船（使用原始精靈圖）
     */
    createDefaultSpaceship(width, height) {
        try {
            // 創建7幀動畫
            this.anims.create({
                key: 'spaceship_fly',
                frames: this.anims.generateFrameNumbers('player_spaceship', {
                    start: 0, end: 6
                }),
                frameRate: 10,
                repeat: -1
            });

            // 創建太空船精靈
            this.player = this.add.sprite(width * 0.15, height * 0.5, 'player_spaceship');
            this.player.setOrigin(0.5, 0.5);
            this.player.setScale(0.2);
            this.player.setDepth(-60);
            this.player.play('spaceship_fly');

            // 初始化移動相關變數
            this.playerSpeed = 250;
            this.playerTargetY = this.player.y;

            console.log('✅ 默認太空船創建成功');

        } catch (error) {
            console.error('❌ 默認太空船創建失敗:', error);
            this.createBackupSpaceship(width, height);
        }
    }

    /**
     * 🔧 創建備用太空船（優雅降級）- 當精靈圖載入失敗時的備用方案
     */
    createBackupSpaceship(width, height) {
        console.log('🔧 創建備用太空船');

        try {
            // 創建簡單的三角形太空船 - 使用程序生成圖形
            const graphics = this.add.graphics();

            // 太空船主體（藍色三角形） - 主要船身
            graphics.fillStyle(0x4facfe);                // 設置藍色填充
            graphics.fillTriangle(30, 0, 0, 20, 0, -20); // 繪製向右的三角形

            // 太空船邊框 - 增加視覺層次
            graphics.lineStyle(2, 0xffffff, 1);          // 設置白色邊框線
            graphics.strokeTriangle(30, 0, 0, 20, 0, -20); // 繪製三角形邊框

            // 引擎火焰 - 增加動感
            graphics.fillStyle(0xff4444);                // 設置紅色填充
            graphics.fillTriangle(-5, 0, -15, 8, -15, -8); // 繪製向左的火焰三角形

            // 生成紋理 - 將繪製的圖形轉換為可重用的紋理
            graphics.generateTexture('backup_spaceship', 45, 40);  // 生成45x40像素的紋理
            graphics.destroy();                          // 銷毀臨時圖形物件釋放記憶體

            // 創建備用太空船（簡單方式確保顯示）
            this.player = this.add.sprite(width * 0.15, height * 0.5, 'backup_spaceship');  // 使用生成的紋理創建精靈
            this.player.setOrigin(0.5, 0.5);            // 設置中心點
            this.player.setScale(0.6);                   // 用戶要求飛機小一半：1.2 × 0.5 = 0.6
            this.player.setDepth(-60);                   // 設置深度層級

            // 初始化移動相關變數 - 與原始太空船相同的移動參數
            this.playerSpeed = 250;                      // 移動速度
            this.playerTargetY = this.player.y;          // 目標Y座標

            console.log('✅ 備用太空船創建成功，位置:', this.player.x, this.player.y);

            console.log('✅ 備用太空船創建成功');

        } catch (error) {
            console.error('❌ 備用太空船創建也失敗:', error);  // 連備用方案都失敗的錯誤處理
        }
    }

    /**
     * 🎨 顯示觸控點擊反饋效果
     */
    showTouchFeedback(x, y) {
        // 創建點擊波紋效果
        const ripple = this.add.circle(x, y, 5, 0x00ff00, 0.8);
        ripple.setDepth(1000); // 確保在最上層

        // 波紋擴散動畫
        this.tweens.add({
            targets: ripple,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                ripple.destroy(); // 動畫完成後銷毀
            }
        });
    }

    /**
     * 🎨 顯示太空船反饋效果
     */
    showPlayerFeedback(direction) {
        if (!this.player) return;

        // 太空船閃爍效果
        const originalTint = this.player.tint;
        const feedbackColor = direction === 'up' ? 0x00ff00 : 0xff4444; // 上綠下紅

        this.player.setTint(feedbackColor);

        // 恢復原色
        this.time.delayedCall(100, () => {
            if (this.player) {
                this.player.setTint(originalTint);
            }
        });

        // 輕微縮放效果
        const originalScale = this.player.scaleX;
        this.tweens.add({
            targets: this.player,
            scaleX: originalScale * 1.1,
            scaleY: originalScale * 1.1,
            duration: 50,
            yoyo: true,
            ease: 'Power1'
        });
    }

    /**
     * 🎮 設置太空船控制（非物理方式）- 初始化多種輸入控制方式
     */
    setupSpaceshipControls() {
        if (!this.player) {                              // 防禦性檢查
            console.warn('⚠️ 太空船不存在，無法設置控制');
            return;
        }

        // 1. 鍵盤控制 - 設置方向鍵和WASD鍵
        this.cursors = this.input.keyboard.createCursorKeys();  // 創建方向鍵監聽器
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');     // 創建WASD鍵監聽器

        // 🔧 修復：在設置觸控事件前，先清理任何可能的攔截層
        this.cleanupInterceptLayers();

        // 🎯 以太空船水平線為基準的點擊/觸控控制（座標偏移修復版）
        this.input.on('pointerdown', (pointer) => {     // 監聽滑鼠點擊或觸控事件
            if (!this.player) return;                   // 確保太空船存在

            // 如果是長按控制中，不執行點擊移動
            if (this.isLongPressing) return;

            // ⚡ 立即響應優化 - 減少計算複雜度
            const startTime = performance.now();        // 記錄開始時間用於性能監控

            // 🔧 座標偏移修復 - 使用座標修復工具
            const optimalCoords = this.coordinateFix.getOptimalCoordinates(pointer);
            const clickX = optimalCoords.x;
            const clickY = optimalCoords.y;

            const playerY = this.player.y;              // 太空船當前Y座標

            // 🎨 立即視覺反饋 - 在任何計算前先提供反饋
            this.showTouchFeedback(clickX, clickY);

            // 🔧 詳細的調試信息（座標偏移診斷）
            if (this.debugMode) {
                // 獲取詳細的容器和座標信息
                const canvas = this.sys.game.canvas;
                const canvasRect = canvas.getBoundingClientRect();
                const gameContainer = canvas.parentElement;
                const containerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;

                const screenInfo = {
                    windowSize: `${window.innerWidth}x${window.innerHeight}`,
                    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
                    devicePixelRatio: window.devicePixelRatio,
                    scrollPosition: `${window.scrollX}, ${window.scrollY}`
                };

                const canvasInfo = {
                    canvasSize: `${canvas.width}x${canvas.height}`,
                    canvasClientSize: `${canvas.clientWidth}x${canvas.clientHeight}`,
                    canvasRect: `${canvasRect.x}, ${canvasRect.y}, ${canvasRect.width}x${canvasRect.height}`,
                    containerRect: containerRect ? `${containerRect.x}, ${containerRect.y}, ${containerRect.width}x${containerRect.height}` : 'null'
                };

                const coordinateInfo = {
                    rawPointer: `${pointer.x}, ${pointer.y}`,
                    worldPointer: `${pointer.worldX}, ${pointer.worldY}`,
                    fixedPointer: `${clickX}, ${clickY}`,
                    playerPosition: `${this.player.x}, ${playerY}`,
                    clickVsPlayer: `${clickY} vs ${playerY} (diff: ${clickY - playerY})`,
                    cameraInfo: `scroll: ${this.cameras.main.scrollX}, ${this.cameras.main.scrollY}, zoom: ${this.cameras.main.zoom}`
                };

                console.log(`🎯 [座標偏移診斷] 觸控檢測 - 點擊Y: ${clickY}, 太空船Y: ${playerY}`);
                console.log(`📱 [螢幕信息] ${JSON.stringify(screenInfo)}`);
                console.log(`🖼️ [畫布信息] ${JSON.stringify(canvasInfo)}`);
                console.log(`📊 [座標詳情] ${JSON.stringify(coordinateInfo)}`);

                // 檢查是否有覆蓋層
                const overlay = document.querySelector('div[style*="z-index:999999"]');
                if (overlay) {
                    const overlayRect = overlay.getBoundingClientRect();
                    console.log(`🔍 [覆蓋層檢測] 發現覆蓋層: ${overlayRect.x}, ${overlayRect.y}, ${overlayRect.width}x${overlayRect.height}`);
                }
            }

            // 🔧 座標已經通過修復工具處理，直接使用

            if (clickY < playerY) {                      // 點擊在太空船上方（任何位置）
                // 點擊上方，設置向上移動目標
                this.playerTargetY = Math.max(80, playerY - 100);  // 設置目標位置，最高不超過80像素
                console.log('� [太空船基準] 點擊太空船上方：向上移動！');
            } else {                                     // 點擊在太空船下方（任何位置）
                // 點擊下方，設置向下移動目標
                const { height } = this;                 // 獲取場景高度
                this.playerTargetY = Math.min(height - 80, playerY + 100);  // 設置目標位置，最低不超過底部80像素
                console.log('� [太空船基準] 點擊太空船下方：向下移動！');
            }
            // ⚡ 快速方向判斷和響應
            let direction = '';
            if (clickY < playerY) {                      // 點擊在太空船上方（任何位置）
                // 點擊上方，設置向上移動目標
                this.playerTargetY = Math.max(80, playerY - 100);  // 設置目標位置，最高不超過80像素
                direction = 'up';
                if (this.debugMode) console.log('🚀 [太空船基準] 點擊太空船上方：向上移動！');
            } else {                                     // 點擊在太空船下方（任何位置）
                // 點擊下方，設置向下移動目標
                const { height } = this;                 // 獲取場景高度
                this.playerTargetY = Math.min(height - 80, playerY + 100);  // 設置目標位置，最低不超過底部80像素
                direction = 'down';
                if (this.debugMode) console.log('🚀 [太空船基準] 點擊太空船下方：向下移動！');
            }

            // 🎨 增強視覺反饋 - 太空船閃爍效果
            this.showPlayerFeedback(direction);

            // ⚡ 性能監控和統計
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            // 記錄性能數據
            this.performanceStats.touchResponses.push(responseTime);
            if (this.performanceStats.touchResponses.length > 100) {
                this.performanceStats.touchResponses.shift(); // 保持最近100次記錄
            }

            // 計算平均響應時間
            this.performanceStats.averageResponseTime =
                this.performanceStats.touchResponses.reduce((a, b) => a + b, 0) /
                this.performanceStats.touchResponses.length;

            if (this.debugMode) {
                console.log(`⚡ 觸控響應時間: ${responseTime.toFixed(2)}ms (平均: ${this.performanceStats.averageResponseTime.toFixed(2)}ms)`);

                // 如果響應時間超過16ms（60fps），發出警告
                if (responseTime > 16) {
                    console.warn(`⚠️ 觸控響應延遲: ${responseTime.toFixed(2)}ms (建議<16ms)`);
                }
            }
        });

        console.log('🎮 太空船控制設置完成：方向鍵、WASD、點擊');
        // 🔧 移除長按控制以避免覆蓋層阻擋點擊
        // this.setupMobileLongPressControls(); // 暫時停用以修復點擊問題
    }

    /**
     * 🔧 清理可能攔截觸控事件的層
     */
    cleanupInterceptLayers() {
        console.log('🧹 清理攔截層');

        // 移除高 z-index 的覆蓋層
        const overlays = document.querySelectorAll('div[style*="z-index:999999"], div[style*="z-index: 999999"]');
        overlays.forEach(overlay => {
            console.log('🗑️ 移除攔截層:', overlay);
            overlay.remove();
        });

        // 移除可能攔截觸控的 CSS 類別
        document.body.classList.remove('mobile-fullscreen', 'fullscreen-game');

        // 確保遊戲容器和 Canvas 能接收觸控事件
        const gameContainer = document.getElementById('game');
        if (gameContainer) {
            gameContainer.style.pointerEvents = 'auto';
            gameContainer.style.touchAction = 'manipulation';
        }

        const canvas = this.sys.game.canvas;
        if (canvas) {
            canvas.style.pointerEvents = 'auto';
            canvas.style.touchAction = 'manipulation';
        }

        console.log('✅ 攔截層清理完成');
    }


    /**
     * 🎮 設置手機長按上/下控制 - 透明覆蓋層實現長按連續移動
     */
    setupMobileLongPressControls() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;

        // 🔧 修復：不創建阻擋性覆蓋層，直接在 Canvas 上處理長按
        console.log('📱 手機長按控制：使用 Canvas 事件，不創建覆蓋層');

        // 移除可能存在的舊覆蓋層
        const existingOverlay = document.querySelector('div[style*="z-index:999999"]');
        if (existingOverlay) {
            existingOverlay.remove();
            console.log('🗑️ 移除舊的阻擋性覆蓋層');
        }

        let rafId = 0, pressing = false, direction = null;

        const startLongPress = (dir) => {
            if (!this.player) return;
            pressing = true;
            direction = dir;
            this.isLongPressing = true; // 標記長按狀態，避免與點擊衝突

            const loop = () => {
                if (!pressing || !this.player) return;

                const moveSpeed = 6; // 比鍵盤稍快的移動速度
                const { height } = this;

                if (direction === 'up') {
                    this.player.y = Math.max(80, this.player.y - moveSpeed);
                } else if (direction === 'down') {
                    this.player.y = Math.min(height - 80, this.player.y + moveSpeed);
                }

                rafId = requestAnimationFrame(loop);
            };

            rafId = requestAnimationFrame(loop);
        };

        const endLongPress = () => {
            pressing = false;
            direction = null;
            this.isLongPressing = false; // 清除長按狀態
            cancelAnimationFrame(rafId);
            // 長按放開時不回到原點，將目標位置設為當前位置
            if (this.player) {
                this.playerTargetY = this.player.y;
            }
        };

        // 防止所有可能的瀏覽器默認行為
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        // 觸控事件
        overlay.addEventListener('touchstart', (e) => {
            preventDefaults(e);
            const touch = e.changedTouches[0];
            const rect = overlay.getBoundingClientRect();
            const touchY = touch.clientY - rect.top;
            const dir = touchY < rect.height / 2 ? 'up' : 'down';
            startLongPress(dir);
        }, { passive: false });

        overlay.addEventListener('touchend', (e) => {
            preventDefaults(e);
            endLongPress();
        }, { passive: false });

        overlay.addEventListener('touchcancel', (e) => {
            preventDefaults(e);
            endLongPress();
        }, { passive: false });

        overlay.addEventListener('touchmove', preventDefaults, { passive: false });

        // 防止右鍵選單
        overlay.addEventListener('contextmenu', preventDefaults, { passive: false });

        // 防止文字選取
        overlay.addEventListener('selectstart', preventDefaults, { passive: false });
        overlay.addEventListener('dragstart', preventDefaults, { passive: false });

        // 防止iOS Safari手勢
        overlay.addEventListener('gesturestart', preventDefaults, { passive: false });
        overlay.addEventListener('gesturechange', preventDefaults, { passive: false });
        overlay.addEventListener('gestureend', preventDefaults, { passive: false });

        // 防止滑鼠事件干擾
        overlay.addEventListener('mousedown', preventDefaults, { passive: false });
        overlay.addEventListener('mouseup', preventDefaults, { passive: false });
        overlay.addEventListener('mousemove', preventDefaults, { passive: false });

        console.log('📱 手機長按上/下控制已設置');
    }

    /**
     * ☁️ 創建敵人系統 - 初始化雲朵敵人生成和管理系統
     */
    createEnemySystem() {
        // 初始化敵人群組 - 用於存儲所有活躍的敵人
        this.enemies = [];
        this.enemySpawnTimer = 0;                        // 敵人生成計時器
        this.enemySpawnDelay = 3000;                     // 3秒生成一個敵人（毫秒）

        console.log('☁️ 敵人系統初始化完成');
    }

    /**
     * ❤️ 創建生命值系統 - 建立玩家血量顯示和管理系統
     */
    createHealthSystem() {
        // 🎯 使用相機動態尺寸，與三列布局保持一致
        const cam = this.cameras.main;
        const visibleWidth = cam.width;
        const visibleHeight = cam.height;

        // 🎮 使用 gameOptions 中的 lives 設定
        const livesFromOptions = this.gameOptions?.lives || 3;

        // 生命值設定 - 初始化血量參數
        // 如果 lives 是 1-5，則將其轉換為百分比系統（每條命 20%）
        this.maxLives = livesFromOptions;                // 最大生命數
        this.currentLives = livesFromOptions;            // 當前生命數
        this.maxHealth = 100;                            // 最大生命值（百分比）
        this.currentHealth = 100;                        // 當前生命值（百分比）
        this.healthPerLife = 100 / livesFromOptions;     // 每條命的血量百分比

        console.log(`❤️ 生命值系統初始化: ${this.currentLives}/${this.maxLives} 條命，每條命 ${this.healthPerLife.toFixed(1)}% 血量`);

        // 🎯 生命值條位置和尺寸（右下角） - 使用動態相機尺寸
        const healthBarWidth = 100;                      // 生命值條寬度（縮小50%：200 → 100）
        const healthBarHeight = 10;                      // 生命值條高度（縮小50%：20 → 10）
        const margin = 20;                               // 邊距
        const leftOffset = 50;                           // 往左移動的額外距離
        // 🎯 使用相機滾動位置 + 可見區域計算動態位置（回到原本右下角位置，往左移動一些）
        const healthBarX = cam.scrollX + visibleWidth - margin - healthBarWidth - leftOffset;   // 動態右邊距，往左移動
        const healthBarY = cam.scrollY + visibleHeight - margin - healthBarHeight - (visibleHeight * 0.05); // 動態底部邊距，上升5%高度

        // 創建生命值條背景（黑色邊框） - 最外層邊框
        this.healthBarBg = this.add.rectangle(
            healthBarX,                                  // X座標
            healthBarY,                                  // Y座標
            healthBarWidth + 4,                          // 寬度（比內容寬4像素）
            healthBarHeight + 4,                         // 高度（比內容高4像素）
            0x000000                                     // 黑色
        );
        this.healthBarBg.setOrigin(0, 0);               // 設置原點為左上角
        this.healthBarBg.setDepth(100);                 // 確保在最前面
        // 🎯 設置為固定在螢幕上，不跟隨相機滾動
        this.healthBarBg.setScrollFactor(0);

        // 創建生命值條背景（深灰色） - 內層背景
        this.healthBarBackground = this.add.rectangle(
            healthBarX + 2,                              // X座標（內縮2像素）
            healthBarY + 2,                              // Y座標（內縮2像素）
            healthBarWidth,                              // 實際寬度
            healthBarHeight,                             // 實際高度
            0x333333                                     // 深灰色
        );
        this.healthBarBackground.setOrigin(0, 0);        // 設置原點為左上角
        this.healthBarBackground.setDepth(101);          // 在邊框之上
        // 🎯 設置為固定在螢幕上，不跟隨相機滾動
        this.healthBarBackground.setScrollFactor(0);

        // 創建生命值條（綠色） - 實際血量顯示條
        this.healthBar = this.add.rectangle(
            healthBarX + 2,                              // X座標（與背景對齊）
            healthBarY + 2,                              // Y座標（與背景對齊）
            healthBarWidth,                              // 初始寬度（滿血狀態）
            healthBarHeight,                             // 高度
            0x00ff00                                     // 綠色
        );
        this.healthBar.setOrigin(0, 0);                  // 設置原點為左上角
        this.healthBar.setDepth(102);                    // 在背景之上
        // 🎯 設置為固定在螢幕上，不跟隨相機滾動
        this.healthBar.setScrollFactor(0);

        // 創建生命值文字 - 顯示數值（右下角，文字在血條左側）
        this.healthText = this.add.text(
            healthBarX - 15,                             // X座標（生命值條左側15像素）
            healthBarY + healthBarHeight / 2,            // Y座標（生命值條垂直中央）
            `❤️ ${this.currentLives}/${this.maxLives}`,  // 顯示當前/最大生命數
            {
                fontSize: '16px',                        // 字體大小
                color: '#ffffff',                        // 白色文字
                fontStyle: 'bold'                        // 粗體
            }
        );
        this.healthText.setOrigin(1, 0.5);               // 設置原點為右側中央
        this.healthText.setDepth(103);                   // 在所有元素之上
        // 🎯 設置為固定在螢幕上，不跟隨相機滾動
        this.healthText.setScrollFactor(0);

        console.log('❤️ 生命值系統初始化完成');
    }

    /**
     * 🆕 創建目標詞彙顯示系統 - 五列布局
     */
    createTargetWordDisplay() {
        // 🆕 使用相機視口尺寸 - 這是實際顯示的區域
        const cam = this.cameras.main;

        // 使用相機視口尺寸（這是實際顯示的區域）
        const visibleWidth = cam.width;
        const visibleHeight = cam.height;

        console.log('📐 創建 UI - 相機視口:', {
            width: visibleWidth,
            height: visibleHeight,
            scrollX: cam.scrollX,
            scrollY: cam.scrollY
        });

        // 初始化學習統計
        this.wordsLearned = 0;                               // 已學習的單字數
        this.score = 0;                                      // 分數
        this.currentTargetWord = null;                       // 當前目標詞彙
        this.chineseImage = null;                            // 🖼️ 中文圖片容器
        this.englishImage = null;                            // 🖼️ 英文圖片容器

        // 🆕 記錄詳細的問題和答案數據
        this.questionAnswerLog = [];                         // 記錄所有問題和答案

        // 🆕 五列布局 - 基於相機視口計算每列的 X 座標
        // 布局：分數 | 中文圖片 | 中文 | 英文圖片 | 英文
        const topY = cam.scrollY + 20;                       // 距離視差背景上邊緣 20px

        // 🆕 創建分數顯示（第一列）
        this.scoreText = this.add.text(
            0,                                               // X座標（稍後在 updateUIPositions 中設置）
            topY,                                            // Y座標（頂部20像素）
            '分數: 0\n單字: 0',                              // 初始文字（兩行）
            {
                fontSize: '20px',                            // 字體大小
                color: '#ffffff',                            // 白色
                fontStyle: 'bold',                           // 粗體
                stroke: '#000000',                           // 黑色描邊
                strokeThickness: 3,                          // 描邊粗細
                align: 'center'                              // 文字居中
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        this.scoreText.setScrollFactor(1);                   // 🎯 改為世界物件，在視差背景裡面
        this.scoreText.setDepth(200);                        // 確保在最前面

        // 🆕 創建計時器顯示（第一列，在分數下方）
        this.timerText = this.add.text(
            0,                                               // X座標（稍後在 updateUIPositions 中設置）
            topY + 60,                                       // Y座標（在分數下方60像素）
            '',                                              // 初始文字為空（稍後在 applyTimerOption 中設置）
            {
                fontSize: '24px',                            // 字體大小
                color: '#ffffff',                            // 白色
                fontStyle: 'bold',                           // 粗體
                stroke: '#000000',                           // 黑色描邊
                strokeThickness: 3,                          // 描邊粗細
                align: 'center'                              // 文字居中
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        this.timerText.setScrollFactor(1);                   // 🎯 改為世界物件，在視差背景裡面
        this.timerText.setDepth(200);                        // 確保在最前面

        // 🆕 創建英文文字（第三列，黃色框大字，可點擊發音）
        this.englishText = this.add.text(
            0,                                               // X座標（稍後在 updateUIPositions 中設置）
            topY,                                            // Y座標（頂部20像素）
            '',                                              // 初始文字為空
            {
                fontSize: '36px',                            // 調整字體大小適應英文
                color: '#000000',                            // 黑色文字
                fontStyle: 'bold',                           // 粗體，更好辨識
                backgroundColor: '#ffff00',                  // 黃色背景
                padding: { x: 20, y: 10 }                    // 內邊距
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        this.englishText.setScrollFactor(1);                 // 🎯 改為世界物件，在視差背景裡面
        this.englishText.setDepth(200);                      // 確保在最前面
        this.englishText.setInteractive();                   // 設置為可互動

        // 點擊英文文字播放英文發音
        this.englishText.on('pointerdown', () => {
            if (this.currentTargetWord && this.game.bilingualManager) {
                console.log('🔊 播放英文發音:', this.currentTargetWord.english);
                this.game.bilingualManager.speak(this.currentTargetWord.english, 'en-US');
            }
        });

        // 🆕 創建中文文字（第五列，黃色文字黑色描邊，可點擊發音）
        this.chineseText = this.add.text(
            0,                                               // X座標（稍後在 updateUIPositions 中設置）
            topY,                                            // Y座標（頂部20像素）
            '',                                              // 初始文字為空
            {
                fontSize: '36px',                            // 調整字體大小適應中文
                color: '#ffff00',                            // 黃色
                fontStyle: 'bold',                           // 粗體
                stroke: '#000000',                           // 黑色描邊
                strokeThickness: 4                           // 描邊粗細
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        this.chineseText.setScrollFactor(1);                 // 🎯 改為世界物件，在視差背景裡面
        this.chineseText.setDepth(200);                      // 確保在最前面
        this.chineseText.setInteractive();                   // 設置為可互動

        // 點擊中文文字播放中文發音
        this.chineseText.on('pointerdown', () => {
            if (this.currentTargetWord && this.game.bilingualManager) {
                console.log('🔊 播放中文發音:', this.currentTargetWord.chinese);
                this.game.bilingualManager.speak(this.currentTargetWord.chinese, 'zh-TW');
            }
        });

        console.log('🎯 目標詞彙顯示系統初始化完成（五列布局）');
    }

    /**
     * 🆕 重置所有敵人雲朵的文字顏色為黑色
     */
    resetAllEnemyColors() {
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active) {
                const wordText = enemy.getData('wordText');
                if (wordText && wordText.active) {
                    // 將所有雲朵文字顏色重置為黑色
                    wordText.setColor('#000000');
                    // 重置 isTarget 標記
                    enemy.setData('isTarget', false);
                }
            }
        });
        console.log('🔄 重置所有雲朵文字顏色為黑色');
    }

    /**
     * 🆕 更新匹配目標詞彙的敵人雲朵文字顏色為紅色
     */
    updateTargetEnemyColors() {
        if (!this.currentTargetWord) return;

        this.enemies.forEach(enemy => {
            if (enemy && enemy.active) {
                const word = enemy.getData('word');
                if (word && word.english === this.currentTargetWord.english) {
                    const wordText = enemy.getData('wordText');
                    if (wordText && wordText.active) {
                        // 將匹配的雲朵文字顏色設為紅色
                        wordText.setColor('#ff0000');
                        // 設置 isTarget 標記
                        enemy.setData('isTarget', true);
                    }
                }
            }
        });
        console.log('🎯 更新目標雲朵文字顏色為紅色:', this.currentTargetWord.english);
    }

    /**
     * 🖼️ 預載入所有詞彙的圖片 - 確保第一輪就能顯示圖片
     */
    preloadVocabularyImages() {
        if (!this.game.geptManager) {
            console.warn('⚠️ GEPT 管理器未初始化，無法預載入圖片');
            return;
        }

        // 獲取當前等級的所有詞彙
        const allWords = this.game.geptManager.getCurrentLevelWords();
        if (!allWords || allWords.length === 0) {
            console.warn('⚠️ 沒有詞彙可以預載入圖片');
            return;
        }

        console.log(`🖼️ 開始預載入 ${allWords.length} 個詞彙的圖片`);

        // 預載入所有有圖片的詞彙
        let loadedCount = 0;
        allWords.forEach(word => {
            if (word.image) {
                const imageKey = `target-image-${word.id}`;
                if (!this.textures.exists(imageKey)) {
                    this.load.image(imageKey, word.image);
                    loadedCount++;
                }
            }
        });

        if (loadedCount > 0) {
            // 開始載入
            this.load.once('complete', () => {
                console.log(`✅ 成功預載入 ${loadedCount} 張詞彙圖片`);
            });
            this.load.start();
        } else {
            console.log('ℹ️ 所有詞彙圖片已載入或沒有圖片需要載入');
        }
    }

    /**
     * 🆕 設置隨機目標詞彙 - 五列布局版本
     */
    setRandomTargetWord() {
        if (!this.game.geptManager) {
            console.warn('⚠️ GEPT 管理器未初始化');
            return;
        }

        // 🧠 SRS 模式: 按順序選擇單字
        if (this.srsManager) {
            const word = this.srsManager.getCurrentWord();
            if (word) {
                this.currentTargetWord = word;
                console.log('🧠 SRS 目標詞彙:', this.currentTargetWord.chinese, this.currentTargetWord.english);
                console.log(`  - 進度: ${this.srsManager.currentWordIndex + 1}/${this.srsManager.words.length}`);
            } else {
                // 🎉 所有單字都已完成！
                console.log('🎉 恭喜！所有單字都已完成！');
                this.gameOver();
                return;
            }
        } else {
            // 普通模式: 隨機選擇詞彙
            this.currentTargetWord = this.game.geptManager.getRandomWord();
        }

        if (this.currentTargetWord) {
            console.log('🎯 新目標詞彙:', this.currentTargetWord.chinese, this.currentTargetWord.english);

            // 🆕 重置所有現有雲朵的顏色為黑色，避免舊目標詞彙保持紅色
            this.resetAllEnemyColors();

            // 🆕 更新現有雲朵中匹配新目標詞彙的顏色為紅色
            this.updateTargetEnemyColors();

            // 🆕 更新中文文字（第三列）
            if (this.chineseText) {
                this.chineseText.setText(this.currentTargetWord.chinese);
            }

            // 🆕 更新英文文字（第五列）
            if (this.englishText) {
                this.englishText.setText(this.currentTargetWord.english);
            }

            // 🖼️ 更新中文圖片（第二列）
            this.updateChineseImage();

            // 🖼️ 更新英文圖片（第四列）
            this.updateEnglishImage();

            // 🆕 自動播放雙語發音：中文 → 英文
            if (this.game.bilingualManager) {
                console.log('🔊 自動播放新單字發音:', this.currentTargetWord.chinese, '→', this.currentTargetWord.english);
                this.game.bilingualManager.speakBilingual(
                    this.currentTargetWord.english,
                    this.currentTargetWord.chinese
                );
            }
        } else {
            console.warn('⚠️ 無法獲取隨機詞彙');
        }
    }

    /**
     * 🖼️ 更新中文圖片（第二列）
     */
    updateChineseImage() {
        // 🆕 只使用 chineseImageUrl，不使用 imageUrl（英文圖片）
        const chineseImageUrl = this.currentTargetWord?.chineseImageUrl;

        if (chineseImageUrl) {
            const imageKey = `chinese-image-${this.currentTargetWord.id}`;

            // 檢查圖片是否已經載入
            if (!this.textures.exists(imageKey)) {
                // 動態載入圖片
                this.load.image(imageKey, chineseImageUrl);
                this.load.once('complete', () => {
                    this.createOrUpdateImage('chinese', imageKey);
                });
                this.load.start();
            } else {
                // 圖片已載入，直接更新
                this.createOrUpdateImage('chinese', imageKey);
            }
        } else {
            // 沒有中文圖片，隱藏圖片容器
            if (this.chineseImage) {
                this.chineseImage.setVisible(false);
            }
        }
    }

    /**
     * 🖼️ 更新英文圖片（第四列）
     */
    updateEnglishImage() {
        const englishImageUrl = this.currentTargetWord?.imageUrl;

        if (englishImageUrl) {
            const imageKey = `english-image-${this.currentTargetWord.id}`;

            // 檢查圖片是否已經載入
            if (!this.textures.exists(imageKey)) {
                // 動態載入圖片
                this.load.image(imageKey, englishImageUrl);
                this.load.once('complete', () => {
                    this.createOrUpdateImage('english', imageKey);
                });
                this.load.start();
            } else {
                // 圖片已載入，直接更新
                this.createOrUpdateImage('english', imageKey);
            }
        } else {
            // 沒有英文圖片，隱藏圖片容器
            if (this.englishImage) {
                this.englishImage.setVisible(false);
            }
        }
    }

    /**
     * 🖼️ 創建或更新圖片
     * @param {string} type - 'chinese' 或 'english'
     * @param {string} imageKey - 圖片鍵值
     */
    createOrUpdateImage(type, imageKey) {
        const cam = this.cameras.main;
        const worldView = cam.worldView;
        const worldTopY = worldView.top + 50;

        // 🎯 使用智能縮放系統
        const imageSize = this.currentTargetWord?.imageSize || 'medium';
        const maxSize = TARGET_MAX_IMAGE_SIZE[imageSize];
        const scale = this.calculateSmartScale(imageKey, imageSize, maxSize);

        if (type === 'chinese') {
            if (this.chineseImage) {
                // 更新現有圖片
                this.chineseImage.setTexture(imageKey);
                this.chineseImage.setScale(scale);
                this.chineseImage.setVisible(true);
            } else {
                // 創建新圖片
                this.chineseImage = this.add.image(0, worldTopY, imageKey);
                this.chineseImage.setScale(scale);
                this.chineseImage.setDepth(200);
                this.chineseImage.setScrollFactor(1);
                this.chineseImage.setOrigin(0.5);
            }
            console.log(`🖼️ 更新中文圖片: ${imageKey}, scale: ${scale.toFixed(3)}`);
        } else if (type === 'english') {
            if (this.englishImage) {
                // 更新現有圖片
                this.englishImage.setTexture(imageKey);
                this.englishImage.setScale(scale);
                this.englishImage.setVisible(true);
            } else {
                // 創建新圖片
                this.englishImage = this.add.image(0, worldTopY, imageKey);
                this.englishImage.setScale(scale);
                this.englishImage.setDepth(200);
                this.englishImage.setScrollFactor(1);
                this.englishImage.setOrigin(0.5);
            }
            console.log(`🖼️ 更新英文圖片: ${imageKey}, scale: ${scale.toFixed(3)}`);
        }
    }



    /**
     * 🆕 更新分數顯示 - 更新分數和單字數統計
     */
    updateScoreDisplay() {
        if (this.scoreText) {
            // 🆕 兩行顯示（左列）
            this.scoreText.setText(`分數: ${this.score}\n單字: ${this.wordsLearned}`);
        }
    }

    /**
     * ❤️ 更新生命值顯示 - 根據當前血量更新UI顯示
     */
    updateHealthDisplay() {
        if (!this.healthBar || !this.healthText) return;  // 防禦性檢查

        // 計算生命值百分比 - 用於計算顯示寬度和顏色
        const healthPercent = this.currentHealth / this.maxHealth;

        // 更新生命值條寬度 - 根據血量百分比調整寬度（保持縮小50%的設定）
        const maxWidth = 100;                            // 最大寬度（縮小50%：200 → 100）
        this.healthBar.displayWidth = maxWidth * healthPercent;  // 按比例調整寬度

        // 根據生命值改變顏色 - 提供視覺警告
        let color = 0x00ff00;                            // 預設綠色（健康）
        if (healthPercent <= 0.3) {                      // 血量低於30%
            color = 0xff0000;                            // 紅色（危險）
        } else if (healthPercent <= 0.6) {               // 血量低於60%
            color = 0xffff00;                            // 黃色（警告）
        }
        this.healthBar.setFillStyle(color);              // 應用顏色變化

        // 🎮 更新文字 - 顯示生命數和百分比
        this.healthText.setText(`❤️ ${this.currentLives}/${this.maxLives}`);
    }

    /**
     * ❤️ 受到傷害 - 處理玩家受傷邏輯
     */
    takeDamage(damage) {
        this.currentHealth = Math.max(0, this.currentHealth - damage);  // 扣除傷害，最低為0

        // 🎮 計算當前生命數（基於百分比）
        const previousLives = this.currentLives;
        this.currentLives = Math.ceil(this.currentHealth / this.healthPerLife);

        // 如果生命數減少，顯示提示
        if (this.currentLives < previousLives) {
            console.log(`💔 失去一條命！剩餘 ${this.currentLives}/${this.maxLives} 條命`);
        }

        this.updateHealthDisplay();                      // 更新UI顯示

        if (this.currentHealth <= 0) {                   // 檢查是否死亡
            console.log('💀 太空船被摧毀！');
            this.gameOver('生命值耗盡！');                // 調用遊戲結束處理
        }

        console.log(`💥 受到 ${damage} 點傷害，剩餘生命值: ${this.currentHealth.toFixed(1)}% (${this.currentLives}/${this.maxLives} 條命)`);
    }

    /**
     * ❤️ 恢復生命值 - 處理玩家治療邏輯
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);  // 增加生命值，最高為最大值
        this.updateHealthDisplay();                      // 更新UI顯示

        console.log(`💚 恢復 ${amount} 點生命值，當前生命值: ${this.currentHealth}`);
    }

    /**
     * ☁️ 生成雲朵敵人 - 創建新的雲朵敵人並設置其屬性和動畫
     */
    spawnCloudEnemy() {
        // 檢查資源是否存在 - 防禦性編程
        if (!this.textures.exists('cloud_enemy')) {
            console.warn('⚠️ 雲朵敵人資源不存在');
            return;
        }

        // � 獲取隨機詞彙 - 從 GEPT 管理器
        if (!this.game.geptManager) {
            console.warn('⚠️ GEPT 管理器未初始化');
            return;
        }

        const word = this.game.geptManager.getRandomWord();
        if (!word) {
            console.warn('⚠️ 無法獲取隨機詞彙');
            return;
        }

        // 🆕 判斷是否為目標詞彙
        const isTarget = this.currentTargetWord &&
                        word.english === this.currentTargetWord.english;

        // �🎯 使用攝影機 worldView 獲取真正的 FIT 後遊戲可見區域
        const cam = this.cameras.main;
        const worldView = cam.worldView;  // 經過 FIT 縮放後的實際遊戲區域

        // 計算生成位置 - 在 FIT 後的遊戲區域右邊界外
        const spawnX = worldView.right + Phaser.Math.Between(100, 300);  // 右邊界外 100-300 像素
        const spawnY = Phaser.Math.Between(worldView.top + 100, worldView.bottom - 100);  // Y 在遊戲區域內

        // 🎨 獲取視覺風格雲朵資源
        const styleId = this.gameOptions.visualStyle || 'clouds';
        const cloud1Key = `cloud1_${styleId}`;
        const cloud2Key = `cloud2_${styleId}`;

        // 🎨 優先使用視覺風格雲朵，隨機選擇 cloud1 或 cloud2
        let cloudKey = 'cloud_enemy';  // 默認雲朵
        if (this.textures.exists(cloud1Key) && this.textures.exists(cloud2Key)) {
            // 隨機選擇 cloud1 或 cloud2
            cloudKey = Math.random() > 0.5 ? cloud1Key : cloud2Key;
            console.log('✅ 使用視覺風格雲朵:', cloudKey);
        } else if (this.textures.exists('cloud_enemy')) {
            console.log('✅ 使用默認雲朵');
        } else {
            console.warn('⚠️ 雲朵資源不存在，使用備用方案');
            // 這裡可以創建備用雲朵，但為了簡化，我們暫時跳過
            return;
        }

        // 創建敵人（從 FIT 後遊戲區域外開始） - 確保在真正的遊戲區域外生成
        const enemy = this.add.sprite(spawnX, spawnY, cloudKey);
        enemy.setOrigin(0.5, 0.5);                       // 設置中心點
        enemy.setScale(0.533);                           // 用戶要求雲大三分之一：0.4 × 4/3 ≈ 0.533
        enemy.setDepth(-65);                             // 在太空船後面，視差背景前面
        enemy.setAlpha(0.8);                             // 稍微透明，更像雲朵

        // 🆕 設置敵人數據 - 存儲詞彙信息
        enemy.setData('word', word);                     // 存儲詞彙對象
        enemy.setData('isTarget', isTarget);             // 存儲是否為目標詞彙

        // 設置敵人屬性 - 移動速度（應用速度倍率）
        const baseSpeed = Phaser.Math.Between(1, 3);     // 基礎隨機速度（1-3像素/幀）
        enemy.speed = baseSpeed * (this.speedMultiplier || 1);  // 應用速度倍率

        // 🆕 添加詞彙文字 - 顯示英文單字（放入雲中，透明背景）
        const wordText = this.add.text(
            enemy.x,                                     // X座標（與敵人對齊）
            enemy.y,                                     // Y座標（與敵人中心對齊，放入雲中）
            word.english,                                // 顯示英文單字
            {
                fontSize: '22px',                        // 調整為22px，更大更清晰
                color: isTarget ? '#ff0000' : '#000000', // 目標詞彙紅色，其他黑色
                fontStyle: 'bold',                       // 粗體，增加可讀性
                stroke: '#ffffff',                       // 白色邊框，確保在雲朵上清晰可見
                strokeThickness: 2                       // 邊框厚度
            }
        ).setOrigin(0.5);                                // 設置原點為中央
        wordText.setDepth(-63);                          // 在雲朵前面，確保文字可見

        // 🆕 將文字綁定到敵人 - 用於同步移動和銷毀
        enemy.setData('wordText', wordText);

        // 🖼️ 如果詞彙有圖片，顯示圖片
        if (word.image) {
            const imageKey = `word-image-${word.id}`;

            // 檢查圖片是否已經載入
            if (!this.textures.exists(imageKey)) {
                // 動態載入圖片
                this.load.image(imageKey, word.image);
                this.load.once('complete', () => {
                    this.createWordImage(enemy, word, imageKey);
                });
                this.load.start();
            } else {
                // 圖片已載入，直接創建
                this.createWordImage(enemy, word, imageKey);
            }
        }

        // 添加浮動動畫 - 讓雲朵上下浮動增加真實感
        this.tweens.add({
            targets: enemy,                              // 動畫目標
            y: enemy.y + Phaser.Math.Between(-30, 30),   // 上下浮動30像素範圍
            duration: Phaser.Math.Between(2000, 4000),   // 動畫持續時間2-4秒
            yoyo: true,                                  // 來回運動
            repeat: -1,                                  // 無限重複
            ease: 'Sine.easeInOut'                       // 平滑的緩動效果
        });

        // 添加到敵人群組 - 用於統一管理
        this.enemies.push(enemy);

        console.log(`☁️ 生成雲朵敵人在位置 (${enemy.x}, ${enemy.y})`);
        console.log(`📝 詞彙: ${word.chinese} (${word.english}) - ${isTarget ? '目標' : '干擾'}`);
        console.log(`📐 攝影機 worldView: left=${worldView.left}, right=${worldView.right}, top=${worldView.top}, bottom=${worldView.bottom}`);
    }

    /**
     * 🎯 計算智能縮放比例
     * @param {string} imageKey - 圖片鍵值
     * @param {string} imageSize - 用戶選擇的大小 (small, medium, large)
     * @param {number} maxSize - 最大尺寸（像素）
     * @returns {number} - 縮放比例
     */
    calculateSmartScale(imageKey, imageSize, maxSize) {
        // 獲取圖片的原始尺寸
        const texture = this.textures.get(imageKey);
        if (!texture || !texture.source || !texture.source[0]) {
            console.warn(`⚠️ 圖片 ${imageKey} 不存在或無法獲取尺寸`);
            return 0.15; // 預設縮放比例
        }

        const originalWidth = texture.source[0].width;
        const originalHeight = texture.source[0].height;

        // 計算圖片的最大邊長
        const maxDimension = Math.max(originalWidth, originalHeight);

        // 計算縮放比例，確保圖片不超過最大尺寸
        const scale = maxSize / maxDimension;

        console.log(`🎯 智能縮放: ${imageKey}, 原始: ${originalWidth}x${originalHeight}, 最大: ${maxSize}px, 縮放: ${scale.toFixed(3)}`);

        return scale;
    }

    /**
     * 🖼️ 創建雲朵敵人的圖片顯示
     */
    createWordImage(enemy, word, imageKey) {
        // 防禦性檢查：確保敵人仍然存在
        if (!enemy || !enemy.active) {
            console.warn('⚠️ 敵人已被銷毀，無法創建圖片');
            return;
        }

        // 🎯 使用智能縮放系統
        const imageSize = word.imageSize || 'medium';
        const maxSize = CLOUD_MAX_IMAGE_SIZE[imageSize];
        const scale = this.calculateSmartScale(imageKey, imageSize, maxSize);

        // 創建圖片精靈
        const wordImage = this.add.image(
            enemy.x,
            enemy.y,  // 在雲朵中間顯示
            imageKey
        );

        // 設置圖片屬性
        wordImage.setScale(scale);     // 使用智能縮放比例
        wordImage.setDepth(-62);       // 在文字前面，雲朵後面
        wordImage.setOrigin(0.5);      // 中心對齊
        wordImage.setAlpha(0.9);       // 稍微透明

        // 綁定到敵人
        enemy.setData('wordImage', wordImage);

        console.log(`🖼️ 創建雲朵圖片: ${word.english}, size: ${imageSize}, scale: ${scale.toFixed(3)}`);
    }

    /**
     * ☁️ 更新敵人系統 - 管理敵人生成、移動、碰撞和清理
     */
    updateEnemies() {
        const currentTime = this.time.now;               // 獲取當前時間

        // 生成新敵人 - 根據計時器定期生成
        if (currentTime - this.enemySpawnTimer > this.enemySpawnDelay) {  // 檢查是否到了生成時間
            this.spawnCloudEnemy();                      // 生成新敵人
            this.enemySpawnTimer = currentTime;          // 重置計時器

            // 隨機化下次生成時間 (2-4秒) - 增加遊戲變化性
            this.enemySpawnDelay = Phaser.Math.Between(2000, 4000);
        }

        // 🎯 雲朵邊界檢查將在迴圈內進行，與生成邏輯保持一致

        // 更新現有敵人 - 倒序遍歷以安全刪除元素
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];              // 獲取當前敵人

            if (enemy && enemy.active) {                 // 檢查敵人是否有效且活躍

                // 向左移動 - 敵人從右向左移動
                enemy.x -= enemy.speed;

                // 🆕 同步移動詞彙文字 - 讓文字跟隨敵人移動（在雲中）
                const wordText = enemy.getData('wordText');
                if (wordText && wordText.active) {
                    wordText.x = enemy.x;                // 同步X座標
                    wordText.y = enemy.y;                // 保持在敵人中心（雲朵中心）
                }

                // 🖼️ 同步移動圖片 - 讓圖片跟隨敵人移動（在雲朵中間）
                const wordImage = enemy.getData('wordImage');
                if (wordImage && wordImage.active) {
                    wordImage.x = enemy.x;               // 同步X座標
                    wordImage.y = enemy.y;               // 保持在雲朵中間
                }

                // 檢查與太空船的碰撞 - 碰撞檢測
                if (this.player && this.checkCollision(this.player, enemy)) {
                    // 🆕 處理碰撞 - 判斷是否碰撞正確目標
                    this.handleEnemyCollision(enemy);

                    // 🆕 銷毀詞彙文字
                    if (wordText && wordText.active) {
                        wordText.destroy();
                    }

                    // 🖼️ 銷毀圖片
                    if (wordImage && wordImage.active) {
                        wordImage.destroy();
                    }

                    // 銷毀敵人 - 清理碰撞的敵人
                    enemy.destroy();                     // 銷毀精靈物件
                    this.enemies.splice(i, 1);          // 從陣列中移除
                    continue;                            // 跳過後續檢查
                }

                // 🎯 檢查雲朵是否飛出遊戲區域 - 飛出後銷毀（消失）
                // 使用 worldView 作為邊界，與生成邏輯保持一致
                const cam = this.cameras.main;
                const worldView = cam.worldView;
                if (enemy.x < worldView.left - 100) {    // 只檢查左邊界，雲朵從右向左移動
                    // 🆕 銷毀詞彙文字
                    if (wordText && wordText.active) {
                        wordText.destroy();
                    }

                    // 🖼️ 銷毀圖片
                    if (wordImage && wordImage.active) {
                        wordImage.destroy();
                    }

                    enemy.destroy();                     // 銷毀精靈物件
                    this.enemies.splice(i, 1);          // 從陣列中移除
                    console.log('☁️ 雲朵敵人飛出遊戲區域左邊界，已銷毀');
                }
            } else {
                // 清理無效敵人 - 移除已被銷毀或無效的敵人引用
                this.enemies.splice(i, 1);
            }
        }
    }

    /**
     * 🆕 處理敵人碰撞 - 判斷是否碰撞正確目標並處理後果
     */
    async handleEnemyCollision(enemy) {
        const word = enemy.getData('word');
        const isTarget = enemy.getData('isTarget');

        // 🆕 記錄問題和答案數據
        const questionData = {
            questionNumber: this.questionAnswerLog.length + 1,
            questionText: this.currentTargetWord ? this.currentTargetWord.chinese : '未知問題',
            correctAnswer: this.currentTargetWord ? this.currentTargetWord.english : '未知答案',
            studentAnswer: word.english,
            isCorrect: isTarget,
            timestamp: Date.now()
        };
        this.questionAnswerLog.push(questionData);
        console.log('📝 記錄問題答案:', questionData);

        if (isTarget) {
            // ✅ 碰撞正確目標
            console.log('✅ 碰撞正確目標:', word.chinese, word.english);

            // 增加分數和單字數
            this.score += 10;
            this.wordsLearned += 1;

            // 🧠 記錄 SRS 答題結果 (正確)
            if (this.srsManager && this.currentTargetWord) {
                const responseTime = Date.now() - this.answerStartTime;
                // 傳遞單字英文名稱進行驗證
                await this.srsManager.recordAnswer(true, responseTime, this.currentTargetWord.english);
                console.log(`🧠 SRS 記錄: 正確 (${responseTime}ms)`);
            }

            // 🔇 碰撞答對時不播放語音，避免與新單字語音衝突
            console.log('🔇 碰撞答對：不播放語音，避免衝突');

            // 顯示成功提示 - 在雲朵位置顯示
            this.showSuccessMessage(word, enemy.x, enemy.y);

            // 設置新的目標詞彙
            this.setRandomTargetWord();

            // 🧠 重置答題開始時間
            this.answerStartTime = Date.now();

            // 🧠 更新 SRS 進度顯示
            if (this.srsManager) {
                this.updateSRSProgressDisplay();
            }

            // 更新分數顯示
            this.updateScoreDisplay();
        } else {
            // ❌ 碰撞錯誤目標
            console.log('❌ 碰撞錯誤目標:', word.chinese, word.english);

            // 減少分數和生命值
            this.score = Math.max(0, this.score - 5);
            // 🎮 動態計算傷害：每次碰撞失去一條命（100 / maxLives）
            const damagePerHit = this.healthPerLife;  // 每條命的血量百分比
            this.takeDamage(damagePerHit);

            // 🧠 記錄 SRS 答題結果 (錯誤)
            if (this.srsManager && this.currentTargetWord) {
                const responseTime = Date.now() - this.answerStartTime;
                // 傳遞單字英文名稱進行驗證
                await this.srsManager.recordAnswer(false, responseTime, this.currentTargetWord.english);
                console.log(`🧠 SRS 記錄: 錯誤 (${responseTime}ms)`);

                // 🔄 答錯時不重置答題開始時間,讓用戶繼續嘗試同一個單字
                // this.answerStartTime = Date.now();
            }

            // 顯示錯誤提示 - 在雲朵位置顯示
            this.showErrorMessage(enemy.x, enemy.y);

            // 更新分數顯示
            this.updateScoreDisplay();
        }
    }

    /**
     * 🆕 顯示成功提示 - 在雲朵位置顯示碰撞正確目標時的視覺反饋
     */
    showSuccessMessage(word, x, y) {
        // 創建成功提示文字 - 在雲朵位置顯示
        const successText = this.add.text(
            x,                                               // 雲朵的X位置
            y - 50,                                          // 雲朵上方50像素
            `✅ 正確！\n${word.chinese} (${word.english})`,
            {
                fontSize: '28px',                            // 稍微縮小字體適應雲朵位置
                color: '#00ff00',                            // 綠色文字
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',                           // 黑色描邊
                strokeThickness: 3                           // 描邊厚度
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        successText.setScrollFactor(1);                      // 使用世界座標，跟隨攝影機
        successText.setDepth(400);                           // 確保在最前面

        // 向上飄移 + 淡出動畫
        this.tweens.add({
            targets: successText,
            y: y - 120,                                      // 向上飄移70像素
            alpha: 0,                                        // 淡出
            duration: 1500,                                  // 1.5秒動畫
            ease: 'Power2',                                  // 緩動效果
            onComplete: () => {
                successText.destroy();                       // 動畫完成後銷毀
            }
        });
    }

    /**
     * 🆕 顯示錯誤提示 - 在雲朵位置顯示碰撞錯誤目標時的視覺反饋
     */
    showErrorMessage(x, y) {
        // 創建錯誤提示文字 - 在雲朵位置顯示
        const errorText = this.add.text(
            x,                                               // 雲朵的X位置
            y - 50,                                          // 雲朵上方50像素
            '❌ 錯誤！',
            {
                fontSize: '28px',                            // 稍微縮小字體適應雲朵位置
                color: '#ff0000',                            // 紅色文字
                fontStyle: 'bold',
                stroke: '#000000',                           // 黑色描邊
                strokeThickness: 3                           // 描邊厚度
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        errorText.setScrollFactor(1);                        // 使用世界座標，跟隨攝影機
        errorText.setDepth(400);                             // 確保在最前面

        // 向上飄移 + 淡出動畫
        this.tweens.add({
            targets: errorText,
            y: y - 120,                                      // 向上飄移70像素
            alpha: 0,                                        // 淡出
            duration: 1200,                                  // 1.2秒動畫
            ease: 'Power2',                                  // 緩動效果
            onComplete: () => {
                errorText.destroy();                         // 動畫完成後銷毀
            }
        });
    }

    /**
     * 💥 檢查兩個物件的碰撞 - 使用縮小的矩形邊界檢測碰撞（範圍小一半）
     */
    checkCollision(obj1, obj2) {
        if (!obj1 || !obj2 || !obj1.active || !obj2.active) return false;  // 防禦性檢查

        // 獲取物件的邊界 - 取得兩個物件的矩形邊界
        const bounds1 = obj1.getBounds();               // 第一個物件的邊界矩形
        const bounds2 = obj2.getBounds();               // 第二個物件的邊界矩形

        // 縮小碰撞範圍到一半 - 從中心向內縮小25%（總體縮小50%）
        const shrinkFactor = 0.25; // 每邊縮小25%，總體縮小50%

        // 縮小第一個物件的邊界（太空船）
        const shrunk1 = new Phaser.Geom.Rectangle(
            bounds1.x + bounds1.width * shrinkFactor,
            bounds1.y + bounds1.height * shrinkFactor,
            bounds1.width * (1 - shrinkFactor * 2),
            bounds1.height * (1 - shrinkFactor * 2)
        );

        // 縮小第二個物件的邊界（雲朵）
        const shrunk2 = new Phaser.Geom.Rectangle(
            bounds2.x + bounds2.width * shrinkFactor,
            bounds2.y + bounds2.height * shrinkFactor,
            bounds2.width * (1 - shrinkFactor * 2),
            bounds2.height * (1 - shrinkFactor * 2)
        );

        // 檢查縮小後的矩形碰撞 - 使用Phaser內建的矩形重疊檢測
        return Phaser.Geom.Rectangle.Overlaps(shrunk1, shrunk2);
    }

    /**
     * 更新視差背景 - 讓不同背景層以不同速度滾動創造深度感
     */
    updateParallaxBackground() {
        if (!this.backgroundLayers) return;             // 防禦性檢查

        // 不同層以不同速度移動創造視差效果 - 遠的慢，近的快
        const speeds = {
            sky: 0.05,    // 最遠星空層移動最慢
            moon: 0.2,    // 月亮層稍快
            back: 0.3,    // 遠景雲層
            mid: 0.5,     // 中景雲層
            front: 0.7,   // 近景雲層
            floor: 1.0    // 最前景移動最快
        };

        // 更新每層的滾動位置 - 遍歷所有背景層
        Object.keys(this.backgroundLayers).forEach(layerName => {
            const layer = this.backgroundLayers[layerName];  // 獲取背景層物件
            const speed = speeds[layerName] || 0.5;      // 獲取該層的滾動速度

            if (layer && layer.visible) {                // 檢查層是否存在且可見
                // 更新滾動位置 - 累加滾動偏移量
                this.scrollPositions[layerName] += speed;
                layer.tilePositionX = this.scrollPositions[layerName];  // 應用水平滾動
            }
        });
    }

    registerResponsiveElements() {
        // 將所有元素註冊到響應式系統 - 用於螢幕尺寸變化時的自動調整
        this.responsiveElements = [
            ...this.testElements                         // 展開測試元素陣列
        ];

        // 註冊視差背景層到響應式系統 - 確保背景層能適應螢幕尺寸變化
        if (this.backgroundLayers) {                     // 檢查背景層是否存在
            Object.values(this.backgroundLayers).forEach(layer => {  // 遍歷所有背景層
                if (layer) {                             // 檢查層是否有效
                    this.responsiveElements.push({       // 添加到響應式元素陣列
                        onResize: () => {                // 定義尺寸變化時的回調函數
                            // 響應式調整背景層尺寸 - 根據新的螢幕尺寸調整背景
                            const { width, height } = this;
                            layer.setSize(width, height);  // 設置背景層新尺寸
                        }
                    });
                }
            });
        }
    }

    /**
     * 🚀 更新太空船（非物理移動）- 處理太空船的移動邏輯和邊界限制
     * 🎮 整合 TouchControls 虛擬按鈕支援
     * 🔧 修復：協調三種控制方式，避免衝突
     */
    updateSpaceship() {
        if (!this.player || !this.cursors) return;      // 防禦性檢查

        const { height } = this;                         // 獲取場景高度
        const moveSpeed = 4;                             // 每幀移動像素數

        // 🔧 控制優先級系統：鍵盤 > 點擊移動
        let hasDirectInput = false;  // 標記是否有直接輸入（鍵盤）

        // 優先級 1: ⌨️ 鍵盤控制邏輯 - 處理方向鍵和WASD鍵輸入
        if (this.cursors.up.isDown || this.wasd.W.isDown) {      // 檢查上方向鍵或W鍵
            this.player.y -= moveSpeed;                  // 向上移動
            hasDirectInput = true;  // 標記有直接輸入
            // 取消點擊移動目標，避免衝突
            this.playerTargetY = this.player.y;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {  // 檢查下方向鍵或S鍵
            this.player.y += moveSpeed;                  // 向下移動
            hasDirectInput = true;  // 標記有直接輸入
            // 取消點擊移動目標，避免衝突
            this.playerTargetY = this.player.y;
        }
        // 優先級 2: 🖱️ 點擊移動到目標位置（平滑移動） - 只在沒有直接輸入時執行
        else if (!this.isLongPressing && !hasDirectInput && Math.abs(this.player.y - this.playerTargetY) > 2) {
            const direction = this.playerTargetY > this.player.y ? 1 : -1;  // 計算移動方向
            this.player.y += direction * moveSpeed;      // 向目標位置移動
        }

        // 限制太空船在合理的垂直範圍內 - 防止太空船移出螢幕
        if (this.player.y < 80) {                        // 檢查上邊界
            this.player.y = 80;                          // 限制在上邊界
        }
        if (this.player.y > height - 80) {               // 檢查下邊界
            this.player.y = height - 80;                 // 限制在下邊界
        }

        // 更新目標位置以防超出邊界 - 確保目標位置也在有效範圍內
        this.playerTargetY = Math.max(80, Math.min(height - 80, this.playerTargetY));
    }

    /**
     * 場景更新函數
     */
    /**
     * 🆕 更新 UI 元素位置 - 動態布局（根據圖片和文字是否存在調整）
     */
    updateUIPositions() {
        if (!this.scoreText) return;

        // 🎯 更新血條位置 - 血條保持在右下角
        this.updateHealthBarPositions();

        // 🎯 動態布局使用世界座標
        const cam = this.cameras.main;
        const worldView = cam.worldView;

        // 🎯 設置在世界頂部的位置：居中對齊
        const worldTopY = worldView.top + 50;  // 距離世界頂部 50px
        const worldCenterX = (worldView.left + worldView.right) / 2;  // 世界中心 X

        // 🎯 檢查圖片和文字是否存在
        const hasEnglishImage = this.englishImage && this.englishImage.visible;
        const hasChineseImage = this.chineseImage && this.chineseImage.visible;
        const hasEnglishText = this.currentTargetWord?.english && this.currentTargetWord.english.trim() !== '';
        const hasChineseText = this.currentTargetWord?.chinese && this.currentTargetWord.chinese.trim() !== '';

        // 🎯 動態計算列數和間距
        const spacing = 150;  // 每列之間的間距

        // 計算總列數（分數 + 英文圖片? + 英文文字? + 中文圖片? + 中文文字?）
        let totalColumns = 1;  // 基礎：分數
        if (hasEnglishImage) totalColumns++;
        if (hasEnglishText) totalColumns++;
        if (hasChineseImage) totalColumns++;
        if (hasChineseText) totalColumns++;

        // 計算起始位置（讓整個布局居中）
        const totalWidth = (totalColumns - 1) * spacing;
        const startX = worldCenterX - totalWidth / 2;

        // 🎯 動態分配列位置
        let currentColumn = 0;

        // 第一列：分數和計時器（總是存在）
        const col1X = startX + spacing * currentColumn;

        // 🆕 計算分數和計時器的水平布局
        // 如果有計時器，分數和計時器並排顯示
        if (this.timerText && this.timerText.text && this.timerText.text.trim() !== '') {
            // 計時器在左，分數在右
            const timerWidth = 80;  // 計時器寬度估計
            this.timerText.setPosition(col1X - timerWidth / 2, worldTopY);
            this.scoreText.setPosition(col1X + timerWidth / 2, worldTopY);
        } else {
            // 沒有計時器，分數居中
            this.scoreText.setPosition(col1X, worldTopY);
            if (this.timerText) {
                this.timerText.setVisible(false);
            }
        }

        currentColumn++;

        // 第二列：英文圖片（如果存在）
        if (hasEnglishImage) {
            const col2X = startX + spacing * currentColumn;
            this.englishImage.setPosition(col2X, worldTopY);
            currentColumn++;
        }

        // 第三列：英文文字（如果存在）
        if (hasEnglishText && this.englishText) {
            const col3X = startX + spacing * currentColumn;
            this.englishText.setPosition(col3X, worldTopY);
            this.englishText.setVisible(true);
            currentColumn++;
        } else if (this.englishText) {
            this.englishText.setVisible(false);
        }

        // 第四列：中文圖片（如果存在）
        if (hasChineseImage) {
            const col4X = startX + spacing * currentColumn;
            this.chineseImage.setPosition(col4X, worldTopY);
            currentColumn++;
        }

        // 第五列：中文文字（如果存在）
        if (hasChineseText && this.chineseText) {
            const col5X = startX + spacing * currentColumn;
            this.chineseText.setPosition(col5X, worldTopY);
            this.chineseText.setVisible(true);
        } else if (this.chineseText) {
            this.chineseText.setVisible(false);
        }
    }

    /**
     * 🎯 更新血條位置 - 讓血條適應不同螢幕尺寸和相機變化
     */
    updateHealthBarPositions() {
        if (!this.healthBarBg || !this.healthBarBackground || !this.healthBar || !this.healthText) return;

        const cam = this.cameras.main;
        const visibleWidth = cam.width;
        const visibleHeight = cam.height;

        // 🎯 動態計算血條位置（回到原本右下角位置，縮小50%，往左移動一些）
        const healthBarWidth = 100;                      // 縮小50%：200 → 100
        const healthBarHeight = 10;                      // 縮小50%：20 → 10
        const margin = 20;
        const leftOffset = 50;                           // 往左移動的額外距離
        const healthBarX = cam.scrollX + visibleWidth - margin - healthBarWidth - leftOffset;   // 動態右邊距，往左移動
        const healthBarY = cam.scrollY + visibleHeight - margin - healthBarHeight - (visibleHeight * 0.05); // 動態底部邊距，上升5%高度

        // 更新血條背景位置
        this.healthBarBg.setPosition(healthBarX, healthBarY);
        this.healthBarBackground.setPosition(healthBarX + 2, healthBarY + 2);
        this.healthBar.setPosition(healthBarX + 2, healthBarY + 2);
        this.healthText.setPosition(healthBarX - 15, healthBarY + healthBarHeight / 2);
    }

    /**
     * 🎮 遊戲結束處理 - 提交結果並顯示結束畫面
     */
    async gameOver() {
        console.log('🎮 遊戲結束！');

        // 停止遊戲更新
        this.sceneStopped = true;

        // 🧠 完成 SRS 會話
        let srsStats = null;
        if (this.srsManager) {
            console.log('🧠 完成 SRS 學習會話...');
            srsStats = await this.srsManager.finishSession();
        }

        // 準備遊戲結果數據
        const gameResult = {
            score: this.score || 0,
            correctAnswers: this.wordsLearned || 0,
            totalQuestions: this.questionAnswerLog.length || 0, // 使用實際問題數量
            timeSpent: Math.floor((Date.now() - (this.gameStartTime || Date.now())) / 1000),
            gameType: 'shimozurdo-game',
            finalHealth: this.currentHealth || 0,
            maxHealth: this.maxHealth || 100,
            // 🆕 添加詳細的問題答案數據
            questions: this.questionAnswerLog || [],
            // 🧠 添加 SRS 統計數據
            srsStats: srsStats
        };

        console.log('📊 遊戲結果:', gameResult);

        // 提交結果到 EduCreate 系統
        if (window.EduCreateResultCollector && window.EduCreateResultCollector.isAssignmentMode()) {
            console.log('📤 提交遊戲結果到 EduCreate 系統');
            window.EduCreateResultCollector.submitGameResult(gameResult)
                .then(result => {
                    if (result.success) {
                        console.log('✅ 結果提交成功:', result);
                        this.showGameOverScreen(gameResult, true);
                    } else {
                        console.warn('⚠️ 結果提交失敗:', result);
                        this.showGameOverScreen(gameResult, false);
                    }
                })
                .catch(error => {
                    console.error('❌ 結果提交錯誤:', error);
                    this.showGameOverScreen(gameResult, false);
                });
        } else {
            console.log('ℹ️ 非課業分配模式，跳過結果提交');
            this.showGameOverScreen(gameResult, false);
        }
    }

    /**
     * 🎭 顯示遊戲結束畫面
     */
    showGameOverScreen(gameResult, resultSubmitted) {
        // 創建半透明背景
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);

        // 遊戲結束標題
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 200,
            '🎉 學習完成！',
            {
                fontSize: '48px',
                color: '#44ff44',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        gameOverText.setDepth(1001);

        // 基本統計
        const scoreText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 130,
            `最終分數: ${gameResult.score}\n學會單字: ${gameResult.correctAnswers}\n遊戲時間: ${gameResult.timeSpent}秒`,
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        );
        scoreText.setOrigin(0.5);
        scoreText.setScrollFactor(0);
        scoreText.setDepth(1001);

        // 🧠 SRS 學習總結
        if (gameResult.srsStats && this.srsManager) {
            const srsText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 30,
                `\n📊 學習總結\n正確率: ${gameResult.srsStats.accuracy.toFixed(1)}%\n答對: ${gameResult.srsStats.correctAnswers}/${gameResult.srsStats.totalAnswers}`,
                {
                    fontSize: '20px',
                    color: '#ffff44',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2,
                    align: 'center'
                }
            );
            srsText.setOrigin(0.5);
            srsText.setScrollFactor(0);
            srsText.setDepth(1001);

            // 🧠 顯示單字進度變化（如果有）
            if (gameResult.srsStats.wordDetails && gameResult.srsStats.wordDetails.length > 0) {
                // 只顯示前 3 個單字的進度變化
                const topWords = gameResult.srsStats.wordDetails.slice(0, 3);
                let wordProgressText = '\n記憶強度提升:\n';

                topWords.forEach(word => {
                    const strengthChange = word.memoryStrength - (word.previousStrength || 0);
                    const arrow = strengthChange > 0 ? '⬆️' : strengthChange < 0 ? '⬇️' : '➡️';
                    wordProgressText += `${word.english}: ${word.previousStrength || 0}% → ${word.memoryStrength}% ${arrow}\n`;
                });

                const wordDetailsText = this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 40,
                    wordProgressText,
                    {
                        fontSize: '16px',
                        color: '#aaffaa',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 2,
                        align: 'center'
                    }
                );
                wordDetailsText.setOrigin(0.5);
                wordDetailsText.setScrollFactor(0);
                wordDetailsText.setDepth(1001);
            }
        }

        // 結果提交狀態
        if (resultSubmitted) {
            const submitText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 120,
                '✅ 結果已成功記錄到課業系統',
                {
                    fontSize: '18px',
                    color: '#44ff44',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            submitText.setOrigin(0.5);
            submitText.setScrollFactor(0);
            submitText.setDepth(1001);
        }

        // 重新開始按鈕
        const restartButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 180,
            '🔄 點擊重新開始',
            {
                fontSize: '20px',
                color: '#ffff44',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        restartButton.setOrigin(0.5);
        restartButton.setScrollFactor(0);
        restartButton.setDepth(1001);
        restartButton.setInteractive({ cursor: 'pointer' });

        // 重新開始遊戲
        restartButton.on('pointerdown', () => {
            console.log('🔄 重新開始遊戲');
            this.scene.restart();
        });

        // 添加閃爍效果
        this.tweens.add({
            targets: restartButton,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    update() {
        if (!this.sceneStopped) {
            this.updateParallaxBackground();
            this.updateSpaceship();
            this.updateEnemies();
            this.updateUIPositions();  // 🆕 更新 UI 位置
        }
    }

    /**
     * 🧠 創建 SRS 進度顯示
     */
    createSRSProgressDisplay() {
        if (!this.srsManager) return;

        const progress = this.srsManager.getProgress();

        // 創建進度文字 (右上角)
        this.srsProgressText = this.add.text(
            this.cameras.main.width - 20,
            20,
            `SRS 進度: ${progress.current}/${progress.total}`,
            {
                fontSize: '20px',
                color: '#ffff00',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.srsProgressText.setOrigin(1, 0);
        this.srsProgressText.setScrollFactor(0);
        this.srsProgressText.setDepth(100);

        console.log('🧠 SRS 進度顯示已創建');
    }

    /**
     * 🧠 更新 SRS 進度顯示
     */
    updateSRSProgressDisplay() {
        if (!this.srsManager || !this.srsProgressText) return;

        const progress = this.srsManager.getProgress();
        this.srsProgressText.setText(`SRS 進度: ${progress.current}/${progress.total}`);

        console.log(`🧠 SRS 進度更新: ${progress.current}/${progress.total} (${progress.percentage}%)`);
    }

    /**
     * 🎮 應用遊戲選項
     */
    applyGameOptions() {
        const { width, height } = this;

        // 1. 應用 Timer 選項
        this.applyTimerOption(width, height);

        // 2. 應用 Speed 選項
        this.applySpeedOption();

        // 3. 應用 Random 選項（如果有詞彙列表）
        this.applyRandomOption();

        console.log('✅ 所有遊戲選項已應用');
    }

    /**
     * ⏱️ 應用 Timer 選項
     */
    applyTimerOption(width, height) {
        const timerOption = this.gameOptions.timer;

        if (timerOption.type === 'countDown') {
            // 倒數計時
            const totalSeconds = (timerOption.minutes || 0) * 60 + (timerOption.seconds || 0);
            this.timeRemaining = totalSeconds;

            // 🆕 使用五列布局中已創建的 timerText，只需設置初始文字
            if (this.timerText) {
                this.timerText.setText(this.formatTime(this.timeRemaining));
                this.timerText.setVisible(true);  // 確保可見
            }

            // 啟動倒數計時器
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.timeRemaining--;
                    if (this.timerText) {
                        this.timerText.setText(this.formatTime(this.timeRemaining));

                        // 時間快結束時變紅色
                        if (this.timeRemaining <= 10) {
                            this.timerText.setColor('#ff0000');
                        }
                    }

                    if (this.timeRemaining <= 0) {
                        this.timerEvent.remove();
                        this.gameOver('時間到！');
                    }
                },
                loop: true
            });

            console.log('⏱️ 倒數計時器已啟動:', totalSeconds, '秒');

        } else if (timerOption.type === 'countUp') {
            // 正向計時
            this.timeElapsed = 0;

            // 🆕 使用五列布局中已創建的 timerText，只需設置初始文字
            if (this.timerText) {
                this.timerText.setText(this.formatTime(this.timeElapsed));
                this.timerText.setVisible(true);  // 確保可見
            }

            // 啟動正向計時器
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.timeElapsed++;
                    if (this.timerText) {
                        this.timerText.setText(this.formatTime(this.timeElapsed));
                    }
                },
                loop: true
            });

            console.log('⏱️ 正向計時器已啟動');
        } else {
            // 🆕 Timer 選項為 none，隱藏計時器
            if (this.timerText) {
                this.timerText.setVisible(false);
            }
            console.log('ℹ️ Timer 選項為 none，不顯示計時器');
        }
    }

    /**
     * 🕐 格式化時間顯示
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * ⚡ 應用 Speed 選項
     */
    applySpeedOption() {
        const speed = this.gameOptions.speed || 3;
        // 1-10 映射到 0.5-5.0 (更大的速度範圍)
        // speed=1 → 0.5x (最慢)
        // speed=3 → 1.5x (默認稍快)
        // speed=5 → 2.5x (中等)
        // speed=10 → 5.0x (最快)
        this.speedMultiplier = speed * 0.5;

        console.log('⚡ 遊戲速度:', speed, '倍率:', this.speedMultiplier.toFixed(2) + 'x');

        // 如果已經有敵人系統，更新速度
        if (this.enemySpawnTimer) {
            // 調整敵人生成速度
            this.enemySpawnTimer.delay = 2000 / this.speedMultiplier;
        }
    }

    /**
     * 🔀 應用 Random 選項
     */
    applyRandomOption() {
        if (this.gameOptions.random && this.game.geptManager) {
            // 獲取當前等級的詞彙
            const currentWords = this.game.geptManager.getCurrentLevelWords();
            if (currentWords && currentWords.length > 0) {
                // 隨機打亂詞彙順序
                const shuffledWords = this.shuffleArray(currentWords);
                // 更新 GEPT Manager 的詞彙列表
                this.game.geptManager.words = shuffledWords;
                console.log('🔀 詞彙順序已隨機打亂');
            }
        }
    }

    /**
     * 🔀 打亂數組
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 🎮 遊戲結束處理
     */
    gameOver(reason) {
        console.log('🎮 遊戲結束:', reason);

        // 停止計時器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 停止敵人生成（enemySpawnTimer 是數字，不需要 remove）
        // 只需要設置一個標誌來停止更新
        this.sceneStopped = true;

        // 顯示遊戲結束畫面
        this.showGameOverScreen(reason);
    }

    /**
     * 📝 顯示遊戲結束畫面（完整實現 Wordwall 流程）
     */
    showGameOverScreen(reason) {
        // 🎯 參考 a781244 版本：使用 cameras.main 的 centerX/centerY 屬性
        const cam = this.cameras.main;

        // 創建半透明背景
        const overlay = this.add.rectangle(
            cam.centerX,
            cam.centerY,
            cam.width,
            cam.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(2000);

        // 保存 overlay 引用，用於後續隱藏/顯示
        this.gameOverOverlay = overlay;

        // 創建選項畫面容器
        const optionsContainer = this.add.container(cam.centerX, cam.centerY)
            .setDepth(2001)
            .setScrollFactor(0);

        // 保存容器引用
        this.gameOverOptionsContainer = optionsContainer;

        // 顯示遊戲結束標題（縮短文字，避免重疊）
        const gameOverText = this.add.text(
            0,
            -250,
            '🎮 遊戲結束',
            {
                fontSize: '42px',
                fill: '#ffff00',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        optionsContainer.add(gameOverText);

        // 顯示結束原因（如果不是標準的「遊戲結束」）
        if (reason !== '遊戲結束' && reason !== '🎮 遊戲結束') {
            const reasonText = this.add.text(
                0,
                -200,
                reason,
                {
                    fontSize: '24px',
                    fill: '#ff6b6b',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);

            optionsContainer.add(reasonText);
        }

        // 計算統計信息
        const correctCount = this.questionAnswerLog.filter(q => q.isCorrect).length;
        const totalCount = this.questionAnswerLog.length;
        const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
        const timeSpent = Math.floor((Date.now() - (this.gameStartTime || Date.now())) / 1000);

        // 顯示統計信息（調整位置和格式）
        const statsText = this.add.text(
            0,
            -140,
            `最終分數: ${this.score || 0}\n正確率: ${accuracy}%\n答對: ${correctCount}/${totalCount}\n遊戲時間: ${timeSpent}秒`,
            {
                fontSize: '22px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3,
                lineSpacing: 5
            }
        ).setOrigin(0.5);

        optionsContainer.add(statsText);

        // 添加分隔線
        const separator1 = this.add.graphics();
        separator1.lineStyle(3, 0xffffff, 0.7);
        separator1.lineBetween(-250, -40, 250, -40);
        separator1.setScrollFactor(0);
        separator1.setDepth(2001);
        optionsContainer.add(separator1);  // 🔧 添加到容器

        // 保存分隔線引用
        this.separator1 = separator1;

        // 🆕 輸入名稱標籤
        const nameLabel = this.add.text(
            0,
            -5,
            '輸入你的名稱：',
            {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        optionsContainer.add(nameLabel);

        // 🆕 創建名稱輸入框（使用 DOM 元素）
        const nameInputElement = document.createElement('input');
        nameInputElement.type = 'text';
        nameInputElement.placeholder = '請輸入名稱...';
        nameInputElement.style.position = 'absolute';
        nameInputElement.style.left = `${cam.centerX - 150}px`;
        nameInputElement.style.top = `${cam.centerY + 35}px`;
        nameInputElement.style.width = '300px';
        nameInputElement.style.height = '40px';
        nameInputElement.style.fontSize = '18px';
        nameInputElement.style.padding = '5px 10px';
        nameInputElement.style.border = '2px solid #ffffff';
        nameInputElement.style.borderRadius = '5px';
        nameInputElement.style.backgroundColor = '#333333';
        nameInputElement.style.color = '#ffffff';
        nameInputElement.style.textAlign = 'center';
        nameInputElement.style.zIndex = '9999'; // 🔧 提高 zIndex 確保在最上層
        nameInputElement.style.pointerEvents = 'auto'; // 🔧 確保可以點擊和輸入

        // 添加到 DOM
        document.body.appendChild(nameInputElement);

        // 保存引用，用於後續清理
        this.nameInputElement = nameInputElement;

        // 🆕 保存用戶輸入的名稱
        nameInputElement.addEventListener('input', (e) => {
            this.playerName = e.target.value;
            console.log('👤 用戶輸入名稱:', this.playerName);
        });

        // 🆕 添加提示文字：告訴用戶輸入名稱後點擊綠色按鈕
        const hintText = this.add.text(
            0,
            75,
            '👇 輸入名稱後，點擊下方綠色按鈕查看排行榜',
            {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                fontStyle: 'italic',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        hintText.setScrollFactor(0);
        hintText.setDepth(2001);

        optionsContainer.add(hintText);

        // 添加第二條分隔線
        const separator2 = this.add.graphics();
        separator2.lineStyle(3, 0xffffff, 0.7);
        separator2.lineBetween(-250, 100, 250, 100);
        separator2.setScrollFactor(0);
        separator2.setDepth(2001);
        optionsContainer.add(separator2);  // 🔧 添加到容器

        // 保存分隔線引用
        this.separator2 = separator2;

        // 🆕 按鈕起始位置
        let buttonY = 140;

        // 🆕 顯示答案按鈕（只有啟用 Show Answers 時才顯示）
        if (this.gameOptions.showAnswers && this.game.geptManager) {
            const showAnswersButton = this.add.text(
                0,
                buttonY,
                '� 顯示答案',
                {
                    fontSize: '24px',
                    fill: '#ffffff',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    backgroundColor: '#2196F3',
                    padding: { x: 25, y: 12 }
                }
            ).setOrigin(0.5);

            // 🔧 設置 depth 和 scrollFactor，確保按鈕在最上層
            showAnswersButton.setScrollFactor(0);
            showAnswersButton.setDepth(2002);
            showAnswersButton.setInteractive({ cursor: 'pointer' });

            // hover 效果
            showAnswersButton.on('pointerover', () => {
                showAnswersButton.setStyle({ backgroundColor: '#1976D2' });
            });

            showAnswersButton.on('pointerout', () => {
                showAnswersButton.setStyle({ backgroundColor: '#2196F3' });
            });

            // 點擊事件：顯示答案畫面
            showAnswersButton.on('pointerdown', () => {
                console.log('🔍 點擊顯示答案按鈕');

                // 隱藏選項畫面
                this.gameOverOptionsContainer.setVisible(false);
                if (this.nameInputElement) {
                    this.nameInputElement.style.display = 'none';
                }

                // 顯示答案畫面
                this.showAnswersScreen(cam.width, cam.height);
            });

            optionsContainer.add(showAnswersButton);
            buttonY += 60;  // 下一個按鈕的位置
        }

        // 🆕 確認並查看排行榜按鈕（更明顯的提示）
        const leaderboardButton = this.add.text(
            0,
            buttonY,
            '✅ 確認名稱並查看排行榜',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: '#4CAF50',  // 綠色，表示確認操作
                padding: { x: 25, y: 12 }
            }
        ).setOrigin(0.5);

        // 🔧 設置 depth 和 scrollFactor，確保按鈕在最上層
        leaderboardButton.setScrollFactor(0);
        leaderboardButton.setDepth(2002);
        leaderboardButton.setInteractive({ cursor: 'pointer' });

        // hover 效果
        leaderboardButton.on('pointerover', () => {
            leaderboardButton.setStyle({ backgroundColor: '#45a049' });  // 深綠色
        });

        leaderboardButton.on('pointerout', () => {
            leaderboardButton.setStyle({ backgroundColor: '#4CAF50' });  // 綠色
        });

        // 點擊事件：確認名稱並顯示排行榜畫面
        leaderboardButton.on('pointerdown', async () => {
            console.log('✅ 點擊確認名稱並查看排行榜按鈕');
            console.log('👤 當前玩家名稱:', this.playerName || '匿名玩家');

            // 🆕 先保存分數到排行榜
            await this.saveScoreToLeaderboard();

            // 隱藏選項畫面
            this.gameOverOptionsContainer.setVisible(false);
            if (this.nameInputElement) {
                this.nameInputElement.style.display = 'none';
            }

            // 顯示排行榜畫面
            await this.showLeaderboardScreen();
        });

        optionsContainer.add(leaderboardButton);
        buttonY += 60;  // 下一個按鈕的位置

        // 重新開始按鈕
        const restartButton = this.add.text(
            0,
            buttonY,
            '🔄 重新開始',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: '#FF9800',  // 橙色，表示重新開始
                padding: { x: 25, y: 12 }
            }
        ).setOrigin(0.5);

        // 🔧 設置 depth 和 scrollFactor，確保按鈕在最上層
        restartButton.setScrollFactor(0);
        restartButton.setDepth(2002);
        restartButton.setInteractive({ cursor: 'pointer' });

        // hover 效果
        restartButton.on('pointerover', () => {
            restartButton.setStyle({ backgroundColor: '#F57C00' });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ backgroundColor: '#FF9800' });
        });

        // 點擊事件：重新開始遊戲
        restartButton.on('pointerdown', () => {
            console.log('🔄 點擊重新開始按鈕（選項畫面）');

            // 🆕 保存分數到排行榜
            this.saveScoreToLeaderboard();

            // 清理 DOM 元素
            if (this.nameInputElement) {
                document.body.removeChild(this.nameInputElement);
                this.nameInputElement = null;
            }
            this.scene.restart();
        });

        optionsContainer.add(restartButton);

        console.log('📝 遊戲結束選項畫面已顯示（完整 Wordwall 流程）');
    }

    /**
     * 📝 顯示答案畫面（參考 Wordwall 設計）
     */
    showAnswersScreen(width, height) {
        // 🎯 參考 a781244 版本：使用 cameras.main 的 centerX/centerY 屬性
        const cam = this.cameras.main;

        // 創建答案顯示容器
        const answersContainer = this.add.container(cam.centerX, cam.centerY)
            .setDepth(2002)
            .setScrollFactor(0);

        // 標題
        const title = this.add.text(0, -250, '📋 詳細答案', {
            fontSize: '32px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        answersContainer.add(title);

        // 🆕 計算統計信息
        const correctCount = this.questionAnswerLog.filter(q => q.isCorrect).length;
        const totalCount = this.questionAnswerLog.length;
        const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;

        // 🆕 顯示統計信息
        const statsText = this.add.text(0, -210,
            `正確率: ${accuracy}% | 答對: ${correctCount}/${totalCount}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        answersContainer.add(statsText);

        // 🆕 添加分隔線
        const separator = this.add.graphics();
        separator.lineStyle(2, 0xffffff, 0.5);
        separator.lineBetween(-200, -185, 200, -185);
        separator.setScrollFactor(0);
        separator.setDepth(2002);
        answersContainer.add(separator);

        // 🆕 使用 questionAnswerLog 顯示詳細答案（水平排列）
        const maxVisibleItems = 5; // 一次最多顯示 5 個問題
        const itemHeight = 40; // 每個問題佔 40 像素（1 行文字）

        // 如果問題數量超過最大可見數量，添加滾動提示
        if (this.questionAnswerLog.length > maxVisibleItems) {
            const scrollHint = this.add.text(0, -165, '(滾動查看更多)', {
                fontSize: '16px',
                fill: '#aaaaaa',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            answersContainer.add(scrollHint);
        }

        // 創建答案列表容器（用於滾動）
        const listContainer = this.add.container(0, -140);
        answersContainer.add(listContainer);

        // 🆕 顯示每個問題的詳細信息（題目與答案水平排列）
        this.questionAnswerLog.forEach((question, index) => {
            const yPos = index * itemHeight;

            // 🎯 題目與答案水平排列
            // 格式：第1題 貓 | 答對: apple ✅ | 你的答案: apple ✅

            // 題目編號和文字（黃色，粗體）
            const questionPart = `第${question.questionNumber}題 ${question.questionText}`;

            // 正確答案部分（綠色）
            const correctPart = `答對: ${question.correctAnswer}`;

            // 用戶答案部分（根據正確與否顯示顏色）
            const userAnswerIcon = question.isCorrect ? '✅' : '❌';
            const userPart = `你的答案: ${question.studentAnswer} ${userAnswerIcon}`;

            // 組合成一行文字
            const fullText = `${questionPart} | ${correctPart} | ${userPart}`;

            // 根據正確與否決定整行的顏色
            const textColor = question.isCorrect ? '#00ff00' : '#ff0000';

            const answerLine = this.add.text(0, yPos, fullText, {
                fontSize: '16px',
                fill: textColor,
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: 500 }
            }).setOrigin(0.5);

            listContainer.add(answerLine);
        });

        // 如果問題數量超過最大可見數量，添加滾動功能
        if (this.questionAnswerLog.length > maxVisibleItems) {
            let currentScroll = 0;
            const maxScroll = (this.questionAnswerLog.length - maxVisibleItems) * itemHeight;

            // 添加滾動按鈕（放在左側）
            const scrollUpButton = this.add.text(-250, 0, '▲', {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);

            scrollUpButton.setScrollFactor(0);
            scrollUpButton.setDepth(2003);
            scrollUpButton.setInteractive({ cursor: 'pointer' });

            const scrollDownButton = this.add.text(-250, 50, '▼', {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);

            scrollDownButton.setScrollFactor(0);
            scrollDownButton.setDepth(2003);
            scrollDownButton.setInteractive({ cursor: 'pointer' });

            answersContainer.add(scrollUpButton);
            answersContainer.add(scrollDownButton);

            // 滾動向上
            scrollUpButton.on('pointerdown', () => {
                currentScroll = Math.max(0, currentScroll - itemHeight * 2);
                listContainer.y = -140 - currentScroll;
                console.log(`⬆️ 向上滾動，當前滾動位置: ${currentScroll}`);
            });

            // 滾動向下
            scrollDownButton.on('pointerdown', () => {
                currentScroll = Math.min(maxScroll, currentScroll + itemHeight * 2);
                listContainer.y = -140 - currentScroll;
                console.log(`⬇️ 向下滾動，當前滾動位置: ${currentScroll}`);
            });

            console.log(`📝 答案畫面已顯示（${this.questionAnswerLog.length} 個問題，可滾動）`);
        } else {
            console.log(`📝 答案畫面已顯示（${this.questionAnswerLog.length} 個問題）`);
        }

        // 保存答案容器引用
        this.answersContainer = answersContainer;

        // 🆕 重新開始按鈕（在答案畫面中）
        const restartButton2 = this.add.text(
            0,
            220,
            '� 重新開始',
            {
                fontSize: '28px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: '#4CAF50',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);

        restartButton2.setScrollFactor(0);
        restartButton2.setDepth(2003);
        restartButton2.setInteractive({ cursor: 'pointer' });

        // hover 效果
        restartButton2.on('pointerover', () => {
            restartButton2.setStyle({ backgroundColor: '#45a049' });
        });

        restartButton2.on('pointerout', () => {
            restartButton2.setStyle({ backgroundColor: '#4CAF50' });
        });

        // 點擊事件：重新開始遊戲
        restartButton2.on('pointerdown', () => {
            console.log('🔄 點擊重新開始按鈕（答案畫面）');

            // 🆕 保存分數到排行榜
            this.saveScoreToLeaderboard();

            // 清理 DOM 元素
            if (this.nameInputElement) {
                document.body.removeChild(this.nameInputElement);
                this.nameInputElement = null;
            }
            this.scene.restart();
        });

        answersContainer.add(restartButton2);

        // 🆕 返回按鈕
        const backButton = this.add.text(
            0,
            280,
            '� 返回',
            {
                fontSize: '28px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: '#757575',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);

        backButton.setScrollFactor(0);
        backButton.setDepth(2003);
        backButton.setInteractive({ cursor: 'pointer' });

        // hover 效果
        backButton.on('pointerover', () => {
            backButton.setStyle({ backgroundColor: '#616161' });
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ backgroundColor: '#757575' });
        });

        // 點擊事件：返回選項畫面
        backButton.on('pointerdown', () => {
            console.log('🔙 點擊返回按鈕');

            // 隱藏答案畫面
            answersContainer.setVisible(false);

            // 顯示選項畫面
            this.gameOverOptionsContainer.setVisible(true);
            if (this.nameInputElement) {
                this.nameInputElement.style.display = 'block';
            }

            console.log('✅ 已返回選項畫面');
        });

        answersContainer.add(backButton);

        console.log('📝 答案畫面已顯示（完整 Wordwall 流程）');
    }

    /**
     * 💾 保存分數到排行榜（使用後端 API）
     */
    async saveScoreToLeaderboard() {
        // 獲取用戶輸入的名稱
        const playerName = this.playerName || '匿名玩家';

        // 計算統計信息
        const correctCount = this.questionAnswerLog.filter(q => q.isCorrect).length;
        const totalCount = this.questionAnswerLog.length;
        const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : 0;
        const timeSpent = Math.floor((Date.now() - (this.gameStartTime || Date.now())) / 1000);

        // 獲取 activityId（從 URL 參數）
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        if (!activityId) {
            console.error('❌ 無法獲取 activityId');
            return;
        }

        // 創建分數記錄
        const scoreEntry = {
            activityId: activityId,
            playerName: playerName,
            score: this.score || 0,
            correctCount: correctCount,
            totalCount: totalCount,
            accuracy: parseFloat(accuracy),
            timeSpent: timeSpent,
            gameData: {
                questionAnswerLog: this.questionAnswerLog,
                timestamp: Date.now(),
                date: new Date().toLocaleString('zh-TW')
            }
        };

        // 保存到後端數據庫
        try {
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreEntry),
            });

            if (!response.ok) {
                throw new Error('Failed to save score');
            }

            const result = await response.json();
            console.log('💾 分數已保存到數據庫:', result.data);
        } catch (error) {
            console.error('❌ 保存排行榜失敗:', error);

            // 🔄 降級方案：如果 API 失敗，保存到 localStorage
            try {
                let leaderboard = [];
                const storedLeaderboard = localStorage.getItem('shimozurdo_leaderboard');
                if (storedLeaderboard) {
                    leaderboard = JSON.parse(storedLeaderboard);
                }

                leaderboard.push(scoreEntry);
                leaderboard.sort((a, b) => b.score - a.score);
                leaderboard = leaderboard.slice(0, 10);

                localStorage.setItem('shimozurdo_leaderboard', JSON.stringify(leaderboard));
                console.log('💾 分數已保存到 localStorage（降級方案）:', scoreEntry);
            } catch (localError) {
                console.error('❌ localStorage 保存也失敗:', localError);
            }
        }
    }

    /**
     * 🏆 顯示排行榜畫面（使用後端 API）
     */
    async showLeaderboardScreen() {
        const cam = this.cameras.main;

        // 🔧 確保完全隱藏遊戲結束畫面
        if (this.gameOverOptionsContainer) {
            this.gameOverOptionsContainer.setVisible(false);
        }
        if (this.answersContainer) {
            this.answersContainer.setVisible(false);
        }
        if (this.nameInputElement) {
            this.nameInputElement.style.display = 'none';
        }

        // 創建排行榜顯示容器（depth 設置為 2100，確保在最上層）
        const leaderboardContainer = this.add.container(cam.centerX, cam.centerY)
            .setDepth(2100)
            .setScrollFactor(0);

        // 標題
        const title = this.add.text(0, -250, '🏆 排行榜', {
            fontSize: '36px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        leaderboardContainer.add(title);

        // 顯示加載中提示
        const loadingText = this.add.text(0, 0, '載入中...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        leaderboardContainer.add(loadingText);

        // 從後端 API 讀取排行榜
        let leaderboard = [];
        try {
            // 獲取 activityId（從 URL 參數）
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');

            if (!activityId) {
                throw new Error('無法獲取 activityId');
            }

            const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=10`);

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            const result = await response.json();
            leaderboard = result.data || [];

            console.log('🏆 從數據庫獲取排行榜:', leaderboard);
        } catch (error) {
            console.error('❌ 讀取排行榜失敗:', error);

            // 🔄 降級方案：如果 API 失敗，從 localStorage 讀取
            try {
                const storedLeaderboard = localStorage.getItem('shimozurdo_leaderboard');
                if (storedLeaderboard) {
                    leaderboard = JSON.parse(storedLeaderboard);
                    console.log('🏆 從 localStorage 獲取排行榜（降級方案）:', leaderboard);
                }
            } catch (localError) {
                console.error('❌ localStorage 讀取也失敗:', localError);
            }
        }

        // 移除加載中提示
        loadingText.destroy();

        // 如果沒有記錄，顯示提示
        if (leaderboard.length === 0) {
            const noDataText = this.add.text(0, 0, '目前還沒有排行榜記錄\n快來挑戰吧！', {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            leaderboardContainer.add(noDataText);
        } else {
            // 顯示排行榜列表
            const listContainer = this.add.container(0, -180);
            leaderboardContainer.add(listContainer);

            // 表頭
            const headerText = this.add.text(0, 0, '排名  名稱          分數    正確率  時間', {
                fontSize: '18px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            listContainer.add(headerText);

            // 顯示前 10 名
            leaderboard.slice(0, 10).forEach((entry, index) => {
                const yPos = 35 + index * 35;

                // 排名圖標
                let rankIcon = `${index + 1}.`;
                if (index === 0) rankIcon = '🥇';
                else if (index === 1) rankIcon = '🥈';
                else if (index === 2) rankIcon = '🥉';

                // 格式化名稱（最多 8 個字符）
                // 兼容後端 API (playerName) 和 localStorage (name)
                const name = entry.playerName || entry.name || '匿名玩家';
                const displayName = name.length > 8
                    ? name.substring(0, 8) + '...'
                    : name;

                // 格式化時間
                const minutes = Math.floor(entry.timeSpent / 60);
                const seconds = entry.timeSpent % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                // 組合文字
                const entryText = `${rankIcon}  ${displayName.padEnd(10)}  ${entry.score.toString().padStart(5)}  ${entry.accuracy.toFixed(1)}%  ${timeStr}`;

                // 根據排名決定顏色
                let textColor = '#ffffff';
                if (index === 0) textColor = '#FFD700'; // 金色
                else if (index === 1) textColor = '#C0C0C0'; // 銀色
                else if (index === 2) textColor = '#CD7F32'; // 銅色

                const entryLine = this.add.text(0, yPos, entryText, {
                    fontSize: '16px',
                    fill: textColor,
                    fontFamily: 'Courier New',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0.5);

                listContainer.add(entryLine);
            });
        }

        // 返回按鈕
        const backButton = this.add.text(0, 250, '🔙 返回', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#757575',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        backButton.setScrollFactor(0);
        backButton.setDepth(2101);  // 確保在排行榜容器之上
        backButton.setInteractive({ cursor: 'pointer' });

        // hover 效果
        backButton.on('pointerover', () => {
            backButton.setStyle({ backgroundColor: '#616161' });
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ backgroundColor: '#757575' });
        });

        // 點擊事件：返回選項畫面
        backButton.on('pointerdown', () => {
            console.log('🔙 點擊返回按鈕（排行榜畫面）');

            // 隱藏排行榜畫面
            leaderboardContainer.setVisible(false);

            // 顯示選項畫面
            this.gameOverOptionsContainer.setVisible(true);
            if (this.nameInputElement) {
                this.nameInputElement.style.display = 'block';
            }

            console.log('✅ 已返回選項畫面');
        });

        leaderboardContainer.add(backButton);

        // 保存排行榜容器引用
        this.leaderboardContainer = leaderboardContainer;

        console.log('🏆 排行榜畫面已顯示');
    }

    /**
     * 🎨 應用視覺風格
     * @param {string} styleId - 視覺風格 ID
     */
    /**
     * 🎨 應用視覺風格（完整版）
     * 參考 Wordwall 的完整場景替換系統
     * @param {string} styleId - 視覺風格 ID
     */
    applyVisualStyle(styleId) {
        // 定義視覺風格配置（簡化版，用於向後兼容）
        const VISUAL_STYLES = {
            primary: {
                id: 'primary',
                name: '幼兒風格',
                backgroundColor: 0xFFF9E6,
                primaryColor: '#FF6B6B',
                secondaryColor: '#4ECDC4',
                fontFamily: 'Comic Sans MS, cursive',
                textColor: '#000000',
                buttonColors: {
                    primary: '#FF6B6B',
                    secondary: '#4ECDC4',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    danger: '#F44336'
                },
                // 🆕 UI 配置
                ui: {
                    healthBar: {
                        color: 0xFF6B6B,
                        backgroundColor: 0xFFCCCC
                    },
                    targetWord: {
                        backgroundColor: '#FFFF00',
                        textColor: '#000000',
                        fontSize: '40px',
                        fontFamily: 'Comic Sans MS, cursive'
                    }
                }
            },
            modern: {
                id: 'modern',
                name: '現代風格',
                backgroundColor: 0xFFFFFF,
                primaryColor: '#2196F3',
                secondaryColor: '#FF9800',
                fontFamily: 'Roboto, sans-serif',
                textColor: '#000000',
                buttonColors: {
                    primary: '#2196F3',
                    secondary: '#FF9800',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    danger: '#F44336'
                },
                ui: {
                    healthBar: {
                        color: 0x2196F3,
                        backgroundColor: 0xBBDEFB
                    },
                    targetWord: {
                        backgroundColor: '#2196F3',
                        textColor: '#FFFFFF',
                        fontSize: '36px',
                        fontFamily: 'Roboto, sans-serif'
                    }
                }
            },
            classic: {
                id: 'classic',
                name: '經典風格',
                backgroundColor: 0xF5F5DC,
                primaryColor: '#8B4513',
                secondaryColor: '#DAA520',
                fontFamily: 'Georgia, serif',
                textColor: '#000000',
                buttonColors: {
                    primary: '#8B4513',
                    secondary: '#DAA520',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    danger: '#F44336'
                },
                ui: {
                    healthBar: {
                        color: 0x8B4513,
                        backgroundColor: 0xDEB887
                    },
                    targetWord: {
                        backgroundColor: '#DAA520',
                        textColor: '#000000',
                        fontSize: '36px',
                        fontFamily: 'Georgia, serif'
                    }
                }
            },
            dark: {
                id: 'dark',
                name: '深色風格',
                backgroundColor: 0x1E1E1E,
                primaryColor: '#BB86FC',
                secondaryColor: '#03DAC6',
                fontFamily: 'Roboto, sans-serif',
                textColor: '#FFFFFF',
                buttonColors: {
                    primary: '#BB86FC',
                    secondary: '#03DAC6',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    danger: '#F44336'
                },
                ui: {
                    healthBar: {
                        color: 0xBB86FC,
                        backgroundColor: 0x4A4A4A
                    },
                    targetWord: {
                        backgroundColor: '#BB86FC',
                        textColor: '#FFFFFF',
                        fontSize: '36px',
                        fontFamily: 'Roboto, sans-serif'
                    }
                }
            },
            nature: {
                id: 'nature',
                name: '自然風格',
                backgroundColor: 0xF0F8F0,
                primaryColor: '#4CAF50',
                secondaryColor: '#8BC34A',
                fontFamily: 'Roboto, sans-serif',
                textColor: '#000000',
                buttonColors: {
                    primary: '#4CAF50',
                    secondary: '#8BC34A',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    danger: '#F44336'
                },
                ui: {
                    healthBar: {
                        color: 0x4CAF50,
                        backgroundColor: 0xC8E6C9
                    },
                    targetWord: {
                        backgroundColor: '#4CAF50',
                        textColor: '#FFFFFF',
                        fontSize: '36px',
                        fontFamily: 'Roboto, sans-serif'
                    }
                }
            }
        };

        // 🔍 獲取視覺風格配置（使用導入的完整配置）
        let style = null;

        try {
            console.log('🎨 嘗試載入視覺風格:', styleId);

            // 優先使用導入的視覺風格配置
            if (VISUAL_STYLE_ASSETS && VISUAL_STYLE_ASSETS[styleId]) {
                style = VISUAL_STYLE_ASSETS[styleId];
                console.log('✅ 使用完整視覺風格配置:', styleId);
            }
            // 降級到 clouds 風格
            else if (VISUAL_STYLE_ASSETS && VISUAL_STYLE_ASSETS.clouds) {
                style = VISUAL_STYLE_ASSETS.clouds;
                console.log('⚠️ 視覺風格不存在，降級到 clouds 風格');
            }
            // 降級到內部定義的風格
            else if (VISUAL_STYLES[styleId]) {
                style = VISUAL_STYLES[styleId];
                console.log('⚠️ 使用內部定義的視覺風格:', styleId);
            }
            // 最後降級到 primary 風格
            else {
                style = VISUAL_STYLES.primary;
                console.log('⚠️ 降級到 primary 風格');
            }

            // 保存當前視覺風格
            this.currentVisualStyle = style;

            // 1. 應用背景顏色（支持多種配置格式）
            const bgColor = style.background?.color || style.backgroundColor || 0x87CEEB;
            this.cameras.main.setBackgroundColor(bgColor);
            console.log('🎨 背景顏色已應用:', bgColor.toString(16));

        } catch (error) {
            console.error('❌ 應用視覺風格時發生錯誤:', error);
            // 降級到安全的默認背景顏色
            this.cameras.main.setBackgroundColor(0x87CEEB);
            console.log('🔧 已降級到安全的默認背景顏色');
            return;  // 提前返回，避免後續錯誤
        }

        // 2. 應用 UI 元素顏色（如果元素已經創建）
        this.applyVisualStyleToUI(style);

        // 3. 🎬 應用動畫風格（如果有動畫配置）
        if (style.animations) {
            this.applyAnimationStyle(style.animations);
        }

        // 4. 🔊 應用音效主題（如果有音效配置）
        if (style.sounds) {
            this.applySoundTheme(styleId, style.sounds);
        }

        // 🔍 安全地獲取背景顏色用於日誌輸出
        const bgColorForLog = style.background?.color || style.backgroundColor || 0x87CEEB;

        console.log('🎨 完整視覺風格已應用:', {
            styleId: style.id,
            name: style.name,
            backgroundColor: bgColorForLog.toString(16),
            primaryColor: style.primaryColor,
            secondaryColor: style.secondaryColor,
            fontFamily: style.fontFamily,
            ui: style.ui,
            animations: style.animations,
            sounds: style.sounds
        });
    }

    /**
     * 🎨 應用視覺風格到 UI 元素
     * @param {object} style - 視覺風格配置
     */
    applyVisualStyleToUI(style) {
        // 應用到生命值條
        if (this.healthBar && style.ui && style.ui.healthBar) {
            // 更新生命值條顏色
            // 注意：這裡需要重新繪製生命值條
            this.updateHealthBarStyle(style.ui.healthBar);
        }

        // 應用到目標詞彙顯示
        if (this.targetWordContainer && style.ui && style.ui.targetWord) {
            this.updateTargetWordStyle(style.ui.targetWord);
        }

        // 應用到其他 UI 元素
        // TODO: 添加更多 UI 元素的樣式更新
    }

    /**
     * 🎨 更新生命值條樣式
     * @param {object} healthBarStyle - 生命值條樣式配置
     */
    updateHealthBarStyle(healthBarStyle) {
        // 如果生命值條存在，更新其顏色
        if (this.healthBar) {
            // 這裡需要重新繪製生命值條
            // 由於 Phaser 的限制，我們可能需要在下次更新時應用新顏色
            console.log('🎨 生命值條樣式已更新:', healthBarStyle);
        }
    }

    /**
     * 🎨 更新目標詞彙顯示樣式
     * @param {object} targetWordStyle - 目標詞彙樣式配置
     */
    updateTargetWordStyle(targetWordStyle) {
        // 如果目標詞彙容器存在，更新其樣式
        if (this.targetWordContainer) {
            // 更新背景顏色
            if (this.targetWordBackground) {
                // 將 hex 顏色轉換為 Phaser 顏色
                const color = Phaser.Display.Color.HexStringToColor(targetWordStyle.backgroundColor);
                this.targetWordBackground.setFillStyle(color.color);
            }

            // 更新文字顏色和字體
            if (this.targetWordText) {
                this.targetWordText.setColor(targetWordStyle.textColor);
                this.targetWordText.setFontSize(targetWordStyle.fontSize);
                this.targetWordText.setFontFamily(targetWordStyle.fontFamily);
            }

            console.log('🎨 目標詞彙樣式已更新:', targetWordStyle);
        }
    }

    /**
     * 🎬 應用動畫風格
     * @param {object} animConfig - 動畫配置
     */
    applyAnimationStyle(animConfig) {
        if (!animConfig) return;

        const { style, speed } = animConfig;

        switch (style) {
            case 'bouncy':  // 幼兒風格 - 彈跳動畫
                if (this.tweens) {
                    this.tweens.timeScale = speed || 1.2;
                }
                if (this.physics && this.physics.world) {
                    this.physics.world.gravity.y = 800;
                }
                console.log('🎬 應用彈跳動畫風格 (bouncy)');
                break;

            case 'smooth':  // 現代/深色/自然風格 - 平滑動畫
                if (this.tweens) {
                    this.tweens.timeScale = speed || 1.0;
                }
                if (this.physics && this.physics.world) {
                    this.physics.world.gravity.y = 600;
                }
                console.log('🎬 應用平滑動畫風格 (smooth)');
                break;

            case 'subtle':  // 經典風格 - 微妙動畫
                if (this.tweens) {
                    this.tweens.timeScale = speed || 0.9;
                }
                if (this.physics && this.physics.world) {
                    this.physics.world.gravity.y = 500;
                }
                console.log('🎬 應用微妙動畫風格 (subtle)');
                break;

            default:
                console.log('🎬 使用默認動畫風格');
        }

        console.log('🎬 動畫風格已應用:', animConfig);
    }

    /**
     * 🔊 應用音效主題
     * @param {string} styleId - 視覺風格 ID
     * @param {object} soundsConfig - 音效配置
     */
    applySoundTheme(styleId, soundsConfig) {
        if (!soundsConfig) return;

        // 停止當前背景音樂（如果有）
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }

        // 嘗試載入新的背景音樂
        const bgmKey = `bgm_${styleId}`;
        if (this.cache.audio.exists(bgmKey)) {
            try {
                this.backgroundMusic = this.sound.add(bgmKey, {
                    loop: true,
                    volume: 0.5
                });
                this.backgroundMusic.play();
                console.log('🎵 背景音樂已切換:', styleId);
            } catch (error) {
                console.warn('⚠️ 背景音樂播放失敗:', error);
            }
        } else {
            console.log('💡 背景音樂資源不存在:', bgmKey);
        }

        // 保存音效鍵值供後續使用
        this.hitSoundKey = `hit_${styleId}`;
        this.successSoundKey = `success_${styleId}`;

        console.log('🔊 音效主題已應用:', {
            styleId,
            bgmKey,
            hitSoundKey: this.hitSoundKey,
            successSoundKey: this.successSoundKey
        });
    }

    /**
     * 🔊 播放碰撞音效
     */
    playHitSound() {
        if (this.hitSoundKey && this.cache.audio.exists(this.hitSoundKey)) {
            try {
                this.sound.play(this.hitSoundKey);
                console.log('🔊 播放碰撞音效:', this.hitSoundKey);
            } catch (error) {
                console.warn('⚠️ 碰撞音效播放失敗:', error);
            }
        }
    }

    /**
     * 🔊 播放成功音效
     */
    playSuccessSound() {
        if (this.successSoundKey && this.cache.audio.exists(this.successSoundKey)) {
            try {
                this.sound.play(this.successSoundKey);
                console.log('🔊 播放成功音效:', this.successSoundKey);
            } catch (error) {
                console.warn('⚠️ 成功音效播放失敗:', error);
            }
        }
    }
}
