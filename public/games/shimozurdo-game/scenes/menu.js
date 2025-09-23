// Menu 場景類別 - shimozurdo 遊戲的主菜單場景
// 提供遊戲開始按鈕和基本遊戲信息

/**
 * Menu 類別 - 繼承自 Phaser.Scene，提供遊戲的主菜單界面
 * 包含 Play 按鈕、遊戲標題和背景
 */
export default class Menu extends Phaser.Scene {

    // 類別屬性定義
    handlerScene = null     // 儲存 Handler 場景的引用
    sceneStopped = false    // 場景停止狀態標記
    backgroundLayers = null // 視差背景層物件容器
    scrollPositions = null  // 各背景層滾動位置記錄

    /**
     * 建構函數 - 初始化 Menu 場景
     */
    constructor() {
        super({ key: 'menu' })  // 註冊場景名稱為 'menu'
        this._sceneStarted = false;          // 防止重複啟動場景
    }

    preload() {
        this.sceneStopped = false                        // 重置場景停止狀態
        this.width = this.game.screenBaseSize.width     // 獲取設計基準寬度
        this.height = this.game.screenBaseSize.height   // 獲取設計基準高度
        this.handlerScene = this.scene.get('handler')   // 獲取場景管理器引用
        this.handlerScene.sceneRunning = 'menu'         // 通知管理器當前運行場景
    }

    create() {
        const { width, height } = this                   // 解構賦值獲取寬高

        // CONFIG SCENE - 場景配置區塊
        this.handlerScene.updateResize(this)             // 更新響應式配置
        if (this.game.debugMode)                         // 如果是調試模式
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)  // 顯示輔助參考線

        // 創建視差背景 - 多層滾動背景系統
        this.createParallaxBackground()

        // 創建遊戲標題
        this.createGameTitle()

        // 創建 Play 按鈕
        this.createPlayButton()

        // 創建遊戲說明
        this.createGameInstructions()

        // 初始化響應式元素數組
        this.testElements = [];

        // 註冊響應式元素
        this.registerResponsiveElements();

        // 設置全螢幕監聽器
        this.setupFullscreenListeners();

        // 📱 手機保險機制：任意點一下畫面也能啟動（防止互動區域命中偏差）
        this.input.once('pointerdown', () => {
            if (!this._sceneStarted) {
                console.log('📱 全畫面點擊觸發開始（fallback）');
                this.startGame();
            }
        });

