/**
 * 🎮 EduCreate 遊戲標準配置模板 v2.0
 *
 * 🏆 基於 Match-up 遊戲的成功架構（Phaser.Scale.FIT 模式）
 *
 * 📖 使用說明：
 * 1. 複製整個 _template 資料夾到新遊戲目錄
 * 2. 修改 GAME_NAME 為你的遊戲名稱
 * 3. 根據需要調整設計尺寸（預設 960x540）
 * 4. 導入你的遊戲場景
 *
 * ✅ 這個配置已經包含：
 * - Match-up 的響應式系統（FIT 模式）- 業界標準
 * - 自動管理器初始化（GEPT、SRS、Bilingual）
 * - Mobile 完美支援（支援 iPhone SE 375px 到 4K 屏幕）
 * - 固定設計尺寸 + Phaser 自動縮放
 * - 高 DPI 設備支援
 *
 * 📚 參考遊戲：
 * - Match-up 配對遊戲 (/games/match-up-game/)
 * - Shimozurdo 雲朵遊戲 (/games/shimozurdo-game/)
 */

// ===== 遊戲配置 =====
const GAME_NAME = 'my-game';  // 🔧 修改為你的遊戲名稱

// ===== 設計尺寸配置（Match-up 標準）=====
// 使用固定設計尺寸，Phaser FIT 模式會自動縮放
const DESIGN_WIDTH = 960;    // 設計寬度（Match-up 標準）
const DESIGN_HEIGHT = 540;   // 設計高度（Match-up 標準）

// 最小/最大尺寸（支持各種設備）
const MIN_WIDTH = 320;       // 🔥 支持 iPhone SE (375px) 和更小設備
const MIN_HEIGHT = 270;      // 最小高度
const MAX_WIDTH = 1920;      // 最大寬度（1080p）
const MAX_HEIGHT = 1080;     // 最大高度（1080p）

// ===== 導入場景 =====
// 🔧 修改為你的遊戲場景
import Handler from './scenes/handler.js';
import Preload from './scenes/preload.js';
import GameScene from './scenes/game.js';

// ===== Phaser 遊戲配置 =====
const config = {
  // 渲染器類型
  type: Phaser.AUTO,

  // 父容器
  parent: 'game-container',

  // 背景顏色（白色 - Wordwall Classic 主題）
  backgroundColor: '#FFFFFF',

  // 場景載入順序
  scene: [
    Handler,   // 場景處理器（第一個場景）
    Preload,   // 預載場景
    GameScene  // 遊戲場景
  ],

  // 🔥 響應式配置（Match-up FIT 模式標準）
  scale: {
    mode: Phaser.Scale.FIT,           // ✅ 使用 FIT 模式 - 業界標準
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,  // 自動居中
    expandParent: true,               // 擴展父容器
    min: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT
    },
    max: {
      width: MAX_WIDTH,
      height: MAX_HEIGHT
    },
    // 🔥 高 DPI 設備支援
    resolution: window.devicePixelRatio || 1
  },

  // DOM 支援（用於 HTML 元素）
  dom: {
    createContainer: true
  },

  // 物理引擎（根據需要啟用）
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  // 禁用右鍵選單
  disableContextMenu: true,

  // 🔥 失焦時不暫停（防止切換標籤時重啟場景）
  pauseOnBlur: false
};

// ===== 創建遊戲實例 =====
const game = new Phaser.Game(config);

// ===== 暴露遊戲實例到 window 對象 =====
window.game = game;

// ===== 設置遊戲基準尺寸 =====
// 這些值會被 Handler 和 GameScene 使用
game.screenBaseSize = {
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
  maxWidth: MAX_WIDTH,
  maxHeight: MAX_HEIGHT,
  minWidth: MIN_WIDTH,
  minHeight: MIN_HEIGHT
};

// ===== 遊戲選項 =====
game.orientation = "landscape";  // 或 "portrait"
game.debugMode = false;

// ===== 監聽 Scale 事件（調試用）=====
game.scale.on('resize', (gameSize) => {
  console.log('📐 [Template] Scale resize:', gameSize.width, 'x', gameSize.height);
});

console.log(`🎮 ${GAME_NAME} 遊戲已啟動`);
console.log(`📐 設計尺寸: ${DESIGN_WIDTH}x${DESIGN_HEIGHT}`);
console.log(`✅ 響應式系統: Phaser.Scale.FIT（Match-up 標準）`);
console.log(`📱 設備像素比: ${window.devicePixelRatio}`);

