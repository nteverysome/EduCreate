/**
 * Handler Scene - 處理遊戲初始化和參數解析
 */
export default class HandlerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HandlerScene' });
    }

    init() {
        console.log('🎮 HandlerScene: 初始化中...');
        
        // 解析 URL 參數
        this.parseUrlParams();
        
        // 初始化遊戲數據
        this.initGameData();
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const options = window.FLYING_FRUIT_OPTIONS || {};

        // 從 URL 參數覆蓋默認設定
        if (urlParams.has('lives')) {
            options.lives = Math.min(5, Math.max(1, parseInt(urlParams.get('lives')) || 3));
        }
        if (urlParams.has('speed')) {
            options.speed = Math.min(10, Math.max(1, parseInt(urlParams.get('speed')) || 2));
        }
        if (urlParams.has('geptLevel')) {
            options.geptLevel = urlParams.get('geptLevel');
        }
        if (urlParams.has('wordCount')) {
            options.wordCount = parseInt(urlParams.get('wordCount')) || 10;
        }
        if (urlParams.has('visualStyle')) {
            options.visualStyle = urlParams.get('visualStyle');
        } else if (urlParams.has('style')) {
            options.visualStyle = urlParams.get('style');
        }
        if (urlParams.has('shuffle')) {
            options.shuffle = urlParams.get('shuffle') === 'true';
        }

        // 🔥 從 URL 讀取計時器選項
        if (urlParams.has('timerType')) {
            const timerType = urlParams.get('timerType');
            options.timer = options.timer || {};
            options.timer.type = timerType;

            if (timerType === 'countDown') {
                options.timer.minutes = parseInt(urlParams.get('timerMinutes')) || 5;
                options.timer.seconds = parseInt(urlParams.get('timerSeconds')) || 0;
            }
            console.log('⏱️ 計時器選項已從 URL 讀取:', options.timer);
        }

        // 🔥 從 URL 讀取其他遊戲選項
        if (urlParams.has('retryOnWrong')) {
            options.retryOnIncorrect = urlParams.get('retryOnWrong') === 'true';
        }
        if (urlParams.has('showAnswers')) {
            options.showAnswersAtEnd = urlParams.get('showAnswers') === 'true';
        }

        // 更新全局選項
        window.FLYING_FRUIT_OPTIONS = options;

        console.log('📋 遊戲選項:', options);
    }

    initGameData() {
        // 初始化遊戲數據存儲
        this.registry.set('gameOptions', window.FLYING_FRUIT_OPTIONS);
        this.registry.set('score', 0);
        this.registry.set('lives', window.FLYING_FRUIT_OPTIONS.lives);
        this.registry.set('currentQuestion', 0);
        this.registry.set('correctAnswers', 0);
        this.registry.set('wrongAnswers', 0);
        this.registry.set('gameStartTime', null);
        this.registry.set('gameEndTime', null);
        this.registry.set('results', []);
    }

    create() {
        console.log('🎮 HandlerScene: 創建完成，進入預載入場景');
        this.scene.start('PreloadScene');
    }
}

