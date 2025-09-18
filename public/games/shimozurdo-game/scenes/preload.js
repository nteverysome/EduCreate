export default class Preload extends Phaser.Scene {

    width = null            // 遊戲畫面寬度
    height = null           // 遊戲畫面高度
    handlerScene = null     // 場景管理器引用
    sceneStopped = false    // 場景停止狀態標記

    constructor() {
        super({ key: 'preload' })  // 註冊場景名稱為 'preload'
    }

    preload() {
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
                    this.handlerScene.launchScene('title') // 啟動標題場景（遊戲主場景）
                },
                loop: false                               // 只執行一次，不循環
            })
        })
    }

    create() {
        const { width, height } = this               // 解構賦值獲取寬高
        // CONFIG SCENE - 場景配置區塊
        this.handlerScene.updateResize(this)         // 更新響應式配置，適應不同螢幕尺寸
        if (this.game.debugMode)                     // 如果是調試模式
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)  // 顯示輔助參考線
        // CONFIG SCENE

        // GAME OBJECTS - 遊戲物件區塊
        this.add.image(width / 2, height / 2, 'logo').setOrigin(.5)  // 在螢幕中央顯示遊戲標誌
        // GAME OBJECTS
    }
}
