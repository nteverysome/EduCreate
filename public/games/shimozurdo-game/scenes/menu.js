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

        // 只請求全螢幕模式，場景切換由 onFullscreenEnter 處理
        this.requestFullscreen();

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
            const isIOS = this.detectIOSDevice();

            console.log('🖥️ 設備檢測:', { isMobile, isIOS });

            if (isMobile) {
                // 手機設備：優先使用網址列隱藏和偽全螢幕
                console.log('📱 手機設備：使用手機專用全螢幕策略');
                this.mobileFullscreenStrategy();
            } else {
                // 桌面設備：使用標準全螢幕 API
                console.log('🖥️ 桌面設備：使用標準全螢幕 API');
                this.desktopFullscreenStrategy();
            }
        } catch (error) {
            console.error('❌ 全螢幕請求錯誤:', error);
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
     * 手機專用全螢幕策略
     */
    mobileFullscreenStrategy() {
        console.log('📱 執行手機全螢幕策略');

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

        if (isInIframe) {
            // 在 iframe 中，嘗試對父頁面進行全螢幕
            console.log('📱 檢測到 iframe 環境，使用父頁面全螢幕策略');
            this.iframeFullscreenStrategy();
        } else {
            // 不在 iframe 中，使用標準全螢幕
            this.standardFullscreenStrategy();
        }
    }

    /**
     * 標準全螢幕策略（非 iframe 環境）
     */
    standardFullscreenStrategy() {
        const canvas = this.game.canvas;
        const container = canvas.parentElement || canvas;

        console.log('🖥️ 執行標準全螢幕策略');

        // 嘗試不同的全螢幕 API（按優先級順序）
        if (container.requestFullscreen) {
            container.requestFullscreen().then(() => {
                console.log('✅ 成功進入全螢幕模式 (requestFullscreen)');
                this.onFullscreenEnter();
            }).catch(err => {
                console.warn('⚠️ 全螢幕請求失敗:', err);
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

        this.fullscreenResponseListener = (event) => {
            if (event.data && event.data.source === 'parent-page') {
                if (event.data.type === 'FULLSCREEN_SUCCESS') {
                    console.log('✅ 收到父頁面全螢幕成功回應:', event.data.message);
                    // 清除超時
                    if (this.fullscreenTimeout) {
                        clearTimeout(this.fullscreenTimeout);
                        this.fullscreenTimeout = null;
                    }
                    // 應用全螢幕樣式並啟動遊戲
                    this.onFullscreenEnter();
                } else if (event.data.type === 'FULLSCREEN_FAILED') {
                    console.warn('⚠️ 收到父頁面全螢幕失敗回應:', event.data.message);
                    // 清除超時
                    if (this.fullscreenTimeout) {
                        clearTimeout(this.fullscreenTimeout);
                        this.fullscreenTimeout = null;
                    }
                    // 直接啟動遊戲，不應用全螢幕樣式
                    this.startGameScene();
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
                }).catch(err => {
                    console.log('📱 手機全螢幕失敗，使用偽全螢幕:', err.message);
                });
            } else if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
                console.log('✅ 手機全螢幕成功 (webkit)');
            } else {
                console.log('📱 不支援全螢幕 API，使用偽全螢幕');
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
     * 設置手機專用全螢幕樣式
     */
    setMobileFullscreenStyles() {
        try {
            console.log('📱 設置手機專用全螢幕樣式');

            // 創建手機專用樣式
            let mobileStyle = document.getElementById('mobile-fullscreen-style');
            if (!mobileStyle) {
                mobileStyle = document.createElement('style');
                mobileStyle.id = 'mobile-fullscreen-style';
                document.head.appendChild(mobileStyle);
            }

            mobileStyle.textContent = `
                /* 手機專用全螢幕樣式（iframe 內部安全版） */
                body.mobile-fullscreen {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: black !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }

                /* 只調整 #game 與 canvas，不隱藏任何元素 */
                body.mobile-fullscreen #game {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: black !important;
                    border: none !important;
                }

                body.mobile-fullscreen canvas {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                    background: transparent !important;
                }

                /* iOS Safari 特殊處理 */
                @supports (-webkit-touch-callout: none) {
                    body.mobile-fullscreen {
                        height: 100vh !important;
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
     * 隱藏手機瀏覽器網址列
     */
    hideAddressBar() {
        try {
            console.log('📱 嘗試隱藏手機瀏覽器網址列');

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
                    document.body.style.height = '100vh';
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

        // 添加全螢幕樣式
        this.addFullscreenStyles();

        // 確保遊戲畫布填滿整個螢幕
        this.adjustGameCanvas();

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
                /* 桌面全螢幕遊戲樣式（iframe 內部安全版） */
                body.fullscreen-game {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: black !important;
                }

                /* 只調整遊戲容器與畫布，不隱藏任意元素，避免黑屏 */
                body.fullscreen-game #game {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: black !important;
                }

                /* 確保遊戲 canvas 正確顯示 */
                body.fullscreen-game canvas {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                    background: transparent !important;
                }
            `;

            // 添加 body class
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
                canvas.style.height = '100vh';
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
