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
     */
    updateResize(scene) {
        // 監聽場景的 resize 事件，當視窗大小改變時調用 resize 方法
        scene.scale.on('resize', this.resize, scene)

        // 獲取當前遊戲的實際顯示寬度
        const scaleWidth = scene.scale.gameSize.width
        // 獲取當前遊戲的實際顯示高度
        const scaleHeight = scene.scale.gameSize.height

        // 🔍 [v70.0] 記錄 updateResize 開始時的尺寸信息
        console.log('🔍 [v70.0] ========== updateResize 開始 ==========', {
            scaleWidth: scaleWidth,
            scaleHeight: scaleHeight,
            baseWidth: scene.game.screenBaseSize.width,
            baseHeight: scene.game.screenBaseSize.height,
            sceneScaleWidth: scene.scale.width,
            sceneScaleHeight: scene.scale.height,
            timestamp: new Date().toISOString()
        });

        // 創建父容器尺寸結構，用於響應式計算的基準
        scene.parent = new Phaser.Structs.Size(scaleWidth, scaleHeight)
        // 創建調整器尺寸結構，使用 FIT 模式確保內容適應容器
        scene.sizer = new Phaser.Structs.Size(
            scene.game.screenBaseSize.width,   // 使用基準寬度
            scene.game.screenBaseSize.height,  // 使用基準高度
            Phaser.Structs.Size.FIT,           // FIT 模式：保持比例並適應容器
            scene.parent
        )

        // 設定父容器的實際尺寸
        scene.parent.setSize(scaleWidth, scaleHeight)
        // 設定調整器的實際尺寸
        scene.sizer.setSize(scaleWidth, scaleHeight)

        // 🔍 [v70.0] 記錄 FIT 模式計算後的尺寸
        console.log('🔍 [v70.0] ========== FIT 模式計算結果 ==========', {
            sizerWidth: scene.sizer.width,
            sizerHeight: scene.sizer.height,
            parentWidth: scene.parent.width,
            parentHeight: scene.parent.height,
            baseWidth: scene.game.screenBaseSize.width,
            baseHeight: scene.game.screenBaseSize.height,
            scaleWidth: scaleWidth,
            scaleHeight: scaleHeight,
            widthRatio: (scaleWidth / scene.game.screenBaseSize.width).toFixed(2),
            heightRatio: (scaleHeight / scene.game.screenBaseSize.height).toFixed(2),
            fitMode: 'FIT (保持比例)',
            timestamp: new Date().toISOString()
        });

        // 立即更新攝影機設定以適應新的尺寸
        this.updateCamera(scene)

        // 🔍 [v67.0] 詳細調適訊息 - 追蹤 updateResize 調用
        console.log('✅ [v67.0] Handler: updateResize 完成', {
            scaleWidth,
            scaleHeight,
            baseWidth: scene.game.screenBaseSize.width,
            baseHeight: scene.game.screenBaseSize.height,
            timestamp: new Date().toISOString(),
            caller: 'updateResize'
        });
    }

    /**
     * 視窗大小調整處理方法 - 當視窗大小改變時自動調用
     * @param {Object} gameSize - 包含新的遊戲尺寸信息的物件
     * 注意：這個方法中的 'this' 指向當前正在運行的場景實例
     * 🔥 [v78.0] 統一 zoom = 1，設備自適應 centerOn 位置
     */
    resize(gameSize) {
        // 檢查場景是否已停止，避免在場景停止後繼續處理調整
        if (!this.sceneStopped) {
            // 從 gameSize 物件中提取新的寬度
            const width = gameSize.width
            // 從 gameSize 物件中提取新的高度
            const height = gameSize.height

            // 更新父容器的尺寸以匹配新的視窗大小
            this.parent.setSize(width, height)
            // 更新調整器的尺寸以匹配新的視窗大小
            this.sizer.setSize(width, height)

            // 🔥 [v78.0] 統一使用 zoom = 1，但 centerOn 位置不同
            // 攝影機更新邏輯
            const camera = this.cameras.main

            if (camera) {
                // 計算水平和垂直方向的縮放比例（用於調試）
                const scaleX = this.sizer.width / this.game.screenBaseSize.width
                const scaleY = this.sizer.height / this.game.screenBaseSize.height

                // 判斷是否為手機設備（寬度 < 768）
                const isMobile = this.sizer.width < 768

                let zoom = 1  // 🔥 [v78.0] 統一使用 zoom = 1
                let strategy
                let centerX, centerY

                if (isMobile) {
                    // 🔥 [v78.0] 手機端：zoom = 1 + centerOn(baseSize/2) - v73 方法
                    strategy = 'Mobile - zoom=1, centerOn(baseSize/2)'
                    centerX = this.game.screenBaseSize.width / 2
                    centerY = this.game.screenBaseSize.height / 2
                } else {
                    // 🔥 [v78.0] 桌面端：zoom = 1 + centerOn(sizer/2) - v77 方法
                    strategy = 'Desktop - zoom=1, centerOn(sizer/2)'
                    centerX = this.sizer.width / 2
                    centerY = this.sizer.height / 2
                }

                camera.setZoom(zoom)
                camera.centerOn(centerX, centerY)

                console.log('🔥 [v78.0] resize - Camera zoom 設置:', {
                    width,
                    height,
                    scaleX: scaleX.toFixed(3),
                    scaleY: scaleY.toFixed(3),
                    zoom: zoom.toFixed(3),
                    isMobile,
                    strategy,
                    centerX: centerX.toFixed(1),
                    centerY: centerY.toFixed(1)
                });
            }
        }
    }

    /**
     * 攝影機更新方法 - 根據場景尺寸調整攝影機的縮放和位置
     * @param {Phaser.Scene} scene - 需要更新攝影機的場景實例
     * 🔥 [v78.0] 統一 zoom = 1，設備自適應 centerOn 位置
     * - 桌面端（寬度 >= 768）：zoom = 1, centerOn(sizer/2) - 置中顯示
     * - 手機端（寬度 < 768）：zoom = 1, centerOn(baseSize/2) - v73 方法
     */
    updateCamera(scene) {
        // 獲取指定場景的主攝影機實例
        const camera = scene.cameras.main

        // 🛡️ 防禦性檢查：確保 camera 存在
        if (!camera) {
            console.warn('⚠️ updateCamera: camera 不存在，跳過縮放設置');
            return;
        }

        // 🔥 [v78.0] 統一使用 zoom = 1，但 centerOn 位置不同
        // 計算水平和垂直方向的縮放比例（用於調試）
        const scaleX = scene.sizer.width / this.game.screenBaseSize.width
        const scaleY = scene.sizer.height / this.game.screenBaseSize.height

        // 判斷是否為手機設備（寬度 < 768）
        const isMobile = scene.sizer.width < 768

        let zoom = 1  // 🔥 [v78.0] 統一使用 zoom = 1
        let strategy
        let centerX, centerY

        if (isMobile) {
            // 🔥 [v78.0] 手機端：zoom = 1 + centerOn(baseSize/2) - v73 方法
            strategy = 'Mobile - zoom=1, centerOn(baseSize/2)'
            centerX = this.game.screenBaseSize.width / 2
            centerY = this.game.screenBaseSize.height / 2
        } else {
            // 🔥 [v78.0] 桌面端：zoom = 1 + centerOn(sizer/2) - v77 方法
            strategy = 'Desktop - zoom=1, centerOn(sizer/2)'
            centerX = scene.sizer.width / 2
            centerY = scene.sizer.height / 2
        }

        camera.setZoom(zoom)
        camera.centerOn(centerX, centerY)

        console.log('🔥 [v78.0] updateCamera - Camera zoom 設置:', {
            scaleX: scaleX.toFixed(3),
            scaleY: scaleY.toFixed(3),
            zoom: zoom.toFixed(3),
            isMobile,
            strategy,
            centerX: centerX.toFixed(1),
            centerY: centerY.toFixed(1),
            sizerSize: `${scene.sizer.width}×${scene.sizer.height}`,
            baseSize: `${this.game.screenBaseSize.width}×${this.game.screenBaseSize.height}`
        });
    }

}

