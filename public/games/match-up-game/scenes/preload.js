// Preload 場景 - 載入遊戲資源
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // 顯示載入文字
        const loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Loading...',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        );
        loadingText.setOrigin(0.5);

        // 目前不需要載入任何資源
        // 所有內容都使用 Phaser 的 Graphics 和 Text 對象繪製
    }

    create() {
        // 載入完成，切換到遊戲場景
        this.scene.start('GameScene');
    }
}

