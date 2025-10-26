export default class Preload extends Phaser.Scene {

    width = null            // 遊戲畫面寬度
    height = null           // 遊戲畫面高度
    handlerScene = null     // 場景管理器引用
    sceneStopped = false    // 場景停止狀態標記
    visualStyleResources = null  // 視覺風格資源 URL（從 Blob Storage）

    constructor() {
        super({ key: 'preload' })  // 註冊場景名稱為 'preload'
    }

    async preload() {
        // 🎨 載入視覺風格資源（從 Blob Storage）
        await this.loadVisualStyleResources();

        // Images - 基礎圖片資源載入
        this.load.image('logo', 'assets/images/logo.png')           // 遊戲標誌
        this.load.image('guide', 'assets/images/540x960-guide.png') // 開發輔助線（調試用）
        this.load.image('button', 'assets/images/button.png')       // 通用按鈕樣式

        // 6層視差背景資源載入 - 創造3D深度感的多層背景系統
        // 注意：這些資源需要放置在 assets/images/parallax/ 目錄下
        this.load.image('bg_layer_1', 'assets/images/parallax/layer_1.png') // 最遠背景 - 星空（移動最慢）
        this.load.image('bg_layer_2', 'assets/images/parallax/layer_2.png') // 月亮主體層（第二慢）
        this.load.image('bg_layer_3', 'assets/images/parallax/layer_3.png') // 遠景雲層（中等速度）
        this.load.image('bg_layer_4', 'assets/images/parallax/layer_4.png') // 中景雲層（較快速度）
        this.load.image('bg_layer_5', 'assets/images/parallax/layer_5.png') // 近景雲層（很快速度）
        this.load.image('bg_layer_6', 'assets/images/parallax/layer_6.png') // 最前景 - 雲霧（最快速度）

        // 🚀 載入太空船精靈圖（採用防禦性編程）- 主角太空船動畫
        // 精靈圖規格：2450x150，7幀橫向排列，每幀350x150
        this.load.spritesheet('player_spaceship', 'assets/images/sprites/player_spaceship.png', {
            frameWidth: Math.floor(2450 / 7),  // 350px per frame - 動態計算每幀寬度，避免硬編碼
            frameHeight: 150                   // 固定幀高度150像素
        })

        // 載入事件監聽（防禦性處理）- 監控資源載入狀態，提供錯誤處理
        this.load.on('filecomplete-spritesheet-player_spaceship', () => {
            console.log('✅ 太空船精靈圖載入成功')
            this.spaceshipLoaded = true    // 設置載入成功標記，供其他場景使用
        })

        this.load.on('loaderror', (file) => {
            if (file.key === 'player_spaceship') {
                console.warn('⚠️ 太空船精靈圖載入失敗，將使用備用方案')
                this.spaceshipLoaded = false   // 設置載入失敗標記，觸發備用方案
            }
        })

        // ☁️ 載入雲朵敵人圖片 - 遊戲中的碰撞目標
        this.load.image('cloud_enemy', 'assets/images/enemies/cloud_shape3_1.png')  // 白色雲朵敵人圖片

        console.log('☁️ 雲朵敵人資源載入配置完成')
        //---------------------------------------------------------------------->
        this.canvasWidth = this.sys.game.canvas.width    // 獲取實際畫布寬度
        this.canvasHeight = this.sys.game.canvas.height  // 獲取實際畫布高度

        this.width = this.game.screenBaseSize.width       // 獲取設計基準寬度（響應式用）
        this.height = this.game.screenBaseSize.height     // 獲取設計基準高度（響應式用）

        this.handlerScene = this.scene.get('handler')    // 獲取場景管理器引用
        this.handlerScene.sceneRunning = 'preload'       // 通知管理器當前運行的場景
        this.sceneStopped = false                         // 重置場景停止狀態

        let progressBox = this.add.graphics()             // 創建進度條背景框
        progressBox.fillStyle(0x000, 0.8)                // 設置黑色半透明背景
        progressBox.fillRect((this.canvasWidth / 2) - (210 / 2), (this.canvasHeight / 2) - 5, 210, 30)  // 居中繪製背景框
        let progressBar = this.add.graphics()             // 創建進度條本體

        this.load.on('progress', (value) => {            // 監聽載入進度事件
            progressBar.clear()                           // 清除舊的進度條
            progressBar.fillStyle(0xFF5758, 1)            // 設置紅色進度條顏色
            progressBar.fillRect((this.canvasWidth / 2) - (200 / 2), (this.canvasHeight / 2), 200 * value, 20)  // 根據進度繪製進度條
        })

        this.load.on('complete', () => {                 // 監聽載入完成事件
            progressBar.destroy()                         // 銷毀進度條（釋放記憶體）
            progressBox.destroy()                         // 銷毀進度條背景（釋放記憶體）
            this.time.addEvent({                          // 創建延遲事件
                delay: this.game.debugMode ? 3000 : 4000, // 調試模式3秒，正常模式4秒延遲
                callback: () => {
                    this.sceneStopped = true               // 標記場景已停止
                    this.scene.stop('preload')            // 停止預載場景
                    this.handlerScene.cameras.main.setBackgroundColor("#1a1a2e")  // 設置深太空背景色
                    this.handlerScene.launchScene('menu')  // 啟動菜單場景（顯示 Play 按鈕）
                },
                loop: false                               // 只執行一次，不循環
            })
        })
    }

    async create() {
        const { width, height } = this               // 解構賦值獲取寬高

        // 🆕 初始化管理器系統 - 從 Airplane Game 移植
        console.log('🎮 初始化管理器系統...');

        // 初始化 GEPT 詞彙管理器
        if (typeof GEPTManager !== 'undefined') {
            this.game.geptManager = new GEPTManager();
            console.log('✅ GEPT 詞彙管理器初始化完成');
        } else {
            console.warn('⚠️ GEPTManager 未載入');
        }

        // 初始化雙語發音管理器
        if (typeof BilingualManager !== 'undefined') {
            this.game.bilingualManager = new BilingualManager();
            console.log('✅ 雙語發音管理器初始化完成');
        } else {
            console.warn('⚠️ BilingualManager 未載入');
        }

        // 🧠 初始化 SRS 管理器
        if (typeof SRSManager !== 'undefined' && SRSManager.isSRSMode()) {
            console.log('🧠 啟用 SRS 模式');

            this.game.srsManager = new SRSManager();

            // 獲取用戶 ID (從 session 或 localStorage)
            const userId = await this.getUserId();

            if (!userId) {
                console.error('❌ 無法獲取用戶 ID,使用預設模式');
                await this.game.geptManager.initializeDatabase();
            } else {
                // 獲取 GEPT 等級 (從 URL 或預設)
                const geptLevel = this.getGEPTLevel();

                // 初始化 SRS 會話
                const success = await this.game.srsManager.initSession(userId, geptLevel);

                if (success) {
                    // 將 SRS 單字傳遞給 GEPT 管理器
                    const words = this.game.srsManager.words;
                    this.game.geptManager.loadSRSWords(words);
                    console.log('✅ SRS 模式: 使用 SRS 選擇的單字');
                } else {
                    console.error('❌ SRS 初始化失敗,使用預設模式');
                    await this.game.geptManager.initializeDatabase();
                }
            }
        } else {
            console.log('📚 使用自定義活動模式');
            // 使用現有的載入邏輯
            await this.game.geptManager.initializeDatabase();
        }

        // CONFIG SCENE - 場景配置區塊
        if (this.handlerScene) {                     // 防禦性檢查：確保 handlerScene 已初始化
            this.handlerScene.updateResize(this)     // 更新響應式配置，適應不同螢幕尺寸
        } else {
            console.warn('⚠️ handlerScene 未初始化，跳過 updateResize');
        }
        if (this.game.debugMode)                     // 如果是調試模式
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)  // 顯示輔助參考線
        // CONFIG SCENE

        // GAME OBJECTS - 遊戲物件區塊
        this.add.image(width / 2, height / 2, 'logo').setOrigin(.5)  // 在螢幕中央顯示遊戲標誌
        // GAME OBJECTS

        // 🚀 啟動遊戲主場景
        // 使用 time.delayedCall 確保所有資源載入完成後再啟動場景
        this.time.delayedCall(100, () => {
            // 直接從場景管理器獲取 handler 場景引用
            const handlerScene = this.scene.get('handler');

            if (handlerScene && handlerScene.launchScene) {
                console.log('🎮 預載入完成，啟動遊戲主場景: title');
                handlerScene.launchScene('title');
            } else {
                console.error('❌ 無法獲取 handler 場景，嘗試直接啟動 title 場景');
                // 降級方案：直接啟動 title 場景
                this.scene.start('title');
            }
        });
    }

    /**
     * 獲取用戶 ID
     * @returns {Promise<string|null>} 用戶 ID
     */
    async getUserId() {
        try {
            // 🔧 使用完整 URL 路徑，避免 iframe 內相對路徑問題
            const apiUrl = `${window.location.origin}/api/auth/session`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data.user?.id || null;
        } catch (error) {
            console.error('獲取用戶 ID 失敗:', error);
            return null;
        }
    }

    /**
     * 獲取 GEPT 等級
     * @returns {string} GEPT 等級
     */
    getGEPTLevel() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('geptLevel') || 'elementary';
    }

    /**
     * 載入視覺風格資源（從 Vercel Blob Storage）
     * 這個方法會從 API 獲取視覺風格資源的 URL，並載入到遊戲中
     */
    async loadVisualStyleResources() {
        try {
            // 獲取視覺風格 ID（從 URL 參數或使用默認值）
            const urlParams = new URLSearchParams(window.location.search);
            const visualStyle = urlParams.get('visualStyle') || 'clouds';

            console.log('🎨 開始載入視覺風格資源:', visualStyle);

            // 🔧 使用完整 URL 路徑，避免 iframe 內相對路徑問題
            const apiUrl = `${window.location.origin}/api/visual-styles/resources?styleId=${visualStyle}`;
            console.log('📡 API URL:', apiUrl);

            // 從 API 獲取資源 URL
            const response = await fetch(apiUrl);

            if (!response.ok) {
                console.warn('⚠️ 無法獲取視覺風格資源，使用默認資源');
                return;
            }

            const data = await response.json();

            if (!data.success || !data.resources) {
                console.warn('⚠️ 視覺風格資源數據無效，使用默認資源');
                return;
            }

            // 保存資源 URL 供其他場景使用
            this.visualStyleResources = data.resources;

            // 載入太空船圖片（如果存在）
            if (data.resources.spaceship) {
                const spaceshipKey = `spaceship_${visualStyle}`;
                // 🎨 使用 spritesheet 載入，支持精靈圖動畫
                // 假設精靈圖是 2450x150，包含 7 幀（每幀 350x150）
                this.load.spritesheet(spaceshipKey, data.resources.spaceship, {
                    frameWidth: 350,  // 每幀寬度
                    frameHeight: 150  // 每幀高度
                });
                console.log(`✅ 載入視覺風格太空船精靈圖: ${spaceshipKey}`);
            }

            // 載入雲朵圖片（如果存在）
            if (data.resources.cloud1) {
                const cloud1Key = `cloud1_${visualStyle}`;
                this.load.image(cloud1Key, data.resources.cloud1);
                console.log(`✅ 載入視覺風格雲朵1: ${cloud1Key}`);
            }

            if (data.resources.cloud2) {
                const cloud2Key = `cloud2_${visualStyle}`;
                this.load.image(cloud2Key, data.resources.cloud2);
                console.log(`✅ 載入視覺風格雲朵2: ${cloud2Key}`);
            }

            // 載入音效（如果存在）
            if (data.resources.background) {
                const backgroundKey = `background_${visualStyle}`;
                this.load.audio(backgroundKey, data.resources.background);
                console.log(`✅ 載入視覺風格背景音樂: ${backgroundKey}`);
            }

            if (data.resources.hit) {
                const hitKey = `hit_${visualStyle}`;
                this.load.audio(hitKey, data.resources.hit);
                console.log(`✅ 載入視覺風格碰撞音效: ${hitKey}`);
            }

            if (data.resources.success) {
                const successKey = `success_${visualStyle}`;
                this.load.audio(successKey, data.resources.success);
                console.log(`✅ 載入視覺風格成功音效: ${successKey}`);
            }

            console.log('🎨 視覺風格資源載入配置完成');

            // 🔧 手動啟動載入器並等待完成
            if (!this.load.isLoading()) {
                return new Promise((resolve) => {
                    this.load.once('complete', () => {
                        console.log('✅ 視覺風格資源載入完成');
                        resolve();
                    });
                    this.load.start();
                });
            }

        } catch (error) {
            console.error('❌ 載入視覺風格資源失敗:', error);
            console.warn('⚠️ 將使用默認資源');
        }
    }
}
