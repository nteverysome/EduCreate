// Hub 場景類別 - shimozurdo 遊戲的主要 UI 控制介面
// 提供遊戲控制按鈕、全螢幕功能和音效控制

// 導入全螢幕功能模組
import { fullScreen } from '../utils/screen.js'
// 導入按鈕點擊處理模組
import { pointerUp } from '../utils/buttons.js'

/**
 * Hub 類別 - 繼承自 Phaser.Scene，提供遊戲的主要用戶介面
 * 包含退出按鈕、音效控制、全螢幕按鈕等功能
 */
export default class Hub extends Phaser.Scene {

    // 類別屬性定義
    handlerScene = null  // 儲存 Handler 場景的引用，用於場景間通信

    /**
     * 建構函數 - 初始化 Hub 場景
     * 調用父類別建構函數並設定場景鍵值為 'hub'
     */
    constructor() {
        // 調用 Phaser.Scene 的建構函數，註冊場景鍵值
        super('hub')
    }

    /**
     * preload 方法 - Phaser 場景生命週期方法，用於載入資源和初始化設定
     * 在場景創建前自動調用，負責載入 UI 相關的圖片資源
     */
    preload() {
        // 載入 UI 圖片資源
        // 載入退出按鈕的圖片資源
        this.load.image('quit', 'assets/images/quit.png')
        // 載入全螢幕按鈕的精靈圖，包含兩個狀態（48x48 像素每幀）
        this.load.spritesheet('fullscreen', 'assets/images/fullscreen.png', { frameWidth: 48, frameHeight: 48 })
        // 載入音效按鈕的精靈圖，包含開啟/關閉兩個狀態
        this.load.spritesheet("sound", "assets/images/sound.png", { frameWidth: 48, frameHeight: 48 })

        // 初始化場景基本屬性和設定
        // 獲取遊戲畫布的當前寬度
        this.canvasWidth = this.sys.game.canvas.width
        // 獲取遊戲畫布的當前高度
        this.canvasHeight = this.sys.game.canvas.height
        // 獲取 Handler 場景的引用，用於後續的場景控制
        this.handlerScene = this.scene.get('handler')

        // 螢幕方向鎖定設定
        // 根據遊戲設定鎖定螢幕方向（橫向或直向）
        this.scale.lockOrientation(this.game.orientation)

        // 函數綁定設定
        // 將 pointerUp 函數綁定到當前場景的上下文
        this.pointerUp = pointerUp.bind(this)
        // 如果遊戲不是嵌入模式，則初始化全螢幕功能
        if (!this.game.embedded)
            fullScreen.call(this)
        // 創建版權文字，顯示在畫面底部中央
        this.creditsTxt = this.add.text(this.canvasWidth / 2, this.canvasHeight - 22, 'Shimozurdo Games 2021', { fontFamily: 'Arial', fontSize: '18px', color: '#000', }).setOrigin(.5).setDepth(1)
    }

