// Phaser 3 遊戲配置 - 響應式設計
// 螢幕尺寸常數定義
const MAX_SIZE_WIDTH_SCREEN = 1920  // 最大螢幕寬度
const MAX_SIZE_HEIGHT_SCREEN = 1080 // 最大螢幕高度
const MIN_SIZE_WIDTH_SCREEN = 480   // 最小螢幕寬度
const MIN_SIZE_HEIGHT_SCREEN = 270  // 最小螢幕高度
const SIZE_WIDTH_SCREEN = 960       // 預設螢幕寬度
const SIZE_HEIGHT_SCREEN = 540      // 預設螢幕高度

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#FFFFFF', // 白色背景（Wordwall Classic 主題）
    scene: [Handler, PreloadScene, GameScene],  // 🔥 添加 Handler 場景作為第一個場景
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

