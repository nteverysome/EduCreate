/**
 * Speaking Cards - Phaser 3 遊戲配置
 * 響應式語音卡片遊戲
 */

// 螢幕尺寸常數
const MAX_SIZE_WIDTH_SCREEN = 1920;
const MAX_SIZE_HEIGHT_SCREEN = 1080;
const MIN_SIZE_WIDTH_SCREEN = 320;
const MIN_SIZE_HEIGHT_SCREEN = 480;
const SIZE_WIDTH_SCREEN = 960;
const SIZE_HEIGHT_SCREEN = 640;

// Phaser 遊戲配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#f0f9ff',
    scene: [PreloadScene, SpeakingCardsGame],

    // 禁用自動暫停
    disableContextMenu: true,
    pauseOnBlur: false,

    scale: {
        mode: Phaser.Scale.FIT,
        width: SIZE_WIDTH_SCREEN,
        height: SIZE_HEIGHT_SCREEN,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: true,
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,
            height: MIN_SIZE_HEIGHT_SCREEN
        },
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,
            height: MAX_SIZE_HEIGHT_SCREEN
        },
        resolution: window.devicePixelRatio || 1
    },

    dom: {
        createContainer: true
    },

    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true
    }
};

// 遊戲常量
const GAME_CONSTANTS = {
    CARD_WIDTH: 300,
    CARD_HEIGHT: 420,

    COLORS: {
        primary: 0x3b82f6,
        secondary: 0x6b7280,
        success: 0x10b981,
        warning: 0xf59e0b,
        danger: 0xef4444,
        white: 0xffffff,
        background: 0xf0f9ff
    },

    ANIMATION: {
        cardFlip: 300,
        cardMove: 400,
        buttonPress: 100
    },

    SPACING: {
        cardGap: 32,
        buttonGap: 16,
        padding: 16
    },

    DEPTH: {
        background: 0,
        cardBack: 10,
        cardFront: 20,
        ui: 100
    }
};

// 響應式配置
const RESPONSIVE_CONFIG = {
    mobile: {
        maxWidth: 767,
        cardScale: 0.7,
        fontSize: 14,
        buttonSize: 36
    },
    tablet: {
        maxWidth: 1024,
        cardScale: 0.85,
        fontSize: 16,
        buttonSize: 40
    },
    desktop: {
        maxWidth: Infinity,
        cardScale: 1.0,
        fontSize: 18,
        buttonSize: 44
    }
};

// 啟動遊戲
const game = new Phaser.Game(config);

// 暴露遊戲實例
window.speakingCardsGame = game;

// 設定遊戲基準尺寸
game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,
    minWidth: MIN_SIZE_WIDTH_SCREEN,
    minHeight: MIN_SIZE_HEIGHT_SCREEN,
    width: SIZE_WIDTH_SCREEN,
    height: SIZE_HEIGHT_SCREEN
};

console.log('✅ Speaking Cards 遊戲配置完成', {
    screenBaseSize: game.screenBaseSize
});

// 監聽 scale 事件
game.scale.on('resize', (gameSize) => {
    console.log('📐 Speaking Cards 尺寸變化:', gameSize.width, 'x', gameSize.height);
});

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { config, GAME_CONSTANTS, RESPONSIVE_CONFIG };
}

