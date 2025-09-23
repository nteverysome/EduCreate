import constant from '/games/math-attack-game/constant.js'
import { createAnimation } from '/games/math-attack-game/utils/common.js'

export default class Preload extends Phaser.Scene {

    // Vars
    handlerScene = null
    sceneStopped = false

    constructor() {
        super({ key: 'preload' })
    }

    preload() {
        // Images
        this.load.image('logo', '/games/math-attack-game/assets/images/logo.png')
        this.load.image('game-logo', '/games/math-attack-game/assets/images/game-logo.png')
        this.load.image('guide', '/games/math-attack-game/assets/images/960x540-guide.png')
        this.load.image('button', '/games/math-attack-game/assets/images/button.png')
        this.load.image('button1', '/games/math-attack-game/assets/images/button1.png')
        this.load.image('button-square', '/games/math-attack-game/assets/images/button-square.png')
        this.load.image('counterclockwide-arrow', '/games/math-attack-game/assets/images/counterclockwide-arrow.png')
        this.load.image('numbers', '/games/math-attack-game/assets/images/numbers.png')
        this.load.image('bar-countdown', '/games/math-attack-game/assets/images/bar-countdown.png')
        this.load.image('bar-countdown-frame', '/games/math-attack-game/assets/images/bar-countdown-frame.png')
        this.load.image('reload', '/games/math-attack-game/assets/images/reload.png')
        this.load.image('background', '/games/math-attack-game/assets/images/background.png')
        this.load.image('background2', '/games/math-attack-game/assets/images/background2.png')
        this.load.image('background3', '/games/math-attack-game/assets/images/background3.png')
        this.load.image('lock', '/games/math-attack-game/assets/images/lock.png')
        // Sprite sheets
        this.load.spritesheet('rocket', '/games/math-attack-game/assets/images/rocket.png', { frameWidth: 124, frameHeight: 200 });
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
                    const hubScene = this.scene.get('hub')
                    hubScene.prepareFadeOutBg()
                    this.sceneStopped = true
                    this.scene.stop('preload')
                    this.handlerScene.cameras.main.setBackgroundColor(constant.color.TITLE)
                    this.handlerScene.launchScene('title')
                },
                loop: false
            })
        })

        //binding actions to this scene
        this.createAnimation = createAnimation.bind(this);
    }

    create() {
        const { width, height } = this
        // CONFIG SCENE         
        this.handlerScene.updateResize(this)
        if (this.game.debugMode)
            this.add.image(0, 0, 'guide').setOrigin(0).setDepth(1)
        // CONFIG SCENE 

        // GAME OBJECTS  
        this.add.image(width / 2, (height / 2), 'logo').setOrigin(.5)
        // GAME OBJECTS          

        // ANIMATIONS       
        this.createAnimation(constant.ANIM.FLY + '-rocket', 'rocket', 0, 2, 10, -1);
        // ANIMATIONS  
    }
}
