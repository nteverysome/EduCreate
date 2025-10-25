// 場景處理器類別 - shimozurdo 遊戲的核心場景管理系統
// 負責場景切換、響應式佈局調整和攝影機控制

/**
 * Handler 類別 - 繼承自 Phaser.Scene，作為遊戲的主要場景管理器
 * 處理場景啟動、響應式調整和攝影機縮放等核心功能
 */
export default class Handler extends Phaser.Scene {

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
        // 設定主攝影機的背景顏色為深藍色，避免白色背景影響視差效果的視覺呈現
        this.cameras.main.setBackgroundColor('#1a1a2e')
        // 啟動預載場景，負責載入遊戲資源
        this.launchScene('preload')
        // 啟動 Hub 場景，提供遊戲的主要 UI 控制介面
        this.launchScene('hub')
    }

    /**
     * 場景啟動方法 - 啟動指定的場景並保存場景引用
     * @param {string} scene - 要啟動的場景鍵值
     * @param {Object} data - 傳遞給場景的初始化數據（可選）
     */
    launchScene(scene, data) {
        // 對於主要遊戲場景，使用 start 確保可見和活躍
        if (scene === 'title' || scene === 'menu') {
            console.log(`🚀 啟動主要場景: ${scene}`);
            this.scene.start(scene, data);
        } else {
            // 對於背景場景（如 preload, hub），使用 launch 並行運行
            console.log(`🔧 啟動背景場景: ${scene}`);
            this.scene.launch(scene, data);
        }
        // 獲取並保存場景實例的引用，方便後續操作
        this.gameScene = this.scene.get(scene)
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

        // 創建父容器尺寸結構，用於響應式計算的基準
        scene.parent = new Phaser.Structs.Size(scaleWidth, scaleHeight)
        // 創建調整器尺寸結構，使用 FIT 模式確保內容適應容器
        scene.sizer = new Phaser.Structs.Size(scene.width, scene.height, Phaser.Structs.Size.FIT, scene.parent)

        // 設定父容器的實際尺寸
        scene.parent.setSize(scaleWidth, scaleHeight)
        // 設定調整器的實際尺寸
        scene.sizer.setSize(scaleWidth, scaleHeight)

        // 立即更新攝影機設定以適應新的尺寸
        this.updateCamera(scene)
    }

    /**
     * 視窗大小調整處理方法 - 當視窗大小改變時自動調用
     * @param {Object} gameSize - 包含新的遊戲尺寸信息的物件
     * 注意：這個方法中的 'this' 指向當前正在運行的場景實例
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

            // 攝影機更新邏輯 - TODO: 改進以下代碼，因為與 updateCamera 方法重複
            // 獲取當前場景的主攝影機實例
            const camera = this.cameras.main

            // 🛡️ 防禦性檢查：確保 camera 存在
            if (!camera) {
                console.warn('⚠️ resize: camera 不存在，跳過縮放設置');
                return;
            }

            // 計算水平方向的縮放比例（調整器寬度 / 基準螢幕寬度）
            const scaleX = this.sizer.width / this.game.screenBaseSize.width
            // 計算垂直方向的縮放比例（調整器高度 / 基準螢幕高度）
            const scaleY = this.sizer.height / this.game.screenBaseSize.height

            // 設定攝影機縮放，使用較大的縮放比例確保內容完全填滿螢幕
            camera.setZoom(Math.max(scaleX, scaleY))
            // 將攝影機中心點設定在基準螢幕的中央位置
            camera.centerOn(this.game.screenBaseSize.width / 2, this.game.screenBaseSize.height / 2)
        }
    }

    /**
     * 攝影機更新方法 - 根據場景尺寸調整攝影機的縮放和位置
     * @param {Phaser.Scene} scene - 需要更新攝影機的場景實例
     */
    updateCamera(scene) {
        // 獲取指定場景的主攝影機實例
        const camera = scene.cameras.main
        // 計算水平方向的縮放比例（場景調整器寬度 / 遊戲基準寬度）
        const scaleX = scene.sizer.width / this.game.screenBaseSize.width
        // 計算垂直方向的縮放比例（場景調整器高度 / 遊戲基準高度）
        const scaleY = scene.sizer.height / this.game.screenBaseSize.height

        // 設定攝影機縮放比例，選擇較大的比例以確保內容不會被裁切
        camera.setZoom(Math.max(scaleX, scaleY))
        // 將攝影機焦點設定在遊戲基準螢幕的中心點
        camera.centerOn(this.game.screenBaseSize.width / 2, this.game.screenBaseSize.height / 2)
    }

}