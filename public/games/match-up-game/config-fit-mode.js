// Phaser 3 遊戲配置 - FIT 模式（測試版本）
// 這個配置使用 Phaser.Scale.FIT 模式，自動處理響應式設計

const MAX_SIZE_WIDTH_SCREEN = 1920
const MAX_SIZE_HEIGHT_SCREEN = 1080
const MIN_SIZE_WIDTH_SCREEN = 320
const MIN_SIZE_HEIGHT_SCREEN = 270
const SIZE_WIDTH_SCREEN = 960
const SIZE_HEIGHT_SCREEN = 540

const configFitMode = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#FFFFFF',
    scene: [Handler, PreloadScene, GameScene],

    disableContextMenu: true,
    pauseOnBlur: false,

    scale: {
        // 🔥 [FIT 模式] 自動縮放，保持寬高比
        mode: Phaser.Scale.FIT,
        
        // 基準遊戲尺寸
        width: SIZE_WIDTH_SCREEN,
        height: SIZE_HEIGHT_SCREEN,
        
        // 自動居中
        autoCenter: Phaser.Scale.CENTER_BOTH,
        
        // 擴展父容器
        expandParent: true,
        
        // 高 DPI 支持
        resolution: window.devicePixelRatio || 1,
        
        // 最小/最大尺寸
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,
            height: MIN_SIZE_HEIGHT_SCREEN
        },
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,
            height: MAX_SIZE_HEIGHT_SCREEN
        }
    },
    
    dom: {
        createContainer: true
    }
};

// 🔥 FIT 模式的優勢
console.log('🔥 [FIT 模式配置]');
console.log('✅ 自動計算縮放比例（保持寬高比）');
console.log('✅ 自動調整 Canvas 尺寸');
console.log('✅ 自動調整 Renderer 尺寸');
console.log('✅ 自動調整 Camera 縮放');
console.log('✅ 自動添加邊框（如需要）');
console.log('✅ 官方維護，經過驗證');

// 啟動遊戲
const game = new Phaser.Game(configFitMode);

// 暴露遊戲實例
window.matchUpGame = game;

// 設定基準螢幕尺寸
game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,
    minWidth: MIN_SIZE_WIDTH_SCREEN,
    minHeight: MIN_SIZE_HEIGHT_SCREEN,
    width: SIZE_WIDTH_SCREEN,
    height: SIZE_HEIGHT_SCREEN
}

console.log('✅ Match-up 遊戲配置完成（FIT 模式）', {
    screenBaseSize: game.screenBaseSize
});

