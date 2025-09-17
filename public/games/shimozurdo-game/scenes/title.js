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

        // ☁️ 創建敵人系統
        this.createEnemySystem()

        // ❤️ 創建生命值系統
        this.createHealthSystem()

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

                // 創建太空船精靈（先用簡單方式確保顯示）
                this.player = this.add.sprite(width * 0.15, height * 0.5, 'player_spaceship');
                this.player.setOrigin(0.5, 0.5);
                this.player.setScale(0.4);
                this.player.setDepth(-60); // 在視差背景前景，調整深度
                this.player.play('spaceship_fly');

                // 初始化移動相關變數
                this.playerSpeed = 250;
                this.playerTargetY = this.player.y;

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

        // 設置太空船控制
        this.setupSpaceshipControls();
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

            // 創建備用太空船（簡單方式確保顯示）
            this.player = this.add.sprite(width * 0.15, height * 0.5, 'backup_spaceship');
            this.player.setOrigin(0.5, 0.5);
            this.player.setScale(1.2);
            this.player.setDepth(-60);

            // 初始化移動相關變數
            this.playerSpeed = 250;
            this.playerTargetY = this.player.y;

            console.log('✅ 備用太空船創建成功，位置:', this.player.x, this.player.y);

            console.log('✅ 備用太空船創建成功');

        } catch (error) {
            console.error('❌ 備用太空船創建也失敗:', error);
        }
    }

    /**
     * 🎮 設置太空船控制（非物理方式）
     */
    setupSpaceshipControls() {
        if (!this.player) {
            console.warn('⚠️ 太空船不存在，無法設置控制');
            return;
        }

        // 1. 鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        // 2. 點擊/觸控控制 - 設置目標位置
        this.input.on('pointerdown', (pointer) => {
            if (!this.player) return;

            const clickY = pointer.y;
            const playerY = this.player.y;

            if (clickY < playerY - 30) {
                // 點擊上方，設置向上移動目標
                this.playerTargetY = Math.max(80, playerY - 100);
                console.log('🔼 太空船向上移動');
            } else if (clickY > playerY + 30) {
                // 點擊下方，設置向下移動目標
                const { height } = this;
                this.playerTargetY = Math.min(height - 80, playerY + 100);
                console.log('🔽 太空船向下移動');
            }
        });

        console.log('🎮 太空船控制設置完成：方向鍵、WASD、點擊');
    }

    /**
     * ☁️ 創建敵人系統
     */
    createEnemySystem() {
        // 初始化敵人群組
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 3000; // 3秒生成一個敵人

        console.log('☁️ 敵人系統初始化完成');
    }

    /**
     * ❤️ 創建生命值系統
     */
    createHealthSystem() {
        const { width, height } = this;

        // 生命值設定
        this.maxHealth = 100;
        this.currentHealth = 100;

        // 生命值條位置和尺寸（左下角）
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const margin = 20;
        const healthBarX = margin;
        const healthBarY = height - margin - healthBarHeight;

        // 創建生命值條背景（黑色邊框）
        this.healthBarBg = this.add.rectangle(
            healthBarX,
            healthBarY,
            healthBarWidth + 4,
            healthBarHeight + 4,
            0x000000
        );
        this.healthBarBg.setOrigin(0, 0);
        this.healthBarBg.setDepth(100); // 確保在最前面

        // 創建生命值條背景（深灰色）
        this.healthBarBackground = this.add.rectangle(
            healthBarX + 2,
            healthBarY + 2,
            healthBarWidth,
            healthBarHeight,
            0x333333
        );
        this.healthBarBackground.setOrigin(0, 0);
        this.healthBarBackground.setDepth(101);

        // 創建生命值條（綠色）
        this.healthBar = this.add.rectangle(
            healthBarX + 2,
            healthBarY + 2,
            healthBarWidth,
            healthBarHeight,
            0x00ff00
        );
        this.healthBar.setOrigin(0, 0);
        this.healthBar.setDepth(102);

        // 創建生命值文字
        this.healthText = this.add.text(
            healthBarX + healthBarWidth + 15,
            healthBarY + healthBarHeight / 2,
            `${this.currentHealth}/${this.maxHealth}`,
            {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        );
        this.healthText.setOrigin(0, 0.5);
        this.healthText.setDepth(103);

        console.log('❤️ 生命值系統初始化完成');
    }

    /**
     * ❤️ 更新生命值顯示
     */
    updateHealthDisplay() {
        if (!this.healthBar || !this.healthText) return;

        // 計算生命值百分比
        const healthPercent = this.currentHealth / this.maxHealth;

        // 更新生命值條寬度
        const maxWidth = 200;
        this.healthBar.displayWidth = maxWidth * healthPercent;

        // 根據生命值改變顏色
        let color = 0x00ff00; // 綠色
        if (healthPercent <= 0.3) {
            color = 0xff0000; // 紅色
        } else if (healthPercent <= 0.6) {
            color = 0xffff00; // 黃色
        }
        this.healthBar.setFillStyle(color);

        // 更新文字
        this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
    }

    /**
     * ❤️ 受到傷害
     */
    takeDamage(damage) {
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        this.updateHealthDisplay();

        if (this.currentHealth <= 0) {
            console.log('💀 太空船被摧毀！');
            // 這裡可以添加遊戲結束邏輯
        }

        console.log(`💥 受到 ${damage} 點傷害，剩餘生命值: ${this.currentHealth}`);
    }

    /**
     * ❤️ 恢復生命值
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.updateHealthDisplay();

        console.log(`💚 恢復 ${amount} 點生命值，當前生命值: ${this.currentHealth}`);
    }

    /**
     * ☁️ 生成雲朵敵人
     */
    spawnCloudEnemy() {
        const { width, height } = this;

        // 檢查資源是否存在
        if (!this.textures.exists('cloud_enemy')) {
            console.warn('⚠️ 雲朵敵人資源不存在');
            return;
        }

        // 創建敵人（從右側螢幕外開始）
        const enemy = this.add.sprite(width + 100, Phaser.Math.Between(100, height - 100), 'cloud_enemy');
        enemy.setOrigin(0.5, 0.5);
        enemy.setScale(0.4); // 與太空船相同大小
        enemy.setDepth(-65); // 在太空船後面，視差背景前面
        enemy.setAlpha(0.8); // 稍微透明，更像雲朵

        // 設置敵人屬性
        enemy.speed = Phaser.Math.Between(1, 3); // 隨機速度

        // 添加浮動動畫
        this.tweens.add({
            targets: enemy,
            y: enemy.y + Phaser.Math.Between(-30, 30),
            duration: Phaser.Math.Between(2000, 4000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 添加到敵人群組
        this.enemies.push(enemy);

        console.log(`☁️ 生成雲朵敵人在位置 (${enemy.x}, ${enemy.y})`);
    }

    /**
     * ☁️ 更新敵人系統
     */
    updateEnemies() {
        const currentTime = this.time.now;

        // 生成新敵人
        if (currentTime - this.enemySpawnTimer > this.enemySpawnDelay) {
            this.spawnCloudEnemy();
            this.enemySpawnTimer = currentTime;

            // 隨機化下次生成時間 (2-4秒)
            this.enemySpawnDelay = Phaser.Math.Between(2000, 4000);
        }

        // 更新現有敵人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy && enemy.active) {
                // 向左移動
                enemy.x -= enemy.speed;

                // 檢查與太空船的碰撞
                if (this.player && this.checkCollision(this.player, enemy)) {
                    // 太空船受到傷害
                    this.takeDamage(10);

                    // 銷毀敵人
                    enemy.destroy();
                    this.enemies.splice(i, 1);
                    console.log('💥 太空船與雲朵碰撞！');
                    continue;
                }

                // 移出螢幕左側時銷毀
                if (enemy.x < -100) {
                    enemy.destroy();
                    this.enemies.splice(i, 1);
                    console.log('☁️ 雲朵敵人移出螢幕，已銷毀');
                }
            } else {
                // 清理無效敵人
                this.enemies.splice(i, 1);
            }
        }
    }

    /**
     * 💥 檢查兩個物件的碰撞
     */
    checkCollision(obj1, obj2) {
        if (!obj1 || !obj2 || !obj1.active || !obj2.active) return false;

        // 獲取物件的邊界
        const bounds1 = obj1.getBounds();
        const bounds2 = obj2.getBounds();

        // 檢查矩形碰撞
        return Phaser.Geom.Rectangle.Overlaps(bounds1, bounds2);
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
     * 🚀 更新太空船（非物理移動）
     */
    updateSpaceship() {
        if (!this.player || !this.cursors) return;

        const { height } = this;
        const moveSpeed = 4; // 每幀移動像素

        // 鍵盤控制邏輯
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.y -= moveSpeed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.y += moveSpeed;
        }

        // 點擊移動到目標位置（平滑移動）
        if (Math.abs(this.player.y - this.playerTargetY) > 2) {
            const direction = this.playerTargetY > this.player.y ? 1 : -1;
            this.player.y += direction * moveSpeed;
        }

        // 限制太空船在合理的垂直範圍內
        if (this.player.y < 80) {
            this.player.y = 80;
        }
        if (this.player.y > height - 80) {
            this.player.y = height - 80;
        }

        // 更新目標位置以防超出邊界
        this.playerTargetY = Math.max(80, Math.min(height - 80, this.playerTargetY));
    }

    /**
     * 場景更新函數
     */
    update() {
        if (!this.sceneStopped) {
            this.updateParallaxBackground();
            this.updateSpaceship();
            this.updateEnemies();
        }
    }
}
