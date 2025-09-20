// shimozurdo 遊戲主模組 - 模組化架構的核心配置檔案
// 封裝原始 main.js 的邏輯，提供可重用的遊戲配置和初始化功能
// 設計用於動態模組載入系統，支援按需載入場景

// 記錄模組載入開始
console.log('📦 載入主模組');

// 遊戲螢幕尺寸常數定義 - 響應式配置，優化手機適配
const MAX_SIZE_WIDTH_SCREEN = 1920;  // 最大螢幕寬度，支援 Full HD 解析度
const MAX_SIZE_HEIGHT_SCREEN = 1080; // 最大螢幕高度，支援 Full HD 解析度
const MIN_SIZE_WIDTH_SCREEN = 480;   // 最小螢幕寬度，支援小螢幕
const MIN_SIZE_HEIGHT_SCREEN = 270;  // 最小螢幕高度，支援小螢幕
const SIZE_WIDTH_SCREEN = 960;       // 預設螢幕寬度，基於桌面常見尺寸
const SIZE_HEIGHT_SCREEN = 540;      // 預設螢幕高度，基於桌面常見尺寸

// 導出遊戲配置物件 - 提供給模組載入器使用的基礎配置
export const gameConfig = {
  // 渲染器類型，AUTO 自動選擇最佳渲染方式（WebGL 優先，Canvas 備用）
  type: Phaser.AUTO,
  // 縮放和響應式系統配置 - 優化手機適配
  scale: {
    // 使用 RESIZE 模式，支援動態尺寸調整
    mode: Phaser.Scale.RESIZE,
    // 指定遊戲掛載的 DOM 容器 ID
    parent: 'game',
    // 遊戲的初始寬度設定（手機優先）
    width: SIZE_WIDTH_SCREEN,
    // 遊戲的初始高度設定（手機優先）
    height: SIZE_HEIGHT_SCREEN,
    // 最小尺寸限制，支援小手機螢幕
    min: {
      width: MIN_SIZE_WIDTH_SCREEN,   // 最小寬度限制
      height: MIN_SIZE_HEIGHT_SCREEN  // 最小高度限制
    },
    // 最大尺寸限制，防止遊戲過大而影響性能
    max: {
      width: MAX_SIZE_WIDTH_SCREEN,   // 最大寬度限制
      height: MAX_SIZE_HEIGHT_SCREEN  // 最大高度限制
    },
    // 全螢幕模式的目標 DOM 元素
    fullscreenTarget: 'game',
    // 允許遊戲擴展父容器尺寸
    expandParent: true,
    // 自動居中對齊設定
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // DOM 元素支援配置
  dom: {
    // 創建 DOM 容器，支援 HTML 元素與遊戲內容混合顯示
    createContainer: true
  },
  // 場景陣列 - 初始為空，將由模組載入器動態設置場景
  scene: []
};

// 遊戲初始化函數 - 接收場景陣列並創建完整的遊戲實例
export function initGame(scenes) {
  // 記錄初始化開始和場景數量
  console.log('🎮 初始化遊戲，場景數量:', scenes.length);

  // 創建完整的遊戲配置，合併基礎配置和動態場景
  const config = {
    // 展開基礎遊戲配置的所有屬性
    ...gameConfig,
    // 設定動態載入的場景陣列
    scene: scenes,
    // 遊戲生命週期回調函數配置
    callbacks: {
      // postBoot 回調 - 在 Phaser 引擎完全啟動後執行
      postBoot: function (game) {
        // 記錄 Phaser 引擎啟動成功
        console.log('🎉 Phaser 遊戲啟動成功');

        // 設置遊戲實例的基準螢幕尺寸屬性，用於響應式計算
        game.screenBaseSize = {
          maxWidth: MAX_SIZE_WIDTH_SCREEN,    // 最大寬度參考值
          maxHeight: MAX_SIZE_HEIGHT_SCREEN,  // 最大高度參考值
          minWidth: MIN_SIZE_WIDTH_SCREEN,    // 最小寬度參考值
          minHeight: MIN_SIZE_HEIGHT_SCREEN,  // 最小高度參考值
          width: SIZE_WIDTH_SCREEN,           // 基準寬度，用於縮放計算
          height: SIZE_HEIGHT_SCREEN          // 基準高度，用於縮放計算
        };

        // 將遊戲實例設為全域變數，方便其他模組存取
        window.game = game;

        // 記錄遊戲完全載入完成
        console.log('✅ shimozurdo 遊戲完全載入完成');

        // 觸發自定義 DOM 事件，通知外部系統遊戲已準備就緒
        window.dispatchEvent(new CustomEvent('shimozurdoGameReady', {
          // 事件詳細資料，包含遊戲實例引用
          detail: { game: game }
        }));
      }
    }
  };

  // 使用完整配置創建 Phaser 遊戲實例
  const game = new Phaser.Game(config);

  // 返回遊戲實例供外部使用
  return game;
}

// 遊戲螢幕尺寸常數導出 - 提供給其他模組使用的尺寸參考值
export const SCREEN_SIZES = {
  MAX_WIDTH: MAX_SIZE_WIDTH_SCREEN,     // 最大寬度常數
  MAX_HEIGHT: MAX_SIZE_HEIGHT_SCREEN,   // 最大高度常數
  MIN_WIDTH: MIN_SIZE_WIDTH_SCREEN,     // 最小寬度常數
  MIN_HEIGHT: MIN_SIZE_HEIGHT_SCREEN,   // 最小高度常數
  DEFAULT_WIDTH: SIZE_WIDTH_SCREEN,     // 預設寬度常數
  DEFAULT_HEIGHT: SIZE_HEIGHT_SCREEN    // 預設高度常數
};

// 記錄主模組載入完成
console.log('✅ 主模組載入完成');