        console.log('🎮 菜單場景創建完成');
    }

    /**
     * 創建視差背景 - 與 title 場景相同的背景系統
     */
    createParallaxBackground() {
        const { width, height } = this;

        // 背景層配置 - 6層視差背景，從遠到近（使用正確的紋理名稱）
        const backgroundConfig = [
            { key: 'bg_layer_1', depth: -100, scrollFactor: 0.1 },   // 天空層 - 最遠，幾乎不動
            { key: 'bg_layer_2', depth: -90, scrollFactor: 0.2 },    // 月亮層 - 很遠，輕微移動
            { key: 'bg_layer_3', depth: -80, scrollFactor: 0.3 },    // 後景層 - 遠景山脈
            { key: 'bg_layer_4', depth: -70, scrollFactor: 0.5 },    // 中景層 - 中距離物體
            { key: 'bg_layer_5', depth: -65, scrollFactor: 0.7 },    // 前景層 - 近距離物體
            { key: 'bg_layer_6', depth: -60, scrollFactor: 1.0 }     // 地面層 - 最近，完全跟隨
        ];

        // 初始化背景層容器和滾動位置記錄
        this.backgroundLayers = {};
        this.scrollPositions = {};

        // 創建每一層背景
        backgroundConfig.forEach(config => {
            try {
                // 檢查紋理是否存在
                if (this.textures.exists(config.key)) {
                    // 創建背景精靈
                    const layer = this.add.image(0, 0, config.key);
                    layer.setOrigin(0, 0);                    // 設置原點為左上角
                    layer.setDepth(config.depth);             // 設置深度層級
                    layer.setScrollFactor(config.scrollFactor); // 設置滾動因子

                    // 調整背景尺寸以覆蓋整個螢幕
                    const scaleX = width / layer.width;
                    const scaleY = height / layer.height;
                    const scale = Math.max(scaleX, scaleY);   // 使用較大的縮放比例確保完全覆蓋
                    layer.setScale(scale);

                    // 儲存到背景層容器
                    this.backgroundLayers[config.key] = layer;
                    this.scrollPositions[config.key] = 0;

                    console.log(`✅ 背景層 ${config.key} 創建成功`);
                } else {
                    console.warn(`⚠️ 背景紋理 ${config.key} 不存在，跳過`);
                }
            } catch (error) {
                console.error(`❌ 創建背景層 ${config.key} 失敗:`, error);
            }
        });
    }

    /**
     * 創建遊戲標題
     */
    createGameTitle() {
        const { width, height } = this;

        // 主標題
        this.gameTitle = this.add.text(width / 2, height * 0.25, 'Shimozurdo', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });
        this.gameTitle.setOrigin(0.5);
        this.gameTitle.setDepth(10);

        // 副標題
        this.gameSubtitle = this.add.text(width / 2, height * 0.35, '雲朵碰撞遊戲', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.gameSubtitle.setOrigin(0.5);
        this.gameSubtitle.setDepth(10);

        console.log('✅ 遊戲標題創建成功');
    }

    /**
     * 創建 Play 按鈕
     */
    createPlayButton() {
        const { width, height } = this;

        // 創建按鈕背景
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = width / 2;
        const buttonY = height * 0.55;

        // 創建按鈕圖形
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x4CAF50);  // 綠色背景
        buttonBg.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
        buttonBg.lineStyle(3, 0x2E7D32);  // 深綠色邊框
        buttonBg.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
        buttonBg.setDepth(9);

        // 創建按鈕文字
        this.playButtonText = this.add.text(buttonX, buttonY, 'PLAY', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.playButtonText.setOrigin(0.5);
        this.playButtonText.setDepth(10);

        // 創建互動區域
        const playButton = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight);
        playButton.setInteractive({ cursor: 'pointer' });
        playButton.setDepth(11);

        // 按鈕懸停效果
        playButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x66BB6A);  // 更亮的綠色
            buttonBg.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonBg.lineStyle(3, 0x2E7D32);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
            this.playButtonText.setScale(1.1);
        });

        playButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x4CAF50);  // 原始綠色
            buttonBg.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonBg.lineStyle(3, 0x2E7D32);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
            this.playButtonText.setScale(1.0);
        });

        // 按鈕點擊事件
        playButton.on('pointerdown', () => {
            console.log('🎮 Play 按鈕被點擊，開始遊戲！');
            this.startGame();
        });

        // 儲存按鈕引用
        this.playButton = playButton;
        this.playButtonBg = buttonBg;

        console.log('✅ Play 按鈕創建成功');
    }

    /**
     * 創建遊戲說明
     */
    createGameInstructions() {
        const { width, height } = this;

        const instructions = [
            '使用方向鍵或 WASD 控制太空船',
            '點擊螢幕也可以移動太空船',
            '避開雲朵敵人，保護你的太空船！'
        ];

        instructions.forEach((text, index) => {
            this.add.text(width / 2, height * 0.75 + index * 25, text, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5).setDepth(10);
        });

        console.log('✅ 遊戲說明創建成功');
    }

    /**
     * 註冊響應式元素
     */
    registerResponsiveElements() {
        // 將需要響應式調整的元素加入數組
        if (this.gameTitle) this.testElements.push(this.gameTitle);
        if (this.gameSubtitle) this.testElements.push(this.gameSubtitle);
        if (this.playButtonText) this.testElements.push(this.playButtonText);
    }

    /**
     * 開始遊戲 - 進入全螢幕並切換到 title 場景
     */
    startGame() {
        console.log('🚀 開始遊戲，嘗試進入全螢幕模式');

        // 只請求全螢幕模式，場景切換優先由 onFullscreenEnter 處理
        this.requestFullscreen();

        // ⏱️ 快速保險：若短時間內未進入全螢幕流程，直接啟動場景（避免行動端點擊無反應）
        setTimeout(() => {
            if (!this._sceneStarted) {
                console.log('⏱️ 未收到全螢幕回應，直接啟動遊戲場景（fallback）');
                this.startGameScene();
            }
        }, 150);

        // 注意：不在這裡立即切換場景，而是等待全螢幕處理完成
        // 場景切換將在 onFullscreenEnter() -> startGameScene() 中進行
    }

    /**
     * 請求全螢幕模式並隱藏網址列
     */
    requestFullscreen() {
        try {
            // 檢測設備類型
            const isMobile = this.detectMobileDevice();
            const isRealMobile = this.detectRealMobileDevice();
            const isIOS = this.detectIOSDevice();

            console.log('🖥️ 設備檢測:', { isMobile, isRealMobile, isIOS });

            if (isRealMobile) {
                // 真實手機：使用專用策略，不依賴 Fullscreen API
                console.log('📱 真實手機：使用真實手機專用全螢幕策略');
                this.realMobileFullscreenStrategy();
            } else if (isMobile) {
                // Playwright 模擬手機：使用原有策略 + 強化網址列隱藏
                console.log('🤖 模擬手機：使用標準手機策略（測試環境）+ 強化網址列隱藏');
                this.mobileFullscreenStrategy();
                // 在測試環境中也應用強化的網址列隱藏
                this.handleAddressBarHiding();
            } else {
                // 桌面設備：使用標準全螢幕 API
                console.log('🖥️ 桌面設備：使用標準全螢幕 API');
                this.desktopFullscreenStrategy();
            }
        } catch (error) {
            // 移除紅色錯誤提示，靜默處理
            console.log('📱 使用替代全螢幕方案 (系統限制)');
            // 出錯時使用備用方案
            this.fallbackFullscreenStrategy();
        }
    }

    /**
     * 檢測手機設備
     */
    detectMobileDevice() {
        // 優先檢查 User Agent 中的手機標識
        const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 檢查是否為真正的觸控設備（排除桌面觸控螢幕）
        const isTouchDevice = ('ontouchstart' in window) && (navigator.maxTouchPoints > 0);

        // 檢查螢幕尺寸（更嚴格的條件）
        const isSmallScreen = (window.innerWidth <= 480) && (window.innerHeight <= 800);

        // 檢查設備方向 API（手機特有）
        const hasOrientationAPI = (typeof window.orientation !== 'undefined');

        // 綜合判斷：必須滿足 User Agent 或者同時滿足多個條件
        const isMobile = mobileUserAgent || (isTouchDevice && isSmallScreen && hasOrientationAPI);

        console.log('📱 設備檢測詳情:', {
            userAgent: navigator.userAgent,
            mobileUserAgent,
            isTouchDevice,
            isSmallScreen,
            hasOrientationAPI,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            finalResult: isMobile
        });

        return isMobile;
    }

    /**
     * 檢測 iOS 設備
     */
    detectIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    /**
     * 檢測真實手機設備（區分 Playwright 模擬環境）
     */
    detectRealMobileDevice() {
        // 檢測是否為自動化測試環境
        const isPlaywright = !!(
            navigator.webdriver ||
            window.navigator.webdriver ||
            window.__playwright ||
            navigator.userAgent.includes('HeadlessChrome') ||
            navigator.userAgent.includes('Playwright') ||
            window.chrome?.runtime?.onConnect // Chrome 自動化標識
        );

        const isMobile = this.detectMobileDevice();

        console.log('🔍 真實設備檢測:', {
            isMobile,
            isPlaywright,
            userAgent: navigator.userAgent,
            isRealMobile: isMobile && !isPlaywright
        });

        // 真實手機：手機設備且非自動化環境
        return isMobile && !isPlaywright;
    }

    /**
     * 真實手機專用全螢幕策略（不依賴 Fullscreen API）
     */
    realMobileFullscreenStrategy() {
        console.log('📱 執行真實手機全螢幕策略');

        // 1. 立即設置真實手機專用樣式
        this.setRealMobileFullscreenStyles();

        // 2. 處理地址欄隱藏
        this.handleAddressBarHiding();

        // 3. 設置動態 viewport 處理
        this.setupDynamicViewport();

        // 4. 不嘗試 Fullscreen API，直接觸發完成
        setTimeout(() => {
            this.onFullscreenEnter();
        }, 100);
    }

    /**
     * 手機專用全螢幕策略（保留給 Playwright 測試）
     */
    mobileFullscreenStrategy() {
        console.log('📱 執行手機全螢幕策略（測試環境）');

        // 0. ANDROID/非 iOS：先嘗試與桌面相同的 in-iframe 全螢幕（Phaser → 原生）
        const isIOS = this.detectIOSDevice();
        if (!isIOS) {
            try {
                if (this.scale && typeof this.scale.startFullscreen === 'function') {
                    this.scale.fullscreenTarget = document.getElementById('game') || this.game.canvas;
                    this.scale.startFullscreen();
                    // 小延遲檢查是否已進入全螢幕
                    setTimeout(() => {
                        if (this.scale.isFullscreen || document.fullscreenElement || document.webkitFullscreenElement) {
                            console.log('✅ Android/非 iOS：已以 Phaser 方式進入全螢幕');
                            this.onFullscreenEnter();
                            return;
                        }
                    }, 80);
                }
            } catch (e) {
                console.warn('⚠️ Android/非 iOS：Phaser 全螢幕嘗試失敗，稍後走原生/父頁面策略', e);
            }
        }

        // 1. 立即隱藏網址列
        this.hideAddressBar();

        // 2. 設置偽全螢幕樣式
        this.setMobileFullscreenStyles();

        // 3. 嘗試進入全螢幕（如果支援）
        setTimeout(() => {
            this.tryMobileFullscreen();
        }, 100);

        // 4. 強制觸發全螢幕處理
        setTimeout(() => {
            this.onFullscreenEnter();
        }, 200);
    }

    /**
     * 桌面專用全螢幕策略
     */
    desktopFullscreenStrategy() {
        console.log('🖥️ 執行桌面全螢幕策略');

        // 檢查是否在 iframe 中
        const isInIframe = (window !== window.top);
        console.log('🔍 iframe 檢測:', { isInIframe });

        // 先嘗試標準策略（內部先走 Phaser，再走原生 API）
        this.standardFullscreenStrategy();

        // 短暫延遲後驗證是否已進入全螢幕；若仍未成功且在 iframe 中，改走父頁面策略
        setTimeout(() => {
            const isFs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                (this.scale && this.scale.isFullscreen)
            );
            if (!isFs && isInIframe) {
                console.log('🔁 標準策略未生效，切換父頁面全螢幕策略');
                this.iframeFullscreenStrategy();
            }
        }, 120);
    }

    /**
     * 標準全螢幕策略（非 iframe 環境）
     */
    standardFullscreenStrategy() {
        const canvas = this.game.canvas;
        const container = canvas.parentElement || canvas;

        console.log('🖥️ 執行標準全螢幕策略');

        // 1) 優先使用 Phaser 的全螢幕（桌面穩定且會自動協同縮放）
        try {
            if (this.scale && typeof this.scale.startFullscreen === 'function') {
                this.scale.fullscreenTarget = document.getElementById('game') || container;
                this.scale.startFullscreen();
            }
        } catch (e) {
            console.warn('⚠️ Phaser startFullscreen 失敗，改用原生 API：', e);
        }

        // 若已進入全螢幕，直接結束（交由 fullscreenchange / onFullscreenEnter 後續流程）
        if (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            (this.scale && this.scale.isFullscreen)
        ) {
            this.onFullscreenEnter();
            return;
        }

        // 2) 原生 DOM API（按優先順序）
        if (container.requestFullscreen) {
            container.requestFullscreen().then(() => {
                console.log('✅ 成功進入全螢幕模式 (requestFullscreen)');
                // 成功進入全螢幕後也嘗試隱藏網址列
                this.handleAddressBarHiding();
                this.onFullscreenEnter();
            }).catch(() => {
                // 移除紅色錯誤提示，靜默處理
                console.log('📱 使用替代全螢幕方案');
                // 失敗時更需要隱藏網址列
                this.handleAddressBarHiding();
                this.fallbackFullscreenStrategy();
            });
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
            console.log('✅ 成功進入全螢幕模式 (webkit)');
            this.onFullscreenEnter();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
            console.log('✅ 成功進入全螢幕模式 (moz)');
            this.onFullscreenEnter();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
            console.log('✅ 成功進入全螢幕模式 (ms)');
            this.onFullscreenEnter();
        } else {
            console.warn('⚠️ 瀏覽器不支援全螢幕 API');
            this.fallbackFullscreenStrategy();
        }
    }

    /**
     * iframe 全螢幕策略
     */
    iframeFullscreenStrategy() {
        try {
            console.log('🖼️ 執行 iframe 全螢幕策略');

            // 設置全螢幕回應監聽器
            this.setupFullscreenResponseListener();

            // 嘗試通知父頁面進行全螢幕
            if (window.parent && window.parent !== window) {
                // 發送消息給父頁面
                window.parent.postMessage({
                    type: 'REQUEST_FULLSCREEN',
                    source: 'shimozurdo-game'
                }, '*');

                console.log('📤 已發送全螢幕請求給父頁面，等待回應...');
            }

            // 設置超時，如果 3 秒內沒有回應就直接啟動遊戲
            this.fullscreenTimeout = setTimeout(() => {
                console.warn('⏰ 全螢幕請求超時，直接啟動遊戲');
                this.startGameScene();
            }, 800);

        } catch (error) {
            console.warn('⚠️ iframe 全螢幕策略失敗:', error);
            this.fallbackFullscreenStrategy();
        }
    }

    /**
     * 設置全螢幕回應監聽器
     */
    setupFullscreenResponseListener() {
        if (this.fullscreenResponseListener) {
            window.removeEventListener('message', this.fullscreenResponseListener);
        }

        this._parentFSActive = this._parentFSActive || false;
        this.fullscreenResponseListener = (event) => {
            if (event.data && event.data.source === 'parent-page') {
                if (event.data.type === 'FULLSCREEN_SUCCESS') {
                    console.log('✅ 收到父頁面全螢幕成功回應:', event.data.message);
                    this._parentFSActive = true;
                    if (this.fullscreenTimeout) { clearTimeout(this.fullscreenTimeout); this.fullscreenTimeout = null; }
                    this.onFullscreenEnter();
                } else if (event.data.type === 'FULLSCREEN_FAILED') {
                    console.warn('⚠️ 收到父頁面全螢幕失敗回應:', event.data.message);
                    this._parentFSActive = true; // 父頁面已套用近全螢幕樣式
                    if (this.fullscreenTimeout) { clearTimeout(this.fullscreenTimeout); this.fullscreenTimeout = null; }
                    this.startGameScene();
                } else if (event.data.type === 'FULLSCREEN_EXITED') {
                    console.log('🚪 收到父頁面退出全螢幕通知');
                    this._parentFSActive = false;
                }
            }
        };

        window.addEventListener('message', this.fullscreenResponseListener);
    }

    /**
     * 嘗試手機全螢幕
     */
    tryMobileFullscreen() {
        try {
            // 對於手機，嘗試對整個文檔進行全螢幕
            const target = document.documentElement;

            if (target.requestFullscreen) {
                target.requestFullscreen().then(() => {
                    console.log('✅ 手機全螢幕成功 (requestFullscreen)');
                }).catch(() => {
                    // 移除紅色錯誤提示，改為友好的資訊訊息
                    console.log('📱 使用替代全螢幕方案 (瀏覽器限制)');
                });
            } else if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
                console.log('✅ 手機全螢幕成功 (webkit)');
            } else {
                console.log('📱 使用替代全螢幕方案 (API 不支援)');
            }
        } catch (error) {
            console.log('📱 手機全螢幕嘗試失敗，使用偽全螢幕:', error.message);
        }
    }

    /**
     * 備用全螢幕策略
     */
    fallbackFullscreenStrategy() {
        console.log('🔄 使用備用全螢幕策略');
        this.hideAddressBar();
        this.setMobileFullscreenStyles();
        this.onFullscreenEnter();
    }

    /**
     * 設置真實手機專用全螢幕樣式（更激進的方法）
     */
    setRealMobileFullscreenStyles() {
        try {
            console.log('📱 設置真實手機專用全螢幕樣式');

            // 創建真實手機專用樣式
            let realMobileStyle = document.getElementById('real-mobile-fullscreen-style');
            if (!realMobileStyle) {
                realMobileStyle = document.createElement('style');
                realMobileStyle.id = 'real-mobile-fullscreen-style';
                document.head.appendChild(realMobileStyle);
            }

            realMobileStyle.textContent = `
                /* 真實手機全螢幕樣式 - 修復觸控攔截問題 */
                body.real-mobile-fullscreen {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    height: -webkit-fill-available !important;
                    height: calc(var(--vh, 1vh) * 100) !important;
                    background: black !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    /* 🔧 修復：確保 body 不攔截觸控事件 */
                    pointer-events: none !important;
                }

                body.real-mobile-fullscreen #game {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    height: -webkit-fill-available !important;
                    height: calc(var(--vh, 1vh) * 100) !important;
                    background: black !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    /* 🔧 修復：移除高 z-index 避免攔截觸控事件 */
                    z-index: auto !important;
                    /* 🔧 確保觸控事件能正確傳遞 */
                    pointer-events: auto !important;
                }

                body.real-mobile-fullscreen canvas {
                    width: 100vw !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    height: -webkit-fill-available !important;
                    height: calc(var(--vh, 1vh) * 100) !important;
                    object-fit: contain !important;
                    background: transparent !important;
                    display: block !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                    /* 🔧 修復：確保 Canvas 能接收觸控事件 */
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                    -webkit-touch-callout: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }

                /* 移除所有可能的紅色框框和邊框 */
                body.real-mobile-fullscreen *,
                body.real-mobile-fullscreen *:before,
                body.real-mobile-fullscreen *:after {
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                    -webkit-touch-callout: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }

                /* iOS Safari 特殊處理 */
                @supports (-webkit-touch-callout: none) {
                    body.real-mobile-fullscreen {
                        height: 100dvh !important;
                        height: -webkit-fill-available !important;
                    }
                    body.real-mobile-fullscreen #game {
                        height: 100dvh !important;
                        height: -webkit-fill-available !important;
                    }
                    body.real-mobile-fullscreen canvas {
                        height: 100dvh !important;
                        height: -webkit-fill-available !important;
                    }
                }
            `;

            // 添加 body class
            document.body.classList.add('real-mobile-fullscreen');

            console.log('✅ 真實手機專用全螢幕樣式已設置');
        } catch (error) {
            console.warn('⚠️ 設置真實手機全螢幕樣式失敗:', error);
        }
    }

    /**
     * 設置手機專用全螢幕樣式（保留給測試環境）
     */
    setMobileFullscreenStyles() {
        try {
            console.log('📱 設置手機專用全螢幕樣式（測試環境）');

            // 創建手機專用樣式
            let mobileStyle = document.getElementById('mobile-fullscreen-style');
            if (!mobileStyle) {
                mobileStyle = document.createElement('style');
                mobileStyle.id = 'mobile-fullscreen-style';
                document.head.appendChild(mobileStyle);
            }

            mobileStyle.textContent = `
                /* 手機專用全螢幕樣式（iframe 內部安全版） - 修復觸控攔截問題 */
                body.mobile-fullscreen {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100dvh !important;
                    background: black !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    /* 🔧 修復：確保 body 不攔截觸控事件 */
                    pointer-events: none !important;
                }

                /* 只調整 #game 與 canvas，不隱藏任何元素 */
                body.mobile-fullscreen #game {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100dvh !important;
                    background: black !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    /* 🔧 修復：確保遊戲容器能接收觸控事件 */
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                }

                body.mobile-fullscreen canvas {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                    background: transparent !important;
                    /* 🔧 修復：確保 Canvas 能接收觸控事件 */
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                }

                /* iOS Safari 特殊處理 */
                @supports (-webkit-touch-callout: none) {
                    body.mobile-fullscreen {
                        height: 100dvh !important;
                        height: -webkit-fill-available !important;
                    }
                }
            `;

            // 添加 body class
            document.body.classList.add('mobile-fullscreen');

            console.log('✅ 手機專用全螢幕樣式已設置');
        } catch (error) {
            console.warn('⚠️ 設置手機全螢幕樣式失敗:', error);
        }
    }

    /**
     * 動態 viewport 處理（解決地址欄問題）
     */
    setupDynamicViewport() {
        try {
            console.log('📱 設置動態 viewport 處理');

            const updateViewport = () => {
                // 使用實際視窗高度
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);

                console.log('📐 更新 viewport:', {
                    innerHeight: window.innerHeight,
                    screenHeight: screen.height,
                    vh: vh
                });

                // 更新遊戲尺寸
                if (this.scale) {
                    this.scale.resize(window.innerWidth, window.innerHeight);
                    this.scale.refresh();
                }
            };

            // 初始設置
            updateViewport();

            // 監聽視窗變化（地址欄顯示/隱藏）
            window.addEventListener('resize', updateViewport);
            window.addEventListener('orientationchange', () => {
                setTimeout(updateViewport, 100);
                setTimeout(updateViewport, 500); // 雙重保險
            });

            // 監聽視覺 viewport 變化（更精確的地址欄檢測）
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', updateViewport);
            }

            console.log('✅ 動態 viewport 處理已設置');
        } catch (error) {
            console.warn('⚠️ 設置動態 viewport 失敗:', error);
        }
    }

    /**
     * 改進的地址欄隱藏處理（支援橫向模式）
     */
    handleAddressBarHiding() {
        try {
            console.log('📱 處理地址欄隱藏 - 強化版本');

            // 立即應用強力 CSS
            this.applyForceHideAddressBarCSS();

            // 檢測設備方向
            const isLandscape = window.innerWidth > window.innerHeight;
            console.log(`📱 設備方向: ${isLandscape ? '橫向' : '直向'} (${window.innerWidth}x${window.innerHeight})`);

            // 通用強力隱藏方法（適用於所有設備）
            this.executeUniversalAddressBarHiding(isLandscape);

            // iOS Safari 專用處理
            if (this.detectIOSDevice()) {
                console.log('🍎 iOS Safari 地址欄處理');

                // 橫向模式需要更強力的處理
                if (isLandscape) {
                    console.log('🔄 橫向模式：強化地址欄隱藏');

                    // 多次滾動確保地址欄隱藏
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            window.scrollTo(0, 1);
                            setTimeout(() => window.scrollTo(0, 0), 50);
                        }, i * 100);
                    }

                    // 強制觸發 resize 事件
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 500);
                } else {
                    // 直向模式的標準處理
                    window.scrollTo(0, 1);
                    setTimeout(() => window.scrollTo(0, 0), 100);
                }

                // 設置 minimal-ui（橫向模式更重要）
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui, viewport-fit=cover';
                    console.log('📱 已更新 iOS viewport 設定');
                }

                // 額外的 iOS 處理（橫向模式延長時間）
                const delay = isLandscape ? 800 : 300;
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.scrollTop = 0;
                    if (document.documentElement) {
                        document.documentElement.scrollTop = 0;
                    }

                    // 橫向模式額外處理
                    if (isLandscape) {
                        // 強制重新計算視窗高度
                        document.documentElement.style.height = '100dvh';
                        document.body.style.height = '100dvh';

                        // 觸發視窗調整
                        setTimeout(() => {
                            window.dispatchEvent(new Event('orientationchange'));
                        }, 100);
                    }
                }, delay);
            }
            // Android Chrome 處理
            else {
                console.log('🤖 Android Chrome 地址欄處理');

                // 使用 CSS 環境變數
                document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
                document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

                // 橫向模式的 Android Chrome 專門處理
                if (isLandscape) {
                    console.log('🔄 Android Chrome 橫向模式強化處理');

                    // 第一階段：立即設置基礎樣式
                    document.documentElement.style.height = '100dvh';
                    document.body.style.height = '100dvh';
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = '0';
                    document.body.style.left = '0';

                    // 第二階段：密集滾動循環（Chrome 橫向需要更多次）
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            window.scrollTo(0, 1);
                            setTimeout(() => {
                                window.scrollTo(0, 0);
                                // 每次滾動後強制重新設置樣式
                                document.body.style.height = '100dvh';
                                document.documentElement.style.height = '100dvh';
                            }, 20);
                        }, i * 60);
                    }

                    // 第三階段：延遲強化處理
                    setTimeout(() => {
                        // 強制觸發重排
                        document.body.style.display = 'none';
                        document.body.offsetHeight; // 觸發重排
                        document.body.style.display = '';

                        // 再次確保樣式
                        document.documentElement.style.height = '100dvh !important';
                        document.body.style.height = '100dvh !important';
                        document.body.style.overflow = 'hidden !important';

                        // 觸發視窗事件
                        window.dispatchEvent(new Event('resize'));
                        window.dispatchEvent(new Event('orientationchange'));
                    }, 600);

                    // 第四階段：持續監控和修正
                    const landscapeInterval = setInterval(() => {
                        if (window.innerWidth > window.innerHeight) {
                            document.body.style.height = '100dvh';
                            document.documentElement.style.height = '100dvh';
                        } else {
                            clearInterval(landscapeInterval);
                        }
                    }, 200);

                    // 5秒後停止監控
                    setTimeout(() => clearInterval(landscapeInterval), 5000);
                } else {
                    // 直向模式標準處理
                    window.scrollTo(0, 1);
                    setTimeout(() => window.scrollTo(0, 0), 50);
                }
            }

            console.log('✅ 地址欄隱藏處理完成');
        } catch (error) {
            console.warn('⚠️ 地址欄隱藏處理失敗:', error);
        }
    }

    /**
     * 強力 CSS 應用 - 立即隱藏網址列
     */
    applyForceHideAddressBarCSS() {
        console.log('🔧 應用強力網址列隱藏 CSS');

        const style = document.createElement('style');
        style.id = 'force-hide-address-bar';
        style.textContent = `
            html, body {
                height: 100vh !important;
                height: 100dvh !important;
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                top: 0 !important;
                left: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Chrome 手機版特殊處理 */
            @supports (-webkit-touch-callout: none) {
                html, body {
                    height: calc(100vh - env(keyboard-inset-height, 0px)) !important;
                    height: calc(100dvh - env(keyboard-inset-height, 0px)) !important;
                }
            }

            /* 強制隱藏滾動條 */
            ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
            }
        `;

        // 移除舊的樣式
        const oldStyle = document.getElementById('force-hide-address-bar');
        if (oldStyle) {
            oldStyle.remove();
        }

        document.head.appendChild(style);
        console.log('✅ 強力 CSS 已應用');
    }

    /**
     * 通用網址列隱藏方法 - 適用於所有設備
     */
    executeUniversalAddressBarHiding(isLandscape) {
        console.log('🌐 執行通用網址列隱藏方法');

        // 立即設置基礎樣式
        document.documentElement.style.height = '100dvh';
        document.body.style.height = '100dvh';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';

        // 多重滾動技巧 - 更密集的嘗試
        const scrollAttempts = isLandscape ? 15 : 10;
        for (let i = 0; i < scrollAttempts; i++) {
            setTimeout(() => {
                // 滾動到 1px 然後回到 0
                window.scrollTo(0, 1);
                setTimeout(() => {
                    window.scrollTo(0, 0);

                    // 每次滾動後重新應用樣式
                    document.body.style.height = '100dvh';
                    document.documentElement.style.height = '100dvh';

                    // 強制重排
                    document.body.offsetHeight;
                }, 10);
            }, i * 30);
        }

        // 延遲強化處理
        setTimeout(() => {
            this.applyDelayedAddressBarHiding(isLandscape);
        }, 500);

        // 持續監控
        this.startAddressBarMonitoring();
    }

    /**
     * 延遲強化網址列隱藏
     */
    applyDelayedAddressBarHiding(isLandscape) {
        console.log('⏰ 執行延遲強化網址列隱藏');

        // 強制觸發重排
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';

        // 重新應用所有樣式
        document.documentElement.style.cssText = `
            height: 100dvh !important;
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        `;

        document.body.style.cssText = `
            height: 100dvh !important;
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            top: 0 !important;
            left: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #000 !important;
            font-family: 'Open Sans', sans-serif !important;
        `;

        // 觸發視窗事件
        window.dispatchEvent(new Event('resize'));
        if (isLandscape) {
            window.dispatchEvent(new Event('orientationchange'));
        }

        console.log('✅ 延遲強化處理完成');
    }

    /**
     * 持續監控網址列狀態
     */
    startAddressBarMonitoring() {
        console.log('👁️ 開始網址列持續監控');

        // 清除舊的監控
        if (this.addressBarMonitor) {
            clearInterval(this.addressBarMonitor);
        }

        this.addressBarMonitor = setInterval(() => {
            // 檢查視窗高度變化
            const currentHeight = window.innerHeight;
            const expectedHeight = window.screen.height;

            if (currentHeight < expectedHeight * 0.9) {
                console.log('🔍 檢測到可能的網址列顯示，重新隱藏');

                // 重新應用隱藏
                window.scrollTo(0, 1);
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.style.height = '100dvh';
                    document.documentElement.style.height = '100dvh';
                }, 10);
            }
        }, 1000);

        // 10秒後停止監控
        setTimeout(() => {
            if (this.addressBarMonitor) {
                clearInterval(this.addressBarMonitor);
                console.log('⏹️ 網址列監控已停止');
            }
        }, 10000);
    }

    /**
     * 隱藏手機瀏覽器網址列（保留給測試環境）
     */
    hideAddressBar() {
        try {
            console.log('📱 嘗試隱藏手機瀏覽器網址列（測試環境）');

            // 方法 1: 滾動到頂部隱藏網址列
            window.scrollTo(0, 1);
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);

            // 方法 2: 使用 viewport meta 標籤動態調整
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui, viewport-fit=cover';
                console.log('📱 已更新 viewport 設定');
            }

            // 方法 3: 強制重新計算視窗高度
            setTimeout(() => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);

                if (window.innerHeight < screen.height) {
                    document.body.style.height = '100dvh';
                    document.body.style.height = 'calc(var(--vh, 1vh) * 100)';
                }
            }, 200);

            // 方法 4: 強制進入全螢幕模式（iOS Safari）
            if (this.detectIOSDevice()) {
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.scrollTop = 0;
                }, 300);
            }

            console.log('✅ 網址列隱藏處理完成');
        } catch (error) {
            console.warn('⚠️ 網址列隱藏失敗:', error);
        }
    }

    /**
     * 全螢幕進入後的處理
     */
    onFullscreenEnter() {
        console.log('🎮 已進入全螢幕模式，調整遊戲顯示');

        // 強化網址列隱藏（確保在所有情況下都執行）
        this.handleAddressBarHiding();

        // 添加全螢幕樣式
        this.addFullscreenStyles();

        // 確保遊戲畫布填滿整個螢幕
        this.adjustGameCanvas();

        // 強制觸發 Phaser 尺寸重算（修正 iOS 直向初始裁切，需要旋轉才正確的問題）
        this.scale.resize(window.innerWidth, window.innerHeight);
        this.scale.refresh();
        setTimeout(() => { this.scale.resize(window.innerWidth, window.innerHeight); this.scale.refresh(); }, 250);
        setTimeout(() => { this.scale.resize(window.innerWidth, window.innerHeight); this.scale.refresh(); }, 800);

        // 監聽 resize / orientationchange，持續校正
        if (!this._boundForceResize) {
            this._boundForceResize = () => {
                this.scale.resize(window.innerWidth, window.innerHeight);
                this.scale.refresh();
            };
            window.addEventListener('resize', this._boundForceResize, { passive: true });
            window.addEventListener('orientationchange', this._boundForceResize);
        }
        setTimeout(() => { this.scale.resize(window.innerWidth, window.innerHeight); this.scale.refresh(); }, 800);

        // 監聽 resize / orientationchange，持續校正
        if (!this._boundForceResize) {
            this._boundForceResize = () => { this.scale.resize(window.innerWidth, window.innerHeight); this.scale.refresh(); };
            window.addEventListener('resize', this._boundForceResize, { passive: true });
            window.addEventListener('orientationchange', this._boundForceResize);
        }

        // 隱藏可能的 UI 元素
        this.hideUIElements();

        // 啟動遊戲場景
        setTimeout(() => {
            this.startGameScene();
        }, 100);
    }

    /**
     * 啟動遊戲場景
     */
    startGameScene() {
        try {
            if (this._sceneStarted) { return; }
            this._sceneStarted = true;
            console.log('🚀 啟動遊戲場景');

            // 停止菜單場景
            if (!this.sceneStopped) {
                this.sceneStopped = true;
                this.scene.stop('menu');
            }

            // 啟動遊戲場景
            if (this.handlerScene && this.handlerScene.launchScene) {
                this.handlerScene.launchScene('title');
                console.log('✅ 遊戲場景已啟動');
            } else {
                console.warn('⚠️ handlerScene 不可用，嘗試直接啟動場景');
                this.scene.start('title');
            }
        } catch (error) {
            console.error('❌ 啟動遊戲場景失敗:', error);
        }
    }

    /**
     * 添加全螢幕樣式
     */
    addFullscreenStyles() {
        try {
            // 創建或更新全螢幕樣式
            let fullscreenStyle = document.getElementById('fullscreen-game-style');
            if (!fullscreenStyle) {
                fullscreenStyle = document.createElement('style');
                fullscreenStyle.id = 'fullscreen-game-style';
                document.head.appendChild(fullscreenStyle);
            }

            fullscreenStyle.textContent = `
                /* 桌面全螢幕遊戲樣式（iframe 內部安全版） - 修復觸控攔截問題 */
                body.fullscreen-game {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: black !important;
                    /* 🔧 修復：確保 body 不攔截觸控事件 */
                    pointer-events: none !important;
                }

                /* 只調整遊戲容器與畫布，不隱藏任意元素，避免黑屏 */
                body.fullscreen-game #game {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100dvh !important;
                    background: black !important;
                    /* 🔧 修復：確保遊戲容器能接收觸控事件 */
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                }

                /* 確保遊戲 canvas 正確顯示並能接收觸控事件 */
                body.fullscreen-game canvas {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                    background: transparent !important;
                    /* 🔧 修復：確保 Canvas 能接收觸控事件 */
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                }
            `;

            // 🔧 修復：仍然添加 CSS 類別，但通過 CSS 確保不攔截觸控事件
            document.body.classList.add('fullscreen-game');

            console.log('✅ 桌面全螢幕樣式已添加');
        } catch (error) {
            console.warn('⚠️ 添加全螢幕樣式失敗:', error);
        }
    }

    /**
     * 調整遊戲畫布
     */
    adjustGameCanvas() {

        try {
            const canvas = this.game.canvas;
            if (canvas) {
                canvas.style.width = '100vw';
                canvas.style.height = '100dvh';
                canvas.style.objectFit = 'contain';
                console.log('✅ 遊戲畫布已調整為全螢幕');
            }
        } catch (error) {
            console.warn('⚠️ 調整遊戲畫布失敗:', error);
        }
    }

    /**
     * 隱藏 UI 元素
     */
    hideUIElements() {
        try {
            // 隱藏可能干擾的 UI 元素
            const elementsToHide = [
                '.game-header',
                '.navigation',
                '.footer',
                '.controls',
                '.menu-bar'
            ];

            elementsToHide.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none';
                });
            });

            console.log('✅ UI 元素已隱藏');
        } catch (error) {
            console.warn('⚠️ 隱藏 UI 元素失敗:', error);
        }
    }

    /**
     * 退出全螢幕模式
     */
    exitFullscreen() {
        try {
            console.log('🚪 退出全螢幕模式');

            // 通知父頁面退出全螢幕（處理 parent-fullscreen-game 樣式與真正全螢幕）
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'REQUEST_EXIT_FULLSCREEN', source: 'shimozurdo-game' }, '*');
                }
            } catch (e) {
                console.warn('⚠️ 無法通知父頁面退出全螢幕：', e);
            }

            // 移除所有全螢幕樣式
            document.body.classList.remove('fullscreen-game', 'mobile-fullscreen');

            // 移除全螢幕樣式表
            const fullscreenStyle = document.getElementById('fullscreen-game-style');
            if (fullscreenStyle) {
                fullscreenStyle.remove();
            }

            const mobileStyle = document.getElementById('mobile-fullscreen-style');
            if (mobileStyle) {
                mobileStyle.remove();
            }

            // 退出瀏覽器全螢幕
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            // 恢復正常樣式
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.overflow = '';

            console.log('✅ 已退出全螢幕模式');
        } catch (error) {
            console.warn('⚠️ 退出全螢幕失敗:', error);
        }
    }

    /**
     * 設置全螢幕監聽器
     */
    setupFullscreenListeners() {
        try {
            // 監聽全螢幕狀態變化
            const fullscreenEvents = [
                'fullscreenchange',
                'webkitfullscreenchange',
                'mozfullscreenchange',
                'MSFullscreenChange'
            ];

            fullscreenEvents.forEach(event => {
                document.addEventListener(event, () => {
                    const isFullscreen = !!(
                        document.fullscreenElement ||
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement ||
                        document.msFullscreenElement
                    );

                    if (!isFullscreen) {
                        // 用戶退出了全螢幕，清理樣式
                        document.body.classList.remove('fullscreen-game', 'mobile-fullscreen');
                        const fullscreenStyle = document.getElementById('fullscreen-game-style');
                        if (fullscreenStyle) {
                            fullscreenStyle.remove();
                        }
                        const mobileStyle = document.getElementById('mobile-fullscreen-style');
                        if (mobileStyle) {
                            mobileStyle.remove();
                        }


                        console.log('📱 用戶退出全螢幕，已清理樣式');
                    }
                });
            });

            // 監聽 ESC 鍵退出全螢幕
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && document.body.classList.contains('fullscreen-game')) {
                    this.exitFullscreen();
                }
            });

            console.log('✅ 全螢幕監聽器已設置');
        } catch (error) {
            console.warn('⚠️ 設置全螢幕監聽器失敗:', error);
        }
    }

    /**
     * 場景更新函數 - 處理背景滾動動畫
     */
    update() {
        if (this.sceneStopped) return;

        // 更新背景滾動 - 創建動態背景效果
        if (this.backgroundLayers && this.scrollPositions) {
            Object.keys(this.backgroundLayers).forEach(key => {
                const layer = this.backgroundLayers[key];
                if (layer && layer.active) {
                    // 根據滾動因子更新位置
                    this.scrollPositions[key] -= layer.scrollFactor * 0.5;
                    layer.x = this.scrollPositions[key];
                }
            });
        }
    }
}
