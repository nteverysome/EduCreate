// Preload 場景 - 載入遊戲資源
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.sceneStopped = false;  // 場景停止狀態標記
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
        console.log('🎮 PreloadScene: create 方法開始');

        // 🔥 獲取 Handler 場景引用
        this.handlerScene = this.scene.get('handler');

        // 🔥 調用 Handler 的 updateResize 方法設定響應式
        if (this.handlerScene && this.handlerScene.updateResize) {
            console.log('🎮 PreloadScene: 調用 Handler.updateResize');
            this.handlerScene.updateResize(this);
        } else {
            console.warn('⚠️ PreloadScene: handlerScene 未初始化或 updateResize 方法不存在');
        }

        // 載入完成，切換到遊戲場景
        console.log('🎮 PreloadScene: 準備啟動 GameScene');
        this.scene.start('GameScene');
        console.log('🎮 PreloadScene: GameScene 已啟動');
    }
}

