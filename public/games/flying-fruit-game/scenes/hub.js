/**
 * Hub Scene - 遊戲結果顯示和重新開始
 */
export default class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        console.log('🏆 HubScene: 顯示遊戲結果');
        
        const { width, height } = this.cameras.main;
        const results = this.registry.get('finalResults') || {};
        
        // 背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // 標題
        const titleText = results.endReason === 'complete' ? '🎉 恭喜完成！' : 
                         results.endReason === 'noLives' ? '💔 遊戲結束' : '⏰ 時間到！';
        
        this.add.text(width / 2, 60, titleText, {
            fontSize: '42px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 結果面板
        this.createResultsPanel(results);
        
        // 按鈕
        this.createButtons();
        
        // 發送結果到父頁面
        this.sendResultsToParent(results);
    }

    createResultsPanel(results) {
        const { width, height } = this.cameras.main;
        
        // 面板背景
        const panelBg = this.add.rectangle(width / 2, height / 2 - 20, 400, 280, 0x2d2d44);
        panelBg.setStrokeStyle(3, 0x4a4a6a);
        
        // 分數
        this.add.text(width / 2, 140, `🏆 分數: ${results.score || 0}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 正確率
        const total = (results.correctAnswers || 0) + (results.wrongAnswers || 0);
        const accuracy = total > 0 ? Math.round((results.correctAnswers / total) * 100) : 0;
        
        this.add.text(width / 2, 190, `✅ 正確: ${results.correctAnswers || 0} / ${total}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#4CAF50'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 230, `📊 正確率: ${accuracy}%`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // 時間
        const minutes = Math.floor((results.timeSpent || 0) / 60);
        const seconds = (results.timeSpent || 0) % 60;
        
        this.add.text(width / 2, 270, `⏱️ 時間: ${minutes}:${String(seconds).padStart(2, '0')}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#87ceeb'
        }).setOrigin(0.5);
        
        // 星星評級
        const stars = accuracy >= 90 ? '⭐⭐⭐' : accuracy >= 70 ? '⭐⭐' : accuracy >= 50 ? '⭐' : '';
        if (stars) {
            this.add.text(width / 2, 320, stars, {
                fontSize: '40px'
            }).setOrigin(0.5);
        }
    }

    createButtons() {
        const { width, height } = this.cameras.main;

        // 重新開始按鈕
        const restartBtn = this.createButton(width / 2 - 180, height - 80, '🔄 再玩一次', 0x4CAF50, () => {
            this.restartGame();
        });

        // 創建單字按鈕
        const createBtn = this.createButton(width / 2, height - 80, '✏️ 創建單字', 0xFF9800, () => {
            this.createVocabulary();
        });

        // 返回按鈕
        const backBtn = this.createButton(width / 2 + 180, height - 80, '🏠 返回', 0x2196F3, () => {
            this.goBack();
        });
    }

    createButton(x, y, text, color, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 180, 50, color);
        bg.setStrokeStyle(2, 0xffffff);
        bg.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        
        bg.on('pointerdown', callback);
        bg.on('pointerover', () => bg.setFillStyle(Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: (color >> 16) & 0xff, g: (color >> 8) & 0xff, b: color & 0xff },
            { r: 255, g: 255, b: 255 }, 10, 2
        ).color));
        bg.on('pointerout', () => bg.setFillStyle(color));
        
        return container;
    }

    restartGame() {
        // 重置遊戲數據
        this.registry.set('score', 0);
        this.registry.set('correctAnswers', 0);
        this.registry.set('wrongAnswers', 0);
        this.registry.set('results', []);
        
        // 重新開始遊戲
        this.scene.start('GameScene');
    }

    createVocabulary() {
        // 導向本地 EduCreate 詞彙管理頁面
        // 如果是在 iframe 中，發送消息給父頁面
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'NAVIGATE_TO_VOCABULARY_MANAGER',
                game: 'flying-fruit'
            }, '*');
        } else {
            // 直接導航到詞彙管理頁面
            window.location.href = '/vocabulary-manager';
        }
    }

    goBack() {
        // 發送返回消息給父頁面
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'GAME_EXIT', game: 'flying-fruit' }, '*');
        }
        // 或者導航到遊戲列表
        // window.location.href = '/games';
    }

    sendResultsToParent(results) {
        // 使用 EduCreate 的結果收集器
        if (typeof window.collectGameResults === 'function') {
            window.collectGameResults({
                game: 'flying-fruit',
                ...results
            });
        }
        
        // 發送到父頁面
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'GAME_RESULTS',
                game: 'flying-fruit',
                results: results
            }, '*');
        }
    }
}

