// Match-up 遊戲場景處理器 - 中央場景管理系統
// 負責場景切換、響應式佈局調整和攝影機控制
// 參考 Shimozurdo 遊戲的 Handler 架構

/**
 * Handler 類別 - 繼承自 Phaser.Scene，作為遊戲的主要場景管理器
 * 處理場景啟動、響應式調整和攝影機縮放等核心功能
 */
class Handler extends Phaser.Scene {

    // 類別屬性定義
    sceneRunning = null  // 追蹤當前正在運行的場景名稱

    /**
     * 建構函數 - 初始化 Handler 場景
     * 調用父類別建構函數並設定場景鍵值為 'handler'
     */
    constructor() {
        // 調用 Phaser.Scene 的建構函數，註冊場景鍵值
        super('handler')
    }

    /**
     * create 方法 - Phaser 場景生命週期方法，在場景創建時自動調用
     * 設定遊戲的初始狀態和啟動必要的場景
     */
    create() {
        console.log('🎮 Handler: create 方法開始');
        // 設定主攝影機的背景顏色為白色（Match-up 遊戲主題）
        this.cameras.main.setBackgroundColor('#FFFFFF')
        console.log('🎮 Handler: 背景顏色設定為白色');

        // 🔥 [v119.0] 移除 ResizeManager - FIT 模式會自動處理所有響應式邏輯
        // ResizeManager 在 Scale.FIT 模式下不再需要
        console.log('🎮 Handler: 使用 FIT 模式，無需 ResizeManager');

        // 🔥 v102.0: 監聽頁面可見性變化，防止場景重啟
        this.setupVisibilityHandling();

        // 🔥 修復：使用正確的場景鍵值 'PreloadScene'
        console.log('🎮 Handler: 準備啟動 PreloadScene');
        this.launchScene('PreloadScene')
        console.log('🎮 Handler: PreloadScene 已啟動');
    }

    /**
     * 🔥 v102.0: 設置頁面可見性處理，防止切換標籤時重啟場景
     */
    setupVisibilityHandling() {
        // 監聽頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📴 Handler: 頁面隱藏（切換標籤/最小化）');
                // 不做任何操作，讓場景保持運行
            } else {
                console.log('📱 Handler: 頁面顯示（切回標籤/恢復）');
                // 不重啟場景，只確保場景仍在運行
                const gameScene = this.scene.get('GameScene');
                if (gameScene && !gameScene.scene.isActive()) {
                    console.log('⚠️ Handler: GameScene 未運行，嘗試喚醒');
                    this.scene.wake('GameScene');
                }
            }
        });

        console.log('✅ Handler: 頁面可見性處理已設置');
    }

    /**
     * 場景啟動方法 - 啟動指定的場景並保存場景引用
     * 🔥 v102.1: 參考 Shimozurdo 的場景啟動策略
     * @param {string} scene - 要啟動的場景鍵值
     * @param {Object} data - 傳遞給場景的初始化數據（可選）
     */
    launchScene(scene, data) {
        // 🔥 v102.1: 對於主要遊戲場景，使用 start 確保可見和活躍
        if (scene === 'GameScene') {
            console.log(`🚀 Handler: 啟動主要場景 ${scene}`);
            this.scene.start(scene, data);
        } else {
            // 對於背景場景（如 PreloadScene），使用 launch 並行運行
            console.log(`🔧 Handler: 啟動背景場景 ${scene}`);
            this.scene.launch(scene, data);
        }

        // 獲取並保存場景實例的引用，方便後續操作
        this.gameScene = this.scene.get(scene)
        // 保存當前運行的場景名稱
        this.sceneRunning = scene

        console.log(`✅ Handler: 場景 ${scene} 已啟動`, {
            isActive: this.gameScene?.scene.isActive(),
            isVisible: this.gameScene?.scene.isVisible()
        });
    }

    /**
     * 響應式更新初始化方法 - 為指定場景設定響應式調整功能
     * @param {Phaser.Scene} scene - 需要設定響應式功能的場景實例
     * 🔥 [v107.0] 改進：在 Scale.NONE 模式下同時調整 Canvas 和 Renderer 尺寸
     */
    updateResize(scene) {
        console.log('🔥 [v119.0] updateResize 方法開始執行（FIT 模式）');

        // 🔥 [v119.0] 在 FIT 模式下，Phaser 自動處理所有 resize 邏輯
        // 我們只需要監聽 resize 事件並調用 GameScene 的 updateLayout
        scene.scale.on('resize', (gameSize) => {
            console.log('🔥 [v119.0] Resize 事件觸發:', {
                width: gameSize.width,
                height: gameSize.height
            });

            // 獲取 GameScene 並調用 updateLayout
            const gameScene = scene.scene.get('GameScene');
            if (gameScene && gameScene.updateLayout) {
                console.log('🔥 [v119.0] 調用 GameScene.updateLayout 重新佈局遊戲元素');
                gameScene.updateLayout();
            } else {
                console.warn('⚠️ [v119.0] GameScene 不存在或沒有 updateLayout 方法！');
            }
        });

        console.log('✅ [v119.0] Handler: updateResize 初始化完成（FIT 模式）', {
            scaleWidth: scene.scale.gameSize.width,
            scaleHeight: scene.scale.gameSize.height,
            baseWidth: scene.game.screenBaseSize.width,
            baseHeight: scene.game.screenBaseSize.height,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 🔥 [v105.0] 舊的 resize 方法已被 ResizeManager 取代
     * ResizeManager 現在完全控制所有元素的 resize 邏輯
     */

    /**
     * 🔥 [v105.0] 舊的 updateCamera 方法已被 ResizeManager 取代
     * ResizeManager 現在完全控制所有元素的更新邏輯
     */

}

