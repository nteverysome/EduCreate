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
    }

    create() {
        const { width, height } = this                   // 解構賦值獲取寬高

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

        // 🆕 設置隨機目標詞彙 - 初始化第一個學習目標
        this.setRandomTargetWord()

        // GAME OBJECTS - 遊戲物件區塊
        // 初始化響應式元素數組 - 用於螢幕尺寸變化時的元素調整
        this.testElements = [];

        // 註冊響應式元素 - 將所有需要響應式調整的元素註冊到系統
        this.registerResponsiveElements();
        // GAME OBJECTS
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

        // 背景層配置 - 定義6層背景的屬性和深度
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
    createSpaceship() {
        const { width, height } = this;                  // 獲取場景尺寸

        // 防禦性檢查：確認精靈圖是否存在 - 避免資源載入失敗導致崩潰
        if (this.textures.exists('player_spaceship')) {
            console.log('✅ 使用真實太空船精靈圖')

            try {
                // 創建7幀動畫 - 太空船飛行動畫序列
                this.anims.create({
                    key: 'spaceship_fly',                // 動畫名稱
                    frames: this.anims.generateFrameNumbers('player_spaceship', {
                        start: 0, end: 6                // 使用第0-6幀，共7幀
                    }),
                    frameRate: 10,                       // 每秒10幀的播放速度
                    repeat: -1                           // 無限循環播放
                });

                // 創建太空船精靈（先用簡單方式確保顯示）
                this.player = this.add.sprite(width * 0.15, height * 0.5, 'player_spaceship');  // 位置在左側15%，垂直中央
                this.player.setOrigin(0.5, 0.5);        // 設置中心點為精靈中央
                this.player.setScale(0.2);               // 用戶要求飛機小一半：40% × 0.5 = 20%
                this.player.setDepth(-60);               // 在視差背景前景，調整深度層級
                this.player.play('spaceship_fly');       // 播放飛行動畫

                // 初始化移動相關變數 - 用於控制太空船移動
                this.playerSpeed = 250;                  // 移動速度（像素/秒）
                this.playerTargetY = this.player.y;      // 目標Y座標（用於平滑移動）

                console.log('✅ 太空船精靈創建成功，位置:', this.player.x, this.player.y);

                console.log('✅ 太空船精靈圖動畫創建成功');

            } catch (error) {
                console.error('❌ 太空船動畫創建失敗:', error);
                this.createBackupSpaceship(width, height);  // 失敗時使用備用方案
            }

        } else {
            console.warn('⚠️ 太空船精靈圖不存在，使用備用方案');
            this.createBackupSpaceship(width, height);      // 資源不存在時使用備用方案
        }

        // 🔧 初始化調試模式和性能監控
        this.debugMode = true; // 設為 true 啟用詳細調試信息 - 座標偏移診斷
        this.performanceStats = {
            touchResponses: [],
            averageResponseTime: 0
        };

        // 🔧 初始化座標修復工具
        this.coordinateFix = new (window.CoordinateFix || class {
            getOptimalCoordinates(pointer) { return { x: pointer.x, y: pointer.y }; }
            testCoordinateAccuracy() { return { isAccurate: true }; }
        })(this);

        // 設置太空船控制 - 初始化鍵盤和滑鼠控制
        this.setupSpaceshipControls();
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
        const { width, height } = this;                  // 獲取場景尺寸

        // 生命值設定 - 初始化血量參數
        this.maxHealth = 100;                            // 最大生命值
        this.currentHealth = 100;                        // 當前生命值

        // 生命值條位置和尺寸（右下角） - 計算UI元素位置
        const healthBarWidth = 200;                      // 生命值條寬度
        const healthBarHeight = 20;                      // 生命值條高度
        const margin = 20;                               // 邊距
        const healthBarX = width - margin - healthBarWidth;  // X座標（右邊距）
        const healthBarY = height - margin - healthBarHeight;  // Y座標（底部邊距）

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

        // 創建生命值文字 - 顯示數值（右下角，文字在血條左側）
        this.healthText = this.add.text(
            healthBarX - 15,                             // X座標（生命值條左側15像素）
            healthBarY + healthBarHeight / 2,            // Y座標（生命值條垂直中央）
            `${this.currentHealth}/${this.maxHealth}`,   // 顯示當前/最大生命值
            {
                fontSize: '16px',                        // 字體大小
                color: '#ffffff',                        // 白色文字
                fontStyle: 'bold'                        // 粗體
            }
        );
        this.healthText.setOrigin(1, 0.5);               // 設置原點為右側中央
        this.healthText.setDepth(103);                   // 在所有元素之上

        console.log('❤️ 生命值系統初始化完成');
    }

    /**
     * 🆕 初始化目標詞彙顯示系統 - 從 Airplane Game 移植
     * 注意：UI 元素將在第一次 update() 中創建，因為 worldView 在 create() 時還沒有初始化
     */
    createTargetWordDisplay() {
        // 初始化學習統計
        this.wordsLearned = 0;                               // 已學習的單字數
        this.score = 0;                                      // 分數
        this.currentTargetWord = null;                       // 當前目標詞彙

        // 🆕 標誌位：UI 是否已創建
        this.uiCreated = false;

        // 初始化 UI 元素為 null
        this.scoreText = null;
        this.chineseText = null;
        this.targetText = null;

        console.log('🎯 目標詞彙顯示系統初始化完成（UI 將在 worldView 初始化後創建）');
    }

    /**
     * 🆕 實際創建 UI 元素 - 在 worldView 初始化後調用
     */
    createUIElements() {
        const cam = this.cameras.main;
        const worldView = cam.worldView;

        console.log('📐 創建 UI 元素 - worldView:', {
            x: worldView.x,
            y: worldView.y,
            width: worldView.width,
            height: worldView.height
        });

        // 🆕 三列布局 - 基於 worldView 計算每列的 X 座標
        // worldView 是相機實際可見的世界座標區域
        const leftX = worldView.x + worldView.width * 0.25;  // 左列（25%）
        const centerX = worldView.x + worldView.width * 0.5; // 中列（50%）
        const rightX = worldView.x + worldView.width * 0.75; // 右列（75%）
        const topY = worldView.y + 50;                       // 統一的 Y 座標（相對於 worldView）

        // 🆕 創建分數顯示（左列）
        this.scoreText = this.add.text(
            leftX,                                           // X座標（左列）
            topY,                                            // Y座標（頂部50像素）
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
        this.scoreText.setScrollFactor(0);                   // 固定在螢幕上
        this.scoreText.setDepth(200);                        // 確保在最前面

        // 🆕 創建黃色框大字（中列，可點擊發音）
        this.chineseText = this.add.text(
            centerX,                                         // X座標（中列）
            topY,                                            // Y座標（頂部50像素）
            '',                                              // 初始文字為空
            {
                fontSize: '48px',                            // 大字體
                color: '#000000',                            // 黑色文字
                backgroundColor: '#ffff00',                  // 黃色背景
                padding: { x: 20, y: 10 }                    // 內邊距
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        this.chineseText.setScrollFactor(0);                 // 固定在螢幕上
        this.chineseText.setDepth(200);                      // 確保在最前面
        this.chineseText.setInteractive();                   // 設置為可互動

        // 點擊黃色框播放雙語發音
        this.chineseText.on('pointerdown', () => {
            if (this.currentTargetWord && this.game.bilingualManager) {
                console.log('🔊 播放雙語發音:', this.currentTargetWord.chinese, this.currentTargetWord.english);
                this.game.bilingualManager.speakBilingual(
                    this.currentTargetWord.english,
                    this.currentTargetWord.chinese
                );
            }
        });

        // 🆕 創建英文文字（右列）
        this.targetText = this.add.text(
            rightX,                                          // X座標（右列）
            topY,                                            // Y座標（頂部50像素）
            '',                                              // 初始文字為空
            {
                fontSize: '32px',                            // 字體大小
                color: '#ffff00',                            // 黃色
                fontStyle: 'bold',                           // 粗體
                stroke: '#000000',                           // 黑色描邊
                strokeThickness: 4                           // 描邊粗細
            }
        ).setOrigin(0.5);                                    // 設置原點為中央
        this.targetText.setScrollFactor(0);                  // 固定在螢幕上
        this.targetText.setDepth(200);                       // 確保在最前面

        // 設置當前目標詞彙的顯示
        if (this.currentTargetWord) {
            this.chineseText.setText(this.currentTargetWord.chinese);
            this.targetText.setText(this.currentTargetWord.english);
        }

        // 更新分數顯示
        this.updateScoreDisplay();

        console.log('✅ UI 元素創建完成');
        this.uiCreated = true;
    }

    /**
     * 🆕 設置隨機目標詞彙 - 從 GEPT 管理器獲取新的學習目標
     */
    setRandomTargetWord() {
        if (!this.game.geptManager) {
            console.warn('⚠️ GEPT 管理器未初始化');
            return;
        }

        // 獲取隨機詞彙
        this.currentTargetWord = this.game.geptManager.getRandomWord();

        if (this.currentTargetWord) {
            console.log('🎯 新目標詞彙:', this.currentTargetWord.chinese, this.currentTargetWord.english);

            // 🆕 更新中文大字（中列）
            this.chineseText.setText(this.currentTargetWord.chinese);

            // 🆕 更新英文文字（右列）
            this.targetText.setText(this.currentTargetWord.english);
        } else {
            console.warn('⚠️ 無法獲取隨機詞彙');
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

        // 更新生命值條寬度 - 根據血量百分比調整寬度
        const maxWidth = 200;                            // 最大寬度
        this.healthBar.displayWidth = maxWidth * healthPercent;  // 按比例調整寬度

        // 根據生命值改變顏色 - 提供視覺警告
        let color = 0x00ff00;                            // 預設綠色（健康）
        if (healthPercent <= 0.3) {                      // 血量低於30%
            color = 0xff0000;                            // 紅色（危險）
        } else if (healthPercent <= 0.6) {               // 血量低於60%
            color = 0xffff00;                            // 黃色（警告）
        }
        this.healthBar.setFillStyle(color);              // 應用顏色變化

        // 更新文字 - 顯示具體數值
        this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
    }

    /**
     * ❤️ 受到傷害 - 處理玩家受傷邏輯
     */
    takeDamage(damage) {
        this.currentHealth = Math.max(0, this.currentHealth - damage);  // 扣除傷害，最低為0
        this.updateHealthDisplay();                      // 更新UI顯示

        if (this.currentHealth <= 0) {                   // 檢查是否死亡
            console.log('💀 太空船被摧毀！');
            // 這裡可以添加遊戲結束邏輯
        }

        console.log(`💥 受到 ${damage} 點傷害，剩餘生命值: ${this.currentHealth}`);
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

        // 創建敵人（從 FIT 後遊戲區域外開始） - 確保在真正的遊戲區域外生成
        const enemy = this.add.sprite(spawnX, spawnY, 'cloud_enemy');
        enemy.setOrigin(0.5, 0.5);                       // 設置中心點
        enemy.setScale(0.533);                           // 用戶要求雲大三分之一：0.4 × 4/3 ≈ 0.533
        enemy.setDepth(-65);                             // 在太空船後面，視差背景前面
        enemy.setAlpha(0.8);                             // 稍微透明，更像雲朵

        // 🆕 設置敵人數據 - 存儲詞彙信息
        enemy.setData('word', word);                     // 存儲詞彙對象
        enemy.setData('isTarget', isTarget);             // 存儲是否為目標詞彙

        // 設置敵人屬性 - 移動速度
        enemy.speed = Phaser.Math.Between(1, 3);         // 隨機速度（1-3像素/幀）

        // 🆕 添加詞彙文字 - 顯示英文單字
        const wordText = this.add.text(
            enemy.x,                                     // X座標（與敵人對齊）
            enemy.y - 40,                                // Y座標（敵人上方40像素）
            word.english,                                // 顯示英文單字
            {
                fontSize: '20px',                        // 字體大小
                color: isTarget ? '#ff0000' : '#000000', // 目標詞彙紅色，其他黑色
                fontStyle: isTarget ? 'bold' : 'normal', // 目標詞彙粗體
                backgroundColor: isTarget ? '#ffff00' : 'rgba(255, 255, 255, 0.8)', // 目標詞彙黃色背景
                padding: { x: 6, y: 3 }                  // 內邊距
            }
        ).setOrigin(0.5);                                // 設置原點為中央
        wordText.setDepth(-64);                          // 在敵人前面

        // 🆕 將文字綁定到敵人 - 用於同步移動和銷毀
        enemy.setData('wordText', wordText);

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

        // 更新現有敵人 - 倒序遍歷以安全刪除元素
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];              // 獲取當前敵人

            if (enemy && enemy.active) {                 // 檢查敵人是否有效且活躍
                // 向左移動 - 敵人從右向左移動
                enemy.x -= enemy.speed;

                // 🆕 同步移動詞彙文字 - 讓文字跟隨敵人移動
                const wordText = enemy.getData('wordText');
                if (wordText && wordText.active) {
                    wordText.x = enemy.x;                // 同步X座標
                    wordText.y = enemy.y - 40;           // 保持在敵人上方40像素
                }

                // 檢查與太空船的碰撞 - 碰撞檢測
                if (this.player && this.checkCollision(this.player, enemy)) {
                    // 🆕 處理碰撞 - 判斷是否碰撞正確目標
                    this.handleEnemyCollision(enemy);

                    // 🆕 銷毀詞彙文字
                    if (wordText && wordText.active) {
                        wordText.destroy();
                    }

                    // 銷毀敵人 - 清理碰撞的敵人
                    enemy.destroy();                     // 銷毀精靈物件
                    this.enemies.splice(i, 1);          // 從陣列中移除
                    continue;                            // 跳過後續檢查
                }

                // 🎯 使用攝影機 worldView 判斷是否飛出 FIT 後的遊戲區域
                const cam = this.cameras.main;
                const worldView = cam.worldView;

                // 完全飛出 FIT 後遊戲區域左邊界時銷毀
                if (enemy.x < worldView.left - 100) {    // 檢查是否移出 FIT 後遊戲區域左側
                    // 🆕 銷毀詞彙文字
                    if (wordText && wordText.active) {
                        wordText.destroy();
                    }

                    enemy.destroy();                     // 銷毀精靈物件
                    this.enemies.splice(i, 1);          // 從陣列中移除
                    console.log('☁️ 雲朵敵人飛出 FIT 遊戲區域，已銷毀');
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
    handleEnemyCollision(enemy) {
        const word = enemy.getData('word');
        const isTarget = enemy.getData('isTarget');

        if (isTarget) {
            // ✅ 碰撞正確目標
            console.log('✅ 碰撞正確目標:', word.chinese, word.english);

            // 增加分數和單字數
            this.score += 10;
            this.wordsLearned += 1;

            // 播放雙語發音
            if (this.game.bilingualManager) {
                this.game.bilingualManager.speakBilingual(
                    word.english,
                    word.chinese
                );
            }

            // 顯示成功提示
            this.showSuccessMessage(word);

            // 設置新的目標詞彙
            this.setRandomTargetWord();

            // 更新分數顯示
            this.updateScoreDisplay();
        } else {
            // ❌ 碰撞錯誤目標
            console.log('❌ 碰撞錯誤目標:', word.chinese, word.english);

            // 減少分數和生命值
            this.score = Math.max(0, this.score - 5);
            this.takeDamage(10);

            // 顯示錯誤提示
            this.showErrorMessage();

            // 更新分數顯示
            this.updateScoreDisplay();
        }
    }

    /**
     * 🆕 顯示成功提示 - 碰撞正確目標時的視覺反饋
     */
    showSuccessMessage(word) {
        const { width, height } = this;

        // 創建成功提示文字
        const successText = this.add.text(
            width / 2,
            height / 2,
            `✅ 正確！\n${word.chinese} (${word.english})`,
            {
                fontSize: '32px',
                color: '#00ff00',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        successText.setScrollFactor(0);
        successText.setDepth(300);

        // 淡出動畫
        this.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                successText.destroy();
            }
        });
    }

    /**
     * 🆕 顯示錯誤提示 - 碰撞錯誤目標時的視覺反饋
     */
    showErrorMessage() {
        const { width, height } = this;

        // 創建錯誤提示文字
        const errorText = this.add.text(
            width / 2,
            height / 2,
            '❌ 錯誤！',
            {
                fontSize: '32px',
                color: '#ff0000',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        errorText.setScrollFactor(0);
        errorText.setDepth(300);

        // 淡出動畫
        this.tweens.add({
            targets: errorText,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                errorText.destroy();
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
     * 🆕 更新 UI 元素位置 - 確保 UI 始終跟隨相機
     */
    updateUIPositions() {
        if (!this.scoreText || !this.chineseText || !this.targetText) return;

        const cam = this.cameras.main;
        const worldView = cam.worldView;

        // 計算三列位置（基於 worldView）
        const leftX = worldView.x + worldView.width * 0.25;
        const centerX = worldView.x + worldView.width * 0.5;
        const rightX = worldView.x + worldView.width * 0.75;
        const topY = worldView.y + 50;

        // 更新位置
        this.scoreText.setPosition(leftX, topY);
        this.chineseText.setPosition(centerX, topY);
        this.targetText.setPosition(rightX, topY);
    }

    update() {
        if (!this.sceneStopped) {
            // 🆕 檢查是否需要創建 UI（在 worldView 初始化後）
            if (!this.uiCreated) {
                const cam = this.cameras.main;
                const worldView = cam.worldView;

                // 檢查 worldView 是否已初始化（width > 0）
                if (worldView.width > 0) {
                    console.log('✅ worldView 已初始化，創建 UI 元素');
                    this.createUIElements();
                }
            }

            this.updateParallaxBackground();
            this.updateSpaceship();
            this.updateEnemies();
            this.updateUIPositions();  // 🆕 更新 UI 位置
        }
    }
}
