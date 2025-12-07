/**
 * Preload Scene - 資源預載入
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        console.log('📦 PreloadScene: 開始載入資源...');
        
        // 創建載入進度條
        this.createLoadingBar();
        
        // 載入遊戲資源
        this.loadGameAssets();
        
        // 載入音效
        this.loadAudioAssets();
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // 標題
        this.add.text(width / 2, height / 2 - 80, '🍎 Flying Fruit', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 載入文字
        const loadingText = this.add.text(width / 2, height / 2, '載入中...', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // 進度條背景
        const progressBarBg = this.add.rectangle(width / 2, height / 2 + 50, 400, 20, 0x333333);
        progressBarBg.setStrokeStyle(2, 0x666666);
        
        // 進度條
        const progressBar = this.add.rectangle(width / 2 - 198, height / 2 + 50, 0, 16, 0x4CAF50);
        progressBar.setOrigin(0, 0.5);
        
        // 載入進度事件
        this.load.on('progress', (value) => {
            progressBar.width = 396 * value;
            loadingText.setText(`載入中... ${Math.round(value * 100)}%`);
        });
        
        this.load.on('complete', () => {
            loadingText.setText('載入完成！');
        });
    }

    loadGameAssets() {
        const basePath = '/games/flying-fruit-game/assets/images';
        
        // 載入水果圖片（使用 emoji 作為佔位符，之後可替換為實際圖片）
        // 這裡我們使用程式生成的圖形，不需要外部圖片
        
        // 載入背景（如果有的話）
        // this.load.image('background', `${basePath}/background.png`);
        
        // 載入共享資源
        this.load.setPath('/games/shared/assets');
        // 如果有共享資源可以在這裡載入
    }

    loadAudioAssets() {
        // 音效路徑
        const audioPath = '/games/shared/assets/audio';
        
        // 載入遊戲音效（如果存在）
        // this.load.audio('correct', `${audioPath}/correct.mp3`);
        // this.load.audio('wrong', `${audioPath}/wrong.mp3`);
        // this.load.audio('pop', `${audioPath}/pop.mp3`);
        // this.load.audio('gameOver', `${audioPath}/game-over.mp3`);
        // this.load.audio('bgm', `${audioPath}/bgm.mp3`);
    }

    create() {
        console.log('📦 PreloadScene: 資源載入完成');
        
        // 初始化詞彙管理器
        this.initVocabularyManager();
        
        // 進入遊戲場景
        this.time.delayedCall(500, () => {
            this.scene.start('GameScene');
        });
    }

    initVocabularyManager() {
        // 檢查 GEPTManager 是否可用
        if (typeof window.GEPTManager !== 'undefined') {
            console.log('📚 GEPTManager 已載入');
            this.registry.set('geptManagerReady', true);
        } else {
            console.warn('⚠️ GEPTManager 未載入，使用內建詞彙');
            this.registry.set('geptManagerReady', false);
        }
        
        // 檢查 BilingualManager 是否可用
        if (typeof window.BilingualManager !== 'undefined') {
            console.log('🗣️ BilingualManager 已載入');
            this.registry.set('bilingualManagerReady', true);
        } else {
            console.warn('⚠️ BilingualManager 未載入');
            this.registry.set('bilingualManagerReady', false);
        }
    }
}

