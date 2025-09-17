export default class Title extends Phaser.Scene {

    // Vars
    handlerScene = false
    sceneStopped = false
    backgroundLayers = null
    scrollPositions = null

    constructor() {
        super({ key: 'title' })
    }

    preload() {
        this.sceneStopped = false
        this.width = this.game.screenBaseSize.width
        this.height = this.game.screenBaseSize.height
        this.handlerScene = this.scene.get('handler')
        this.handlerScene.sceneRunning = 'title'
    }

    create() {
        const { width, height } = this
        // CONFIG SCENE
        this.handlerScene.updateResize(this)
        if (this.game.debugMode)
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)
        // CONFIG SCENE

        // 創建視差背景
        this.createParallaxBackground()

        // 🚀 創建太空船（防禦性編程）
        this.createSpaceship()

        // GAME OBJECTS
        // 初始化響應式元素數組
        this.testElements = [];

        // 註冊響應式元素
        this.registerResponsiveElements();
        // GAME OBJECTS
    }

    /**
     * 創建視差背景
     */
    createParallaxBackground() {

        const { width, height } = this;

        // 創建基礎背景色（深太空）
        const bgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        bgRect.setDepth(-110);

        // 創建背景層
        this.backgroundLayers = {};

        // 背景層配置
        const layerConfigs = [
            { key: 'bg_layer_1', name: 'sky', depth: -100, alpha: 1.0 },
            { key: 'bg_layer_2', name: 'moon', depth: -95, alpha: 1.0 },
            { key: 'bg_layer_3', name: 'back', depth: -90, alpha: 0.9 },
            { key: 'bg_layer_4', name: 'mid', depth: -85, alpha: 0.9 },
            { key: 'bg_layer_5', name: 'front', depth: -80, alpha: 0.9 },
            { key: 'bg_layer_6', name: 'floor', depth: -75, alpha: 0.8 }
        ];

        // 創建每一層背景
        layerConfigs.forEach(config => {
            if (this.textures.exists(config.key)) {
                // 使用 TileSprite 創建可滾動背景
                const layer = this.add.tileSprite(0, 0, width, height, config.key);
                layer.setOrigin(0, 0);
                layer.setDepth(config.depth);
                layer.setAlpha(config.alpha);
                layer.setVisible(true);



                // 儲存到背景層物件
                this.backgroundLayers[config.name] = layer;

                console.log(`✅ 創建背景層: ${config.key} (${config.name})`);
            } else {
                console.warn(`⚠️ 背景資源不存在: ${config.key}`);
            }
        });

        // 初始化滾動位置
        this.scrollPositions = {
            sky: 0,
            moon: 0,
            back: 0,
            mid: 0,
            front: 0,
            floor: 0
        };


    }

    /**
     * 🚀 創建太空船（防禦性編程）
     */
    createSpaceship() {
        const { width, height } = this;

        // 防禦性檢查：確認精靈圖是否存在
        if (this.textures.exists('player_spaceship')) {
            console.log('✅ 使用真實太空船精靈圖')

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

                // 創建太空船精靈（先用簡單方式）
                this.player = this.add.sprite(width * 0.15, height * 0.5, 'player_spaceship');
                this.player.setOrigin(0.5, 0.5);
                this.player.setScale(0.4);
                this.player.setDepth(-60); // 在視差背景前景，調整深度
                this.player.play('spaceship_fly');

                console.log('✅ 太空船精靈創建成功，位置:', this.player.x, this.player.y);

                console.log('✅ 太空船精靈圖動畫創建成功');

            } catch (error) {
                console.error('❌ 太空船動畫創建失敗:', error);
                this.createBackupSpaceship(width, height);
            }

        } else {
            console.warn('⚠️ 太空船精靈圖不存在，使用備用方案');
            this.createBackupSpaceship(width, height);
        }

        // 暫時註解控制設置，先確保太空船顯示
        // this.setupSpaceshipControls();
    }

    /**
     * 🔧 創建備用太空船（優雅降級）
     */
    createBackupSpaceship(width, height) {
        console.log('🔧 創建備用太空船');

        try {
            // 創建簡單的三角形太空船
            const graphics = this.add.graphics();

            // 太空船主體（藍色三角形）
            graphics.fillStyle(0x4facfe);
            graphics.fillTriangle(30, 0, 0, 20, 0, -20);

            // 太空船邊框
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.strokeTriangle(30, 0, 0, 20, 0, -20);

            // 引擎火焰
            graphics.fillStyle(0xff4444);
            graphics.fillTriangle(-5, 0, -15, 8, -15, -8);

            // 生成紋理
            graphics.generateTexture('backup_spaceship', 45, 40);
            graphics.destroy();

            // 創建備用太空船（簡單方式）
            this.player = this.add.sprite(width * 0.15, height * 0.5, 'backup_spaceship');
            this.player.setOrigin(0.5, 0.5);
            this.player.setScale(1.2);
            this.player.setDepth(-60);

            // 簡單的浮動動畫
            this.tweens.add({
                targets: this.player,
                y: height * 0.5 + 20,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            console.log('✅ 備用太空船創建成功，位置:', this.player.x, this.player.y);

            console.log('✅ 備用太空船創建成功');

        } catch (error) {
            console.error('❌ 備用太空船創建也失敗:', error);
        }
    }

    /**
     * 🎮 設置太空船控制
     */
    setupSpaceshipControls() {
        if (!this.player) return;

        // const { width, height } = this; // 暫時不需要

        // 1. 鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        // 2. 點擊/觸控控制
        this.input.on('pointerdown', (pointer) => {
            if (!this.player || !this.player.active) return;

            const clickY = pointer.y;
            const playerY = this.player.y;
            const moveSpeed = 300;

            if (clickY < playerY - 50) {
                // 點擊上方，向上移動
                this.player.setVelocityY(-moveSpeed);
                console.log('🔼 太空船向上移動');
            } else if (clickY > playerY + 50) {
                // 點擊下方，向下移動
                this.player.setVelocityY(moveSpeed);
                console.log('🔽 太空船向下移動');
            }
        });

        // 3. 觸控移動控制（更精確）
        this.input.on('pointermove', (pointer) => {
            if (!this.player || !this.player.active || !pointer.isDown) return;

            const targetY = pointer.y;
            const currentY = this.player.y;
            const difference = targetY - currentY;

            if (Math.abs(difference) > 10) {
                const moveSpeed = Math.min(Math.abs(difference) * 2, 400);
                this.player.setVelocityY(difference > 0 ? moveSpeed : -moveSpeed);
            }
        });

        console.log('🎮 太空船控制設置完成：方向鍵、WASD、點擊、觸控');
    }

    /**
     * 更新視差背景
     */
    updateParallaxBackground() {
        if (!this.backgroundLayers) return;

        // 不同層以不同速度移動創造視差效果
        const speeds = {
            sky: 0.05,
            moon: 0.2,
            back: 0.3,
            mid: 0.5,
            front: 0.7,
            floor: 1.0
        };

        // 更新每層的滾動位置
        Object.keys(this.backgroundLayers).forEach(layerName => {
            const layer = this.backgroundLayers[layerName];
            const speed = speeds[layerName] || 0.5;

            if (layer && layer.visible) {
                // 更新滾動位置
                this.scrollPositions[layerName] += speed;
                layer.tilePositionX = this.scrollPositions[layerName];
            }
        });
    }

    registerResponsiveElements() {
        // 將所有元素註冊到響應式系統
        this.responsiveElements = [
            ...this.testElements
        ];

        // 註冊視差背景層到響應式系統
        if (this.backgroundLayers) {
            Object.values(this.backgroundLayers).forEach(layer => {
                if (layer) {
                    this.responsiveElements.push({
                        onResize: () => {
                            // 響應式調整背景層尺寸
                            const { width, height } = this;
                            layer.setSize(width, height);
                        }
                    });
                }
            });
        }
    }

    /**
     * 🚀 更新太空船（簡化版本）
     */
    updateSpaceship() {
        if (this.player && this.player.active) {
            // 暫時只檢查太空船是否存在和可見
            // console.log('太空船狀態:', this.player.x, this.player.y, this.player.visible);
        }
    }

    /**
     * 場景更新函數
     */
    update() {
        if (!this.sceneStopped) {
            this.updateParallaxBackground();
            this.updateSpaceship();
        }
    }
}