    /**
     * create 方法 - Phaser 場景生命週期方法，在場景創建時自動調用
     * 負責創建和設定所有 UI 元素，包括按鈕和事件監聽器
     */
    create() {
        // UI 元素基礎定位設定
        // 設定 UI 元素距離邊緣的基礎距離（32 像素）
        let posItemHubBase = 32

        // 創建退出按鈕
        // 在左上角創建退出按鈕，設定原點為中心點，深度為 1，並啟用互動功能
        this.quitBtn = this.add.image(posItemHubBase, posItemHubBase, "quit").setOrigin(.5).setDepth(1).setInteractive({ cursor: "pointer" })
        // 初始狀態設為不可見，只在特定場景中顯示
        this.quitBtn.visible = false

        // 為退出按鈕綁定點擊事件
        // 當按鈕被點擊時，調用 clickBackScene 方法處理場景返回邏輯
        this.pointerUp(() => {
            this.clickBackScene(this.handlerScene.sceneRunning)
        }, this.quitBtn)

        // 音效按鈕位置計算
        // 根據遊戲是否為嵌入模式決定垂直位置倍數
        let multiplePosY = this.game.embedded ? 1 : 3
        // 在右上角創建音效控制按鈕
        this.soundBtn = this.add.image(this.canvasWidth - posItemHubBase, posItemHubBase * multiplePosY, "sound").setOrigin(.5).setDepth(1).setInteractive({ cursor: "pointer" })
        // 初始狀態設為不可見
        this.soundBtn.visible = false

        // 根據調試模式設定音效按鈕的初始狀態
        if (this.game.debugMode) {
            // 調試模式下設定為靜音狀態（幀 1）
            this.soundBtn.setFrame(1)
        } else {
            // 正常模式下設定為有聲狀態（幀 0）
            // TODO: 這裡應該播放背景音樂 - this.music.play()
            this.soundBtn.setFrame(0)
        }

        // 為音效按鈕添加點擊事件監聽器
        this.soundBtn.on("pointerup", () => {
            // 檢查當前音效按鈕的狀態
            if (this.soundBtn.frame.name === 0) {
                // 如果當前是有聲狀態，切換到靜音狀態
                this.soundBtn.setFrame(1)
                // TODO: 這裡應該停止音效
            }
            else {
                // 如果當前是靜音狀態，切換到有聲狀態
                this.soundBtn.setFrame(0)
                // TODO: 這裡應該恢復音效
            }
        })

        // 全螢幕按鈕設定（嵌入與非嵌入皆顯示；在嵌入/行動裝置時作為父頁面退出控制）
        multiplePosY = this.game.embedded ? 1 : 1
        this.fullscreenBtn = this.add.image(this.canvasWidth - posItemHubBase, posItemHubBase * multiplePosY, "fullscreen", 0)
            .setOrigin(.5)
            .setDepth(1)
            .setInteractive({ cursor: "pointer" })
        // 移除透明命中區，使用原始按鈕點擊區域


        // 為全螢幕按鈕添加點擊事件監聽器
        this.fullscreenBtn.on("pointerup", () => {
            // 檢測設備類型
            const isMobile = this.detectMobileDevice();

            if (isMobile) {
                // 手機設備：使用複雜的全螢幕處理
                this.handleMobileFullscreen();
            } else {
                // 桌面設備：使用簡單的原生 Phaser3 實現
                if (this.scale.isFullscreen) {
                    this.fullscreenBtn.setFrame(0)
                    this.scale.stopFullscreen()
                }
                else {
                    this.fullscreenBtn.setFrame(1)
                    this.scale.startFullscreen()
                }
            }
        })
        // 監聽視窗大小調整事件，當視窗大小改變時調用 resize 方法
        this.scale.on("resize", this.resize, this)

        // 手機全螢幕狀態追蹤
        this._mobileFullscreenActive = false

        // 為手機設備添加雙擊退出全螢幕功能
        if (this.detectMobileDevice()) {
            this.setupMobileExitGestures();
        }


    }


    /**
     * update 方法 - Phaser 場景生命週期方法，每幀自動調用
     * 根據當前運行的場景動態調整 UI 元素的可見性
     */
    update() {
        // 檢查當前運行的場景是否為標題場景
        if (this.handlerScene.sceneRunning === 'title') {
            // 在標題場景中顯示音效按鈕
            this.soundBtn.visible = true
            // 在標題場景中隱藏退出按鈕
            this.quitBtn.visible = false
            // 在標題場景中隱藏版權文字
            this.creditsTxt.visible = false
        }
    }

    /**
     * 場景返回處理方法 - 處理從當前場景返回到上一個場景的邏輯
     * @param {string} sceneTxt - 當前場景的名稱
     */
    clickBackScene(sceneTxt) {
        // 獲取指定場景的實例引用
        const scene = this.scene.get(sceneTxt)
        // 聲明要跳轉的目標場景變數
        let gotoScene
        // 聲明目標場景的背景顏色變數
        let bgColorScene

        // 根據當前場景名稱決定返回邏輯
        switch (sceneTxt) {
            case "title":
                // 如果當前是標題場景，隱藏版權文字並直接返回
                this.creditsTxt.visible = false
                return
        }

        // 標記場景為已停止狀態，防止繼續處理更新
        scene.sceneStopped = true
        // 停止當前場景的運行
        scene.scene.stop(sceneTxt)
        // 設定 Handler 場景的背景顏色
        this.handlerScene.cameras.main.setBackgroundColor(bgColorScene)
        // 啟動目標場景
        this.handlerScene.launchScene(gotoScene)
    }

    /**
     * 響應式調整方法 - 當視窗大小改變時調整 UI 元素位置
     * 確保按鈕和文字在不同螢幕尺寸下都能正確顯示
     */
    resize() {
        // 如果不是嵌入模式，調整全螢幕按鈕的水平位置
        if (!this.game.embedded)
            this.fullscreenBtn.x = this.scale.gameSize.width - 30
        // 調整音效按鈕的水平位置，保持距離右邊緣 30 像素
        this.soundBtn.x = this.scale.gameSize.width - 30
        // 調整版權文字的水平位置，保持在螢幕中央
        this.creditsTxt.x = this.scale.gameSize.width / 2
        // 調整版權文字的垂直位置，保持距離底部 30 像素
        this.creditsTxt.y = this.scale.gameSize.height - 30
        // 透明命中區已移除，無需位置同步
    }

