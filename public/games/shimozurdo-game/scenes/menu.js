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

        console.log('🎮 菜單場景創建完成');
    }

    /**
     * 創建視差背景 - 與 title 場景相同的背景系統
     */
    createParallaxBackground() {
        const { width, height } = this;

        // 背景層配置 - 6層視差背景，從遠到近
        const backgroundConfig = [
            { key: 'sky', depth: -100, scrollFactor: 0.1 },      // 天空層 - 最遠，幾乎不動
            { key: 'moon', depth: -90, scrollFactor: 0.2 },      // 月亮層 - 很遠，輕微移動
            { key: 'back', depth: -80, scrollFactor: 0.3 },      // 後景層 - 遠景山脈
            { key: 'mid', depth: -70, scrollFactor: 0.5 },       // 中景層 - 中距離物體
            { key: 'front', depth: -65, scrollFactor: 0.7 },     // 前景層 - 近距離物體
            { key: 'floor', depth: -60, scrollFactor: 1.0 }      // 地面層 - 最近，完全跟隨
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

        // 嘗試進入全螢幕模式
        this.requestFullscreen();

        // 停止當前場景
        this.sceneStopped = true;
        this.scene.stop('menu');

        // 啟動遊戲場景
        this.handlerScene.launchScene('title');
    }

    /**
     * 請求全螢幕模式
     */
    requestFullscreen() {
        try {
            // 獲取遊戲畫布元素或其容器
            const canvas = this.game.canvas;
            const container = canvas.parentElement || canvas;

            console.log('🖥️ 嘗試進入全螢幕模式，目標元素:', container);

            // 嘗試不同的全螢幕 API（按優先級順序）
            if (container.requestFullscreen) {
                container.requestFullscreen().then(() => {
                    console.log('✅ 成功進入全螢幕模式 (requestFullscreen)');
                    this.onFullscreenEnter();
                }).catch(err => {
                    console.warn('⚠️ 全螢幕請求失敗:', err);
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
            }
        } catch (error) {
            console.error('❌ 全螢幕請求錯誤:', error);
        }
    }

    /**
     * 全螢幕進入後的處理
     */
    onFullscreenEnter() {
        console.log('🎮 已進入全螢幕模式，調整遊戲顯示');

        // 可以在這裡添加全螢幕模式下的特殊處理
        // 例如調整 UI 元素位置、隱藏某些控制項等
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
