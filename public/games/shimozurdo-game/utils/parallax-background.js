/**
 * ParallaxBackground - shimozurdo 遊戲視差背景管理系統
 * 支援多層背景、響應式適配、性能優化
 */
export default class ParallaxBackground {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.layers = [];
        this.isScrolling = false;
        this.scrollSpeed = config.scrollSpeed || 1;
        this.autoScroll = config.autoScroll !== false; // 預設開啟自動滾動
        
        // 響應式配置
        this.baseWidth = scene.game.screenBaseSize.width;
        this.baseHeight = scene.game.screenBaseSize.height;
        
        // 預設層級配置（6層月亮主題視差背景）
        this.defaultLayers = [
            {
                key: 'bg_layer_1', // 最遠背景 - 星空/深空
                scrollFactor: 0.1,
                depth: -100,
                alpha: 0.8,
                tint: 0xffffff,
                blendMode: 'NORMAL'
            },
            {
                key: 'bg_layer_2', // 月亮主體層
                scrollFactor: 0.2,
                depth: -95,
                alpha: 0.9,
                tint: 0xffffff,
                blendMode: 'NORMAL'
            },
            {
                key: 'bg_layer_3', // 遠景雲層
                scrollFactor: 0.3,
                depth: -90,
                alpha: 0.7,
                tint: 0xffffff,
                blendMode: 'NORMAL'
            },
            {
                key: 'bg_layer_4', // 中景雲層
                scrollFactor: 0.5,
                depth: -80,
                alpha: 0.8,
                tint: 0xffffff,
                blendMode: 'NORMAL'
            },
            {
                key: 'bg_layer_5', // 近景雲層
                scrollFactor: 0.7,
                depth: -70,
                alpha: 0.8,
                tint: 0xffffff,
                blendMode: 'NORMAL'
            },
            {
                key: 'bg_layer_6', // 最前景 - 雲霧/粒子
                scrollFactor: 0.9,
                depth: -60,
                alpha: 0.6,
                tint: 0xffffff,
                blendMode: 'NORMAL'
            }
        ];
        