    /**
     * 檢測手機設備
     */
    detectMobileDevice() {
        // 檢查 User Agent 中的手機標識
        const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 檢查是否為觸控設備
        const isTouchDevice = ('ontouchstart' in window) && (navigator.maxTouchPoints > 0);

        // 檢查螢幕尺寸（手機通常小於 768px）
        const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

        return mobileUserAgent || (isTouchDevice && isSmallScreen);
    }

    /**
     * 處理手機全螢幕
     */
    handleMobileFullscreen() {
        if (this._mobileFullscreenActive) {
            // 退出手機全螢幕
            this.exitMobileFullscreen();
        } else {
            // 進入手機全螢幕
            this.enterMobileFullscreen();
        }
    }

    /**
     * 進入手機全螢幕
     */
    enterMobileFullscreen() {
        console.log('📱 進入手機全螢幕模式');
        this.fullscreenBtn.setFrame(1);
        this._mobileFullscreenActive = true;

        // 調用 menu 場景的手機全螢幕策略
        const menuScene = this.scene.get('menu');
        if (menuScene && menuScene.requestFullscreen) {
            menuScene.requestFullscreen();
        } else {
            // 後備方案：嘗試 Phaser 全螢幕
            console.log('⚠️ 無法找到 menu 場景，使用 Phaser 全螢幕後備方案');
            this.scale.startFullscreen();
        }
    }

    /**
     * 退出手機全螢幕
     */
    exitMobileFullscreen() {
        console.log('📱 退出手機全螢幕模式');
        this.fullscreenBtn.setFrame(0);
        this._mobileFullscreenActive = false;

        // 調用 menu 場景的退出全螢幕處理
        const menuScene = this.scene.get('menu');
        if (menuScene && menuScene.onFullscreenExit) {
            menuScene.onFullscreenExit();
        }

        // 嘗試退出各種全螢幕模式
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        }
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
        }

        // 移除手機全螢幕樣式
        document.body.classList.remove('mobile-fullscreen', 'real-mobile-fullscreen', 'fullscreen-game');
    }

    /**
     * 設置手機退出全螢幕手勢
     */
    setupMobileExitGestures() {
        // 雙擊退出全螢幕
        let lastTap = 0;
        this.input.on('pointerdown', () => {
            const currentTime = Date.now();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                // 雙擊檢測到
                if (this._mobileFullscreenActive) {
                    console.log('📱 雙擊檢測到，退出手機全螢幕');
                    this.exitMobileFullscreen();
                }
            }
            lastTap = currentTime;
        });

        // 長按退出全螢幕（3秒）
        let longPressTimer = null;
        this.input.on('pointerdown', () => {
            if (this._mobileFullscreenActive) {
                longPressTimer = setTimeout(() => {
                    console.log('📱 長按檢測到，退出手機全螢幕');
                    this.exitMobileFullscreen();
                }, 3000);
            }
        });

        this.input.on('pointerup', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });

        // 添加視覺提示
        this.createMobileExitHint();
    }

    /**
     * 創建手機退出全螢幕提示
     */
    createMobileExitHint() {
        // 創建提示文字（初始隱藏）
        this.mobileExitHint = this.add.text(
            this.scale.gameSize.width / 2,
            50,
            '雙擊或長按 3 秒退出全螢幕',
            {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 },
                alpha: 0
            }
        ).setOrigin(0.5).setDepth(1000);

        // 監聽全螢幕狀態變化，顯示/隱藏提示
        this.scale.on('enterfullscreen', () => {
            if (this.detectMobileDevice() && this.mobileExitHint) {
                // 顯示提示 3 秒後自動隱藏
                this.tweens.add({
                    targets: this.mobileExitHint,
                    alpha: 0.8,
                    duration: 500,
                    onComplete: () => {
                        setTimeout(() => {
                            if (this.mobileExitHint) {
                                this.tweens.add({
                                    targets: this.mobileExitHint,
                                    alpha: 0,
                                    duration: 500
                                });
                            }
                        }, 3000);
                    }
                });
            }
        });

        this.scale.on('leavefullscreen', () => {
            if (this.mobileExitHint) {
                this.mobileExitHint.setAlpha(0);
            }
        });
    }
}