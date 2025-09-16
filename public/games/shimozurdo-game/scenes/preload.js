export default class Preload extends Phaser.Scene {

    width = null
    height = null
    handlerScene = null
    sceneStopped = false

    constructor() {
        super({ key: 'preload' })
    }

    preload() {
        // Images
        this.load.image('logo', 'assets/images/logo.png')
        this.load.image('guide', 'assets/images/540x960-guide.png')
        this.load.image('button', 'assets/images/button.png')

        // 6層視差背景資源載入
        // 注意：這些資源需要放置在 assets/images/parallax/ 目錄下
        this.load.image('bg_layer_1', 'assets/images/parallax/layer_1.png') // 最遠背景 - 星空
        this.load.image('bg_layer_2', 'assets/images/parallax/layer_2.png') // 月亮主體層
        this.load.image('bg_layer_3', 'assets/images/parallax/layer_3.png') // 遠景雲層
        this.load.image('bg_layer_4', 'assets/images/parallax/layer_4.png') // 中景雲層
        this.load.image('bg_layer_5', 'assets/images/parallax/layer_5.png') // 近景雲層
        this.load.image('bg_layer_6', 'assets/images/parallax/layer_6.png') // 最前景 - 雲霧
        //---------------------------------------------------------------------->
        this.canvasWidth = this.sys.game.canvas.width
        this.canvasHeight = this.sys.game.canvas.height

        this.width = this.game.screenBaseSize.width
        this.height = this.game.screenBaseSize.height

        this.handlerScene = this.scene.get('handler')
        this.handlerScene.sceneRunning = 'preload'
        this.sceneStopped = false

        let progressBox = this.add.graphics()
        progressBox.fillStyle(0x000, 0.8)
        progressBox.fillRect((this.canvasWidth / 2) - (210 / 2), (this.canvasHeight / 2) - 5, 210, 30)
        let progressBar = this.add.graphics()

        this.load.on('progress', (value) => {
            progressBar.clear()
            progressBar.fillStyle(0xFF5758, 1)
            progressBar.fillRect((this.canvasWidth / 2) - (200 / 2), (this.canvasHeight / 2), 200 * value, 20)
        })

        this.load.on('complete', () => {
            progressBar.destroy()
            progressBox.destroy()
            this.time.addEvent({
                delay: this.game.debugMode ? 3000 : 4000,
                callback: () => {
                    this.sceneStopped = true
                    this.scene.stop('preload')
                    this.handlerScene.cameras.main.setBackgroundColor("#1a1a2e")
                    this.handlerScene.launchScene('title')
                },
                loop: false
            })
        })
    }

    create() {
        const { width, height } = this
        // CONFIG SCENE         
        this.handlerScene.updateResize(this)
        if (this.game.debugMode)
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)
        // CONFIG SCENE 

        // GAME OBJECTS  
        this.add.image(width / 2, height / 2, 'logo').setOrigin(.5)
        // GAME OBJECTS  
    }
}
