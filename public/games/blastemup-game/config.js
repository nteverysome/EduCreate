// Blastemup 太空射擊遊戲 - Phaser 配置
// 響應式設計配置

const MAX_SIZE_WIDTH_SCREEN = 1920;
const MAX_SIZE_HEIGHT_SCREEN = 1080;
const MIN_SIZE_WIDTH_SCREEN = 320;
const MIN_SIZE_HEIGHT_SCREEN = 270;
const SIZE_WIDTH_SCREEN = 868;
const SIZE_HEIGHT_SCREEN = 800;

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#cccccc',
  scene: [Bootloader, Game],
  
  // 禁用自動暫停
  disableContextMenu: true,
  pauseOnBlur: false,

  scale: {
    // 使用 FIT 模式 - 業界標準
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

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },

  dom: {
    createContainer: true
  }
};

// 啟動遊戲
const game = new Phaser.Game(config);

// 暴露遊戲實例到 window 對象
window.blastemupGame = game;

