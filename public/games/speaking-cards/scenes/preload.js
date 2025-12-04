/**
 * Speaking Cards - Preload Scene
 * 預載入資源場景
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        console.log('📦 Speaking Cards: 開始預載入資源');

        // 創建載入進度條
        this.createLoadingBar();

        // 🎴 載入卡片背面圖片
        this.load.image('card-back', '/games/speaking-cards/assets/card_back.png');

        // 🎴 載入卡片正面背景
        this.load.image('card_front', '/games/speaking-cards/assets/card_front.png');

        // 🎨 載入遊戲背景 - 精靈王國戰鬥背景
        this.load.image('game_background_3', '/games/speaking-cards/assets/game_background_3.png');

        // 載入按鈕圖標
        this.load.image('shuffle-icon', '/games/speaking-cards/assets/shuffle-icon.svg');
        this.load.image('undo-icon', '/games/speaking-cards/assets/undo-icon.svg');
        this.load.image('sound-icon', '/games/speaking-cards/assets/sound-icon.svg');

        // 載入音效
        this.load.audio('card-flip', '/games/speaking-cards/assets/card-flip.mp3');
        this.load.audio('card-deal', '/games/speaking-cards/assets/card-deal.mp3');
        this.load.audio('success', '/games/speaking-cards/assets/success.mp3');

        // 監聽載入進度
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x3b82f6, 1);
            this.progressBar.fillRect(
                this.cameras.main.centerX - 150,
                this.cameras.main.centerY,
                300 * value,
                20
            );
        });

        // 載入完成
        this.load.on('complete', () => {
            console.log('✅ Speaking Cards: 資源載入完成');
        });

        // 處理載入錯誤
        this.load.on('loaderror', (file) => {
            console.warn('⚠️ 載入失敗:', file.key);
        });
    }

    createLoadingBar() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // 背景框
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0xe5e7eb, 1);
        this.progressBox.fillRect(centerX - 152, centerY - 2, 304, 24);

        // 進度條
        this.progressBar = this.add.graphics();

        // 載入文字
        this.loadingText = this.add.text(centerX, centerY - 40, '載入中...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#374151'
        }).setOrigin(0.5);
    }

    create() {
        // 清除載入 UI
        this.progressBar.destroy();
        this.progressBox.destroy();
        this.loadingText.destroy();

        // 進入遊戲場景
        this.scene.start('SpeakingCardsGame');
    }
}

// 確保全域可用
if (typeof window !== 'undefined') {
    window.PreloadScene = PreloadScene;
}

