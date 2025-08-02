import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { MenuScene } from '../scenes/MenuScene';
import { LoadingScene } from '../scenes/LoadingScene';

// 遊戲常數
export const GAME_CONFIG = {
  // 畫面設定 (Wordwall 實際尺寸)
  SCREEN: {
    WIDTH: 1274,
    HEIGHT: 739,
    BACKGROUND_COLOR: '#2c3e50'
  },
  
  // 物理設定
  PHYSICS: {
    GRAVITY_Y: 0,
    DEBUG: false
  },
  
  // 玩家設定
  PLAYER: {
    START_X: 150,
    START_Y: 450,
    MAX_SPEED: 400,
    ACCELERATION: 800,
    DRAG: 600
  },
  
  // 敵人設定
  ENEMY: {
    SPAWN_RATE: 2000,
    MIN_SPEED: 100,
    MAX_SPEED: 300,
    SPAWN_X: 1250,
    MIN_Y: 75,
    MAX_Y: 825
  },
  
  // 子彈設定
  BULLET: {
    SPEED: 600,
    FIRE_RATE: 250,
    MAX_BULLETS: 20
  },
  
  // UI 設定
  UI: {
    FONT_FAMILY: 'Arial',
    FONT_SIZE: 24,
    SCORE_COLOR: '#ffffff',
    HUD_PADDING: 20
  }
} as const;

// Phaser 3 遊戲配置
export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.SCREEN.WIDTH,
  height: GAME_CONFIG.SCREEN.HEIGHT,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.SCREEN.BACKGROUND_COLOR,
  
  // 場景配置
  scene: [
    LoadingScene,
    MenuScene,
    GameScene
  ],
  
  // 物理引擎配置
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GAME_CONFIG.PHYSICS.GRAVITY_Y },
      debug: GAME_CONFIG.PHYSICS.DEBUG
    }
  },
  
  // 輸入配置
  input: {
    keyboard: true,
    mouse: true,
    touch: true
  },
  
  // 渲染配置
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  },
  
  // 音頻配置
  audio: {
    disableWebAudio: false
  },
  
  // 縮放配置
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: 1274,
    height: 739
  }
};

// 場景鍵值
export const SCENE_KEYS = {
  LOADING: 'LoadingScene',
  MENU: 'MenuScene',
  GAME: 'GameScene'
} as const;

// 資源鍵值
export const ASSET_KEYS = {
  // 飛機
  PLANES: {
    B17: 'plane-b17',
    BF109: 'plane-bf109',
    BIPLANE: 'plane-biplane',
    TBM3: 'plane-tbm3',
    HAWKER: 'plane-hawker',
    JU87: 'plane-ju87',
    BLENHEIM: 'plane-blenheim'
  },
  
  // 音效
  SOUNDS: {
    SHOOT: 'sound-shoot',
    EXPLOSION: 'sound-explosion',
    ENGINE: 'sound-engine',
    SELECT: 'sound-select'
  },
  
  // UI
  UI: {
    BUTTON: 'ui-button',
    PANEL: 'ui-panel',
    SELECTOR: 'ui-selector'
  }
} as const;

// 輸入鍵值映射
export const INPUT_KEYS = {
  // 移動控制
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  
  // 動作控制
  FIRE: 'SPACE',
  RESTART: 'R',
  
  // 飛機選擇
  PLANE_1: 'ONE',
  PLANE_2: 'TWO',
  PLANE_3: 'THREE',
  PLANE_4: 'FOUR',
  PLANE_5: 'FIVE',
  PLANE_6: 'SIX',
  PLANE_7: 'SEVEN'
} as const;

// 遊戲狀態
export enum GameState {
  LOADING = 'loading',
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over'
}

// 事件名稱
export const GAME_EVENTS = {
  PLANE_SELECTED: 'plane-selected',
  SCORE_UPDATED: 'score-updated',
  GAME_OVER: 'game-over',
  ENEMY_DESTROYED: 'enemy-destroyed',
  PLAYER_HIT: 'player-hit'
} as const;
