// Phaser 3 遊戲配置 - 響應式設計
// 螢幕尺寸常數定義
const MAX_SIZE_WIDTH_SCREEN = 1920  // 最大螢幕寬度
const MAX_SIZE_HEIGHT_SCREEN = 1080 // 最大螢幕高度
const MIN_SIZE_WIDTH_SCREEN = 320   // 🔥 v21.0：改為 320px 以支持 iPhone 14 (390px) 和 iPhone SE (375px)
const MIN_SIZE_HEIGHT_SCREEN = 270  // 最小螢幕高度
const SIZE_WIDTH_SCREEN = 960       // 預設螢幕寬度
const SIZE_HEIGHT_SCREEN = 540      // 預設螢幕高度

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#FFFFFF', // 白色背景（Wordwall Classic 主題）
    scene: [Handler, PreloadScene, GameScene],  // 🔥 添加 Handler 場景作為第一個場景

    // 🔥 v102.0: 禁用自動暫停，防止切換標籤時重啟場景
    disableContextMenu: true,
    pauseOnBlur: false,  // ← 關鍵修復：禁用失焦時自動暫停

    scale: {
        mode: Phaser.Scale.RESIZE,  // 動態調整尺寸
        width: SIZE_WIDTH_SCREEN,
        height: SIZE_HEIGHT_SCREEN,
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,
            height: MIN_SIZE_HEIGHT_SCREEN
        },
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,
            height: MAX_SIZE_HEIGHT_SCREEN
        },
        fullscreenTarget: 'game-container',
        expandParent: true,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    }
};

// 啟動遊戲
const game = new Phaser.Game(config);

// 🔥 暴露遊戲實例到 window 對象，方便測試和調試
window.matchUpGame = game;

// 🔍 [DEBUG-v62.0] 監聽 Phaser scale 事件
console.log('🔍 [DEBUG-v62.0] Phaser Scale 事件監聽:');
game.scale.on('resize', (gameSize) => {
    console.log('🔍 [DEBUG-v62.0] Scale resize 事件:', {
        gameSize: gameSize,
        width: gameSize.width,
        height: gameSize.height,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight,
        containerWidth: document.getElementById('game-container')?.offsetWidth,
        containerHeight: document.getElementById('game-container')?.offsetHeight
    });
});

game.scale.on('orientationchange', (orientation) => {
    console.log('🔍 [DEBUG-v62.0] Scale orientationchange 事件:', orientation);
});

game.scale.on('fullscreenchange', (isFullscreen) => {
    console.log('🔍 [DEBUG-v62.0] Scale fullscreenchange 事件:', isFullscreen);
});

// 🔥 設定遊戲的基準螢幕尺寸，用於響應式縮放計算
game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,    // 最大寬度參考值
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,  // 最大高度參考值
    minWidth: MIN_SIZE_WIDTH_SCREEN,    // 最小寬度參考值
    minHeight: MIN_SIZE_HEIGHT_SCREEN,  // 最小高度參考值
    width: SIZE_WIDTH_SCREEN,           // 基準寬度，用於縮放比例計算
    height: SIZE_HEIGHT_SCREEN          // 基準高度，用於縮放比例計算
}

console.log('✅ Match-up 遊戲配置完成', {
    screenBaseSize: game.screenBaseSize
});