        this.config = config.layers || this.defaultLayers;
    }

    /**
     * 創建視差背景層
     */
    create(layerConfigs = null) {
        const configs = layerConfigs || this.config;
        
        configs.forEach((layerConfig, index) => {
            // 檢查資源是否存在
            if (!this.scene.textures.exists(layerConfig.key)) {
                console.error(`❌ 視差背景資源不存在: ${layerConfig.key}`);
                console.log('📋 可用的紋理資源:', this.scene.textures.list);
                return;
            }

            console.log(`✅ 載入視差背景層: ${layerConfig.key}`);
            
            // 獲取圖片原始尺寸
            const texture = this.scene.textures.get(layerConfig.key);
            const frame = texture.get();
            const originalWidth = frame.width;
            const originalHeight = frame.height;

            // 獲取當前螢幕尺寸
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;

            console.log(`🎨 創建 ${layerConfig.key} - 原始: ${originalWidth}x${originalHeight}, 螢幕: ${screenWidth}x${screenHeight}`);

            // 創建 TileSprite 實現無限滾動
            const layer = this.scene.add.tileSprite(
                0, 0,
                screenWidth, // 使用螢幕寬度
                screenHeight, // 使用螢幕高度
                layerConfig.key
            );
            
            // 設定層級屬性
            layer.setOrigin(0, 0);
            layer.setDepth(layerConfig.depth || -100 + index);
            layer.setAlpha(layerConfig.alpha || 1);
            layer.setTint(layerConfig.tint || 0xffffff);
            layer.setScrollFactor(layerConfig.scrollFactor || 0.5);

            // 設定混合模式（如果指定）
            if (layerConfig.blendMode && Phaser.BlendModes[layerConfig.blendMode]) {
                layer.setBlendMode(Phaser.BlendModes[layerConfig.blendMode]);
            }
            
            // 響應式縮放（傳入原始尺寸）
            this.updateLayerScale(layer, originalWidth, originalHeight);
            
            // 儲存層級資訊（包含原始尺寸）
            this.layers.push({
                sprite: layer,
                config: layerConfig,
                scrollFactor: layerConfig.scrollFactor || 0.5,
                baseScrollX: 0,
                baseScrollY: 0,
                originalWidth: originalWidth,
                originalHeight: originalHeight
            });
        });
        
        console.log(`✅ 視差背景創建完成，共 ${this.layers.length} 層`);
        
        // 開始自動滾動
        if (this.autoScroll) {
            this.startAutoScroll();
        }
    }

    /**
     * 更新層級縮放以適應響應式
     */
    updateLayerScale(layer, originalWidth = null, originalHeight = null) {
        const currentWidth = this.scene.cameras.main.width;
        const currentHeight = this.scene.cameras.main.height;

        // 如果沒有提供原始尺寸，嘗試從 texture 獲取
        if (!originalWidth || !originalHeight) {
            const texture = layer.texture;
            const frame = texture.get();
            originalWidth = frame.width;
            originalHeight = frame.height;
        }

        // 計算圖片和螢幕的寬高比
        const imageRatio = originalWidth / originalHeight;
        const screenRatio = currentWidth / currentHeight;

        let scale, finalWidth, finalHeight;

        // 強制覆蓋策略：確保背景完全填滿螢幕，避免空白區域
        // 使用 Math.max 確保圖片在兩個方向都能覆蓋螢幕
        const scaleX = currentWidth / originalWidth;
        const scaleY = currentHeight / originalHeight;
        scale = Math.max(scaleX, scaleY); // 使用較大的縮放比例確保完全覆蓋

        finalWidth = originalWidth * scale;
        finalHeight = originalHeight * scale;

        // 如果圖片內容不足，設定最小縮放比例
        const minScale = 1.0; // 至少保持原始大小
        if (scale < minScale) {
            scale = minScale;
            finalWidth = originalWidth * scale;
            finalHeight = originalHeight * scale;
        }

        console.log(`🔧 智能縮放 - 原始: ${originalWidth}x${originalHeight} (${imageRatio.toFixed(2)}:1), 螢幕: ${currentWidth}x${currentHeight} (${screenRatio.toFixed(2)}:1), 縮放: ${scale.toFixed(3)}, 最終: ${Math.round(finalWidth)}x${Math.round(finalHeight)}`);

        // 設定縮放比例
        layer.setScale(scale);

        // 重新設定 TileSprite 的尺寸以匹配螢幕
        layer.setSize(currentWidth / scale, currentHeight / scale);

        // 居中定位
        layer.setPosition(0, 0);
    }

    /**
     * 開始自動滾動
     */
    startAutoScroll() {
        if (this.scrollTween) {
            this.scrollTween.destroy();
        }
        
        this.isScrolling = true;
        
        // 創建持續的滾動動畫
        this.scrollTween = this.scene.tweens.addCounter({
            from: 0,
            to: 360,
            duration: 60000, // 60秒完成一個循環
            repeat: -1,
            onUpdate: (tween) => {
                const progress = tween.getValue();
                this.updateScroll(progress * 0.5, 0); // 水平滾動
            }
        });
    }

    /**
     * 停止自動滾動
     */
    stopAutoScroll() {
        this.isScrolling = false;
        if (this.scrollTween) {
            this.scrollTween.destroy();
            this.scrollTween = null;
        }
    }

    /**
     * 更新滾動位置
     */
    updateScroll(deltaX = 0, deltaY = 0) {
        this.layers.forEach(layer => {
            const scrollX = deltaX * layer.scrollFactor * this.scrollSpeed;
            const scrollY = deltaY * layer.scrollFactor * this.scrollSpeed;
            
            layer.baseScrollX += scrollX;
            layer.baseScrollY += scrollY;
            
            // 更新 TileSprite 的滾動位置
            layer.sprite.setTilePosition(layer.baseScrollX, layer.baseScrollY);
        });
    }

    /**
     * 響應式更新 - 當螢幕尺寸改變時調用
     */
    onResize() {
        this.layers.forEach(layer => {
            this.updateLayerScale(layer.sprite, layer.originalWidth, layer.originalHeight);
        });
        console.log('🔄 視差背景響應式更新完成');
    }

    /**
     * 設定滾動速度
     */
    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
    }

    /**
     * 設定層級透明度
     */
    setLayerAlpha(layerIndex, alpha) {
        if (this.layers[layerIndex]) {
            this.layers[layerIndex].sprite.setAlpha(alpha);
        }
    }

    /**
     * 設定層級色調
     */
    setLayerTint(layerIndex, tint) {
        if (this.layers[layerIndex]) {
            this.layers[layerIndex].sprite.setTint(tint);
        }
    }

    /**
     * 銷毀視差背景
     */
    destroy() {
        this.stopAutoScroll();
        this.layers.forEach(layer => {
            if (layer.sprite) {
                layer.sprite.destroy();
            }
        });
        this.layers = [];
        console.log('🗑️ 視差背景已銷毀');
    }

    /**
     * 獲取層級數量
     */
    getLayerCount() {
        return this.layers.length;
    }

    /**
     * 獲取特定層級
     */
    getLayer(index) {
        return this.layers[index] || null;
    }
}
