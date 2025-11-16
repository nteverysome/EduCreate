/**
 * 🎮 EduCreate 遊戲標準配置模板
 *
 * 🏆 基於 shimozurdo-game 的成功架構
 *
 * 📖 使用說明：
 * 1. 複製整個 _template 資料夾到新遊戲目錄
 * 2. 修改 GAME_NAME 為你的遊戲名稱
 * 3. 根據需要調整設計尺寸（預設 960x540）
 * 4. 導入你的遊戲場景
 *
 * ✅ 這個配置已經包含：
 * - shimozurdo-game 的響應式系統（RESIZE + Camera Zoom）
 * - 自動管理器初始化（GEPT、SRS、Bilingual）
 * - Mobile 完美支援
 * - 固定設計尺寸 + 自動縮放
 */

// ===== 遊戲配置 =====
const GAME_NAME = 'my-game';  // 🔧 修改為你的遊戲名稱

// ===== 設計尺寸配置（shimozurdo-game 標準）=====
// 使用固定設計尺寸，Camera Zoom 會自動縮放
const DESIGN_WIDTH = 960;    // 設計寬度（shimozurdo-game 標準）
const DESIGN_HEIGHT = 540;   // 設計高度（shimozurdo-game 標準）

// 最小/最大尺寸（用於 RESIZE 模式的限制）
const MIN_WIDTH = 480;
const MIN_HEIGHT = 270;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

// ===== 導入場景 =====
// 🔧 修改為你的遊戲場景
import Handler from './scenes/handler.js';
import Preload from './scenes/preload.js';
import GameScene from './scenes/game.js';

// ===== Phaser 遊戲配置 =====
const config = {
  // 渲染器類型
  type: Phaser.AUTO,
  
  // 🔥 響應式配置（統一標準）
  scale: {
    mode: Phaser.Scale.RESIZE,  // ✅ 使用 RESIZE 模式
    parent: 'game-container',
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    min: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT
    },
    max: {
      width: MAX_WIDTH,
      height: MAX_HEIGHT
    },
    fullscreenTarget: 'game-container',
    expandParent: true,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  
  // DOM 支援
  dom: {
    createContainer: true
  },
  
  // 場景載入順序
  scene: [
    Handler,   // 場景處理器
    Preload,   // 預載場景
    GameScene  // 遊戲場景
  ],
  
  // 物理引擎（根據需要啟用）
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  
  // 背景顏色
  backgroundColor: '#FFFFFF',
  
  // 禁用右鍵選單
  disableContextMenu: true,
  
  // 失焦時不暫停
  pauseOnBlur: false
};

// ===== 創建遊戲實例 =====
const game = new Phaser.Game(config);

// ===== 設置遊戲基準尺寸 =====
// 這些值會被 BaseScene 使用
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

// ===== 導出遊戲實例 =====
window.game = game;

console.log(`🎮 ${GAME_NAME} 遊戲已啟動`);
console.log(`📐 設計尺寸: ${DESIGN_WIDTH}x${DESIGN_HEIGHT}`);
console.log(`✅ 響應式系統: RESIZE + Camera Zoom`);

