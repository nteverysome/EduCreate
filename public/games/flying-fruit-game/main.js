/**
 * Flying Fruit 遊戲 - 主入口
 * 基於 Wordwall Flying Fruit 遊戲機制
 * 
 * 遊戲機制：
 * - 問題顯示在頂部
 * - 水果從右側飛入，帶有答案
 * - 玩家點擊正確答案的水果
 * - 生命值系統（1-5）
 * - 速度系統（1-5）
 * - 計時器選項
 */

import HandlerScene from './scenes/handler.js';
import PreloadScene from './scenes/preload.js';
import GameScene from './scenes/game.js';
import HubScene from './scenes/hub.js';

// 設計尺寸
const DESIGN_WIDTH = 960;
const DESIGN_HEIGHT = 540;

// 遊戲配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
    },
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    input: {
        activePointers: 3,
        touch: {
            capture: true
        }
    },
    scene: [HandlerScene, PreloadScene, GameScene, HubScene],
    audio: {
        disableWebAudio: false
    }
};

// 遊戲選項（可從外部配置）
window.FLYING_FRUIT_OPTIONS = {
    // 遊戲設定
    lives: 3,           // 生命值 1-5
    speed: 2,           // 速度 1-5
    timer: {
        type: 'countUp', // 'none' | 'countUp' | 'countDown'
        minutes: 5,
        seconds: 0
    },
    // 遊戲行為
    shuffle: true,              // 隨機順序
    retryOnIncorrect: true,     // 錯誤時重試
    showAnswersAtEnd: true,     // 結束時顯示答案
    // 視覺風格
    visualStyle: 'jungle',      // 'clouds' | 'jungle' | 'space' | 'underwater' | 'celebration'
    // 詞彙設定
    geptLevel: 'all',           // GEPT 等級
    wordCount: 10,              // 詞彙數量
    // 音效
    soundEnabled: true,
    musicEnabled: true
};

// 創建遊戲實例
window.game = new Phaser.Game(config);

// 遊戲準備就緒事件
window.game.events.once('ready', () => {
    console.log('🎮 Flying Fruit 遊戲已初始化');
    window.dispatchEvent(new CustomEvent('gameReady'));
});

// 導出配置供其他模組使用
export { DESIGN_WIDTH, DESIGN_HEIGHT };

