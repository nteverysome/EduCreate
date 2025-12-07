// Preload 場景 - 負責載入共用資源與視覺風格
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.sceneStopped = false;
        this.visualStyleResources = null;
        this.visualStyleId = null;
        this.initialLoadingText = null;
    }

    preload() {
        const loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Loading...',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        );
        loadingText.setOrigin(0.5);

        this.initialLoadingText = loadingText;

        // 🎨 [v2.0] 背景圖片將在 create 方法中從視覺風格資源動態加載
        console.log('🖼️ PreloadScene: 背景圖片將在 create 方法中動態加載');
    }

    async create() {
        console.log('🎮 PreloadScene: create 方法開始');

        if (this.initialLoadingText) {
            this.initialLoadingText.destroy();
            this.initialLoadingText = null;
        }

        // 🎨 [v2.0] 先加載視覺風格資源，然後動態加載背景圖片
        await this.loadVisualStyleResources();

        // 🎨 [v2.0] 從視覺風格資源中加載背景圖片
        if (!this.textures.exists('game-background')) {
            await this.loadBackgroundFromVisualStyle();
        }

        this.handlerScene = this.scene.get('handler');

        // 🔥 v94.0: 修復 - PreloadScene 不應該監聽 resize 事件
        // 只有 GameScene 應該監聽 resize 事件，避免場景重新載入
        // if (this.handlerScene && this.handlerScene.updateResize) {
        //     console.log('🎮 PreloadScene: 調用 Handler.updateResize');
        //     this.handlerScene.updateResize(this);
        // } else {
        //     console.warn('⚠️ PreloadScene: handlerScene 未初始化或 updateResize 方法不存在');
        // }

        try {
            await this.loadVisualStyleResources();
        } catch (error) {
            console.error('❌ PreloadScene: 視覺風格資源載入失敗，將使用默認樣式', error);
        }

        if (this.sceneStopped) {
            console.warn('⚠️ PreloadScene: 場景已停止，取消啟動 GameScene');
            return;
        }

        // 🔥 v102.0: 檢查 GameScene 是否已經存在並運行
        const gameScene = this.scene.get('GameScene');
        const isGameSceneActive = gameScene && gameScene.scene.isActive();

        if (isGameSceneActive) {
            console.log('✅ PreloadScene: GameScene 已經在運行，跳過重啟');
            // 只喚醒場景，不重啟
            this.scene.wake('GameScene');
            return;
        }

        console.log('🎮 PreloadScene: 準備啟動 GameScene');
        this.scene.start('GameScene');
        console.log('🎮 PreloadScene: GameScene 已啟動');
    }

    async loadVisualStyleResources() {
        try {
            let visualStyle = 'clouds';  // 改為 'clouds' - 有效的視覺風格

            if (this.game?.gameOptions?.visualStyle) {
                visualStyle = this.game.gameOptions.visualStyle;
                console.log('🎨 PreloadScene: 從 game.gameOptions 取得視覺風格', visualStyle);
            } else if (window.gameOptions?.visualStyle) {
                visualStyle = window.gameOptions.visualStyle;
                console.log('🎨 PreloadScene: 從 window.gameOptions 取得視覺風格', visualStyle);
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                visualStyle = urlParams.get('visualStyle') || 'clouds';  // 改為 'clouds'
                console.log('🎨 PreloadScene: 從 URL 取得視覺風格', visualStyle);
            }

            this.visualStyleId = visualStyle;

            const apiUrl = `${window.location.origin}/api/visual-styles/resources?styleId=${visualStyle}&game=match-up-game`;
            console.log('📡 [v80.0] PreloadScene: 請求視覺風格資源', {
                apiUrl,
                origin: window.location.origin,
                visualStyle,
                game: 'match-up-game'
            });

            try {
                // 🔥 添加超時機制 - 10 秒超時
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(apiUrl, {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log('📡 [v80.0] PreloadScene: API 回應狀態', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    contentType: response.headers.get('content-type')
                });

                if (!response.ok) {
                    console.warn('⚠️ [v80.0] PreloadScene: 無法取得視覺風格資源，使用默認樣式', {
                        status: response.status,
                        statusText: response.statusText
                    });
                    return;
                }

                const data = await response.json();

                console.log('📡 [v80.0] PreloadScene: API 回應數據', {
                    success: data?.success,
                    resourceCount: Object.keys(data?.resources || {}).length,
                    resources: data?.resources
                });

                // 🔥 [v81.0] 詳細的資源診斷訊息
                const resourceCount = Object.keys(data?.resources || {}).length;
                console.log('🔍 [v81.0] 視覺風格資源診斷', {
                    visualStyle,
                    resourceCount,
                    hasResources: resourceCount > 0,
                    resourceKeys: Object.keys(data?.resources || {}),
                    apiResponse: {
                        success: data?.success,
                        styleId: data?.styleId,
                        timestamp: data?.timestamp
                    }
                });

                if (resourceCount === 0) {
                    console.warn('⚠️ [v81.0] 視覺風格資源為空 - Vercel Blob Storage 中沒有上傳資源', {
                        visualStyle,
                        message: '請上傳視覺風格資源到 Vercel Blob Storage 的 visual-styles/{styleId}/ 目錄',
                        blobStoragePath: `visual-styles/${visualStyle}/`
                    });
                }

                // 🔥 [v82.0] 詳細的資源加載驗證
                console.log('🔍 [v82.0] 視覺風格資源加載驗證', {
                    visualStyle,
                    resourceCount,
                    resources: data?.resources,
                    hasColorConfig: data?.resources?.colors ? true : false,
                    hasFontConfig: data?.resources?.fonts ? true : false,
                    hasFullConfig: data?.resources?.config ? true : false
                });

                if (resourceCount > 0) {
                    console.log('✅ [v82.0] 視覺風格資源已成功加載！', {
                        visualStyle,
                        resourceCount,
                        colorUrl: data?.resources?.colors,
                        fontUrl: data?.resources?.fonts,
                        configUrl: data?.resources?.config
                    });
                }

                if (!data?.success || !data?.resources) {
                    console.warn('⚠️ [v80.0] PreloadScene: 視覺風格資源回應無效，使用默認樣式', data);
                    return;
                }

                this.visualStyleResources = data.resources;
                if (this.game) {
                    this.game.visualStyleResources = data.resources;
                }

                console.log('✅ [v80.0] PreloadScene: 視覺風格資源已設置', {
                    resourceCount: Object.keys(data.resources).length
                });

                const queued = this.queueVisualStyleAssets(visualStyle, data.resources);

                console.log('📋 [v80.0] PreloadScene: queueVisualStyleAssets 結果', {
                    queued,
                    resourceCount: Object.keys(data.resources).length
                });
            } catch (error) {
                console.error('❌ [v80.0] PreloadScene: 載入視覺風格資源時發生錯誤', error);
                if (error.name === 'AbortError') {
                    console.error('⏱️ [v80.0] PreloadScene: API 請求超時（10秒）', { visualStyle });
                } else {
                    console.error('❌ [v80.0] PreloadScene: 錯誤詳情', {
                        message: error.message,
                        stack: error.stack
                    });
                }
                // 繼續執行，使用默認樣式
                return;
            }

            if (!queued) {
                console.log('ℹ️ [v80.0] PreloadScene: 無需額外載入視覺風格資源');
                return;
            }

            await new Promise((resolve) => {
                this.load.once('complete', () => {
                    console.log('✅ [v80.0] PreloadScene: 視覺風格資源載入完成');
                    resolve();
                });

                this.load.once('loaderror', (file) => {
                    console.warn('⚠️ [v80.0] PreloadScene: 視覺風格資源載入失敗', file.key, file.src);
                });

                if (!this.load.isLoading()) {
                    this.load.start();
                }
            });
        } catch (error) {
            console.error('❌ [v80.0] PreloadScene: 載入視覺風格資源時發生錯誤', error);
            console.error('❌ [v80.0] PreloadScene: 錯誤詳情', {
                message: error?.message,
                stack: error?.stack
            });
        }
    }

    /**
     * 🎨 [v2.0] 從視覺風格資源中動態加載背景圖片
     */
    async loadBackgroundFromVisualStyle() {
        try {
            // 檢查是否有視覺風格資源
            if (!this.visualStyleResources) {
                console.warn('⚠️ PreloadScene: 沒有視覺風格資源，使用備用背景');
                await this.loadFallbackBackground();
                return;
            }

            // 查找背景圖片資源（資源類型為 background，用於 match-up-game）
            const bgUrl = this.visualStyleResources['background'];

            if (bgUrl && typeof bgUrl === 'string') {
                console.log('🎨 PreloadScene: 從視覺風格資源加載背景圖片', bgUrl);
                this.load.image('game-background', bgUrl);

                // 等待背景圖片加載完成
                await new Promise((resolve) => {
                    this.load.once('complete', () => {
                        console.log('✅ PreloadScene: 視覺風格背景圖片加載完成');
                        resolve();
                    });

                    this.load.once('loaderror', (file) => {
                        console.warn('⚠️ PreloadScene: 視覺風格背景圖片加載失敗，使用備用背景', file.key);
                        resolve();
                    });

                    if (!this.load.isLoading()) {
                        this.load.start();
                    }
                });
            } else {
                console.warn('⚠️ PreloadScene: 視覺風格中沒有背景圖片資源，使用備用背景');
                await this.loadFallbackBackground();
            }
        } catch (error) {
            console.error('❌ PreloadScene: 加載視覺風格背景時發生錯誤', error);
            await this.loadFallbackBackground();
        }
    }

    /**
     * 🎨 [v2.0] 加載備用背景圖片（硬編碼路徑）
     */
    async loadFallbackBackground() {
        try {
            if (!this.textures.exists('game-background')) {
                console.log('🖼️ PreloadScene: 加載備用背景圖片 - 精靈王國戰鬥背景 3');
                this.load.image('game-background', '/games/match-up-game/assets/game_background_3.png');

                await new Promise((resolve) => {
                    this.load.once('complete', () => {
                        console.log('✅ PreloadScene: 備用背景圖片加載完成');
                        resolve();
                    });

                    this.load.once('loaderror', (file) => {
                        console.warn('⚠️ PreloadScene: 備用背景圖片加載失敗', file.key);
                        resolve();
                    });

                    if (!this.load.isLoading()) {
                        this.load.start();
                    }
                });
            }
        } catch (error) {
            console.error('❌ PreloadScene: 加載備用背景時發生錯誤', error);
        }
    }

    queueVisualStyleAssets(visualStyle, resources) {
        let queued = false;

        Object.entries(resources).forEach(([key, url]) => {
            if (typeof url !== 'string') {
                return;
            }

            const trimmed = url.trim();
            if (!trimmed) {
                return;
            }

            if (!/^(https?:\/\/|\/)/.test(trimmed)) {
                console.warn('⚠️ PreloadScene: 忽略無效的視覺風格資源 URL', { key, url });
                return;
            }

            const extension = trimmed.split('?')[0].split('.').pop().toLowerCase();
            const assetKey = `${key}_${visualStyle}`;

            if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
                this.load.image(assetKey, trimmed);
                queued = true;
                console.log('🖼️ PreloadScene: 排程載入圖片資源', assetKey);
            } else if (['mp3', 'ogg', 'wav', 'm4a'].includes(extension)) {
                this.load.audio(assetKey, trimmed);
                queued = true;
                console.log('🔊 PreloadScene: 排程載入音訊資源', assetKey);
            } else {
                console.warn('⚠️ PreloadScene: 未知的視覺風格資源類型', { key, url });
            }
        });

        return queued;
    }
}

