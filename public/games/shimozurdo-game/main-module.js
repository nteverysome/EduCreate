// 主模組 - 封裝原始 main.js 的邏輯
// 這個文件提供遊戲配置和初始化邏輯

console.log('📦 載入主模組');

// 遊戲尺寸配置
const MAX_SIZE_WIDTH_SCREEN = 1920;
const MAX_SIZE_HEIGHT_SCREEN = 1080;
const MIN_SIZE_WIDTH_SCREEN = 480;
const MIN_SIZE_HEIGHT_SCREEN = 270;
const SIZE_WIDTH_SCREEN = 960;
const SIZE_HEIGHT_SCREEN = 540;

// 遊戲配置
export const gameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'game',
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
    fullscreenTarget: 'game',
    expandParent: true,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true
  },
  // 場景將由模組載入器動態設置
  scene: []
};

// 初始化遊戲函數
export function initGame(scenes) {
  console.log('🎮 初始化遊戲，場景數量:', scenes.length);
  
  // 更新配置中的場景
  const config = {
    ...gameConfig,
    scene: scenes,
    callbacks: {
      postBoot: function (game) {
        console.log('🎉 Phaser 遊戲啟動成功');
        
        // 設置遊戲屬性
        game.screenBaseSize = {
          maxWidth: MAX_SIZE_WIDTH_SCREEN,
          maxHeight: MAX_SIZE_HEIGHT_SCREEN,
          minWidth: MIN_SIZE_WIDTH_SCREEN,
          minHeight: MIN_SIZE_HEIGHT_SCREEN,
          width: SIZE_WIDTH_SCREEN,
          height: SIZE_HEIGHT_SCREEN
        };
        
        // 全域遊戲實例
        window.game = game;
        
        console.log('✅ shimozurdo 遊戲完全載入完成');
        
        // 觸發自定義事件通知遊戲已準備就緒
        window.dispatchEvent(new CustomEvent('shimozurdoGameReady', {
          detail: { game: game }
        }));
      }
    }
  };
  
  // 創建遊戲實例
  const game = new Phaser.Game(config);
  
  return game;
}

// 遊戲尺寸常數導出
export const SCREEN_SIZES = {
  MAX_WIDTH: MAX_SIZE_WIDTH_SCREEN,
  MAX_HEIGHT: MAX_SIZE_HEIGHT_SCREEN,
  MIN_WIDTH: MIN_SIZE_WIDTH_SCREEN,
  MIN_HEIGHT: MIN_SIZE_HEIGHT_SCREEN,
  DEFAULT_WIDTH: SIZE_WIDTH_SCREEN,
  DEFAULT_HEIGHT: SIZE_HEIGHT_SCREEN
};

console.log('✅ 主模組載入完成');
