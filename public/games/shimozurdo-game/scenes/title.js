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
     * 場景更新函數
     */
    update() {
        if (!this.sceneStopped) {
            this.updateParallaxBackground();
        }
    }
}
